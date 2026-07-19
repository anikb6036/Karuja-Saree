import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db, getAnalyticsSummary } from './server/db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Initialize Gemini if key is present
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini API initialized successfully.');
  } else {
    console.warn('GEMINI_API_KEY environment variable is not defined. Insights will fall back to simulated reports.');
  }

  // --- API ROUTES ---

  // Auth / Profiles
  app.get('/api/users', (req, res) => {
    res.json(db.getUsers());
  });

  app.get('/api/users/:id', (req, res) => {
    const user = db.getUser(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  app.post('/api/users', (req, res) => {
    try {
      const { email, name, role, phone, address } = req.body;
      if (!email || !name || !role) {
        return res.status(400).json({ error: 'Email, Name, and Role are required.' });
      }
      const newUser = db.createUser({ email, name, role, phone, address });
      res.status(201).json(newUser);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/users/:id', (req, res) => {
    const { name, phone, address, role } = req.body;
    const updated = db.updateUserProfile(req.params.id, { name, phone, address, role });
    res.json(updated);
  });

  app.put('/api/users/:id/permissions', (req, res) => {
    const { permissions } = req.body;
    const updated = db.updateUserPermissions(req.params.id, permissions || []);
    res.json(updated);
  });

  // Products
  app.get('/api/products', (req, res) => {
    res.json(db.getProducts());
  });

  app.get('/api/products/:id', (req, res) => {
    const p = db.getProduct(req.params.id);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(p);
  });

  app.post('/api/products', (req, res) => {
    try {
      const { name, description, price, stock, category, imageUrl } = req.body;
      const newProduct = db.createProduct({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'
      });
      res.status(201).json(newProduct);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    const { name, description, price, stock, category, imageUrl } = req.body;
    const updated = db.updateProduct(req.params.id, {
      ...(name && { name }),
      ...(description && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(category && { category }),
      ...(imageUrl && { imageUrl })
    });
    res.json(updated);
  });

  app.delete('/api/products/:id', (req, res) => {
    db.deleteProduct(req.params.id);
    res.json({ success: true });
  });

  // Orders
  app.get('/api/orders', (req, res) => {
    res.json(db.getOrders());
  });

  app.post('/api/orders', (req, res) => {
    try {
      const { customerId, customerName, customerEmail, items, total, paymentGateway, shippingAddress, shippingPhone } = req.body;
      const order = db.createOrder({
        customerId,
        customerName,
        customerEmail,
        items,
        total: Number(total),
        paymentGateway,
        shippingAddress,
        shippingPhone
      });
      res.status(201).json(order);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/orders/:id/shipping', (req, res) => {
    const { status } = req.body;
    const updated = db.updateOrderShipping(req.params.id, status);
    res.json(updated);
  });

  // Campaigns
  app.get('/api/campaigns', (req, res) => {
    res.json(db.getCampaigns());
  });

  app.post('/api/campaigns', (req, res) => {
    const { name, platform, budget } = req.body;
    const newCamp = db.createCampaign({
      name,
      platform,
      budget: Number(budget),
      status: 'active'
    });
    res.status(201).json(newCamp);
  });

  app.put('/api/campaigns/:id/status', (req, res) => {
    const { status } = req.body;
    const updated = db.updateCampaignStatus(req.params.id, status);
    res.json(updated);
  });

  // Analytics
  app.get('/api/analytics', (req, res) => {
    res.json(getAnalyticsSummary());
  });

  // Automated AI Reporting and Strategic Business Insights
  app.post('/api/reports/insights', async (req, res) => {
    const summary = getAnalyticsSummary();
    const prompt = `Analyze the following real-time e-commerce performance metrics and generate a comprehensive, highly strategic executive summary report with actionable insights.

Sales performance metadata:
- Total Revenue: $${summary.totalRevenue}
- Total Orders: ${summary.totalOrders}
- Average Order Value: $${summary.averageOrderValue}
- Stable Customer Conversion Rate: ${summary.conversionRate}%

Inventory stock alerts:
${summary.stockAlerts.map(p => `  * Product ID: ${p.productId}, Name: "${p.name}", Stock remaining: ${p.stock}`).join('\n') || '  No low stock alerts. All products are well stocked.'}

Categories Revenue breakdown:
${summary.salesByCategory.map(c => `  * ${c.category}: $${c.value}`).join('\n')}

Social Media Ads performance metrics:
${summary.platformPerformance.map(p => `  * ${p.platform}: Click-throughs: ${p.clicks}, Conversions: ${p.conversions}, Marketing spend: $${p.spend}, Attributable revenue: $${p.revenue}`).join('\n')}

Based on this real-time data:
1. Provide an executive analysis of current revenue velocity and growth potential.
2. Formulate 2 critical inventory recommendations focusing on low stock alerts and popular items.
3. Deliver a marketing optimization plan ranking the platforms (Instagram, Facebook, TikTok, Twitter) based on return on ad spend (ROAS) and where the budget should be scaled or paused.
4. Draft a structural "Growth Action Plan" of 3 literal milestones.

Present this beautifully with clear markdown headings, bold accents, and metric callouts. Keep it executive, concise, and professional.`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
        });
        const text = response.text || 'Error: Empty response received from Gemini.';
        return res.json({ report: text, source: 'ai' });
      } catch (e: any) {
        console.error('Gemini API call failed:', e);
        // Fallback to high-quality local generator below
      }
    }

    // High quality, realistic structural fallback markdown if Gemini API Key is missing or fails
    const mockReport = `## 📊 Executive Strategic Summary
*Report generated via locally simulated analysis engine.*

Our current store velocity indicates strong momentum with total revenue reaching **$${summary.totalRevenue}** over **${summary.totalOrders} total orders**, yielding an average order value of **$${summary.averageOrderValue}** at a **${summary.conversionRate}%** steady conversion rate.

### 📦 1. Inventory & Supply Chain Optimization
We detected **${summary.stockAlerts.length} urgent inventory warnings** requiring replenishment:
${summary.stockAlerts.map(p => `- **Replenish "${p.name}" (Stock: ${p.stock})**: Current high velocity indicates stock-out is imminent within 48 hours. Secure immediate air cargo supply line.`).join('\n')}
- **Category Focus**: The highest grossing category is **Accessories** followed by **Workstation**. Maintain high inventory reserves of felt desks pads and keyboard products.

### 📣 2. Social Media Marketing ROAS Breakdown
Calculating return on marketing investment across integrated social advertising channels:
${summary.platformPerformance.map(p => {
  const roas = p.spend > 0 ? (p.revenue / p.spend).toFixed(2) : '0';
  return `- **${p.platform}**: Spend: $${p.spend} | Attributable Revenue: $${p.revenue} | **ROAS: ${roas}x**`;
}).join('\n')}

*Strategic Decision*: Scale budget on **TIKTOK** and **INSTAGRAM** immediately due to high organic pull and positive conversion metrics. Pause **TWITTER** campaigns until cost-per-click values stabilize.

### 🚀 3. Growth Action Plan
1. **Automate Inventory Triggers**: Set restock levels at 10 units for key accessories.
2. **Launch Retargeting Pixel**: Deploy customized Facebook/Instagram carousel ads highlighting user-curated reviews.
3. **VIP Loyalty Program**: Roll out an automatic tracking discount invitation for accounts with average orders over $150.`;

    res.json({ report: mockReport, source: 'simulated' });
  });

  // --- VITE DEV / PROD SERVER SETUP ---

  if (!process.env.VERCEL) {
    (async () => {
      if (process.env.DISABLE_HMR === 'true') {
        // Standard setup for AI Studio preview environment
        console.log('HMR is disabled via DISABLE_HMR. Serving in standard Express container mode.');
      }

      if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: 'spa',
        });
        app.use(vite.middlewares);
      } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }

      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })().catch((err) => {
      console.error('Failed to start server:', err);
    });
  }

export default app;

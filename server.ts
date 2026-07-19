import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api', apiRouter);

// Initialize Gemini if key is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

app.post('/api/ai/generate-campaign', async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: 'Gemini AI not configured' });
  }

  const { product, platform, tone } = req.body;
  if (!product || !platform) {
    return res.status(400).json({ error: 'Missing product or platform' });
  }

  try {
    const prompt = `Write a creative ad copy for a ${platform} campaign selling ${product.name}. 
The product description is: ${product.description}. 
Make the tone ${tone || 'engaging and premium'}. 
Keep it under 3 sentences and include relevant emojis.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

if (!process.env.VERCEL) {
  (async () => {
    if (process.env.DISABLE_HMR === 'true') {
      console.log('HMR is disabled via DISABLE_HMR. Serving in standard Express container mode.');
    }

    if (process.env.NODE_ENV !== 'production') {
      // Dynamic import to avoid bundling Vite in Vercel functions
      const { createServer: createViteServer } = await import('vite');
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

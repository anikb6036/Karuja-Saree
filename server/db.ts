import { Product, Order, UserProfile, AdCampaign, AnalyticsSummary, OrderItem, PaymentGateway, ShippingStatus } from '../src/types.js';

// Pre-seeded products (Minimalist Slate/Tech aesthetic)
let products: Product[] = [
  {
    id: 'prod-1',
    name: 'Epsilon Mechanical Keyboard',
    description: 'An elegant tenkeyless mechanical keyboard featuring custom-tuned linear switches, solid anodized aluminum frame, and clean white LED backlighting.',
    price: 189,
    stock: 15,
    category: 'Workstation',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600',
    salesCount: 42,
    rating: 4.8
  },
  {
    id: 'prod-2',
    name: 'Monolith Merino Felt Desk Pad',
    description: 'Sourced from premium organic merino wool felt. Double-layered construct with a natural cork backing provides acoustic damping and flawless mouse glides.',
    price: 49,
    stock: 28,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&q=80&w=600',
    salesCount: 114,
    rating: 4.6
  },
  {
    id: 'prod-3',
    name: 'Apex Aluminum Monitor Riser',
    description: 'Ergonomically engineered aircraft-grade aluminum monitor stand with integrated cable routing, storage recess, and non-slip silicone pads.',
    price: 89,
    stock: 4, // Low stock warning!
    category: 'Workstation',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600',
    salesCount: 81,
    rating: 4.9
  },
  {
    id: 'prod-4',
    name: 'Nova Wireless Qi Concrete Dock',
    description: 'Heavyweight hand-poured sculptural concrete base with organic American Walnut inlay. Delivers up to 15W high-speed charging.',
    price: 69,
    stock: 22,
    category: 'Power',
    imageUrl: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&q=80&w=600',
    salesCount: 63,
    rating: 4.5
  },
  {
    id: 'prod-5',
    name: 'Orbit Anodized Tidy Tray',
    description: 'Modular magnetic desktop organizer tray machined from solid aluminum blocks. Keep writing tools, paperclips, and memory cards perfectly arranged.',
    price: 59,
    stock: 18,
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1590244921253-447d1593a228?auto=format&fit=crop&q=80&w=600',
    salesCount: 39,
    rating: 4.7
  },
  {
    id: 'prod-6',
    name: 'Voxel Ambient LED Column',
    description: 'Chambered acrylic and aluminum lighting tower that pulses with customizable architectural spectra. Integrated smart assistant triggers.',
    price: 129,
    stock: 2, // Low stock warning!
    category: 'Lighting',
    imageUrl: 'https://images.unsplash.com/photo-1507646227500-4d389b0012be?auto=format&fit=crop&q=80&w=600',
    salesCount: 95,
    rating: 4.9
  }
];

// Pre-seeded users (Customer and Admin)
let users: UserProfile[] = [
  {
    id: 'user-admin',
    email: 'admin@example.com',
    name: 'Sarah Jenkins (Admin)',
    phone: '+1 (555) 019-2834',
    address: 'HQ Suite 400, 100 Infinite Loop, Cupertino, CA',
    role: 'admin',
    permissions: ['manage_products', 'manage_orders', 'view_analytics', 'manage_permissions']
  },
  {
    id: 'user-customer',
    email: 'customer@example.com',
    name: 'John Doe',
    phone: '+1 (555) 012-3456',
    address: '123 Pinecrest Lane, Seattle, WA 98101',
    role: 'customer',
    permissions: []
  }
];

// Pre-seeded ad campaigns representing social media targeted marketing integration
let campaigns: AdCampaign[] = [
  {
    id: 'camp-1',
    platform: 'instagram',
    name: 'Sleek Keyboard Launch - Carousels',
    status: 'active',
    budget: 1500,
    spent: 980,
    clicks: 4250,
    conversions: 184,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'camp-2',
    platform: 'facebook',
    name: 'Desk Setup Inspiration - Video',
    status: 'active',
    budget: 2000,
    spent: 1240,
    clicks: 5120,
    conversions: 242,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'camp-3',
    platform: 'tiktok',
    name: 'Concrete Charger Unboxing',
    status: 'active',
    budget: 1000,
    spent: 620,
    clicks: 8400,
    conversions: 310,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'camp-4',
    platform: 'twitter',
    name: 'Anodized Tray Flash Promotion',
    status: 'paused',
    budget: 500,
    spent: 500,
    clicks: 1210,
    conversions: 35,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Past dates for sales trends
const getPastDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

// Pre-seeded orders over the past 7 days
let orders: Order[] = [
  {
    id: 'ord-1001',
    customerId: 'user-customer',
    customerName: 'John Doe',
    customerEmail: 'customer@example.com',
    items: [
      { productId: 'prod-1', name: 'Epsilon Mechanical Keyboard', quantity: 1, price: 189 },
      { productId: 'prod-2', name: 'Monolith Merino Felt Desk Pad', quantity: 1, price: 49 }
    ],
    total: 238,
    paymentGateway: 'credit_card',
    paymentStatus: 'paid',
    shippingStatus: 'delivered',
    shippingAddress: '123 Pinecrest Lane, Seattle, WA 98101',
    shippingPhone: '+1 (555) 012-3456',
    createdAt: getPastDateStr(6) + 'T14:32:00Z',
    trackingNumber: 'TRK-98347291-US',
    notifications: ['Order confirmed', 'Payment received', 'Shipped via Express Priority', 'Delivered at porch - signed John']
  },
  {
    id: 'ord-1002',
    customerId: 'user-customer',
    customerName: 'John Doe',
    customerEmail: 'customer@example.com',
    items: [
      { productId: 'prod-4', name: 'Nova Wireless Qi Concrete Dock', quantity: 1, price: 69 }
    ],
    total: 69,
    paymentGateway: 'google_pay',
    paymentStatus: 'paid',
    shippingStatus: 'shipped',
    shippingAddress: '123 Pinecrest Lane, Seattle, WA 98101',
    shippingPhone: '+1 (555) 012-3456',
    createdAt: getPastDateStr(4) + 'T09:12:00Z',
    trackingNumber: 'TRK-21049581-US',
    notifications: ['Order confirmed', 'Payment received', 'Shipped via Standard ground']
  },
  {
    id: 'ord-1003',
    customerId: 'cust-2',
    customerName: 'Alex Mercer',
    customerEmail: 'alex.m@example.com',
    items: [
      { productId: 'prod-3', name: 'Apex Aluminum Monitor Riser', quantity: 2, price: 89 },
      { productId: 'prod-5', name: 'Orbit Anodized Tidy Tray', quantity: 1, price: 59 }
    ],
    total: 237,
    paymentGateway: 'paypal',
    paymentStatus: 'paid',
    shippingStatus: 'processing',
    shippingAddress: '742 Evergreen Terrace, Springfield, OR',
    shippingPhone: '+1 (555) 999-1122',
    createdAt: getPastDateStr(2) + 'T18:45:00Z',
    trackingNumber: 'TRK-55239103-US',
    notifications: ['Order confirmed', 'Payment received', 'Undergoing quality inspection']
  },
  {
    id: 'ord-1004',
    customerId: 'cust-3',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.r@example.com',
    items: [
      { productId: 'prod-6', name: 'Voxel Ambient LED Column', quantity: 1, price: 129 }
    ],
    total: 129,
    paymentGateway: 'credit_card',
    paymentStatus: 'paid',
    shippingStatus: 'pending',
    shippingAddress: '55 Nevsky Prospekt, Apt 14, St. Petersburg',
    shippingPhone: '+7 (901) 234-5678',
    createdAt: getPastDateStr(1) + 'T11:20:00Z',
    trackingNumber: '',
    notifications: ['Order confirmed', 'Payment authorized']
  },
  {
    id: 'ord-1005',
    customerId: 'cust-4',
    customerName: 'Marcus Aurelius',
    customerEmail: 'philosopher@rome.it',
    items: [
      { productId: 'prod-1', name: 'Epsilon Mechanical Keyboard', quantity: 1, price: 189 },
      { productId: 'prod-6', name: 'Voxel Ambient LED Column', quantity: 1, price: 129 }
    ],
    total: 318,
    paymentGateway: 'credit_card',
    paymentStatus: 'paid',
    shippingStatus: 'pending',
    shippingAddress: 'Palatine Hill, House of Augustus, Rome, Italy',
    shippingPhone: '+39 (06) 1234-5678',
    createdAt: new Date().toISOString(), // Today!
    trackingNumber: '',
    notifications: ['Order confirmed', 'Payment received']
  }
];

// Helper to calculate analytics summary
export function getAnalyticsSummary(): AnalyticsSummary {
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalUsers = users.length;
  const averageOrderValue = totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0;

  // Let's create an elegant sales by date list for the last 7 days
  const salesByDate: { date: string; amount: number; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dStr = getPastDateStr(i);
    const dayOrders = orders.filter(o => o.createdAt.startsWith(dStr) && o.paymentStatus === 'paid');
    const daySales = dayOrders.reduce((sum, o) => sum + o.total, 0);
    salesByDate.push({
      date: new Date(dStr).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
      amount: daySales,
      count: dayOrders.length
    });
  }

  // Sales by category
  const categoryMap = new Map<string, number>();
  products.forEach(p => {
    categoryMap.set(p.category, 0);
  });
  orders.forEach(o => {
    if (o.paymentStatus === 'paid') {
      o.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          const current = categoryMap.get(prod.category) || 0;
          categoryMap.set(prod.category, current + (item.price * item.quantity));
        }
      });
    }
  });
  const salesByCategory = Array.from(categoryMap.entries()).map(([category, value]) => ({
    category,
    value
  }));

  // Platform marketing performance
  // Let's connect conversions to orders total to represent actual ROI
  // We'll calculate mock tracking based on the pre-seeded campaigns
  const platformPerformance = campaigns.map(c => {
    const revenue = c.conversions * 45; // average purchase multiplier
    return {
      platform: c.platform.toUpperCase(),
      clicks: c.clicks,
      conversions: c.conversions,
      spend: c.spent,
      revenue: Math.round(revenue)
    };
  });

  // Low stock alerts
  const stockAlerts = products
    .filter(p => p.stock <= 5)
    .map(p => ({
      productId: p.id,
      name: p.name,
      stock: p.stock
    }));

  return {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalUsers,
    averageOrderValue,
    conversionRate: 3.4, // standard stable Conversion Rate representation
    salesByDate,
    salesByCategory,
    platformPerformance,
    stockAlerts
  };
}

// Database Operations
export const db = {
  getProducts: () => products,
  getProduct: (id: string) => products.find(p => p.id === id),
  createProduct: (p: Omit<Product, 'id' | 'salesCount' | 'rating'>) => {
    const newProd: Product = {
      ...p,
      id: `prod-${Date.now()}`,
      salesCount: 0,
      rating: 5.0
    };
    products.push(newProd);
    return newProd;
  },
  updateProduct: (id: string, updates: Partial<Product>) => {
    products = products.map(p => p.id === id ? { ...p, ...updates } : p);
    return products.find(p => p.id === id);
  },
  deleteProduct: (id: string) => {
    products = products.filter(p => p.id !== id);
    return true;
  },

  getOrders: () => orders,
  getOrder: (id: string) => orders.find(o => o.id === id),
  createOrder: (o: { customerId: string; customerName: string; customerEmail: string; items: OrderItem[]; total: number; paymentGateway: PaymentGateway; shippingAddress: string; shippingPhone: string }) => {
    // Subtract stock
    let stockError = false;
    o.items.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (!p || p.stock < item.quantity) {
        stockError = true;
      }
    });

    if (stockError) {
      throw new Error('Insufficient stock for one or more items.');
    }

    // Deduct stock and increase sales count
    o.items.forEach(item => {
      products = products.map(p => {
        if (p.id === item.productId) {
          return {
            ...p,
            stock: p.stock - item.quantity,
            salesCount: p.salesCount + item.quantity
          };
        }
        return p;
      });
    });

    const newOrder: Order = {
      ...o,
      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      paymentStatus: 'paid', // Instant auto-auth for demo
      shippingStatus: 'pending',
      createdAt: new Date().toISOString(),
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}-US`,
      notifications: ['Order confirmed', 'Payment authorized and captured']
    };

    orders.unshift(newOrder); // Add to beginning
    return newOrder;
  },
  updateOrderShipping: (id: string, status: ShippingStatus) => {
    orders = orders.map(o => {
      if (o.id === id) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let updateMsg = `Status updated to ${status}`;
        if (status === 'processing') updateMsg = `Order processed at warehouse - [${timestamp}]`;
        if (status === 'shipped') updateMsg = `Shipped via Express Priority. Tracking: ${o.trackingNumber || 'Pending'} - [${timestamp}]`;
        if (status === 'delivered') updateMsg = `Package delivered at destination - [${timestamp}]`;
        
        return {
          ...o,
          shippingStatus: status,
          notifications: [...o.notifications, updateMsg]
        };
      }
      return o;
    });
    return orders.find(o => o.id === id);
  },

  getCampaigns: () => campaigns,
  updateCampaignStatus: (id: string, status: 'active' | 'paused') => {
    campaigns = campaigns.map(c => c.id === id ? { ...c, status } : c);
    return campaigns.find(c => c.id === id);
  },
  createCampaign: (c: Omit<AdCampaign, 'id' | 'spent' | 'clicks' | 'conversions' | 'createdAt'>) => {
    const newCamp: AdCampaign = {
      ...c,
      id: `camp-${Date.now()}`,
      spent: 0,
      clicks: 0,
      conversions: 0,
      createdAt: new Date().toISOString()
    };
    campaigns.push(newCamp);
    return newCamp;
  },

  getUsers: () => users,
  getUser: (id: string) => users.find(u => u.id === id),
  updateUserProfile: (id: string, updates: Partial<UserProfile>) => {
    users = users.map(u => u.id === id ? { ...u, ...updates } : u);
    return users.find(u => u.id === id);
  },
  updateUserPermissions: (id: string, permissions: string[]) => {
    users = users.map(u => u.id === id ? { ...u, permissions } : u);
    return users.find(u => u.id === id);
  }
};

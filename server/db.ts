import { Product, Order, UserProfile, AdCampaign, AnalyticsSummary, OrderItem, PaymentGateway, ShippingStatus } from '../src/types.js';

// Pre-seeded products (Premium Heritage Saree Boutique)
let products: Product[] = [
  {
    id: 'prod-1',
    name: 'Karuja Royal Banarasi Silk Saree',
    description: 'Handwoven in Varanasi using pure mulberry silk and exquisite gold zari threads. Features traditional floral creepers (Bel) and a heavy brocade pallu.',
    price: 299,
    stock: 12,
    category: 'Banarasi Silk',
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600',
    salesCount: 42,
    rating: 4.8
  },
  {
    id: 'prod-2',
    name: 'Heritage Kanjeevaram Brocade Saree',
    description: 'Woven by master artisans in Tamil Nadu. Boasts thick, lustrous gold thread borders paired with rich temple motifs and a solid contrast pallu.',
    price: 349,
    stock: 18,
    category: 'Kanjeevaram Silk',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
    salesCount: 114,
    rating: 4.6
  },
  {
    id: 'prod-3',
    name: 'Elegant Ivory Chanderi Silk Saree',
    description: 'Feather-light weave combining high-grade silk warp and cotton weft. Embellished with delicate hand-drawn golden butis and a sheer, elegant drape.',
    price: 159,
    stock: 4, // Low stock warning!
    category: 'Chanderi Saree',
    imageUrl: 'https://images.unsplash.com/photo-1605784401368-5af1d9d6c4dc?auto=format&fit=crop&q=80&w=600',
    salesCount: 81,
    rating: 4.9
  },
  {
    id: 'prod-4',
    name: 'Amethyst Organza Floral Saree',
    description: 'Delicate glass organza with hand-painted pastel blossoms. Features fine metallic scalloped borders and comes with a raw silk blouse piece.',
    price: 129,
    stock: 22,
    category: 'Organza',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
    salesCount: 63,
    rating: 4.5
  },
  {
    id: 'prod-5',
    name: 'Midnight Jamdani Dhakai Saree',
    description: 'A fine cotton muslin saree decorated with exquisite hand-woven geometric patterns. A masterpiece of traditional weaving heritage.',
    price: 229,
    stock: 15,
    category: 'Jamdani',
    imageUrl: 'https://images.unsplash.com/photo-1610030470298-40b355e54d8b?auto=format&fit=crop&q=80&w=600',
    salesCount: 39,
    rating: 4.7
  },
  {
    id: 'prod-6',
    name: 'Blush Pink Georgette Saree',
    description: 'Flowy, crinkled premium georgette fabric adorned with intricate white Chikankari hand embroidery and delicate shimmering sequins.',
    price: 189,
    stock: 2, // Low stock warning!
    category: 'Georgette & Chiffon',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
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
      { productId: 'prod-1', name: 'Karuja Royal Banarasi Silk Saree', quantity: 1, price: 299 },
      { productId: 'prod-2', name: 'Heritage Kanjeevaram Brocade Saree', quantity: 1, price: 349 }
    ],
    total: 648,
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
      { productId: 'prod-4', name: 'Amethyst Organza Floral Saree', quantity: 1, price: 129 }
    ],
    total: 129,
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
      { productId: 'prod-3', name: 'Elegant Ivory Chanderi Silk Saree', quantity: 2, price: 159 },
      { productId: 'prod-5', name: 'Midnight Jamdani Dhakai Saree', quantity: 1, price: 229 }
    ],
    total: 547,
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
      { productId: 'prod-6', name: 'Blush Pink Georgette Saree', quantity: 1, price: 189 }
    ],
    total: 189,
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
      { productId: 'prod-1', name: 'Karuja Royal Banarasi Silk Saree', quantity: 1, price: 299 },
      { productId: 'prod-6', name: 'Blush Pink Georgette Saree', quantity: 1, price: 189 }
    ],
    total: 488,
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
  createUser: (u: { email: string; name: string; role: 'customer' | 'admin'; phone?: string; address?: string }) => {
    const existing = users.find(user => user.email.toLowerCase() === u.email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: u.email,
      name: u.name,
      phone: u.phone || '',
      address: u.address || '',
      role: u.role,
      permissions: u.role === 'admin' ? ['manage_products', 'manage_orders', 'view_analytics'] : []
    };
    users.push(newUser);
    return newUser;
  },
  updateUserProfile: (id: string, updates: Partial<UserProfile>) => {
    users = users.map(u => u.id === id ? { ...u, ...updates } : u);
    return users.find(u => u.id === id);
  },
  updateUserPermissions: (id: string, permissions: string[]) => {
    users = users.map(u => u.id === id ? { ...u, permissions } : u);
    return users.find(u => u.id === id);
  }
};

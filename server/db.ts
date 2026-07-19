import { Product, Order, UserProfile, AdCampaign, AnalyticsSummary } from '../src/types.js';
import { supabase } from './supabase.js';

let mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Karuja Royal Banarasi Silk Saree',
    description: 'Handwoven in Varanasi using pure mulberry silk and exquisite gold zari threads.',
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
    description: 'Woven by master artisans in Tamil Nadu. Boasts thick, lustrous gold thread borders.',
    price: 349,
    stock: 18,
    category: 'Kanjeevaram Silk',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
    salesCount: 114,
    rating: 4.6
  }
];

let mockUsers: UserProfile[] = [
  {
    id: 'user-admin',
    email: 'admin@example.com',
    name: 'Sarah Jenkins (Admin)',
    phone: '+1 (555) 019-2834',
    address: 'HQ Suite 400',
    role: 'admin',
    permissions: ['manage_products', 'manage_orders', 'view_analytics', 'manage_permissions']
  },
  {
    id: 'user-customer',
    email: 'customer@example.com',
    name: 'John Doe',
    phone: '+91 99999 12345',
    address: 'Palace Block C, Chanakyapuri, New Delhi',
    role: 'customer',
    permissions: []
  }
];

let mockOrders: Order[] = [];
let mockCampaigns: AdCampaign[] = [
  {
    id: 'camp-1',
    platform: 'instagram',
    name: 'Royal Banarasi launch',
    budget: 500,
    status: 'active',
    spent: 120,
    clicks: 450,
    conversions: 12,
    createdAt: new Date().toISOString()
  }
];

class Database {
  async getProducts(): Promise<Product[]> {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) return data as Product[];
    }
    return mockProducts;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (!error && data) return data as Product;
    }
    return mockProducts.find(p => p.id === id);
  }

  async createProduct(p: Omit<Product, 'id' | 'salesCount' | 'rating'>): Promise<Product> {
    const newProduct: Product = {
      ...p,
      id: `prod-${Date.now()}`,
      salesCount: 0,
      rating: 0
    };
    if (supabase) {
      await supabase.from('products').insert([newProduct]);
    }
    mockProducts.push(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    if (supabase) {
      await supabase.from('products').update(updates).eq('id', id);
    }
    const idx = mockProducts.findIndex(p => p.id === id);
    if (idx !== -1) {
      mockProducts[idx] = { ...mockProducts[idx], ...updates };
      return mockProducts[idx];
    }
    return undefined;
  }

  async deleteProduct(id: string): Promise<void> {
    if (supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
    mockProducts = mockProducts.filter(p => p.id !== id);
  }

  async getUsers(): Promise<UserProfile[]> {
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) {
        return data.map((u: any) => ({
          ...u,
          permissions: Array.isArray(u.permissions) ? u.permissions : []
        })) as UserProfile[];
      }
    }
    return mockUsers;
  }

  async getUser(id: string): Promise<UserProfile | undefined> {
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (!error && data) {
        return {
          ...data,
          permissions: Array.isArray(data.permissions) ? data.permissions : []
        } as UserProfile;
      }
    }
    return mockUsers.find(u => u.id === id);
  }

  async createUser(u: Omit<UserProfile, 'id' | 'permissions'>): Promise<UserProfile> {
    const newUser: UserProfile = {
      ...u,
      id: `user-${Date.now()}`,
      permissions: u.role === 'admin' ? ['manage_products', 'manage_orders', 'view_analytics', 'manage_permissions'] : []
    };
    if (supabase) {
      await supabase.from('users').insert([newUser]);
    }
    mockUsers.push(newUser);
    return newUser;
  }

  async updateUserProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    if (supabase) {
      await supabase.from('users').update(updates).eq('id', id);
    }
    const idx = mockUsers.findIndex(u => u.id === id);
    if (idx !== -1) {
      mockUsers[idx] = { ...mockUsers[idx], ...updates };
      return mockUsers[idx];
    }
    return undefined;
  }

  async updateUserPermissions(id: string, permissions: string[]): Promise<UserProfile | undefined> {
    if (supabase) {
      await supabase.from('users').update({ permissions }).eq('id', id);
    }
    const idx = mockUsers.findIndex(u => u.id === id);
    if (idx !== -1) {
      mockUsers[idx].permissions = permissions;
      return mockUsers[idx];
    }
    return undefined;
  }

  async getOrders(): Promise<Order[]> {
    if (supabase) {
      const { data, error } = await supabase.from('orders').select('*');
      if (!error && data) return data as Order[];
    }
    return mockOrders;
  }

  async createOrder(o: Omit<Order, 'id' | 'paymentStatus' | 'shippingStatus' | 'createdAt' | 'trackingNumber' | 'notifications'>): Promise<Order> {
    const newOrder: Order = {
      ...o,
      id: `ord-${Date.now()}`,
      paymentStatus: 'paid',
      shippingStatus: 'pending',
      createdAt: new Date().toISOString(),
      trackingNumber: '',
      notifications: ['Order confirmed']
    };
    if (supabase) {
      await supabase.from('orders').insert([newOrder]);
    }
    mockOrders.push(newOrder);
    return newOrder;
  }

  async updateOrderShipping(id: string, status: any): Promise<Order | undefined> {
    if (supabase) {
      await supabase.from('orders').update({ shippingStatus: status }).eq('id', id);
    }
    const idx = mockOrders.findIndex(o => o.id === id);
    if (idx !== -1) {
      mockOrders[idx].shippingStatus = status;
      return mockOrders[idx];
    }
    return undefined;
  }

  async getCampaigns(): Promise<AdCampaign[]> {
    if (supabase) {
      const { data, error } = await supabase.from('campaigns').select('*');
      if (!error && data) return data as AdCampaign[];
    }
    return mockCampaigns;
  }

  async createCampaign(c: Omit<AdCampaign, 'id' | 'status' | 'spent' | 'clicks' | 'conversions' | 'createdAt'>): Promise<AdCampaign> {
    const newCamp: AdCampaign = {
      ...c,
      id: `camp-${Date.now()}`,
      status: 'active',
      spent: 0,
      clicks: 0,
      conversions: 0,
      createdAt: new Date().toISOString()
    };
    if (supabase) {
      await supabase.from('campaigns').insert([newCamp]);
    }
    mockCampaigns.push(newCamp);
    return newCamp;
  }

  async updateCampaignStatus(id: string, status: any): Promise<AdCampaign | undefined> {
    if (supabase) {
      await supabase.from('campaigns').update({ status }).eq('id', id);
    }
    const idx = mockCampaigns.findIndex(c => c.id === id);
    if (idx !== -1) {
      mockCampaigns[idx].status = status;
      return mockCampaigns[idx];
    }
    return undefined;
  }
}

export const db = new Database();

export function getAnalyticsSummary(): AnalyticsSummary {
  // Return basic mock for now
  return {
    totalRevenue: 5000,
    totalOrders: 20,
    totalProducts: mockProducts.length,
    totalUsers: mockUsers.length,
    averageOrderValue: 250,
    conversionRate: 3.5,
    salesByDate: [],
    salesByCategory: [],
    platformPerformance: [],
    stockAlerts: []
  };
}

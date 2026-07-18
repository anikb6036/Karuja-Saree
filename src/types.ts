export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  salesCount: number;
  rating: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export type PaymentGateway = 'credit_card' | 'paypal' | 'google_pay';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type ShippingStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  paymentGateway: PaymentGateway;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  shippingAddress: string;
  shippingPhone: string;
  createdAt: string;
  trackingNumber: string;
  notifications: string[];
}

export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  role: UserRole;
  permissions: string[]; // for admin panel granular management
}

export interface AdCampaign {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'tiktok';
  name: string;
  status: 'active' | 'paused';
  budget: number;
  spent: number;
  clicks: number;
  conversions: number;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  averageOrderValue: number;
  conversionRate: number;
  salesByDate: { date: string; amount: number; count: number }[];
  salesByCategory: { category: string; value: number }[];
  platformPerformance: { platform: string; clicks: number; conversions: number; spend: number; revenue: number }[];
  stockAlerts: { productId: string; name: string; stock: number }[];
}

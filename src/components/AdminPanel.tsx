import React, { useState, useEffect } from 'react';
import { Product, Order, UserProfile, AdCampaign, AnalyticsSummary } from '../types.js';
import { 
  Plus, Edit2, Trash2, RefreshCw, Sparkles, TrendingUp, DollarSign, 
  ShoppingCart, Users, Layers, AlertCircle, Play, Pause, Save, CheckCircle, 
  ChevronRight, FileText, Clipboard, Settings, HelpCircle, Eye, LogOut
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  user: UserProfile;
  products: Product[];
  orders: Order[];
  campaigns: AdCampaign[];
  usersList: UserProfile[];
  onRefreshAll: () => void;
  onIdentityChange?: (userId: string) => void;
  onLogout?: () => void;
}

export default function AdminPanel({
  user,
  products,
  orders,
  campaigns,
  usersList,
  onRefreshAll,
  onIdentityChange,
  onLogout
}: AdminPanelProps) {
  // Tabs: analytics, inventory, orders, campaigns, users, ai-insights
  const [activeTab, setActiveTab] = useState<'analytics' | 'inventory' | 'orders' | 'marketing' | 'users' | 'ai-insights'>('analytics');
  
  // Analytics State
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  // Inventory forms state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [inventoryError, setInventoryError] = useState('');

  // AI Insights report state
  const [reportText, setReportText] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportSource, setReportSource] = useState<'ai' | 'simulated' | ''>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [reassuringStep, setReassuringStep] = useState(0);

  // Marketing states
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignPlatform, setNewCampaignPlatform] = useState<'facebook' | 'instagram' | 'twitter' | 'tiktok'>('instagram');
  const [newCampaignBudget, setNewCampaignBudget] = useState('');
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  // Granular permissions list
  const availablePermissions = ['manage_products', 'manage_orders', 'view_analytics', 'manage_permissions'];

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };
  const [toastMsg, setToastMsg] = useState('');

  // Fetch real-time analytics summary
  const fetchAnalytics = async () => {
    setIsAnalyticsLoading(true);
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [products, orders, campaigns, usersList]);

  // Loading screen steps for Gemini reports
  useEffect(() => {
    if (isGeneratingReport) {
      const phrases = [
        'Connecting with server-side Gemini 3.5 AI controller...',
        'Compiling sales velocity datasets & transactional metadata...',
        'Running multi-channel ROI regression and market attribution analysis...',
        'Drafting executive briefing recommendations & supply milestones...'
      ];
      setReassuringStep(0);
      const interval = setInterval(() => {
        setReassuringStep(prev => (prev + 1) % phrases.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isGeneratingReport]);

  const generateReport = async () => {
    setIsGeneratingReport(true);
    setReportText('');
    setReportSource('');
    try {
      const res = await fetch('/api/reports/insights', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setReportText(data.report);
        setReportSource(data.source);
        triggerToast('AI Analysis Report generated successfully');
      }
    } catch (e) {
      triggerToast('AI Report Generation Failed');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Run automatically on first AI Tab mount if empty
  useEffect(() => {
    if (activeTab === 'ai-insights' && !reportText) {
      generateReport();
    }
  }, [activeTab]);

  // Copy report to clipboard
  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportText);
    setCopySuccess(true);
    triggerToast('Report copied to clipboard');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Inventory Save Handlers
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setInventoryError('');
    try {
      const body = {
        name: prodName,
        description: prodDesc,
        price: Number(prodPrice),
        stock: Number(prodStock),
        category: prodCategory,
        imageUrl: prodImageUrl
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save product changes.');
      }

      triggerToast(editingProduct ? `Updated product "${prodName}"` : `Created product "${prodName}"`);
      setIsProductModalOpen(false);
      setEditingProduct(null);
      onRefreshAll();
    } catch (err: any) {
      setInventoryError(err.message);
    }
  };

  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdPrice(prod.price.toString());
    setProdStock(prod.stock.toString());
    setProdCategory(prod.category);
    setProdImageUrl(prod.imageUrl);
    setInventoryError('');
    setIsProductModalOpen(true);
  };

  const startNewProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice('');
    setProdStock('');
    setProdCategory('Workstation');
    setProdImageUrl('');
    setInventoryError('');
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        triggerToast('Product removed from database');
        onRefreshAll();
      }
    } catch (e) {
      triggerToast('Failed to delete product');
    }
  };

  // Order Shipping Update
  const handleUpdateShipping = async (orderId: string, status: any) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/shipping`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerToast(`Order #${orderId} set to "${status}"`);
        onRefreshAll();
      }
    } catch (e) {
      triggerToast('Failed to update order tracking');
    }
  };

  // Marketing Toggles & Campaign creation
  const handleToggleCampaign = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/campaigns/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        triggerToast(`Campaign status updated to ${nextStatus}`);
        onRefreshAll();
      }
    } catch (e) {
      triggerToast('Failed to edit campaign status');
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingCampaign(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCampaignName,
          platform: newCampaignPlatform,
          budget: Number(newCampaignBudget)
        })
      });
      if (res.ok) {
        triggerToast(`Created ad campaign "${newCampaignName}"`);
        setNewCampaignName('');
        setNewCampaignBudget('');
        onRefreshAll();
      }
    } catch (e) {
      triggerToast('Failed to create campaign');
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  // User permission adjust
  const handlePermissionToggle = async (userId: string, perm: string, hasPerm: boolean) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;

    let newPerms = [...targetUser.permissions];
    if (hasPerm) {
      newPerms = newPerms.filter(p => p !== perm);
    } else {
      newPerms.push(perm);
    }

    try {
      const res = await fetch(`/api/users/${userId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: newPerms })
      });
      if (res.ok) {
        triggerToast(`Updated system permissions for "${targetUser.name}"`);
        onRefreshAll();
      }
    } catch (e) {
      triggerToast('Failed to edit user permissions');
    }
  };

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;
    const nextRole = currentRole === 'admin' ? 'customer' : 'admin';

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: targetUser.name,
          phone: targetUser.phone,
          address: targetUser.address,
          role: nextRole
        })
      });
      if (res.ok) {
        triggerToast(`Changed "${targetUser.name}" role to ${nextRole}`);
        onRefreshAll();
      }
    } catch (e) {
      triggerToast('Failed to switch user role');
    }
  };

  const COLORS = ['#111111', '#555555', '#888888', '#CCCCCC', '#E5E5E5'];

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9F9] text-neutral-900 font-sans selection:bg-neutral-200">
      {/* Toast alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 bg-neutral-950 text-white text-xs font-mono py-2 px-4 shadow-md border border-neutral-850"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin header */}
      <div className="border-b border-neutral-200 bg-white px-4 py-3 md:px-6 md:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-4.5 h-4.5 text-neutral-950 animate-spin-slow" />
              <h2 className="font-display font-semibold tracking-tight text-base md:text-lg text-neutral-950 uppercase">
                Administrator Suite
              </h2>
            </div>

            {/* Mobile Actions: Only visible on extra small screens (< 640px) */}
            <div className="flex items-center space-x-2 sm:hidden">
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 border border-red-100 text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <nav className="flex space-x-5 text-[11px] md:text-xs font-mono uppercase tracking-wider text-neutral-400 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`hover:text-neutral-950 transition-colors whitespace-nowrap pb-1 ${activeTab === 'analytics' ? 'text-neutral-950 font-medium border-b border-neutral-950' : ''}`}
            >
              Sales Analytics
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`hover:text-neutral-950 transition-colors whitespace-nowrap pb-1 ${activeTab === 'inventory' ? 'text-neutral-950 font-medium border-b border-neutral-950' : ''}`}
            >
              Inventory Manager
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`hover:text-neutral-950 transition-colors whitespace-nowrap pb-1 ${activeTab === 'orders' ? 'text-neutral-950 font-medium border-b border-neutral-950' : ''}`}
            >
              Order Tracking
            </button>
            <button 
              onClick={() => setActiveTab('marketing')}
              className={`hover:text-neutral-950 transition-colors whitespace-nowrap pb-1 ${activeTab === 'marketing' ? 'text-neutral-950 font-medium border-b border-neutral-950' : ''}`}
            >
              Social Ads Hub
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`hover:text-neutral-950 transition-colors whitespace-nowrap pb-1 ${activeTab === 'users' ? 'text-neutral-950 font-medium border-b border-neutral-950' : ''}`}
            >
              Security Roles
            </button>
            <button 
              onClick={() => setActiveTab('ai-insights')}
              className={`hover:text-neutral-950 transition-colors flex items-center space-x-1 whitespace-nowrap pb-1 ${activeTab === 'ai-insights' ? 'text-neutral-950 font-medium border-b border-neutral-950' : ''}`}
            >
              <Sparkles className="w-3 h-3 text-neutral-900" />
              <span>AI Strategic Insights</span>
            </button>
          </nav>
        </div>

        <div className="hidden sm:flex items-center space-x-4">
          <div className="text-right text-xs text-neutral-500">
            <div className="font-light">Security Node Status</div>
            <div className="text-emerald-600 font-semibold">● FULL AUTHORIZATION</div>
          </div>

          {onLogout && (
            <>
              <span className="text-neutral-300">|</span>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 hover:text-[#FF8080] text-red-700 transition-colors text-xs font-semibold cursor-pointer"
                title="Sign out of current session"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Admin Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* KPI Cards bento box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-neutral-200 p-5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  <span>Total Capital Revenue</span>
                  <DollarSign className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                <div className="font-display font-semibold text-2xl tracking-tight">${analytics.totalRevenue}.00</div>
                <div className="text-[10px] font-mono text-emerald-600 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+14.8% past week velocity</span>
                </div>
              </div>

              <div className="bg-white border border-neutral-200 p-5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  <span>Completed Orders</span>
                  <ShoppingCart className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                <div className="font-display font-semibold text-2xl tracking-tight">{analytics.totalOrders} orders</div>
                <div className="text-[10px] font-mono text-neutral-400">
                  Across customer segments
                </div>
              </div>

              <div className="bg-white border border-neutral-200 p-5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  <span>Avg Ticket Value (AOV)</span>
                  <Layers className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                <div className="font-display font-semibold text-2xl tracking-tight">${analytics.averageOrderValue}</div>
                <div className="text-[10px] font-mono text-neutral-400">
                  Premium cart baskets
                </div>
              </div>

              <div className="bg-white border border-neutral-200 p-5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  <span>Visitor Conversion</span>
                  <Users className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                <div className="font-display font-semibold text-2xl tracking-tight">{analytics.conversionRate}%</div>
                <div className="text-[10px] font-mono text-neutral-400">
                  Stable targeted traffic
                </div>
              </div>
            </div>

            {/* Low stock indicators block */}
            {analytics.stockAlerts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-mono text-xs font-bold text-amber-900 uppercase">Inventory Stock replenishment alerts ({analytics.stockAlerts.length})</h4>
                  <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
                    {analytics.stockAlerts.map(alert => (
                      <span key={alert.productId} className="font-mono text-[10px] text-amber-800">
                        • <strong>{alert.name}</strong>: only {alert.stock} remaining in shelves!
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Timeline */}
              <div className="bg-white border border-neutral-200 p-5 space-y-4 lg:col-span-2">
                <h4 className="font-display font-medium text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-150 pb-2">
                  Completed Sales Velocity (Last 7 Days)
                </h4>
                <div className="h-72 w-full font-mono text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.salesByDate}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" stroke="#888888" tickLine={false} />
                      <YAxis stroke="#888888" tickLine={false} tickFormatter={(val) => `$${val}`} />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} contentStyle={{ fontFamily: 'monospace', fontSize: '10px' }} />
                      <Line type="monotone" dataKey="amount" stroke="#111111" strokeWidth={2.5} dot={{ r: 4, fill: '#111111' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Breakdown Pie */}
              <div className="bg-white border border-neutral-200 p-5 space-y-4">
                <h4 className="font-display font-medium text-xs uppercase tracking-wider text-neutral-500 border-b border-neutral-150 pb-2">
                  Revenue contribution by category
                </h4>
                <div className="h-72 w-full flex flex-col justify-between">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.salesByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="category"
                        >
                          {analytics.salesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val) => `$${val}`} contentStyle={{ fontFamily: 'monospace', fontSize: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[9px] uppercase text-neutral-500 pt-2 border-t border-neutral-100">
                    {analytics.salesByCategory.map((entry, index) => (
                      <div key={index} className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 inline-block shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="truncate">{entry.category}: ${entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-neutral-900">
                Central Inventory Database
              </h3>
              <button
                onClick={startNewProduct}
                className="px-3 py-1.5 bg-neutral-900 text-white font-mono text-[10px] uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product SKU</span>
              </button>
            </div>

            {/* SKU Table list */}
            <div className="bg-white border border-neutral-200 overflow-x-auto shadow-xs">
              <table className="w-full text-left font-mono text-[10px] uppercase tracking-tight">
                <thead className="bg-neutral-50 text-neutral-400 border-b border-neutral-250">
                  <tr>
                    <th className="p-3.5">SKU Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Pricing</th>
                    <th className="p-3.5">Stock Shelves</th>
                    <th className="p-3.5">Sold count</th>
                    <th className="p-3.5 text-right">SKU Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-150">
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-3.5 flex items-center space-x-3 font-sans normal-case">
                        <img src={prod.imageUrl} alt={prod.name} referrerPolicy="no-referrer" className="w-9 h-7 object-cover bg-neutral-100 border" />
                        <div>
                          <div className="font-semibold text-neutral-900 text-[11px]">{prod.name}</div>
                          <div className="text-[9px] font-mono text-neutral-400 mt-0.5 font-bold uppercase">ID: {prod.id}</div>
                        </div>
                      </td>
                      <td className="p-3.5 text-neutral-600">{prod.category}</td>
                      <td className="p-3.5 font-semibold text-neutral-900">${prod.price}.00</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-none font-bold ${
                          prod.stock === 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          prod.stock <= 5 ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                          'bg-neutral-50 text-neutral-700 border border-neutral-200'
                        }`}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="p-3.5 text-neutral-500 font-bold">{prod.salesCount} sold</td>
                      <td className="p-3.5 text-right space-x-2">
                        <button 
                          onClick={() => startEditProduct(prod)}
                          className="p-1 text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-400 bg-white"
                          title="Edit SKU info"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1 text-rose-600 hover:text-rose-900 border border-neutral-200 hover:border-rose-300 bg-white"
                          title="De-register SKU"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-neutral-900 border-b border-neutral-200 pb-2">
              Capital Orders & Warehousing
            </h3>

            {orders.length === 0 ? (
              <div className="border border-dashed border-neutral-200 py-16 text-center text-neutral-400 font-mono text-xs bg-white">
                NO REGISTERED ORDERS RECORDED YET
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border border-neutral-200 bg-white p-5 shadow-xs space-y-4 font-mono text-[10px]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-neutral-100 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-neutral-900 uppercase">Order #{order.id}</span>
                          <span className="text-neutral-400 font-normal">| {new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="mt-1 text-neutral-500 font-sans normal-case">
                          Customer: <span className="font-bold text-neutral-900">{order.customerName}</span> ({order.customerEmail})
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <div>
                          <div className="text-[9px] uppercase text-neutral-400 text-right">Payment Status</div>
                          <div className="text-right text-emerald-600 font-bold">{order.paymentStatus.toUpperCase()}</div>
                        </div>
                        <div className="h-6 w-[1px] bg-neutral-200 hidden md:block" />
                        <div>
                          <div className="text-[9px] uppercase text-neutral-400 text-right">Order Capital</div>
                          <div className="text-right font-bold text-neutral-900">${order.total}.00</div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Status controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-neutral-50 border border-neutral-150 gap-4">
                      <div>
                        <span className="text-neutral-400 uppercase text-[9px] block">Dispatcher Pipeline Status</span>
                        <div className="font-bold text-neutral-900 mt-0.5 flex items-center space-x-1.5 uppercase">
                          <CheckCircle className="w-3.5 h-3.5 text-neutral-700" />
                          <span>Currently: {order.shippingStatus}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {(['processing', 'shipped', 'delivered'] as const).map(status => (
                          <button
                            key={status}
                            onClick={() => handleUpdateShipping(order.id, status)}
                            disabled={order.shippingStatus === status}
                            className={`px-2.5 py-1.5 border text-[9px] uppercase font-bold tracking-wider transition-all ${
                              order.shippingStatus === status 
                                ? 'bg-neutral-900 text-white border-neutral-900'
                                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            Set {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Order contents & tracking info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-[11px] font-sans text-neutral-600 normal-case">
                      <div>
                        <h5 className="font-mono text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-1.5">Purchased SKUs</h5>
                        <div className="space-y-1 font-mono text-[10px]">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between border-b border-dashed border-neutral-100 pb-1">
                              <span>{item.name} <span className="text-neutral-400">x{item.quantity}</span></span>
                              <span className="font-semibold text-neutral-900">${item.price * item.quantity}.00</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-mono text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-1.5">Delivery Details</h5>
                        <p className="text-neutral-800 font-medium">Recipient Name: {order.customerName}</p>
                        <p className="text-neutral-600 mt-1">Mobile Contact: {order.shippingPhone}</p>
                        <p className="text-neutral-600 mt-1">Destination Address: {order.shippingAddress}</p>
                        {order.trackingNumber && (
                          <p className="font-mono text-[10px] text-neutral-900 font-bold mt-2 uppercase">Waybill Express Code: {order.trackingNumber}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Form */}
              <div className="bg-white border border-neutral-200 p-5 space-y-4 h-fit">
                <h3 className="font-display font-semibold text-xs uppercase tracking-widest text-neutral-900 border-b border-neutral-150 pb-2 flex items-center space-x-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Launch Targeted Ad Campaign</span>
                </h3>

                <form onSubmit={handleCreateCampaign} className="space-y-4 font-mono text-[10px]">
                  <div className="space-y-1">
                    <label className="text-neutral-400">CAMPAIGN TITLE</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Concrete Charger Promotion"
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 text-[10px] focus:outline-none focus:border-neutral-400 bg-[#FCFCFC]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400">TARGET PLATFORM OUTLET</label>
                    <select
                      value={newCampaignPlatform}
                      onChange={(e) => setNewCampaignPlatform(e.target.value as any)}
                      className="w-full px-3 py-2 border border-neutral-200 text-[10px] focus:outline-none focus:border-neutral-400 bg-white"
                    >
                      <option value="instagram">INSTAGRAM CAROUSELS</option>
                      <option value="facebook">FACEBOOK FEED SPONSORS</option>
                      <option value="tiktok">TIKTOK TRENDING COLLABS</option>
                      <option value="twitter">TWITTER AUDIENCE GRAPH</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400">TOTAL CAMPAIGN BUDGET ($)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1500"
                      value={newCampaignBudget}
                      onChange={(e) => setNewCampaignBudget(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 text-[10px] focus:outline-none focus:border-neutral-400 bg-[#FCFCFC]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingCampaign}
                    className="w-full py-2 bg-neutral-900 text-white font-mono text-[10px] uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                  >
                    Deploy Marketing Pixel
                  </button>
                </form>
              </div>

              {/* Right List & Performance Metrics */}
              <div className="lg:col-span-2 space-y-4 bg-white border border-neutral-200 p-5">
                <h3 className="font-display font-semibold text-xs uppercase tracking-widest text-neutral-900 border-b border-neutral-150 pb-2">
                  Social Target Ad Integrations & Performance Indices
                </h3>

                <div className="space-y-4">
                  {campaigns.map(camp => {
                    const ctr = camp.clicks > 0 ? ((camp.conversions / camp.clicks) * 100).toFixed(2) : '0';
                    const roas = camp.spent > 0 ? ((camp.conversions * 45) / camp.spent).toFixed(2) : '0';
                    
                    return (
                      <div key={camp.id} className="border border-neutral-150 p-4 space-y-3 font-mono text-[10px]">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-neutral-900 text-xs uppercase">{camp.name}</span>
                              <span className={`px-2 py-0.5 text-[8px] border uppercase ${
                                camp.platform === 'tiktok' ? 'bg-black text-white border-black' :
                                camp.platform === 'instagram' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' :
                                camp.platform === 'facebook' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-sky-50 text-sky-700 border-sky-200'
                              }`}>
                                {camp.platform}
                              </span>
                            </div>
                            <div className="text-[9px] text-neutral-400 mt-1">Launched: {new Date(camp.createdAt).toLocaleDateString()}</div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-[9px] uppercase text-neutral-400">Ad Pixel:</span>
                            <button
                              onClick={() => handleToggleCampaign(camp.id, camp.status)}
                              className={`px-2 py-1 flex items-center space-x-1 border ${
                                camp.status === 'active' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                              }`}
                            >
                              {camp.status === 'active' ? (
                                <>
                                  <Play className="w-2.5 h-2.5 fill-emerald-700 text-emerald-700" />
                                  <span>ACTIVE</span>
                                </>
                              ) : (
                                <>
                                  <Pause className="w-2.5 h-2.5 fill-neutral-500 text-neutral-500" />
                                  <span>PAUSED</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Metrics Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3 border border-neutral-100 text-[10px]">
                          <div>
                            <div className="text-[8px] text-neutral-400 uppercase">Spend / Budget</div>
                            <div className="font-bold text-neutral-800">${camp.spent} / ${camp.budget}</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-neutral-400 uppercase">Leads & Click-throughs</div>
                            <div className="font-bold text-neutral-800">{camp.clicks} clicks</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-neutral-400 uppercase">Target CTR</div>
                            <div className="font-bold text-neutral-800">{ctr}%</div>
                          </div>
                          <div>
                            <div className="text-[8px] text-neutral-400 uppercase">Simulated ROAS</div>
                            <div className="font-bold text-neutral-900">{roas}x return</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-neutral-900 border-b border-neutral-200 pb-2">
              Granular Identity Controls & User Permissions
            </h3>

            <div className="space-y-4">
              {usersList.map(usr => (
                <div key={usr.id} className="bg-white border border-neutral-200 p-5 shadow-xs space-y-4 font-mono text-[10px]">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-100 pb-3 gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-neutral-950 font-sans">{usr.name}</span>
                        <span className={`px-2 py-0.5 text-[8px] border uppercase ${
                          usr.role === 'admin' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                        }`}>
                          {usr.role}
                        </span>
                      </div>
                      <div className="text-[9px] text-neutral-400 mt-1">Registered ID: {usr.id} • Contact: {usr.email}</div>
                    </div>

                    <button
                      onClick={() => handleRoleToggle(usr.id, usr.role)}
                      className="px-2.5 py-1 border border-neutral-200 text-[9px] uppercase font-bold hover:border-neutral-400 bg-white"
                    >
                      Demote to {usr.role === 'admin' ? 'Customer' : 'Admin'}
                    </button>
                  </div>

                  {usr.role === 'admin' ? (
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Admin Granular Permissions Flags</span>
                      <div className="flex flex-wrap gap-4">
                        {availablePermissions.map(perm => {
                          const hasPerm = usr.permissions.includes(perm);
                          return (
                            <label key={perm} className="flex items-center space-x-1.5 cursor-pointer text-neutral-700">
                              <input
                                type="checkbox"
                                checked={hasPerm}
                                onChange={() => handlePermissionToggle(usr.id, perm, hasPerm)}
                                className="rounded-none border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                              />
                              <span className="uppercase text-[9px]">{perm.replace('_', ' ')}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-neutral-400 italic text-[9px]">
                      Customer Account. Primary scope is limited to cart operations, checkout, and personal order tracking.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ai-insights' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-neutral-950 animate-pulse" />
                <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-neutral-900">
                  Google Gemini Strategic Advising Report
                </h3>
              </div>

              <button
                onClick={generateReport}
                disabled={isGeneratingReport}
                className="px-3 py-1.5 border border-neutral-900 font-mono text-[10px] uppercase tracking-wider hover:bg-neutral-900 hover:text-white transition-all flex items-center space-x-1.5 disabled:bg-neutral-100 disabled:border-neutral-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingReport ? 'animate-spin' : ''}`} />
                <span>Re-run Analysis</span>
              </button>
            </div>

            {/* Insight report layout */}
            {isGeneratingReport ? (
              <div className="bg-white border border-neutral-200 p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-neutral-100 rounded-full" />
                  <div className="absolute inset-0 border-4 border-neutral-900 rounded-full border-t-transparent animate-spin" />
                  <Sparkles className="w-4 h-4 text-neutral-900 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 animate-pulse">Running Automated Audit Pipeline</p>
                  <p className="font-mono text-xs font-bold text-neutral-800 max-w-md">
                    {['Connecting with server-side Gemini 3.5 AI controller...',
                      'Compiling sales velocity datasets & transactional metadata...',
                      'Running multi-channel ROI regression and market attribution analysis...',
                      'Drafting executive briefing recommendations & supply milestones...'][reassuringStep]}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 shadow-sm overflow-hidden">
                {/* Source marker banner */}
                <div className="px-4 py-2 bg-neutral-900 text-white font-mono text-[8px] tracking-wider uppercase flex justify-between items-center">
                  <span>
                    Report source: {reportSource === 'ai' ? 'Server-side Google Gemini 3.5 LLM Kernel' : 'Internal Simulated Local Analytics Engine'}
                  </span>
                  <span className="text-emerald-400 font-bold">● ONLINE READY</span>
                </div>

                <div className="p-6 md:p-8 text-neutral-800 font-sans leading-relaxed text-[13px] whitespace-pre-line border-b border-neutral-150">
                  {/* Clean rendered report text */}
                  {reportText}
                </div>

                {/* Actions bottom banner */}
                <div className="px-6 py-4 bg-neutral-50 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                  <div className="font-mono text-[9px] text-neutral-500 max-w-md">
                    Note: This automated advisor runs server-side to inspect orders, marketing spend, and product stocks to formulate actionable optimization plans.
                  </div>

                  <button
                    onClick={handleCopyReport}
                    className="px-4 py-2 bg-neutral-950 text-white font-mono text-[10px] uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Copy Full Report</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Add/Edit Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[1px]" 
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-md w-full bg-white shadow-xl border border-neutral-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-neutral-150 bg-neutral-50 flex items-center justify-between">
                <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-neutral-900">
                  {editingProduct ? `Edit product SKU: ${editingProduct.id}` : 'Register New SKU'}
                </h4>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-950 text-xs font-mono"
                >
                  [X]
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 space-y-4 font-mono text-[10px]">
                <div className="space-y-1">
                  <label className="text-neutral-400 block">PRODUCT SKU NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Keyboard"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-[#FCFCFC] focus:outline-none focus:border-neutral-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 block">SKU DESCRIPTION</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Provide details about size, material..."
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 bg-[#FCFCFC] focus:outline-none focus:border-neutral-400 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-neutral-400 block">UNIT PRICE ($)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="e.g. 129"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 bg-[#FCFCFC] focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-neutral-400 block">SHELF STOCK QUANTITY</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="e.g. 15"
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 bg-[#FCFCFC] focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-neutral-400 block">CATEGORY</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 bg-white text-[10px] focus:outline-none focus:border-neutral-400"
                    >
                      <option value="Workstation">WORKSTATION</option>
                      <option value="Accessories">ACCESSORIES</option>
                      <option value="Power">POWER</option>
                      <option value="Lighting">LIGHTING</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 block">VISUAL IMAGE URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={prodImageUrl}
                      onChange={(e) => setProdImageUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 bg-[#FCFCFC] focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                </div>

                {inventoryError && (
                  <div className="p-2 bg-rose-50 border border-rose-150 text-rose-600">
                    {inventoryError}
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-100 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="flex-1 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                  >
                    COMMIT SKU
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

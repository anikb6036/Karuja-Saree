import React, { useState, useEffect } from 'react';
import { Product, Order, UserProfile, AdCampaign } from './types.js';
import CustomerPanel from './components/CustomerPanel.js';
import AdminPanel from './components/AdminPanel.js';
import LoginPage from './components/LoginPage.js';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Settings, User, Eye, RefreshCw, Layers, LogOut } from 'lucide-react';

export default function App() {
  // Lists and database caches from backend
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Identity Switcher
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Load all backend entities
  const fetchAllData = async () => {
    try {
      const [prodRes, orderRes, campRes, userRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/campaigns'),
        fetch('/api/users')
      ]);

      if (prodRes.ok && orderRes.ok && campRes.ok && userRes.ok) {
        const prods = await prodRes.json();
        const ords = await orderRes.json();
        const camps = await campRes.json();
        const users = await userRes.json();

        setProducts(prods);
        setOrders(ords);
        setCampaigns(camps);
        setUsersList(users);

        // Try to restore user session if present
        const cachedId = localStorage.getItem('karuja_session_user_id');
        if (cachedId && users.length > 0) {
          const matched = users.find((u: UserProfile) => u.id === cachedId);
          if (matched) {
            setCurrentUser(matched);
          }
        }
      }
    } catch (e) {
      console.error('Failed to reload administrative caches', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLogin = (user: UserProfile) => {
    localStorage.setItem('karuja_session_user_id', user.id);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('karuja_session_user_id');
    setCurrentUser(null);
  };

  const handleIdentityChange = (userId: string) => {
    const target = usersList.find(u => u.id === userId);
    if (target) {
      localStorage.setItem('karuja_session_user_id', target.id);
      setCurrentUser(target);
    }
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updated });
      fetchAllData();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center font-mono text-[10px]">
        <div className="space-y-4 text-center">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="uppercase tracking-widest text-neutral-400">Loading full-stack databases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F2]">
      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentUser && currentUser.role === 'admin' ? (
            <motion.div
              key="admin-workspace"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col"
            >
              <AdminPanel
                user={currentUser}
                products={products}
                orders={orders}
                campaigns={campaigns}
                usersList={usersList}
                onRefreshAll={fetchAllData}
                onIdentityChange={handleIdentityChange}
                onLogout={handleLogout}
              />
            </motion.div>
          ) : (
            <motion.div
              key="customer-workspace"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col"
            >
              <CustomerPanel
                user={currentUser}
                products={products}
                orders={orders}
                onUpdateProfile={handleUpdateProfile}
                onRefreshOrders={fetchAllData}
                onRefreshProducts={fetchAllData}
                usersList={usersList}
                onIdentityChange={handleIdentityChange}
                onLogout={handleLogout}
                onRefreshAll={fetchAllData}
                onLoginSuccess={handleLogin}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Minimalist footer */}
      <footer className="bg-[#FCFBF9] border-t border-[#EAE3D5] py-3.5 px-6 flex justify-between items-center font-mono text-[9px] uppercase tracking-wider text-[#A5927A]">
        <div>
          DATABASE ENGINE: <span className="text-[#6B1426] font-bold">ACTIVE HERITAGE DATABASE</span>
        </div>
        <div>
          © 2026 Karuja Sarees Boutique • Heirloom Collection
        </div>
      </footer>
    </div>
  );
}

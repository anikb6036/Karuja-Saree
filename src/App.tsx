import React, { useState, useEffect } from 'react';
import { Product, Order, UserProfile, AdCampaign } from './types.js';
import CustomerPanel from './components/CustomerPanel.js';
import AdminPanel from './components/AdminPanel.js';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Settings, User, Eye, RefreshCw, Layers } from 'lucide-react';

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

        // Auto-select John Doe as the default customer on startup
        if (users.length > 0) {
          const defaultUser = currentUser 
            ? users.find((u: UserProfile) => u.id === currentUser.id) || users[0]
            : users.find((u: UserProfile) => u.id === 'user-customer') || users[0];
          setCurrentUser(defaultUser);
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

  const handleIdentityChange = (userId: string) => {
    const target = usersList.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updated });
      fetchAllData();
    }
  };

  if (isLoading || !currentUser) {
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
    <div className="flex flex-col min-h-screen bg-[#FDFDFD]">
      {/* Universal Workspace Simulator Rail */}
      <div className="bg-neutral-950 text-white border-b border-neutral-900 px-6 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px] font-mono tracking-wider">
        <div className="flex items-center space-x-3">
          <Layers className="w-3.5 h-3.5 text-neutral-400" />
          <div className="uppercase tracking-widest font-bold text-neutral-200">
            MINIMALIST SHOP WORKSPACE SIMULATOR
          </div>
          <span className="hidden sm:inline text-neutral-600">|</span>
          <span className="text-neutral-400 hidden sm:inline uppercase">
            Experience both client and administrator views on a single database
          </span>
        </div>

        {/* Dynamic simulator identity triggers */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-neutral-500 uppercase">ACTIVE ROLE VIEW:</span>
            <select
              value={currentUser.id}
              onChange={(e) => handleIdentityChange(e.target.value)}
              className="bg-neutral-900 text-white border border-neutral-800 text-[10px] uppercase font-bold px-2 py-1 focus:outline-none"
            >
              {usersList.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              fetchAllData();
            }}
            className="flex items-center space-x-1 hover:text-neutral-200 text-neutral-500 transition-colors uppercase font-bold"
            title="Force synchronization"
          >
            <RefreshCw className="w-3 h-3" />
            <span>SYNC</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentUser.role === 'admin' ? (
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
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Minimalist footer */}
      <footer className="bg-white border-t border-neutral-200 py-3.5 px-6 flex justify-between items-center font-mono text-[9px] uppercase tracking-wider text-neutral-400">
        <div>
          DATABASE STATUS: <span className="text-neutral-900 font-bold">SQLITE / SUPABASE ACTIVE</span>
        </div>
        <div>
          © 2026 E-commerce Suite • Fully Responsive
        </div>
      </footer>
    </div>
  );
}

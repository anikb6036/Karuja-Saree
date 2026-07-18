import React, { useState, useEffect } from 'react';
import { Product, Order, OrderItem, PaymentGateway, UserProfile } from '../types.js';
import { 
  Search, ShoppingCart, Check, CreditCard, ChevronRight, 
  MapPin, Phone, User, Package, Clock, ShieldCheck, Star, ArrowRight, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerPanelProps {
  user: UserProfile;
  products: Product[];
  orders: Order[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onRefreshOrders: () => void;
  onRefreshProducts: () => void;
}

export default function CustomerPanel({
  user,
  products,
  orders,
  onUpdateProfile,
  onRefreshOrders,
  onRefreshProducts
}: CustomerPanelProps) {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'shop' | 'orders' | 'profile'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout flow
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [shippingName, setShippingName] = useState(user.name);
  const [shippingAddress, setShippingAddress] = useState(user.address);
  const [shippingPhone, setShippingPhone] = useState(user.phone);
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Notifications/Toasts
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      triggerToast('Item is currently out of stock');
      return;
    }
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        triggerToast(`Only ${product.stock} units available in inventory`);
        return;
      }
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    triggerToast(`Added "${product.name}" to cart`);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;
    const targetProd = products.find(p => p.id === productId);
    if (!targetProd) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter(i => i.product.id !== productId));
    } else if (newQty > targetProd.stock) {
      triggerToast(`Only ${targetProd.stock} units available in inventory`);
    } else {
      setCart(cart.map(i => i.product.id === productId ? { ...i, quantity: newQty } : i));
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError('');
    try {
      const orderItems: OrderItem[] = cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.id,
          customerName: shippingName,
          customerEmail: user.email,
          items: orderItems,
          total: cartTotal,
          paymentGateway,
          shippingAddress,
          shippingPhone
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Checkout process failed.');
      }

      setRecentOrder(data);
      setCart([]);
      setCheckoutStep('success');
      onRefreshOrders();
      onRefreshProducts();
      triggerToast('Order placed successfully!');
    } catch (e: any) {
      setCheckoutError(e.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Sync profile details with local state on load
  useEffect(() => {
    setShippingName(user.name);
    setShippingAddress(user.address);
    setShippingPhone(user.phone);
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: shippingName,
          address: shippingAddress,
          phone: shippingPhone
        })
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdateProfile(updated);
        triggerToast('Profile updated securely');
      }
    } catch (e) {
      triggerToast('Failed to save profile changes');
    }
  };

  // Get active user's orders
  const userOrders = orders.filter(o => o.customerId === user.id);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] font-sans text-neutral-900 selection:bg-neutral-200">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 bg-neutral-900 text-white text-xs font-mono py-2.5 px-4 tracking-tight shadow-md border border-neutral-800"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Header */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h2 className="font-display font-semibold tracking-tight text-lg text-neutral-900 uppercase">
            Customer Panel
          </h2>
          <nav className="flex space-x-6 text-xs font-mono uppercase tracking-wider text-neutral-400">
            <button 
              onClick={() => { setActiveTab('shop'); setIsCartOpen(false); }}
              className={`hover:text-neutral-900 transition-colors ${activeTab === 'shop' ? 'text-neutral-900 font-medium border-b border-neutral-900 pb-1' : ''}`}
            >
              Shop Catalog
            </button>
            <button 
              onClick={() => { setActiveTab('orders'); setIsCartOpen(false); }}
              className={`hover:text-neutral-900 transition-colors relative ${activeTab === 'orders' ? 'text-neutral-900 font-medium border-b border-neutral-900 pb-1' : ''}`}
            >
              Order Tracker
              {userOrders.some(o => o.shippingStatus !== 'delivered') && (
                <span className="absolute -top-1.5 -right-2.5 w-1.5 h-1.5 bg-neutral-900 rounded-full" />
              )}
            </button>
            <button 
              onClick={() => { setActiveTab('profile'); setIsCartOpen(false); }}
              className={`hover:text-neutral-900 transition-colors ${activeTab === 'profile' ? 'text-neutral-900 font-medium border-b border-neutral-900 pb-1' : ''}`}
            >
              My Profile
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right font-mono text-[10px] text-neutral-500">
            <div>Signed in as</div>
            <div className="text-neutral-900 font-medium">{user.name}</div>
          </div>
          <button 
            onClick={() => {
              setIsCartOpen(true);
              setCheckoutStep('cart');
            }}
            className="relative p-2 border border-neutral-200 rounded-none hover:bg-neutral-50 transition-colors"
          >
            <ShoppingCart className="w-4 h-4 text-neutral-700" />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-neutral-900 text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6">
        {activeTab === 'shop' && (
          <div className="space-y-6">
            {/* Search and Categories bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 font-mono text-[10px] uppercase tracking-wider border transition-all ${
                      selectedCategory === cat 
                        ? 'bg-neutral-900 text-white border-neutral-900' 
                        : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="SEARCH PRODUCTS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-neutral-200 font-mono text-[10px] tracking-wider uppercase focus:outline-none focus:border-neutral-400 bg-white"
                />
              </div>
            </div>

            {/* Product catalog grid */}
            {filteredProducts.length === 0 ? (
              <div className="border border-dashed border-neutral-200 py-16 text-center text-neutral-400 font-mono text-xs">
                NO MINIMALIST PRODUCTS MATCH YOUR CRITERIA
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(prod => (
                  <div 
                    key={prod.id} 
                    className="group border border-neutral-200 bg-white flex flex-col hover:shadow-sm transition-shadow duration-200"
                  >
                    <div 
                      onClick={() => setSelectedProduct(prod)}
                      className="relative aspect-video w-full overflow-hidden bg-neutral-100 cursor-pointer"
                    >
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                      {prod.stock <= 5 && prod.stock > 0 && (
                        <span className="absolute top-2 left-2 bg-neutral-900 text-white text-[8px] font-mono tracking-widest uppercase px-2 py-0.5 border border-neutral-800">
                          Low Stock: {prod.stock} left
                        </span>
                      )}
                      {prod.stock === 0 && (
                        <span className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center font-mono text-[10px] font-bold tracking-widest text-neutral-800 uppercase">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">{prod.category}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-2.5 h-2.5 fill-neutral-900 text-neutral-900" />
                            <span className="text-[10px] font-mono font-medium">{prod.rating}</span>
                          </div>
                        </div>
                        <h3 
                          onClick={() => setSelectedProduct(prod)}
                          className="font-display font-medium text-sm text-neutral-950 hover:underline cursor-pointer tracking-tight"
                        >
                          {prod.name}
                        </h3>
                        <p className="text-neutral-500 text-[11px] line-clamp-2 leading-relaxed">
                          {prod.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                        <span className="font-mono text-xs font-semibold text-neutral-900">${prod.price}.00</span>
                        <button
                          onClick={() => addToCart(prod)}
                          disabled={prod.stock === 0}
                          className="px-3 py-1.5 border border-neutral-900 text-neutral-900 text-[9px] font-mono tracking-wider uppercase hover:bg-neutral-900 hover:text-white transition-all disabled:border-neutral-200 disabled:text-neutral-400 disabled:hover:bg-transparent"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <h3 className="font-display font-semibold text-sm uppercase tracking-widest border-b border-neutral-200 pb-2">
              My Orders & Live Shipping Status
            </h3>

            {userOrders.length === 0 ? (
              <div className="border border-dashed border-neutral-200 py-16 text-center text-neutral-400 font-mono text-xs bg-white">
                YOU HAVE PLACED NO PAST ORDERS YET
              </div>
            ) : (
              <div className="space-y-6">
                {userOrders.map(order => (
                  <div key={order.id} className="border border-neutral-200 bg-white p-5 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-100 pb-3 gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-neutral-900 uppercase">Order #{order.id}</span>
                          <span className={`px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest ${
                            order.shippingStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            order.shippingStatus === 'shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            order.shippingStatus === 'processing' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-neutral-50 text-neutral-600 border border-neutral-200'
                          }`}>
                            {order.shippingStatus}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400 mt-1">
                          Placed on: {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right sm:text-right">
                        <div className="font-mono text-xs font-bold text-neutral-950">${order.total}.00</div>
                        <div className="text-[9px] font-mono text-neutral-400 mt-0.5">Payment via: {order.paymentGateway.replace('_', ' ').toUpperCase()}</div>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] font-mono text-neutral-600">
                          <span>{item.name} <span className="text-neutral-400">x{item.quantity}</span></span>
                          <span>${item.price * item.quantity}.00</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery summary */}
                    <div className="pt-3 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-neutral-500">
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-400">Shipping Destination</div>
                        <div className="font-medium text-neutral-800 mt-0.5 flex items-start space-x-1">
                          <MapPin className="w-3 h-3 text-neutral-400 shrink-0 mt-0.5" />
                          <span>{order.shippingAddress}</span>
                        </div>
                      </div>
                      {order.trackingNumber && (
                        <div>
                          <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-400">Express Waybill / Tracking</div>
                          <div className="font-mono font-medium text-neutral-900 mt-0.5 flex items-center space-x-1.5">
                            <Package className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{order.trackingNumber}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress tracker */}
                    <div className="pt-3 border-t border-neutral-100">
                      <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-400 mb-3">Shipping Milestones</div>
                      
                      <div className="relative pl-4 space-y-3.5 border-l border-neutral-200">
                        {order.notifications.map((notif, nIdx) => (
                          <div key={nIdx} className="relative flex items-start text-[10px] text-neutral-600">
                            <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-neutral-950" />
                            <p className="font-mono">{notif}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-md mx-auto space-y-6">
            <h3 className="font-display font-semibold text-sm uppercase tracking-widest border-b border-neutral-200 pb-2">
              My Profile Details
            </h3>

            <form onSubmit={handleProfileSave} className="bg-white border border-neutral-200 p-6 space-y-4 shadow-xs">
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-400">Account Role Status</label>
                <div className="px-3 py-2 bg-neutral-50 border border-neutral-200 font-mono text-[10px] uppercase tracking-wider text-neutral-600 flex items-center justify-between">
                  <span>{user.role} Account</span>
                  <span className="text-emerald-600 font-bold">● Synchronized</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-400">Primary Contact Name</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-neutral-200 font-mono text-[10px] tracking-wider uppercase focus:outline-none focus:border-neutral-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-400">Delivery Mobile Phone</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-neutral-200 font-mono text-[10px] tracking-wider focus:outline-none focus:border-neutral-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-400">Default Shipping Address</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                  <textarea
                    required
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-neutral-200 font-mono text-[10px] tracking-wider focus:outline-none focus:border-neutral-400 resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-neutral-900 text-white font-mono text-[10px] uppercase tracking-wider hover:bg-neutral-800 transition-colors"
              >
                Secure Save Profile Changes
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Slide-out persistent Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[1px]" 
            />

            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col border-l border-neutral-200">
              {/* Header */}
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-4 h-4 text-neutral-800" />
                  <h3 className="font-display font-semibold uppercase text-xs tracking-wider">Your Shopping Bag</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-900 text-xs font-mono"
                >
                  [CLOSE]
                </button>
              </div>

              {/* Progress Stepper in Drawer */}
              {checkoutStep !== 'success' && (
                <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-100 flex justify-between font-mono text-[8px] tracking-wider text-neutral-400">
                  <span className={checkoutStep === 'cart' ? 'text-neutral-900 font-bold' : ''}>1. BAG</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className={checkoutStep === 'shipping' ? 'text-neutral-900 font-bold' : ''}>2. SHIPPING</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className={checkoutStep === 'payment' ? 'text-neutral-900 font-bold' : ''}>3. GATEWAY</span>
                </div>
              )}

              {/* Content body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {checkoutStep === 'cart' && (
                  <>
                    {cart.length === 0 ? (
                      <div className="h-48 flex flex-col items-center justify-center text-center space-y-2 text-neutral-400 font-mono text-xs">
                        <span>YOUR SHOPPING BAG IS EMPTY</span>
                        <button 
                          onClick={() => setIsCartOpen(false)}
                          className="text-neutral-900 underline uppercase text-[10px]"
                        >
                          Discover workspace tech
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map(item => (
                          <div key={item.product.id} className="flex space-x-3 pb-3 border-b border-neutral-100">
                            <div className="w-16 h-12 bg-neutral-100 shrink-0 border border-neutral-150">
                              <img src={item.product.imageUrl} alt={item.product.name} referrerPolicy="no-referrer" className="object-cover w-full h-full" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-display font-medium text-xs text-neutral-900 truncate">{item.product.name}</h4>
                              <div className="font-mono text-[10px] text-neutral-400 mt-0.5">${item.product.price}.00</div>
                              
                              <div className="flex items-center space-x-2 mt-2">
                                <button 
                                  onClick={() => updateCartQuantity(item.product.id, -1)}
                                  className="w-5 h-5 border border-neutral-200 text-xs font-mono flex items-center justify-center hover:bg-neutral-50"
                                >
                                  -
                                </button>
                                <span className="font-mono text-xs font-semibold w-6 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => updateCartQuantity(item.product.id, 1)}
                                  className="w-5 h-5 border border-neutral-200 text-xs font-mono flex items-center justify-center hover:bg-neutral-50"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {checkoutStep === 'shipping' && (
                  <div className="space-y-4">
                    <h4 className="font-display font-medium text-xs uppercase tracking-wider">Confirm Shipping Delivery</h4>
                    
                    <div className="space-y-3 font-mono text-[10px]">
                      <div className="space-y-1">
                        <label className="text-neutral-400 block">RECIPIENT NAME</label>
                        <input 
                          type="text" 
                          required
                          value={shippingName} 
                          onChange={(e) => setShippingName(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-200" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400 block">CONTACT MOBILE PHONE</label>
                        <input 
                          type="text" 
                          required
                          value={shippingPhone} 
                          onChange={(e) => setShippingPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-200" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-neutral-400 block">PHYSICAL DELIVERY ADDRESS</label>
                        <textarea 
                          required
                          rows={3}
                          value={shippingAddress} 
                          onChange={(e) => setShippingAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-200 resize-none" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {checkoutStep === 'payment' && (
                  <div className="space-y-4">
                    <h4 className="font-display font-medium text-xs uppercase tracking-wider">Select Secure Payment Gateway</h4>
                    
                    {/* Gateway Selectors */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentGateway('credit_card')}
                        className={`p-3 border flex flex-col items-center justify-center text-center space-y-1.5 transition-all ${
                          paymentGateway === 'credit_card' 
                            ? 'border-neutral-900 bg-neutral-900 text-white' 
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="font-mono text-[8px] uppercase tracking-wider font-bold">Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentGateway('paypal')}
                        className={`p-3 border flex flex-col items-center justify-center text-center space-y-1.5 transition-all ${
                          paymentGateway === 'paypal' 
                            ? 'border-neutral-900 bg-neutral-900 text-white' 
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <span className="font-serif italic font-bold text-[13px] lowercase tracking-tighter">Paypal</span>
                        <span className="font-mono text-[8px] uppercase tracking-wider font-bold">PayPal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentGateway('google_pay')}
                        className={`p-3 border flex flex-col items-center justify-center text-center space-y-1.5 transition-all ${
                          paymentGateway === 'google_pay' 
                            ? 'border-neutral-900 bg-neutral-900 text-white' 
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-mono text-[8px] uppercase tracking-wider font-bold">G-Pay</span>
                      </button>
                    </div>

                    {/* Conditional gateway input fields */}
                    {paymentGateway === 'credit_card' && (
                      <div className="space-y-3 font-mono text-[10px] bg-neutral-50 p-3.5 border border-neutral-150">
                        <div className="space-y-1">
                          <label className="text-neutral-400 block">CARD NUMBER</label>
                          <input 
                            type="text" 
                            required
                            placeholder="4111 2222 3333 4444"
                            value={cardNumber} 
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full px-2 py-1.5 border border-neutral-200 bg-white" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-neutral-400 block">EXPIRY DATE</label>
                            <input 
                              type="text" 
                              required
                              placeholder="MM/YY"
                              value={cardExpiry} 
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full px-2 py-1.5 border border-neutral-200 bg-white" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-neutral-400 block">CVV</label>
                            <input 
                              type="password" 
                              required
                              placeholder="123"
                              maxLength={3}
                              value={cardCvv} 
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="w-full px-2 py-1.5 border border-neutral-200 bg-white" 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentGateway === 'paypal' && (
                      <div className="bg-neutral-50 p-4 border border-neutral-150 font-mono text-[10px] text-center text-neutral-500 space-y-2">
                        <p>Simulating integrated PayPal One-Touch Authorization.</p>
                        <p className="text-neutral-800 font-bold">Pre-Authorized as: john.doe@paypal.com</p>
                      </div>
                    )}

                    {paymentGateway === 'google_pay' && (
                      <div className="bg-neutral-50 p-4 border border-neutral-150 font-mono text-[10px] text-center text-neutral-500 space-y-2">
                        <p>Express Google Pay Authorization via secure browser tokens.</p>
                        <p className="text-neutral-800 font-bold">Securely connected with Android Chrome Token</p>
                      </div>
                    )}

                    {checkoutError && (
                      <div className="text-rose-600 font-mono text-[10px] p-2 bg-rose-50 border border-rose-150">
                        {checkoutError}
                      </div>
                    )}
                  </div>
                )}

                {checkoutStep === 'success' && recentOrder && (
                  <div className="space-y-4 py-4 text-center font-mono text-xs">
                    <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-display font-semibold uppercase text-sm tracking-widest text-neutral-900">Checkout Complete</h4>
                      <p className="text-[10px] text-neutral-500">Thank you for your order, {shippingName}.</p>
                    </div>

                    <div className="bg-neutral-50 p-4 border border-neutral-150 text-left space-y-2 text-[10px]">
                      <div>
                        <span className="text-neutral-400">ORDER IDENTIFIER:</span>
                        <div className="font-bold text-neutral-900">#{recentOrder.id}</div>
                      </div>
                      <div>
                        <span className="text-neutral-400">WAYBILL TRACKING CODE:</span>
                        <div className="font-bold text-neutral-900">{recentOrder.trackingNumber}</div>
                      </div>
                      <div>
                        <span className="text-neutral-400">DELIVERY TO:</span>
                        <div className="text-neutral-700">{recentOrder.shippingAddress}</div>
                      </div>
                      <div>
                        <span className="text-neutral-400">ORDER TOTAL AMOUNT:</span>
                        <div className="font-bold text-neutral-900">${recentOrder.total}.00</div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          setActiveTab('orders');
                        }}
                        className="w-full py-2 bg-neutral-900 text-white text-[10px] uppercase tracking-wider hover:bg-neutral-800"
                      >
                        Track Order Delivery
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer footer (Pricing and Next Buttons) */}
              {checkoutStep !== 'success' && cart.length > 0 && (
                <div className="p-4 border-t border-neutral-100 bg-neutral-50 space-y-4">
                  <div className="flex justify-between font-mono text-[11px] font-semibold text-neutral-900">
                    <span>Subtotal Price:</span>
                    <span>${cartTotal}.00</span>
                  </div>

                  <div className="flex space-x-2">
                    {checkoutStep !== 'cart' && (
                      <button
                        onClick={() => {
                          if (checkoutStep === 'shipping') setCheckoutStep('cart');
                          if (checkoutStep === 'payment') setCheckoutStep('shipping');
                        }}
                        className="px-3 border border-neutral-200 hover:border-neutral-400 bg-white"
                      >
                        <ArrowLeft className="w-4 h-4 text-neutral-600" />
                      </button>
                    )}

                    {checkoutStep === 'cart' && (
                      <button
                        onClick={() => setCheckoutStep('shipping')}
                        className="flex-1 py-2.5 bg-neutral-900 text-white font-mono text-[10px] uppercase tracking-wider hover:bg-neutral-800 flex items-center justify-center space-x-1"
                      >
                        <span>Proceed to Shipping</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {checkoutStep === 'shipping' && (
                      <button
                        onClick={() => setCheckoutStep('payment')}
                        className="flex-1 py-2.5 bg-neutral-900 text-white font-mono text-[10px] uppercase tracking-wider hover:bg-neutral-800 flex items-center justify-center space-x-1"
                      >
                        <span>Proceed to Gateway</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {checkoutStep === 'payment' && (
                      <button
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="flex-1 py-2.5 bg-neutral-900 text-white font-mono text-[10px] uppercase tracking-wider hover:bg-neutral-800 flex items-center justify-center space-x-1.5 disabled:bg-neutral-400"
                      >
                        {isCheckingOut ? (
                          <span>Processing simulated payment...</span>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Authorize & Place Order</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Detail Dialog/Drawer */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[1px]" 
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-lg w-full bg-white shadow-xl border border-neutral-200 overflow-hidden"
            >
              <div className="relative aspect-video w-full bg-neutral-100">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} referrerPolicy="no-referrer" className="object-cover w-full h-full" />
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-2 right-2 bg-neutral-900 text-white p-1.5 rounded-none font-mono text-[9px]"
                >
                  [CLOSE]
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">{selectedProduct.category}</span>
                  <h3 className="font-display font-medium text-base text-neutral-950">{selectedProduct.name}</h3>
                </div>

                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  {selectedProduct.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 font-mono text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[9px] uppercase">Stock status</span>
                    <span className="font-semibold text-neutral-900">
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} available in shelf` : 'Out of Stock'}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[9px] uppercase">Price</span>
                    <span className="font-bold text-neutral-900">${selectedProduct.price}.00</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.stock === 0}
                    className="w-full py-2.5 bg-neutral-900 text-white text-[10px] uppercase font-mono tracking-wider hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400"
                  >
                    Add to Shop Bag - ${selectedProduct.price}.00
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

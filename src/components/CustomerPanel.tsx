import React, { useState, useEffect } from 'react';
import { Product, Order, OrderItem, PaymentGateway, UserProfile } from '../types.js';
import { 
  Search, ShoppingCart, Check, CreditCard, ChevronLeft, ChevronRight, ChevronDown,
  MapPin, Phone, User, Package, Clock, ShieldCheck, Star, ArrowRight, ArrowLeft,
  LogOut, RefreshCw, Sparkles, Wind, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import heroBanarasiPalace from '../assets/images/hero_banarasi_palace_1784377238796.jpg';
import heroKanjeevaramPillars from '../assets/images/hero_kanjeevaram_pillars_1784377258053.jpg';
import heroFestiveSarees from '../assets/images/hero_festive_sarees_1784377276495.jpg';
import brandLogo from '../assets/images/karuja_logo_gold_user_1784378098760.jpg';

const heroSlides = [
  {
    id: 1,
    tag: "Festive Heirloom Masterpieces",
    title: "The Royal Banarasi Silk",
    subtitle: "Experience the timeless grace of hand-woven premium gold zari work, crafted for beautiful celebrations.",
    badge: "Special Festive Sale",
    image: heroBanarasiPalace,
    category: "Banarasi Silk",
    cta: "Explore Banarasi"
  },
  {
    id: 2,
    tag: "Bridal & Heritage Curations",
    title: "Splendid Kanjeevaram Silk",
    subtitle: "Exquisite temple borders and pure mulberry silk weaves in stunning royal palettes.",
    badge: "Exclusive Collection",
    image: heroKanjeevaramPillars,
    category: "Kanjeevaram Silk",
    cta: "Explore Kanjeevaram"
  },
  {
    id: 3,
    tag: "Sheer Elegance & Pure Comfort",
    title: "Lightweight Chanderi & Organza",
    subtitle: "Breathable textures, delicate hand-block prints, and contemporary royal aesthetics.",
    badge: "New Season Arrivals",
    image: heroFestiveSarees,
    category: "Chanderi Saree",
    cta: "Explore Lightweight"
  }
];

interface CustomerPanelProps {
  user: UserProfile;
  products: Product[];
  orders: Order[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onRefreshOrders: () => void;
  onRefreshProducts: () => void;
  usersList?: UserProfile[];
  onIdentityChange?: (userId: string) => void;
  onLogout?: () => void;
  onRefreshAll?: () => void;
}

export default function CustomerPanel({
  user,
  products,
  orders,
  onUpdateProfile,
  onRefreshOrders,
  onRefreshProducts,
  usersList = [],
  onIdentityChange,
  onLogout,
  onRefreshAll
}: CustomerPanelProps) {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'shop' | 'orders' | 'profile'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (activeTab !== 'shop' || searchQuery || selectedCategory !== 'All') return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, searchQuery, selectedCategory]);
  
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
    <div className="flex flex-col min-h-screen bg-[#FCF9F5] font-sans text-neutral-900 selection:bg-[#F5EFE6]">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 bg-[#1E110F] text-white text-xs font-mono py-2.5 px-4 tracking-tight shadow-md border border-[#301916]"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b border-[#EAE3D5] sticky top-0 z-40 shadow-sm px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('shop')}>
             <img 
               src={brandLogo} 
               alt="Karuja Brand Logo" 
               className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full border border-[#EAE3D5] shadow-sm bg-[#1E110F]"
             />
             <div className="flex flex-col">
               <h2 className="font-display font-bold tracking-widest text-lg sm:text-xl text-[#1E110F] uppercase leading-none">
                  KARUJA
               </h2>
               <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-[#C5A880] uppercase mt-0.5 font-bold">Heritage Boutique</span>
             </div>
          </div>
          
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="flex w-full rounded-md border border-[#EAE3D5] overflow-hidden focus-within:ring-2 focus-within:ring-[#6B1426] focus-within:border-[#6B1426] transition-shadow">
              <div className="relative">
                <select 
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setActiveTab('shop');
                  }}
                  className="h-full py-2 pl-4 pr-8 bg-[#FCFBF9] border-r border-[#EAE3D5] text-sm text-gray-700 outline-none appearance-none cursor-pointer"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A880] pointer-events-none" />
              </div>
              <input
                type="text"
                placeholder="Find premium heirloom sarees..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveTab('shop');
                }}
                className="w-full px-4 py-2 text-sm outline-none text-[#1E110F]"
              />
              <button className="bg-[#6B1426] hover:bg-[#520e1c] text-white px-6 py-2 transition-colors cursor-pointer flex items-center justify-center">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-[#6B1426] transition-colors cursor-pointer ${activeTab === 'orders' ? 'text-[#6B1426]' : ''}`}
            >
              <Package className="w-5 h-5" />
              <span className="text-[10px] font-medium hidden sm:block">Orders</span>
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-[#6B1426] transition-colors cursor-pointer ${activeTab === 'profile' ? 'text-[#6B1426]' : ''}`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium hidden sm:block">Profile</span>
            </button>
            <button 
              onClick={() => {
                setIsCartOpen(true);
                setCheckoutStep('cart');
              }}
              className="relative flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-[#6B1426] transition-colors cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#6B1426] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium hidden sm:block">Cart</span>
            </button>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-[#6B1426] transition-colors cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-[10px] font-medium hidden sm:block">Logout</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile search bar */}
        <div className="md:hidden mt-3 max-w-7xl mx-auto flex w-full rounded-md border border-[#EAE3D5] overflow-hidden focus-within:ring-2 focus-within:ring-[#6B1426]">
          <input
            type="text"
            placeholder="Find premium heirloom sarees..."
            value={searchQuery}
            onChange={(e) => {
               setSearchQuery(e.target.value);
               setActiveTab('shop');
            }}
            className="w-full px-4 py-2 text-sm outline-none"
          />
          <button className="bg-[#6B1426] text-white px-4 py-2 flex items-center justify-center">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'shop' && (
          <div className="space-y-8 pb-12">
            {/* Hero Auto-sliding Carousel Banner */}
            {!searchQuery && selectedCategory === 'All' && (
              <div className="relative group overflow-hidden rounded-2xl shadow-lg border border-[#EAE3D5] bg-[#1E110F] mt-4 min-h-[380px] sm:min-h-[450px] md:min-h-[520px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full flex flex-col justify-center px-6 sm:px-12 md:px-20 py-8"
                  >
                    {/* Full background image */}
                    <div className="absolute inset-0 w-full h-full">
                      <img 
                        src={heroSlides[currentSlide].image} 
                        alt={heroSlides[currentSlide].title} 
                        className="w-full h-full object-cover object-center"
                      />
                      {/* Dark gradient mask for premium contrast and perfect readability */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/10 md:from-[#1E110F]/95 md:via-[#1E110F]/60 md:to-transparent" />
                    </div>
                    
                    {/* Slide Text Content Overlay */}
                    <div className="relative z-10 max-w-xl md:max-w-2xl space-y-4 sm:space-y-6 text-left flex flex-col items-start">
                      <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md text-[#FAF6F0] text-xs font-semibold uppercase tracking-wider rounded-full shadow-sm border border-white/20">
                        {heroSlides[currentSlide].tag}
                      </span>
                      
                      <div className="space-y-2 md:space-y-3">
                        <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-[#C5A880] uppercase font-bold block">
                          {heroSlides[currentSlide].badge}
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-[#FAF6F0] leading-[1.1] tracking-tight">
                          {heroSlides[currentSlide].title}
                        </h1>
                      </div>
                      
                      <p className="text-gray-200 text-sm sm:text-base md:text-lg max-w-lg leading-relaxed font-sans drop-shadow-sm">
                        {heroSlides[currentSlide].subtitle}
                      </p>
                      
                      <button 
                        onClick={() => setSelectedCategory(heroSlides[currentSlide].category)}
                        className="mt-2 bg-[#C5A880] hover:bg-[#B3966E] text-[#1E110F] px-6 sm:px-8 py-3 rounded-md font-bold transition-all duration-300 transform hover:scale-[1.03] cursor-pointer shadow-md font-display tracking-widest uppercase text-xs"
                      >
                        {heroSlides[currentSlide].cta}
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Left Arrow Button */}
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/20 text-[#FAF6F0] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg cursor-pointer z-20"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Right Arrow Button */}
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/20 text-[#FAF6F0] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg cursor-pointer z-20"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Indicators / Dot navigation */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  {heroSlides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        currentSlide === index ? 'bg-[#C5A880] w-6' : 'bg-gray-400/60 hover:bg-white'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Categories Circle List */}
            {!searchQuery && (
              <div className="py-2 mt-2">
                <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-5 justify-center sm:justify-start">
                  {categories.map(cat => {
                    const iconMap: Record<string, any> = {
                      'All': <Layers className="w-5 h-5" />,
                      'Banarasi Silk': <Sparkles className="w-5 h-5" />,
                      'Kanjeevaram Silk': <Star className="w-5 h-5" />,
                      'Chanderi Saree': <Wind className="w-5 h-5" />,
                      'Organza': <Layers className="w-5 h-5" />,
                      'Jamdani': <Package className="w-5 h-5" />,
                      'Georgette & Chiffon': <Check className="w-5 h-5" />
                    };
                    const Icon = iconMap[cat] || <Package className="w-5 h-5" />;
                    return (
                      <div 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex flex-col items-center cursor-pointer group w-16 sm:w-20 gap-1.5 ${selectedCategory === cat ? 'opacity-100' : 'opacity-75 hover:opacity-100'}`}
                      >
                        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${selectedCategory === cat ? 'bg-[#6B1426] text-white shadow-[#C5A880]/20 shadow-sm ring-2 ring-[#FAF5EC]' : 'bg-white text-gray-500 border border-gray-200 group-hover:border-[#C5A880]/50 group-hover:bg-[#FCF9F5]'}`}>
                          {Icon}
                        </div>
                        <span className="text-[11px] sm:text-xs font-medium text-center text-gray-600 group-hover:text-gray-900 leading-tight line-clamp-2">
                          {cat}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Product Section Title */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mt-8">
              <h3 className="text-xl font-bold text-[#1E110F] flex items-center gap-2">
                <Star className="w-5 h-5 text-[#C5A880] fill-current" />
                {searchQuery ? 'Search Results' : (selectedCategory === 'All' ? 'Heirloom Masterpieces' : selectedCategory)}
              </h3>
              {(searchQuery || selectedCategory !== 'All') && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="text-sm font-medium text-[#6B1426] hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
               <div className="py-20 text-center text-gray-500 bg-white rounded-xl border border-dashed border-[#EAE3D5]">
                 No products match your current selection.
               </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {filteredProducts.map(prod => (
                  <div key={prod.id} className="bg-white rounded-xl border border-[#EAE3D5] overflow-hidden hover:shadow-lg transition-all duration-300 group relative flex flex-col">
                    {/* Wishlist Button */}
                    <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-[#6B1426] hover:bg-white transition-colors shadow-sm opacity-0 group-hover:opacity-100 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </button>
                    
                    {/* Image */}
                    <div 
                      onClick={() => setSelectedProduct(prod)}
                      className="aspect-[4/5] bg-[#FAF7F2] relative cursor-pointer overflow-hidden border-b border-[#EAE3D5]"
                    >
                      <img src={prod.imageUrl} alt={prod.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {prod.stock <= 5 && prod.stock > 0 && (
                        <div className="absolute top-2 left-2 bg-[#6B1426] text-white text-[10px] font-bold px-2 py-1 rounded">
                          Only {prod.stock} left
                        </div>
                      )}
                      {prod.stock === 0 && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="bg-[#1E110F] text-white px-3 py-1 rounded text-xs font-bold">SOLD OUT</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="text-[10px] text-[#C5A880] mb-1 font-semibold tracking-wider uppercase">{prod.category}</div>
                      <h4 
                        onClick={() => setSelectedProduct(prod)}
                        className="font-medium text-gray-900 text-sm mb-2 line-clamp-2 cursor-pointer hover:text-[#6B1426]"
                      >
                        {prod.name}
                      </h4>
                      <div className="mt-auto">
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3.5 h-3.5 fill-[#C5A880] text-[#C5A880]" />
                          <span className="text-xs font-medium text-gray-700">{prod.rating}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1E110F] text-lg">${prod.price}</span>
                          <button 
                            onClick={() => addToCart(prod)}
                            disabled={prod.stock === 0}
                            className="bg-[#FAF7F2] text-[#6B1426] hover:bg-[#6B1426] hover:text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[#EAE3D5]"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
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
            <h3 className="font-display font-medium text-lg uppercase tracking-wider border-b border-[#EAE3D5] pb-2 text-[#1E110F]">
              My Heirloom Orders & Shipping Milestones
            </h3>

            {userOrders.length === 0 ? (
              <div className="border border-dashed border-[#EAE3D5] py-20 text-center text-neutral-400 font-mono text-xs bg-white">
                YOU HAVE PLACED NO PAST ORDERS YET
              </div>
            ) : (
              <div className="space-y-6">
                {userOrders.map(order => (
                  <div key={order.id} className="border border-[#EAE3D5] bg-white p-5 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-100 pb-3 gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-[#1E110F] uppercase">Order #{order.id}</span>
                          <span className={`px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest ${
                            order.shippingStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            order.shippingStatus === 'shipped' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            order.shippingStatus === 'processing' ? 'bg-rose-50 text-[#6B1426] border border-[#6B1426]' :
                            'bg-neutral-50 text-neutral-600 border border-neutral-200'
                          }`}>
                            {order.shippingStatus}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400 mt-1">
                          Placed on: {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="font-mono text-xs font-bold text-[#6B1426]">${order.total}.00</div>
                        <div className="text-[9px] font-mono text-[#A5927A] mt-0.5">Secure Gateway: {order.paymentGateway.replace('_', ' ').toUpperCase()}</div>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] font-mono text-neutral-600">
                          <span>{item.name} <span className="text-neutral-400">x{item.quantity}</span></span>
                          <span className="font-semibold text-neutral-800">${item.price * item.quantity}.00</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery summary */}
                    <div className="pt-3 border-t border-[#F5EFE6] grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-[#A5927A]">
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-wider text-[#A5927A]">Handloom Shipping Destination</div>
                        <div className="font-medium text-neutral-800 mt-0.5 flex items-start space-x-1">
                          <MapPin className="w-3 h-3 text-[#C5A880] shrink-0 mt-0.5" />
                          <span>{order.shippingAddress}</span>
                        </div>
                      </div>
                      {order.trackingNumber && (
                        <div>
                          <div className="font-mono text-[9px] uppercase tracking-wider text-[#A5927A]">Express Waybill Tracking Code</div>
                          <div className="font-mono font-medium text-neutral-900 mt-0.5 flex items-center space-x-1.5">
                            <Package className="w-3.5 h-3.5 text-[#C5A880]" />
                            <span>{order.trackingNumber}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress tracker */}
                    <div className="pt-3 border-t border-[#F5EFE6]">
                      <div className="font-mono text-[9px] uppercase tracking-wider text-[#A5927A] mb-3">Shipping Milestones</div>
                      
                      <div className="relative pl-4 space-y-3.5 border-l border-[#EAE3D5]">
                        {order.notifications.map((notif, nIdx) => (
                          <div key={nIdx} className="relative flex items-start text-[10px] text-neutral-600">
                            <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-[#6B1426]" />
                            <p className="font-mono leading-relaxed">{notif}</p>
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
            <h3 className="font-display font-medium text-lg uppercase tracking-wider border-b border-[#EAE3D5] pb-2 text-[#1E110F]">
              My Patron Profile Details
            </h3>

            <form onSubmit={handleProfileSave} className="bg-white border border-[#EAE3D5] p-6 space-y-4 shadow-sm">
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] uppercase tracking-wider text-[#A5927A]">Account Role Status</label>
                <div className="px-3 py-2 bg-[#FAF7F2] border border-[#EAE3D5] font-mono text-[10px] uppercase tracking-wider text-[#6B1426] flex items-center justify-between">
                  <span>{user.role} Atelier Account</span>
                  <span className="text-[#C5A880] font-bold">● Authenticated</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] uppercase tracking-wider text-[#A5927A]">Primary Contact Name</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-[#EAE3D5] font-mono text-[10px] tracking-wider uppercase focus:outline-none focus:border-[#6B1426] text-neutral-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] uppercase tracking-wider text-[#A5927A]">Delivery Mobile Phone</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-[#EAE3D5] font-mono text-[10px] tracking-wider focus:outline-none focus:border-[#6B1426] text-neutral-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] uppercase tracking-wider text-[#A5927A]">Default Shipping Address</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                  <textarea
                    required
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-[#EAE3D5] font-mono text-[10px] tracking-wider focus:outline-none focus:border-[#6B1426] resize-none text-neutral-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#6B1426] text-white font-mono text-[10px] uppercase tracking-wider hover:bg-[#540F1D] transition-colors cursor-pointer"
              >
                Secure Save Atelier Changes
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

            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col border-l border-[#EAE3D5]">
              {/* Header */}
              <div className="p-4 border-b border-[#FAF7F2] flex items-center justify-between bg-[#FCFBF9]">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-4 h-4 text-[#6B1426]" />
                  <h3 className="font-display font-medium text-sm text-[#1E110F] uppercase tracking-widest">Your Boutique Bag</h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-[#A5927A] hover:text-[#1E110F] text-xs font-mono cursor-pointer"
                >
                  [CLOSE]
                </button>
              </div>

              {/* Progress Stepper in Drawer */}
              {checkoutStep !== 'success' && (
                <div className="bg-[#FAF7F2] px-4 py-2.5 border-b border-[#EAE3D5] flex justify-between font-mono text-[8px] tracking-wider text-neutral-400">
                  <span className={checkoutStep === 'cart' ? 'text-[#6B1426] font-bold' : ''}>1. HEIRLOOMS BAG</span>
                  <ChevronRight className="w-3 h-3 text-[#C5A880]" />
                  <span className={checkoutStep === 'shipping' ? 'text-[#6B1426] font-bold' : ''}>2. SHIPPING</span>
                  <ChevronRight className="w-3 h-3 text-[#C5A880]" />
                  <span className={checkoutStep === 'payment' ? 'text-[#6B1426] font-bold' : ''}>3. SECURE CHECKOUT</span>
                </div>
              )}

              {/* Content body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {checkoutStep === 'cart' && (
                  <>
                    {cart.length === 0 ? (
                      <div className="h-48 flex flex-col items-center justify-center text-center space-y-2 text-neutral-400 font-mono text-xs">
                        <span>YOUR BOUTIQUE BAG IS CURRENTLY EMPTY</span>
                        <button 
                          onClick={() => setIsCartOpen(false)}
                          className="text-[#6B1426] font-bold underline uppercase text-[10px] mt-2 cursor-pointer"
                        >
                          Explore Heirloom Sarees
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
                        <label className="text-[#A5927A] block font-bold">RECIPIENT FULL NAME</label>
                        <input 
                          type="text" 
                          required
                          value={shippingName} 
                          onChange={(e) => setShippingName(e.target.value)}
                          className="w-full px-3 py-2 border border-[#EAE3D5] focus:outline-none focus:border-[#6B1426] text-neutral-800" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#A5927A] block font-bold">CONTACT MOBILE PHONE</label>
                        <input 
                          type="text" 
                          required
                          value={shippingPhone} 
                          onChange={(e) => setShippingPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-[#EAE3D5] focus:outline-none focus:border-[#6B1426] text-neutral-800" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#A5927A] block font-bold">PHYSICAL DELIVERY ADDRESS</label>
                        <textarea 
                          required
                          rows={3}
                          value={shippingAddress} 
                          onChange={(e) => setShippingAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-[#EAE3D5] focus:outline-none focus:border-[#6B1426] resize-none text-neutral-800" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {checkoutStep === 'payment' && (
                  <div className="space-y-4">
                    <h4 className="font-display font-medium text-[#1E110F] text-xs uppercase tracking-wider">Select Secure Payment Gateway</h4>
                    
                    {/* Gateway Selectors */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentGateway('credit_card')}
                        className={`p-3 border flex flex-col items-center justify-center text-center space-y-1.5 transition-all cursor-pointer ${
                          paymentGateway === 'credit_card' 
                            ? 'border-[#6B1426] bg-[#6B1426] text-white' 
                            : 'border-[#EAE3D5] bg-white hover:border-[#6B1426]'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="font-mono text-[8px] uppercase tracking-wider font-bold">Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentGateway('paypal')}
                        className={`p-3 border flex flex-col items-center justify-center text-center space-y-1.5 transition-all cursor-pointer ${
                          paymentGateway === 'paypal' 
                            ? 'border-[#6B1426] bg-[#6B1426] text-white' 
                            : 'border-[#EAE3D5] bg-white hover:border-[#6B1426]'
                        }`}
                      >
                        <span className="font-serif italic font-bold text-[13px] lowercase tracking-tighter">Paypal</span>
                        <span className="font-mono text-[8px] uppercase tracking-wider font-bold">PayPal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentGateway('google_pay')}
                        className={`p-3 border flex flex-col items-center justify-center text-center space-y-1.5 transition-all cursor-pointer ${
                          paymentGateway === 'google_pay' 
                            ? 'border-[#6B1426] bg-[#6B1426] text-white' 
                            : 'border-[#EAE3D5] bg-white hover:border-[#6B1426]'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-mono text-[8px] uppercase tracking-wider font-bold">G-Pay</span>
                      </button>
                    </div>

                    {/* Conditional gateway input fields */}
                    {paymentGateway === 'credit_card' && (
                      <div className="space-y-3 font-mono text-[10px] bg-[#FAF7F2] p-3.5 border border-[#EAE3D5]">
                        <div className="space-y-1">
                          <label className="text-[#A5927A] block font-bold">CARD NUMBER</label>
                          <input 
                            type="text" 
                            required
                            placeholder="4111 2222 3333 4444"
                            value={cardNumber} 
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full px-2 py-1.5 border border-[#EAE3D5] bg-white text-neutral-800 focus:outline-none focus:border-[#6B1426]" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[#A5927A] block font-bold">EXPIRY DATE</label>
                            <input 
                              type="text" 
                              required
                              placeholder="MM/YY"
                              value={cardExpiry} 
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full px-2 py-1.5 border border-[#EAE3D5] bg-white text-neutral-800 focus:outline-none focus:border-[#6B1426]" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[#A5927A] block font-bold">CVV</label>
                            <input 
                              type="password" 
                              required
                              placeholder="123"
                              maxLength={3}
                              value={cardCvv} 
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="w-full px-2 py-1.5 border border-[#EAE3D5] bg-white text-neutral-800 focus:outline-none focus:border-[#6B1426]" 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentGateway === 'paypal' && (
                      <div className="bg-[#FAF7F2] p-4 border border-[#EAE3D5] font-mono text-[10px] text-center text-neutral-500 space-y-2">
                        <p>Simulating integrated PayPal One-Touch Authorization.</p>
                        <p className="text-[#6B1426] font-bold">Pre-Authorized as: john.doe@paypal.com</p>
                      </div>
                    )}

                    {paymentGateway === 'google_pay' && (
                      <div className="bg-[#FAF7F2] p-4 border border-[#EAE3D5] font-mono text-[10px] text-center text-neutral-500 space-y-2">
                        <p>Express Google Pay Authorization via secure browser tokens.</p>
                        <p className="text-[#6B1426] font-bold">Securely connected with Android Chrome Token</p>
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
                    <div className="w-12 h-12 rounded-full bg-[#6B1426] text-white flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6 text-white" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-display font-medium uppercase text-base tracking-widest text-[#1E110F]">Order Confirmed</h4>
                      <p className="text-[10px] text-neutral-500">Thank you for your heirloom order, {shippingName}.</p>
                    </div>

                    <div className="bg-[#FAF7F2] p-4 border border-[#EAE3D5] text-left space-y-2.5 text-[10px]">
                      <div>
                        <span className="text-[#A5927A]">HEIRLOOM CODE:</span>
                        <div className="font-bold text-[#1E110F]">#{recentOrder.id}</div>
                      </div>
                      <div>
                        <span className="text-[#A5927A]">AUTOMATED TRACKING NO:</span>
                        <div className="font-bold text-[#1E110F]">{recentOrder.trackingNumber || 'PENDING ASSIGNMENT'}</div>
                      </div>
                      <div>
                        <span className="text-[#A5927A]">HANDLOOM SHIPPING ADDRESS:</span>
                        <div className="text-neutral-700">{recentOrder.shippingAddress}</div>
                      </div>
                      <div>
                        <span className="text-[#A5927A]">BOUTIQUE TOTAL AMOUNT:</span>
                        <div className="font-bold text-[#6B1426]">${recentOrder.total}.00</div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          setActiveTab('orders');
                        }}
                        className="w-full py-2.5 bg-[#6B1426] text-white text-[10px] uppercase tracking-wider hover:bg-[#540F1D] cursor-pointer"
                      >
                        Track Handwoven Delivery
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer footer (Pricing and Next Buttons) */}
              {checkoutStep !== 'success' && cart.length > 0 && (
                <div className="p-4 border-t border-[#EAE3D5] bg-[#FCFBF9] space-y-4">
                  <div className="flex justify-between font-mono text-[11px] font-semibold text-[#1E110F]">
                    <span>Total Order Value:</span>
                    <span className="text-[#6B1426] font-bold text-xs">${cartTotal}.00</span>
                  </div>

                  <div className="flex space-x-2">
                    {checkoutStep !== 'cart' && (
                      <button
                        onClick={() => {
                          if (checkoutStep === 'shipping') setCheckoutStep('cart');
                          if (checkoutStep === 'payment') setCheckoutStep('shipping');
                        }}
                        className="px-3 border border-[#EAE3D5] hover:border-[#6B1426] bg-white cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4 text-neutral-600" />
                      </button>
                    )}

                    {checkoutStep === 'cart' && (
                      <button
                        onClick={() => setCheckoutStep('shipping')}
                        className="flex-1 py-2.5 bg-[#6B1426] text-white font-mono text-[10px] uppercase tracking-widest hover:bg-[#540F1D] flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>Proceed to Shipping Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {checkoutStep === 'shipping' && (
                      <button
                        onClick={() => setCheckoutStep('payment')}
                        className="flex-1 py-2.5 bg-[#6B1426] text-white font-mono text-[10px] uppercase tracking-wider hover:bg-[#540F1D] flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>Proceed to Secure Gateway</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {checkoutStep === 'payment' && (
                      <button
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="flex-1 py-2.5 bg-[#6B1426] text-white font-mono text-[10px] uppercase tracking-wider hover:bg-[#540F1D] flex items-center justify-center space-x-1.5 disabled:bg-neutral-400 cursor-pointer"
                      >
                        {isCheckingOut ? (
                          <span>Verifying secure escrow funds...</span>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                            <span>Authorize & Buy Saree</span>
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
              className="relative max-w-lg w-full bg-[#FCFBF9] shadow-2xl border border-[#EAE3D5] overflow-hidden"
            >
              <div className="relative aspect-video w-full bg-[#FAF7F2]">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} referrerPolicy="no-referrer" className="object-cover w-full h-full" />
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-3 right-3 bg-[#6B1426] text-white px-3 py-1 text-[9px] uppercase font-mono tracking-widest cursor-pointer hover:bg-[#540F1D]"
                >
                  Close
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-[#A5927A] uppercase tracking-widest font-bold">{selectedProduct.category}</span>
                  <h3 className="font-display font-medium text-lg text-[#1E110F]">{selectedProduct.name}</h3>
                </div>

                <p className="text-neutral-600 font-serif text-xs leading-relaxed italic">
                  {selectedProduct.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-[#EAE3D5] font-mono text-xs">
                  <div>
                    <span className="text-[#A5927A] block text-[9px] uppercase tracking-wider">Heritage Inventory</span>
                    <span className="font-semibold text-neutral-800">
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} looms available` : 'Heirloom fully reserved'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#A5927A] block text-[9px] uppercase tracking-wider">Patron Price</span>
                    <span className="font-bold text-[#6B1426] text-sm">${selectedProduct.price}.00</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.stock === 0}
                    className="w-full py-3 bg-[#6B1426] text-white text-[10px] uppercase font-mono tracking-widest hover:bg-[#540F1D] disabled:bg-neutral-200 disabled:text-neutral-400 cursor-pointer"
                  >
                    Acquire Masterpiece - ${selectedProduct.price}.00
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

import React, { useState } from 'react';
import { UserProfile } from '../types.js';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, User, Phone, MapPin, Sparkles, ShieldCheck, ArrowRight, Eye, Layers } from 'lucide-react';
import brandLogo from '../assets/images/karuja_logo_gold_user_1784378098760.jpg';

interface LoginPageProps {
  usersList: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
  onRefreshUsers: () => Promise<void>;
}

export default function LoginPage({ usersList, onLoginSuccess, onRefreshUsers }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Simulated password
  
  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regRole, setRegRole] = useState<'customer' | 'admin'>('customer');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate and handle login
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim()) {
      setError('Please provide an email address.');
      return;
    }

    const matchedUser = usersList.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matchedUser) {
      setSuccessMsg(`Welcome back, ${matchedUser.name}!`);
      setTimeout(() => {
        onLoginSuccess(matchedUser);
      }, 800);
    } else {
      setError('This email was not found. Please register as a patron under "Become a Patron" first.');
    }
  };

  // Handle register new patron
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!regName.trim() || !regEmail.trim()) {
      setError('Full Name and Email Address are strictly required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail.trim(),
          name: regName.trim(),
          role: regRole,
          phone: regPhone.trim(),
          address: regAddress.trim(),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create your patron profile.');
      }

      const createdUser: UserProfile = await response.json();
      setSuccessMsg(`Patron profile created successfully! Logging you in...`);
      
      // Refresh the main app users list
      await onRefreshUsers();

      setTimeout(() => {
        onLoginSuccess(createdUser);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Sign In helper
  const handleQuickLogin = (userEmail: string) => {
    setError(null);
    const target = usersList.find((u) => u.email === userEmail);
    if (target) {
      setSuccessMsg(`Accessing Atelier as ${target.name}...`);
      setTimeout(() => {
        onLoginSuccess(target);
      }, 600);
    } else {
      setError('Simulated account could not be resolved. Refreshing...');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-stretch overflow-hidden font-sans">
      {/* Left Column: Atmospheric Heritage Saree Visual (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1E110F] overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200" 
          alt="Traditional Weaving Brocade Saree Detail" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          referrerPolicy="no-referrer"
        />
        
        {/* Decorative Overlay Frame */}
        <div className="absolute inset-6 border border-[#C5A880]/30 z-20 pointer-events-none" />
        <div className="absolute inset-8 border border-[#C5A880]/10 z-20 pointer-events-none" />

        <div className="relative z-20 text-center max-w-md space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <img 
              src={brandLogo} 
              alt="Karuja Brand Logo" 
              className="w-16 h-16 object-contain rounded-full border border-[#C5A880]/30 shadow-lg bg-[#1E110F]"
            />
          </motion.div>
          
          <div className="space-y-3">
            <h1 className="font-display text-3xl font-light tracking-[0.25em] text-[#FCF9F5] uppercase">
              Karuja Sarees
            </h1>
            <p className="font-serif italic text-[#C5A880] text-sm tracking-wide">
              Where Royal Heritage Meets Master Artisanship
            </p>
          </div>

          <div className="w-16 h-[1px] bg-[#C5A880]/50 mx-auto" />

          <p className="font-mono text-[10px] text-neutral-300 leading-relaxed tracking-wider uppercase">
            ESTABLISHED IN BANARAS • PRESERVING ANCIENT METALLIC BROCADES AND SHEER SILK WEAVING TRADITIONS FOR GENERATIONS.
          </p>
        </div>
      </div>

      {/* Right Column: Authentication Card Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <div className="absolute top-6 left-6 flex items-center space-x-2 lg:hidden">
          <img 
            src={brandLogo} 
            alt="Karuja Brand Logo" 
            className="w-6 h-6 object-contain rounded-full border border-[#EAE3D5] bg-[#1E110F]"
          />
          <span className="font-display font-semibold tracking-wider text-[#1E110F] text-xs uppercase">
            Karuja Sarees
          </span>
        </div>

        <div className="w-full max-w-md bg-[#FCFBF9] border border-[#EAE3D5] p-8 shadow-xl relative">
          {/* Subtle gold border layout accent */}
          <div className="absolute top-2 left-2 right-2 bottom-2 border border-[#C5A880]/10 pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-1.5 mb-8">
            <h2 className="font-display font-medium text-xl uppercase tracking-widest text-[#1E110F]">
              Atelier Portal
            </h2>
            <p className="font-serif italic text-xs text-[#A5927A]">
              Authenticate to view master drapes & manage orders
            </p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-0 border-b border-[#EAE3D5] mb-6">
            <button
              onClick={() => {
                setActiveTab('signin');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`pb-3 font-mono text-[10px] uppercase tracking-wider text-center border-b transition-all duration-200 cursor-pointer ${
                activeTab === 'signin'
                  ? 'border-[#6B1426] text-[#6B1426] font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Patron Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`pb-3 font-mono text-[10px] uppercase tracking-wider text-center border-b transition-all duration-200 cursor-pointer ${
                activeTab === 'signup'
                  ? 'border-[#6B1426] text-[#6B1426] font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Become a Patron
            </button>
          </div>

          {/* Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-700 border border-red-200 text-[11px] font-mono p-3 mb-5 leading-relaxed"
              >
                {error}
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono p-3 mb-5 leading-relaxed flex items-center space-x-2"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse text-emerald-600" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          {activeTab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4 font-mono text-[10px]">
              <div className="space-y-1">
                <label className="text-[#A5927A] block font-bold">EMAIL ADDRESS</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-neutral-400">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="patron@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#EAE3D5] bg-white text-neutral-800 focus:outline-none focus:border-[#6B1426]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[#A5927A] block font-bold">SECURE PASSCODE (SIMULATED)</label>
                  <span className="text-neutral-400 text-[8px]">ANY KEYWORDS PERMITTED</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-neutral-400">
                    <Eye className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#EAE3D5] bg-white text-neutral-800 focus:outline-none focus:border-[#6B1426]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#6B1426] text-white text-[10px] uppercase tracking-widest hover:bg-[#540F1D] flex items-center justify-center space-x-1.5 cursor-pointer mt-6 transition-all duration-150"
              >
                <span>Enter Boutique Atelier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4 font-mono text-[10px]">
              <div className="space-y-1">
                <label className="text-[#A5927A] block font-bold">PATRON FULL NAME</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-neutral-400">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Empress Maharani"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#EAE3D5] bg-white text-neutral-800 focus:outline-none focus:border-[#6B1426]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#A5927A] block font-bold">EMAIL ADDRESS</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-neutral-400">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="maharani@heritage.in"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#EAE3D5] bg-white text-neutral-800 focus:outline-none focus:border-[#6B1426]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[#A5927A] block font-bold">MOBILE NO (OPTIONAL)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-neutral-400">
                      <Phone className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="+91 99999 12345"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-[#EAE3D5] bg-white text-neutral-800 focus:outline-none focus:border-[#6B1426]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#A5927A] block font-bold">INITIAL ATELIER ROLE</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as 'customer' | 'admin')}
                    className="w-full px-3 py-2 border border-[#EAE3D5] bg-white text-neutral-800 focus:outline-none focus:border-[#6B1426] h-[31.5px]"
                  >
                    <option value="customer">PATRON (CUSTOMER)</option>
                    <option value="admin">DIRECTOR (ADMIN)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#A5927A] block font-bold">PHYSICAL DEPOSIT/SHIPPING ADDRESS</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-neutral-400">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Palace Block C, Chanakyapuri, New Delhi"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#EAE3D5] bg-white text-neutral-800 focus:outline-none focus:border-[#6B1426]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#6B1426] text-white text-[10px] uppercase tracking-widest hover:bg-[#540F1D] flex items-center justify-center space-x-1.5 cursor-pointer mt-6 disabled:bg-neutral-300 transition-all duration-150"
              >
                {isSubmitting ? (
                  <span>Saving Heirloom Account...</span>
                ) : (
                  <>
                    <span>Register Patron Profile</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Sandbox Triggers (Essential for easy preview testing) */}
          <div className="mt-8 pt-6 border-t border-[#EAE3D5]/60">
            <div className="flex items-center space-x-1 mb-3.5 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="text-[9px] font-mono text-[#A5927A] uppercase tracking-wider font-bold">
                Simulated Sandbox Quick-Sign-In
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@example.com')}
                className="p-2.5 border border-[#EAE3D5] bg-white hover:border-[#6B1426] hover:bg-[#FCFBF9] text-left transition-all duration-150 group cursor-pointer"
              >
                <div className="text-[7px] font-mono text-neutral-400 uppercase tracking-widest">
                  Patron Access
                </div>
                <div className="text-[10px] font-mono font-bold text-[#1E110F] group-hover:text-[#6B1426]">
                  John Doe
                </div>
                <div className="text-[8px] font-mono text-neutral-500 overflow-hidden truncate">
                  customer@example.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@example.com')}
                className="p-2.5 border border-[#EAE3D5] bg-white hover:border-[#6B1426] hover:bg-[#FCFBF9] text-left transition-all duration-150 group cursor-pointer"
              >
                <div className="text-[7px] font-mono text-neutral-400 uppercase tracking-widest">
                  Atelier Director
                </div>
                <div className="text-[10px] font-mono font-bold text-[#1E110F] group-hover:text-[#6B1426]">
                  Sarah Jenkins
                </div>
                <div className="text-[8px] font-mono text-neutral-500 overflow-hidden truncate">
                  admin@example.com
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

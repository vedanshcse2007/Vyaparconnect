import React, { useState } from 'react';
import {
  Store,
  User,
  LogIn,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Phone,
  MapPin,
  ShieldCheck,
  Building2,
  Mic,
  Search,
  ChevronRight,
  Clock,
  Briefcase
} from 'lucide-react';
import { CustomerUser, Shop } from '../../types/index.ts';
import { registerShop } from '../../lib/api.ts';

interface LoginPageProps {
  initialTab?: 'customer' | 'retailer';
  shops: Shop[];
  currentShop: Shop;
  currentCustomer: CustomerUser | null;
  onLoginCustomer: (customer: CustomerUser) => void;
  onLoginShop: (shop: Shop) => void;
  onShopRegistered: (newShop: Shop) => void;
  onBackToApp: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialTab = 'customer',
  shops,
  currentShop,
  currentCustomer,
  onLoginCustomer,
  onLoginShop,
  onShopRegistered,
  onBackToApp,
}) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'retailer'>(initialTab);
  const [retailerMode, setRetailerMode] = useState<'login' | 'register'>('login');

  // Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerArea, setCustomerArea] = useState('FC Road');
  const [customerError, setCustomerError] = useState<string | null>(null);

  // Retailer Login State
  const [selectedShopId, setSelectedShopId] = useState<string>(currentShop?.id || shops[0]?.id || 'shop-abc');
  const [retailerPin, setRetailerPin] = useState('1234');
  const [retailerError, setRetailerError] = useState<string | null>(null);

  // Retailer Registration State
  const [newShopName, setNewShopName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newCategory, setNewCategory] = useState('Stationery & Educational Supplies');
  const [newAddress, setNewAddress] = useState('');
  const [newArea, setNewArea] = useState('FC Road');
  const [newPhone, setNewPhone] = useState('');
  const [newUpiId, setNewUpiId] = useState('');
  const [newOpeningHours, setNewOpeningHours] = useState('8:30 AM - 9:30 PM (Open Today)');
  const [isRegistering, setIsRegistering] = useState(false);

  // Pre-configured Demo Customers for 1-click login
  const demoCustomers: CustomerUser[] = [
    {
      id: 'cust-1',
      name: 'Aditya Kulkarni',
      phone: '+91 98221 11223',
      email: 'aditya.k@gmail.com',
      area: 'FC Road',
      savedAt: new Date().toISOString(),
    },
    {
      id: 'cust-2',
      name: 'Sneha More',
      phone: '+91 98222 33445',
      email: 'sneha.more@outlook.com',
      area: 'Deccan',
      savedAt: new Date().toISOString(),
    },
    {
      id: 'cust-3',
      name: 'Pooja Patil',
      phone: '+91 98223 55667',
      email: 'pooja.patil@yahoo.in',
      area: 'Model Colony',
      savedAt: new Date().toISOString(),
    },
  ];

  // Customer Submit Handler
  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setCustomerError('Please enter your full name and mobile number.');
      return;
    }

    const newCustomer: CustomerUser = {
      id: `cust-${Date.now()}`,
      name: customerName.trim(),
      phone: customerPhone.trim(),
      email: customerEmail.trim() || undefined,
      area: customerArea,
      savedAt: new Date().toISOString(),
    };

    onLoginCustomer(newCustomer);
  };

  // Retailer Login Submit
  const handleRetailerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const targetShop = shops.find((s) => s.id === selectedShopId);
    if (!targetShop) {
      setRetailerError('Please select a valid merchant account.');
      return;
    }

    onLoginShop(targetShop);
  };

  // Retailer Register Submit
  const handleRetailerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim() || !newOwnerName.trim() || !newPhone.trim()) {
      setRetailerError('Please fill in shop name, proprietor name, and contact phone.');
      return;
    }

    setIsRegistering(true);
    setRetailerError(null);

    try {
      const createdShop = await registerShop({
        name: newShopName.trim(),
        ownerName: newOwnerName.trim(),
        category: newCategory,
        address: newAddress.trim() || `${newArea}, Pune`,
        area: newArea,
        phone: newPhone.trim(),
        upiId: newUpiId.trim() || `${newPhone.replace(/\D/g, '')}@upi`,
        openingHours: newOpeningHours,
      });

      onShopRegistered(createdShop);
      onLoginShop(createdShop);
    } catch (err: any) {
      setRetailerError(err.message || 'Failed to register shop account.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-5xl mx-auto">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBackToApp}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront (Continue as Guest)</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Centralized Database Active</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Col / Value Proposition Banner (4 cols) */}
        <div className="lg:col-span-4 bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                व
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white leading-tight">
                  VyaparConnect AI
                </h2>
                <p className="text-xs text-emerald-300 font-medium">
                  {activeTab === 'customer' ? 'Customer Portal' : 'Shop Owner Portal'}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-bold text-slate-100 leading-snug">
                {activeTab === 'customer'
                  ? 'Discover real-time inventory in your neighborhood.'
                  : 'Digitize your shop catalogue with multilingual voice.'}
              </h3>

              <div className="space-y-3 text-xs text-slate-300">
                {activeTab === 'customer' ? (
                  <>
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <p>
                        <strong className="text-white">Live Stock Confidence:</strong> Know exactly when stock was confirmed before travelling to the store.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                        <Search className="w-3.5 h-3.5" />
                      </div>
                      <p>
                        <strong className="text-white">Cross-Shop Price Comparison:</strong> Compare listed prices across ABC Stationery, City Books, and Student Corner.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <p>
                        <strong className="text-white">Direct Retailer Connect:</strong> Send product questions and hold requests without commissions.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                        <Mic className="w-3.5 h-3.5" />
                      </div>
                      <p>
                        <strong className="text-white">VyaparVoice AI:</strong> Update stock or record sales in Hindi, Marathi, or English simply by speaking.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <p>
                        <strong className="text-white">Instant Local Discovery:</strong> Confirmed stock updates automatically sync to nearby customer searches.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                      <p>
                        <strong className="text-white">Offline-Resilient Architecture:</strong> Manage inventory and records even if internet or AI services lag.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-6 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Local Commerce
            </span>
            <span>Pune Pilot: FC Road & Deccan</span>
          </div>
        </div>

        {/* Right Col / Authentication Interactive Section (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Dual Role Selector Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('customer');
                  setCustomerError(null);
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'customer'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-emerald-700" />
                <span>Customer (Shopper) Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('retailer');
                  setRetailerError(null);
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'retailer'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Store className="w-4 h-4 text-emerald-400" />
                <span>Shop Owner (Retailer) Login</span>
              </button>
            </div>

            {/* TAB 1: CUSTOMER LOGIN & SIGNUP */}
            {activeTab === 'customer' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Welcome to Local Product Search
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Sign in to track availability, auto-fill inquiries, and save your preferred locality.
                  </p>
                </div>

                {/* 1-Click Demo Profiles */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Quick Test: Pick a Demo Customer Account
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">1-Click Sign In</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {demoCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onLoginCustomer(c)}
                        className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 flex items-center justify-between">
                            <span>{c.name}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{c.area}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                          {c.phone}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="grow border-t border-slate-200"></div>
                  <span className="shrink mx-4 text-[11px] font-semibold text-slate-400 uppercase">
                    Or Enter Your Phone & Area
                  </span>
                  <div className="grow border-t border-slate-200"></div>
                </div>

                {/* Customer Form */}
                <form onSubmit={handleCustomerSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Mobile Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Shopping Locality in Pune
                      </label>
                      <select
                        value={customerArea}
                        onChange={(e) => setCustomerArea(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        <option value="FC Road">FC Road (Fergusson College Rd)</option>
                        <option value="Deccan">Deccan Gymkhana</option>
                        <option value="Model Colony">Model Colony</option>
                        <option value="Shivajinagar">Shivajinagar</option>
                        <option value="Kothrud">Kothrud</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  {customerError && (
                    <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
                      {customerError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In as Customer & Discover Products</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: SHOP OWNER LOGIN & REGISTRATION */}
            {activeTab === 'retailer' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Merchant Operating System
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Access stock controls, record walk-in sales, and trigger VyaparVoice.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setRetailerMode('login')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        retailerMode === 'login'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setRetailerMode('register')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        retailerMode === 'register'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Register Shop
                    </button>
                  </div>
                </div>

                {retailerMode === 'login' ? (
                  <div className="space-y-5">
                    {/* 1-Click Demo Merchants */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                          Participating Demo Stores
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          1-Click Switch & Launch
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {shops.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => onLoginShop(s)}
                            className={`text-left p-3.5 rounded-xl border transition-all group flex flex-col justify-between ${
                              s.id === currentShop?.id
                                ? 'border-emerald-500 bg-emerald-50/50'
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 flex items-center justify-between">
                                <span className="truncate pr-2">{s.name}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 shrink-0" />
                              </div>
                              <div className="text-[11px] text-slate-600 mt-1">
                                Prop. <strong>{s.ownerName}</strong> · {s.area}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {s.category}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[10px]">
                              <span className="text-emerald-700 font-semibold">
                                ⭐ {s.rating} ({s.reviewCount})
                              </span>
                              <span className="font-mono text-slate-500">{s.phone}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="grow border-t border-slate-200"></div>
                      <span className="shrink mx-4 text-[11px] font-semibold text-slate-400 uppercase">
                        Or Login With Store Account
                      </span>
                      <div className="grow border-t border-slate-200"></div>
                    </div>

                    <form onSubmit={handleRetailerLogin} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Select Registered Shop
                        </label>
                        <select
                          value={selectedShopId}
                          onChange={(e) => setSelectedShopId(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        >
                          {shops.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} (Prop. {s.ownerName}) — {s.area}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700">
                            Merchant Security PIN
                          </label>
                          <span className="text-[11px] text-slate-400">Demo PIN: 1234</span>
                        </div>
                        <input
                          type="password"
                          value={retailerPin}
                          onChange={(e) => setRetailerPin(e.target.value)}
                          placeholder="Enter 4-digit PIN"
                          maxLength={6}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 tracking-widest"
                        />
                      </div>

                      {retailerError && (
                        <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
                          {retailerError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Store className="w-4 h-4 text-emerald-400" />
                        <span>Enter Merchant Operating System</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Retailer Registration Form */
                  <form onSubmit={handleRetailerRegister} className="space-y-4 max-h-[52vh] overflow-y-auto pr-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Shop / Store Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newShopName}
                        onChange={(e) => setNewShopName(e.target.value)}
                        placeholder="e.g. Modern Medical & General Store"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Proprietor Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newOwnerName}
                          onChange={(e) => setNewOwnerName(e.target.value)}
                          placeholder="e.g. Sunil Kulkarni"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Retail Category
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                        >
                          <option value="Stationery & Educational Supplies">Stationery & Supplies</option>
                          <option value="Kirana & Daily Provisions">Kirana & Grocery</option>
                          <option value="Books & Fine Arts">Books & Fine Arts</option>
                          <option value="Electronics & Stationery">Electronics</option>
                          <option value="Pharmacy & Healthcare">Pharmacy</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Locality / Market Area
                        </label>
                        <select
                          value={newArea}
                          onChange={(e) => setNewArea(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                        >
                          <option value="FC Road">FC Road</option>
                          <option value="Deccan">Deccan Gymkhana</option>
                          <option value="Model Colony">Model Colony</option>
                          <option value="Shivajinagar">Shivajinagar</option>
                          <option value="Kothrud">Kothrud</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Mobile Phone <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="+91 98220 99887"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Physical Store Address
                      </label>
                      <input
                        type="text"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Shop 12, Ferguson College Gate, FC Road, Pune"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">UPI ID for Payments</label>
                        <input
                          type="text"
                          value={newUpiId}
                          onChange={(e) => setNewUpiId(e.target.value)}
                          placeholder="shop@okaxis"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Store Timings</label>
                        <input
                          type="text"
                          value={newOpeningHours}
                          onChange={(e) => setNewOpeningHours(e.target.value)}
                          placeholder="8:30 AM - 9:30 PM (Open Today)"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    {retailerError && (
                      <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
                        {retailerError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{isRegistering ? 'Registering Store...' : 'Register Shop & Launch Catalogue'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Bottom Security / Trust Guarantee */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Direct connect with real neighborhood shops. No middlemen.</span>
            </div>

            <button
              onClick={onBackToApp}
              className="text-xs text-slate-700 font-semibold hover:underline"
            >
              Continue without signing in →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

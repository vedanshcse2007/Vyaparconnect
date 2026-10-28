import React, { useState } from 'react';
import { X, Store, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';
import { Shop } from '../../types/index.ts';
import { registerShop } from '../../lib/api.ts';

interface ShopAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  shops: Shop[];
  currentShop: Shop;
  onSelectShop: (shop: Shop) => void;
  onShopRegistered: (newShop: Shop) => void;
}

export const ShopAuthModal: React.FC<ShopAuthModalProps> = ({
  isOpen,
  onClose,
  shops,
  currentShop,
  onSelectShop,
  onShopRegistered,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedShopId, setSelectedShopId] = useState<string>(currentShop.id);

  // Registration fields
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [category, setCategory] = useState('Stationery & General Store');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('FC Road');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [openingHours, setOpeningHours] = useState('8:30 AM - 9:30 PM (Open Today)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = shops.find((s) => s.id === selectedShopId);
    if (target) {
      onSelectShop(target);
      onClose();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ownerName.trim() || !phone.trim()) {
      setError('Please fill in shop name, proprietor name, and contact phone.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newShop = await registerShop({
        name: name.trim(),
        ownerName: ownerName.trim(),
        category,
        address: address.trim() || 'Market Yard, Pune',
        area,
        phone: phone.trim(),
        upiId: upiId.trim() || `${phone.replace(/\D/g, '')}@upi`,
        openingHours,
      });

      onShopRegistered(newShop);
      onSelectShop(newShop);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register shop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {mode === 'login' ? 'Merchant Portal Sign In' : 'Register New Local Shop'}
              </h3>
              <p className="text-xs text-slate-500">
                Manage your digital catalogue and live inventory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors border ${
              mode === 'login'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
            }`}
          >
            Existing Merchant Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors border ${
              mode === 'register'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
            }`}
          >
            Register New Shop
          </button>
        </div>

        {/* Body */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Select Store Account
              </label>
              <select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Prop. {s.ownerName}) — {s.area}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Instant Retailer Access</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Log into your dashboard to update stock quantities, record walk-in sales, and respond to customer enquiries.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Enter Shop Dashboard</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5 max-h-[60vh] overflow-y-auto">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Shop Business Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Modern Medical & General Store"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Proprietor Full Name</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Sunil Kulkarni"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                >
                  <option value="Stationery & Educational Supplies">Stationery</option>
                  <option value="Kirana & Daily Provisions">Kirana & Grocery</option>
                  <option value="Books & Fine Arts">Books & Arts</option>
                  <option value="Electronics & Stationery">Electronics</option>
                  <option value="Pharmacy & Healthcare">Pharmacy</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Locality / Area</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                >
                  <option value="FC Road">FC Road</option>
                  <option value="Deccan">Deccan</option>
                  <option value="Model Colony">Model Colony</option>
                  <option value="Shivajinagar">Shivajinagar</option>
                  <option value="Kothrud">Kothrud</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Store Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop 10, Ferguson Gate, Pune"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98220 99887"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="shop@upi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Registering...' : 'Register Shop & Launch Catalogue'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

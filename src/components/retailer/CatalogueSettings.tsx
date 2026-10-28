import React, { useState } from 'react';
import { Save, Store, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Shop } from '../../types/index.ts';

interface CatalogueSettingsProps {
  currentShop: Shop;
  onUpdateShop: (updates: Partial<Shop>) => Promise<void>;
}

export const CatalogueSettings: React.FC<CatalogueSettingsProps> = ({
  currentShop,
  onUpdateShop,
}) => {
  const [name, setName] = useState(currentShop.name);
  const [ownerName, setOwnerName] = useState(currentShop.ownerName);
  const [address, setAddress] = useState(currentShop.address);
  const [phone, setPhone] = useState(currentShop.phone);
  const [upiId, setUpiId] = useState(currentShop.upiId);
  const [openingHours, setOpeningHours] = useState(currentShop.openingHours);
  const [catalogueActive, setCatalogueActive] = useState(currentShop.catalogueActive);
  const [featuredNotice, setFeaturedNotice] = useState(currentShop.featuredNotice || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await onUpdateShop({
        name,
        ownerName,
        address,
        phone,
        upiId,
        openingHours,
        catalogueActive,
        featuredNotice,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Public Catalogue & Store Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure how your business appears to neighborhood customers searching for products.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        {/* Visibility Toggle */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Public Digital Catalogue</h4>
            <p className="text-xs text-slate-500">
              When active, your confirmed inventory is searchable by local customers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCatalogueActive(!catalogueActive)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
              catalogueActive
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {catalogueActive ? 'Active Online' : 'Store Offline'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Shop Business Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Proprietor Name</label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Physical Store Address</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Phone / WhatsApp Number</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">UPI ID for Digital Payments</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Opening Hours</label>
          <input
            type="text"
            value={openingHours}
            onChange={(e) => setOpeningHours(e.target.value)}
            placeholder="e.g. 8:30 AM - 9:30 PM (Open Today)"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Featured Announcement / Promotional Notice
          </label>
          <input
            type="text"
            value={featuredNotice}
            onChange={(e) => setFeaturedNotice(e.target.value)}
            placeholder="e.g. Back to school discount & GST invoice available"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Settings updated successfully!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

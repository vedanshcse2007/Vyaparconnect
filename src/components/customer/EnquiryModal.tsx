import React, { useState } from 'react';
import { X, Send, CheckCircle2, MessageSquare, Store, AlertCircle } from 'lucide-react';
import { CustomerEnquiry, CustomerUser, Product, Shop } from '../../types/index.ts';
import { createEnquiry } from '../../lib/api.ts';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  shop: Shop | null;
  currentCustomer?: CustomerUser | null;
  onOpenLogin?: () => void;
  onEnquiryCreated?: () => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  product,
  shop,
  currentCustomer,
  onOpenLogin,
  onEnquiryCreated,
}) => {
  const [customerName, setCustomerName] = useState(currentCustomer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentCustomer?.phone || '');
  const [message, setMessage] = useState(
    product
      ? `Hello, is "${product.name}" available for pickup today?`
      : 'Hello, I wanted to enquire about product availability and store timings.'
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with currentCustomer when changed
  React.useEffect(() => {
    if (currentCustomer) {
      if (currentCustomer.name) setCustomerName(currentCustomer.name);
      if (currentCustomer.phone) setCustomerPhone(currentCustomer.phone);
    }
  }, [currentCustomer, isOpen]);

  if (!isOpen || !shop) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !message.trim()) {
      setError('Please provide your name and question.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createEnquiry({
        shopId: shop.id,
        productId: product?.id,
        productName: product?.name,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        message: message.trim(),
      });
      setSuccess(true);
      if (onEnquiryCreated) onEnquiryCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to submit enquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Contact Retailer
              </h3>
              <p className="text-xs text-slate-500">
                Direct inquiry to {shop.name}
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

        {/* Form Body */}
        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              Enquiry Sent Successfully!
            </h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
              Your inquiry has been logged in <strong>{shop.name}</strong>'s retailer dashboard. The shop owner can view and reply directly.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSuccess(false);
                  onClose();
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {product && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Inquiring About:
                  </span>
                  <span className="font-bold text-slate-900">{product.name}</span>
                </div>
                <span className="font-bold text-slate-900 tabular-nums">
                  ₹{product.listedPrice}
                </span>
              </div>
            )}

            {currentCustomer ? (
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-center justify-between">
                <span>
                  👤 Submitting as <strong>{currentCustomer.name}</strong> ({currentCustomer.area})
                </span>
                <span className="text-emerald-700 font-semibold">Replies Saved</span>
              </div>
            ) : onOpenLogin ? (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                <span>Have an account? Auto-fill & track retailer replies.</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Sign In
                </button>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Your Full Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh / Sneha Kulkarni"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Mobile / WhatsApp Number <span className="text-slate-400 font-normal">(for SMS/Call reply)</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Message / Question</label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about warranty, colors, discounts, or hold request..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Sending...' : 'Send Enquiry'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

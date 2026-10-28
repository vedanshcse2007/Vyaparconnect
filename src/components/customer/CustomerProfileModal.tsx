import React from 'react';
import { X, User, Phone, MapPin, MessageSquare, CheckCircle2, Clock, LogOut, ArrowRight } from 'lucide-react';
import { CustomerEnquiry, CustomerUser, Shop } from '../../types/index.ts';
import { formatTimeAgo } from '../../lib/timeAgo.ts';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerUser | null;
  enquiries: CustomerEnquiry[];
  shops: Shop[];
  onLogout: () => void;
  onOpenSearch: () => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  customer,
  enquiries,
  shops,
  onLogout,
  onOpenSearch,
}) => {
  if (!isOpen || !customer) return null;

  // Filter enquiries made by this customer by phone or name
  const myEnquiries = enquiries.filter(
    (e) =>
      (customer.phone && e.customerPhone && e.customerPhone.replace(/\D/g, '') === customer.phone.replace(/\D/g, '')) ||
      e.customerName.toLowerCase() === customer.name.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {customer.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{customer.phone}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {customer.area}
                </span>
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

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Status Bar */}
          <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
            <div>
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active Shopper Account</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 mt-0.5">
                Pre-fills product enquiries & filters stock near {customer.area}.
              </p>
            </div>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Customer's Enquiries */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                <span>My Shop Inquiries & Replies ({myEnquiries.length})</span>
              </h4>
              <span className="text-[11px] text-slate-500">Live Status</span>
            </div>

            {myEnquiries.length === 0 ? (
              <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No Inquiries Sent Yet</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  When you inquire about product availability or store holds, merchant responses will appear right here.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenSearch();
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  <span>Search Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myEnquiries.map((enq) => {
                  const shop = shops.find((s) => s.id === enq.shopId);
                  const isReplied = enq.status === 'replied' && Boolean(enq.reply);

                  return (
                    <div
                      key={enq.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-xs text-slate-900">
                            {shop?.name || 'Local Retailer'}
                          </span>
                          {enq.productName && (
                            <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 ml-2 font-medium">
                              {enq.productName}
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isReplied
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isReplied ? '✓ Replied' : 'Pending Response'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px] font-semibold">YOUR QUESTION:</span>
                        "{enq.message}"
                      </div>

                      {isReplied ? (
                        <div className="text-xs bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 text-emerald-950">
                          <span className="text-emerald-800 block text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            RETAILER RESPONSE ({enq.repliedAt ? formatTimeAgo(enq.repliedAt) : 'Recently'}):
                          </span>
                          <p className="mt-0.5 font-medium">{enq.reply}</p>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Sent {formatTimeAgo(enq.timestamp)} · Awaiting shopkeeper response</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

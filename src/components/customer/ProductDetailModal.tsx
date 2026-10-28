import React from 'react';
import { X, CheckCircle2, AlertTriangle, Clock, MapPin, Store, MessageSquare, Phone, ShieldCheck, Share2 } from 'lucide-react';
import { Product, Shop } from '../../types/index.ts';
import { formatTimeAgo, getFreshnessStatus } from '../../lib/timeAgo.ts';

interface ProductDetailModalProps {
  product: Product | null;
  shop: Shop | null;
  comparisons: Product[];
  onClose: () => void;
  onOpenEnquiry: (product: Product, shopId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  shop,
  comparisons,
  onClose,
  onOpenEnquiry,
  onSelectProduct,
}) => {
  if (!product) return null;

  const freshness = getFreshnessStatus(product.lastUpdated, product.isConfirmed, product.stockQuantity);
  const savings = Math.max(0, product.mrp - product.listedPrice);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              <span>{product.category}</span>
              <span>·</span>
              <span className="font-mono text-slate-500">SKU: {product.sku}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Main Price & Availability Box */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500 font-medium">Listed Retail Price</div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                    ₹{product.listedPrice}
                  </span>
                  {product.mrp > product.listedPrice && (
                    <>
                      <span className="text-sm text-slate-400 line-through tabular-nums">
                        MRP ₹{product.mrp}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Save ₹{savings}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Reported Stock badge */}
              <div className="text-right">
                <div className="text-xs text-slate-500 font-medium">Reported Availability</div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${freshness.badgeClass}`}
                  >
                    {freshness.tier === 'recently_confirmed' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : freshness.tier === 'unavailable' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>
                      {freshness.tier === 'unavailable'
                        ? 'Unavailable (Out of Stock)'
                        : freshness.tier === 'recently_confirmed'
                        ? `Available (${product.stockQuantity} ${product.unit})`
                        : 'Needs Confirmation'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Freshness Timestamp & Confidence Indicator */}
            <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Last merchant confirmation: {formatTimeAgo(product.lastUpdated)}</span>
                </div>
                <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                  {freshness.confidenceScore}% Availability Confidence
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <strong>Shopper Recommendation:</strong> {freshness.recommendation}
              </div>
            </div>

            {product.staleReason && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{product.staleReason}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Product Specifications</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Shop Card */}
          {shop && (
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                    Sold By Local Retailer
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    {shop.name}
                  </h4>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                  {shop.distanceKm} km away
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{shop.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{shop.openingHours}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{shop.phone} (Prop. {shop.ownerName})</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>UPI ID: {shop.upiId}</span>
                </div>
              </div>
            </div>
          )}

          {/* Cross-Shop Price Comparison - Prompt example demonstration */}
          {comparisons.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Compare with Other Nearby Shops
                </h3>
                <span className="text-xs text-slate-500">Same / Equivalent Product</span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {comparisons.map((c) => {
                  const cFresh = getFreshnessStatus(c.lastUpdated, c.isConfirmed);
                  return (
                    <div
                      key={c.id}
                      className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-900">
                          {c.shopName}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>Updated {formatTimeAgo(c.lastUpdated)}</span>
                          <span>·</span>
                          <span className={cFresh.tier === 'recently_confirmed' ? 'text-emerald-700' : 'text-amber-700'}>
                            {cFresh.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-bold text-sm text-slate-900 tabular-nums">
                            ₹{c.listedPrice}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {c.isConfirmed ? `${c.stockQuantity} ${c.unit}` : 'Unconfirmed'}
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectProduct(c)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Payment accepted: Cash, UPI (GPay/PhonePe), Counter Pickup
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (shop) {
                  window.location.href = `tel:${shop.phone}`;
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Shop</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenEnquiry(product, product.shopId);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send Enquiry / Reserve Item</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, MapPin, Clock, Phone, MessageSquare, Search, CheckCircle2, AlertTriangle, ShieldCheck, Star } from 'lucide-react';
import { Product, Shop } from '../../types/index.ts';
import { formatTimeAgo, getFreshnessStatus } from '../../lib/timeAgo.ts';

interface ShopProfileModalProps {
  shop: Shop | null;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
  onOpenEnquiry: (product: Product | null, shopId: string) => void;
}

export const ShopProfileModal: React.FC<ShopProfileModalProps> = ({
  shop,
  products,
  onClose,
  onSelectProduct,
  onOpenEnquiry,
}) => {
  const [catalogueQuery, setCatalogueQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!shop) return null;

  const shopProducts = products.filter((p) => p.shopId === shop.id);
  const categories = ['all', ...Array.from(new Set(shopProducts.map((p) => p.category.toLowerCase())))];

  const filteredProducts = shopProducts.filter((p) => {
    if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory) {
      return false;
    }
    if (catalogueQuery.trim()) {
      const q = catalogueQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Hero */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{shop.category}</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white">
              {shop.name}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {shop.address}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {shop.openingHours}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {shop.rating} ({shop.reviewCount} customer reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Store Trust & Quick Action Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <div>
              <span className="text-slate-400">Proprietor:</span>{' '}
              <span className="font-semibold text-slate-800">{shop.ownerName}</span>
            </div>
            <div>
              <span className="text-slate-400">Distance:</span>{' '}
              <span className="font-semibold text-slate-800">{shop.distanceKm} km</span>
            </div>
            <div>
              <span className="text-slate-400">Direct Contact:</span>{' '}
              <span className="font-semibold text-slate-800">{shop.phone}</span>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenEnquiry(null, shop.id);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg transition-colors shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask Shop a Question</span>
          </button>
        </div>

        {/* Digital Catalogue Section */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Public Digital Catalogue ({shopProducts.length} Items Listed)
              </h3>
              <p className="text-xs text-slate-500">
                Inventory levels automatically sync with retailer’s daily transactions
              </p>
            </div>

            {/* In-catalogue search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={catalogueQuery}
                onChange={(e) => setCatalogueQuery(e.target.value)}
                placeholder="Search this shop..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Category Tabs */}
          {categories.length > 2 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                    selectedCategory === c
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Product Items Table/Grid */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No items match your search in this store’s catalogue.
              </div>
            ) : (
              filteredProducts.map((p) => {
                const fresh = getFreshnessStatus(p.lastUpdated, p.isConfirmed);
                return (
                  <div
                    key={p.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{p.name}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${fresh.badgeClass}`}>
                          {fresh.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{p.description}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>Updated {formatTimeAgo(p.lastUpdated)}</span>
                        <span>·</span>
                        <span>Reported Stock: <strong className="text-slate-700">{p.stockQuantity} {p.unit}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-right">
                        <div className="text-base font-bold text-slate-900 tabular-nums">
                          ₹{p.listedPrice}
                        </div>
                        {p.mrp > p.listedPrice && (
                          <div className="text-[10px] text-slate-400 line-through tabular-nums">
                            MRP ₹{p.mrp}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          onSelectProduct(p);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

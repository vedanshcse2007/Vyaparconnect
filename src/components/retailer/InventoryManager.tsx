import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, CheckCircle2, AlertTriangle, ArrowUpDown, Clock } from 'lucide-react';
import { Product, Shop } from '../../types/index.ts';
import { formatTimeAgo, getFreshnessStatus } from '../../lib/timeAgo.ts';

interface InventoryManagerProps {
  currentShop: Shop;
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => Promise<void>;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onOpenAddModal: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  currentShop,
  products,
  onUpdateStock,
  onUpdateProduct,
  onDeleteProduct,
  onOpenAddModal,
}) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const shopProducts = products.filter((p) => p.shopId === currentShop.id);

  const filtered = shopProducts.filter((p) => {
    if (categoryFilter !== 'all' && p.category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const handleStockChange = async (productId: string, delta: number, currentQty: number) => {
    const nextVal = Math.max(0, currentQty + delta);
    setUpdatingId(productId);
    try {
      await onUpdateStock(productId, nextVal);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePriceSave = async (productId: string) => {
    const num = parseFloat(tempPrice);
    if (!isNaN(num) && num >= 0) {
      await onUpdateProduct(productId, { listedPrice: num });
    }
    setEditingPriceId(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Inventory & Digital Catalogue Management
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {shopProducts.length} Items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Confirmed inventory counts flow directly into customer-facing search results in real time.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by title or SKU..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Stationery">Stationery</option>
            <option value="Groceries">Groceries</option>
            <option value="Books">Books</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3.5 px-4">Product & SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Listed Price (₹)</th>
                <th className="py-3.5 px-4 text-center">Stock Quantity</th>
                <th className="py-3.5 px-4">Verification Status</th>
                <th className="py-3.5 px-4 text-center">Public Catalogue</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No products found in this inventory view.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const freshness = getFreshnessStatus(item.lastUpdated, item.isConfirmed);
                  const isLow = item.stockQuantity <= item.minStockThreshold;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          SKU: {item.sku}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {item.category}
                        </span>
                      </td>

                      {/* Price with Inline Edit */}
                      <td className="py-3.5 px-4 text-right">
                        {editingPriceId === item.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              className="w-16 px-1.5 py-0.5 text-right font-bold text-xs border border-emerald-500 rounded bg-emerald-50 focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handlePriceSave(item.id)}
                              className="text-xs px-2 py-0.5 bg-emerald-700 text-white rounded font-medium"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="group flex items-center justify-end gap-1.5">
                            <span className="font-bold text-slate-900 text-sm tabular-nums">
                              ₹{item.listedPrice}
                            </span>
                            <button
                              onClick={() => {
                                setEditingPriceId(item.id);
                                setTempPrice(item.listedPrice.toString());
                              }}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 transition-opacity"
                              title="Edit price"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 block tabular-nums">
                          MRP ₹{item.mrp}
                        </span>
                      </td>

                      {/* Stock Stepper */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-lg">
                          <button
                            onClick={() => handleStockChange(item.id, -1, item.stockQuantity)}
                            disabled={updatingId === item.id || item.stockQuantity <= 0}
                            className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors shadow-xs disabled:opacity-40"
                          >
                            -
                          </button>

                          <span
                            className={`min-w-10 px-1 font-bold text-sm tabular-nums ${
                              isLow ? 'text-amber-700' : 'text-slate-900'
                            }`}
                          >
                            {item.stockQuantity}
                          </span>

                          <button
                            onClick={() => handleStockChange(item.id, 1, item.stockQuantity)}
                            disabled={updatingId === item.id}
                            className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors shadow-xs disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {item.unit}
                        </span>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatTimeAgo(item.lastUpdated)}</span>
                        </div>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded ${freshness.badgeClass}`}
                        >
                          {freshness.label}
                        </span>
                      </td>

                      {/* Public Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onUpdateProduct(item.id, { isPublic: !item.isPublic })}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                            item.isPublic
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.isPublic ? 'Publicly Listed' : 'Hidden'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              const promptQty = window.prompt(
                                `Set custom stock quantity for ${item.name}:`,
                                item.stockQuantity.toString()
                              );
                              if (promptQty !== null) {
                                const val = parseInt(promptQty, 10);
                                if (!isNaN(val) && val >= 0) {
                                  onUpdateStock(item.id, val);
                                }
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Set exact stock quantity"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${item.name}" from catalogue?`)) {
                                onDeleteProduct(item.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

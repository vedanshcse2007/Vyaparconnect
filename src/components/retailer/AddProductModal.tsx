import React, { useState } from 'react';
import { X, Plus, Package } from 'lucide-react';
import { Shop } from '../../types/index.ts';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentShop: Shop;
  onAddProduct: (data: any) => Promise<void>;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  currentShop,
  onAddProduct,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Stationery');
  const [description, setDescription] = useState('');
  const [listedPrice, setListedPrice] = useState('65');
  const [mrp, setMrp] = useState('75');
  const [stockQuantity, setStockQuantity] = useState('20');
  const [minStockThreshold, setMinStockThreshold] = useState('5');
  const [unit, setUnit] = useState('notebooks');
  const [sku, setSku] = useState('STN-NBK-');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide product name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onAddProduct({
        shopId: currentShop.id,
        shopName: currentShop.name,
        name: name.trim(),
        category,
        description: description.trim() || `${name} in genuine retail packaging.`,
        listedPrice: parseFloat(listedPrice) || 0,
        mrp: parseFloat(mrp) || parseFloat(listedPrice) || 0,
        stockQuantity: parseInt(stockQuantity, 10) || 0,
        minStockThreshold: parseInt(minStockThreshold, 10) || 2,
        unit: unit.trim() || 'pcs',
        sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        isPublic: true,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add product');
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
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Add Product to Catalogue
              </h3>
              <p className="text-xs text-slate-500">
                Adding for {currentShop.name}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Product Title / Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Classmate Long Ruled Notebook (172 Pages)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Stationery">Stationery</option>
                <option value="Books">Books</option>
                <option value="Groceries">Groceries</option>
                <option value="Electronics">Electronics</option>
                <option value="Daily Essentials">Daily Essentials</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Unit of Measurement</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. notebooks, pcs, kg, pack"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Listed Selling Price (₹)</label>
              <input
                type="number"
                required
                min="0"
                step="0.5"
                value={listedPrice}
                onChange={(e) => setListedPrice(e.target.value)}
                placeholder="65"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">MRP Printed (₹)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                placeholder="75"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Initial Stock Quantity</label>
              <input
                type="number"
                required
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="20"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Min Alert Threshold</label>
              <input
                type="number"
                min="0"
                value={minStockThreshold}
                onChange={(e) => setMinStockThreshold(e.target.value)}
                placeholder="5"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Product Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Features, paper quality, warranty details..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs">
              {error}
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
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Adding...' : 'Add to Catalogue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

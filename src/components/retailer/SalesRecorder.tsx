import React, { useState } from 'react';
import { ShoppingCart, CheckCircle2, IndianRupee, Printer, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, SaleRecord, Shop } from '../../types/index.ts';
import { formatTimeAgo } from '../../lib/timeAgo.ts';

interface SalesRecorderProps {
  currentShop: Shop;
  products: Product[];
  sales: SaleRecord[];
  onRecordSale: (payload: {
    shopId: string;
    productId: string;
    quantity: number;
    paymentMethod: 'cash' | 'upi' | 'khata';
    customerName?: string;
  }) => Promise<void>;
}

export const SalesRecorder: React.FC<SalesRecorderProps> = ({
  currentShop,
  products,
  sales,
  onRecordSale,
}) => {
  const shopProducts = products.filter((p) => p.shopId === currentShop.id);
  const shopSales = sales.filter((s) => s.shopId === currentShop.id);

  const [selectedProductId, setSelectedProductId] = useState<string>(
    shopProducts[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'khata'>('cash');
  const [customerName, setCustomerName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [lastReceipt, setLastReceipt] = useState<SaleRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeProduct = shopProducts.find((p) => p.id === selectedProductId) || shopProducts[0];
  const unitPrice = activeProduct?.listedPrice || 0;
  const totalAmount = unitPrice * quantity;
  const isStockInsufficient = activeProduct ? quantity > activeProduct.stockQuantity : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    if (quantity <= 0) {
      setError('Please enter a quantity greater than zero.');
      return;
    }
    if (isStockInsufficient) {
      setError(`Cannot sell ${quantity} units. Only ${activeProduct.stockQuantity} remaining in stock.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onRecordSale({
        shopId: currentShop.id,
        productId: activeProduct.id,
        quantity,
        paymentMethod,
        customerName: customerName.trim() || undefined,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      setLastReceipt({
        id: `REC-${Date.now().toString().slice(-6)}`,
        shopId: currentShop.id,
        productId: activeProduct.id,
        productName: activeProduct.name,
        quantity,
        unitPrice,
        totalAmount,
        paymentMethod,
        customerName: customerName || 'Walk-in Customer',
        timestamp: new Date().toISOString(),
      });

      // Reset
      setQuantity(1);
      setCustomerName('');
    } catch (err: any) {
      setError(err.message || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            Fast Sales Recorder & Counter POS
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Recorded sales immediately deduct items from the central database and update customer catalogue counts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Today's Transactions:</span>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200 tabular-nums">
            {shopSales.length} Completed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Terminal Form (Left 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-700" />
              <span>Record New Sale</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Over-the-Counter</span>
          </div>

          {/* Quick Select Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Quick Pick Frequent Items:
            </label>
            <div className="flex flex-wrap gap-2">
              {shopProducts.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProductId(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    selectedProductId === p.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span>{p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}</span>
                  <span className="ml-1.5 opacity-80 font-mono">(₹{p.listedPrice})</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Product Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Select Item</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                {shopProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{p.listedPrice} ({p.stockQuantity} {p.unit} in stock)
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity with Stepper and Quick Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Quantity Sold ({activeProduct?.unit || 'units'})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={activeProduct?.stockQuantity || 999}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-3 py-2 text-center bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  {/* Presets: 1, 2, 5 (for demo), 10 */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 5, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuantity(num)}
                        className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                          quantity === num
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Payment Mode</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['cash', 'upi', 'khata'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMethod(mode)}
                      className={`py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
                        paymentMethod === mode
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer name (optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Customer Name / Note <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Kumar / College Student"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Total Summary Strip */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-800 font-medium block">
                  Total Billable Amount
                </span>
                <span className="text-2xl font-extrabold text-emerald-950 tabular-nums">
                  ₹{totalAmount}
                </span>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-500 block">Stock after sale:</span>
                <span
                  className={`font-bold tabular-nums ${
                    isStockInsufficient ? 'text-rose-600' : 'text-emerald-800'
                  }`}
                >
                  {activeProduct ? activeProduct.stockQuantity - quantity : 0} {activeProduct?.unit}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isStockInsufficient}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Recording...' : 'Confirm Sale & Deduct Stock'}</span>
            </button>
          </form>
        </div>

        {/* Right 5 cols: Latest Invoice & Daily Transactions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Latest Receipt Card */}
          {lastReceipt && (
            <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Transaction Successful</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  {lastReceipt.id}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900">{lastReceipt.productName}</div>
                <div className="flex justify-between text-slate-600">
                  <span>Qty: {lastReceipt.quantity} pcs @ ₹{lastReceipt.unitPrice}</span>
                  <span className="font-bold text-slate-900 tabular-nums">₹{lastReceipt.totalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px] pt-1">
                  <span>Payment: <strong className="uppercase">{lastReceipt.paymentMethod}</strong></span>
                  <span>{lastReceipt.customerName}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Central database updated</span>
                <span>{new Date(lastReceipt.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          )}

          {/* Daily Sales Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Today's Recorded Transactions ({shopSales.length})
            </h3>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {shopSales.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No sales recorded yet today.
                </div>
              ) : (
                shopSales.map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{s.productName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span>{s.quantity} pcs</span>
                        <span>·</span>
                        <span className="uppercase font-semibold text-slate-700">{s.paymentMethod}</span>
                        <span>·</span>
                        <span>{formatTimeAgo(s.timestamp)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-slate-900 tabular-nums">
                        ₹{s.totalAmount}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {s.customerName || 'Walk-in'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

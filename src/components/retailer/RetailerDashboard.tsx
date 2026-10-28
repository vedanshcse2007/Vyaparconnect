import React from 'react';
import { IndianRupee, Package, AlertTriangle, MessageSquare, TrendingUp, Plus, Mic, ShoppingCart, CheckCircle2, ArrowRight, Bell } from 'lucide-react';
import { Product, SaleRecord, Shop, ShopStats } from '../../types/index.ts';
import { formatTimeAgo } from '../../lib/timeAgo.ts';

interface RetailerDashboardProps {
  currentShop: Shop;
  shops: Shop[];
  onSelectShop: (shop: Shop) => void;
  stats: ShopStats;
  products: Product[];
  recentSales: SaleRecord[];
  onNavigateTab: (tab: 'dashboard' | 'inventory' | 'sales' | 'voice' | 'settings' | 'enquiries') => void;
  onOpenAddProduct: () => void;
  onOpenDemoTour: () => void;
  onOpenShopAuth?: () => void;
  onQuickRestock: (productId: string, currentQty: number) => void;
  onOpenNotifications?: () => void;
  unreadNotificationCount?: number;
}

export const RetailerDashboard: React.FC<RetailerDashboardProps> = ({
  currentShop,
  shops,
  onSelectShop,
  stats,
  products,
  recentSales,
  onNavigateTab,
  onOpenAddProduct,
  onOpenDemoTour,
  onOpenShopAuth,
  onQuickRestock,
  onOpenNotifications,
  unreadNotificationCount = 0,
}) => {
  const shopProducts = products.filter((p) => p.shopId === currentShop.id);
  const lowStockProducts = shopProducts.filter((p) => p.stockQuantity <= p.minStockThreshold);

  return (
    <div className="space-y-8 pb-16">
      {/* Store Header & Selector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {currentShop.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {currentShop.name}
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Live Storefront Active
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
              <span>Proprietor: <strong>{currentShop.ownerName}</strong></span>
              <span>·</span>
              <span>{currentShop.address}</span>
              <span>·</span>
              <span>UPI: {currentShop.upiId}</span>
            </div>
          </div>
        </div>

        {/* Switch Shop for Multi-Merchant Testing */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Active Store:</span>
          <select
            value={currentShop.id}
            onChange={(e) => {
              const selected = shops.find((s) => s.id === e.target.value);
              if (selected) onSelectShop(selected);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {onOpenShopAuth && (
            <button
              onClick={onOpenShopAuth}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-semibold transition-colors"
            >
              + Register / Switch
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Revenue
            </span>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              ₹{stats.todaySalesAmount}
            </div>
            <span className="text-[11px] text-slate-500">
              {stats.todaySalesCount} transaction{stats.todaySalesCount !== 1 ? 's' : ''} recorded
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        {/* Total SKUs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Catalogue
            </span>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {stats.totalSkus} SKUs
            </div>
            <span className="text-[11px] text-slate-500">
              {stats.totalStockUnits} total stock items
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock Counter */}
        <div
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              Low Stock Alerts
            </span>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {stats.lowStockCount} Items
            </div>
            <span className="text-[11px] text-amber-600 font-medium">
              Below safety threshold
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Customer Enquiries */}
        <div
          onClick={() => onNavigateTab('enquiries')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Customer Enquiries
            </span>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {stats.pendingEnquiries} Pending
            </div>
            <span className="text-[11px] text-slate-500">
              From web storefront
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Fast Action Toolbar */}
      <div className="p-4 bg-slate-900 rounded-2xl text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Daily Retail Counter</div>
            <div className="text-[11px] text-slate-300">
              Instant sales recording automatically updates customer search availability.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('sales')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Record Sale (POS)</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => onNavigateTab('voice')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-xl transition-colors border border-slate-700"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>VyaparVoice Assistant</span>
          </button>

          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold rounded-xl transition-colors border border-emerald-500/40 relative cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-400" />
              <span>Adaptive Alerts</span>
              {unreadNotificationCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-0.5" />
              )}
            </button>
          )}

          <button
            onClick={onOpenDemoTour}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl transition-colors border border-amber-500/30"
          >
            <span>Run Phase 5 Demo</span>
          </button>
        </div>
      </div>

      {/* Split Grid: Low Stock Alert & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Warning Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Low Inventory Alerts ({lowStockProducts.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Manage All Stock
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <span>All products are adequately stocked. Safety thresholds satisfied.</span>
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                    <div className="text-[11px] text-amber-700 font-medium">
                      Only {p.stockQuantity} {p.unit} remaining (Min safe level: {p.minStockThreshold})
                    </div>
                  </div>

                  <button
                    onClick={() => onQuickRestock(p.id, p.stockQuantity)}
                    className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
                  >
                    + Restock (+10)
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Recent Recorded Sales
            </h3>
            <button
              onClick={() => onNavigateTab('sales')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View All Sales
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentSales.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No transactions recorded today yet.
              </div>
            ) : (
              recentSales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{sale.productName}</h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{sale.quantity} pcs</span>
                      <span>·</span>
                      <span className="capitalize font-medium text-slate-700">{sale.paymentMethod}</span>
                      <span>·</span>
                      <span>{formatTimeAgo(sale.timestamp)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-900 tabular-nums">
                      ₹{sale.totalAmount}
                    </div>
                    {sale.customerName && (
                      <span className="text-[10px] text-slate-400">
                        {sale.customerName}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  Settings,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldAlert,
  MessageSquare,
  Package,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { AdaptiveNotification, NotificationPreferences } from '../../types/index.ts';

interface AdaptiveNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AdaptiveNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onActionClick: (notification: AdaptiveNotification) => void;
  preferences: NotificationPreferences;
  onUpdatePreferences: (updates: Partial<NotificationPreferences>) => void;
  onTriggerSimulation: (type: 'low_stock' | 'enquiry' | 'demand_surge' | 'freshness') => void;
}

export const AdaptiveNotificationCenter: React.FC<AdaptiveNotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onActionClick,
  preferences,
  onUpdatePreferences,
  onTriggerSimulation,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'stock' | 'enquiry' | 'settings'>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'stock') return n.category === 'stock_alert' || n.category === 'freshness';
    if (activeTab === 'enquiry') return n.category === 'enquiry';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-in Drawer */}
      <div className="w-full max-w-md bg-[#f9faf7] text-[#20281f] h-full shadow-2xl flex flex-col border-l border-[#e9ece5] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-[#e9ece5] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#eaf0e3] text-[#315e45] flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#20281f]">Adaptive Alerts Center</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#7c8578]">
                Intelligent stock velocity, inquiry routing & freshness monitors
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#7c8578] hover:text-[#20281f] hover:bg-[#f4f6ef] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Quick Actions */}
        <div className="px-4 py-2.5 bg-[#f4f6ef] border-b border-[#e9ece5] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#315e45] text-white shadow-2xs'
                  : 'text-[#596355] hover:text-[#20281f] hover:bg-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-[#315e45] text-white shadow-2xs'
                  : 'text-[#596355] hover:text-[#20281f] hover:bg-white'
              }`}
            >
              Stock
            </button>
            <button
              onClick={() => setActiveTab('enquiry')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'enquiry'
                  ? 'bg-[#315e45] text-white shadow-2xs'
                  : 'text-[#596355] hover:text-[#20281f] hover:bg-white'
              }`}
            >
              Inquiries
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#315e45] text-white shadow-2xs'
                  : 'text-[#596355] hover:text-[#20281f] hover:bg-white'
              }`}
            >
              <Settings className="w-3 h-3" />
              <span>Rules</span>
            </button>
          </div>

          {activeTab !== 'settings' && notifications.length > 0 && (
            <div className="flex items-center gap-2 text-[11px]">
              <button
                onClick={onMarkAllAsRead}
                className="text-[#315e45] font-semibold hover:underline cursor-pointer"
              >
                Mark Read
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={onClearAll}
                className="text-[#7c8578] hover:text-rose-600 font-semibold cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Notification List / Settings Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'settings' ? (
            /* Adaptive Rules & Sensitivity Panel */
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-[#e9ece5] space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#596355] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#315e45]" />
                  <span>Adaptive Alert Triggers</span>
                </h4>

                {/* Toggle 1: Low Stock Velocity */}
                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#f9faf7] transition-colors cursor-pointer">
                  <div>
                    <span className="font-bold text-xs text-[#20281f] block">
                      Low-Stock Depletion Alert
                    </span>
                    <span className="text-[11px] text-[#7c8578] block">
                      Adapts dynamically based on counter sales velocity
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.enableLowStockAlerts}
                    onChange={(e) =>
                      onUpdatePreferences({ enableLowStockAlerts: e.target.checked })
                    }
                    className="w-4 h-4 text-[#315e45] rounded focus:ring-emerald-600 cursor-pointer"
                  />
                </label>

                {/* Threshold Slider */}
                <div className="px-2.5 pt-1 pb-2 border-t border-[#e9ece5]">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#596355] mb-1">
                    <span>Low Stock Safety Threshold:</span>
                    <span className="text-[#315e45] font-bold">
                      ≤ {preferences.stockThreshold} units
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={preferences.stockThreshold}
                    onChange={(e) =>
                      onUpdatePreferences({ stockThreshold: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-[#315e45] cursor-pointer"
                  />
                </div>

                {/* Toggle 2: Customer Enquiries */}
                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#f9faf7] transition-colors cursor-pointer border-t border-[#e9ece5]">
                  <div>
                    <span className="font-bold text-xs text-[#20281f] block">
                      Customer Price & Stock Inquiries
                    </span>
                    <span className="text-[11px] text-[#7c8578] block">
                      Immediate routing with one-tap quick replies
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.enableCustomerEnquiries}
                    onChange={(e) =>
                      onUpdatePreferences({ enableCustomerEnquiries: e.target.checked })
                    }
                    className="w-4 h-4 text-[#315e45] rounded focus:ring-emerald-600 cursor-pointer"
                  />
                </label>

                {/* Toggle 3: Freshness Ratings */}
                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#f9faf7] transition-colors cursor-pointer border-t border-[#e9ece5]">
                  <div>
                    <span className="font-bold text-xs text-[#20281f] block">
                      Inventory Stale Warning (&gt;24 hrs)
                    </span>
                    <span className="text-[11px] text-[#7c8578] block">
                      Prompts re-verification to maintain 98% trust badge
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.enableFreshnessWarnings}
                    onChange={(e) =>
                      onUpdatePreferences({ enableFreshnessWarnings: e.target.checked })
                    }
                    className="w-4 h-4 text-[#315e45] rounded focus:ring-emerald-600 cursor-pointer"
                  />
                </label>

                {/* Toggle 4: Sound Alerts */}
                <label className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#f9faf7] transition-colors cursor-pointer border-t border-[#e9ece5]">
                  <div className="flex items-center gap-2">
                    {preferences.enableSound ? (
                      <Volume2 className="w-4 h-4 text-[#315e45]" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                    <div>
                      <span className="font-bold text-xs text-[#20281f] block">
                        Gentle Chime Sound
                      </span>
                      <span className="text-[11px] text-[#7c8578] block">
                        Pleasant Web Audio API synthetic tone
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.enableSound}
                    onChange={(e) => onUpdatePreferences({ enableSound: e.target.checked })}
                    className="w-4 h-4 text-[#315e45] rounded focus:ring-emerald-600 cursor-pointer"
                  />
                </label>
              </div>

              {/* Live Adaptive Simulation Box */}
              <div className="p-4 bg-[#f4f6ef] rounded-2xl border border-[#e1e7da] space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#20281f]">
                  <Sparkles className="w-4 h-4 text-[#315e45]" />
                  <span>Test Adaptive Notification Scenarios</span>
                </div>
                <p className="text-[11px] text-[#7c8578]">
                  Trigger simulated events to inspect how priority, badges, and one-tap actions adapt dynamically:
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onTriggerSimulation('low_stock')}
                    className="p-2.5 bg-white hover:bg-[#edf3e8] border border-[#e1e7da] rounded-xl text-left text-xs font-bold text-[#20281f] transition-colors cursor-pointer"
                  >
                    ⚠️ Low Stock Velocity
                  </button>
                  <button
                    type="button"
                    onClick={() => onTriggerSimulation('enquiry')}
                    className="p-2.5 bg-white hover:bg-[#edf3e8] border border-[#e1e7da] rounded-xl text-left text-xs font-bold text-[#20281f] transition-colors cursor-pointer"
                  >
                    💬 Urgent Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => onTriggerSimulation('demand_surge')}
                    className="p-2.5 bg-white hover:bg-[#edf3e8] border border-[#e1e7da] rounded-xl text-left text-xs font-bold text-[#20281f] transition-colors cursor-pointer"
                  >
                    📈 Local Demand Surge
                  </button>
                  <button
                    type="button"
                    onClick={() => onTriggerSimulation('freshness')}
                    className="p-2.5 bg-white hover:bg-[#edf3e8] border border-[#e1e7da] rounded-xl text-left text-xs font-bold text-[#20281f] transition-colors cursor-pointer"
                  >
                    🕒 Stale Badge Alert
                  </button>
                </div>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#eaf0e3] text-[#315e45] mx-auto flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#20281f]">All Quiet & Up to Date</h4>
              <p className="text-xs text-[#7c8578] max-w-xs mx-auto">
                No active inventory alerts or pending inquiries right now. Adaptive monitors are running in the background.
              </p>
              <button
                type="button"
                onClick={() => onTriggerSimulation('low_stock')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f4f6ef] text-[#315e45] border border-[#e1e7da] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Adaptive Alert</span>
              </button>
            </div>
          ) : (
            /* Notification Cards */
            filteredNotifications.map((n) => {
              const isCritical = n.priority === 'critical';
              const isHigh = n.priority === 'high';

              return (
                <div
                  key={n.id}
                  onClick={() => onMarkAsRead(n.id)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    !n.read
                      ? isCritical
                        ? 'bg-rose-50/80 border-rose-300 shadow-xs'
                        : isHigh
                        ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                        : 'bg-white border-[#8ca780] shadow-xs'
                      : 'bg-white border-[#e9ece5] opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white ${
                          isCritical
                            ? 'bg-rose-600'
                            : isHigh
                            ? 'bg-amber-600'
                            : 'bg-[#315e45]'
                        }`}
                      >
                        {isCritical ? (
                          <AlertCircle className="w-3.5 h-3.5" />
                        ) : n.category === 'enquiry' ? (
                          <MessageSquare className="w-3.5 h-3.5" />
                        ) : n.category === 'demand_spike' ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <Package className="w-3.5 h-3.5" />
                        )}
                      </span>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                              isCritical
                                ? 'bg-rose-200 text-rose-900'
                                : isHigh
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-[#eaf0e3] text-[#315e45]'
                            }`}
                          >
                            {n.priority}
                          </span>

                          {n.adaptiveMetadata?.velocity && (
                            <span className="text-[10px] text-amber-700 font-bold">
                              ⚡ {n.adaptiveMetadata.velocity}
                            </span>
                          )}

                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-[#20281f] mt-0.5">{n.title}</h4>
                      </div>
                    </div>

                    <span className="text-[10px] text-[#8a9186] shrink-0">{n.timestamp}</span>
                  </div>

                  <p className="text-xs text-[#586154] mt-2 leading-relaxed">{n.message}</p>

                  {/* Adaptive Action Button */}
                  {n.action && (
                    <div className="mt-3 pt-2.5 border-t border-[#e9ece5] flex items-center justify-between">
                      <span className="text-[10px] text-[#7c8578]">
                        Suggested adaptive action
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onActionClick(n);
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                          isCritical
                            ? 'bg-rose-700 hover:bg-rose-800 text-white'
                            : 'bg-[#315e45] hover:bg-[#254936] text-white'
                        }`}
                      >
                        <span>{n.action.label}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

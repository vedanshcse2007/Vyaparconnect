import React from 'react';
import { AlertCircle, Bell, Check, Clock, Sparkles, TrendingUp, X } from 'lucide-react';
import { AdaptiveNotification } from '../../types/index.ts';

interface AdaptiveToastContainerProps {
  toasts: AdaptiveNotification[];
  onDismiss: (id: string) => void;
  onActionClick: (notification: AdaptiveNotification) => void;
}

export const AdaptiveToastContainer: React.FC<AdaptiveToastContainerProps> = ({
  toasts,
  onDismiss,
  onActionClick,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isCritical = toast.priority === 'critical';
        const isHigh = toast.priority === 'high';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-8 ${
              isCritical
                ? 'bg-rose-950/95 text-rose-50 border-rose-600/60'
                : isHigh
                ? 'bg-[#20281f]/95 text-[#f9faf7] border-amber-500/50'
                : 'bg-[#20281f]/95 text-[#f9faf7] border-[#315e45]/50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    isCritical
                      ? 'bg-rose-500 text-white'
                      : isHigh
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-[#315e45] text-white'
                  }`}
                >
                  {isCritical ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : toast.category === 'demand_spike' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </span>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/20">
                      Adaptive {toast.priority}
                    </span>
                    {toast.adaptiveMetadata?.velocity && (
                      <span className="text-[10px] text-amber-300 font-medium">
                        ⚡ {toast.adaptiveMetadata.velocity}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold mt-0.5 leading-snug">{toast.title}</h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                title="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-white/80 mt-2 leading-relaxed">
              {toast.message}
            </p>

            {toast.action && (
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-white/50">One-tap adaptive action</span>
                <button
                  type="button"
                  onClick={() => onActionClick(toast)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer ${
                    isCritical
                      ? 'bg-rose-500 hover:bg-rose-400 text-white'
                      : 'bg-[#315e45] hover:bg-[#437559] text-white'
                  }`}
                >
                  <span>{toast.action.label}</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

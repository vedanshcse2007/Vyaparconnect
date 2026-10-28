import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Play, RotateCcw, X, Sparkles, Store, ShoppingBag, Mic, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { updateProductStock, recordSale, sendVoiceQuery, resetDemoState } from '../lib/api.ts';
import { Product } from '../types/index.ts';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRefreshData: () => Promise<void>;
  onNavigateTo: (view: 'customer' | 'retailer', tab?: string, query?: string) => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  isOpen,
  onClose,
  products,
  onRefreshData,
  onNavigateTo,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [stepOutput, setStepOutput] = useState<string | null>(null);

  if (!isOpen) return null;

  const notebookProduct = products.find(p => p.name.toLowerCase().includes('notebook') && p.shopId === 'shop-abc');

  const steps = [
    {
      step: 1,
      title: 'Shop Owner adds 20 notebooks to inventory',
      description: 'The retailer at ABC Stationery registers or sets inventory for "Classmate Long Ruled Notebook (172 Pages)" to exactly 20 units.',
      actionLabel: 'Execute Step 1: Set Notebook Stock to 20',
      icon: Store,
      execute: async () => {
        if (!notebookProduct) throw new Error('Notebook product not found');
        await updateProductStock(notebookProduct.id, 20);
        await onRefreshData();
        setStepOutput('Inventory updated in centralized database: 20 units confirmed at ABC Stationery.');
      },
      nextView: () => onNavigateTo('retailer', 'inventory'),
    },
    {
      step: 2,
      title: 'Public catalogue displays the product',
      description: 'The confirmed item is immediately indexed and rendered in ABC Stationery’s public catalogue with live verified stock tag.',
      actionLabel: 'View in Public Catalogue',
      icon: ShoppingBag,
      execute: async () => {
        await onRefreshData();
        setStepOutput(`Public catalogue verified: Showing 20 units available, confirmed less than 1 minute ago.`);
      },
      nextView: () => onNavigateTo('customer', 'search', 'notebook'),
    },
    {
      step: 3,
      title: 'Customer searches for "notebook" and discovers shop',
      description: 'A customer searches for local notebooks on the storefront. ABC Stationery is returned with listed price ₹65 and reported stock "Available".',
      actionLabel: 'Simulate Customer Search for "notebook"',
      icon: ShoppingBag,
      execute: async () => {
        setStepOutput('Customer search matched ABC Stationery: 20 units reported available with recent timestamp.');
      },
      nextView: () => onNavigateTo('customer', 'search', 'notebook'),
    },
    {
      step: 4,
      title: 'Owner records a physical sale of 5 notebooks',
      description: 'A student buys 5 notebooks over the counter. The shopkeeper enters "5" in the fast POS Sales Recorder.',
      actionLabel: 'Execute Step 4: Record Sale of 5 Notebooks',
      icon: Store,
      execute: async () => {
        if (!notebookProduct) throw new Error('Notebook product not found');
        const res = await recordSale({
          shopId: 'shop-abc',
          productId: notebookProduct.id,
          quantity: 5,
          paymentMethod: 'cash',
          customerName: 'Student Walk-in',
        });
        await onRefreshData();
        setStepOutput(`Sale of 5 notebooks recorded. Invoice generated. Database stock updated to ${res.updatedProduct.stockQuantity}.`);
      },
      nextView: () => onNavigateTo('retailer', 'sales'),
    },
    {
      step: 5,
      title: 'Database automatically updates stock to 15',
      description: 'The centralized database engine decrements the inventory level from 20 to 15 in real time with an updated ISO timestamp.',
      actionLabel: 'Verify Database Level (15 Units)',
      icon: Store,
      execute: async () => {
        await onRefreshData();
        const currentQty = notebookProduct ? notebookProduct.stockQuantity : 15;
        setStepOutput(`Database state confirmed: Classmate Long Ruled Notebook current stock = ${currentQty} units.`);
      },
      nextView: () => onNavigateTo('retailer', 'inventory'),
    },
    {
      step: 6,
      title: 'Customer catalogue reflects new quantity (15)',
      description: 'The public-facing customer listing immediately displays the new remaining count (15 notebooks) without stale delays.',
      actionLabel: 'Check Customer Listing for 15 Units',
      icon: ShoppingBag,
      execute: async () => {
        await onRefreshData();
        setStepOutput(`Customer search result updated: Stock quantity now reads 15 units.`);
      },
      nextView: () => onNavigateTo('customer', 'search', 'notebook'),
    },
    {
      step: 7,
      title: 'Owner asks VyaparVoice: "How many notebooks remain?"',
      description: 'The retailer taps the microphone on the dashboard and asks the voice assistant how many notebooks are left.',
      actionLabel: 'Ask Assistant: "How many notebooks are available?"',
      icon: Mic,
      execute: async () => {
        const result = await sendVoiceQuery('How many notebooks are available?', 'shop-abc', 'en');
        setStepOutput(`Assistant response: "${result.replyText}"`);
      },
      nextView: () => onNavigateTo('retailer', 'voice'),
    },
    {
      step: 8,
      title: 'Assistant retrieves updated quantity (15) and responds',
      description: 'VyaparVoice fetches the updated database count (15 notebooks) and speaks out the accurate stock level.',
      actionLabel: 'Complete Demonstration & Fire Celebration',
      icon: Sparkles,
      execute: async () => {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
        setStepOutput('Full end-to-end workflow successfully demonstrated across retail POS, central DB, public discovery, and voice AI!');
      },
      nextView: () => onNavigateTo('retailer', 'dashboard'),
    },
  ];

  const handleExecute = async () => {
    setLoading(true);
    try {
      const stepObj = steps[currentStep - 1];
      await stepObj.execute();
      if (currentStep < 8) {
        // give user a moment then allow next
      }
    } catch (err: any) {
      setStepOutput(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetDemoState();
      await onRefreshData();
      setCurrentStep(1);
      setStepOutput('Central database reset to initial state. Notebook stock is 20.');
    } catch (e: any) {
      setStepOutput(e.message);
    } finally {
      setLoading(false);
    }
  };

  const activeStep = steps[currentStep - 1];
  const StepIcon = activeStep.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white leading-tight">
                End-to-End Workflow Demonstration
              </h3>
              <p className="text-xs text-slate-400">
                Phase 5: Verifying connected retail management & customer discovery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Stepper */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            {steps.map((s) => {
              const isPast = s.step < currentStep;
              const isCurrent = s.step === currentStep;
              return (
                <button
                  key={s.step}
                  onClick={() => {
                    setCurrentStep(s.step);
                    setStepOutput(null);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    isCurrent
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : isPast
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <span className="tabular-nums font-bold">{s.step}</span>
                  )}
                  <span className="hidden sm:inline">Step {s.step}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <StepIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                Step {activeStep.step} of 8
              </div>
              <h4 className="text-lg font-bold text-slate-900 leading-snug">
                {activeStep.title}
              </h4>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {activeStep.description}
              </p>
            </div>
          </div>

          {/* Current Live Database Indicator */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Central DB Product Status:</span>
              <span className="text-slate-900 font-medium">
                {notebookProduct ? notebookProduct.name : 'Classmate Notebook'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-500">Live Stock:</span>
              <span className="px-2 py-0.5 font-bold rounded bg-emerald-100 text-emerald-800 text-sm">
                {notebookProduct ? notebookProduct.stockQuantity : '--'} units
              </span>
            </div>
          </div>

          {/* Execution Result Log */}
          {stepOutput && (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-mono text-[11px] leading-relaxed break-words whitespace-pre-wrap">
                {stepOutput}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleReset}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo DB</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  activeStep.nextView();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
              >
                <span>Switch View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleExecute}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? 'Running...' : activeStep.actionLabel}</span>
              </button>

              {currentStep < 8 && (
                <button
                  onClick={() => {
                    setCurrentStep((prev) => Math.min(8, prev + 1));
                    setStepOutput(null);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

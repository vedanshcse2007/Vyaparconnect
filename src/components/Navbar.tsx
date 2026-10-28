import React from 'react';
import { Store, ShoppingBag, Sparkles, Languages, UserPlus, LogIn, User, MapPin, Bell } from 'lucide-react';
import { CustomerUser, Shop } from '../types/index.ts';

interface NavbarProps {
  currentView: 'customer' | 'retailer' | 'login';
  onViewChange: (view: 'customer' | 'retailer' | 'login') => void;
  activeCustomerTab: 'home' | 'search' | 'shops';
  onCustomerTabChange: (tab: 'home' | 'search' | 'shops') => void;
  activeRetailerTab: 'dashboard' | 'inventory' | 'sales' | 'voice' | 'settings' | 'enquiries';
  onRetailerTabChange: (tab: 'dashboard' | 'inventory' | 'sales' | 'voice' | 'settings' | 'enquiries') => void;
  currentCustomer: CustomerUser | null;
  currentShop: Shop | null;
  onOpenLogin: (tab?: 'customer' | 'retailer') => void;
  onOpenCustomerProfile: () => void;
  onOpenDemoTour: () => void;
  onOpenShopAuth: () => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  unreadNotificationCount?: number;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  activeCustomerTab,
  onCustomerTabChange,
  activeRetailerTab,
  onRetailerTabChange,
  currentCustomer,
  currentShop,
  onOpenLogin,
  onOpenCustomerProfile,
  onOpenDemoTour,
  onOpenShopAuth,
  selectedLanguage,
  onLanguageChange,
  unreadNotificationCount = 0,
  onOpenNotifications,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#f9faf7]/95 backdrop-blur-md border-b border-[#e9ece5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                if (currentView === 'login') {
                  onViewChange('customer');
                  onCustomerTabChange('home');
                } else if (currentView === 'customer') {
                  onCustomerTabChange('home');
                } else {
                  onRetailerTabChange('dashboard');
                }
              }}
              className="text-left group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315e45] rounded-md cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-[#315e45] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                व
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  VyaparConnect AI
                </span>
                <span className="text-[11px] text-slate-500 font-medium block leading-none">
                  {currentView === 'login'
                    ? 'Account & Authentication'
                    : currentView === 'customer'
                    ? 'Local Product Finder'
                    : 'Retailer Operating System'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {currentView === 'customer' || currentView === 'login' ? (
              <>
                <button
                  onClick={() => {
                    onViewChange('customer');
                    onCustomerTabChange('home');
                  }}
                  className={`transition-colors whitespace-nowrap hover:text-slate-900 py-1 cursor-pointer ${
                    currentView === 'customer' && activeCustomerTab === 'home'
                      ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                      : ''
                  }`}
                >
                  Discover
                </button>
                <button
                  onClick={() => {
                    onViewChange('customer');
                    onCustomerTabChange('search');
                  }}
                  className={`transition-colors whitespace-nowrap hover:text-slate-900 py-1 cursor-pointer ${
                    currentView === 'customer' && activeCustomerTab === 'search'
                      ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                      : ''
                  }`}
                >
                  Search Products
                </button>
                <button
                  onClick={() => {
                    onViewChange('customer');
                    onCustomerTabChange('shops');
                  }}
                  className={`transition-colors whitespace-nowrap hover:text-slate-900 py-1 cursor-pointer ${
                    currentView === 'customer' && activeCustomerTab === 'shops'
                      ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700'
                      : ''
                  }`}
                >
                  Local Shops
                </button>
                {currentCustomer && (
                  <button
                    onClick={onOpenCustomerProfile}
                    className="transition-colors whitespace-nowrap hover:text-slate-900 py-1 cursor-pointer text-emerald-800 font-medium flex items-center gap-1.5"
                  >
                    <span>My Inquiries</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => onRetailerTabChange('dashboard')}
                  className={`transition-colors whitespace-nowrap hover:text-slate-900 py-1 cursor-pointer ${
                    activeRetailerTab === 'dashboard' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700' : ''
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => onRetailerTabChange('inventory')}
                  className={`transition-colors whitespace-nowrap hover:text-slate-900 py-1 cursor-pointer ${
                    activeRetailerTab === 'inventory' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700' : ''
                  }`}
                >
                  Inventory
                </button>
                <button
                  onClick={() => onRetailerTabChange('sales')}
                  className={`transition-colors whitespace-nowrap hover:text-slate-900 py-1 cursor-pointer ${
                    activeRetailerTab === 'sales' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700' : ''
                  }`}
                >
                  Sales Record
                </button>
                <button
                  onClick={() => onRetailerTabChange('voice')}
                  className={`transition-colors whitespace-nowrap hover:text-slate-900 py-1 cursor-pointer ${
                    activeRetailerTab === 'voice' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700' : ''
                  }`}
                >
                  VyaparVoice
                </button>
                <button
                  onClick={() => onRetailerTabChange('enquiries')}
                  className={`transition-colors whitespace-nowrap hover:text-slate-900 py-1 cursor-pointer ${
                    activeRetailerTab === 'enquiries' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700' : ''
                  }`}
                >
                  Enquiries
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Actions - Language, Demo Tour, Auth, and Mode Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language dropdown */}
            <div className="relative hidden xl:flex items-center gap-1.5 px-2 py-1.5 bg-slate-100 rounded-lg text-xs text-slate-700">
              <Languages className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-transparent border-none text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="hinglish">Hinglish</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>

            {/* Phase 5 Interactive Workflow button */}
            <button
              onClick={onOpenDemoTour}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              title="Click to run the 8-step End-to-End demonstration sequence"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Demo (1-8)</span>
            </button>

            {/* Adaptive Notification Bell Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-[#20281f] hover:bg-[#edf3e8] border border-[#e1e7da] transition-all cursor-pointer"
              title="Open Adaptive Alerts & Inventory Notifications"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4 text-[#315e45]" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* DEDICATED AUTH SECTION */}
            {currentCustomer ? (
              /* Logged In Customer Pill */
              <button
                onClick={onOpenCustomerProfile}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                title="View Shopper Profile & Track Inquiries"
              >
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span className="max-w-[100px] truncate hidden sm:inline">{currentCustomer.name}</span>
                <span className="text-[10px] text-emerald-700 font-normal hidden md:inline">({currentCustomer.area})</span>
              </button>
            ) : currentView === 'customer' || currentView === 'login' ? (
              /* Customer Login Button */
              <button
                onClick={() => onOpenLogin('customer')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer border ${
                  currentView === 'login'
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="Sign in as Customer or Shop Owner"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                <span>Sign In</span>
              </button>
            ) : null}

            {/* Merchant Switcher in Retailer View */}
            {currentView === 'retailer' && (
              <button
                onClick={() => onOpenLogin('retailer')}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                title="Switch Merchant or Register New Shop"
              >
                <Store className="w-3.5 h-3.5 text-emerald-700" />
                <span className="max-w-[90px] truncate">{currentShop?.name.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-500">Switch</span>
              </button>
            )}

            {/* View Switcher CTA */}
            {currentView === 'customer' || currentView === 'login' ? (
              <button
                onClick={() => onViewChange('retailer')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
              >
                <Store className="w-4 h-4 text-emerald-400" />
                <span>Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => onViewChange('customer')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                <span>Storefront</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

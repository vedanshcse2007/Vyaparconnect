import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchShops,
  fetchProducts,
  fetchSales,
  fetchEnquiries,
  fetchShopStats,
  updateProductStock,
  updateProduct,
  deleteProduct,
  addProduct,
  recordSale,
  replyToEnquiry,
  updateShop,
} from './lib/api.ts';
import { CustomerEnquiry, CustomerUser, Product, SaleRecord, Shop, ShopStats, AdaptiveNotification, NotificationPreferences } from './types/index.ts';
import { playNotificationSound } from './lib/notificationAudio.ts';

// Components
import { Navbar } from './components/Navbar.tsx';
import { DemoTourModal } from './components/DemoTourModal.tsx';
import { ShopAuthModal } from './components/retailer/ShopAuthModal.tsx';
import { LoginPage } from './components/auth/LoginPage.tsx';
import { AdaptiveNotificationCenter } from './components/notifications/AdaptiveNotificationCenter.tsx';
import { AdaptiveToastContainer } from './components/notifications/AdaptiveToastContainer.tsx';

// Customer Components
import { CustomerHome } from './components/customer/CustomerHome.tsx';
import { SearchResults } from './components/customer/SearchResults.tsx';
import { ProductDetailModal } from './components/customer/ProductDetailModal.tsx';
import { ShopProfileModal } from './components/customer/ShopProfileModal.tsx';
import { EnquiryModal } from './components/customer/EnquiryModal.tsx';
import { CustomerProfileModal } from './components/customer/CustomerProfileModal.tsx';

// Retailer Components
import { RetailerDashboard } from './components/retailer/RetailerDashboard.tsx';
import { InventoryManager } from './components/retailer/InventoryManager.tsx';
import { AddProductModal } from './components/retailer/AddProductModal.tsx';
import { SalesRecorder } from './components/retailer/SalesRecorder.tsx';
import { VyaparVoice } from './components/retailer/VyaparVoice.tsx';
import { CatalogueSettings } from './components/retailer/CatalogueSettings.tsx';
import { EnquiriesManager } from './components/retailer/EnquiriesManager.tsx';

const INITIAL_NOTIFICATIONS: AdaptiveNotification[] = [
  {
    id: 'notif-1',
    title: 'Low Stock Alert: Casio FX-991CW',
    message: 'Casio Scientific Calculator is selling rapidly in FC Road! Only 3 units remain. Stock expected to deplete within 3 hours based on sales velocity.',
    category: 'stock_alert',
    priority: 'critical',
    timestamp: '10 mins ago',
    read: false,
    targetRole: 'retailer',
    productId: 'prod-calc-1',
    productName: 'Casio FX-991CW ClassWiz Scientific Calculator',
    adaptiveMetadata: {
      velocity: '2.5 units/hr',
      confidenceRating: 98,
      suggestedQuantity: 15,
      urgencyReason: 'Rapid counter sales during college exam week',
    },
    action: {
      label: 'Quick Restock +15',
      type: 'restock',
      payload: { productId: 'prod-calc-1', qty: 15 },
    },
  },
  {
    id: 'notif-2',
    title: 'Incoming Customer Product Enquiry',
    message: 'Priyanshu (FC Road) asked: "Do you have Classmate long ruled notebooks in stock today?"',
    category: 'enquiry',
    priority: 'high',
    timestamp: '35 mins ago',
    read: false,
    targetRole: 'retailer',
    productId: 'prod-note-1',
    productName: 'Classmate Long Ruled Notebook (172 Pages)',
    action: {
      label: 'Quick Reply: In Stock (₹65)',
      type: 'reply_enquiry',
      payload: { enquiryId: 'enq-1' },
    },
  },
  {
    id: 'notif-3',
    title: 'Demand Surge in FC Road Area',
    message: '9 local customers searched for "notebooks under ₹70" in the last 45 minutes.',
    category: 'demand_spike',
    priority: 'medium',
    timestamp: '1 hour ago',
    read: true,
    targetRole: 'all',
    adaptiveMetadata: {
      velocity: '9 searches / hr',
    },
  },
];

const INITIAL_PREFERENCES: NotificationPreferences = {
  enableLowStockAlerts: true,
  enableCustomerEnquiries: true,
  enableFreshnessWarnings: true,
  enableDemandSpikes: true,
  enableBrowserPush: false,
  enableSound: true,
  quietHoursEnabled: false,
  stockThreshold: 4,
};

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'customer' | 'retailer' | 'login'>('customer');
  const [activeCustomerTab, setActiveCustomerTab] = useState<'home' | 'search' | 'shops'>('home');
  const [activeRetailerTab, setActiveRetailerTab] = useState<
    'dashboard' | 'inventory' | 'sales' | 'voice' | 'settings' | 'enquiries'
  >('dashboard');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  // Customer & Merchant Authentication State
  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('vyapar_customer_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loginInitialTab, setLoginInitialTab] = useState<'customer' | 'retailer'>('customer');
  const [isCustomerProfileOpen, setIsCustomerProfileOpen] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Central Database State
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [currentShopId, setCurrentShopId] = useState<string>('shop-abc');
  const [stats, setStats] = useState<ShopStats>({
    totalSkus: 0,
    totalStockUnits: 0,
    lowStockCount: 0,
    todaySalesAmount: 0,
    todaySalesCount: 0,
    pendingEnquiries: 0,
  });

  // Modals & Navigation
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);
  const [isShopAuthOpen, setIsShopAuthOpen] = useState<boolean>(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [enquiryProduct, setEnquiryProduct] = useState<Product | null>(null);
  const [enquiryShopId, setEnquiryShopId] = useState<string | null>(null);

  // Adaptive Notifications State
  const [notifications, setNotifications] = useState<AdaptiveNotification[]>(() => {
    try {
      const saved = localStorage.getItem('vyapar_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [toasts, setToasts] = useState<AdaptiveNotification[]>([]);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('vyapar_notif_prefs');
      return saved ? JSON.parse(saved) : INITIAL_PREFERENCES;
    } catch {
      return INITIAL_PREFERENCES;
    }
  });

  // Save notifications & preferences
  useEffect(() => {
    try {
      localStorage.setItem('vyapar_notifications', JSON.stringify(notifications));
    } catch (_) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('vyapar_notif_prefs', JSON.stringify(notificationPreferences));
    } catch (_) {}
  }, [notificationPreferences]);

  // Dispatch an adaptive notification
  const dispatchAdaptiveNotification = useCallback(
    (notifData: Omit<AdaptiveNotification, 'id' | 'timestamp' | 'read'>) => {
      const newNotif: AdaptiveNotification = {
        ...notifData,
        id: `notif-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
        timestamp: 'Just now',
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);

      // Sound feedback
      if (notificationPreferences.enableSound) {
        playNotificationSound(newNotif.priority);
      }

      // High / Critical priority toast
      if (newNotif.priority === 'critical' || newNotif.priority === 'high') {
        setToasts((prev) => [newNotif, ...prev]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newNotif.id));
        }, 6500);
      }

      // Browser push notification if permitted
      if (
        notificationPreferences.enableBrowserPush &&
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          new Notification(newNotif.title, {
            body: newNotif.message,
          });
        } catch (_) {}
      }
    },
    [notificationPreferences]
  );

  // Load Data
  const loadData = useCallback(async () => {
    try {
      const [shopsData, productsData, salesData, enquiriesData] = await Promise.all([
        fetchShops(),
        fetchProducts(),
        fetchSales(),
        fetchEnquiries(),
      ]);
      setShops(shopsData);
      setProducts(productsData);
      setSales(salesData);
      setEnquiries(enquiriesData);

      if (currentShopId) {
        const statsData = await fetchShopStats(currentShopId);
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching centralized data:', err);
    }
  }, [currentShopId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentShop = shops.find((s) => s.id === currentShopId) || shops[0] || {
    id: 'shop-abc',
    name: 'ABC Stationery & General Store',
    ownerName: 'Ramesh Sharma',
    category: 'Stationery & Educational Supplies',
    address: 'Shop 4, Market Yard, FC Road, Pune',
    area: 'FC Road',
    distanceKm: 0.4,
    phone: '+91 98220 12345',
    upiId: 'abcstationery@okhdfcbank',
    openingHours: '8:30 AM - 9:30 PM (Open Today)',
    rating: 4.8,
    reviewCount: 142,
    isOpen: true,
    catalogueActive: true,
  };

  // Auth Handlers
  const handleOpenLogin = (tab: 'customer' | 'retailer' = 'customer') => {
    setLoginInitialTab(tab);
    setCurrentView('login');
  };

  const handleLoginCustomer = (customer: CustomerUser) => {
    setCurrentCustomer(customer);
    try {
      localStorage.setItem('vyapar_customer_session', JSON.stringify(customer));
    } catch (e) {
      console.error('Failed to save customer session', e);
    }
    if (customer.area) {
      setSelectedArea(customer.area);
    }
    setCurrentView('customer');
  };

  const handleLogoutCustomer = () => {
    setCurrentCustomer(null);
    try {
      localStorage.removeItem('vyapar_customer_session');
    } catch (e) {
      console.error('Failed to clear customer session', e);
    }
  };

  const handleLoginShop = (shop: Shop) => {
    setCurrentShopId(shop.id);
    setCurrentView('retailer');
    setActiveRetailerTab('dashboard');
  };

  // Search & Navigation Handlers
  const handleSearchSubmit = (q?: string) => {
    if (q !== undefined) setSearchQuery(q);
    setActiveCustomerTab('search');
    setCurrentView('customer');
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    await updateProductStock(productId, newStock);
    await loadData();
  };

  const handleUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    await updateProduct(productId, updates);
    await loadData();
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId);
    await loadData();
  };

  const handleAddProduct = async (data: any) => {
    await addProduct(data);
    await loadData();
  };

  const handleRecordSale = async (payload: any) => {
    try {
      const saleResult = await recordSale(payload);
      await loadData();

      // Adaptive Stock Velocity Check: If stock drops below threshold, trigger critical alert!
      if (saleResult?.updatedProduct && notificationPreferences.enableLowStockAlerts) {
        const prod = saleResult.updatedProduct;
        if (prod.stockQuantity <= notificationPreferences.stockThreshold) {
          dispatchAdaptiveNotification({
            title: `🚨 Adaptive Low Stock: ${prod.name}`,
            message: `Only ${prod.stockQuantity} ${prod.unit} left! Counter sale of ${payload.quantity} units just closed. Restock advised immediately.`,
            category: 'stock_alert',
            priority: prod.stockQuantity <= 1 ? 'critical' : 'high',
            targetRole: 'retailer',
            shopId: currentShop.id,
            productId: prod.id,
            productName: prod.name,
            adaptiveMetadata: {
              velocity: `${payload.quantity} units just sold`,
              confidenceRating: 98,
              suggestedQuantity: 15,
              urgencyReason: 'High counter sales velocity outpaces safety threshold',
            },
            action: {
              label: 'Quick Restock +15',
              type: 'restock',
              payload: { productId: prod.id, qty: 15 },
            },
          });
        }
      }
    } catch (err) {
      console.error('Failed to record sale:', err);
    }
  };

  const handleReplyEnquiry = async (id: string, reply: string) => {
    await replyToEnquiry(id, reply);
    await loadData();
    dispatchAdaptiveNotification({
      title: '✅ Customer Inquiry Replied',
      message: `Reply sent to customer. Status marked as replied.`,
      category: 'enquiry',
      priority: 'low',
      targetRole: 'retailer',
    });
  };

  const handleUpdateShop = async (updates: Partial<Shop>) => {
    await updateShop(currentShop.id, updates);
    await loadData();
  };

  const handleNavigateTo = (view: 'customer' | 'retailer' | 'login', tab?: string, query?: string) => {
    setCurrentView(view);
    if (view === 'customer' && tab) {
      setActiveCustomerTab(tab as any);
      if (query) setSearchQuery(query);
    } else if (view === 'retailer' && tab) {
      setActiveRetailerTab(tab as any);
    }
  };

  // Adaptive Notification Actions
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleTriggerSimulation = (type: 'low_stock' | 'enquiry' | 'demand_surge' | 'freshness') => {
    if (type === 'low_stock') {
      const targetProd =
        products.find((p) => p.name.toLowerCase().includes('calculator')) ||
        products.find((p) => p.name.toLowerCase().includes('notebook')) ||
        products[0];

      dispatchAdaptiveNotification({
        title: `🚨 Urgent Stock Velocity Alert: ${targetProd?.name || 'Scientific Calculator'}`,
        message: `Stock has plummeted to 2 units at ${currentShop.name}! Sales velocity is 3 units/hour. Restock needed before evening rush.`,
        category: 'stock_alert',
        priority: 'critical',
        targetRole: 'retailer',
        shopId: currentShop.id,
        productId: targetProd?.id,
        productName: targetProd?.name,
        adaptiveMetadata: {
          velocity: '3.0 units / hr',
          suggestedQuantity: 15,
          urgencyReason: 'Exam season rush',
        },
        action: {
          label: 'Quick Restock +15',
          type: 'restock',
          payload: { productId: targetProd?.id, qty: 15 },
        },
      });
    } else if (type === 'enquiry') {
      dispatchAdaptiveNotification({
        title: '💬 Live Customer Inquiry Received',
        message: 'A student from Fergusson College asks: "Are Casio scientific calculators and long notebooks in stock right now?"',
        category: 'enquiry',
        priority: 'high',
        targetRole: 'retailer',
        shopId: currentShop.id,
        action: {
          label: 'Quick Reply: In Stock (₹500)',
          type: 'reply_enquiry',
        },
      });
    } else if (type === 'demand_surge') {
      dispatchAdaptiveNotification({
        title: '📈 Local Demand Surge in FC Road Area',
        message: '14 nearby customers searched for "notebooks under ₹70" in the last 20 minutes.',
        category: 'demand_spike',
        priority: 'medium',
        targetRole: 'all',
        adaptiveMetadata: {
          velocity: '14 searches / 20m',
        },
      });
    } else if (type === 'freshness') {
      const prod = products[0];
      dispatchAdaptiveNotification({
        title: '🕒 Inventory Freshness Verification Needed',
        message: `Stock for "${prod?.name || 'Notebooks'}" was confirmed >24 hours ago. Confirm now to keep your 98% verified badge.`,
        category: 'freshness',
        priority: 'medium',
        targetRole: 'retailer',
        shopId: currentShop.id,
        action: {
          label: 'Confirm Current Stock',
          type: 'verify_stock',
          payload: { productId: prod?.id },
        },
      });
    }
  };

  const handleNotificationActionClick = async (notif: AdaptiveNotification) => {
    // Mark as read
    handleMarkAsRead(notif.id);
    setToasts((prev) => prev.filter((t) => t.id !== notif.id));

    if (notif.action?.type === 'restock') {
      const pId = notif.action.payload?.productId || notif.productId;
      const addQty = notif.action.payload?.qty || 10;
      const target = products.find((p) => p.id === pId);
      if (target) {
        const newQty = target.stockQuantity + addQty;
        await handleUpdateStock(target.id, newQty);
        dispatchAdaptiveNotification({
          title: `✅ Restocked: ${target.name}`,
          message: `Stock successfully incremented by +${addQty} units (Total: ${newQty} ${target.unit}). Public catalogue synced live.`,
          category: 'stock_alert',
          priority: 'low',
          targetRole: 'retailer',
        });
      }
    } else if (notif.action?.type === 'reply_enquiry') {
      setCurrentView('retailer');
      setActiveRetailerTab('enquiries');
      setIsNotificationCenterOpen(false);
    } else if (notif.action?.type === 'verify_stock') {
      const pId = notif.action.payload?.productId || notif.productId;
      if (pId) {
        await handleUpdateProduct(pId, { isConfirmed: true, lastUpdated: new Date().toISOString() });
        dispatchAdaptiveNotification({
          title: '✅ Listing Verified',
          message: 'Inventory timestamp refreshed to 100% confidence rating.',
          category: 'freshness',
          priority: 'low',
          targetRole: 'retailer',
        });
      }
    } else if (notif.action?.type === 'view_product') {
      const pId = notif.action.payload?.productId || notif.productId;
      const target = products.find((p) => p.id === pId);
      if (target) {
        setSelectedProduct(target);
        setIsNotificationCenterOpen(false);
      }
    }
  };

  // Find comparisons for product detail modal
  const comparisons = selectedProduct
    ? products.filter(
        (p) =>
          p.id !== selectedProduct.id &&
          (p.name.toLowerCase() === selectedProduct.name.toLowerCase() ||
            p.sku === selectedProduct.sku ||
            p.name.toLowerCase().includes(selectedProduct.name.toLowerCase().split(' ')[0]))
      )
    : [];

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#f9faf7] text-[#20281f] flex flex-col">
      {/* Navbar adhering to Top Bar Contract */}
      <Navbar
        currentView={currentView}
        onViewChange={(v) => setCurrentView(v)}
        activeCustomerTab={activeCustomerTab}
        onCustomerTabChange={(t) => setActiveCustomerTab(t)}
        activeRetailerTab={activeRetailerTab}
        onRetailerTabChange={(t) => setActiveRetailerTab(t)}
        currentCustomer={currentCustomer}
        currentShop={currentShop}
        onOpenLogin={handleOpenLogin}
        onOpenCustomerProfile={() => setIsCustomerProfileOpen(true)}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
        onOpenShopAuth={() => handleOpenLogin('retailer')}
        selectedLanguage={selectedLanguage}
        onLanguageChange={(l) => setSelectedLanguage(l)}
        unreadNotificationCount={unreadNotificationCount}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* DEDICATED LOGIN / AUTHENTICATION PAGE */}
        {currentView === 'login' && (
          <LoginPage
            initialTab={loginInitialTab}
            shops={shops}
            currentShop={currentShop}
            currentCustomer={currentCustomer}
            onLoginCustomer={handleLoginCustomer}
            onLoginShop={handleLoginShop}
            onShopRegistered={(newShop) => {
              setShops((prev) => [...prev, newShop]);
              setCurrentShopId(newShop.id);
            }}
            onBackToApp={() => setCurrentView('customer')}
          />
        )}

        {/* SIDE 1: CUSTOMER STOREFRONT */}
        {currentView === 'customer' && (
          <div>
            {activeCustomerTab === 'home' && (
              <CustomerHome
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchSubmit={handleSearchSubmit}
                shops={shops}
                onSelectShop={(s) => setSelectedShop(s)}
                selectedArea={selectedArea}
                onSelectArea={setSelectedArea}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setActiveCustomerTab('search');
                }}
                currentCustomer={currentCustomer}
                onOpenLogin={() => handleOpenLogin('customer')}
              />
            )}

            {activeCustomerTab === 'search' && (
              <SearchResults
                products={products}
                shops={shops}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchSubmit={handleSearchSubmit}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onOpenEnquiry={(p, sId) => {
                  setEnquiryProduct(p);
                  setEnquiryShopId(sId);
                }}
                onSelectShop={(s) => setSelectedShop(s)}
              />
            )}

            {activeCustomerTab === 'shops' && (
              <div className="space-y-6 pb-16">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Participating Neighborhood Retailers
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Discover digital catalogues and live stock availability in FC Road, Deccan, and Pune.
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenLogin('retailer')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
                  >
                    <span>Own a Shop? Register Here</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {shops.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-base text-slate-900">{s.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                            {s.distanceKm} km
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{s.category}</p>
                        <div className="text-xs text-slate-600 space-y-1">
                          <div>📍 {s.address}</div>
                          <div>🕒 {s.openingHours}</div>
                          <div>📞 {s.phone}</div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-semibold">
                          ⭐ {s.rating} ({s.reviewCount})
                        </span>
                        <button
                          onClick={() => setSelectedShop(s)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View Catalogue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SIDE 2: SHOP-OWNER DASHBOARD */}
        {currentView === 'retailer' && (
          <div>
            {activeRetailerTab === 'dashboard' && (
              <RetailerDashboard
                currentShop={currentShop}
                shops={shops}
                onSelectShop={(s) => setCurrentShopId(s.id)}
                stats={stats}
                products={products}
                recentSales={sales}
                onNavigateTab={(t) => setActiveRetailerTab(t)}
                onOpenAddProduct={() => setIsAddProductOpen(true)}
                onOpenDemoTour={() => setIsDemoTourOpen(true)}
                onOpenShopAuth={() => handleOpenLogin('retailer')}
                onQuickRestock={(pId, currentQty) => handleUpdateStock(pId, currentQty + 10)}
                onOpenNotifications={() => setIsNotificationCenterOpen(true)}
                unreadNotificationCount={unreadNotificationCount}
              />
            )}

            {activeRetailerTab === 'inventory' && (
              <InventoryManager
                currentShop={currentShop}
                products={products}
                onUpdateStock={handleUpdateStock}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onOpenAddModal={() => setIsAddProductOpen(true)}
              />
            )}

            {activeRetailerTab === 'sales' && (
              <SalesRecorder
                currentShop={currentShop}
                products={products}
                sales={sales}
                onRecordSale={handleRecordSale}
              />
            )}

            {activeRetailerTab === 'voice' && (
              <VyaparVoice
                currentShop={currentShop}
                products={products}
                onRefreshData={loadData}
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
              />
            )}

            {activeRetailerTab === 'settings' && (
              <CatalogueSettings
                currentShop={currentShop}
                onUpdateShop={handleUpdateShop}
              />
            )}

            {activeRetailerTab === 'enquiries' && (
              <EnquiriesManager
                currentShop={currentShop}
                enquiries={enquiries}
                onReplyEnquiry={handleReplyEnquiry}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <strong className="text-slate-800">VyaparConnect AI</strong> · An Intelligent Local Commerce Platform for Small Retailers
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleOpenLogin('customer')}
              className="text-emerald-700 font-semibold hover:underline cursor-pointer"
            >
              Customer Login
            </button>
            <span>·</span>
            <button
              onClick={() => handleOpenLogin('retailer')}
              className="text-slate-700 font-semibold hover:underline cursor-pointer"
            >
              Merchant Login
            </button>
            <span>·</span>
            <button
              onClick={() => setIsDemoTourOpen(true)}
              className="text-emerald-700 font-semibold hover:underline cursor-pointer"
            >
              Run 8-Step Demo
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}

      <ShopAuthModal
        isOpen={isShopAuthOpen}
        onClose={() => setIsShopAuthOpen(false)}
        shops={shops}
        currentShop={currentShop}
        onSelectShop={(s) => setCurrentShopId(s.id)}
        onShopRegistered={(newShop) => {
          setShops((prev) => [...prev, newShop]);
          setCurrentShopId(newShop.id);
        }}
      />

      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        products={products}
        onRefreshData={loadData}
        onNavigateTo={handleNavigateTo}
      />

      <ProductDetailModal
        product={selectedProduct}
        shop={shops.find((s) => s.id === selectedProduct?.shopId) || null}
        comparisons={comparisons}
        onClose={() => setSelectedProduct(null)}
        onOpenEnquiry={(p, sId) => {
          setEnquiryProduct(p);
          setEnquiryShopId(sId);
        }}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <ShopProfileModal
        shop={selectedShop}
        products={products}
        onClose={() => setSelectedShop(null)}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOpenEnquiry={(p, sId) => {
          setEnquiryProduct(p);
          setEnquiryShopId(sId);
        }}
      />

      <EnquiryModal
        isOpen={Boolean(enquiryShopId)}
        onClose={() => {
          setEnquiryShopId(null);
          setEnquiryProduct(null);
        }}
        product={enquiryProduct}
        shop={shops.find((s) => s.id === enquiryShopId) || null}
        currentCustomer={currentCustomer}
        onOpenLogin={() => handleOpenLogin('customer')}
        onEnquiryCreated={() => {
          loadData();
          dispatchAdaptiveNotification({
            title: '💬 New Customer Inquiry Received',
            message: `A local customer sent an enquiry for "${enquiryProduct?.name || 'products'}" at ${shops.find((s) => s.id === enquiryShopId)?.name || 'your shop'}.`,
            category: 'enquiry',
            priority: 'high',
            targetRole: 'retailer',
            action: {
              label: 'View & Reply',
              type: 'reply_enquiry',
            },
          });
        }}
      />

      <CustomerProfileModal
        isOpen={isCustomerProfileOpen}
        onClose={() => setIsCustomerProfileOpen(false)}
        customer={currentCustomer}
        enquiries={enquiries}
        shops={shops}
        onLogout={handleLogoutCustomer}
        onOpenSearch={() => {
          setCurrentView('customer');
          setActiveCustomerTab('search');
        }}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        currentShop={currentShop}
        onAddProduct={handleAddProduct}
      />

      {/* Adaptive Notifications Overlay & Drawer */}
      <AdaptiveToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
        onActionClick={handleNotificationActionClick}
      />

      <AdaptiveNotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
        onActionClick={handleNotificationActionClick}
        preferences={notificationPreferences}
        onUpdatePreferences={(updates) =>
          setNotificationPreferences((prev) => ({ ...prev, ...updates }))
        }
        onTriggerSimulation={handleTriggerSimulation}
      />
    </div>
  );
}

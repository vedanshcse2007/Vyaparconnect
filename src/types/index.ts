export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  category: string;
  address: string;
  area: string;
  distanceKm: number;
  phone: string;
  whatsapp?: string;
  upiId: string;
  openingHours: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  catalogueActive: boolean;
  featuredNotice?: string;
}

export interface AreaInfo {
  name: string;
  zone: string;
  pincode: string;
  keyLandmarks: string[];
  retailHighlights: string;
  distanceFromSwargateKm: number;
  popularFor: string[];
  description: string;
  shopCount?: number;
}

export type StockStatus = 'available' | 'low_stock' | 'out_of_stock' | 'unconfirmed';

export interface Product {
  id: string;
  shopId: string;
  shopName: string;
  name: string;
  category: string;
  description: string;
  listedPrice: number;
  mrp: number;
  stockQuantity: number;
  minStockThreshold: number;
  unit: string;
  sku: string;
  isPublic: boolean;
  lastUpdated: string; // ISO date string
  isConfirmed: boolean; // whether retailer confirmed recently
  staleReason?: string;
  barcode?: string;
}

export interface SaleRecord {
  id: string;
  shopId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'upi' | 'khata';
  customerName?: string;
  customerPhone?: string;
  timestamp: string; // ISO date string
}

export interface CustomerEnquiry {
  id: string;
  shopId: string;
  productId?: string;
  productName?: string;
  customerName: string;
  customerPhone: string;
  message: string;
  reply?: string;
  status: 'pending' | 'replied' | 'resolved';
  timestamp: string;
  repliedAt?: string;
}

export interface VoiceAssistantQuery {
  query: string;
  shopId: string;
  language?: 'en' | 'hi' | 'hinglish' | 'mr';
}

export interface AdaptiveAnalysisData {
  productName?: string;
  availableStock?: number;
  unit?: string;
  unitPrice?: number;
  bulkQuantity?: number;
  bulkPrice?: number;
  bundleFormula?: string;
  stockStatus?: 'healthy' | 'low_stock' | 'out_of_stock';
  safetyThreshold?: number;
  dashboardInsight?: string;
  todaySalesCount?: number;
  todaySalesAmount?: number;
  dashboardGrounded: boolean;
}

export interface VoiceAssistantResult {
  speechText: string;
  replyText: string;
  detectedIntent: 'inventory_check' | 'low_stock' | 'sales_summary' | 'stock_update' | 'sale_record' | 'general';
  detectedLanguage?: string;
  detectedLanguageName?: string;
  speakerRole?: 'retailer' | 'customer' | 'staff';
  preferredLanguage?: string;
  translations?: Record<string, string>;
  adaptiveAnalysis?: AdaptiveAnalysisData;
  action?: {
    type: 'stock_update' | 'sale_record' | 'none';
    productId?: string;
    productName?: string;
    newQuantity?: number;
    deltaQuantity?: number;
    requiresConfirmation?: boolean;
    executed?: boolean;
  };
  audioBase64?: string;
  source: 'gemini' | 'rule_fallback';
}

export interface ShopStats {
  totalSkus: number;
  totalStockUnits: number;
  lowStockCount: number;
  todaySalesAmount: number;
  todaySalesCount: number;
  pendingEnquiries: number;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  area: string;
  savedAt: string;
}

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';
export type NotificationCategory = 'stock_alert' | 'enquiry' | 'freshness' | 'demand_spike' | 'price_alert' | 'system';

export interface AdaptiveNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  timestamp: string;
  read: boolean;
  targetRole: 'all' | 'retailer' | 'customer';
  shopId?: string;
  productId?: string;
  productName?: string;
  action?: {
    label: string;
    type: 'restock' | 'view_product' | 'reply_enquiry' | 'verify_stock' | 'custom';
    payload?: any;
  };
  adaptiveMetadata?: {
    velocity?: string;
    confidenceRating?: number;
    suggestedQuantity?: number;
    urgencyReason?: string;
  };
}

export interface NotificationPreferences {
  enableLowStockAlerts: boolean;
  enableCustomerEnquiries: boolean;
  enableFreshnessWarnings: boolean;
  enableDemandSpikes: boolean;
  enableBrowserPush: boolean;
  enableSound: boolean;
  quietHoursEnabled: boolean;
  stockThreshold: number;
}

import { AreaInfo, CustomerEnquiry, Product, SaleRecord, Shop, ShopStats, VoiceAssistantResult } from '../types/index.ts';

export async function fetchAreasInfo(): Promise<Record<string, AreaInfo>> {
  const res = await fetch('/api/areas');
  if (!res.ok) throw new Error('Failed to fetch areas information');
  return res.json();
}

export async function fetchAreaDetails(name: string): Promise<AreaInfo> {
  const res = await fetch(`/api/areas/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error('Failed to fetch area details');
  return res.json();
}

export async function fetchShops(): Promise<Shop[]> {
  const res = await fetch('/api/shops');
  if (!res.ok) throw new Error('Failed to fetch shops');
  return res.json();
}

export async function fetchShop(id: string): Promise<Shop> {
  const res = await fetch(`/api/shops/${id}`);
  if (!res.ok) throw new Error('Failed to fetch shop');
  return res.json();
}

export async function updateShop(id: string, updates: Partial<Shop>): Promise<Shop> {
  const res = await fetch(`/api/shops/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update shop');
  return res.json();
}

export async function fetchShopStats(shopId: string): Promise<ShopStats> {
  const res = await fetch(`/api/shops/${shopId}/stats`);
  if (!res.ok) throw new Error('Failed to fetch shop stats');
  return res.json();
}

export async function fetchProducts(params?: {
  shopId?: string;
  query?: string;
  category?: string;
}): Promise<Product[]> {
  const url = new URL('/api/products', window.location.origin);
  if (params?.shopId) url.searchParams.set('shopId', params.shopId);
  if (params?.query) url.searchParams.set('query', params.query);
  if (params?.category) url.searchParams.set('category', params.category);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductWithComparisons(id: string): Promise<{ product: Product; comparisons: Product[] }> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product details');
  return res.json();
}

export async function addProduct(data: Omit<Product, 'id' | 'lastUpdated' | 'isConfirmed'>): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add product');
  return res.json();
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}

export async function updateProductStock(id: string, stockQuantity: number): Promise<Product> {
  const res = await fetch(`/api/products/${id}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stockQuantity }),
  });
  if (!res.ok) throw new Error('Failed to update product stock');
  return res.json();
}

export async function deleteProduct(id: string): Promise<boolean> {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete product');
  const data = await res.json();
  return data.success;
}

export async function fetchSales(shopId?: string): Promise<SaleRecord[]> {
  const url = new URL('/api/sales', window.location.origin);
  if (shopId) url.searchParams.set('shopId', shopId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch sales');
  return res.json();
}

export async function recordSale(payload: {
  shopId: string;
  productId: string;
  quantity: number;
  unitPrice?: number;
  paymentMethod: 'cash' | 'upi' | 'khata';
  customerName?: string;
}): Promise<{ sale: SaleRecord; updatedProduct: Product }> {
  const res = await fetch('/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to record sale');
  return data;
}

export async function fetchEnquiries(shopId?: string): Promise<CustomerEnquiry[]> {
  const url = new URL('/api/enquiries', window.location.origin);
  if (shopId) url.searchParams.set('shopId', shopId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch enquiries');
  return res.json();
}

export async function createEnquiry(payload: {
  shopId: string;
  productId?: string;
  productName?: string;
  customerName: string;
  customerPhone: string;
  message: string;
}): Promise<CustomerEnquiry> {
  const res = await fetch('/api/enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create enquiry');
  return res.json();
}

export async function replyToEnquiry(id: string, reply: string): Promise<CustomerEnquiry> {
  const res = await fetch(`/api/enquiries/${id}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply }),
  });
  if (!res.ok) throw new Error('Failed to reply to enquiry');
  return res.json();
}

export async function sendVoiceQuery(
  query: string,
  shopId: string,
  preferredLanguage: string = 'en',
  speakerRole: 'retailer' | 'customer' | 'staff' = 'retailer',
  spokenLanguage?: string
): Promise<VoiceAssistantResult> {
  const res = await fetch('/api/voice-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      shopId,
      preferredLanguage,
      speakerRole,
      spokenLanguage,
    }),
  });
  if (!res.ok) throw new Error('Failed to process voice query');
  return res.json();
}

export async function transcribeAudioData(
  audioBase64: string,
  mimeType: string = 'audio/webm',
  speakerRole: string = 'retailer'
): Promise<{
  transcript: string;
  detectedLanguage: string;
  detectedLanguageCode: string;
  detectedLanguageNative: string;
  speaker: string;
  confidence: number;
}> {
  const res = await fetch('/api/transcribe-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType, speakerRole }),
  });
  if (!res.ok) throw new Error('Failed to transcribe audio');
  return res.json();
}

export async function translateResponseText(
  text: string,
  targetLanguage: string
): Promise<{ translatedText: string; speechText: string; targetLanguage: string }> {
  const res = await fetch('/api/translate-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLanguage }),
  });
  if (!res.ok) throw new Error('Failed to translate response');
  return res.json();
}

export async function searchNaturalLanguage(query: string, userArea?: string): Promise<{
  query: string;
  interpretedCriteria: {
    product: string;
    maxPrice: number | null;
    location: string | null;
  };
  results: Product[];
  explanation: string;
}> {
  const res = await fetch('/api/search/natural-language', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, userArea }),
  });
  if (!res.ok) throw new Error('Failed to parse natural language search');
  return res.json();
}

export async function extractVoiceToCatalogue(text: string, shopId: string): Promise<any> {
  const res = await fetch('/api/voice-to-catalogue/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, shopId }),
  });
  if (!res.ok) throw new Error('Failed to extract voice to catalogue proposal');
  return res.json();
}

export async function confirmVoiceToCatalogue(shopId: string, proposal: any, confirmedAsNew: boolean): Promise<{
  success: boolean;
  action: string;
  product: Product;
  message: string;
}> {
  const res = await fetch('/api/voice-to-catalogue/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shopId, proposal, confirmedAsNew }),
  });
  if (!res.ok) throw new Error('Failed to confirm voice catalogue update');
  return res.json();
}

export async function registerShop(data: {
  name: string;
  ownerName: string;
  category: string;
  address: string;
  area: string;
  phone: string;
  upiId?: string;
  openingHours?: string;
}): Promise<Shop> {
  const res = await fetch('/api/shops/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to register shop');
  return res.json();
}

export async function resetDemoState(): Promise<void> {
  await fetch('/api/reset-demo', { method: 'POST' });
}


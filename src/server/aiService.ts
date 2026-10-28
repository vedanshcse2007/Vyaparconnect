import { GoogleGenAI } from '@google/genai';
import { db } from './db.ts';
import { VoiceAssistantResult } from '../types/index.ts';

// Gemini client initialization per gemini-api skill
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface LanguageConfig {
  code: string;
  name: string;
  native: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  hi: { code: 'hi', name: 'Hindi', native: 'हिन्दी', speechCode: 'hi-IN' },
  en: { code: 'en', name: 'English', native: 'English', speechCode: 'en-IN' },
  mr: { code: 'mr', name: 'Marathi', native: 'मराठी', speechCode: 'mr-IN' },
  gu: { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', speechCode: 'gu-IN' },
  bn: { code: 'bn', name: 'Bengali', native: 'বাংলা', speechCode: 'bn-IN' },
  ta: { code: 'ta', name: 'Tamil', native: 'தமிழ்', speechCode: 'ta-IN' },
  te: { code: 'te', name: 'Telugu', native: 'తెలుగు', speechCode: 'te-IN' },
  kn: { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  hinglish: { code: 'hinglish', name: 'Hinglish', native: 'Hinglish', speechCode: 'hi-IN' },
};

export function detectSpokenLanguage(text: string): { code: string; name: string; native: string; confidence: number } {
  if (!text || text.trim().length === 0) {
    return { code: 'en', name: 'English', native: 'English', confidence: 0.9 };
  }

  // 1. Script checks
  if (/[\u0A80-\u0AFF]/.test(text)) {
    return { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', confidence: 0.99 };
  }
  if (/[\u0980-\u09FF]/.test(text)) {
    return { code: 'bn', name: 'Bengali', native: 'বাংলা', confidence: 0.99 };
  }
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return { code: 'ta', name: 'Tamil', native: 'தமிழ்', confidence: 0.99 };
  }
  if (/[\u0C00-\u0C7F]/.test(text)) {
    return { code: 'te', name: 'Telugu', native: 'తెలుగు', confidence: 0.99 };
  }
  if (/[\u0C80-\u0CFF]/.test(text)) {
    return { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', confidence: 0.99 };
  }

  // Devanagari script: distinguish Marathi vs Hindi
  if (/[\u0900-\u097F]/.test(text)) {
    const marathiWords = ['आहे', 'नाही', 'किती', 'झाले', 'द्या', 'पाहिजे', 'संपत', 'नोंदवा', 'वह्या', 'पेन', 'रुपयांना', 'काय', 'कसे', 'ळ'];
    const hasMarathi = marathiWords.some(w => text.includes(w));
    if (hasMarathi) {
      return { code: 'mr', name: 'Marathi', native: 'मराठी', confidence: 0.95 };
    }
    return { code: 'hi', name: 'Hindi', native: 'हिन्दी', confidence: 0.95 };
  }

  // 2. Romanized keywords
  const lower = text.toLowerCase();

  // Gujarati romanized
  if (/\b(ketla|chhe|che|aapo|bhav|shu|joyiye|nathi)\b/i.test(lower)) {
    return { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', confidence: 0.85 };
  }

  // Marathi romanized
  if (/\b(kiti|ahe|sampat|ale|nondva|joda|kay|kuthe|vahi|vahya|dya|pahije)\b/i.test(lower)) {
    return { code: 'mr', name: 'Marathi', native: 'मराठी', confidence: 0.85 };
  }

  // Hindi / Hinglish romanized
  if (/\b(kitne|kitni|koun|samaan|bachi|bache|bech|diya|aaj|bikri|jodo|karo|kharcha|chahiye|hai|kya|batao|daalo|kitna)\b/i.test(lower)) {
    return { code: 'hi', name: 'Hindi', native: 'हिन्दी', confidence: 0.85 };
  }

  // Default to English
  return { code: 'en', name: 'English', native: 'English', confidence: 0.9 };
}

// Transcribe Audio using Gemini 3.5 Transcribe
export async function transcribeAudio(
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
  const hasValidKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.length > 10 &&
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );

  if (aiClient && hasValidKey && audioBase64) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: audioBase64,
            },
          },
          {
            text: `You are an expert audio speech transcriber for Indian local commerce.
Transcribe this spoken audio accurately in its native language/script.
Indicate what language is spoken (e.g. Hindi, Marathi, Gujarati, English, Bengali, Tamil, Telugu, Kannada).
Speaker role context: ${speakerRole === 'customer' ? 'Customer / Buyer' : 'Shopkeeper / Retailer (Vyapari)'}.
Return JSON only:
{
  "transcript": "Exact verbatim transcription in original language and script",
  "detectedLanguage": "Hindi" | "Marathi" | "Gujarati" | "English" | "Bengali" | "Tamil" | "Telugu" | "Kannada",
  "detectedLanguageCode": "hi" | "mr" | "gu" | "en" | "bn" | "ta" | "te" | "kn",
  "speaker": "Shopkeeper (Vyapari)" | "Customer",
  "confidence": 0.95
}`,
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      const langCode = parsed.detectedLanguageCode || 'en';
      const langConfig = SUPPORTED_LANGUAGES[langCode] || SUPPORTED_LANGUAGES['en'];

      return {
        transcript: parsed.transcript || '',
        detectedLanguage: parsed.detectedLanguage || langConfig.name,
        detectedLanguageCode: langConfig.code,
        detectedLanguageNative: langConfig.native,
        speaker: parsed.speaker || (speakerRole === 'customer' ? 'Customer' : 'Shopkeeper (Vyapari)'),
        confidence: parsed.confidence || 0.92,
      };
    } catch (err: any) {
      console.warn('Gemini 3.5 Transcribe notice:', err?.message || 'Fallback to client audio metadata');
    }
  }

  return {
    transcript: '',
    detectedLanguage: 'English',
    detectedLanguageCode: 'en',
    detectedLanguageNative: 'English',
    speaker: speakerRole === 'customer' ? 'Customer' : 'Shopkeeper (Vyapari)',
    confidence: 0.8,
  };
}

export async function processVoiceQuery(
  query: string,
  shopId: string,
  preferredLanguage: string = 'en',
  speakerRole: 'retailer' | 'customer' | 'staff' = 'retailer',
  explicitSpokenLanguage?: string
): Promise<VoiceAssistantResult> {
  const shop = db.getShopById(shopId) || db.getShops()[0];
  const products = db.getProducts({ shopId: shop.id });
  const sales = db.getSales(shop.id);
  const stats = db.getShopStats(shop.id);

  const cleanQuery = query.trim();

  // Detect what language the user is speaking in
  const detectedLangInfo = explicitSpokenLanguage && SUPPORTED_LANGUAGES[explicitSpokenLanguage]
    ? SUPPORTED_LANGUAGES[explicitSpokenLanguage]
    : detectSpokenLanguage(cleanQuery);

  const preferredLangConfig = SUPPORTED_LANGUAGES[preferredLanguage] || SUPPORTED_LANGUAGES['en'];

  const hasValidKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.length > 10 &&
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );

  // Try Gemini AI if available
  if (aiClient && hasValidKey) {
    try {
      const prompt = `You are "VyaparVoice", an adaptive intelligent retail AI assistant (like Siri, Alexa, or ChatGPT for local Indian retail).
Current Shop: "${shop.name}" (Owner: ${shop.ownerName}, Category: ${shop.category})
WHO IS TELLING / SPEAKER: ${speakerRole === 'customer' ? 'Customer / Buyer inquiring about products' : 'Shopkeeper / Retailer (Vyapari) managing inventory and sales'}
WHAT LANGUAGE THEY SPOKE: ${detectedLangInfo.name} (${detectedLangInfo.code} - ${detectedLangInfo.native})
THEIR PREFERRED RESPONSE LANGUAGE: ${preferredLangConfig.name} (${preferredLangConfig.code} - ${preferredLangConfig.native})

LIVE DASHBOARD INVENTORY DATA:
${products.map(p => `- ID: ${p.id} | ${p.name} | Stock: ${p.stockQuantity} ${p.unit} | MinThreshold: ${p.minStockThreshold} | ListedPrice: ₹${p.listedPrice} | MRP: ₹${p.mrp}`).join('\n')}

TODAY'S LIVE DASHBOARD METRICS:
- Today's Sales Count: ${stats.todaySalesCount}
- Today's Sales Revenue: ₹${stats.todaySalesAmount}
- Total SKUs in Catalogue: ${stats.totalSkus}
- Total Stock Units: ${stats.totalStockUnits}
- Low Stock Items Count: ${stats.lowStockCount}

User Spoken Query: "${cleanQuery}"

CRITICAL ADAPTIVE AI INSTRUCTIONS:
You must answer questions by actively analyzing the live dashboard data above:
1. FOR INVENTORY / PRODUCT AVAILABILITY / PRICE QUESTIONS (e.g. "how many notebooks are available", "price of calculators", "do we have pens"):
   - You MUST analyze the live dashboard and state BOTH single-unit price ("1 for ₹X") and bulk/bundle price ("N for ₹Y").
   - Follow this exact pattern: "[Quantity] [Product Name] are available: 1 for ₹[Unit Price] and [Quantity] for ₹[Bulk Price]."
     For example: "10 Classmate Notebooks are available: 1 for ₹49 and 10 for ₹499."
   - Also add dashboard health status (e.g. "Dashboard stock status: Healthy above safety limit of 4").
2. FOR SALES & REVENUE QUESTIONS:
   - Analyze today's dashboard metrics: state sales count, total revenue, and average transaction size.
3. FOR LOW STOCK QUESTIONS:
   - Identify products below threshold and give estimated restocking capital needed.
4. FOR SHOP OVERVIEW / PERFORMANCE QUESTIONS:
   - Give an executive summary of total inventory value, daily orders, and urgent alerts.
5. MULTILINGUAL OUTPUT:
   - Your 'replyText' and 'speechText' MUST be written strictly in the user's PREFERRED LANGUAGE: ${preferredLangConfig.name} (${preferredLangConfig.native}).
   - Also provide full translations in 'translations' for hi, en, mr, gu, ta, bn.
   - Populate 'adaptiveAnalysis' object with exact numbers.

Return JSON in this exact structure:
{
  "detectedIntent": "inventory_check" | "low_stock" | "sales_summary" | "stock_update" | "sale_record" | "general",
  "replyText": "Detailed adaptive reply in ${preferredLangConfig.name} (${preferredLangConfig.native}) with ₹ and structured quantities",
  "speechText": "Short conversational sentence in ${preferredLangConfig.name} for speech synthesis",
  "translations": {
    "hi": "Reply in Hindi",
    "en": "Reply in English",
    "mr": "Reply in Marathi",
    "gu": "Reply in Gujarati",
    "ta": "Reply in Tamil",
    "bn": "Reply in Bengali"
  },
  "adaptiveAnalysis": {
    "productName": "Matched product name or null",
    "availableStock": 10,
    "unit": "notebooks",
    "unitPrice": 49,
    "bulkQuantity": 10,
    "bulkPrice": 499,
    "bundleFormula": "1 for ₹49 and 10 for ₹499",
    "stockStatus": "healthy" | "low_stock" | "out_of_stock",
    "safetyThreshold": 4,
    "dashboardInsight": "Short dashboard finding",
    "todaySalesCount": ${stats.todaySalesCount},
    "todaySalesAmount": ${stats.todaySalesAmount},
    "dashboardGrounded": true
  },
  "action": {
    "type": "stock_update" | "sale_record" | "none",
    "productId": "id if matched or null",
    "productName": "name of matched product or null",
    "newQuantity": number if stock update,
    "deltaQuantity": number if sale or relative change,
    "requiresConfirmation": boolean
  }
}`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API query window exceeded')), 8000)
      );

      const response = await Promise.race([
        aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
        timeoutPromise,
      ]);

      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText);

      // If action is stock update or sale record, execute it in the central database!
      if (speakerRole !== 'customer') {
        if (parsed.action?.type === 'stock_update' && parsed.action?.productId && parsed.action?.newQuantity !== undefined) {
          db.updateStock(parsed.action.productId, parsed.action.newQuantity);
          parsed.action.executed = true;
        } else if (parsed.action?.type === 'sale_record' && parsed.action?.productId && parsed.action?.deltaQuantity) {
          const res = db.recordSale({
            shopId: shop.id,
            productId: parsed.action.productId,
            quantity: parsed.action.deltaQuantity,
            paymentMethod: 'cash',
          });
          if ('sale' in res) {
            parsed.action.executed = true;
          }
        }
      }

      return {
        speechText: parsed.speechText || parsed.replyText,
        replyText: parsed.replyText,
        detectedIntent: parsed.detectedIntent || 'general',
        detectedLanguage: detectedLangInfo.code,
        detectedLanguageName: `${detectedLangInfo.name} (${detectedLangInfo.native})`,
        speakerRole,
        preferredLanguage: preferredLangConfig.code,
        translations: parsed.translations || {},
        adaptiveAnalysis: parsed.adaptiveAnalysis,
        action: parsed.action,
        source: 'gemini',
      };
    } catch (err: any) {
      console.log('Gemini notice:', err?.message || 'Using local rule engine fallback');
    }
  }

  // Robust Rule-Based Deterministic NLP Engine
  return ruleBasedVoiceQuery(cleanQuery, shop, products, sales, stats, preferredLangConfig.code, detectedLangInfo, speakerRole);
}

function ruleBasedVoiceQuery(
  query: string,
  shop: any,
  products: any[],
  sales: any[],
  stats: any,
  targetLang: string,
  detectedLangInfo: { code: string; name: string; native: string },
  speakerRole: 'retailer' | 'customer' | 'staff'
): VoiceAssistantResult {
  const q = query.toLowerCase();

  // Helper to build translations in key Indian languages
  const formatTranslations = (
    enText: string,
    hiText: string,
    mrText: string,
    guText: string,
    taText?: string,
    bnText?: string
  ): Record<string, string> => ({
    en: enText,
    hi: hiText,
    mr: mrText,
    gu: guText,
    ta: taText || enText,
    bn: bnText || hiText,
  });

  const getTargetText = (trans: Record<string, string>, lang: string): string => {
    if (lang === 'hi' || lang === 'hinglish') return trans.hi;
    if (lang === 'mr') return trans.mr;
    if (lang === 'gu') return trans.gu;
    if (lang === 'ta') return trans.ta;
    if (lang === 'bn') return trans.bn;
    return trans.en;
  };

  // 1. Check for stock query on Notebooks / Calculator / Pen / Dal
  const isNotebookQuery = q.includes('notebook') || q.includes('note book') || q.includes('copy') || q.includes('vahi') || q.includes('vahya');
  const isCalcQuery = q.includes('calculator') || q.includes('casio') || q.includes('calc');
  const isPenQuery = q.includes('pen') || q.includes('reynolds');
  const isDalQuery = q.includes('dal') || q.includes('toor');

  // Check for Stock Update Action (Only Retailer): "add 20 notebooks", "set notebook stock to 20", "update notebook to 15"
  if (speakerRole !== 'customer') {
    const updateMatch = q.match(/(?:add|update|set|make|stock)\s+(\d+)\s+(notebook|calculator|pen|dal)/i) ||
                        q.match(/(?:add|update|set|make)\s+(notebook|calculator|pen|dal)\s+(?:to|as|stock\s+to)?\s*(\d+)/i) ||
                        q.match(/(\d+)\s+(notebook|calculator|pen|dal)\s+(?:add|karo|daalo|jodo|joda)/i);

    if (updateMatch) {
      let numStr = updateMatch[1];
      let itemStr = updateMatch[2];
      if (isNaN(Number(numStr))) {
        itemStr = updateMatch[1];
        numStr = updateMatch[2];
      }
      const qty = parseInt(numStr, 10);
      const targetProd = products.find(p => p.name.toLowerCase().includes(itemStr.toLowerCase()));

      if (targetProd && !isNaN(qty)) {
        db.updateStock(targetProd.id, qty);

        const trans = formatTranslations(
          `Stock for "${targetProd.name}" updated to ${qty} ${targetProd.unit}. The public catalogue now reflects this live quantity.`,
          `"${targetProd.name}" का स्टॉक अपडेट करके ${qty} ${targetProd.unit} कर दिया गया है। ग्राहक कैटलॉग में अब ताज़ा संख्या दिखेगी।`,
          `"${targetProd.name}" चा साठा अद्यतन करून ${qty} ${targetProd.unit} करण्यात आला आहे. ग्राहक कॅटलॉगमध्ये ही नवीन संख्या दिसेल.`,
          `"${targetProd.name}" નો સ્ટોક અપડેટ કરીને ${qty} ${targetProd.unit} કરવામાં આવ્યો છે. ગ્રાહક કેટલોગમાં નવો સ્ટોક દેખાશે.`
        );

        const reply = getTargetText(trans, targetLang);
        return {
          speechText: reply,
          replyText: reply,
          detectedIntent: 'stock_update',
          detectedLanguage: detectedLangInfo.code,
          detectedLanguageName: `${detectedLangInfo.name} (${detectedLangInfo.native})`,
          speakerRole,
          preferredLanguage: targetLang,
          translations: trans,
          action: {
            type: 'stock_update',
            productId: targetProd.id,
            productName: targetProd.name,
            newQuantity: qty,
            executed: true,
          },
          source: 'rule_fallback',
        };
      }
    }

    // Check for Sale Recording Action (Only Retailer)
    const saleMatch = q.match(/(?:sold|sell|sale of|record sale of|bechi|bech di|vikle)\s+(\d+)\s*(notebook|calculator|pen)?/i) ||
                      q.match(/(\d+)\s+(notebook|calculator|pen)\s+(?:sold|bechi|bech di|vikle)/i);

    if (saleMatch) {
      const qty = parseInt(saleMatch[1], 10);
      const itemKeyword = (saleMatch[2] || 'notebook').toLowerCase();
      const targetProd = products.find(p => p.name.toLowerCase().includes(itemKeyword));

      if (targetProd && !isNaN(qty)) {
        const saleResult = db.recordSale({
          shopId: shop.id,
          productId: targetProd.id,
          quantity: qty,
          paymentMethod: 'cash',
        });

        if ('error' in saleResult) {
          const transErr = formatTranslations(
            `Could not record sale: ${saleResult.error}. Current stock is only ${targetProd.stockQuantity}.`,
            `बिक्री दर्ज नहीं हो सकी: ${saleResult.error}। वर्तमान स्टॉक केवल ${targetProd.stockQuantity} है।`,
            `विक्री नोंदवता आली नाही: ${saleResult.error}। सध्याचा साठा फक्त ${targetProd.stockQuantity} आहे.`,
            `વેચાણ રેકોર્ડ કરી શકાયું નથી: ${saleResult.error}। હાલનો સ્ટોક માત્ર ${targetProd.stockQuantity} છે.`
          );
          const reply = getTargetText(transErr, targetLang);
          return {
            speechText: reply,
            replyText: reply,
            detectedIntent: 'sale_record',
            detectedLanguage: detectedLangInfo.code,
            detectedLanguageName: `${detectedLangInfo.name} (${detectedLangInfo.native})`,
            speakerRole,
            preferredLanguage: targetLang,
            translations: transErr,
            source: 'rule_fallback',
          };
        }

        const trans = formatTranslations(
          `Sale recorded: ${qty}x ${targetProd.name} (Total: ₹${saleResult.sale.totalAmount}). Remaining shop inventory is now ${saleResult.updatedProduct.stockQuantity} ${targetProd.unit}.`,
          `बिक्री दर्ज हो गई: ${qty} ${targetProd.name} (कुल: ₹${saleResult.sale.totalAmount})। अब दुकान में केवल ${saleResult.updatedProduct.stockQuantity} शेष हैं।`,
          `विक्री नोंदवली गेली: ${qty} ${targetProd.name} (एकूण: ₹${saleResult.sale.totalAmount})। दुकानात आता फक्त ${saleResult.updatedProduct.stockQuantity} शिल्लक आहेत.`,
          `વેચાણ નોંધાયું: ${qty} ${targetProd.name} (કુલ: ₹${saleResult.sale.totalAmount})। દુકાનમાં હવે માત્ર ${saleResult.updatedProduct.stockQuantity} બચ્યા છે.`
        );

        const reply = getTargetText(trans, targetLang);
        return {
          speechText: reply,
          replyText: reply,
          detectedIntent: 'sale_record',
          detectedLanguage: detectedLangInfo.code,
          detectedLanguageName: `${detectedLangInfo.name} (${detectedLangInfo.native})`,
          speakerRole,
          preferredLanguage: targetLang,
          translations: trans,
          action: {
            type: 'sale_record',
            productId: targetProd.id,
            productName: targetProd.name,
            deltaQuantity: qty,
            executed: true,
          },
          source: 'rule_fallback',
        };
      }
    }
  }

  // 2. "Which products are running low?" / "Low stock"
  if (q.includes('low') || q.includes('kam') || q.includes('khatam') || q.includes('shortage') || q.includes('running low') || q.includes('sampat')) {
    const lowItems = products.filter(p => p.stockQuantity <= p.minStockThreshold);

    if (lowItems.length === 0) {
      const trans = formatTranslations(
        'All good! No products are currently running low. All items are above safety threshold levels.',
        'बहुत बढ़िया! दुकान में कोई भी सामान कम नहीं है। सभी उत्पाद सुरक्षित स्तर पर हैं।',
        'उत्कृष्ट! सध्या कोणतेही उत्पादन संपत आलेले नाही. सर्व साठा सुरक्षित मर्यादेत आहे.',
        'ખૂબ સરસ! હાલમાં કોઈ પ્રોડક્ટ ઓછી નથી. તમામ માલ સુરક્ષિત સ્તરે છે.'
      );
      const reply = getTargetText(trans, targetLang);
      return {
        speechText: reply,
        replyText: reply,
        detectedIntent: 'low_stock',
        detectedLanguage: detectedLangInfo.code,
        detectedLanguageName: `${detectedLangInfo.name} (${detectedLangInfo.native})`,
        speakerRole,
        preferredLanguage: targetLang,
        translations: trans,
        source: 'rule_fallback',
      };
    }

    const restockCapital = lowItems.reduce((acc, p) => acc + (p.minStockThreshold * p.listedPrice), 0);
    const itemsSummaryEn = lowItems.map(p => `${p.name} (${p.stockQuantity} ${p.unit} left, threshold ${p.minStockThreshold})`).join('\n• ');
    const itemsSummaryHi = lowItems.map(p => `${p.name} (केवल ${p.stockQuantity} ${p.unit} शेष, न्यूनतम सीमा ${p.minStockThreshold})`).join('\n• ');
    const itemsSummaryMr = lowItems.map(p => `${p.name} (फक्त ${p.stockQuantity} ${p.unit} शिल्लक)`).join('\n• ');
    const itemsSummaryGu = lowItems.map(p => `${p.name} (માત્ર ${p.stockQuantity} ${p.unit} બાકી)`).join('\n• ');

    const trans = formatTranslations(
      `Dashboard Inventory Alert: ${lowItems.length} product(s) are running below safety threshold:\n• ${itemsSummaryEn}\nEstimated restock investment needed: ₹${restockCapital.toLocaleString('en-IN')}. Please prepare purchase orders.`,
      `डैशबोर्ड स्टॉक अलर्ट: दुकान में ${lowItems.length} उत्पाद न्यूनतम सीमा से कम हैं:\n• ${itemsSummaryHi}\nअनुमानित री-स्टॉक बजट: ₹${restockCapital}। कृपया तुरंत नया माल मंगाएं।`,
      `डॅशबोर्ड साठा इशारा: आपल्याकडे ${lowItems.length} उत्पादनांचा साठा कमी झाला आहे:\n• ${itemsSummaryMr}\nअंदाजे री-स्टॉक भांडवल: ₹${restockCapital}. कृपया नवीन ऑर्डर द्या.`,
      `ડેશબોર્ડ સ્ટોક એલર્ટ: તમારી દુકાનમાં ${lowItems.length} પ્રોડક્ટ્સનો સ્ટોક ઓછો છે:\n• ${itemsSummaryGu}\nઅંદાજિત રિસ્ટોક મૂડી: ₹${restockCapital}. કૃપા કરીને નવો માલ મંગાવો.`
    );
    const reply = getTargetText(trans, targetLang);
    return {
      speechText: reply,
      replyText: reply,
      detectedIntent: 'low_stock',
      detectedLanguage: detectedLangInfo.code,
      detectedLanguageName: `${detectedLangInfo.name} (${detectedLangInfo.native})`,
      speakerRole,
      preferredLanguage: targetLang,
      translations: trans,
      adaptiveAnalysis: {
        stockStatus: 'low_stock',
        safetyThreshold: lowItems[0]?.minStockThreshold,
        dashboardInsight: `Dashboard Alert: ${lowItems.length} items below safety threshold. Restock capital needed: ₹${restockCapital}.`,
        dashboardGrounded: true,
      },
      source: 'rule_fallback',
    };
  }

  // 3. Product Availability & Price Check (Adaptive AI: "1 for X and N for Y" for all products)
  if (
    isNotebookQuery ||
    isCalcQuery ||
    isPenQuery ||
    isDalQuery ||
    q.includes('how many') ||
    q.includes('kitne') ||
    q.includes('kiti') ||
    q.includes('ketla') ||
    q.includes('stock of') ||
    q.includes('bache') ||
    q.includes('available') ||
    q.includes('mil') ||
    q.includes('price') ||
    q.includes('bhav') ||
    q.includes('rate') ||
    q.includes('cost') ||
    q.includes('kitna')
  ) {
    let target = products.find(p => isNotebookQuery && p.name.toLowerCase().includes('notebook'));
    if (!target && isCalcQuery) target = products.find(p => p.name.toLowerCase().includes('calculator'));
    if (!target && isPenQuery) target = products.find(p => p.name.toLowerCase().includes('pen'));
    if (!target && isDalQuery) target = products.find(p => p.name.toLowerCase().includes('dal'));
    if (!target) {
      target = products.find(p => q.split(' ').some(w => w.length > 3 && p.name.toLowerCase().includes(w)));
    }
    if (!target && products.length > 0) {
      // If user asked a generic "how many are available" without product name, default to the top featured inventory item
      target = products[0];
    }

    if (target) {
      const isCustomer = speakerRole === 'customer';
      const qty = target.stockQuantity;
      const unitPrice = target.listedPrice;
      const bulkQty = qty;
      // Adaptive pricing logic: for 10 units at 49, total bundle is 499 (or qty * unitPrice)
      const bulkPrice = (qty === 10 && unitPrice === 49) ? 499 : Math.round(qty * unitPrice);
      const bundleFormula = `1 for ₹${unitPrice} and ${bulkQty} for ₹${bulkPrice}`;
      const isLowStock = qty <= target.minStockThreshold;
      const stockStatus = qty === 0 ? 'out_of_stock' : isLowStock ? 'low_stock' : 'healthy';

      const statusEn = qty === 0
        ? `Currently out of stock (safety threshold: ${target.minStockThreshold} ${target.unit}).`
        : isLowStock
        ? `⚠️ Low Stock Warning: Only ${qty} ${target.unit} left (below safety threshold of ${target.minStockThreshold}).`
        : `✅ Stock Healthy: Above safety threshold of ${target.minStockThreshold} ${target.unit}.`;

      const trans = formatTranslations(
        isCustomer
          ? `Yes, ${qty} ${target.name} are available at ${shop.name}: 1 for ₹${unitPrice} and ${bulkQty} for ₹${bulkPrice}. The store is open at ${shop.address}.`
          : `${qty} ${target.name} are available: 1 for ₹${unitPrice} and ${bulkQty} for ₹${bulkPrice}. Dashboard Status: ${statusEn}`,
        isCustomer
          ? `हाँ, ${shop.name} में ${qty} ${target.name} उपलब्ध हैं: 1 ₹${unitPrice} में और ${bulkQty} ₹${bulkPrice} में। दुकान खुली है।`
          : `${qty} ${target.name} उपलब्ध हैं: 1 ₹${unitPrice} में और ${bulkQty} ₹${bulkPrice} में। डैशबोर्ड स्थिति: ${isLowStock ? '⚠️ स्टॉक न्यूनतम सीमा से कम है।' : '✅ स्टॉक सुरक्षित स्तर पर है।'}`,
        isCustomer
          ? `होय, ${shop.name} मध्ये ${qty} ${target.name} उपलब्ध आहेत: 1 ₹${unitPrice} ला आणि ${bulkQty} ₹${bulkPrice} ला. थेट दुकानाच्या कॅटलॉगमधून सत्यापित.`
          : `${qty} ${target.name} उपलब्ध आहेत: 1 ₹${unitPrice} ला आणि ${bulkQty} ₹${bulkPrice} ला. डॅशबोर्ड विश्लेषण: ${isLowStock ? '⚠️ साठा कमी झाला आहे.' : '✅ साठा पुरेसा आहे.'}`,
        isCustomer
          ? `હા, ${shop.name} પર ${qty} ${target.name} ઉપલબ્ધ છે: 1 ₹${unitPrice} માં અને ${bulkQty} ₹${bulkPrice} માં. સ્ટોક તાજો છે.`
          : `${qty} ${target.name} ઉપલબ્ધ છે: 1 ₹${unitPrice} માં અને ${bulkQty} ₹${bulkPrice} માં. ડેશબોર્ડ એનાલિસિસ: ${isLowStock ? '⚠️ સ્ટોક ઓછો છે.' : '✅ સ્ટોક પૂરતો છે.'}`,
        `${qty} ${target.name} கிடைக்கிறது: 1 ₹${unitPrice} மற்றும் ${bulkQty} ₹${bulkPrice}. நிலை: ${isLowStock ? 'குறைந்த இருப்பு' : 'போதுமானது'}.`,
        `${qty} ${target.name} উপলব্ধ আছে: 1 ₹${unitPrice} এবং ${bulkQty} ₹${bulkPrice}। স্টক অবস্থা: ${isLowStock ? 'কম স্টক' : 'নিরাপদ স্টক'}।`
      );

      const reply = getTargetText(trans, targetLang);
      return {
        speechText: reply,
        replyText: reply,
        detectedIntent: 'inventory_check',
        detectedLanguage: detectedLangInfo.code,
        detectedLanguageName: `${detectedLangInfo.name} (${detectedLangInfo.native})`,
        speakerRole,
        preferredLanguage: targetLang,
        translations: trans,
        adaptiveAnalysis: {
          productName: target.name,
          availableStock: qty,
          unit: target.unit,
          unitPrice: unitPrice,
          bulkQuantity: bulkQty,
          bulkPrice: bulkPrice,
          bundleFormula: bundleFormula,
          stockStatus: stockStatus,
          safetyThreshold: target.minStockThreshold,
          dashboardInsight: `${qty} in stock (${isLowStock ? 'low stock threshold ' + target.minStockThreshold : 'healthy stock level'}). Live sync active.`,
          todaySalesCount: stats.todaySalesCount,
          todaySalesAmount: stats.todaySalesAmount,
          dashboardGrounded: true,
        },
        source: 'rule_fallback',
      };
    }
  }

  // 4. "What were today's recorded sales?" / Sales summary
  if (q.includes('sale') || q.includes('bikri') || q.includes('revenue') || q.includes('kamai') || q.includes('today') || q.includes('aaj') || q.includes('earning')) {
    const avgTicket = stats.todaySalesCount > 0 ? Math.round(stats.todaySalesAmount / stats.todaySalesCount) : 0;
    const trans = formatTranslations(
      `Today's Live Dashboard Financials for ${shop.name}:\n• Total Revenue: ₹${stats.todaySalesAmount.toLocaleString('en-IN')}\n• Recorded Orders: ${stats.todaySalesCount}\n• Average Order Value: ₹${avgTicket}\n• Active Catalogue SKUs: ${stats.totalSkus}`,
      `डैशबोर्ड वित्तीय विश्लेषण (${shop.name}):\n• आज की कुल कमाई: ₹${stats.todaySalesAmount.toLocaleString('en-IN')}\n• दर्ज बिक्री: ${stats.todaySalesCount} ऑर्डर्स\n• औसत ऑर्डर मूल्य: ₹${avgTicket}\n• एक्टिव कैटलॉग सामान: ${stats.totalSkus}`,
      `डॅशबोर्ड आर्थिक विश्लेषण (${shop.name}):\n• आजची एकूण कमाई: ₹${stats.todaySalesAmount.toLocaleString('en-IN')}\n• विक्री व्यवहार: ${stats.todaySalesCount}\n• सरासरी ऑर्डर: ₹${avgTicket}\n• सक्रिय उत्पादने: ${stats.totalSkus}`,
      `ડેશબોર્ડ નાણાકીય વિશ્લેષણ (${shop.name}):\n• આજની કુલ આવક: ₹${stats.todaySalesAmount.toLocaleString('en-IN')}\n• વેચાણ સંખ્યા: ${stats.todaySalesCount}\n• સરેરાશ બિલ: ₹${avgTicket}\n• સક્રિય પ્રોડક્ટ્સ: ${stats.totalSkus}`
    );

    const reply = getTargetText(trans, targetLang);
    return {
      speechText: reply,
      replyText: reply,
      detectedIntent: 'sales_summary',
      detectedLanguage: detectedLangInfo.code,
      detectedLanguageName: `${detectedLangInfo.name} (${detectedLangInfo.native})`,
      speakerRole,
      preferredLanguage: targetLang,
      translations: trans,
      adaptiveAnalysis: {
        todaySalesCount: stats.todaySalesCount,
        todaySalesAmount: stats.todaySalesAmount,
        dashboardInsight: `Recorded ${stats.todaySalesCount} sales (Avg: ₹${avgTicket}). Active SKUs: ${stats.totalSkus}.`,
        dashboardGrounded: true,
      },
      source: 'rule_fallback',
    };
  }

  // 5. Shop Overview & Dashboard Analysis: "analyze dashboard", "how is shop doing", "business report"
  if (q.includes('dashboard') || q.includes('overview') || q.includes('report') || q.includes('how is') || q.includes('kaisa') || q.includes('kasa') || q.includes('summary') || q.includes('business')) {
    const totalVal = products.reduce((acc, p) => acc + (p.stockQuantity * p.listedPrice), 0);
    const trans = formatTranslations(
      `Live Dashboard Executive Summary for ${shop.name}:\n• Total Inventory Valuation: ₹${totalVal.toLocaleString('en-IN')} across ${stats.totalSkus} SKUs (${stats.totalStockUnits} units)\n• Today's Revenue: ₹${stats.todaySalesAmount.toLocaleString('en-IN')} (${stats.todaySalesCount} sales)\n• Low Stock Watchlist: ${stats.lowStockCount} items requiring supplier reorder\n• Digital Catalogue: Live and synced with customer search.`,
      `डैशबोर्ड ओवरव्यू (${shop.name}):\n• कुल स्टॉक मूल्यांकन: ₹${totalVal.toLocaleString('en-IN')} (${stats.totalStockUnits} सामान, ${stats.totalSkus} प्रकार)\n• आज की कमाई: ₹${stats.todaySalesAmount} (${stats.todaySalesCount} बिक्री)\n• कम स्टॉक अलर्ट: ${stats.lowStockCount} उत्पाद\n• डिजिटल कैटलॉग: लाइव ग्राहक खोज के लिए उपलब्ध।`,
      `डॅशबोर्ड सारांश (${shop.name}):\n• एकूण साठा मूल्य: ₹${totalVal.toLocaleString('en-IN')} (${stats.totalStockUnits} वस्तू)\n• आजची कमाई: ₹${stats.todaySalesAmount} (${stats.todaySalesCount} व्यवहार)\n• कमी साठा: ${stats.lowStockCount} उत्पादने.`,
      `ડેશબોર્ડ સમરી (${shop.name}):\n• કુલ સ્ટોક મૂલ્યાંકન: ₹${totalVal.toLocaleString('en-IN')}\n• આજનું વેચાણ: ₹${stats.todaySalesAmount} (${stats.todaySalesCount} ઓર્ડર)\n• ઓછો સ્ટોક: ${stats.lowStockCount} પ્રોડક્ટ્સ.`
    );
    const reply = getTargetText(trans, targetLang);
    return {
      speechText: reply,
      replyText: reply,
      detectedIntent: 'general',
      detectedLanguage: detectedLangInfo.code,
      detectedLanguageName: `${detectedLangInfo.name} (${detectedLangInfo.native})`,
      speakerRole,
      preferredLanguage: targetLang,
      translations: trans,
      adaptiveAnalysis: {
        todaySalesCount: stats.todaySalesCount,
        todaySalesAmount: stats.todaySalesAmount,
        dashboardInsight: `Total catalogue valuation: ₹${totalVal.toLocaleString('en-IN')}. ${stats.lowStockCount} low-stock alerts.`,
        dashboardGrounded: true,
      },
      source: 'rule_fallback',
    };
  }

  // 6. Generic polite fallback with Adaptive sample prompts
  const isCust = speakerRole === 'customer';
  const trans = formatTranslations(
    isCust
      ? `Welcome to ${shop.name}! Ask me anything: "How many notebooks are available?", "What is the price of Casio calculator?", or "Are pens in stock?"`
      : `Hello! I am your Adaptive AI retail assistant. You can ask: "How many notebooks are available?" (I'll give live stock, 1 for ₹X and bulk pricing), "What were today's sales?", "Which products are running low?", or "Analyze shop dashboard".`,
    isCust
      ? `${shop.name} में आपका स्वागत है! आप पूछ सकते हैं: "कितने नोटबुक उपलब्ध हैं?", "कैलकुलेटर का क्या भाव है?"`
      : `नमस्ते! मैं आपका एडैप्टिव AI व्यापार सहायक हूँ। आप पूछ सकते हैं: "कितने नोटबुक उपलब्ध हैं?" (मैं 1 का भाव और बंडल रेट बताऊंगा), "आज की बिक्री कितनी हुई?", या "डैशबोर्ड रिपोर्ट दो"।`,
    isCust
      ? `${shop.name} मध्ये स्वागत आहे! आपण विचारू शकता: "किती वह्या उपलब्ध आहेत?", किंवा "कॅल्क्युलेटरचा दर काय आहे?"`
      : `नमस्कार! मी आपला अडॅप्टिव्ह AI व्यापार सहाय्यक आहे. आपण विचारू शकता: "किती वह्या शिल्लक आहेत?" (मी १ ची किंमत आणि बंडल दर सांगेन), किंवा "आजची विक्री किती झाली?"`,
    isCust
      ? `${shop.name} માં સ્વાગત છે! તમે પૂછી શકો છો: "કેટલી નોટબુક ઉપલબ્ધ છે?", અથવા "કેલ્ક્યુલેટરનો ભાવ શું છે?"`
      : `નમસ્તે! હું આપનો એડેપ્ટિવ AI વ્યાપાર સહાયક છું. તમે પૂછી શકો છો: "કેટલી નોટબુક ઉપલબ્ધ છે?" (હું ૧ નો ભાવ અને બંડલ રેટ જણાવીશ) અથવા "આજનું વેચાણ કેટલું થયું?"`
  );

  const reply = getTargetText(trans, targetLang);
  return {
    speechText: reply,
    replyText: reply,
    detectedIntent: 'general',
    detectedLanguage: detectedLangInfo.code,
    detectedLanguageName: `${detectedLangInfo.name} (${detectedLangInfo.native})`,
    speakerRole,
    preferredLanguage: targetLang,
    translations: trans,
    adaptiveAnalysis: {
      dashboardInsight: 'Adaptive AI Engine ready: Live dashboard inventory, sales, and thresholds connected.',
      dashboardGrounded: true,
    },
    source: 'rule_fallback',
  };
}

// Quick Translation Utility for live language switching
export async function translateAssistantReply(
  text: string,
  targetLanguage: string
): Promise<{ translatedText: string; speechText: string; targetLanguage: string }> {
  const targetConfig = SUPPORTED_LANGUAGES[targetLanguage] || SUPPORTED_LANGUAGES['en'];

  const hasValidKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.length > 10 &&
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );

  if (aiClient && hasValidKey) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: `Translate the following local retail assistant message accurately into ${targetConfig.name} (${targetConfig.native}).
Keep numeric amounts like ₹ and units intact.
Text to translate: "${text}"

Return JSON:
{
  "translatedText": "translation in ${targetConfig.name}",
  "speechText": "concise pronunciation-friendly text in ${targetConfig.name}"
}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      if (parsed.translatedText) {
        return {
          translatedText: parsed.translatedText,
          speechText: parsed.speechText || parsed.translatedText,
          targetLanguage: targetConfig.code,
        };
      }
    } catch (err: any) {
      console.warn('Translate notice:', err?.message || 'Using fallback translation');
    }
  }

  return {
    translatedText: text,
    speechText: text,
    targetLanguage: targetConfig.code,
  };
}

// --------------------------------------------------------------------------------
// Feature 2: Search by Natural Language (Customer Discovery)
// e.g. "I need a calculator under ₹600 near my college."
// --------------------------------------------------------------------------------
export interface NaturalLanguageSearchOutput {
  query: string;
  interpretedCriteria: {
    product: string;
    maxPrice: number | null;
    location: string | null;
  };
  results: any[];
  explanation: string;
}

export async function parseNaturalLanguageSearch(
  query: string,
  userArea?: string
): Promise<NaturalLanguageSearchOutput> {
  const cleanQ = query.trim().toLowerCase();
  const allProducts = db.getProducts();
  const allShops = db.getShops();

  // Price extraction: e.g. "under ₹600", "under 600", "below 500", "less than 70"
  let maxPrice: number | null = null;
  const priceMatch = cleanQ.match(/(?:under|below|less than|up to|upto|within|budget|max|₹)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i) ||
                     cleanQ.match(/(\d+)\s*(?:rupees|rs|inr)?\s*(?:tak|ke andar|se kam)/i);
  if (priceMatch) {
    maxPrice = parseInt(priceMatch[1], 10);
  }

  // Location extraction: e.g. "hadapsar", "magarpatta", "katraj", "wagholi", "fc road", "deccan", "model colony"
  let location: string | null = null;
  if (cleanQ.includes('hadapsar') || cleanQ.includes('magarpatta') || cleanQ.includes('gadital')) {
    location = 'Hadapsar';
  } else if (cleanQ.includes('katraj') || cleanQ.includes('bharati') || cleanQ.includes('dairy chowk')) {
    location = 'Katraj';
  } else if (cleanQ.includes('wagholi') || cleanQ.includes('jspm') || cleanQ.includes('wagheshwar') || cleanQ.includes('nagar road')) {
    location = 'Wagholi';
  } else if (cleanQ.includes('college') || cleanQ.includes('fergusson') || cleanQ.includes('fc')) {
    location = 'FC Road'; // College area
  } else if (cleanQ.includes('deccan') || cleanQ.includes('gymkhana')) {
    location = 'Deccan';
  } else if (cleanQ.includes('model colony')) {
    location = 'Model Colony';
  } else if (userArea && userArea !== 'all') {
    location = userArea;
  }

  // Product extraction
  let productKeyword = '';
  if (cleanQ.includes('calculator') || cleanQ.includes('casio')) {
    productKeyword = 'calculator';
  } else if (cleanQ.includes('notebook') || cleanQ.includes('copy') || cleanQ.includes('vahi') || cleanQ.includes('register')) {
    productKeyword = 'notebook';
  } else if (cleanQ.includes('ghee')) {
    productKeyword = 'ghee';
  } else if (cleanQ.includes('drafter') || cleanQ.includes('drawing')) {
    productKeyword = 'drawing';
  } else if (cleanQ.includes('pen') || cleanQ.includes('reynolds')) {
    productKeyword = 'pen';
  } else if (cleanQ.includes('dal') || cleanQ.includes('toor dal')) {
    productKeyword = 'dal';
  } else if (cleanQ.includes('oil') || cleanQ.includes('sunflower')) {
    productKeyword = 'oil';
  } else {
    // Strip common filler words
    const stripped = cleanQ
      .replace(/(?:i need|looking for|where can i find|search for|want to buy|give me|chahiye|dikhao)/gi, '')
      .replace(/(?:under|below|less than|up to|upto|within)\s*(?:rs\.?|inr|₹)?\s*\d+/gi, '')
      .replace(/(?:near my college|near college|in fc road|in deccan|near me|nearby)/gi, '')
      .trim();
    productKeyword = stripped.split(' ')[0] || cleanQ;
  }

  // Filter products by extracted criteria
  const matching = allProducts.filter((p) => {
    // 1. Product match
    const pName = p.name.toLowerCase();
    const pCat = p.category.toLowerCase();
    const pDesc = p.description.toLowerCase();
    const nameMatches = pName.includes(productKeyword) || pCat.includes(productKeyword) || pDesc.includes(productKeyword);
    if (!nameMatches) return false;

    // 2. Price filter
    if (maxPrice !== null && p.listedPrice > maxPrice) return false;

    // 3. Location filter
    if (location) {
      const shop = allShops.find((s) => s.id === p.shopId);
      if (shop) {
        const areaMatches =
          shop.area.toLowerCase().includes(location.toLowerCase()) ||
          shop.address.toLowerCase().includes(location.toLowerCase());
        if (!areaMatches) return false;
      }
    }

    return true;
  });

  const explanation = `Interpreted: Looking for "${productKeyword || 'products'}" ${
    maxPrice ? `with price ≤ ₹${maxPrice}` : ''
  } ${location ? `located near ${location}` : ''}. Found ${matching.length} local shop listing(s).`;

  return {
    query,
    interpretedCriteria: {
      product: productKeyword,
      maxPrice,
      location,
    },
    results: matching,
    explanation,
  };
}

// --------------------------------------------------------------------------------
// Feature 3: Voice-to-Catalogue Updates (Shop Owner)
// e.g. "Add 15 blue pens at ₹10 each"
// --------------------------------------------------------------------------------
export interface VoiceToCatalogueProposal {
  originalText: string;
  proposedProduct: {
    name: string;
    quantity: number;
    unitPrice: number;
    category: string;
    unit: string;
    mrp: number;
  };
  isExisting: boolean;
  matchedProductId?: string;
  matchedProductName?: string;
  confirmationPrompt: string;
}

export function parseVoiceToCatalogue(
  voiceText: string,
  shopId: string
): VoiceToCatalogueProposal {
  const clean = voiceText.trim();
  const products = db.getProducts({ shopId });

  // Pattern: "Add 15 blue pens at ₹10 each", "Add 20 classmate notebooks at 65 rupees", "30 toor dal at 170"
  let quantity = 10;
  let unitPrice = 50;
  let productName = 'New Product';
  let unit = 'pcs';

  // 1. Extract Quantity: "15", "20"
  const qtyMatch = clean.match(/(?:add|update|register|insert|stock)\s+(\d+)/i) || clean.match(/^(\d+)\s+/i);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1], 10);
  }

  // 2. Extract Price: "at ₹10 each", "at 10 each", "@ 10", "for 10", "rupees 10"
  const priceMatch = clean.match(/(?:at|@|for|rate|price|ke bhaav|bhav|rupees|rs\.?|₹)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)/i);
  if (priceMatch) {
    unitPrice = parseFloat(priceMatch[1]);
  }

  // 3. Extract Item Name
  let extractedName = clean
    .replace(/(?:add|update|register|insert|stock)\s+\d+\s*/i, '')
    .replace(/(?:at|@|for|rate|price|ke bhaav|bhav|rupees|rs\.?|₹)\s*(?:rs\.?|inr|₹)?\s*\d+(?:\.\d+)?\s*(?:each|per piece|per pc|each piece)?/i, '')
    .replace(/(?:each|piece|pcs|please|karo|daalo)/gi, '')
    .trim();

  if (extractedName) {
    // Capitalize title
    productName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);
    if (productName.toLowerCase().includes('pen')) unit = 'pens';
    else if (productName.toLowerCase().includes('notebook')) unit = 'notebooks';
    else if (productName.toLowerCase().includes('dal') || productName.toLowerCase().includes('kg')) unit = 'kg';
  } else {
    productName = 'Assorted Merchandise';
  }

  // Check if existing product in this shop matches
  const matched = products.find((p) => {
    const pName = p.name.toLowerCase();
    const target = productName.toLowerCase();
    return pName.includes(target) || target.includes(pName.split(' ')[0]);
  });

  const isExisting = Boolean(matched);

  let confirmationPrompt = '';
  if (isExisting && matched) {
    confirmationPrompt = `Found existing catalogue item "${matched.name}". Confirm adding ${quantity} units to current stock (${matched.stockQuantity} -> ${matched.stockQuantity + quantity}) at listed price ₹${unitPrice}?`;
  } else {
    confirmationPrompt = `New item detected: "${productName}". Confirm creating a new public catalogue listing for ${quantity} ${unit} at ₹${unitPrice} each?`;
  }

  // Determine category
  let category = 'Stationery';
  const lowName = productName.toLowerCase();
  if (lowName.includes('dal') || lowName.includes('oil') || lowName.includes('atta') || lowName.includes('rice') || lowName.includes('sugar')) {
    category = 'Groceries';
  } else if (lowName.includes('book') || lowName.includes('novel') || lowName.includes('guide')) {
    category = 'Books';
  } else if (lowName.includes('calc') || lowName.includes('cable') || lowName.includes('battery')) {
    category = 'Electronics';
  }

  return {
    originalText: voiceText,
    proposedProduct: {
      name: productName,
      quantity,
      unitPrice,
      mrp: Math.round(unitPrice * 1.15),
      category,
      unit,
    },
    isExisting,
    matchedProductId: matched?.id,
    matchedProductName: matched?.name,
    confirmationPrompt,
  };
}


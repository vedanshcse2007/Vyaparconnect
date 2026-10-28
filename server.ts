import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { db } from './src/server/db.ts';
import {
  processVoiceQuery,
  parseNaturalLanguageSearch,
  parseVoiceToCatalogue,
  transcribeAudio,
  translateAssistantReply,
  detectSpokenLanguage,
} from './src/server/aiService.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', platform: 'VyaparConnect AI', timestamp: new Date().toISOString() });
});

// Shops
app.get('/api/shops', (_req: Request, res: Response) => {
  res.json(db.getShops());
});

app.get('/api/shops/:id', (req: Request, res: Response) => {
  const shop = db.getShopById(req.params.id);
  if (!shop) {
    return res.status(404).json({ error: 'Shop not found' });
  }
  res.json(shop);
});

app.put('/api/shops/:id', (req: Request, res: Response) => {
  const updated = db.updateShop(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Shop not found' });
  }
  res.json(updated);
});

app.get('/api/shops/:id/stats', (req: Request, res: Response) => {
  res.json(db.getShopStats(req.params.id));
});

// Pune Areas Detailed Information
app.get('/api/areas', (_req: Request, res: Response) => {
  res.json(db.getAreasInfo());
});

app.get('/api/areas/:name', (req: Request, res: Response) => {
  const info = db.getAreaByName(req.params.name);
  if (!info) {
    return res.status(404).json({ error: 'Area not found' });
  }
  res.json(info);
});

// Products
app.get('/api/products', (req: Request, res: Response) => {
  const { shopId, query, category } = req.query;
  const products = db.getProducts({
    shopId: shopId as string | undefined,
    query: query as string | undefined,
    category: category as string | undefined,
  });
  res.json(products);
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  // Find matching comparison products in other shops
  const allProducts = db.getProducts();
  const comparisonProducts = allProducts.filter(p => 
    p.id !== product.id && 
    (p.name.toLowerCase() === product.name.toLowerCase() || 
     (product.sku && p.sku && p.sku === product.sku) ||
     p.name.toLowerCase().includes(product.name.toLowerCase().split(' ')[0]))
  );

  res.json({ product, comparisons: comparisonProducts });
});

app.post('/api/products', (req: Request, res: Response) => {
  try {
    const newProduct = db.addProduct(req.body);
    res.status(201).json(newProduct);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to add product' });
  }
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(updated);
});

app.patch('/api/products/:id/stock', (req: Request, res: Response) => {
  const { stockQuantity } = req.body;
  if (stockQuantity === undefined || isNaN(Number(stockQuantity))) {
    return res.status(400).json({ error: 'Invalid stock quantity' });
  }
  const updated = db.updateStock(req.params.id, Number(stockQuantity));
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(updated);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const deleted = db.deleteProduct(req.params.id);
  res.json({ success: deleted });
});

// Sales
app.get('/api/sales', (req: Request, res: Response) => {
  const { shopId } = req.query;
  const sales = db.getSales(shopId as string | undefined);
  res.json(sales);
});

app.post('/api/sales', (req: Request, res: Response) => {
  const { shopId, productId, quantity, unitPrice, paymentMethod, customerName } = req.body;
  if (!shopId || !productId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid sale transaction payload' });
  }

  const result = db.recordSale({
    shopId,
    productId,
    quantity: Number(quantity),
    unitPrice: unitPrice ? Number(unitPrice) : undefined,
    paymentMethod: paymentMethod || 'cash',
    customerName,
  });

  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }

  res.status(201).json(result);
});

// Enquiries
app.get('/api/enquiries', (req: Request, res: Response) => {
  const { shopId } = req.query;
  res.json(db.getEnquiries(shopId as string | undefined));
});

app.post('/api/enquiries', (req: Request, res: Response) => {
  const { shopId, productId, productName, customerName, customerPhone, message } = req.body;
  if (!shopId || !customerName || !message) {
    return res.status(400).json({ error: 'Shop, customer name, and message are required' });
  }

  const newEnq = db.createEnquiry({
    shopId,
    productId,
    productName,
    customerName,
    customerPhone: customerPhone || '',
    message,
  });

  res.status(201).json(newEnq);
});

app.post('/api/enquiries/:id/reply', (req: Request, res: Response) => {
  const { reply } = req.body;
  if (!reply) {
    return res.status(400).json({ error: 'Reply message cannot be empty' });
  }
  const updated = db.replyToEnquiry(req.params.id, reply);
  if (!updated) {
    return res.status(404).json({ error: 'Enquiry not found' });
  }
  res.json(updated);
});

// Voice Assistant Route with Speaker Attribution, Language Detection & Preferred Language
app.post('/api/voice-query', async (req: Request, res: Response) => {
  const { query, shopId, language, preferredLanguage, speakerRole, spokenLanguage } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const targetLang = preferredLanguage || language || 'hi';
    const role = speakerRole || 'retailer';
    const result = await processVoiceQuery(query, shopId || 'shop-abc', targetLang, role, spokenLanguage);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error processing query' });
  }
});

// Audio Transcription using Gemini 3.5 Transcribe
app.post('/api/transcribe-audio', async (req: Request, res: Response) => {
  const { audioBase64, mimeType, speakerRole } = req.body;
  if (!audioBase64) {
    return res.status(400).json({ error: 'Audio data is required' });
  }

  try {
    const transcription = await transcribeAudio(audioBase64, mimeType || 'audio/webm', speakerRole || 'retailer');
    res.json(transcription);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to transcribe audio' });
  }
});

// Dynamic Translation of Assistant Response into Preferred Language
app.post('/api/translate-text', async (req: Request, res: Response) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'Text and targetLanguage are required' });
  }

  try {
    const result = await translateAssistantReply(text, targetLanguage);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to translate' });
  }
});

// Shop Registration (Phase 1)
app.post('/api/shops/register', (req: Request, res: Response) => {
  const { name, ownerName, category, address, area, phone, upiId, openingHours } = req.body;
  if (!name || !ownerName || !phone) {
    return res.status(400).json({ error: 'Shop name, owner name, and phone are required' });
  }
  const newShop = db.registerShop({
    name,
    ownerName,
    category: category || 'General Retail & Daily Needs',
    address: address || 'Pune Local Market',
    area: area || 'FC Road',
    phone,
    upiId: upiId || '',
    openingHours,
  });
  res.status(201).json(newShop);
});

// Natural Language Product Search (Feature 2)
// e.g. "I need a calculator under ₹600 near my college."
app.post('/api/search/natural-language', async (req: Request, res: Response) => {
  const { query, userArea } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  try {
    const output = await parseNaturalLanguageSearch(query, userArea);
    res.json(output);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error parsing natural language search' });
  }
});

// Voice-to-Catalogue Proposals (Feature 3)
// e.g. "Add 15 blue pens at ₹10 each"
app.post('/api/voice-to-catalogue/extract', (req: Request, res: Response) => {
  const { text, shopId } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Voice command text is required' });
  }
  const proposal = parseVoiceToCatalogue(text, shopId || 'shop-abc');
  res.json(proposal);
});

app.post('/api/voice-to-catalogue/confirm', (req: Request, res: Response) => {
  const { shopId, proposal, confirmedAsNew } = req.body;
  if (!shopId || !proposal) {
    return res.status(400).json({ error: 'Shop ID and proposal are required' });
  }

  const shop = db.getShopById(shopId) || db.getShops()[0];

  // If existing product linked
  if (proposal.matchedProductId && !confirmedAsNew) {
    const existing = db.getProductById(proposal.matchedProductId);
    if (existing) {
      const updatedStock = existing.stockQuantity + proposal.proposedProduct.quantity;
      const updated = db.updateStock(existing.id, updatedStock);
      // Also update listed price if provided
      if (proposal.proposedProduct.unitPrice) {
        db.updateProduct(existing.id, { listedPrice: proposal.proposedProduct.unitPrice });
      }
      return res.json({
        success: true,
        action: 'stock_incremented',
        product: updated,
        message: `Updated stock of existing product "${existing.name}" to ${updatedStock} units at ₹${proposal.proposedProduct.unitPrice}.`,
      });
    }
  }

  // Otherwise create new catalogue product
  const newProduct = db.addProduct({
    shopId: shop.id,
    shopName: shop.name,
    name: proposal.proposedProduct.name,
    category: proposal.proposedProduct.category || 'Stationery',
    description: `Freshly stocked item added by voice assistant command: "${proposal.originalText}".`,
    listedPrice: proposal.proposedProduct.unitPrice,
    mrp: proposal.proposedProduct.mrp || Math.round(proposal.proposedProduct.unitPrice * 1.15),
    stockQuantity: proposal.proposedProduct.quantity,
    minStockThreshold: 4,
    unit: proposal.proposedProduct.unit || 'pcs',
    sku: `VC-${Date.now().toString().slice(-5)}`,
    isPublic: true,
  });

  res.status(201).json({
    success: true,
    action: 'new_product_created',
    product: newProduct,
    message: `Added brand new product "${newProduct.name}" (${newProduct.stockQuantity} ${newProduct.unit} @ ₹${newProduct.listedPrice}) to your public catalogue.`,
  });
});

// Reset Demo State
app.post('/api/reset-demo', (_req: Request, res: Response) => {
  db.seed();
  res.json({ message: 'Central database reset to initial demonstration state' });
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VyaparConnect AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

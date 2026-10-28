# VyaparConnect AI — Local Products, Smarter Shops
> **An Intelligent Local Commerce & Voice-Enabled Retail Management Platform for Small Retailers**  
> *Built for Student Hackathons, Retail Tech Innovations & Digital Inclusion*

---

## 🌟 Executive Summary

Local shoppers frequently waste time traveling between neighborhood stores or making multiple phone calls trying to find specific items, compare prices, and confirm whether products are currently in stock. Simultaneously, small retail stores (kirana stores, local stationery shops, neighborhood pharmacies, and hardware stores) lack accessible, affordable digital tools to maintain online product catalogues, track inventory, and connect directly with local foot-traffic customers.

**VyaparConnect AI** bridges this divide by providing:
1. **A Customer Discovery Marketplace** — Search local products, compare listed prices across nearby shops, view 3-tier stock freshness status, and send instant product inquiries.
2. **A Shop Owner Management Portal** — Manage catalogues, perform atomic sales deductions, track daily revenue, and update stock.
3. **VyaparVoice** — A speech-to-text, multilingual retail assistant that answers natural language inventory queries (*"Which products are running low?"*, *"How many notebooks are in stock?"*) and safely modifies stock via an interactive confirmation modal.
4. **Unified Single-Source Database** — Shop inventory adjustments instantly propagate to customer-facing search results.

---

## 🏗️ Architecture & Technology Stack

The platform is designed with a clean, decoupled architecture:

```
┌────────────────────────────────────────────────────────┐
│                   VyaparConnect AI                     │
├──────────────────────────┬─────────────────────────────┤
│   Customer Marketplace   │    Shop Owner Dashboard     │
│  - Product Discovery     │    - Real-time Inventory    │
│  - Price Comparison      │    - Point-of-Sale (Sales)  │
│  - Availability Status   │    - Inquiries Manager      │
│  - Customer Inquiries    │    - VyaparVoice Assistant  │
└────────────┬─────────────┴──────────────┬──────────────┘
             │                            │
             ▼                            ▼
┌────────────────────────────────────────────────────────┐
│           Express Full-Stack REST Backend              │
│  - Server-side atomic stock deductions & validations   │
│  - In-memory transactional data store (SQLite model)   │
│  - Natural language parsing & query processing         │
│  - Dual-sided authentication & session verification    │
└────────────────────────────────────────────────────────┘
```

- **Frontend**: React 19, TypeScript, Tailwind CSS (v4), Lucide React Icons.
- **Backend API**: Node.js + Express proxy server (`server.ts`) hosting REST endpoints.
- **Voice Pipeline**: Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) with voice synthesis (`window.speechSynthesis`) and keyboard/text fallbacks.
- **Port**: Runs on port `3000`.

---

## 🚀 How to Run the Application

### Prerequisites
- Node.js (v18 or newer)
- npm or bun

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`. Both the React frontend and the Express backend API run concurrently from `server.ts`.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Key Features & Technical Highlights

### 1. 3-Tier Availability Confidence Indicator
Addresses the primary weakness of local directories (stale or unverified inventory):
- 🟢 **Recently Confirmed**: Inventory verified or updated by the shop owner within the last 24 hours. High reliability.
- 🟡 **Needs Confirmation**: Listed product hasn't been updated in over 24 hours. The UI prompts the shopper to verify via the 1-click inquiry button.
- 🔴 **Unavailable / Out of Stock**: Confirmed 0 stock quantity.

### 2. Live Price & Stock Comparison Engine
When a shopper searches for an item (e.g. *"notebook"*, *"calculator"*, or *"rice"*), the platform groups results by item and presents a comparison table showing:
- Participating stores stocking the item
- Distance / neighborhood locality
- Listed price in INR (₹)
- Stock level (exact quantity if available)
- Freshness timestamp (e.g. *"15 mins ago"*, *"2 days ago"*)

### 3. VyaparVoice — Speech-to-Text Retail Assistant
Built specifically for busy shop owners who want hands-free operation:
- **Speech Recognition**: Voice input via microphone button with real-time waveform animation.
- **Multilingual Support**: Supports English (`en-IN`), Hindi (`hi-IN`), Gujarati (`gu-IN`), Tamil (`ta-IN`), and Telugu (`te-IN`).
- **Database-Backed Natural Language Answers**:
  - *"Which items are running low?"* → Evaluates products below their configured `lowStockThreshold`.
  - *"How many [product] are in stock?"* → Performs fuzzy product matching and returns exact count.
  - *"What were today's recorded sales?"* → Aggregates sales transactions and calculates total revenue.
- **Safety Confirmation Modal**: Before any stock quantity is changed via voice command, a preview dialog displays the target item, old quantity, new quantity, and requires explicit merchant confirmation before applying the mutation.

### 4. Server-Side Atomic Sales & Validation
- Negative inventory is strictly prevented at the server level.
- Recording a sale atomically decreases product inventory and appends a transaction record with timestamp, sale price, and total revenue.
- Automatic low-stock warnings fire when stock falls to or below the minimum threshold.

### 5. Dual-Sided Authentication & Inquiry Tracking
- **Shoppers**: Instant login with demo profiles or custom signup. Shoppers can track all submitted inquiries and view merchant replies in real-time.
- **Shop Owners**: Quick switcher with 4 pre-configured demo shops (ABC Stationery, City Books & General, Green Grocers Kirana, Apex Care Pharmacy) protected by merchant PIN (`1234`), plus full registration for onboarding new stores.

---

## 📋 Comprehensive Hackathon Evaluation Walkthrough

Follow this 8-step sequence during judging demonstrations:

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| **1. Explore as Customer** | Open the **Customer Marketplace** and search for *"notebook"*. | Shows price comparison across ABC Stationery (₹60) and City Books (₹65), displaying stock levels and confirmation freshness badges. |
| **2. Send Store Inquiry** | Click *"Enquire"* on Classmate Spiral Notebook. Fill question: *"Do you have 20 units for bulk school order?"*. | Inquiry is dispatched to ABC Stationery and appears in the customer's inquiry tracker. |
| **3. Switch to Merchant** | Click *"Store Owner Dashboard"* in top bar. Log in as **ABC Stationery** (PIN: `1234`). | Dashboard loads with live inventory, recent sales, and low-stock alerts. |
| **4. Respond to Inquiry** | Click the **Customer Inquiries** tab. Locate the question from Step 2 and reply: *"Yes, 20 units in stock, ready for pickup."*. | Reply is saved and instantly visible to the customer. |
| **5. Record a POS Sale** | Go to **Record Sale** tab. Select *"Classmate Spiral Notebook"*, quantity `5`, and submit. | Stock drops from 34 to 29. Revenue and transaction records increment immediately. |
| **6. Check Public Sync** | Switch back to the **Customer Marketplace** and re-inspect the notebook listing. | The listed stock shows updated quantity (29 units) and timestamp updates to *"Just now"*. |
| **7. Test VyaparVoice** | Return to Dashboard -> **VyaparVoice**. Click mic (or type): *"How many Classmate Notebooks are in stock?"*. | Voice assistant speaks and answers: *"There are currently 29 units of Classmate Spiral Notebook in stock."* |
| **8. Voice Stock Update** | Ask: *"Update Classmate Notebook stock to 35"*. | Assistant displays the **Voice Action Confirmation Dialog** with old vs. new values. Click *"Confirm & Apply"* to execute safely. |

---

## 🗄️ Database Schema & Entities

The system utilizes four normalized data collections:

### 1. `shops`
```typescript
interface Shop {
  id: string;
  name: string;
  category: 'stationery' | 'kirana' | 'electronics' | 'pharmacy' | 'books';
  ownerName: string;
  phone: string;
  address: string;
  locality: string;
  city: string;
  pin: string;
  openingHours: string;
  rating: number;
  deliveryAvailable: boolean;
  upiId?: string;
}
```

### 2. `products`
```typescript
interface Product {
  id: string;
  shopId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isAvailable: boolean;
  lastConfirmedAt: string; // ISO date string
  barcode?: string;
}
```

### 3. `sales`
```typescript
interface SaleRecord {
  id: string;
  shopId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  timestamp: string;
  paymentMethod: 'cash' | 'upi' | 'card';
}
```

### 4. `enquiries`
```typescript
interface Enquiry {
  id: string;
  shopId: string;
  productId?: string;
  productName?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message: string;
  status: 'pending' | 'answered' | 'closed';
  reply?: string;
  createdAt: string;
  repliedAt?: string;
}
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend status and ping |
| `GET` | `/api/shops` | List all verified local shops |
| `POST` | `/api/shops` | Register a new retailer store |
| `PUT` | `/api/shops/:id` | Update shop profile & timings |
| `GET` | `/api/products` | Query products with optional `?search=`, `?shopId=`, `?category=` |
| `POST` | `/api/products` | Create a new product listing |
| `PUT` | `/api/products/:id` | Update price, threshold, details |
| `PATCH` | `/api/products/:id/stock` | Update stock quantity & freshness timestamp |
| `DELETE` | `/api/products/:id` | Remove a product listing |
| `GET` | `/api/sales` | List recorded sales (filter by `?shopId=`) |
| `POST` | `/api/sales` | Atomically record a sale & decrement inventory |
| `GET` | `/api/enquiries` | List customer inquiries (filter by `?shopId=`) |
| `POST` | `/api/enquiries` | Submit customer inquiry |
| `POST` | `/api/enquiries/:id/reply` | Storekeeper response to inquiry |
| `GET` | `/api/stats/:shopId` | Aggregated metrics (revenue, items, low stock) |

---

## 🛡️ Security & Resilience Best Practices
- **Server-Side Validation**: Stock cannot be set to negative values; sales quantity must be > 0.
- **Voice Mutation Guardrails**: Voice commands proposing stock adjustments never mutate data silently; they always trigger an explicit UI confirmation card with pre- and post-values.
- **Zero API Key Leakage**: No third-party secret tokens are exposed in frontend client bundles.
- **Graceful Fallbacks**: When browser speech recognition is not granted or supported, full text-based querying is seamlessly available with zero feature loss.

---

## 👥 Authors & License
Created for **VyaparConnect AI — Local Products, Smarter Shops**.  
Licensed under the Apache-2.0 License.

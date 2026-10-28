import { AreaInfo, CustomerEnquiry, Product, SaleRecord, Shop } from '../types/index.ts';

export const PUNE_AREAS_INFO: Record<string, AreaInfo> = {
  Hadapsar: {
    name: 'Hadapsar',
    zone: 'East Pune IT & Industrial Corridor',
    pincode: '411028',
    keyLandmarks: [
      'Magarpatta Cybercity & Destination Center',
      'Gadital Bus Terminus & Solapur Highway Junction',
      'Amanora Park Town & SP Infocity'
    ],
    retailHighlights: 'Major hub for IT professional supplies, high-volume educational bookstores, and traditional wholesale grain markets near Gadital.',
    distanceFromSwargateKm: 8.5,
    popularFor: ['IT & Office Stationery', 'Engineering Study Manuals', 'Wholesale Kirana & Grains', 'Daily Provisions'],
    description: 'Hadapsar is a major Eastern Pune commercial powerhouse anchored by Magarpatta City and the bustling Gadital wholesale market connecting the Pune-Solapur corridor.'
  },
  Katraj: {
    name: 'Katraj',
    zone: 'South Pune Educational Belt',
    pincode: '411046',
    keyLandmarks: [
      'Bharati Vidyapeeth Deemed University & PICT',
      'Rajiv Gandhi Zoological Park (Katraj Snake Park)',
      'Katraj Dairy Main Co-operative Plant & Lake'
    ],
    retailHighlights: 'High student population driving demand for engineering tools, drawing instruments, and fresh daily organic dairy products from Katraj Dairy.',
    distanceFromSwargateKm: 6.2,
    popularFor: ['Engineering Instruments & Calculators', 'Fresh Cow Ghee & Dairy Needs', 'Academic Project Supplies'],
    description: 'Katraj is South Pune’s premier student gateway along Pune-Satara Road, home to top educational institutions, the iconic Katraj Dairy, and the city zoological park.'
  },
  Wagholi: {
    name: 'Wagholi',
    zone: 'Northeast Pune Academic Corridor',
    pincode: '412207',
    keyLandmarks: [
      'Historic Wagheshwar Temple Chowk',
      'JSPM Imperial College of Engineering & Research',
      'Lexicon International School & Raisoni Campus'
    ],
    retailHighlights: 'Rapidly growing residential and college retail strip along Pune-Nagar Road offering affordable school/college stationery and fresh kirana.',
    distanceFromSwargateKm: 13.8,
    popularFor: ['School & Engineering Registers', 'Daily Household Groceries', 'Hardware & Daily Essentials'],
    description: 'Wagholi is a rapidly expanding suburban and educational corridor on the Pune-Nagar Highway, known for the ancient Wagheshwar Temple and large engineering colleges.'
  },
  'FC Road': {
    name: 'FC Road',
    zone: 'Central Pune Academic Hub',
    pincode: '411004',
    keyLandmarks: ['Fergusson College', 'Goodluck Chowk', 'FC Road Market Yard'],
    retailHighlights: 'Famous for college stationery, competitive exam guidebooks, student electronics, and youth retail.',
    distanceFromSwargateKm: 3.5,
    popularFor: ['Exam Stationery', 'Calculators', 'Novels & Guides'],
    description: 'Iconic student thoroughfare lined with prestigious colleges, cafes, and high-frequency stationery shops.'
  },
  Deccan: {
    name: 'Deccan',
    zone: 'Central Cultural & Commercial Center',
    pincode: '411004',
    keyLandmarks: ['Deccan Gymkhana', 'Sambhaji Park', 'Garware Bridge'],
    retailHighlights: 'Longstanding book depositories, art supplies, and high-quality provisions.',
    distanceFromSwargateKm: 3.0,
    popularFor: ['Fine Arts Materials', 'Academic Books', 'Quality Retail'],
    description: 'The cultural heartbeat of Pune featuring specialized bookstores, fine art depots, and multi-generational retailers.'
  },
  'Model Colony': {
    name: 'Model Colony',
    zone: 'West-Central Residential Belt',
    pincode: '411016',
    keyLandmarks: ['Lakhaki Lake', 'Deep Bungalow Chowk', 'Symbiosis Distance Learning'],
    retailHighlights: 'Premium residential grocery provisions, organic dry rations, and neighborhood stationers.',
    distanceFromSwargateKm: 4.8,
    popularFor: ['Organic Groceries', 'Daily Kirana', 'Gourmet Foods'],
    description: 'An upscale, tranquil residential neighborhood renowned for verified high-trust grocery merchants and daily provisions.'
  }
};

// Initial realistic seed data reflecting Indian local retail market
const INITIAL_SHOPS: Shop[] = [
  {
    id: 'shop-abc',
    name: 'ABC Stationery & General Store',
    ownerName: 'Ramesh Sharma',
    category: 'Stationery & Educational Supplies',
    address: 'Shop 4, Market Yard, FC Road, Pune',
    area: 'FC Road',
    distanceKm: 0.4,
    phone: '+91 98220 12345',
    whatsapp: '+91 98220 12345',
    upiId: 'abcstationery@okhdfcbank',
    openingHours: '8:30 AM - 9:30 PM (Open Today)',
    rating: 4.8,
    reviewCount: 142,
    isOpen: true,
    catalogueActive: true,
    featuredNotice: 'Back to school discounts & GST billing available',
  },
  {
    id: 'shop-city',
    name: 'City Books & Fine Arts',
    ownerName: 'Pooja Deshmukh',
    category: 'Books & Fine Arts',
    address: '12 Galaxy Arcade, Deccan Gymkhana, Pune',
    area: 'Deccan',
    distanceKm: 1.1,
    phone: '+91 98221 44556',
    whatsapp: '+91 98221 44556',
    upiId: 'citybooks@icici',
    openingHours: '9:00 AM - 9:00 PM (Open Today)',
    rating: 4.6,
    reviewCount: 98,
    isOpen: true,
    catalogueActive: true,
  },
  {
    id: 'shop-student',
    name: 'Student Corner Tech & Paper',
    ownerName: 'Vikram Patel',
    category: 'Electronics & Stationery',
    address: 'Opp. Fergusson College Gate 2, Pune',
    area: 'FC Road',
    distanceKm: 0.6,
    phone: '+91 98230 77889',
    upiId: 'studentcorner@upi',
    openingHours: '10:00 AM - 8:30 PM (Unverified Today)',
    rating: 4.2,
    reviewCount: 64,
    isOpen: true,
    catalogueActive: true,
  },
  {
    id: 'shop-shree-kirana',
    name: 'Shree Krishna Kirana & Provisions',
    ownerName: 'Gopal Soni',
    category: 'Kirana & Daily Provisions',
    address: 'Shop 2, Lane 3, Model Colony, Pune',
    area: 'Model Colony',
    distanceKm: 1.4,
    phone: '+91 94220 55667',
    whatsapp: '+91 94220 55667',
    upiId: 'shreekirana@paytm',
    openingHours: '7:30 AM - 10:00 PM (Open Today)',
    rating: 4.7,
    reviewCount: 215,
    isOpen: true,
    catalogueActive: true,
  },

  // --- HADAPSAR SHOPS ---
  {
    id: 'shop-hadapsar-magarpatta',
    name: 'Magarpatta Tech & Book Hub',
    ownerName: 'Anand Jagtap',
    category: 'Books, Stationery & IT Accessories',
    address: 'Shop 18, Destination Center, Magarpatta City, Hadapsar, Pune',
    area: 'Hadapsar',
    distanceKm: 5.2,
    phone: '+91 98222 78901',
    whatsapp: '+91 98222 78901',
    upiId: 'magarpattabooks@okhdfcbank',
    openingHours: '9:00 AM - 10:00 PM (Open Today)',
    rating: 4.8,
    reviewCount: 189,
    isOpen: true,
    catalogueActive: true,
    featuredNotice: 'IT corporate stationery, Casio scientific calculators & GST billing',
  },
  {
    id: 'shop-hadapsar-gadital',
    name: 'Gadital Super Mart & General Store',
    ownerName: 'Sachin Tupe',
    category: 'Kirana & Daily Provisions',
    address: 'Opp. Gadital Bus Stand, Pune-Solapur Road, Hadapsar, Pune',
    area: 'Hadapsar',
    distanceKm: 6.0,
    phone: '+91 94223 34455',
    whatsapp: '+91 94223 34455',
    upiId: 'gaditalmart@paytm',
    openingHours: '7:00 AM - 10:30 PM (Open Today)',
    rating: 4.6,
    reviewCount: 145,
    isOpen: true,
    catalogueActive: true,
    featuredNotice: 'Wholesale prices on high-protein toor dal and cooking oils',
  },

  // --- KATRAJ SHOPS ---
  {
    id: 'shop-katraj-bharati',
    name: 'Bharati Campus Book Depot & Tech',
    ownerName: 'Mahesh Kulkarni',
    category: 'Stationery, Engineering Tools & Academic Books',
    address: 'Shop 5, Trimurti Complex, Bharati Vidyapeeth Back Gate, Katraj, Pune',
    area: 'Katraj',
    distanceKm: 7.4,
    phone: '+91 98229 11223',
    whatsapp: '+91 98229 11223',
    upiId: 'bharatibooks@upi',
    openingHours: '8:00 AM - 9:30 PM (Open Today)',
    rating: 4.9,
    reviewCount: 230,
    isOpen: true,
    catalogueActive: true,
    featuredNotice: 'Engineering drawing instruments, Casio ClassWiz calculators & spiral registers in stock',
  },
  {
    id: 'shop-katraj-dairy',
    name: 'Katraj Dairy Fresh & Organic Provisions',
    ownerName: 'Dattatray Shinde',
    category: 'Dairy, Kirana & Organic Foods',
    address: 'Near Katraj Snake Park Main Gate, Pune-Satara Road, Katraj, Pune',
    area: 'Katraj',
    distanceKm: 7.8,
    phone: '+91 98224 88990',
    whatsapp: '+91 98224 88990',
    upiId: 'katrajdairyfresh@icici',
    openingHours: '6:30 AM - 10:00 PM (Open Today)',
    rating: 4.7,
    reviewCount: 310,
    isOpen: true,
    catalogueActive: true,
    featuredNotice: 'Pure Katraj cow ghee, paneer, and certified unpolished pulses',
  },

  // --- WAGHOLI SHOPS ---
  {
    id: 'shop-wagholi-college',
    name: 'Wagheshwar Stationers & Student World',
    ownerName: 'Nitin Borade',
    category: 'Stationery & Academic Supplies',
    address: 'Shop 9, Milestone Plaza, Opp. JSPM College, Pune-Nagar Road, Wagholi, Pune',
    area: 'Wagholi',
    distanceKm: 12.1,
    phone: '+91 98226 77112',
    whatsapp: '+91 98226 77112',
    upiId: 'wagheshwarstationers@sbi',
    openingHours: '8:30 AM - 9:30 PM (Open Today)',
    rating: 4.7,
    reviewCount: 118,
    isOpen: true,
    catalogueActive: true,
    featuredNotice: 'Student discount bundles on Classmate notebooks and engineering drafting sheets',
  },
  {
    id: 'shop-wagholi-fresh',
    name: 'Nagar Road Mega Bazaar & Daily Needs',
    ownerName: 'Santosh Gaikwad',
    category: 'Kirana & Daily Provisions',
    address: 'Near Wagheshwar Temple Chowk, Main Pune-Nagar Highway, Wagholi, Pune',
    area: 'Wagholi',
    distanceKm: 12.5,
    phone: '+91 98231 66554',
    whatsapp: '+91 98231 66554',
    upiId: 'nagarroadbazaar@hdfcbank',
    openingHours: '7:00 AM - 10:00 PM (Open Today)',
    rating: 4.5,
    reviewCount: 88,
    isOpen: true,
    catalogueActive: true,
    featuredNotice: 'Fresh daily provisions, cooking oils and fast UPI billing',
  }
];

const now = new Date();
const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
const twentyFiveMinutesAgo = new Date(now.getTime() - 25 * 60 * 1000).toISOString();
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

const INITIAL_PRODUCTS: Product[] = [
  // The exact demonstration items from the user prompt:
  {
    id: 'prod-calc-abc',
    shopId: 'shop-abc',
    shopName: 'ABC Stationery & General Store',
    name: 'Casio FX-991CW ClassWiz Scientific Calculator',
    category: 'Stationery',
    description: 'High-resolution natural textbook display with 540+ functions. Ideal for engineering, polytechnic & senior secondary school.',
    listedPrice: 500,
    mrp: 650,
    stockQuantity: 18,
    minStockThreshold: 4,
    unit: 'pcs',
    sku: 'STN-CALC-991CW',
    isPublic: true,
    lastUpdated: tenMinutesAgo,
    isConfirmed: true,
  },
  {
    id: 'prod-calc-city',
    shopId: 'shop-city',
    shopName: 'City Books & Fine Arts',
    name: 'Casio FX-991CW ClassWiz Scientific Calculator',
    category: 'Stationery',
    description: 'Official 3-year warranty card included with authentic hologram. Recommended by engineering colleges.',
    listedPrice: 520,
    mrp: 650,
    stockQuantity: 8,
    minStockThreshold: 3,
    unit: 'pcs',
    sku: 'CB-CALC-991',
    isPublic: true,
    lastUpdated: twentyFiveMinutesAgo,
    isConfirmed: true,
  },
  {
    id: 'prod-calc-student',
    shopId: 'shop-student',
    shopName: 'Student Corner Tech & Paper',
    name: 'Casio FX-991CW ClassWiz Scientific Calculator',
    category: 'Stationery',
    description: 'Student discount pricing available on physical store visit with valid ID card.',
    listedPrice: 480,
    mrp: 650,
    stockQuantity: 2,
    minStockThreshold: 2,
    unit: 'pcs',
    sku: 'SC-CALC-CAS',
    isPublic: true,
    lastUpdated: threeDaysAgo,
    isConfirmed: false,
    staleReason: 'Last verified by merchant 3 days ago. Availability cannot be guaranteed.',
  },

  // Stationery essentials including notebooks for the demonstration sequence
  {
    id: 'prod-notebook-abc',
    shopId: 'shop-abc',
    shopName: 'ABC Stationery & General Store',
    name: 'Classmate Long Ruled Notebook (172 Pages)',
    category: 'Stationery',
    description: 'Single line notebook, 58 GSM ozone-treated chlorine-free paper with attractive cover design and index page.',
    listedPrice: 49,
    mrp: 60,
    stockQuantity: 10, // 10 units available: 1 for ₹49 and 10 for ₹499
    minStockThreshold: 4,
    unit: 'notebooks',
    sku: 'STN-NBK-172R',
    isPublic: true,
    lastUpdated: tenMinutesAgo,
    isConfirmed: true,
  },
  {
    id: 'prod-pen-abc',
    shopId: 'shop-abc',
    shopName: 'ABC Stationery & General Store',
    name: 'Reynolds 045 Fine Carbure Ball Pen (Pack of 5)',
    category: 'Stationery',
    description: 'Smooth smudge-proof writing ink, 0.7mm tip, blue ink, trusted Indian brand for exams.',
    listedPrice: 50,
    mrp: 60,
    stockQuantity: 3, // Low stock item
    minStockThreshold: 10,
    unit: 'pack',
    sku: 'STN-PEN-045-5',
    isPublic: true,
    lastUpdated: twoHoursAgo,
    isConfirmed: true,
  },
  {
    id: 'prod-drawing-abc',
    shopId: 'shop-abc',
    shopName: 'ABC Stationery & General Store',
    name: 'Camlin Kokuyo Drawing Book A3 (36 Pages)',
    category: 'Stationery',
    description: 'Cartridge paper 120 GSM suitable for watercolor, poster colors, charcoal, and sketching.',
    listedPrice: 120,
    mrp: 140,
    stockQuantity: 14,
    minStockThreshold: 5,
    unit: 'book',
    sku: 'STN-CAM-DRW3',
    isPublic: true,
    lastUpdated: twoHoursAgo,
    isConfirmed: true,
  },

  // Groceries & Daily Needs in City/Kirana
  {
    id: 'prod-dal-kirana',
    shopId: 'shop-shree-kirana',
    shopName: 'Shree Krishna Kirana & Provisions',
    name: 'Tata Sampann Unpolished Toor Dal (1kg)',
    category: 'Groceries',
    description: 'Farm-fresh unpolished high protein toor dal, no artificial colorings or polishing agent.',
    listedPrice: 175,
    mrp: 195,
    stockQuantity: 28,
    minStockThreshold: 10,
    unit: 'kg',
    sku: 'KRN-DAL-TR1',
    isPublic: true,
    lastUpdated: twoHoursAgo,
    isConfirmed: true,
  },
  {
    id: 'prod-oil-kirana',
    shopId: 'shop-shree-kirana',
    shopName: 'Shree Krishna Kirana & Provisions',
    name: 'Fortune Sunlite Refined Sunflower Oil (1 Litre Pouch)',
    category: 'Groceries',
    description: 'Enriched with Vitamin A and Vitamin D, light and easy to digest cooking oil.',
    listedPrice: 140,
    mrp: 155,
    stockQuantity: 4, // Low stock item
    minStockThreshold: 12,
    unit: 'pouch',
    sku: 'KRN-OIL-FS1',
    isPublic: true,
    lastUpdated: twoHoursAgo,
    isConfirmed: true,
  },

  // --- HADAPSAR INVENTORY ---
  {
    id: 'prod-calc-hadapsar',
    shopId: 'shop-hadapsar-magarpatta',
    shopName: 'Magarpatta Tech & Book Hub',
    name: 'Casio FX-991CW ClassWiz Scientific Calculator',
    category: 'Stationery',
    description: 'Authentic 3-year warranty Casio calculator. High contrast display, 540+ functions. Corporate and engineering receipt provided.',
    listedPrice: 510,
    mrp: 650,
    stockQuantity: 12,
    minStockThreshold: 3,
    unit: 'pcs',
    sku: 'HAD-CALC-991CW',
    isPublic: true,
    lastUpdated: tenMinutesAgo,
    isConfirmed: true,
  },
  {
    id: 'prod-notebook-hadapsar',
    shopId: 'shop-hadapsar-magarpatta',
    shopName: 'Magarpatta Tech & Book Hub',
    name: 'Classmate Long Ruled Notebook (172 Pages)',
    category: 'Stationery',
    description: 'High-grade 58 GSM paper, ruled single-line notebook for corporate and college documentation.',
    listedPrice: 48,
    mrp: 60,
    stockQuantity: 35,
    minStockThreshold: 8,
    unit: 'notebooks',
    sku: 'HAD-NBK-172',
    isPublic: true,
    lastUpdated: twentyFiveMinutesAgo,
    isConfirmed: true,
  },
  {
    id: 'prod-dal-hadapsar',
    shopId: 'shop-hadapsar-gadital',
    shopName: 'Gadital Super Mart & General Store',
    name: 'Tata Sampann Unpolished Toor Dal (1kg)',
    category: 'Groceries',
    description: 'Wholesale-rate unpolished high protein toor dal directly sourced from Latur grain mandi.',
    listedPrice: 168,
    mrp: 195,
    stockQuantity: 45,
    minStockThreshold: 15,
    unit: 'kg',
    sku: 'HAD-DAL-GDT',
    isPublic: true,
    lastUpdated: tenMinutesAgo,
    isConfirmed: true,
  },
  {
    id: 'prod-oil-hadapsar',
    shopId: 'shop-hadapsar-gadital',
    shopName: 'Gadital Super Mart & General Store',
    name: 'Fortune Sunlite Refined Sunflower Oil (1 Litre Pouch)',
    category: 'Groceries',
    description: 'Vitamin enriched pure refined cooking sunflower oil for healthy family meals.',
    listedPrice: 138,
    mrp: 155,
    stockQuantity: 30,
    minStockThreshold: 10,
    unit: 'pouch',
    sku: 'HAD-OIL-GDT',
    isPublic: true,
    lastUpdated: tenMinutesAgo,
    isConfirmed: true,
  },

  // --- KATRAJ INVENTORY ---
  {
    id: 'prod-calc-katraj',
    shopId: 'shop-katraj-bharati',
    shopName: 'Bharati Campus Book Depot & Tech',
    name: 'Casio FX-991CW ClassWiz Scientific Calculator',
    category: 'Stationery',
    description: 'Special student concession rate with college ID. Genuine Casio warranty card and engineering shortcut handbook included.',
    listedPrice: 495,
    mrp: 650,
    stockQuantity: 15,
    minStockThreshold: 4,
    unit: 'pcs',
    sku: 'KAT-CALC-BV',
    isPublic: true,
    lastUpdated: tenMinutesAgo,
    isConfirmed: true,
  },
  {
    id: 'prod-notebook-katraj',
    shopId: 'shop-katraj-bharati',
    shopName: 'Bharati Campus Book Depot & Tech',
    name: 'Classmate Long Ruled Notebook (172 Pages)',
    category: 'Stationery',
    description: 'Special semester bundle pack available for engineering, medical & law university students.',
    listedPrice: 48,
    mrp: 60,
    stockQuantity: 40,
    minStockThreshold: 10,
    unit: 'notebooks',
    sku: 'KAT-NBK-172',
    isPublic: true,
    lastUpdated: twentyFiveMinutesAgo,
    isConfirmed: true,
  },
  {
    id: 'prod-ghee-katraj',
    shopId: 'shop-katraj-dairy',
    shopName: 'Katraj Dairy Fresh & Organic Provisions',
    name: 'Pure Katraj Special Cow Ghee (500ml Jar)',
    category: 'Groceries',
    description: 'Freshly clarified traditional aromatic pure cow ghee processed directly at the Katraj Dairy Co-operative.',
    listedPrice: 340,
    mrp: 375,
    stockQuantity: 28,
    minStockThreshold: 8,
    unit: 'jar',
    sku: 'KAT-GHEE-500',
    isPublic: true,
    lastUpdated: tenMinutesAgo,
    isConfirmed: true,
  },
  {
    id: 'prod-dal-katraj',
    shopId: 'shop-katraj-dairy',
    shopName: 'Katraj Dairy Fresh & Organic Provisions',
    name: 'Tata Sampann Unpolished Toor Dal (1kg)',
    category: 'Groceries',
    description: 'Natural high-protein toor dal certified pesticide-free, ideal for traditional Maharashtrian varan.',
    listedPrice: 172,
    mrp: 195,
    stockQuantity: 22,
    minStockThreshold: 6,
    unit: 'kg',
    sku: 'KAT-DAL-TR1',
    isPublic: true,
    lastUpdated: twoHoursAgo,
    isConfirmed: true,
  },

  // --- WAGHOLI INVENTORY ---
  {
    id: 'prod-calc-wagholi',
    shopId: 'shop-wagholi-college',
    shopName: 'Wagheshwar Stationers & Student World',
    name: 'Casio FX-991CW ClassWiz Scientific Calculator',
    category: 'Stationery',
    description: 'ClassWiz 540+ functions engineering calculator with official hologram for JSPM and Raisoni campus students.',
    listedPrice: 505,
    mrp: 650,
    stockQuantity: 7,
    minStockThreshold: 3,
    unit: 'pcs',
    sku: 'WAG-CALC-991',
    isPublic: true,
    lastUpdated: tenMinutesAgo,
    isConfirmed: true,
  },
  {
    id: 'prod-notebook-wagholi',
    shopId: 'shop-wagholi-college',
    shopName: 'Wagheshwar Stationers & Student World',
    name: 'Classmate Long Ruled Notebook (172 Pages)',
    category: 'Stationery',
    description: 'Original ITC Classmate 172 pages ruled register for school and college assignments.',
    listedPrice: 47,
    mrp: 60,
    stockQuantity: 28,
    minStockThreshold: 6,
    unit: 'notebooks',
    sku: 'WAG-NBK-172',
    isPublic: true,
    lastUpdated: twentyFiveMinutesAgo,
    isConfirmed: true,
  },
  {
    id: 'prod-dal-wagholi',
    shopId: 'shop-wagholi-fresh',
    shopName: 'Nagar Road Mega Bazaar & Daily Needs',
    name: 'Tata Sampann Unpolished Toor Dal (1kg)',
    category: 'Groceries',
    description: 'Rich in dietary fiber and essential proteins. Premium unpolished grain selection.',
    listedPrice: 172,
    mrp: 195,
    stockQuantity: 32,
    minStockThreshold: 10,
    unit: 'kg',
    sku: 'WAG-DAL-TR1',
    isPublic: true,
    lastUpdated: tenMinutesAgo,
    isConfirmed: true,
  },
  {
    id: 'prod-oil-wagholi',
    shopId: 'shop-wagholi-fresh',
    shopName: 'Nagar Road Mega Bazaar & Daily Needs',
    name: 'Fortune Sunlite Refined Sunflower Oil (1 Litre Pouch)',
    category: 'Groceries',
    description: 'Fresh batch refined sunflower oil for light crispy snacks and daily family cooking.',
    listedPrice: 139,
    mrp: 155,
    stockQuantity: 24,
    minStockThreshold: 8,
    unit: 'pouch',
    sku: 'WAG-OIL-FS1',
    isPublic: true,
    lastUpdated: twoHoursAgo,
    isConfirmed: true,
  }
];

const INITIAL_SALES: SaleRecord[] = [
  {
    id: 'sale-1',
    shopId: 'shop-abc',
    productId: 'prod-calc-abc',
    productName: 'Casio FX-991CW ClassWiz Scientific Calculator',
    quantity: 2,
    unitPrice: 500,
    totalAmount: 1000,
    paymentMethod: 'upi',
    customerName: 'Aarav Joshi',
    timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'sale-2',
    shopId: 'shop-abc',
    productId: 'prod-drawing-abc',
    productName: 'Camlin Kokuyo Drawing Book A3 (36 Pages)',
    quantity: 1,
    unitPrice: 120,
    totalAmount: 120,
    paymentMethod: 'cash',
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
  }
];

const INITIAL_ENQUIRIES: CustomerEnquiry[] = [
  {
    id: 'enq-1',
    shopId: 'shop-abc',
    productId: 'prod-calc-abc',
    productName: 'Casio FX-991CW ClassWiz Scientific Calculator',
    customerName: 'Aditya Kulkarni',
    customerPhone: '+91 97654 32190',
    message: 'Hello, do you have the Casio 991CW in black color? Can I pick it up around 6:30 PM today?',
    reply: 'Yes Aditya ji, black is available with 3-year warranty card. We have kept one piece reserved at the counter for you.',
    status: 'replied',
    timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    repliedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'enq-2',
    shopId: 'shop-abc',
    productId: 'prod-notebook-abc',
    productName: 'Classmate Long Ruled Notebook (172 Pages)',
    customerName: 'Sneha More',
    customerPhone: '+91 99231 88776',
    message: 'Do you offer bundle discount if I buy 10 notebooks for tuition students?',
    status: 'pending',
    timestamp: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
  }
];

class CentralDatabase {
  private shops: Map<string, Shop> = new Map();
  private products: Map<string, Product> = new Map();
  private sales: SaleRecord[] = [];
  private enquiries: CustomerEnquiry[] = [];

  constructor() {
    this.seed();
  }

  public seed() {
    this.shops.clear();
    this.products.clear();
    this.sales = [...INITIAL_SALES];
    this.enquiries = [...INITIAL_ENQUIRIES];

    INITIAL_SHOPS.forEach(s => this.shops.set(s.id, { ...s }));
    INITIAL_PRODUCTS.forEach(p => this.products.set(p.id, { ...p }));
  }

  // --- Shops ---
  public getShops(): Shop[] {
    return Array.from(this.shops.values());
  }

  public getShopById(id: string): Shop | undefined {
    return this.shops.get(id);
  }

  public registerShop(data: {
    name: string;
    ownerName: string;
    category: string;
    address: string;
    area: string;
    phone: string;
    upiId: string;
    openingHours?: string;
  }): Shop {
    const id = `shop-${Date.now().toString().slice(-6)}`;
    const newShop: Shop = {
      id,
      name: data.name,
      ownerName: data.ownerName,
      category: data.category,
      address: data.address,
      area: data.area || 'Pune Central',
      distanceKm: 0.5,
      phone: data.phone,
      whatsapp: data.phone,
      upiId: data.upiId || `${data.phone.replace(/[^0-9]/g, '')}@upi`,
      openingHours: data.openingHours || '9:00 AM - 9:30 PM (Open Today)',
      rating: 5.0,
      reviewCount: 1,
      isOpen: true,
      catalogueActive: true,
      featuredNotice: 'Newly registered local store',
    };
    this.shops.set(id, newShop);
    return newShop;
  }

  public updateShop(id: string, updates: Partial<Shop>): Shop | null {
    const shop = this.shops.get(id);
    if (!shop) return null;
    const updated = { ...shop, ...updates };
    this.shops.set(id, updated);
    return updated;
  }

  // --- Products ---
  public getProducts(filter?: { shopId?: string; query?: string; category?: string }): Product[] {
    let list = Array.from(this.products.values());

    if (filter?.shopId) {
      list = list.filter(p => p.shopId === filter.shopId);
    }
    if (filter?.category && filter.category !== 'all') {
      const cat = filter.category.toLowerCase();
      list = list.filter(p => p.category.toLowerCase().includes(cat));
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.shopName.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  public addProduct(product: Omit<Product, 'id' | 'lastUpdated' | 'isConfirmed'>): Product {
    const id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newProd: Product = {
      ...product,
      id,
      lastUpdated: new Date().toISOString(),
      isConfirmed: true,
    };
    this.products.set(id, newProd);
    return newProd;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const existing = this.products.get(id);
    if (!existing) return null;

    const updated: Product = {
      ...existing,
      ...updates,
      lastUpdated: new Date().toISOString(),
      isConfirmed: true, // Retailer update confirms freshness!
      staleReason: undefined,
    };
    this.products.set(id, updated);
    return updated;
  }

  public updateStock(id: string, newStock: number): Product | null {
    const existing = this.products.get(id);
    if (!existing) return null;

    const updated: Product = {
      ...existing,
      stockQuantity: Math.max(0, newStock),
      lastUpdated: new Date().toISOString(),
      isConfirmed: true,
      staleReason: undefined,
    };
    this.products.set(id, updated);
    return updated;
  }

  public deleteProduct(id: string): boolean {
    return this.products.delete(id);
  }

  // --- Sales ---
  public getSales(shopId?: string): SaleRecord[] {
    if (shopId) {
      return this.sales.filter(s => s.shopId === shopId);
    }
    return [...this.sales];
  }

  public recordSale(saleData: {
    shopId: string;
    productId: string;
    quantity: number;
    unitPrice?: number;
    paymentMethod: 'cash' | 'upi' | 'khata';
    customerName?: string;
  }): { sale: SaleRecord; updatedProduct: Product } | { error: string } {
    const product = this.products.get(saleData.productId);
    if (!product) {
      return { error: 'Product not found' };
    }
    if (product.stockQuantity < saleData.quantity) {
      return { error: `Insufficient stock. Current stock is ${product.stockQuantity}` };
    }

    const unitPrice = saleData.unitPrice ?? product.listedPrice;
    const totalAmount = unitPrice * saleData.quantity;

    // 1. Decrement stock
    const newStock = product.stockQuantity - saleData.quantity;
    const updatedProduct = this.updateStock(product.id, newStock)!;

    // 2. Create Sale Record
    const sale: SaleRecord = {
      id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      shopId: saleData.shopId,
      productId: product.id,
      productName: product.name,
      quantity: saleData.quantity,
      unitPrice,
      totalAmount,
      paymentMethod: saleData.paymentMethod,
      customerName: saleData.customerName,
      timestamp: new Date().toISOString(),
    };

    this.sales.unshift(sale);
    return { sale, updatedProduct };
  }

  // --- Enquiries ---
  public getEnquiries(shopId?: string): CustomerEnquiry[] {
    if (shopId) {
      return this.enquiries.filter(e => e.shopId === shopId);
    }
    return [...this.enquiries];
  }

  public createEnquiry(enquiry: Omit<CustomerEnquiry, 'id' | 'timestamp' | 'status'>): CustomerEnquiry {
    const newEnq: CustomerEnquiry = {
      ...enquiry,
      id: `enq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };
    this.enquiries.unshift(newEnq);
    return newEnq;
  }

  public replyToEnquiry(id: string, replyText: string): CustomerEnquiry | null {
    const enq = this.enquiries.find(e => e.id === id);
    if (!enq) return null;
    enq.reply = replyText;
    enq.status = 'replied';
    enq.repliedAt = new Date().toISOString();
    return enq;
  }

  // --- Stats ---
  public getShopStats(shopId: string) {
    const shopProducts = Array.from(this.products.values()).filter(p => p.shopId === shopId);
    const shopSales = this.sales.filter(s => s.shopId === shopId);
    const shopEnquiries = this.enquiries.filter(e => e.shopId === shopId && e.status === 'pending');

    const totalSkus = shopProducts.length;
    const totalStockUnits = shopProducts.reduce((sum, p) => sum + p.stockQuantity, 0);
    const lowStockCount = shopProducts.filter(p => p.stockQuantity <= p.minStockThreshold).length;

    // Today's sales
    const today = new Date().toISOString().slice(0, 10);
    const todaySales = shopSales.filter(s => s.timestamp.startsWith(today));
    const todaySalesAmount = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const todaySalesCount = todaySales.length;

    return {
      totalSkus,
      totalStockUnits,
      lowStockCount,
      todaySalesAmount,
      todaySalesCount,
      pendingEnquiries: shopEnquiries.length,
    };
  }

  // --- Area Info ---
  public getAreasInfo(): Record<string, AreaInfo> {
    const areas = { ...PUNE_AREAS_INFO };
    const allShops = this.getShops();
    for (const key of Object.keys(areas)) {
      areas[key].shopCount = allShops.filter(
        (s) => s.area.toLowerCase() === key.toLowerCase()
      ).length;
    }
    return areas;
  }

  public getAreaByName(name: string): AreaInfo | null {
    return PUNE_AREAS_INFO[name] || null;
  }
}

export const db = new CentralDatabase();

import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Phone,
  MessageSquare,
  Sparkles,
  Compass,
  Building2,
  BookOpen,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { CustomerUser, Shop } from '../../types/index.ts';

interface CustomerHomeProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q?: string) => void;
  shops: Shop[];
  onSelectShop: (shop: Shop) => void;
  selectedArea: string;
  onSelectArea: (area: string) => void;
  onSelectCategory: (category: string) => void;
  currentCustomer?: CustomerUser | null;
  onOpenLogin?: () => void;
}

interface CommunityComment {
  id: string;
  author: string;
  shopName: string;
  area: string;
  timeAgo: string;
  comment: string;
  avatarChar: string;
}

interface SpotlightArea {
  name: string;
  tagline: string;
  zone: string;
  pincode: string;
  distanceKm: number;
  badge: string;
  landmarks: string[];
  retailHighlights: string;
  specialityItems: string[];
  summaryPoints: { title: string; detail: string }[];
}

const SPOTLIGHT_AREAS: SpotlightArea[] = [
  {
    name: 'Hadapsar',
    tagline: 'IT Hub & Wholesale Mandi Corridor',
    zone: 'East Pune (Magarpatta & Solapur Highway)',
    pincode: '411028',
    distanceKm: 8.5,
    badge: 'Tech Park + Wholesale Grains',
    landmarks: [
      'Magarpatta Cybercity & Destination Center',
      'Gadital Bus Terminus & Pune-Solapur Highway Chowk',
      'Amanora Park Town & SP Infocity',
    ],
    retailHighlights:
      'A bustling commercial powerhouse combining corporate IT stationers at Magarpatta Destination Center with the century-old Gadital wholesale grain and grocery mandi.',
    specialityItems: [
      'Casio Scientific Calculators (fx-991ES / ClassWiz)',
      'Unpolished High-Protein Toor Dal (₹170/kg)',
      'IT Corporate Office Stationery & Project Files',
      'Refined Sunflower Cooking Oil Wholesale Cans',
    ],
    summaryPoints: [
      {
        title: 'Key Landmarks & High-Connectivity Junction',
        detail:
          'Located 8.5 km East of Swargate along the Pune-Solapur corridor. Anchored by Magarpatta Cybercity and the landmark Gadital bus terminus, serving as the primary commercial transit gate for Eastern Pune.',
      },
      {
        title: 'Dual Retail Character: Tech Corporate + Grain Mandi',
        detail:
          'Houses high-velocity modern office stationery and electronics stores catering to 70,000+ tech employees alongside traditional Gadital traders offering bulk grocery savings unavailable in supermarkets.',
      },
      {
        title: 'Verified Commercial Specialities & Fast Stock',
        detail:
          'Known for readily available Casio engineering calculators, GST-compliant office consumables, and unadulterated farm-direct pulses with fast UPI instant checkout.',
      },
    ],
  },
  {
    name: 'Katraj',
    tagline: 'South Pune Academic Belt & Fresh Dairy Gateway',
    zone: 'South Pune (Pune-Satara Highway Corridor)',
    pincode: '411046',
    distanceKm: 6.2,
    badge: '45,000+ Students & Pure Dairy',
    landmarks: [
      'Bharati Vidyapeeth Deemed University & PICT Campuses',
      'Rajiv Gandhi Zoological Park (Katraj Snake Park)',
      'Katraj Dairy Main Co-operative Plant & Historical Lake',
    ],
    retailHighlights:
      'Premier academic corridor supporting students with drafting instruments, university textbooks, and engineering calculators, backed by authentic Katraj Dairy co-operative outlets.',
    specialityItems: [
      'Engineering Mini Drafters & Technical Drawing Instruments',
      'Pure Katraj Cow Ghee (A2 certified, ₹680/L)',
      'Casio Scientific Calculators & Examination Registers',
      'Fresh Dairy Milk, Paneer & Organic Rations',
    ],
    summaryPoints: [
      {
        title: 'Key Landmarks & Gateway to Southern Pune',
        detail:
          'Situated 6.2 km South of Swargate on the Pune-Satara highway. Famous for Bharati Vidyapeeth Deemed University, PICT, the historical Katraj Lake, and Rajiv Gandhi Zoological Park.',
      },
      {
        title: 'Massive Student Economy & Academic Stationery',
        detail:
          'Over 45,000 engineering, medical, and polytechnic students generate constant inventory demand for engineering drafting equipment, lab journals, and spiral registers right at campus gates.',
      },
      {
        title: 'Iconic Dairy Co-operative & Organic Market',
        detail:
          'Home to Pune’s iconic Katraj Dairy Co-operative, guaranteeing 100% pure authentic cow ghee, artisanal paneer, and unpolished staples verified by local neighbourhood grocers.',
      },
    ],
  },
  {
    name: 'Wagholi',
    tagline: 'Rapidly Growing Academic & Suburban Retail Strip',
    zone: 'Northeast Pune (Pune-Nagar Highway)',
    pincode: '412207',
    distanceKm: 13.8,
    badge: 'College Campuses & Mega Bazaars',
    landmarks: [
      'Historic Wagheshwar Temple Chowk',
      'JSPM Imperial College & Research Campus',
      'Lexicon International School & GH Raisoni Campus',
    ],
    retailHighlights:
      'Booming suburban highway trade strip packed with student stationery mega-shops, multi-pack notebook discounts, and family supermarket bazaars.',
    specialityItems: [
      'Classmate Long Registers (172 & 240 Pages)',
      'Engineering Graph & Drawing Sheets',
      'Fortune Sunflower Cooking Oil (1L & 5L)',
      'Unpolished Farm-Fresh Toor Dal & Daily Kirana',
    ],
    summaryPoints: [
      {
        title: 'Key Landmarks & Northeast Highway Corridor',
        detail:
          'Located 13.8 km Northeast of Swargate on the high-traffic Pune-Ahmednagar corridor. Renowned for the ancient Wagheshwar Temple and large integrated educational campuses.',
      },
      {
        title: 'Booming Student Hostels & Residential Retail',
        detail:
          'Rapidly expanding township with thousands of hostel residents driving high volume in bulk notebook bundles, drafting pens, exam boards, and budget-conscious daily grocery staples.',
      },
      {
        title: 'Competitive Neighbourhood Pricing & Abundant Stock',
        detail:
          'Retailers near JSPM and Wagheshwar Chowk feature generous volume discounts on student registers and maintain fresh, unpolished daily kirana stocks verified daily.',
      },
    ],
  },
];

const POPULAR_QUERIES = [
  'scientific calculator',
  'notebook',
  'reynolds pen',
  'toor dal',
  'sunflower oil',
  'drawing book',
  'pure cow ghee',
  'mini drafter',
];

const CATEGORIES = [
  { id: 'all', name: 'All Products', icon: '🏪' },
  { id: 'stationery', name: 'Stationery & Office', icon: '📐' },
  { id: 'books', name: 'Books & Academic', icon: '📚' },
  { id: 'groceries', name: 'Kirana & Groceries', icon: '🌾' },
  { id: 'electronics', name: 'Electronics & Tools', icon: '🔌' },
];

const INITIAL_COMMENTS: CommunityComment[] = [
  {
    id: 'c1',
    author: 'Ramesh P.',
    shopName: 'ABC Stationery & General',
    area: 'FC Road',
    timeAgo: '15 mins ago · In-store verified',
    comment:
      'Casio scientific calculators and Classmate 172-page notebooks are fully in stock at exact listed price ₹500 and ₹65. Owner gave receipt instantly.',
    avatarChar: 'R',
  },
  {
    id: 'c2',
    author: 'Prathamesh Shinde',
    shopName: 'Magarpatta Tech & Book Hub',
    area: 'Hadapsar',
    timeAgo: '25 mins ago · In-store verified',
    comment:
      'Destination Center store has Casio fx-991ES and spiral project files in stock! Quick UPI scan at checkout, exact same price as app.',
    avatarChar: 'P',
  },
  {
    id: 'c3',
    author: 'Tanvi Bhosale',
    shopName: 'Bharati Campus Book Depot & Tech',
    area: 'Katraj',
    timeAgo: '40 mins ago · In-store verified',
    comment:
      'Verified engineering mini-drafters and lab record books right at Bharati Vidyapeeth back gate. Very courteous shopkeeper!',
    avatarChar: 'T',
  },
  {
    id: 'c4',
    author: 'Rahul More',
    shopName: 'Wagheshwar Stationers & Student World',
    area: 'Wagholi',
    timeAgo: '1 hour ago · In-store verified',
    comment:
      'Picked up 6 Classmate notebooks and pilot pens opposite JSPM college. Prices are 100% matched with online listings.',
    avatarChar: 'R',
  },
  {
    id: 'c5',
    author: 'Sneha Joshi',
    shopName: 'New Deccan Provisions',
    area: 'Deccan',
    timeAgo: '1 hour ago · In-store verified',
    comment:
      'Sunflower oil and fresh toor dal packets are available. Saved me a wasted trip to the supermarket!',
    avatarChar: 'S',
  },
  {
    id: 'c6',
    author: 'Dattatray K.',
    shopName: 'Katraj Dairy Fresh & Organic Provisions',
    area: 'Katraj',
    timeAgo: '2 hours ago · In-store verified',
    comment:
      'Pure Katraj cow ghee jars and unpolished toor dal were freshly stocked near the snake park gate. Top quality!',
    avatarChar: 'D',
  },
];

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  shops,
  onSelectShop,
  selectedArea,
  onSelectArea,
  onSelectCategory,
  currentCustomer,
  onOpenLogin,
}) => {
  const [comments, setComments] = useState<CommunityComment[]>(INITIAL_COMMENTS);
  const [commentName, setCommentName] = useState<string>(currentCustomer?.name || '');
  const [commentShop, setCommentShop] = useState<string>(shops[0]?.name || 'ABC Stationery & General Store');
  const [commentText, setCommentText] = useState<string>('');
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const authorName = commentName.trim() || currentCustomer?.name || 'Local Shopper';
    const newComment: CommunityComment = {
      id: `comm-${Date.now()}`,
      author: authorName,
      shopName: commentShop,
      area: selectedArea !== 'all' ? selectedArea : 'FC Road',
      timeAgo: 'Just now · Customer Verified',
      comment: commentText.trim(),
      avatarChar: authorName.charAt(0).toUpperCase(),
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentText('');
  };

  const filteredShops = selectedArea === 'all'
    ? shops
    : shops.filter((s) => s.area.toLowerCase().includes(selectedArea.toLowerCase()));

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-b from-[#1b261b] to-[#121c13] text-white p-8 md:p-12 shadow-lg border border-[#314a33]">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Real-Time Local Shop Inventory & Price Discovery</span>
            </div>

            {currentCustomer ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 text-emerald-200 rounded-full text-xs font-medium">
                <span>👋 Welcome, <strong>{currentCustomer.name}</strong></span>
                <span className="text-white/60">({currentCustomer.area})</span>
              </div>
            ) : onOpenLogin ? (
              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-full text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                <span>Sign In / Create Account</span>
                <span>→</span>
              </button>
            ) : null}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Find items in neighborhood stores before you step out.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Compare listed prices, verify live stock quantities, and see whether inventory was confirmed 10 minutes ago or 3 days ago across local retailers.
          </p>

          {/* Search Bar */}
          <div className="pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSearchSubmit(searchQuery);
              }}
              className="flex flex-col sm:flex-row items-stretch gap-2 bg-white p-2 rounded-2xl shadow-xl max-w-2xl border border-[#e5e9e1]"
            >
              <div className="flex items-center gap-2 flex-1 px-3 py-2 text-[#20281f]">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search for 'scientific calculator', 'notebook', 'dal'..."
                  className="w-full bg-transparent text-sm font-medium text-[#20281f] placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Area selector */}
              <div className="flex items-center gap-1.5 px-3 py-2 border-t sm:border-t-0 sm:border-l border-[#e5e9e1] text-xs text-[#586154]">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                <select
                  value={selectedArea}
                  onChange={(e) => onSelectArea(e.target.value)}
                  className="bg-transparent font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">All Pune Areas</option>
                  <option value="Hadapsar">Hadapsar (Magarpatta & Gadital)</option>
                  <option value="Katraj">Katraj (Bharati Vidyapeeth & Dairy)</option>
                  <option value="Wagholi">Wagholi (Nagar Rd & JSPM)</option>
                  <option value="FC Road">FC Road</option>
                  <option value="Deccan">Deccan</option>
                  <option value="Model Colony">Model Colony</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-[#315e45] hover:bg-[#254936] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm whitespace-nowrap cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Natural Language Prompt & Popular search chips */}
            <div className="space-y-2 mt-4 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  ✨ Natural Language Search:
                </span>
                <button
                  onClick={() => {
                    const q = "Casio fx-991ES in Katraj near Bharati";
                    onSearchChange(q);
                    onSearchSubmit(q);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/40 text-xs transition-colors cursor-pointer"
                >
                  "Casio fx-991ES in Katraj near Bharati"
                </button>
                <button
                  onClick={() => {
                    const q = "High-protein toor dal in Hadapsar Gadital";
                    onSearchChange(q);
                    onSearchSubmit(q);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/40 text-xs transition-colors cursor-pointer"
                >
                  "High-protein toor dal in Hadapsar Gadital"
                </button>
                <button
                  onClick={() => {
                    const q = "Classmate registers in Wagholi under ₹80";
                    onSearchChange(q);
                    onSearchSubmit(q);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/40 text-xs transition-colors cursor-pointer"
                >
                  "Classmate registers in Wagholi under ₹80"
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-medium">Quick Keywords:</span>
                {POPULAR_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      onSearchChange(q);
                      onSearchSubmit(q);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#273828] hover:bg-[#344b36] text-slate-200 border border-[#3f5740] text-xs transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Area Filter Bar Component adhering to requested .area-filter styling */}
      <div className="area-filter">
        <label>Neighborhood Filter</label>
        <select
          value={selectedArea}
          onChange={(e) => onSelectArea(e.target.value)}
        >
          <option value="all">All Pune Neighborhoods</option>
          <option value="Hadapsar">Hadapsar (Magarpatta, Gadital & IT Corridor)</option>
          <option value="Katraj">Katraj (Bharati Vidyapeeth & Dairy Rd)</option>
          <option value="Wagholi">Wagholi (JSPM, Lexicon & Nagar Road)</option>
          <option value="FC Road">FC Road & Fergusson Area</option>
          <option value="Deccan">Deccan Gymkhana & JM Road</option>
          <option value="Model Colony">Model Colony & Deep Bungalow</option>
        </select>
        {selectedArea !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectArea('all')}
            className="clear-link"
          >
            Clear Filter (Show All)
          </button>
        )}
      </div>

      {/* Location Band Component adhering to requested .location-band styling */}
      <div className="location-band">
        <div>
          <h2>Explore Local Neighborhoods & Markets</h2>
          <p>Browse verified retailers, active digital catalogues, and live stock confirmations near your street.</p>
        </div>
        <div className="location-links">
          <button
            type="button"
            className={selectedArea === 'all' ? 'active' : ''}
            onClick={() => onSelectArea('all')}
          >
            All Areas ({shops.length})
          </button>
          <button
            type="button"
            className={selectedArea === 'Hadapsar' ? 'active' : ''}
            onClick={() => onSelectArea('Hadapsar')}
          >
            Hadapsar ({shops.filter((s) => s.area === 'Hadapsar').length})
          </button>
          <button
            type="button"
            className={selectedArea === 'Katraj' ? 'active' : ''}
            onClick={() => onSelectArea('Katraj')}
          >
            Katraj ({shops.filter((s) => s.area === 'Katraj').length})
          </button>
          <button
            type="button"
            className={selectedArea === 'Wagholi' ? 'active' : ''}
            onClick={() => onSelectArea('Wagholi')}
          >
            Wagholi ({shops.filter((s) => s.area === 'Wagholi').length})
          </button>
          <button
            type="button"
            className={selectedArea === 'FC Road' ? 'active' : ''}
            onClick={() => onSelectArea('FC Road')}
          >
            FC Road ({shops.filter((s) => s.area === 'FC Road').length})
          </button>
          <button
            type="button"
            className={selectedArea === 'Deccan' ? 'active' : ''}
            onClick={() => onSelectArea('Deccan')}
          >
            Deccan ({shops.filter((s) => s.area === 'Deccan').length})
          </button>
          <button
            type="button"
            className={selectedArea === 'Model Colony' ? 'active' : ''}
            onClick={() => onSelectArea('Model Colony')}
          >
            Model Colony ({shops.filter((s) => s.area === 'Model Colony').length})
          </button>
        </div>
      </div>

      {/* Neighborhood Spotlight & Local Commerce Guide (Hadapsar, Katraj & Wagholi) */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e9ece5] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e9ece5]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eaf0e3] text-[#315e45] uppercase tracking-wider border border-[#d2decb]">
                Neighborhood Spotlights
              </span>
              <span className="text-xs text-[#7c8578] font-medium">Pune Commerce Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#20281f] tracking-tight">
              Hadapsar, Katraj & Wagholi: Local Markets & Verified Shops
            </h2>
            <p className="text-xs text-[#7c8578] max-w-3xl">
              In-depth retail profiles for Pune’s major growth and academic sectors. Explore 2–3 key commercial highlights per area and discover verified neighborhood stores.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#586154]">Active Area:</span>
            <span className="px-3 py-1 rounded-lg bg-[#edf3e8] text-[#315e45] font-bold text-xs border border-[#d2decb]">
              {selectedArea === 'all' ? 'All Pune Areas' : selectedArea}
            </span>
          </div>
        </div>

        {/* 3 Detailed Area Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {SPOTLIGHT_AREAS.map((area) => {
            const areaShops = shops.filter((s) => s.area.toLowerCase() === area.name.toLowerCase());
            const isSelected = selectedArea.toLowerCase() === area.name.toLowerCase();

            return (
              <div
                key={area.name}
                className={`flex flex-col justify-between rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#315e45] bg-[#f9faf7] ring-2 ring-[#315e45]/20 shadow-md'
                    : 'border-[#e9ece5] bg-white hover:border-[#8ca780] hover:shadow-xs'
                } p-5 space-y-4`}
              >
                {/* Area Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#edf3e8] text-[#315e45] border border-[#d2decb]">
                        {area.badge}
                      </span>
                      <h3 className="text-lg font-bold text-[#20281f] mt-1.5 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#315e45] shrink-0" />
                        <span>{area.name}</span>
                      </h3>
                      <p className="text-xs font-semibold text-[#586154]">{area.tagline}</p>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-1 bg-[#f4f6ef] rounded text-[#7c8578] border border-[#e5e9e1] shrink-0">
                      ~{area.distanceKm} km
                    </span>
                  </div>

                  <div className="text-[11px] text-[#7c8578] flex flex-wrap gap-x-3 gap-y-1 pt-1 border-t border-[#f0f2eb]">
                    <span>📍 {area.zone}</span>
                    <span>📮 PIN: <strong>{area.pincode}</strong></span>
                  </div>
                </div>

                {/* 2-3 Detailed Points for this area */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-[10px] font-bold text-[#596355] uppercase tracking-wider block">
                    Detailed Commerce Insights:
                  </span>
                  {area.summaryPoints.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#f9faf7] border border-[#e9ece5] text-xs space-y-1"
                    >
                      <div className="font-bold text-[#20281f] flex items-center gap-1.5 text-[11px]">
                        <span className="w-4 h-4 rounded-full bg-[#eaf0e3] text-[#315e45] font-bold text-[9px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{pt.title}</span>
                      </div>
                      <p className="text-[11px] text-[#586154] leading-relaxed pl-5">
                        {pt.detail}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Signature specialities tags */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-[#596355] uppercase tracking-wider block">
                    Popular In-Demand Commodities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {area.specialityItems.map((item) => (
                      <span
                        key={item}
                        className="px-2 py-0.5 rounded-md bg-white border border-[#e1e7da] text-[10px] font-medium text-[#496749]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Verified Shop Locations in this area */}
                <div className="space-y-2 pt-2 border-t border-[#e9ece5]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#596355] uppercase tracking-wider">
                      Verified Shop Locations ({areaShops.length}):
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectArea(isSelected ? 'all' : area.name)}
                      className="text-[11px] font-bold text-[#315e45] hover:underline cursor-pointer"
                    >
                      {isSelected ? 'Reset Filter' : `Filter ${area.name}`}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {areaShops.map((shop) => (
                      <div
                        key={shop.id}
                        className="p-2.5 rounded-lg border border-[#e5e9e1] bg-white hover:border-[#315e45] transition-colors space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <b className="text-xs text-[#20281f] leading-snug">{shop.name}</b>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                            ⭐ {shop.rating}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#7c8578] line-clamp-1">
                          📍 {shop.address}
                        </p>
                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          <span className="text-[#586154]">🕒 {shop.openingHours.split('(')[0]}</span>
                          <button
                            type="button"
                            onClick={() => onSelectShop(shop)}
                            className="inline-flex items-center gap-1 font-bold text-[#315e45] hover:text-[#20281f] cursor-pointer"
                          >
                            <span>Live Stock</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Area action CTA */}
                <button
                  type="button"
                  onClick={() => onSelectArea(area.name)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#315e45] text-white shadow-xs'
                      : 'bg-[#edf3e8] hover:bg-[#dfead7] text-[#315e45] border border-[#d2decb]'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>
                    {isSelected ? `Viewing All ${area.name} Products` : `Browse All ${area.name} Stores`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Freshness Transparency Guarantee */}
      <section className="bg-white rounded-2xl p-6 border border-[#e9ece5] shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eaf0e3] text-[#315e45] flex items-center justify-center shrink-0 border border-[#e1e7da]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#20281f]">
                Verified Inventory Timestamp Guarantee
              </h3>
              <p className="text-xs text-[#7c8578]">
                Never waste a store trip. Every listing displays its exact verification timestamp.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#edf3e8] text-[#315e45] border border-[#d2decb]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#315e45]" />
              <span className="font-semibold">Confirmed Recently (e.g. 10m ago)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold">Unconfirmed / Stale (&gt; 48 hours)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#20281f]">Browse by Category</h2>
          <span className="text-xs text-[#7c8578]">Nearby Local Retail</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onSearchSubmit();
              }}
              className="p-4 bg-white hover:bg-[#f4f6ef] rounded-xl border border-[#e9ece5] transition-all text-left group hover:border-[#8ca780] shadow-xs cursor-pointer"
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <div className="text-sm font-semibold text-[#20281f] group-hover:text-[#315e45] transition-colors">
                {cat.name}
              </div>
              <div className="text-[11px] text-[#7c8578] mt-0.5">Explore catalogue</div>
            </button>
          ))}
        </div>
      </section>

      {/* Participating Neighborhood Retailers */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#20281f]">Participating Local Stores</h2>
            <p className="text-xs text-[#7c8578] mt-0.5">
              Verified merchants with live digital catalogues and stock reporting in {selectedArea === 'all' ? 'Pune' : selectedArea}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="bg-white rounded-2xl border border-[#e9ece5] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#20281f] text-base leading-snug">
                      {shop.name}
                    </h3>
                    <div className="text-xs text-[#7c8578] mt-0.5 font-medium">
                      {shop.category}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#edf3e8] text-[#315e45] border border-[#d2decb] shrink-0">
                    {shop.distanceKm} km away
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#586154]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#8a9186] shrink-0" />
                    <span className="truncate">{shop.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#8a9186] shrink-0" />
                    <span>{shop.openingHours}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#7c8578]">
                    <Phone className="w-3.5 h-3.5 text-[#8a9186] shrink-0" />
                    <span>{shop.phone} · Owner: {shop.ownerName}</span>
                  </div>
                </div>

                {shop.featuredNotice && (
                  <div className="p-2.5 bg-[#f4f6ef] rounded-lg text-[11px] text-[#586154] border border-[#e9ece5]">
                    📢 {shop.featuredNotice}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-[#e9ece5] flex items-center justify-between">
                <div className="text-xs font-semibold text-[#586154]">
                  ⭐ {shop.rating} <span className="text-[#8a9186] font-normal">({shop.reviewCount})</span>
                </div>
                <button
                  onClick={() => onSelectShop(shop)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#315e45] hover:text-[#20281f] transition-colors cursor-pointer"
                >
                  <span>View Catalogue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comments Section adhering to requested .comments-section styling */}
      <section className="comments-section">
        <div>
          <h2>Neighborhood Community & Stock Notes</h2>
          <p>Real verified feedback from local shoppers confirming in-store stock, fair listed prices, and helpful service.</p>
        </div>

        <div className="comment-layout">
          {/* Post Form */}
          <form className="form-card" onSubmit={handleAddComment}>
            <div className="flex items-center gap-1.5 pb-2 border-b border-[#e9ece5] mb-2">
              <MessageSquare className="w-4 h-4 text-[#315e45]" />
              <b className="text-xs text-[#20281f]">Post a Verified Stock Tip</b>
            </div>

            <label htmlFor="comm-author">Your Name</label>
            <input
              id="comm-author"
              type="text"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              placeholder="e.g. Priyanshu M. (Student / Shopper)"
            />

            <label htmlFor="comm-shop">Select Store</label>
            <select
              id="comm-shop"
              value={commentShop}
              onChange={(e) => setCommentShop(e.target.value)}
              className="w-full border border-[#e5e9e1] rounded-lg p-2 text-xs bg-[#f9faf7] text-[#20281f] mt-1 font-semibold focus:outline-none"
            >
              {shops.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.area})
                </option>
              ))}
            </select>

            <label htmlFor="comm-text">Store Availability Tip</label>
            <textarea
              id="comm-text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="e.g. Visited today at 11 AM. Calculators and register notebooks are in stock at listed price!"
              required
            />

            <button type="submit" disabled={isSubmittingComment}>
              Post Community Note
            </button>
          </form>

          {/* Comment List */}
          <div className="comment-list">
            {comments.map((item) => (
              <div key={item.id} className="comment-card shadow-2xs">
                <div className="comment-avatar">
                  {item.avatarChar}
                </div>
                <div className="flex-1">
                  <b>{item.author} · {item.shopName}</b>
                  <small>{item.area} · {item.timeAgo}</small>
                  <p>{item.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

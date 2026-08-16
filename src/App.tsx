import React, { useState, useEffect, useMemo, useCallback } from "react";
import { INITIAL_PRODUCTS } from "./data/products";
import {
  ShoppingBag,
  Sparkles,
  Search,
  SlidersHorizontal,
  Plus,
  Trash2,
  X,
  CreditCard,
  CheckCircle,
  Truck,
  RotateCcw,
  Star,
  Tag,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Package,
  Check,
  Globe,
  Settings,
  Mail,
  Feather,
  User as UserIcon,
  LogOut,
  LogIn,
  MapPin,
  Clock,
  Play,
  ExternalLink,
  Edit,
  ArrowRight,
  Lock,
  Unlock,
  AlertTriangle,
  Compass,
  Heart,
  HelpCircle,
  Eye,
  Sun,
  CloudRain,
  Mountain,
  Route,
  Menu,
  Wind,
  Shield,
  Luggage,
  ChevronDown,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  MessageCircle,
  Ruler,
  IndianRupee,
  ChevronUp,
  ArrowLeft,
  Banknote
} from "lucide-react";
import AIConsole from "./components/AIConsole";
import AdminDashboard from "./components/AdminDashboard";
import MensTshirtCollection from "./components/MensTshirtCollection";
import WomensTshirtCollection from "./components/WomensTshirtCollection";
import FilterSidebar from "./components/FilterSidebar";
import HomepageDynamicSection from "./components/HomepageDynamicSection";
import { BankOffers, AdvancedDelivery, TrustBadges, SpecsGrid, ReviewSection } from "./components/ProductPageAddons";
import { ForgotPasswordModal } from "./components/ForgotPasswordModal";
import { SizeGuideModal } from "./components/SizeGuideModal";
import { NotifyMeModal } from "./components/NotifyMeModal";
import { PredictiveSearchBar } from "./components/PredictiveSearchBar";
import { RelatedProducts } from "./components/RelatedProducts";
import { OrderManagementModal, OrderRecord } from "./components/OrderManagementModal";
import { UserProfile } from "./components/UserProfile";
import { WishlistPage } from "./components/WishlistPage";
import { SiteFooter } from "./components/SiteFooter";
import { MultiStepCheckout } from "./components/MultiStepCheckout";
import { PromoBanner } from "./components/PromoBanner";
import { NewsletterSection } from "./components/NewsletterSection";
import GlobalNavigation from "./components/GlobalNavigation";
import SplitHeroBanner from "./components/SplitHeroBanner";
import CategoryPillsBar from "./components/CategoryPillsBar";
import FootwearCollectionBlock from "./components/FootwearCollectionBlock";
import ShopTheLookSection from "./components/ShopTheLookSection";
import { ProductGridSkeleton } from "./components/SkeletonLoaders";
import { ProductCard } from "./components/ProductCard";
import { Product, CartItem, Order, Coupon, AnalyticsSummary, User } from "./types";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import heroBgImage from "./assets/images/regenerated_image_1782751057651.png";
import { getDirectImageUrl, getDirectVideoUrl, getProductColorSwatches, getProductColorDetails } from "./utils";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  db,
  subscribeToProducts,
  subscribeToOrders,
  subscribeToCms,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveOrderToFirestore,
  saveCmsToFirestore
} from "./lib/firebase";

export function TirupatiMerchandiseLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 120 120" 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Compass Outer Split Ring */}
      <circle cx="60" cy="60" r="46" stroke="currentColor" strokeWidth="1.5" strokeDasharray="32 10 32 10 32 10 32 10" />
      {/* Compass Inner Solid Ring */}
      <circle cx="60" cy="60" r="38" stroke="currentColor" strokeWidth="2" />
      
      {/* Compass Axis Marks */}
      <line x1="60" y1="12" x2="60" y2="22" stroke="currentColor" strokeWidth="2" />
      <line x1="60" y1="98" x2="60" y2="108" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="60" x2="22" y2="60" stroke="currentColor" strokeWidth="2" />
      <line x1="98" y1="60" x2="108" y2="60" stroke="currentColor" strokeWidth="2" />

      {/* Compass Letters */}
      <text x="60" y="11" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor" stroke="none" className="font-sans">N</text>
      <text x="60" y="118" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor" stroke="none" className="font-sans">S</text>
      <text x="5" y="64" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor" stroke="none" className="font-sans">W</text>
      <text x="115" y="64" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor" stroke="none" className="font-sans">E</text>

      {/* Beautiful Double-Peak Mountains */}
      <path d="M34 76 L48 48 L58 64 L72 32 L86 76" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface LuggageItemRowProps {
  key?: string | number;
  product: Product;
  multiplierQty: number;
  onSelectAdd: (product: Product, size: string) => void;
}

function LuggageItemRow({ product, multiplierQty, onSelectAdd }: LuggageItemRowProps) {
  const [selectedSize, setSelectedSize] = useState("M");
  const [isPacked, setIsPacked] = useState(false);
  const [added, setAdded] = useState(false);

  const suggestedQty = multiplierQty;

  return (
    <div className={`p-3.5 bg-linen/20 rounded-xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
      isPacked ? "border-moss bg-moss/10 opacity-75 animate-pulse" : "border-sand/40"
    }`}>
      {/* Product Image & Meta */}
      <div className="flex items-center gap-3">
        {/* Toggle list packing checkbox */}
        <button
          onClick={() => setIsPacked(!isPacked)}
          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
            isPacked ? "bg-moss border-moss text-white" : "border-sand bg-white hover:border-moss cursor-pointer"
          }`}
        >
          {isPacked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        <img
          src={getDirectImageUrl(product.images?.[0]) || null}
          alt={product.name}
          className="w-12 h-12 rounded-lg object-contain bg-[#f0eae1] p-0.5 border border-sand/40"
          referrerPolicy="no-referrer"
        />

        <div className="space-y-0.5">
          <span className={`block text-xs font-serif font-bold leading-tight ${isPacked ? 'line-through text-linen/40' : 'text-ink'}`}>
            {product.name}
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-linen/50 font-mono">
            <span>{product.colors?.[0] || "Natural Linen"}</span>
            <span>•</span>
            <span className="text-moss font-extrabold">{suggestedQty} Units Suggested</span>
          </div>
        </div>
      </div>

      {/* Inputs and triggers aligned */}
      <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-sand/40">
        {/* Size Selection chips */}
        <div className="flex items-center gap-1">
          {["S", "M", "L", "XL"].map(sz => (
            <button
              key={sz}
              onClick={() => setSelectedSize(sz)}
              className={`w-7 h-7 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                selectedSize === sz
                  ? "bg-moss border-moss text-white shadow-xs"
                  : "bg-white border-sand text-ink hover:bg-sand/20"
              }`}
            >
              {sz}
            </button>
          ))}
        </div>

        {/* Add item to basket */}
        <button
          onClick={() => {
            onSelectAdd(product, selectedSize);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
          }}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1 ${
            added 
              ? "bg-moss text-white shadow-sm" 
              : "bg-white hover:bg-sand/20 text-ink border border-sand shadow-5xs"
          }`}
        >
          {added ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-moss/80 animate-[bounce_0.6s_ease-out]" />
              <span>ADDED</span>
            </>
          ) : (
            <>
              <Plus className="w-3 h-3 text-[#4e7a63]" />
              <span>ADD GEAR</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

const CATEGORIES_DATA = [
  {
    id: "oversized-fits",
    title: "Oversized Fits",
    description: "Relaxed silhouettes, dropped shoulders, and ultimate comfort in organic heavy-knit cotton.",
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
    searchKeyword: "oversized",
    filterTarget: "COMBO"
  },
  {
    id: "graphic-prints",
    title: "Graphic Prints",
    description: "Artistic expressions, minimalist typography, and organic botanical-pigment prints.",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
    searchKeyword: "graphic",
    filterTarget: "COMBO"
  },
  {
    id: "classic-basics",
    title: "Classic Basics",
    description: "The daily luxury. Clean-cut, premium crewnecks crafted from single-origin organic cotton.",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    searchKeyword: "basic",
    filterTarget: "COMBO"
  },
  {
    id: "heavyweight-tees",
    title: "Heavyweight Tees",
    description: "Substantial premium fabric with a structured, durable drape designed to last lifetimes.",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
    searchKeyword: "heavyweight",
    filterTarget: "COMBO"
  },
  {
    id: "bespoke-shoes",
    title: "Footwear & Kicks",
    description: "High-top trainers, tech runners, and ergonomic soles engineered for all-day urban movement.",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80",
    searchKeyword: "shoes",
    filterTarget: "SHOES"
  }
];

const checkDeliverability = (pincode: string) => {
  if (!/^\d{6}$/.test(pincode)) {
    return { deliverable: false, estimatedDays: 0, error: "Invalid 6-digit pincode" };
  }
  const sum = pincode.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  if (sum % 2 === 0) {
    return { deliverable: true, estimatedDays: 2 + (sum % 4) };
  } else {
    return { deliverable: true, estimatedDays: 3 + (sum % 3) };
  }
};

const renderHighlightIcon = (iconName: string) => {
  const lower = (iconName || "").toLowerCase();
  if (lower.includes("globe") || lower.includes("earth")) {
    return <span className="text-moss shrink-0"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg></span>;
  }
  if (lower.includes("feather") || lower.includes("light")) {
    return <span className="text-moss shrink-0"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-feather"><path d="M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a3 3 0 0 0-4.242-4.242l-6.172 6.154A2 2 0 0 0 9.2 15.57L9 18l2.43-.2a2 2 0 0 0 .57-.13a2 2 0 0 0 .67-.67z"/><path d="M11 13a4 4 0 0 0-4-4"/></svg></span>;
  }
  if (lower.includes("shield") || lower.includes("protect")) {
    return <span className="text-moss shrink-0"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/></svg></span>;
  }
  if (lower.includes("clock") || lower.includes("time")) {
    return <span className="text-moss shrink-0"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>;
  }
  if (lower.includes("sun") || lower.includes("hot")) {
    return <span className="text-moss shrink-0"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg></span>;
  }
  if (lower.includes("rain") || lower.includes("water")) {
    return <span className="text-moss shrink-0"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-rain"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg></span>;
  }
  if (lower.includes("mountain")) {
    return <span className="text-moss shrink-0"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mountain"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg></span>;
  }
  if (lower.includes("compass")) {
    return <span className="text-moss shrink-0"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-compass"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg></span>;
  }
  return <span className="text-moss shrink-0"><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg></span>;
};

function PincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<{ deliverable: boolean; estimatedDays: number; error?: string } | null>(null);
  
  const handleCheck = () => {
    if (!pincode.trim()) return;
    const res = checkDeliverability(pincode.trim());
    setResult(res);
  };

  return (
    <div className="p-4 bg-white/40 border border-[#1C2333]/15 rounded-sm space-y-3">
      <span className="text-[9px] font-mono uppercase text-earth/50 tracking-widest font-bold block flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-moss"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>Delivery Availability</span>
      </span>
      <div className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          placeholder="6-digit Pincode"
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, ""));
            setResult(null);
          }}
          className="flex-1 bg-white border border-[#1C2333]/15 rounded p-2 text-xs font-mono focus:outline-none focus:border-moss text-ink"
        />
        <button
          type="button"
          onClick={handleCheck}
          className="bg-[#1C2333] hover:bg-[#283144] text-[#D9CBB0] hover:text-linen px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-sm cursor-pointer transition font-bold"
        >
          Check
        </button>
      </div>
      {result && (
        <div className="text-xs font-mono transition-all duration-300">
          {result.error ? (
            <p className="text-red-600">{result.error}</p>
          ) : result.deliverable ? (
            <p className="text-moss flex items-center gap-1">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Deliverable in {result.estimatedDays} days (Artisanal batch transit)</span>
            </p>
          ) : (
            <p className="text-red-600">Standard shipping is unavailable for this coordinates.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const SHOW_GENDER_SPLIT = false;
  const SHOW_DEV_TOOLS = false;
  const SHOW_DISCOUNT_PRICING = false;
  const SHOW_SOCIAL_PROOF = false;
  // Dynamic homepage sections state
  const [homepageSections, setHomepageSections] = useState<any[]>([]);
  const [isSectionsLoading, setIsSectionsLoading] = useState<boolean>(true);

  // Navigation & User State
  const [activeTab, setActiveTab] = useState<"store" | "merchant" | "story" | "shipping" | "faq" | "about" | "materials" | "privacy" | "terms" | "account" | "order-confirmation" | "men" | "women" | "wishlist">("store");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Discover Carousel dragging and scrolling
  const discoverCarouselRef = React.useRef<HTMLDivElement>(null);
  const [isDiscoverDragging, setIsDiscoverDragging] = useState(false);
  const discoverStartX = React.useRef(0);
  const discoverScrollLeft = React.useRef(0);
  const discoverHasDragged = React.useRef(false);

  const handleDiscoverMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!discoverCarouselRef.current) return;
    setIsDiscoverDragging(true);
    discoverHasDragged.current = false;
    discoverStartX.current = e.pageX - discoverCarouselRef.current.offsetLeft;
    discoverScrollLeft.current = discoverCarouselRef.current.scrollLeft;
  };

  const handleDiscoverMouseLeaveOrUp = () => {
    setIsDiscoverDragging(false);
  };

  const handleDiscoverMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDiscoverDragging || !discoverCarouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - discoverCarouselRef.current.offsetLeft;
    const walk = (x - discoverStartX.current) * 1.5;
    if (Math.abs(walk) > 5) {
      discoverHasDragged.current = true;
    }
    discoverCarouselRef.current.scrollLeft = discoverScrollLeft.current - walk;
  };

  const scrollDiscoverLeft = () => {
    if (discoverCarouselRef.current) {
      discoverCarouselRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollDiscoverRight = () => {
    if (discoverCarouselRef.current) {
      discoverCarouselRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  // Coverflow Carousel Gestures & Handlers
  const touchStartXRef = React.useRef<number | null>(null);
  const touchEndXRef = React.useRef<number | null>(null);
  const [isCarouselDragging, setIsCarouselDragging] = useState(false);
  const carouselDragStartRef = React.useRef(0);
  const carouselDragMovedRef = React.useRef(false);

   const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    resetAutoplayTimer();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const startX = touchStartXRef.current;
    const endX = touchEndXRef.current;
    if (startX === null || endX === null) return;
    const distance = startX - endX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      setCategoryActiveIdx((prev) => (prev + 1) % categoriesList.length);
      resetAutoplayTimer();
    } else if (isRightSwipe) {
      setCategoryActiveIdx((prev) => (prev - 1 + categoriesList.length) % categoriesList.length);
      resetAutoplayTimer();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsCarouselDragging(true);
    carouselDragStartRef.current = e.clientX;
    carouselDragMovedRef.current = false;
    resetAutoplayTimer();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCarouselDragging) return;
    if (Math.abs(e.clientX - carouselDragStartRef.current) > 5) {
      carouselDragMovedRef.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent, index: number) => {
    if (!isCarouselDragging) return;
    const distance = carouselDragStartRef.current - e.clientX;
    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        setCategoryActiveIdx((prev) => (prev + 1) % categoriesList.length);
        resetAutoplayTimer();
      } else {
        setCategoryActiveIdx((prev) => (prev - 1 + categoriesList.length) % categoriesList.length);
        resetAutoplayTimer();
      }
    } else if (!carouselDragMovedRef.current) {
      setCategoryActiveIdx(index);
      resetAutoplayTimer();
    }
    setIsCarouselDragging(false);
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Prevent body scroll when mobile menu or mobile search is open
  useEffect(() => {
    if (isMobileMenuOpen || isMobileSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isMobileSearchOpen]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isAdminVerified, setIsAdminVerified] = useState<boolean>(false);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState<boolean>(false);
  const [pdpReviewStats, setPdpReviewStats] = useState<Record<string, { ratingAvg: number; reviewsCount: number }>>({});

  const handleReviewStatsUpdate = useCallback((productId: string, stats: { ratingAvg: number; reviewsCount: number }) => {
    setPdpReviewStats(prev => {
      const existing = prev[productId];
      if (existing && existing.ratingAvg === stats.ratingAvg && existing.reviewsCount === stats.reviewsCount) {
        return prev;
      }
      return { ...prev, [productId]: stats };
    });
  }, []);

  const handleCmsUpdate = useCallback((newCms: any) => {
    setCmsConfig(newCms);
  }, []);

  // Protected Admin Route Authorization Check: verify against Firestore isAdmin flag BEFORE rendering any admin content
  useEffect(() => {
    if (activeTab === "merchant") {
      setIsVerifyingAdmin(true);
      setIsAdminVerified(false);

      const verifyAdminInFirestore = async () => {
        try {
          if (!currentUser || !currentUser.email) {
            setIsAdminVerified(false);
            setIsVerifyingAdmin(false);
            return;
          }

          const userEmailLower = (currentUser.email || "").toLowerCase().trim();
          if (userEmailLower === "admin@tirupatimerchandise.com" || userEmailLower === "admin@tirupatimerchandise.com" || currentUser.role === "admin") {
            setIsAdminVerified(true);
            setIsVerifyingAdmin(false);
            return;
          }

          // 1. Verify against Firestore isAdmin flag / admin claims
          const userDocRef = doc(db, "users", currentUser.id || currentUser.email);
          const userSnap = await getDoc(userDocRef);
          
          let firestoreIsAdmin = false;
          if (userSnap.exists()) {
            const data = userSnap.data();
            firestoreIsAdmin = data?.isAdmin === true || data?.role === "admin";
          }

          // 2. Also check if custom claim or verified server role is admin
          const isVerified = firestoreIsAdmin;
          setIsAdminVerified(isVerified);
        } catch (err) {
          console.error("Error verifying Firestore admin status:", err);
          const userEmailLower = (currentUser?.email || "").toLowerCase().trim();
          if (userEmailLower === "admin@tirupatimerchandise.com" || userEmailLower === "admin@tirupatimerchandise.com" || currentUser?.role === "admin") {
            setIsAdminVerified(true);
          } else {
            setIsAdminVerified(false);
          }
        } finally {
          setIsVerifyingAdmin(false);
        }
      };

      verifyAdminInFirestore();
    } else {
      setIsAdminVerified(false);
    }
  }, [activeTab, currentUser]);
  
  // Auth Form Toggles
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    isAdminRegister: false
  });
  const [authError, setAuthError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const resetAuthForm = () => {
    setAuthForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      isAdminRegister: false
    });
    setAuthError("");
    setErrorMessage("");
    setAuthSuccess("");
  };

  const openAuthModal = (mode: "login" | "register" = "login", initialError: string = "") => {
    resetAuthForm();
    setAuthMode(mode);
    if (initialError) setAuthError(initialError);
    setShowAuthModal(true);
  };

  const navigateTo = (tabName: typeof activeTab, path: string) => {
    window.history.pushState(null, "", path);
    setActiveTab(tabName);
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [cmsConfig, setCmsConfig] = useState(() => {
    const localCms = localStorage.getItem("tirupati_merchandise_cms_config");
    const defaults = {
      announcementText: "Engineered for the Modern Nomad | Free Worldwide Shipping on orders over ₹12,000",
      heroImageUrl: "https://drive.google.com/file/d/160x326UcArS1sSk4t5VoEikEl6X3ay6b/view?usp=drive_link",
      heroImageUrlMobile: "https://drive.google.com/file/d/160x326UcArS1sSk4t5VoEikEl6X3ay6b/view?usp=drive_link",
      heroTitle: "Wear the Moment.",
      heroSubtitle: "Travel clothing made for the emotional experience of the journey — not just the distance.",
      heroCtaText: "ORDER NOW",
      featuredProductIds: [] as string[],
      categoriesTitle: "Shop By Category",
      categories: CATEGORIES_DATA
    };
    if (localCms) {
      try {
        const parsed = JSON.parse(localCms);
        if (parsed.heroImageUrl === "https://drive.google.com/file/d/1DN6AVpCrMvznYFyhP5HdkAr30zdLdSJR/view?usp=sharing" || parsed.heroImageUrl === "https://drive.google.com/file/d/1uWYJtoy5Hv0g-kdI3ai9ROSvmlnHMOTh/view?usp=drive_link" || parsed.heroImageUrl === "https://drive.google.com/file/d/19hyumPpfHCnTcO22djIrmI04aVllOJ7o/view?usp=drive_link" || parsed.heroImageUrl === "https://drive.google.com/file/d/14P8N6YVRmwKpBBotLOg00uJ89YcDP_ZX/view?usp=drive_link") {
          parsed.heroImageUrl = defaults.heroImageUrl;
        }
        if (parsed.heroImageUrlMobile === "https://drive.google.com/file/d/1DN6AVpCrMvznYFyhP5HdkAr30zdLdSJR/view?usp=sharing" || parsed.heroImageUrlMobile === "https://drive.google.com/file/d/1uWYJtoy5Hv0g-kdI3ai9ROSvmlnHMOTh/view?usp=drive_link" || parsed.heroImageUrlMobile === "https://drive.google.com/file/d/19hyumPpfHCnTcO22djIrmI04aVllOJ7o/view?usp=drive_link" || parsed.heroImageUrlMobile === "https://drive.google.com/file/d/14P8N6YVRmwKpBBotLOg00uJ89YcDP_ZX/view?usp=drive_link") {
          parsed.heroImageUrlMobile = defaults.heroImageUrlMobile;
        }
        if (!parsed.heroCtaText || parsed.heroCtaText === "SEEK THE COLLECTION" || parsed.heroCtaText === "Begin the Journey" || parsed.heroCtaText === "Explore Collection") {
          parsed.heroCtaText = "ORDER NOW";
          try { localStorage.setItem("tirupati_merchandise_cms_config", JSON.stringify(parsed)); } catch (e) {}
        }
        return { ...defaults, ...parsed, heroCtaText: parsed.heroCtaText === "SEEK THE COLLECTION" ? "ORDER NOW" : parsed.heroCtaText };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  const categoriesList = cmsConfig?.categories && cmsConfig.categories.length > 0 ? cmsConfig.categories : CATEGORIES_DATA;

  // Store lists
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Pathname routing synchronization
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const queryProductId = params.get("product");
      let prodId: string | null = null;

      if (path.startsWith("/product/")) {
        prodId = decodeURIComponent(path.replace("/product/", "")).trim();
      } else if (queryProductId) {
        prodId = queryProductId;
      }

      if (prodId) {
        const found = products.find(p => p.id === prodId) || INITIAL_PRODUCTS.find(p => p.id === prodId);
        if (found) {
          setSelectedProduct(found);
          setActiveTab("store");
          return;
        }
      }

      if (path === "/collections/men") {
        setActiveTab("men");
        setSelectedProduct(null);
      } else if (path === "/collections/women") {
        setActiveTab("women");
        setSelectedProduct(null);
      } else if (path === "/portal-ops-manage-v8") {
        setActiveTab("merchant");
        setSelectedProduct(null);
      } else if (path === "/") {
        setActiveTab("store");
        setSelectedProduct(null);
      } else {
        setSelectedProduct(null);
      }
    };
    
    // Check on initial load
    handleLocationChange();
    
    // Check on popstate navigation
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, [products]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);
  const [detectedVideos, setDetectedVideos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const detectVideos = async () => {
      const cmsUrls = [
        ...(cmsConfig?.heroImageUrl || "").split(",").map((u: string) => u.trim()),
        ...(cmsConfig?.heroImageUrlMobile || "").split(",").map((u: string) => u.trim())
      ].filter(Boolean);

      const urlsToCheck = [
        ...products.flatMap(p => p.images || []),
        ...cmsUrls
      ].filter(Boolean);

      const results: Record<string, boolean> = {};
      
      await Promise.all(urlsToCheck.map(async (url) => {
        if (detectedVideos[url] !== undefined) return;
        const lower = url.toLowerCase();
        if (lower.match(/\.(mp4|webm|mov|mkv|avi|m4v|ogv)$/)) {
          results[url] = true;
          return;
        }
        if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/)) {
          results[url] = false;
          return;
        }
        if (lower.includes("drive.google.com") || lower.includes("docs.google.com")) {
          let fileId = "";
          const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
          if (fileDMatch && fileDMatch[1]) {
            fileId = fileDMatch[1].trim();
          } else {
            const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (idMatch && idMatch[1]) {
              fileId = idMatch[1].trim();
            } else {
              const dMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
              if (dMatch && dMatch[1]) {
                fileId = dMatch[1].trim();
              }
            }
          }
          if (fileId) {
            try {
              const res = await fetch(`/api/detect-media?id=${fileId}`);
              if (res.ok) {
                const data = await res.json();
                results[url] = data.type === "video";
              }
            } catch (e) {
              console.error("Failed to detect Google Drive media type for", url, e);
            }
          }
        }
      }));
      
      if (Object.keys(results).length > 0) {
        setDetectedVideos(prev => ({ ...prev, ...results }));
      }
    };

    detectVideos();
  }, [products, cmsConfig?.heroImageUrl, cmsConfig?.heroImageUrlMobile]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  
  // Cart with session persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("tirupati_merchandise_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("tirupati_merchandise_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Modal & Feature States
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isNotifyMeOpen, setIsNotifyMeOpen] = useState(false);

  // Initial Sample Orders for testing Order History & Tracking
  const initialSampleOrders: OrderRecord[] = [
    {
      id: "VRTMN-984210",
      date: "22 July 2026",
      status: "Shipped",
      items: [
        {
          id: "prod-1",
          name: "Artisan Loomed Camp Shirt - Desert Beige",
          price: 3450,
          quantity: 1,
          selectedSize: "M",
          image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop"
        },
        {
          id: "prod-2",
          name: "Loomed Flax Linen Trouser - Earth Sand",
          price: 4200,
          quantity: 1,
          selectedSize: "L",
          image: "https://images.unsplash.com/photo-1506629082925-2368c7886470?q=80&w=800&auto=format&fit=crop"
        }
      ],
      totalAmount: 7650,
      shippingAddress: {
        fullName: "Arjun Verma",
        street: "148 Salt Lake Sector 5, Block EP",
        city: "Kolkata",
        state: "West Bengal",
        pincode: "700091",
        phone: "0000000000"
      },
      trackingNumber: "DELHIVERY-7849102",
      carrier: "Delhivery Express",
      estimatedDelivery: "25 July 2026",
      paymentMethod: "UPI (Paid)"
    }
  ];

  const [orderRecords, setOrderRecords] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem("tirupati_merchandise_orders");
      return saved ? JSON.parse(saved) : initialSampleOrders;
    } catch {
      return initialSampleOrders;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("tirupati_merchandise_orders", JSON.stringify(orderRecords));
    } catch {}
  }, [orderRecords]);

  const convertOrderToOrderRecord = (o: any, productsList: any[] = []): OrderRecord => {
    const rawItems = o.items || [];
    const items = rawItems.map((item: any) => {
      const cleanName = (item.name || "").split("(")[0].trim().toLowerCase();
      const matchedProd = productsList.find(
        (p) =>
          (p.id && (p.id === item.productId || p.id === item.id)) ||
          (p.name && cleanName && (
            p.name.toLowerCase() === cleanName ||
            cleanName.includes(p.name.toLowerCase()) ||
            p.name.toLowerCase().includes(cleanName)
          ))
      );
      const rawProdImg = item.image || item.imageUrl || (Array.isArray(item.images) && item.images[0]) || matchedProd?.images?.[0] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80";
      const prodImg = getDirectImageUrl(rawProdImg);

      return {
        id: item.productId || item.id || `item-${Math.random().toString(36).substring(2, 7)}`,
        name: item.name || matchedProd?.name || "Artisan Garment",
        image: prodImg,
        price: typeof item.price === "number" ? item.price : (matchedProd?.price || 0),
        quantity: item.quantity || 1,
        selectedSize: item.size || item.selectedSize || "M",
      };
    });

    let formattedDate = "Today";
    if (o.date) {
      try {
        formattedDate = new Date(o.date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      } catch {
        formattedDate = String(o.date);
      }
    }

    const rawAddress = o.shippingAddress || {};

    return {
      id: o.id || `VRTMN-${Math.floor(100000 + Math.random() * 899999)}`,
      date: formattedDate,
      status: o.status || (o.paymentStatus === "Payment Canceled" ? "Cancelled" : "Processing"),
      items: items.length > 0 ? items : [{
        id: "itm-default",
        name: "Artisan Garment Collection",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
        price: o.total || o.subtotal || 1999,
        quantity: 1,
        selectedSize: "M"
      }],
      totalAmount: typeof o.total === "number" ? o.total : (o.subtotal || 0),
      shippingAddress: {
        fullName: o.customerName || "Customer",
        street: rawAddress.street || "142 Innovation Park, Block C",
        city: rawAddress.city || "New Delhi",
        state: rawAddress.state || "Delhi",
        pincode: rawAddress.zip || rawAddress.pincode || "110001",
        phone: o.customerPhone || rawAddress.phone || "+91 00000 00000",
      },
      trackingNumber: o.trackingNumber || `DELHIVERY-${Math.floor(1000000 + Math.random() * 8999999)}`,
      carrier: "Delhivery Express",
      estimatedDelivery: o.estimatedDelivery || "3-5 Business Days",
      paymentMethod: o.paymentMethod ? `${o.paymentMethod} (${o.paymentStatus || 'Paid'})` : "UPI (Paid)",
      shippingTimeline: Array.isArray(o.shippingTimeline) ? o.shippingTimeline : undefined,
    };
  };

  useEffect(() => {
    if (!orders || orders.length === 0) return;
    setOrderRecords((prevRecords) => {
      let changed = false;
      const existingMap = new Map(prevRecords.map((r) => [r.id, r]));

      const newConvertedList: OrderRecord[] = [];
      for (const o of orders) {
        if (!existingMap.has(o.id)) {
          newConvertedList.push(convertOrderToOrderRecord(o, products));
          changed = true;
        } else {
          const existing = existingMap.get(o.id)!;
          if (o.status && existing.status !== o.status) {
            existingMap.set(o.id, { ...existing, status: o.status as any });
            changed = true;
          }
        }
      }

      if (!changed && newConvertedList.length === 0) {
        return prevRecords;
      }

      const merged = [...newConvertedList, ...Array.from(existingMap.values())];
      try {
        localStorage.setItem("tirupati_merchandise_orders", JSON.stringify(merged));
      } catch {}
      return merged;
    });
  }, [orders, products]);
  
  // Filtering & Catalog Selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [priceRange, setPriceRange] = useState<number>(100);
  const [selectedSizing, setSelectedSizing] = useState<string>("All");
  
  const [selectedMainFilter, setSelectedMainFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "price-low-high" | "price-high-low">("newest");

  // --- Dynamic URL Filtering & API state ---
  const [urlParams, setUrlParams] = useState(() => new URLSearchParams(window.location.search));
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setUrlParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const updateUrlParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "All") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const newRelativePathQuery = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
    window.history.pushState(null, "", newRelativePathQuery);
    setUrlParams(params);
  };

  const clearAllUrlParams = () => {
    window.history.pushState(null, "", window.location.pathname);
    setUrlParams(new URLSearchParams());
  };

  const apiCategory = urlParams.get("category");
  const apiColor = urlParams.get("color");
  const apiSize = urlParams.get("size");
  const apiGender = urlParams.get("gender");
  const apiTags = urlParams.get("tags");
  const apiBrand = urlParams.get("brand");
  const apiDesignPattern = urlParams.get("designPattern");
  const apiFitStyle = urlParams.get("fitStyle");
  const apiMinRating = urlParams.get("minRating");
  const apiMinPrice = urlParams.get("minPrice");
  const apiMaxPrice = urlParams.get("maxPrice");

  const hasActiveApiFilters = useMemo(() => {
    return !!(apiCategory || apiColor || apiSize || apiGender || apiTags || apiBrand || apiDesignPattern || apiFitStyle || apiMinRating || apiMinPrice || apiMaxPrice);
  }, [apiCategory, apiColor, apiSize, apiGender, apiTags, apiBrand, apiDesignPattern, apiFitStyle, apiMinRating, apiMinPrice, apiMaxPrice]);
  const [waitlistStatus, setWaitlistStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({ type: "idle" });
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("tirupati_merchandise_wishlist");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [wishlistToast, setWishlistToast] = useState<string | null>(null);
  const [cartToast, setCartToast] = useState<string | null>(null);
  const [isVideoError, setIsVideoError] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  useEffect(() => {
    setIsVideoError(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("tirupati_merchandise_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId: string, productName: string) => {
    if (!currentUser) {
      openAuthModal("login", "Please sign in or create an account to save items to your wishlist.");
      return;
    }
    setWishlist(prev => {
      const isStarred = prev.includes(productId);
      if (isStarred) {
        setWishlistToast(`Removed "${productName}" from wishlist`);
        setTimeout(() => setWishlistToast(null), 3000);
        return prev.filter(id => id !== productId);
      } else {
        setWishlistToast(`Saved "${productName}" for later`);
        setTimeout(() => setWishlistToast(null), 3000);
        return [...prev, productId];
      }
    });
  };

  const handleOpenWishlist = () => {
    if (!currentUser) {
      openAuthModal("login", "Please sign in or create an account to view your wishlist.");
      return;
    }
    setActiveTab("wishlist");
  };

  // Selected Detail View
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Dedicated Product Selection & Browser History Synchronization Handler
  const handleOpenProductDetails = useCallback((product: Product | null) => {
    if (product) {
      const targetPath = `/product/${product.id}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(
          { productId: product.id, fromPath: window.location.pathname, fromTab: activeTab },
          "",
          targetPath
        );
      }
      setSelectedProduct(product);
      if (activeTab !== "store") {
        setActiveTab("store");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setSelectedProduct(null);
      if (window.location.pathname.startsWith("/product/")) {
        if (window.history.state && window.history.state.fromPath) {
          window.history.back();
        } else {
          window.history.pushState(null, "", "/");
          setActiveTab("store");
        }
      }
    }
  }, [activeTab]);
  const [pdpPromoCode, setPdpPromoCode] = useState<string>("");
  const [pdpPromoDiscount, setPdpPromoDiscount] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedShirtSize, setSelectedShirtSize] = useState<string>("M");
  const [selectedTrouserSize, setSelectedTrouserSize] = useState<string>("30");
  const [selectedShoeSize, setSelectedShoeSize] = useState<string>("9");
  const [selectedComboIdx, setSelectedComboIdx] = useState<number | null>(null);

  useEffect(() => {
    if (selectedProduct) {
      const topOpts = (selectedProduct.topSizes && selectedProduct.topSizes.length > 0)
        ? selectedProduct.topSizes
        : ["S", "M", "L", "XL", "XXL", "XXXL"];
      setSelectedShirtSize(topOpts[1] || topOpts[0] || "M");

      const hasLetterTrouserSizes = selectedProduct.bottomSizes && selectedProduct.bottomSizes.some((s: string) => /[a-zA-Z]/.test(String(s)));
      const btmOpts = (selectedProduct.bottomSizes && selectedProduct.bottomSizes.length > 0 && !hasLetterTrouserSizes)
        ? selectedProduct.bottomSizes
        : ["26", "28", "30", "32", "34", "36", "38"];
      setSelectedTrouserSize(btmOpts.includes("30") ? "30" : btmOpts[0] || "30");

      const shoeOpts = (selectedProduct.shoeSizes && selectedProduct.shoeSizes.length > 0)
        ? selectedProduct.shoeSizes
        : ["6", "7", "8", "9", "10", "11", "12"];
      setSelectedShoeSize(shoeOpts.includes("9") ? "9" : shoeOpts[0] || "9");

      const isShoes = selectedProduct.productType === "Shoes" || (selectedProduct.category || "").toLowerCase().includes("footwear") || (selectedProduct.category || "").toLowerCase().includes("shoes");
      const isBottom = (selectedProduct.category || "").toLowerCase().includes("pant") || (selectedProduct.category || "").toLowerCase().includes("trouser") || (selectedProduct.category || "").toLowerCase().includes("bottom") || (selectedProduct.category || "").toLowerCase().includes("jeans");

      const singleOpts = (selectedProduct.sizes && selectedProduct.sizes.length > 0)
        ? selectedProduct.sizes
        : isShoes
          ? shoeOpts
          : isBottom
            ? btmOpts
            : topOpts;
      setSelectedSize(singleOpts[1] || singleOpts[0] || (isShoes ? "9" : isBottom ? "30" : "M"));
    } else {
      setPdpPromoCode("");
      setPdpPromoDiscount(0);
    }
  }, [selectedProduct]);
  const [activeImgIdx, setActiveImgIdx] = useState<number>(0);
  const [activeVariant, setActiveVariant] = useState<any>(null);
  const [pdpTab, setPdpTab] = useState<"details" | "origin" | "care">("details");
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmittedSize, setNotifySubmittedSize] = useState<string | null>(null);
  const [showNotifyFormForSize, setShowNotifyFormForSize] = useState<string | null>(null);

  // Swipe handlers for mobile product image gallery
  const [touchPdpStart, setTouchPdpStart] = useState<number | null>(null);
  const [touchPdpEnd, setTouchPdpEnd] = useState<number | null>(null);

  const handlePdpTouchStart = (e: React.TouchEvent) => {
    setTouchPdpStart(e.targetTouches[0].clientX);
  };

  const handlePdpTouchMove = (e: React.TouchEvent) => {
    setTouchPdpEnd(e.targetTouches[0].clientX);
  };

  const handlePdpTouchEnd = () => {
    if (!touchPdpStart || !touchPdpEnd) return;
    const distance = touchPdpStart - touchPdpEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    const displayImgs = selectedProduct
      ? (activeVariant && activeVariant.images && activeVariant.images.length > 0
          ? activeVariant.images
          : (selectedProduct.images || []))
      : [];

    if (isLeftSwipe) {
      setActiveImgIdx((prev) => (prev + 1) % (displayImgs.length || 1));
    }
    if (isRightSwipe) {
      setActiveImgIdx((prev) => (prev - 1 + (displayImgs.length || 1)) % (displayImgs.length || 1));
    }
    setTouchPdpStart(null);
    setTouchPdpEnd(null);
  };

  // Reset PDP configurations and scroll to top on selection
  useEffect(() => {
    if (selectedProduct) {
      setSelectedSize("M");
      setActiveImgIdx(0);
      setSelectedComboIdx(null);
      if (selectedProduct.variants && selectedProduct.variants.length > 0) {
        setActiveVariant(selectedProduct.variants[0]);
      } else {
        setActiveVariant(null);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setActiveVariant(null);
      setSelectedComboIdx(null);
    }
  }, [selectedProduct]);

  // Reset active image index when active variant changes
  useEffect(() => {
    setActiveImgIdx(0);
  }, [activeVariant]);
  
  // AI side companion
  const [isAIConsoleOpen, setIsAIConsoleOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Checkout & Coupon handling
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  
  const [shippingForm, setShippingForm] = useState({
    name: "Arjun Verma",
    email: "customer@tirupatimerchandise.com",
    street: "142 Innovation Park, Block C",
    city: "Singapore",
    state: "Central Region",
    zip: "119961",
    cardNumber: "4532 7712 9012 3381",
    cardExpiry: "08/29",
    cardCvc: "812",
    payMethod: "UPI"
  });
  const [paymentOption, setPaymentOption] = useState<"prepaid" | "cod">("prepaid");
  const [paymentPublicConfig, setPaymentPublicConfig] = useState<{
    upiVpa?: string;
    merchantId?: string;
    prepaidEnabled?: boolean;
    codEnabled?: boolean;
    cardEnabled?: boolean;
    upiEnabled?: boolean;
    netbankingEnabled?: boolean;
    intentEnabled?: boolean;
    qrEnabled?: boolean;
    prepaidDeliveryCost?: number;
    codDeliveryCost?: number;
    freeShippingThreshold?: number;
  }>({
    upiVpa: "",
    merchantId: "MERCHANTWNDR12",
    prepaidEnabled: true,
    codEnabled: true,
    cardEnabled: true,
    upiEnabled: true,
    netbankingEnabled: true,
    intentEnabled: true,
    qrEnabled: true,
    prepaidDeliveryCost: 0,
    codDeliveryCost: 200,
    freeShippingThreshold: 2999
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const refreshPaymentPublicConfig = () => {
    fetch("/api/payments/config")
      .then(res => (res.ok && res.headers.get("content-type")?.includes("application/json") ? res.json() : null))
      .then(data => {
        if (data) {
          setPaymentPublicConfig({
            upiVpa: data.upiVpa || "",
            merchantId: data.merchantId || "MERCHANTWNDR12",
            prepaidEnabled: data.prepaidEnabled ?? true,
            codEnabled: data.codEnabled ?? true,
            cardEnabled: data.cardEnabled ?? true,
            upiEnabled: data.upiEnabled ?? true,
            netbankingEnabled: data.netbankingEnabled ?? true,
            intentEnabled: data.intentEnabled ?? true,
            qrEnabled: data.qrEnabled ?? true,
            prepaidDeliveryCost: data.prepaidDeliveryCost ?? 0,
            codDeliveryCost: data.codDeliveryCost ?? 200,
            freeShippingThreshold: data.freeShippingThreshold ?? 2999
          });
          if (data.prepaidEnabled === false && data.codEnabled !== false) {
            setPaymentOption("cod");
          } else if (data.codEnabled === false && data.prepaidEnabled !== false) {
            setPaymentOption("prepaid");
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshPaymentPublicConfig();

    const handleConfigUpdate = () => {
      refreshPaymentPublicConfig();
    };

    window.addEventListener("payment-config-updated", handleConfigUpdate);
    return () => {
      window.removeEventListener("payment-config-updated", handleConfigUpdate);
    };
  }, []);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  // UPI Payments checkout & dynamic QR/Intent states
  const [activeUpiPayment, setActiveUpiPayment] = useState<{
    orderId: string;
    upiUrl: string;
    qrCode: string;
    amountUSD: number;
    amountINR: number;
  } | null>(null);
  const [upiTimer, setUpiTimer] = useState(300); // 5 minutes in seconds
  const [upiStatus, setUpiStatus] = useState<"pending" | "success" | "timeout" | "failed">("pending");

  // Custom UPI Intent & Post-Payment UTR Workaround States
  const [showUtrStep, setShowUtrStep] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [utrInput, setUtrInput] = useState("");
  const [utrSubmitting, setUtrSubmitting] = useState(false);
  const [utrError, setUtrError] = useState<string | null>(null);
  const [utrSuccess, setUtrSuccess] = useState(false);
  const [selectedUpiOption, setSelectedUpiOption] = useState<string>("paytm");

  // UPI Status Polling Loop
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    let timerInterval: NodeJS.Timeout | null = null;

    if (activeUpiPayment && upiStatus === "pending") {
      // Start the 1-second countdown timer
      setUpiTimer(300);
      timerInterval = setInterval(() => {
        setUpiTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval!);
            clearInterval(pollInterval!);
            setUpiStatus("timeout");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start the 2-second status polling
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/checkout/status/${activeUpiPayment.orderId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === "Success" || data.status === "Delivered") {
              setUpiStatus("success");
              clearInterval(pollInterval!);
              clearInterval(timerInterval!);
              
              // Emulate order finalization success screen matching handlePlaceOrder
              const confirmedOrder = {
                id: activeUpiPayment.orderId,
                trackingNumber: data.trackingNumber || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
                customerEmail: shippingForm.email,
                total: activeUpiPayment.amountUSD,
              };

              setOrderSuccess(confirmedOrder as any);
              setCart([]); // Clear cart
              setAppliedCoupon(null);
              setCouponCode("");

              // Local order backup persist
              try {
                const localOrdersStr = localStorage.getItem("tirupati_merchandise_custom_orders");
                const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];
                localOrders.push(confirmedOrder);
                localStorage.setItem("tirupati_merchandise_custom_orders", JSON.stringify(localOrders));
              } catch (e) {
                console.error("Local order backup failed", e);
              }

              // Refresh collections state
              fetchProducts();
              fetchOrders();
              
              // Clear active checkout activePayment state
              setActiveUpiPayment(null);
            } else if (data.status === "Failed") {
              setUpiStatus("failed");
              clearInterval(pollInterval!);
              clearInterval(timerInterval!);
            }
          }
        } catch (err) {
          console.error("Failed polling order status", err);
        }
      }, 2000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [activeUpiPayment, upiStatus, shippingForm.email]);

  // Admin / Merchant Management Controls
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adminOrderFilter, setAdminOrderFilter] = useState<string>("All");
  const [merchantAIReport, setMerchantAIReport] = useState("");
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
   // Refactored Premium Admin State Modules
  const [adminSubTab, setAdminSubTab] = useState<"analytics" | "products" | "orders" | "crm" | "cms">("analytics");
  const [customers, setCustomers] = useState<any[]>([]);
  const [isCmsSubmitting, setIsCmsSubmitting] = useState(false);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [isAddingVariant, setIsAddingVariant] = useState(false);

  // Hero section slideshow state and logic
  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const desktopHeroImages = useMemo(() => {
    return (cmsConfig.heroImageUrl || "")
      .split(",")
      .map(url => url.trim())
      .filter(Boolean);
  }, [cmsConfig.heroImageUrl]);

  const mobileHeroImages = useMemo(() => {
    return (cmsConfig.heroImageUrlMobile || "")
      .split(",")
      .map(url => url.trim())
      .filter(Boolean);
  }, [cmsConfig.heroImageUrlMobile]);

  const activeHeroImages = useMemo(() => {
    if (isMobile) {
      return mobileHeroImages.length > 0 
        ? mobileHeroImages 
        : (desktopHeroImages.length > 0 ? desktopHeroImages : [heroBgImage]);
    } else {
      return desktopHeroImages.length > 0 
        ? desktopHeroImages 
        : [heroBgImage];
    }
  }, [isMobile, desktopHeroImages, mobileHeroImages]);

  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  useEffect(() => {
    if (activeHeroImages.length <= 1) {
      setCurrentHeroIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentHeroIdx(prev => (prev + 1) % activeHeroImages.length);
    }, 2000); // 2 seconds per slide
    return () => clearInterval(interval);
  }, [activeHeroImages, lastInteractionTime]);

  const handlePrevSlide = () => {
    if (activeHeroImages.length <= 1) return;
    setCurrentHeroIdx(prev => (prev - 1 + activeHeroImages.length) % activeHeroImages.length);
    setLastInteractionTime(Date.now());
  };

  const handleNextSlide = () => {
    if (activeHeroImages.length <= 1) return;
    setCurrentHeroIdx(prev => (prev + 1) % activeHeroImages.length);
    setLastInteractionTime(Date.now());
  };

  const handleSelectSlide = (idx: number) => {
    setCurrentHeroIdx(idx);
    setLastInteractionTime(Date.now());
  };
  
  // Bulk edit states
  const [bulkCategory, setBulkCategory] = useState("T-Shirts");
  const [bulkDiscountPercentage, setBulkDiscountPercentage] = useState("");
  const [bulkPriceMultiplier, setBulkPriceMultiplier] = useState("");
  const [bulkAddTag, setBulkAddTag] = useState("");
  const [bulkRemoveTag, setBulkRemoveTag] = useState("");

  // Variant addition states
  const [variantForm, setVariantForm] = useState({
    productId: "",
    size: "M",
    color: "",
    stock: 10
  });

  // Refund dialog/flow state
  const [refundForm, setRefundForm] = useState({
    orderId: "",
    refundAmount: "",
    reason: "",
    restock: true
  });
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  
  // New/Edit Product Form
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "T-Shirts",
    images: ["", ""],
    stock: "15",
    color: "Forest Green",
    sizes: "S, M, L, XL",
    tags: "mountain, minimalist",
    featured: false,
    inspiration: ""
  });
  const [productFormError, setProductFormError] = useState("");

  // Coordinate My Luggage Plan Interactive States
  const [isLuggageModalOpen, setIsLuggageModalOpen] = useState(false);
  const [luggageStep, setLuggageStep] = useState<number>(1);
  const [luggageDestination, setLuggageDestination] = useState<string>("Arid Desert");
  const [luggageDays, setLuggageDays] = useState<number>(5);

  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  // 3D Coverflow Carousel active state
  const [categoryActiveIdx, setCategoryActiveIdx] = useState(0);
  const [autoplayInteractionTrigger, setAutoplayInteractionTrigger] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  const resetAutoplayTimer = () => {
    setAutoplayInteractionTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (isCarouselHovered) return;

    const interval = setInterval(() => {
      setCategoryActiveIdx((prev) => (prev + 1) % categoriesList.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [autoplayInteractionTrigger, isCarouselHovered, categoriesList.length]);

  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistName, setWaitlistName] = useState("");
  const [isWaitlistSubmitted, setIsWaitlistSubmitted] = useState(false);
  const [stripEmail, setStripEmail] = useState("");
  
  // Contact strip state variables
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isContactSubmitted, setIsContactSubmitted] = useState(false);

  // Build Your Capsule State
  const [capsuleItems, setCapsuleItems] = useState<{ product: Product; size: string }[]>([]);

  const featuredFootwear = useMemo(() => {
    return products.find(p => (p.category || "").toLowerCase().includes("footwear") || (p.tags || []).includes("footwear")) || null;
  }, [products]);

  const handleGlobalCategorySelect = (category: string, subCategory?: string) => {
    const catLower = category.toLowerCase();
    if (catLower === "footwear" || catLower === "shoes") {
      setSelectedMainFilter("SHOES");
      if (subCategory) {
        updateUrlParam("fitStyle", subCategory);
      } else {
        updateUrlParam("category", "Footwear");
      }
    } else if (catLower === "apparel" || catLower === "combo") {
      setSelectedMainFilter("COMBO");
      updateUrlParam("category", null);
      updateUrlParam("fitStyle", null);
    } else if (catLower === "accessories") {
      setSelectedMainFilter("ACCESSORIES");
    } else if (catLower === "collections") {
      setSelectedMainFilter("COLLECTIONS");
    } else {
      setSelectedMainFilter("ALL");
      updateUrlParam("category", category);
    }
    setActiveTab("store");
    const catalogEl = document.getElementById("tirupati-merchandise-garments") || document.getElementById("footwear-collection-section") || document.getElementById("storefront-hero");
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleCapsuleItem = (product: Product) => {
    const exists = capsuleItems.some(itm => itm.product.id === product.id);
    if (exists) {
      setCapsuleItems(prev => prev.filter(itm => itm.product.id !== product.id));
    } else {
      if (capsuleItems.length >= 3) {
        setWishlistToast("Capsule is limited to 3 items for a light travel weight.");
        setTimeout(() => setWishlistToast(null), 3000);
        return;
      }
      setCapsuleItems(prev => [...prev, { product, size: "M" }]);
    }
  };

  const updateCapsuleItemSize = (productId: string, size: string) => {
    setCapsuleItems(prev => prev.map(itm => itm.product.id === productId ? { ...itm, size } : itm));
  };

  // Moments count state removed for minimal hero layout.

  // Premium Pre-launch Waitlist States & Countdown
  const [premiumWaitlistEmail, setPremiumWaitlistEmail] = useState("");
  const [isPremiumWaitlistSubmitted, setIsPremiumWaitlistSubmitted] = useState(false);
  const [premiumCountdown, setPremiumCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateCountdown = () => {
      // Countdown to September 1, 2025 00:00 IST.
      // Since current time is June 2026, we check if passed and dynamically target the next Sept 1st (2026) 
      // so the preview has a live ticking countdown.
      const now = new Date();
      const target2025 = new Date("2025-09-01T00:00:00+05:30").getTime();
      let target = target2025;
      
      if (now.getTime() > target2025) {
        const target2026 = new Date("2026-09-01T00:00:00+05:30").getTime();
        if (now.getTime() > target2026) {
          target = new Date("2027-09-01T00:00:00+05:30").getTime();
        } else {
          target = target2026;
        }
      }

      const difference = target - now.getTime();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setPremiumCountdown(calculateCountdown());
    const interval = setInterval(() => {
      setPremiumCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const quoteTicker = "🌱 \"Wander often, wander light. Nature does not hurry, yet everything is accomplished.\" • Organic dyes, low-impact linens • Seamless checkout";

  // Bootstrap initial items, set up real-time Firestore synchronization, and read storage caches
  useEffect(() => {
    // Clear product and CMS caches on startup to re-initialize directly from updated db.json
    try {
      localStorage.removeItem("tirupati_merchandise_cached_products");
      localStorage.removeItem("tirupati_merchandise_added_products");
      localStorage.removeItem("tirupati_merchandise_updated_products");
      localStorage.removeItem("tirupati_merchandise_deleted_product_ids");
      localStorage.removeItem("tirupati_merchandise_cms_config");
    } catch (e) {
      console.warn("Failed clearing legacy product caches", e);
    }

    // 1. Establish Real-time Firestore Stream for Products
    const unsubProducts = subscribeToProducts(
      (realtimeProducts) => {
        if (realtimeProducts && realtimeProducts.length > 0) {
          setProducts(realtimeProducts);
        }
        setIsLoading(false);
      },
      (err) => {
        console.warn("Realtime products snapshot failed, falling back to API fetch", err);
        if (err?.code === "resource-exhausted" || err?.message?.includes("quota")) {
          setQuotaExceeded(true);
        }
        setIsLoading(false);
        fetchProducts();
      }
    );

    // 2. Establish Real-time Firestore Stream for Orders
    const unsubOrders = subscribeToOrders(
      (realtimeOrders) => {
        if (realtimeOrders) {
          setOrders(realtimeOrders);
        }
      },
      (err) => {
        console.warn("Realtime orders snapshot failed, falling back to API fetch", err);
        fetchOrders();
      }
    );

    // 3. Establish Real-time Firestore Stream for CMS Config
    const unsubCms = subscribeToCms(
      (realtimeCms) => {
        if (realtimeCms) {
          if (!realtimeCms.heroCtaText || realtimeCms.heroCtaText.toUpperCase() === "SEEK THE COLLECTION" || realtimeCms.heroCtaText === "Seek the Collection" || realtimeCms.heroCtaText === "Begin the Journey" || realtimeCms.heroCtaText === "Explore Collection") {
            realtimeCms.heroCtaText = "ORDER NOW";
          }
          setCmsConfig(realtimeCms);
        }
      },
      (err) => {
        console.warn("Realtime CMS snapshot failed, falling back to API fetch", err);
        fetchCms();
      }
    );

    // Initial API load for fallback/sections
    fetchProducts();
    fetchOrders();
    fetchCms();
    fetchHomepageSections();

    // Recover token/user session if saved in localStorage
    const savedToken = localStorage.getItem("terrawander_token");
    const savedUser = localStorage.getItem("terrawander_user");
    if (savedToken && savedUser) {
      try {
        setAuthToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
        // Prefill shipping details from user if exists
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.shippingAddress) {
          setShippingForm(prev => ({
            ...prev,
            name: parsedUser.name,
            email: parsedUser.email,
            street: parsedUser.shippingAddress.street || "",
            city: parsedUser.shippingAddress.city || "",
            state: parsedUser.shippingAddress.state || "",
            zip: parsedUser.shippingAddress.zip || ""
          }));
        }
      } catch (e) {
        console.error("Session restoration expired.", e);
      }
    }

    const localCart = localStorage.getItem("terrawander_cart");
    if (localCart) {
      try {
        setCart(JSON.parse(localCart));
      } catch (e) {
        console.error("Cart retrieval fault.", e);
      }
    }

    return () => {
      unsubProducts();
      unsubOrders();
      unsubCms();
    };
  }, []);

  // Synchronize cart state
  useEffect(() => {
    localStorage.setItem("terrawander_cart", JSON.stringify(cart));
  }, [cart]);

  // Synchronize admin statistics dynamically when order list modifications hit
  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchAnalytics();
      fetchCustomers();
    }
  }, [orders, products, currentUser, authToken]);

  const fetchProducts = async (currentUrlParams?: URLSearchParams) => {
    try {
      const query = (currentUrlParams || urlParams).toString();
      const endpoint = query ? `/api/products?${query}` : "/api/products";
      const res = await fetch(endpoint, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const validData = Array.isArray(data) ? data.filter((p: any) => p && p.name && p.price && p.id !== "writeTest") : [];
        validData.sort((a: any, b: any) => {
          const orderA = typeof a.displayOrder === "number" ? a.displayOrder : (typeof a.sortOrder === "number" ? a.sortOrder : 999999);
          const orderB = typeof b.displayOrder === "number" ? b.displayOrder : (typeof b.sortOrder === "number" ? b.sortOrder : 999999);
          return orderA - orderB;
        });
        setProducts(validData);
        return;
      }
    } catch (e: any) {
      console.error("Unable to gather products list from Firestore", e);
      if (e?.code === "resource-exhausted" || e?.message?.includes("quota")) {
        setQuotaExceeded(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(urlParams);
  }, [urlParams]);

  const fetchOrders = async () => {
    try {
      const headers: Record<string, string> = {};
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      const res = await fetch("/api/orders", { headers });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        localStorage.setItem("tirupati_merchandise_cached_orders", JSON.stringify(data));
        return;
      }
    } catch (e) {
      console.error("Unable to gather order history from Firestore, trying cache...", e);
    }

    // Fallback to localStorage if Firestore fetch fails
    const localOrdersStr = localStorage.getItem("tirupati_merchandise_cached_orders");
    if (localOrdersStr) {
      try {
        const parsed = JSON.parse(localOrdersStr);
        setOrders(parsed);
      } catch (e) {
        console.error("Failed to parse cached orders", e);
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      if (!authToken) return;
      const res = await fetch("/api/analytics", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
        return;
      }
    } catch (e) {
      console.warn("Unable to compile analytics ledger from server, generating local ledger...", e);
    }

    // Local fallback calculation
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeProducts = Array.isArray(products) ? products : [];
    const totalRevenue = safeOrders
      .filter(o => o && o.status !== "Pending")
      .reduce((sum, o) => sum + (Number(o?.total) || 0), 0);
    const totalOrders = safeOrders.length;
    const totalProductsSold = safeOrders.reduce((sum, o) => {
      if (!o || !Array.isArray(o.items)) return sum;
      return sum + o.items.reduce((itemSum, item) => itemSum + (Number(item?.quantity) || 0), 0);
    }, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const categorySalesMap: Record<string, number> = {};
    safeOrders.forEach(o => {
      if (!o || !Array.isArray(o.items)) return;
      o.items.forEach(item => {
        if (!item) return;
        const prod = safeProducts.find(p => p && p.id === item.productId);
        const category = (prod && prod.category) ? prod.category : "General";
        const price = Number(item.price) || 0;
        const qty = Number(item.quantity) || 0;
        categorySalesMap[category] = (categorySalesMap[category] || 0) + (price * qty);
      });
    });
    const salesByCategory = Object.entries(categorySalesMap).map(([category, value]) => ({
      category,
      value: parseFloat(value.toFixed(2))
    }));
    const salesByDateMap: Record<string, number> = {};
    safeOrders.forEach(o => {
      if (!o) return;
      let dateStr = "Unknown Date";
      if (typeof o.date === "string") {
        dateStr = o.date.split("T")[0];
      } else if (o.date && typeof (o.date as any).toISOString === "function") {
        dateStr = (o.date as any).toISOString().split("T")[0];
      }
      salesByDateMap[dateStr] = (salesByDateMap[dateStr] || 0) + (Number(o.total) || 0);
    });
    const salesByDate = Object.entries(salesByDateMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, value: parseFloat(value.toFixed(2)) }));
    const productSalesMap: Record<string, { sales: number; revenue: number }> = {};
    safeOrders.forEach(o => {
      if (!o || !Array.isArray(o.items)) return;
      o.items.forEach(item => {
        if (!item || !item.name) return;
        const entry = productSalesMap[item.name] || { sales: 0, revenue: 0 };
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        entry.sales += qty;
        entry.revenue += price * qty;
        productSalesMap[item.name] = entry;
      });
    });
    const topProducts = Object.entries(productSalesMap)
      .map(([name, stats]) => ({
        name,
        sales: stats.sales,
        revenue: parseFloat(stats.revenue.toFixed(2))
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    const outOfStockCount = safeProducts.filter(p => p && (Number(p.stock) || 0) <= 0).length;
    const ordersProcessing = safeOrders.filter(o => o && (o.status === "Processing" || o.status === "Pending")).length;
    const ordersDelivered = safeOrders.filter(o => o && o.status === "Delivered").length;
    const totalProductsListed = safeProducts.length;

    setAnalytics({
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      ordersProcessing,
      ordersDelivered,
      totalProductsListed,
      outOfStockCount,
      totalProductsSold,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      salesByCategory,
      salesByDate,
      topProducts
    });
  };

  const fetchCms = async () => {
    try {
      const res = await fetch("/api/cms");
      if (res.ok) {
        const data = await res.json();
        if (!data.heroCtaText || data.heroCtaText.toUpperCase() === "SEEK THE COLLECTION" || data.heroCtaText === "Seek the Collection" || data.heroCtaText === "Begin the Journey" || data.heroCtaText === "Explore Collection") {
          data.heroCtaText = "ORDER NOW";
        }
        setCmsConfig(data);
        localStorage.setItem("tirupati_merchandise_cms_config", JSON.stringify(data));
        return;
      }
    } catch (e) {
      console.error("Failed to fetch CMS from Firestore, using local fallback...", e);
    }

    // Fallback to localStorage if Firestore fetch fails
    const localCms = localStorage.getItem("tirupati_merchandise_cms_config");
    if (localCms) {
      try {
        const parsed = JSON.parse(localCms);
        setCmsConfig(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Unable to parse local CMS config", e);
      }
    }
  };

  const fetchCustomers = async () => {
    try {
      if (!authToken) return;
      const res = await fetch("/api/customers", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
        return;
      }
    } catch (e) {
      console.warn("Unable to gather CRM customers registry from server, generating local registry...", e);
    }

    // Local fallback customer generation
    const customerList: any[] = [];
    const safeOrders = Array.isArray(orders) ? orders : [];
    safeOrders.forEach(o => {
      if (!o || !o.customerEmail || typeof o.customerEmail !== "string") return;
      const oEmailLower = o.customerEmail.toLowerCase();
      const emailExists = customerList.some(c => c && c.email && typeof c.email === "string" && c.email.toLowerCase() === oEmailLower);
      if (!emailExists) {
        const guestOrders = safeOrders.filter(ord => ord && ord.customerEmail && typeof ord.customerEmail === "string" && ord.customerEmail.toLowerCase() === oEmailLower);
        const totalOrders = guestOrders.length;
        const totalSpent = guestOrders.reduce((acc, ord) => acc + (Number(ord?.total) || 0), 0);
        const averageOrderValue = totalOrders > 0 ? parseFloat((totalSpent / totalOrders).toFixed(2)) : 0;
        const sizesUsed: Record<string, number> = {};
        guestOrders.forEach(ord => {
          if (!ord || !Array.isArray(ord.items)) return;
          ord.items.forEach(item => {
            if (item && item.size) {
              sizesUsed[item.size] = (sizesUsed[item.size] || 0) + (Number(item.quantity) || 1);
            }
          });
        });
        const preferredSizes = Object.entries(sizesUsed)
          .sort((a, b) => b[1] - a[1])
          .map(entry => entry[0]);
        const tags = ["Guest"];
        if (totalSpent > 150) tags.push("VIP");
        customerList.push({
          id: `guest-${Math.floor(1000 + Math.random() * 9000)}`,
          name: o.customerName || o.customerEmail,
          email: o.customerEmail,
          role: "customer",
          shippingAddress: o.shippingAddress || null,
          totalOrders,
          lifetimeValue: parseFloat(totalSpent.toFixed(2)),
          averageOrderValue,
          preferredSizes,
          tags
        });
      }
    });
    setCustomers(customerList);
  };

  const fetchHomepageSections = async () => {
    try {
      setIsSectionsLoading(true);
      const res = await fetch("/api/sections");
      if (res.ok) {
        const data = await res.json();
        setHomepageSections(data);
      }
    } catch (e) {
      console.error("Failed to fetch homepage sections:", e);
    } finally {
      setIsSectionsLoading(false);
    }
  };

  const handleAuthInputChange = (field: keyof typeof authForm, value: string) => {
    setAuthForm(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage("");
    if (authError) setAuthError("");
  };

  const isTargetAdminEmail = (emailStr: string) => {
    const clean = emailStr.trim().toLowerCase();
    return clean === "admin@tirupatimerchandise.com" || clean === "admin@tirupatimerchandise.com" || (authMode === "register" && authForm.isAdminRegister);
  };

  // --- Auth API Actions ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setErrorMessage("");
    setAuthSuccess("");

    if (!authForm.email || !authForm.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      setAuthError("Please enter a valid email address.");
      return;
    }

    const isAdminEmail = isTargetAdminEmail(authForm.email);

    if (isAdminEmail && (!authForm.password || authForm.password.trim().length === 0)) {
      setErrorMessage("Please enter your admin password.");
      setAuthError("Please enter your admin password.");
      return;
    }

    if (authMode === "login") {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: authForm.email,
            password: authForm.password
          })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Login error");
        }

        setAuthToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem("terrawander_token", data.token);
        localStorage.setItem("terrawander_user", JSON.stringify(data.user));
        
        try {
          await setDoc(doc(db, "users", data.user.id || data.user.email), {
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            isAdmin: data.user.role === "admin"
          }, { merge: true });
        } catch (e) {
          console.error("Firestore user sync error", e);
        }

        // Auto update shipping forms
        if (data.user.shippingAddress) {
          setShippingForm(prev => ({
            ...prev,
            name: data.user.name,
            email: data.user.email,
            street: data.user.shippingAddress.street || "",
            city: data.user.shippingAddress.city || "",
            state: data.user.shippingAddress.state || "",
            zip: data.user.shippingAddress.zip || ""
          }));
        }

        // Re-request order list to align with backend permission filter
        setTimeout(() => {
          fetchOrders();
        }, 100);

        setAuthSuccess(`Welcome, ${data.user.name || "User"}!`);
        setTimeout(() => {
          setShowAuthModal(false);
          resetAuthForm();
        }, 1200);

      } catch (err: any) {
        const msg = err.message || "Auth error.";
        setErrorMessage(msg);
        setAuthError(msg);
      }
    } else {
      // Register
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authForm.name,
            email: authForm.email,
            password: authForm.password,
            phone: authForm.phone,
            role: authForm.isAdminRegister ? "admin" : "customer",
            street: authForm.street,
            city: authForm.city,
            state: authForm.state,
            zip: authForm.zip
          })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Registration validation error");
        }

        setAuthToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem("terrawander_token", data.token);
        localStorage.setItem("terrawander_user", JSON.stringify(data.user));

        try {
          await setDoc(doc(db, "users", data.user.id || data.user.email), {
            email: data.user.email,
            name: data.user.name,
            phone: data.user.phone || authForm.phone || "",
            role: data.user.role,
            isAdmin: data.user.role === "admin"
          }, { merge: true });
        } catch (e) {
          console.error("Firestore user sync error", e);
        }

        setAuthSuccess(`Welcome, ${data.user.name || "User"}! Account registered successfully.`);
        setTimeout(() => {
          setShowAuthModal(false);
          resetAuthForm();
          fetchOrders();
        }, 1200);

      } catch (err: any) {
        const msg = err.message || "Sign up failed.";
        setErrorMessage(msg);
        setAuthError(msg);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem("terrawander_token");
    localStorage.removeItem("terrawander_user");
    // Clear admin and reload public products/orders
    setActiveTab("store");
    setAppliedCoupon(null);
    setTimeout(() => {
      fetchOrders();
    }, 150);
  };

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
  };

  // --- Cart operations ---
  const addToCart = (product: Product, size: string, variant?: any) => {
    const activeVar = variant !== undefined 
      ? variant 
      : (selectedProduct?.id === product.id ? activeVariant : null);

    const existingIndex = cart.findIndex(
      itm => itm.product.id === product.id && 
             itm.selectedSize === size &&
             itm.selectedVariant?.color === activeVar?.color &&
             itm.selectedVariant?.design === activeVar?.design
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart(prev => [...prev, { 
        product, 
        quantity: 1, 
        selectedSize: size, 
        selectedVariant: activeVar || undefined 
      }]);
    }
    setCartToast(`Added "${product.name}" (${size}) to your bag`);
    setTimeout(() => setCartToast(null), 3000);
  };

  const updateCartQty = (productId: string, size: string, change: number, variant?: any) => {
    const updated = cart.map(itm => {
      const isMatch = itm.product.id === productId && 
                      itm.selectedSize === size &&
                      itm.selectedVariant?.color === variant?.color &&
                      itm.selectedVariant?.design === variant?.design;
      if (isMatch) {
        const newQty = Math.max(1, itm.quantity + change);
        return { ...itm, quantity: newQty };
      }
      return itm;
    });
    setCart(updated);
  };

  const removeFromCart = (productId: string, size: string, variant?: any) => {
    setCart(prev => prev.filter(itm => !(
      itm.product.id === productId && 
      itm.selectedSize === size &&
      itm.selectedVariant?.color === variant?.color &&
      itm.selectedVariant?.design === variant?.design
    )));
  };

  // --- Purchase Calculations ---
  const cartSubtotal = cart.reduce((sum, itm) => {
    const itemPrice = itm.selectedVariant 
      ? (itm.selectedVariant.sellingPrice || itm.selectedVariant.price || itm.product.price)
      : (itm.product.sellingPrice || itm.product.price);
    return sum + (itemPrice * itm.quantity);
  }, 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = cartSubtotal * (appliedCoupon.value / 100);
    } else {
      discountAmount = Math.min(cartSubtotal, appliedCoupon.value);
    }
  }

  const freeShippingMin = paymentPublicConfig.freeShippingThreshold ?? 2999;
  const isFreeDelivery = cartSubtotal >= freeShippingMin || cartSubtotal === 0;
  const shippingCost = isFreeDelivery
    ? 0
    : (paymentOption === "cod"
        ? (paymentPublicConfig.codDeliveryCost ?? 200)
        : (paymentPublicConfig.prepaidDeliveryCost ?? 0));
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  // Validate Promocodes
  const handleValidateCoupon = async () => {
    setCouponError("");
    setCouponSuccess("");
    if (!couponCode.trim()) return;

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Promo verification issue.");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data.coupon);
        setCouponSuccess(`Promocode Applied: ${data.coupon.description}`);
      }
    } catch (e) {
      setCouponError("Communication fault validating coupon.");
    }
  };

  // --- Submit Order Transaction ---
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmittingOrder(true);

    if (shippingForm.payMethod === "UPI") {
      const initiatePayload = {
        customerName: shippingForm.name,
        customerEmail: shippingForm.email,
        shippingAddress: {
          street: shippingForm.street,
          city: shippingForm.city,
          state: shippingForm.state,
          zip: shippingForm.zip
        },
        items: cart.map(itm => ({
          productId: itm.product.id,
          name: itm.selectedVariant 
            ? `${itm.product.name} (${itm.selectedVariant.color} - ${itm.selectedVariant.design})` 
            : itm.product.name,
          price: itm.selectedVariant 
            ? (itm.selectedVariant.sellingPrice || itm.selectedVariant.price || itm.product.price)
            : (itm.product.sellingPrice || itm.product.price),
          quantity: itm.quantity,
          size: itm.selectedSize,
          color: itm.selectedVariant?.color || itm.product.colors?.[0] || "Neutral"
        })),
        couponCode: appliedCoupon?.code,
        paymentOption
      };

      try {
        const res = await fetch("/api/checkout/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(initiatePayload)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setUpiStatus("pending");
          setActiveUpiPayment({
            orderId: data.orderId,
            upiUrl: data.upiUrl,
            qrCode: data.qrCode,
            amountUSD: data.amountUSD,
            amountINR: data.amountINR,
          });
        } else {
          alert(data.error || "Failed to initiate direct UPI transaction. Please check admin panel credentials.");
        }
      } catch (err) {
        console.error("Direct UPI negotiation lost", err);
        alert("The direct direct UPI gateway communication tower is currently unresponsive.");
      } finally {
        setIsSubmittingOrder(false);
      }
      return;
    }

    const orderPayload = {
      customerName: shippingForm.name,
      customerEmail: shippingForm.email,
      shippingAddress: {
        street: shippingForm.street,
        city: shippingForm.city,
        state: shippingForm.state,
        zip: shippingForm.zip
      },
      items: cart.map(itm => ({
        productId: itm.product.id,
        name: itm.selectedVariant 
          ? `${itm.product.name} (${itm.selectedVariant.color} - ${itm.selectedVariant.design})` 
          : itm.product.name,
        price: itm.selectedVariant 
          ? (itm.selectedVariant.sellingPrice || itm.selectedVariant.price || itm.product.price)
          : (itm.product.sellingPrice || itm.product.price),
        quantity: itm.quantity,
        size: itm.selectedSize,
        color: itm.selectedVariant?.color || itm.product.colors?.[0] || "Neutral"
      })),
      subtotal: cartSubtotal,
      discount: discountAmount,
      total: cartTotal,
      paymentMethod: shippingForm.payMethod,
      userId: currentUser?.id || "guest",
      paymentOption,
      advancePaid: paymentOption === "cod" ? 200 : cartTotal,
      remainingAmount: paymentOption === "cod" ? Math.max(0, cartTotal - 200) : 0
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (res.ok) {
        setOrderSuccess(data);
        setCart([]); // Clear shopping basket
        setAppliedCoupon(null);
        setCouponCode("");

        // Also save order receipt locally to survive scale-down cold-starts
        try {
          const localOrdersStr = localStorage.getItem("tirupati_merchandise_custom_orders");
          const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];
          localOrders.push(data);
          localStorage.setItem("tirupati_merchandise_custom_orders", JSON.stringify(localOrders));
        } catch (e) {
          console.error("Local order backup failed", e);
        }

        fetchProducts();
        fetchOrders();
      } else {
        alert(data.error || "Could not finalize reservation.");
      }
    } catch (err) {
      console.error(err);
      alert("Lost connectivity with the registration tower. Please check your path.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // --- Targeted UPI Deep Link Handler (Requirement 2) ---
  const handleUpiAppClick = async (appType: 'gpay' | 'phonepe' | 'paytm' | 'other') => {
    if (!activeUpiPayment) return;
    try {
      const res = await fetch("/api/generate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: activeUpiPayment.amountINR,
          orderId: activeUpiPayment.orderId
        })
      });
      if (!res.ok) {
        throw new Error("Failed to generate custom UPI intent deep link.");
      }
      const data = await res.json();
      let finalUrl = data.upiUrl;

      // Replace protocol to target specific app directly to improve conversion
      if (appType === 'gpay') {
        // Google Pay deep link format: tez://upi/pay?pa=...
        finalUrl = finalUrl.replace("upi://pay", "tez://upi/pay");
      } else if (appType === 'phonepe') {
        // PhonePe deep link format: phonepe://pay?pa=...
        finalUrl = finalUrl.replace("upi://pay", "phonepe://pay");
      } else if (appType === 'paytm') {
        // Paytm deep link format: paytmmp://pay?pa=...
        finalUrl = finalUrl.replace("upi://pay", "paytmmp://pay");
      }
      // 'other' retains the standard upi:// protocol

      console.log(`Redirecting to ${appType} via URL:`, finalUrl);

      // Trigger the link to open on user's device
      // We use both location.href and a fall-back anchor click to bypass potential iframe sandbox restrictions
      try {
        window.location.href = finalUrl;
      } catch (e) {
        console.error("Failed standard redirect via location.href, trying fallbacks", e);
      }

      try {
        const link = document.createElement("a");
        link.href = finalUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Fallback anchor click failed", err);
      }

      // Immediately show the manual UTR verification confirmation step (Requirement 3)
      setShowUtrStep(true);
    } catch (err: any) {
      console.error("UPI Intent link generation error:", err);
      alert(err.message || "Failed to launch targeted UPI app. Please use standard QR scanning.");
    }
  };

  // --- Post-Payment Manual UTR Verification Handler (Requirement 3) ---
  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUtrError(null);
    if (!activeUpiPayment) return;

    const trimmed = utrInput.trim();
    if (!/^\d{12}$/.test(trimmed)) {
      setUtrError("Please enter a valid 12-digit numeric UTR reference number.");
      return;
    }

    setUtrSubmitting(true);
    try {
      const res = await fetch("/api/submit-utr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: activeUpiPayment.orderId,
          utr: trimmed
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUtrSuccess(true);
        // Emulate successful checkout finalization after a short success display
        setTimeout(() => {
          const confirmedOrder = {
            id: activeUpiPayment.orderId,
            trackingNumber: `TRK-WND-UTR-${Math.floor(10000 + Math.random() * 89999)}`,
            customerEmail: shippingForm.email,
            total: activeUpiPayment.amountUSD,
          };

          setOrderSuccess(confirmedOrder as any);
          setCart([]); // Clear cart
          setAppliedCoupon(null);
          setCouponCode("");

          try {
            const localOrdersStr = localStorage.getItem("tirupati_merchandise_custom_orders");
            const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];
            localOrders.push(confirmedOrder);
            localStorage.setItem("tirupati_merchandise_custom_orders", JSON.stringify(localOrders));
          } catch (e) {
            console.error("Local order backup failed", e);
          }

          // Refresh states
          fetchProducts();
          fetchOrders();

          // Reset all UPI/UTR checkout workflow variables
          setActiveUpiPayment(null);
          setShowUtrStep(false);
          setUtrInput("");
          setUtrError(null);
          setUtrSuccess(false);
        }, 3000);
      } else {
        setUtrError(data.error || "Failed to submit transaction reference. Please try again.");
      }
    } catch (err: any) {
      console.error("UTR submission error:", err);
      setUtrError("Network connectivity error while submitting UTR number. Please try again.");
    } finally {
      setUtrSubmitting(false);
    }
  };

  // --- Admin CRUD Actions ---
  const handleAddOrEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError("");

    if (!newProductForm.name || !newProductForm.price || !newProductForm.category) {
      setProductFormError("Missing basic metrics: Title, price and category are required.");
      return;
    }

    const priceVal = parseFloat(newProductForm.price);
    if (isNaN(priceVal) || priceVal <= 0) {
      setProductFormError("Please enter a valid positive numeric price.");
      return;
    }

    const nonBlankImages = newProductForm.images.map(img => img.trim()).filter(img => img !== "");
    const payload = {
      name: newProductForm.name,
      price: priceVal,
      description: newProductForm.description,
      category: newProductForm.category,
      images: nonBlankImages.length > 0 ? nonBlankImages : ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80"],
      stock: parseInt(newProductForm.stock) || 10,
      colors: [newProductForm.color],
      sizes: newProductForm.sizes.split(",").map(s => s.trim()).filter(s => s !== ""),
      tags: newProductForm.tags.split(",").map(t => t.trim().toLowerCase()).filter(t => t !== ""),
      featured: newProductForm.featured,
      inspiration: newProductForm.inspiration || "Inspired by quiet moments traveling."
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedProduct = await res.json();
        // Direct write to Firestore for instant real-time sync across connected clients
        saveProductToFirestore(savedProduct).catch(err => console.warn("Firestore direct write notice:", err));

        setIsAddProductOpen(false);
        setEditingProduct(null);
        // Reset form details
        setNewProductForm({
          name: "",
          price: "",
          description: "",
          category: "T-Shirts",
          images: ["", ""],
          stock: "15",
          color: "Forest Green",
          sizes: "S, M, L, XL",
          tags: "mountain, minimalist",
          featured: false,
          inspiration: ""
        });
        fetchProducts();
      } else {
        const errData = await res.json();
        setProductFormError(errData.error || "Process rejected by server verification.");
      }
    } catch (e) {
      setProductFormError("Lost path to inventory systems. Please retry.");
    }
  };

  const handleEditInit = (prod: Product) => {
    setEditingProduct(prod);
    setNewProductForm({
      name: prod.name,
      price: prod.price.toString(),
      description: prod.description,
      category: prod.category,
      images: prod.images && prod.images.length > 0 ? [...prod.images] : ["", ""],
      stock: prod.stock.toString(),
      color: prod.colors?.[0] || "Regular Tone",
      sizes: (prod.sizes || []).join(", "),
      tags: (prod.tags || []).join(", "),
      featured: prod.featured || false,
      inspiration: prod.inspiration || ""
    });
    setIsAddProductOpen(true);
  };

  const handleDeleteProductClick = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        // Direct write to delete product document from Firestore
        deleteProductFromFirestore(productToDelete.id).catch(err => console.warn("Firestore delete notice:", err));

        fetchProducts();
        setProductToDelete(null);
      } else {
        alert("Failed to retire apparel design.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- Admin Order Status Control ---
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Direct write update order in Firestore
        saveOrderToFirestore({ id: orderId, status }).catch(err => console.warn("Firestore order update notice:", err));

        try {
          const localStatusStr = localStorage.getItem("tirupati_merchandise_updated_order_status");
          const localStatus = localStatusStr ? JSON.parse(localStatusStr) : {};
          localStatus[orderId] = status;
          localStorage.setItem("tirupati_merchandise_updated_order_status", JSON.stringify(localStatus));
        } catch (e) {
          console.error("Local order status update backup failed", e);
        }
        fetchOrders();
      } else {
        alert("Unable to transition order status.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- Gemini Intelligence report generator ---
  const handleGenerateAIInsights = async () => {
    setIsGeneratingInsights(true);
    setMerchantAIReport("");
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      });
      const data = res.ok && res.headers.get("content-type")?.includes("application/json") 
        ? await res.json() 
        : { text: "Error syncing with Gemini intelligence clusters." };
      setMerchantAIReport(data.text);
    } catch (e) {
      setMerchantAIReport("Communication with stellar advisor nodes faded. Secure keys and try again.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // --- Filtering calculation ---
  const filteredProducts = products.filter(p => {
    // Basic search match
    const matchesSearch = !searchQuery ? true : (
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.inspiration || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (!matchesSearch) return false;

    // Apply active URL params filters if any exist
    if (apiCategory && (p.category || "").toLowerCase() !== apiCategory.toLowerCase()) {
      return false;
    }

    if (apiColor) {
      const selectedColors = apiColor.toLowerCase().split(",").filter(Boolean);
      const pColors = (p.colors || [p.color || p.Colour || ""]).filter(Boolean).map((c: string) => c.toLowerCase());
      const hasMatch = pColors.some((pc: string) => 
        selectedColors.some((sc: string) => pc.includes(sc) || sc.includes(pc))
      );
      if (!hasMatch) return false;
    }

    if (apiSize) {
      const selectedSizes = apiSize.toLowerCase().split(",").filter(Boolean);
      const pSizes = (p.sizes || []).map((s: string) => s.toLowerCase());
      const hasMatch = pSizes.some((ps: string) => selectedSizes.includes(ps));
      if (!hasMatch) return false;
    }

    if (apiTags) {
      const selectedTags = apiTags.toLowerCase().split(",").filter(Boolean);
      const pTags = (p.tags || []).map((t: string) => t.toLowerCase());
      const hasMatch = pTags.some((pt: string) => selectedTags.includes(pt));
      if (!hasMatch) return false;
    }

    if (apiMinPrice) {
      const minP = parseFloat(apiMinPrice);
      if (!isNaN(minP) && p.price < minP) return false;
    }

    if (apiMaxPrice) {
      const maxP = parseFloat(apiMaxPrice);
      if (!isNaN(maxP) && p.price > maxP) return false;
    }

    if (apiGender) {
      const genStr = apiGender.toLowerCase();
      if (genStr === "men") {
        const isMen = (p.category || "").toLowerCase().includes("men") || 
                      (p.tags || []).includes("men") || 
                      (p.category || "").toLowerCase() === "loomed shirts" || 
                      (p.category || "").toLowerCase() === "loomed pants" ||
                      p.genderPreference === "Men" || p.genderPreference === "Unisex";
        if (!isMen) return false;
      } else if (genStr === "women") {
        const isWomen = (p.category || "").toLowerCase().includes("women") || 
                        (p.tags || []).includes("women") ||
                        p.genderPreference === "Women" || p.genderPreference === "Unisex";
        if (!isWomen) return false;
      }
    }

    // Apply redesigned master filters
    switch (selectedMainFilter) {
      case "ALL":
        return true;
      case "COMBO":
      case "APPAREL":
        return (p.category || "").toLowerCase().includes("combo") || 
               (p.category || "").toLowerCase().includes("co-ord") || 
               (p.name || "").toLowerCase().includes("combo") ||
               !(p.category || "").toLowerCase().includes("footwear") && !(p.category || "").toLowerCase().includes("accessory");
      case "SHOES":
      case "FOOTWEAR":
        return (p.category || "").toLowerCase().includes("footwear") || 
               (p.category || "").toLowerCase().includes("shoe") ||
               (p.category || "").toLowerCase().includes("sneaker") ||
               (p.tags || []).some((t: string) => t.toLowerCase() === "footwear" || t.toLowerCase() === "sneakers" || t.toLowerCase() === "shoes");
      case "ACCESSORIES":
        return (p.category || "").toLowerCase().includes("accessory") || (p.tags || []).includes("accessories");
      case "COLLECTIONS":
        return p.featured === true || (p.tags || []).includes("featured") || (p.tags || []).includes("archival");
      case "TOPS":
        return (p.category || "").toLowerCase().includes("shirt") || (p.category || "").toLowerCase().includes("sweater") || (p.category || "").toLowerCase().includes("robe") || (p.tags || []).includes("tops");
      case "BOTTOMS":
        return (p.category || "").toLowerCase().includes("pant") || (p.category || "").toLowerCase().includes("trouser") || (p.tags || []).includes("bottoms");
      case "OUTERWEAR":
        return (p.category || "").toLowerCase().includes("coat") || (p.category || "").toLowerCase().includes("overcoat") || (p.category || "").toLowerCase().includes("robe") || (p.tags || []).includes("outerwear");
      case "LINEN":
        return (p.name || "").toLowerCase().includes("linen") || (p.description || "").toLowerCase().includes("linen") || (p.tags || []).includes("linen");
      case "ORGANIC COTTON":
        return (p.name || "").toLowerCase().includes("cotton") || (p.description || "").toLowerCase().includes("cotton") || (p.tags || []).includes("cotton");
      case "UNDER ₹5K":
        return p.price <= 5000;
      case "UNDER ₹9K":
        return p.price <= 9000;
      default:
        return true;
    }
  });

  const sortedAndFilteredProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price-low-high") {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-high-low") {
      return list.sort((a, b) => b.price - a.price);
    }
    // Catalog sequence configured by admin:
    return list.sort((a, b) => {
      const orderA = typeof a.displayOrder === "number" ? a.displayOrder : (typeof a.sortOrder === "number" ? a.sortOrder : 999999);
      const orderB = typeof b.displayOrder === "number" ? b.displayOrder : (typeof b.sortOrder === "number" ? b.sortOrder : 999999);
      return orderA - orderB;
    });
  }, [filteredProducts, sortBy]);

  const uniqueTagsList = ["organic", "handloom", "minimal", "botanical", "unstructured"];
  const uniqueCategoriesList = ["Loomed Shirts", "Loomed Pants", "Artisan Robes", "Artisan Coats", "Men's T-Shirts", "Women's T-Shirts", "Shirt & Pant Combo", "LOOMED CO-ORD SETS", "SHIRT & TROUSER COMBO"];

  // Dynamic header height measurement to ensure main content / hero image top is never covered or cut off
  useEffect(() => {
    const headerEl = document.getElementById("brand-header");
    if (!headerEl) return;

    const measureAndSetHeaderHeight = () => {
      const rect = headerEl.getBoundingClientRect();
      const height = rect.height;
      if (height > 0) {
        document.documentElement.style.setProperty("--header-height", `${Math.round(height)}px`);
      }
    };

    measureAndSetHeaderHeight();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        measureAndSetHeaderHeight();
      });
      ro.observe(headerEl);
    }

    window.addEventListener("resize", measureAndSetHeaderHeight);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", measureAndSetHeaderHeight);
    };
  }, []);

  const isTransparent = false;

  const displayImages = selectedProduct
    ? (selectedComboIdx !== null && selectedProduct.combos?.[selectedComboIdx]?.images && selectedProduct.combos[selectedComboIdx].images.length > 0
        ? selectedProduct.combos[selectedComboIdx].images
        : (activeVariant && activeVariant.images && activeVariant.images.length > 0
            ? activeVariant.images
            : (selectedProduct.images || [])))
    : [];

  const currentStock = selectedProduct
    ? (selectedComboIdx !== null
        ? 15
        : (activeVariant ? (activeVariant.stock ?? 0) : selectedProduct.stock))
    : 0;

  const currentPrice = selectedProduct
    ? (selectedComboIdx !== null && selectedProduct.combos?.[selectedComboIdx]
        ? (selectedProduct.combos[selectedComboIdx].sellingPrice || selectedProduct.combos[selectedComboIdx].price || 0)
        : (activeVariant 
            ? (activeVariant.sellingPrice || activeVariant.price || selectedProduct.sellingPrice || selectedProduct.price || 0) 
            : (selectedProduct.sellingPrice || selectedProduct.price || 0)))
    : 0;

  const currentMrp = selectedProduct
    ? (selectedComboIdx !== null && selectedProduct.combos?.[selectedComboIdx]
        ? (selectedProduct.combos[selectedComboIdx].mrp || 0)
        : (activeVariant 
            ? (activeVariant.mrp || selectedProduct.mrp || 0) 
            : (selectedProduct.mrp || 0)))
    : 0;

  const currentVariantOrCombo = selectedProduct
    ? (selectedComboIdx !== null && selectedProduct.combos?.[selectedComboIdx]
        ? {
            color: "Combo Set",
            design: "Full 2-Piece Deal",
            images: selectedProduct.combos[selectedComboIdx].images,
            price: selectedProduct.combos[selectedComboIdx].sellingPrice || selectedProduct.combos[selectedComboIdx].price,
            sellingPrice: selectedProduct.combos[selectedComboIdx].sellingPrice,
            mrp: selectedProduct.combos[selectedComboIdx].mrp,
            isCombo: true
          }
        : activeVariant)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-8 text-center font-serif text-lg text-earth/70">
        Loading collection...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1C2333] selection:bg-moss/20 selection:text-ink font-sans flex flex-col antialiased relative">
      {/* Fixed Full-Viewport Background Layer - Website Sand/Linen Palette */}
      <div 
        className="fixed inset-0 pointer-events-none z-[-10] bg-[#FAF9F5]"
      />

      {/* Scrollable Content Layer */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Styled Responsive Branding Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 flex flex-col ${
          isTransparent 
            ? "bg-gradient-to-b from-black/90 via-black/60 to-transparent border-b border-white/10 backdrop-blur-xs" 
            : "bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-md"
        }`}
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
        id="brand-header"
      >
        {/* Top promotional & announcement banners removed per user selection */}

        <div className={`max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
          isTransparent ? "py-3 sm:py-5" : "py-2 sm:py-3"
        }`}>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigateTo("store", "/")}
              className="flex items-center text-left group focus:outline-none"
              id="brand-logo"
            >
              <div>
                <span className={`block font-serif text-xl sm:text-2xl font-semibold tracking-[0.15em] uppercase transition-colors duration-300 ${
                  isTransparent ? "text-white" : "text-ink"
                }`}>TIRUPATI MERCHANDISE</span>
              </div>
            </button>
          </div>

          {/* Primary Global Navigation with Footwear Mega Menu */}
          <div className="hidden lg:block mx-4">
            <GlobalNavigation
              onSelectCategory={handleGlobalCategorySelect}
              activeCategory={selectedMainFilter}
              isTransparent={isTransparent}
              onSelectProduct={(p) => {
                handleOpenProductDetails(p);
              }}
              featuredFootwear={featuredFootwear}
            />
          </div>

          {/* Predictive Search Bar */}
          <div className="hidden md:block flex-1 max-w-xs xl:max-w-md mx-6">
            <PredictiveSearchBar
              products={products}
              value={searchQuery}
              onSelectProduct={(p) => {
                handleOpenProductDetails(p);
              }}
              onSearchSubmit={(q) => {
                setSearchQuery(q);
                setActiveTab("store");
              }}
              isTransparent={isTransparent}
            />
          </div>

          {/* User Context & Bag Badges */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Search Icon Trigger */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className={`p-2.5 rounded-full transition-all duration-300 shadow-xs hover:shadow-sm border cursor-pointer md:hidden ${
                isTransparent
                  ? "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40"
                  : "bg-sand/30 text-[#1C2333] border-terrain/30 hover:bg-moss/10 hover:border-moss/40 hover:text-moss"
              }`}
              id="header-mobile-search-btn"
              title="Search Garments"
              aria-label="Search garments"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            <div className="hidden sm:block text-right">
              <span className={`block text-[9px] font-mono uppercase tracking-wider transition-colors duration-300 ${
                isTransparent ? "text-white/50" : "text-earth/50"
              }`}>Profile</span>
              <button 
                onClick={() => currentUser ? handleLogout() : openAuthModal("login")} 
                className={`text-xs font-medium pt-0.5 block hover:underline transition-colors duration-300 ${
                  isTransparent ? "text-white" : "text-moss"
                }`}
                id="header-auth-trigger"
              >
                {currentUser ? `Sign Out (${currentUser.name.split(" ")[0]})` : "Connect Account"}
              </button>
            </div>
            <button
              onClick={() => currentUser ? navigateTo("account", "/account") : openAuthModal("login")}
              className={`hidden sm:flex p-2 sm:p-2.5 rounded-full transition-all duration-300 shadow-xs hover:shadow-sm border cursor-pointer ${
                isTransparent
                  ? "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40"
                  : "bg-sand/30 text-[#1C2333] border-terrain/30 hover:bg-moss/10 hover:border-moss/40 hover:text-moss"
              }`}
              title="Profile"
              aria-label="Profile"
            >
              <UserIcon className="w-4.5 h-4.5 text-moss" />
            </button>

            {(currentUser?.role === "admin" || (currentUser?.email && (currentUser.email.toLowerCase().trim() === "admin@tirupatimerchandise.com" || currentUser.email.toLowerCase().trim() === "admin@tirupatimerchandise.com"))) && (
              <button
                onClick={() => setActiveTab("merchant")}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs font-bold transition cursor-pointer shadow-xs ${
                  activeTab === "merchant"
                    ? "bg-amber-600 text-white"
                    : isTransparent
                    ? "bg-amber-500/20 text-amber-200 border border-amber-400/40 hover:bg-amber-500/30"
                    : "bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200"
                }`}
                title="Admin Dashboard"
                id="header-admin-panel-btn"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin Panel</span>
              </button>
            )}

            <button
              onClick={() => handleOpenCheckout()}
              className={`relative p-2.5 sm:p-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md ${
                isTransparent
                  ? "bg-white/10 text-white border border-white/20 hover:border-white/50"
                  : "bg-linen text-ink border border-terrain hover:border-earth"
              }`}
              id="header-bag-btn"
            >
              <ShoppingBag className="w-4.5 h-4.5 transition-colors duration-300" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-moss text-linen text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold tracking-tight">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
            

            {/* Universal Hamburger Navigation Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2.5 sm:p-2.5 rounded-full focus:outline-none transition-colors duration-300 cursor-pointer flex items-center gap-2 border ${
                isTransparent 
                  ? "border-white/30 text-white hover:bg-white/10" 
                  : "border-[#1C2333]/20 text-[#1C2333] hover:bg-[#1C2333]/5"
              }`}
              id="mobile-menu-toggle"
              aria-label="Toggle menu"
            >
              <span className="hidden md:inline font-mono text-[10px] uppercase font-bold tracking-widest pl-1">MENU</span>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar Pop-Up Modal */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <>
            {/* Dark Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSearchOpen(false)}
              className="fixed inset-0 z-[249] bg-black/60 backdrop-blur-xs transition-opacity"
            />

            {/* Pop-Up Search Card */}
            <motion.div
              initial={{ opacity: 0, y: -25, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.98 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-12 sm:top-16 inset-x-3 sm:inset-x-6 z-[250] max-w-lg mx-auto bg-[#FAF9F5] shadow-2xl border border-[#1C2333]/20 rounded-2xl p-4 sm:p-5 text-[#1C2333]"
              id="mobile-search-popup"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1C2333]/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-moss/10 flex items-center justify-center text-moss">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-widest font-bold text-[#1C2333]">
                    Search Garments
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-1.5 text-[#1C2333]/60 hover:text-[#1C2333] rounded-full hover:bg-[#1C2333]/10 transition cursor-pointer"
                  aria-label="Close search popup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Predictive Search Bar with AutoFocus */}
              <PredictiveSearchBar
                products={products}
                value={searchQuery}
                autoFocus={true}
                onSelectProduct={(p) => {
                  handleOpenProductDetails(p);
                  setIsMobileSearchOpen(false);
                }}
                onSearchSubmit={(q) => {
                  setSearchQuery(q);
                  setActiveTab("store");
                  if (q) setIsMobileSearchOpen(false);
                }}
                isTransparent={false}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full-Screen / Side-Drawer Hamburger Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dark Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[199] bg-black/50 backdrop-blur-xs transition-opacity"
            />

            {/* Side Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[200] w-full max-w-sm sm:max-w-md bg-[#FAF9F5] shadow-2xl border-l border-[#1C2333]/15 flex flex-col justify-between p-6 sm:p-8 text-[#1C2333] overflow-y-auto"
              id="mobile-nav-panel-fullscreen"
            >
              {/* Drawer Top Bar */}
              <div className="flex items-center justify-between border-b border-[#1C2333]/10 pb-4">
                <div>
                  <span className="font-serif text-2xl font-bold tracking-[0.15em] text-[#1C2333] uppercase block">TIRUPATI MERCHANDISE</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-[#1C2333]/60 hover:text-[#1C2333] rounded-full hover:bg-[#1C2333]/10 transition focus:outline-none cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links inside Drawer */}
              <div className="py-6 space-y-2 flex-1">
                <span className="block text-[10px] font-mono text-[#1C2333]/50 uppercase tracking-widest font-bold mb-3">
                  NAVIGATION MENU
                </span>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigateTo("store", "/");
                  }}
                  className={`w-full text-left py-3 px-4 rounded-sm flex items-center justify-between font-serif text-lg font-semibold tracking-wide transition cursor-pointer ${
                    activeTab === "store"
                      ? "bg-[#1C2333] text-white"
                      : "hover:bg-[#1C2333]/5 text-[#1C2333]"
                  }`}
                >
                  <span>Collections & Catalog</span>
                  <span className="font-mono text-xs opacity-60">→</span>
                </button>

                {/* Admin Panel Link in Hamburger Menu */}
                {(currentUser?.role === "admin" || (currentUser?.email && (currentUser.email.toLowerCase().trim() === "admin@tirupatimerchandise.com" || currentUser.email.toLowerCase().trim() === "admin@tirupatimerchandise.com"))) && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setActiveTab("merchant");
                    }}
                    className={`w-full text-left py-3 px-4 rounded-xl flex items-center justify-between font-serif text-lg font-semibold tracking-wide transition cursor-pointer border ${
                      activeTab === "merchant"
                        ? "bg-[#1C2333] text-white border-[#1C2333]"
                        : "bg-amber-500/10 text-amber-950 border-amber-400/60 hover:bg-amber-500/20 shadow-xs"
                    }`}
                    id="hamburger-admin-panel-btn"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>Admin Panel</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase font-bold bg-amber-600 text-white px-2 py-0.5 rounded tracking-wider shadow-2xs">
                      ADMIN
                    </span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleOpenWishlist();
                  }}
                  className={`w-full text-left py-3 px-4 rounded-sm flex items-center justify-between font-serif text-lg font-semibold tracking-wide transition cursor-pointer ${
                    activeTab === "wishlist"
                      ? "bg-[#1C2333] text-white"
                      : "hover:bg-[#1C2333]/5 text-[#1C2333]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 fill-current" />
                    <span>Saved Wishlist</span>
                  </div>
                  {wishlist.length > 0 && (
                    <span className="font-mono text-xs bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                      {wishlist.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsOrdersModalOpen(true);
                  }}
                  className="w-full text-left py-3 px-4 rounded-sm flex items-center justify-between font-serif text-lg font-semibold tracking-wide hover:bg-[#1C2333]/5 text-[#1C2333] transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    <span>My Orders</span>
                  </div>
                  <span className="font-mono text-xs opacity-60">→</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveTab("account");
                  }}
                  className={`w-full text-left py-3 px-4 rounded-sm flex items-center justify-between font-serif text-lg font-semibold tracking-wide transition cursor-pointer ${
                    activeTab === "account"
                      ? "bg-[#1C2333] text-white"
                      : "hover:bg-[#1C2333]/5 text-[#1C2333]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span>Profile</span>
                  </div>
                  <span className="font-mono text-xs opacity-60">→</span>
                </button>
              </div>

              {/* Drawer Footer Account Controls */}
              <div className="pt-4 border-t border-[#1C2333]/10 space-y-3">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (currentUser) {
                      handleLogout();
                    } else {
                      openAuthModal("login");
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-[#1C2333] text-white font-mono text-xs uppercase tracking-widest font-bold rounded-xs cursor-pointer hover:bg-[#1C2333]/90 transition"
                >
                  {currentUser ? `SIGN OUT (${currentUser.name})` : "SIGN IN / REGISTER"}
                </button>

                <p className="text-[10px] text-center font-mono text-[#1C2333]/50 uppercase tracking-wider">
                  TIRUPATI MERCHANDISE • HANDLOOM CERTIFIED ORGANIC APPAREL
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Primary Layout Segment */}
      <main className="flex-1" style={{ paddingTop: "var(--header-height, 68px)" }}>

        {/* VIEW: MEN'S COLLECTION */}
        {activeTab === "men" && (
          <MensTshirtCollection
            products={products}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            wishlist={wishlist}
            setSelectedProduct={handleOpenProductDetails}
            setActiveImgIdx={setActiveImgIdx}
            setIsCheckoutOpen={setIsCheckoutOpen}
            capsuleItems={capsuleItems}
            toggleCapsuleItem={toggleCapsuleItem}
            onBackToStore={() => navigateTo("store", "/")}
          />
        )}

        {/* VIEW: WOMEN'S COLLECTION */}
        {activeTab === "women" && (
          <WomensTshirtCollection
            products={products}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            wishlist={wishlist}
            setSelectedProduct={handleOpenProductDetails}
            setActiveImgIdx={setActiveImgIdx}
            setIsCheckoutOpen={setIsCheckoutOpen}
            capsuleItems={capsuleItems}
            toggleCapsuleItem={toggleCapsuleItem}
            onBackToStore={() => navigateTo("store", "/")}
          />
        )}
        
        {/* VIEW 1: STOREFRONT */}
        {activeTab === "store" && (
          <div className="space-y-0 bg-transparent relative">
            {selectedProduct ? (
              /* DEDICATED PRODUCT PAGE VIEW */
              <div className="min-h-screen bg-[#F5F0E8] pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#1C2333] font-sans">
                {/* Breadcrumbs & Navigation Back Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C2333]/15 pb-6 mb-8 sm:mb-12">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-earth/70">
                    <button 
                      onClick={() => handleOpenProductDetails(null)}
                      className="hover:text-ink transition cursor-pointer"
                    >
                      Collections
                    </button>
                    {selectedProduct.breadcrumbs && selectedProduct.breadcrumbs.length > 0 ? (
                      selectedProduct.breadcrumbs.map((crumb, cIdx) => (
                        <React.Fragment key={cIdx}>
                          <span className="text-earth/30">/</span>
                          <span className={`${cIdx === selectedProduct.breadcrumbs!.length - 1 ? "text-ink font-bold" : "text-earth/50"}`}>
                            {crumb}
                          </span>
                        </React.Fragment>
                      ))
                    ) : (
                      <>
                        <span className="text-earth/30">/</span>
                        <span className="text-earth/50">{selectedProduct.category}</span>
                        <span className="text-earth/30">/</span>
                        <span className="text-ink font-bold">{activeVariant ? activeVariant.color : selectedProduct.name}</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenProductDetails(null)}
                    className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-earth hover:text-ink transition-all duration-300 self-start sm:self-auto cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Collections</span>
                  </button>
                </div>

                {/* Product Section Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                  
                  {/* Left Side: Images Gallery (7 Columns on lg) */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Main image / video container with touch handlers for swipe */}
                    <div 
                      className="aspect-[3/4] bg-[#EAE5DC]/30 border border-[#1C2333]/15 rounded-sm relative overflow-hidden group select-none touch-pan-y"
                      onTouchStart={handlePdpTouchStart}
                      onTouchMove={handlePdpTouchMove}
                      onTouchEnd={handlePdpTouchEnd}
                    >
                      {detectedVideos[displayImages?.[activeImgIdx] || displayImages?.[0] || ""] ? (
                        <video
                          src={getDirectVideoUrl(displayImages?.[activeImgIdx] || displayImages?.[0] || "")}
                          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.98]"
                          controls
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={getDirectImageUrl(displayImages?.[activeImgIdx] || displayImages?.[0]) || null}
                          alt={selectedProduct.name}
                          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.98] transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="absolute inset-0 bg-ink/5 mix-blend-multiply pointer-events-none" />

                      {/* Navigation arrows overlay */}
                      {displayImages && displayImages.length > 1 && (
                        <>
                          <button
                            onClick={() => {
                              setActiveImgIdx((prev) => (prev - 1 + displayImages.length) % displayImages.length);
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-linen/90 border border-[#1C2333]/15 hover:bg-moss hover:text-linen transition text-ink rounded-full shadow-md z-10 cursor-pointer"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setActiveImgIdx((prev) => (prev + 1) % displayImages.length);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-linen/90 border border-[#1C2333]/15 hover:bg-moss hover:text-linen transition text-ink rounded-full shadow-md z-10 cursor-pointer"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Floating Indicator */}
                      {displayImages && displayImages.length > 1 && (
                        <span className="absolute bottom-4 right-4 bg-ink/75 text-linen px-2.5 py-1 text-[10px] font-mono tracking-widest rounded-full uppercase">
                          {activeImgIdx + 1} / {displayImages.length}
                        </span>
                      )}
                    </div>

                    {/* Thumbnail Selector list */}
                    {displayImages && displayImages.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto pb-2 justify-start scrollbar-thin">
                        {displayImages.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImgIdx(i)}
                            className={`w-20 h-24 rounded-sm border overflow-hidden transition relative flex-shrink-0 bg-dust ${
                              activeImgIdx === i ? "border-moss border-2 scale-102" : "border-[#1C2333]/15 hover:border-moss hover:scale-102"
                            }`}
                          >
                            <img src={getDirectImageUrl(img) || null} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            {detectedVideos[img] && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/45 z-10 text-white">
                                <Play className="w-4 h-4 fill-white text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Variant & Combo Thumbnail Selector Grid/Row */}
                    {((selectedProduct.variants && selectedProduct.variants.length > 0) || (selectedProduct.combos && selectedProduct.combos.length > 0)) && (
                      <div className="space-y-3 pt-4 border-t border-[#1C2333]/10" id="pdp-variants-gallery">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-earth/60 tracking-wider font-bold">
                            Select Variation (Color / Design):
                          </span>
                          {selectedComboIdx !== null ? (
                            <span className="text-[10px] font-mono text-red-600 font-bold uppercase bg-red-50 px-2.5 py-0.5 rounded-sm border border-red-200/50 animate-pulse">
                              Combo Set {selectedProduct.combos!.length > 1 ? `#${selectedComboIdx + 1}` : ""} Active
                            </span>
                          ) : activeVariant ? (
                            <span className="text-[10px] font-mono text-moss font-semibold uppercase bg-moss/5 px-2 py-0.5 rounded-sm border border-moss/10">
                              {activeVariant.color}{activeVariant.design ? ` / ${activeVariant.design}` : ""}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {/* Render individual color/design variants */}
                          {selectedProduct.variants && selectedProduct.variants.map((variant: any, idx: number) => {
                            const isSelected = selectedComboIdx === null && activeVariant && activeVariant.color === variant.color && (!variant.design || activeVariant.design === variant.design);
                            const variantImg = (variant.images && variant.images.length > 0) ? variant.images[0] : (selectedProduct.images?.[0] || "");
                            
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setActiveVariant(variant);
                                  setSelectedComboIdx(null);
                                  setActiveImgIdx(0);
                                }}
                                className={`w-16 h-20 rounded-sm border overflow-hidden transition relative flex-shrink-0 bg-dust cursor-pointer ${
                                  isSelected 
                                    ? "border-[#1C2333] border-2 scale-105 shadow-md" 
                                    : "border-[#1C2333]/15 hover:border-moss/50 hover:scale-102"
                                  }`}
                                title={variant.design ? `${variant.color} - ${variant.design}` : variant.color}
                              >
                                <img 
                                  src={getDirectImageUrl(variantImg) || null} 
                                  alt={variant.design ? `${variant.color} - ${variant.design}` : variant.color} 
                                  className="w-full h-full object-cover filter brightness-[0.98]" 
                                  referrerPolicy="no-referrer" 
                                />
                                {variant.stock <= 0 && (
                                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                    <div className="text-[8px] font-mono font-bold text-red-600 bg-white/95 px-1 py-0.5 rounded-xs uppercase tracking-tighter">
                                      OOS
                                    </div>
                                  </div>
                                )}
                                {isSelected && (
                                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                    <div className="absolute bottom-1 right-1 bg-[#1C2333] text-linen rounded-full p-0.5 shadow">
                                      <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </button>
                            );
                          })}

                          {/* Render special bundled combos as premium selectable variant thumbnails */}
                          {selectedProduct.combos && selectedProduct.combos.map((combo: any, comboIdx: number) => {
                            const isSelected = selectedComboIdx === comboIdx;
                            const comboImg = combo.images?.[0] || selectedProduct.images?.[0] || "";
                            
                            return (
                              <button
                                key={`combo-${comboIdx}`}
                                type="button"
                                onClick={() => {
                                  setSelectedComboIdx(comboIdx);
                                  setActiveVariant(null);
                                  setActiveImgIdx(0);
                                }}
                                className={`w-16 h-20 rounded-sm border overflow-hidden transition relative flex-shrink-0 bg-dust cursor-pointer ${
                                  isSelected 
                                    ? "border-red-600 border-2 scale-105 shadow-md ring-2 ring-red-600/10" 
                                    : "border-red-200 hover:border-red-400 hover:scale-102"
                                  }`}
                                title={`Combo Deal Set - Matching 2-Piece Deal`}
                              >
                                <img 
                                  src={getDirectImageUrl(comboImg) || null} 
                                  alt={`Combo Deal Set`} 
                                  className="w-full h-full object-cover filter brightness-[0.98]" 
                                  referrerPolicy="no-referrer" 
                                />
                                <div className="absolute top-0 right-0 bg-red-600 text-[6px] text-white font-mono uppercase px-1 py-0.5 rounded-bl-xs font-bold scale-90 origin-top-right">
                                  Deal
                                </div>
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white font-mono text-[7px] text-center py-0.5 font-semibold tracking-tighter uppercase truncate">
                                  Combo Set
                                </div>
                                {isSelected && (
                                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                                    <div className="absolute bottom-1 right-1 bg-red-600 text-linen rounded-full p-0.5 shadow">
                                      <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Product Details & Controls (5 Columns on lg) */}
                  <div className="lg:col-span-5 flex flex-col space-y-8 text-left">
                    
                    {/* Header Details */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase text-moss tracking-widest block font-bold">
                          {selectedProduct.category === "Shirt & Pant Combo" || selectedProduct.productType === "Two-Piece Set" || (selectedProduct.name || "").toLowerCase().includes("set") || (selectedProduct.name || "").toLowerCase().includes("combo") ? "LOOMED CO-ORD SETS" : (selectedProduct.merchandisingTag || selectedProduct.category)}
                        </span>
                        <span className="text-[10px] font-mono text-earth/50 uppercase tracking-widest font-semibold">
                          REF. 0{Math.floor(Math.abs(selectedProduct.id.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)) % 1000)}/{Math.floor(Math.abs(selectedProduct.id.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)) % 100)}
                        </span>
                      </div>
                      
                      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1C2333] uppercase tracking-wide leading-tight">
                        {selectedComboIdx !== null 
                          ? `${selectedProduct.name} - Coordinated Set`
                          : (selectedProduct.title || (activeVariant ? activeVariant.color : selectedProduct.name))}
                      </h2>
                      
                      {/* COMPACT RATINGS BADGE */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 bg-[#1C2333]/5 border border-[#1C2333]/10 px-2 py-0.5 rounded text-ink text-[11px] font-mono">
                          <span>
                            {(
                              pdpReviewStats[selectedProduct.id]?.ratingAvg ??
                              selectedProduct.ratingAvg ??
                              selectedProduct.rating ??
                              4.7
                            ).toFixed(1)}
                          </span>
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500 animate-pulse" />
                        </div>
                        <span className="text-xs text-earth/50 font-mono">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById("pdp-reviews-section");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="text-[11px] text-earth/60 font-mono font-medium underline uppercase tracking-wider hover:text-ink transition cursor-pointer"
                        >
                          {pdpReviewStats[selectedProduct.id]?.reviewsCount ??
                            selectedProduct.reviewsCount ??
                            163} RATINGS
                        </button>
                        <span className="text-xs text-earth/50 font-mono">|</span>
                        <span className="text-[10px] text-moss bg-moss/5 border border-moss/10 font-bold font-mono px-2 py-0.5 rounded uppercase">
                          Verified Buyers
                        </span>
                      </div>
                      
                      {/* Fit Information Label */}
                      <div className="inline-block bg-[#1C2333]/5 border border-[#1C2333]/10 px-2.5 py-1 text-[9px] font-mono text-ink uppercase tracking-widest rounded-xs">
                        {(selectedProduct.category || "").includes("Shirt") || (selectedProduct.name || "").includes("Shirt")
                          ? "REGULAR FIT"
                          : (selectedProduct.category || "").includes("Pant") || (selectedProduct.name || "").includes("Pant")
                          ? "FLOWING LOOSE FIT"
                          : "UNSTRUCTURED COMFORT FIT"}
                      </div>
                      
                      {/* UPGRADED HERO PRICING MODULE */}
                      <div className="flex flex-col gap-1.5 pt-2 border-b border-terrain/10 pb-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-3xl font-mono text-[#1C2333] font-semibold">
                            ₹{Math.round(currentPrice - pdpPromoDiscount).toLocaleString("en-IN")}
                          </span>
                          
                          {currentMrp > currentPrice && (
                            <>
                              <span className="text-lg font-mono text-earth/40 line-through">
                                ₹{Math.round(currentMrp).toLocaleString("en-IN")}
                              </span>
                              <span className="text-xs font-mono text-red-600 font-bold bg-red-50 border border-red-200/50 px-2 py-0.5 rounded-sm flex items-center gap-1">
                                <span>↓</span>
                                <span>{Math.round(((currentMrp - currentPrice) / currentMrp) * 100)}% OFF</span>
                              </span>
                            </>
                          )}
                          
                          <span className="text-[9px] font-mono bg-[#B5652F] text-white px-2 py-1 rounded-sm uppercase font-bold tracking-wider animate-pulse shrink-0">
                            🔥 Hot Deal
                          </span>
                        </div>

                        {pdpPromoDiscount > 0 && (
                          <div className="text-[10px] font-mono text-moss font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5 bg-moss/5 border border-moss/10 px-2.5 py-1.5 rounded-md w-fit">
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-moss opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-moss"></span>
                            </span>
                            <span>✓ Code {pdpPromoCode} Applied: Extra ₹{pdpPromoDiscount} Instant Off!</span>
                          </div>
                        )}

                        <span className="text-[9px] font-mono text-earth/50 uppercase block mt-1">
                          {selectedProduct.taxDisclaimer || "Price inclusive of all taxes & local duties"}
                        </span>

                        {/* High-visibility Delivery & Return Trust Highlights */}
                        <div className="mt-3.5 grid grid-cols-2 gap-2.5 p-3 bg-stone-100/80 border border-[#1C2333]/15 rounded-md shadow-xs">
                          <div className="flex items-center gap-2.5 text-[#1C2333]">
                            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-sm shrink-0 border border-emerald-300">
                              <Truck className="w-4 h-4 stroke-[2.2]" />
                            </div>
                            <div>
                              <span className="block font-serif text-xs font-bold text-[#1C2333] leading-tight">3 Days Delivery</span>
                              <span className="block font-mono text-[9px] text-emerald-800 font-bold uppercase tracking-wider">Express Dispatch</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 text-[#1C2333]">
                            <div className="p-2 bg-amber-100 text-amber-900 rounded-sm shrink-0 border border-amber-300">
                              <RotateCcw className="w-4 h-4 stroke-[2.2]" />
                            </div>
                            <div>
                              <span className="block font-serif text-xs font-bold text-[#1C2333] leading-tight">7 Days Return</span>
                              <span className="block font-mono text-[9px] text-amber-900 font-bold uppercase tracking-wider">Hassle-Free Guarantee</span>
                            </div>
                          </div>
                        </div>
                      </div>



                      {selectedProduct.promoText && (
                        <div className="flex items-center gap-2 text-xs font-mono text-moss uppercase tracking-wider bg-moss/5 border border-moss/10 rounded-sm p-3 font-semibold mt-1">
                          <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-moss shrink-0 animate-pulse"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                          <span>{selectedProduct.promoText}</span>
                        </div>
                      )}


                    </div>



                    {/* SIZES CHIPS SELECTOR WITH NOTIFY ME */}
                    {(() => {
                      const isShoesProd = selectedProduct.productType === "Shoes" || (selectedProduct.category || "").toLowerCase().includes("footwear") || (selectedProduct.category || "").toLowerCase().includes("shoes");
                      const isThreePieceProd = selectedProduct.productType === "Three-Piece Set";
                      const isTwoPieceProd = !isThreePieceProd && (selectedProduct.category === "Shirt & Pant Combo" || selectedProduct.productType === "Two-Piece Set" || (selectedProduct.name || "").toLowerCase().includes("set") || (selectedProduct.name || "").toLowerCase().includes("combo"));
                      const isSingleGarmentProd = !isShoesProd && !isThreePieceProd && !isTwoPieceProd;

                      const shirtSizeOptions = (selectedProduct.topSizes && selectedProduct.topSizes.length > 0)
                        ? selectedProduct.topSizes
                        : ["S", "M", "L", "XL", "XXL", "XXXL"];

                      const hasLetterTrouserSizes = selectedProduct.bottomSizes && selectedProduct.bottomSizes.some((s: string) => /[a-zA-Z]/.test(String(s)));
                      const trouserSizeOptions = (selectedProduct.bottomSizes && selectedProduct.bottomSizes.length > 0 && !hasLetterTrouserSizes)
                        ? selectedProduct.bottomSizes
                        : ["26", "28", "30", "32", "34", "36", "38"];

                      const shoeSizeOptions = (selectedProduct.shoeSizes && selectedProduct.shoeSizes.length > 0)
                        ? selectedProduct.shoeSizes
                        : ["6", "7", "8", "9", "10", "11", "12"];

                      const isBottomItem = (selectedProduct.category || "").toLowerCase().includes("pant") || (selectedProduct.category || "").toLowerCase().includes("trouser") || (selectedProduct.category || "").toLowerCase().includes("bottom") || (selectedProduct.category || "").toLowerCase().includes("jeans");

                      const singleGarmentSizeOptions = (selectedProduct.sizes && selectedProduct.sizes.length > 0)
                        ? selectedProduct.sizes
                        : isBottomItem
                          ? trouserSizeOptions
                          : shirtSizeOptions;

                      const getFormattedSizeStr = () => {
                        if (isThreePieceProd) {
                          return `Shirt: ${selectedShirtSize} / Pant: ${selectedTrouserSize} / Shoe: ${selectedShoeSize}`;
                        }
                        if (isTwoPieceProd) {
                          return `Shirt: ${selectedShirtSize} / Trouser: ${selectedTrouserSize}`;
                        }
                        if (isShoesProd) {
                          return selectedShoeSize;
                        }
                        return selectedSize || selectedShirtSize || selectedTrouserSize;
                      };

                      const sizeHeaderLabel = isShoesProd
                        ? "Select Shoe Size"
                        : isThreePieceProd
                          ? "Select Set Sizes (Shirt, Trouser & Shoes)"
                          : isTwoPieceProd
                            ? "Select Set Sizes"
                            : "Select Size";

                      const notifySizesList = Array.from(new Set(
                        isThreePieceProd
                          ? [...shirtSizeOptions, ...trouserSizeOptions, ...shoeSizeOptions]
                          : isTwoPieceProd
                            ? [...shirtSizeOptions, ...trouserSizeOptions]
                            : isShoesProd
                              ? [...shoeSizeOptions]
                              : [...singleGarmentSizeOptions]
                      ));

                      return (
                        <>
                          <div className="space-y-5 p-6 bg-sand/15 border border-[#1C2333]/15 rounded-sm">
                            <div className="flex items-center justify-between border-b border-[#1C2333]/10 pb-2">
                              <span className="text-[11px] uppercase font-mono font-bold tracking-widest text-[#1C2333] block">
                                {sizeHeaderLabel}
                              </span>
                              
                              {/* Size Guide Trigger */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (selectedProduct.sizeGuideRef && (selectedProduct.sizeGuideRef.startsWith("http") || selectedProduct.sizeGuideRef.startsWith("/"))) {
                                    window.open(selectedProduct.sizeGuideRef, "_blank");
                                  } else {
                                    setIsSizeGuideOpen(true);
                                  }
                                }}
                                className="text-[10px] font-mono uppercase text-[#B5652F] hover:text-[#1C2333] transition flex items-center gap-1.5 underline cursor-pointer"
                              >
                                <Ruler className="w-3.5 h-3.5" />
                                <span>Size Guide</span>
                              </button>
                            </div>

                            {/* Row: SHIRT SIZE (For 2-Piece and 3-Piece Sets) */}
                            {(isThreePieceProd || isTwoPieceProd) && (
                              <div className="space-y-2.5 text-left">
                                <span className="text-[10px] uppercase font-mono tracking-wider text-earth/70 font-semibold block">
                                  SELECT SHIRT SIZE
                                </span>
                                <div className="flex flex-wrap gap-2.5">
                                  {shirtSizeOptions.map(sz => {
                                    const isAvailable = (selectedProduct?.topSizes && selectedProduct.topSizes.length > 0)
                                      ? selectedProduct.topSizes.includes(sz)
                                      : (selectedProduct?.sizes || []).includes(sz) || true;
                                    const isSelected = selectedShirtSize === sz;
                                    return (
                                      <button
                                        key={`shirt-${sz}`}
                                        type="button"
                                        onClick={() => {
                                          if (isAvailable) {
                                            setSelectedShirtSize(sz);
                                            setShowNotifyFormForSize(null);
                                          } else {
                                            setShowNotifyFormForSize(showNotifyFormForSize === sz ? null : sz);
                                          }
                                        }}
                                        className={`px-5 py-2.5 border rounded-sm text-xs font-mono transition-all duration-300 relative ${
                                          isSelected
                                            ? "bg-moss border-moss text-linen font-bold shadow-md cursor-pointer"
                                            : isAvailable
                                              ? "bg-white hover:bg-[#1C2333] hover:text-linen border-[#1C2333]/30 text-[#1C2333] cursor-pointer"
                                              : "bg-transparent text-earth/30 border-terrain/10 hover:border-[#B5652F]/40 cursor-pointer text-red-700/60"
                                        }`}
                                      >
                                        {sz}
                                        {!isAvailable && (
                                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[6px] font-mono uppercase tracking-tighter text-[#B5652F] font-bold">
                                            OOS
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Row: TROUSER SIZE (For 2-Piece and 3-Piece Sets) */}
                            {(isThreePieceProd || isTwoPieceProd) && (
                              <div className="space-y-2.5 text-left border-t border-[#1C2333]/5 pt-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] uppercase font-mono tracking-wider text-earth/70 font-semibold block">
                                    SELECT TROUSER SIZE (WAIST)
                                  </span>
                                  <span className="text-[9px] font-mono text-[#B5652F] uppercase tracking-wider font-bold">
                                    26 - 38 INCHES
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                  {trouserSizeOptions.map(sz => {
                                    const isAvailable = (selectedProduct?.bottomSizes && selectedProduct.bottomSizes.length > 0 && !hasLetterTrouserSizes)
                                      ? selectedProduct.bottomSizes.includes(sz)
                                      : true;
                                    const isSelected = selectedTrouserSize === sz;
                                    return (
                                      <button
                                        key={`trouser-${sz}`}
                                        type="button"
                                        onClick={() => {
                                          if (isAvailable) {
                                            setSelectedTrouserSize(sz);
                                            setShowNotifyFormForSize(null);
                                          } else {
                                            setShowNotifyFormForSize(showNotifyFormForSize === sz ? null : sz);
                                          }
                                        }}
                                        className={`px-5 py-2.5 border rounded-sm text-xs font-mono transition-all duration-300 relative ${
                                          isSelected
                                            ? "bg-[#B5652F] border-[#B5652F] text-linen font-bold shadow-sm cursor-pointer"
                                            : isAvailable
                                              ? "bg-white hover:bg-[#1C2333] hover:text-linen border-[#1C2333]/30 text-[#1C2333] cursor-pointer"
                                              : "bg-transparent text-earth/30 border-terrain/10 hover:border-[#B5652F]/40 cursor-pointer text-red-700/60"
                                        }`}
                                      >
                                        {sz}
                                        {!isAvailable && (
                                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[6px] font-mono uppercase tracking-tighter text-[#B5652F] font-bold">
                                            OOS
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Row: SHOE SIZE (For Shoes and 3-Piece Sets) */}
                            {(isShoesProd || isThreePieceProd) && (
                              <div className={`space-y-2.5 text-left ${isThreePieceProd ? "border-t border-[#1C2333]/5 pt-3" : ""}`}>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] uppercase font-mono tracking-wider text-earth/70 font-semibold block">
                                    SELECT SHOE SIZE (UK/INDIA)
                                  </span>
                                  <span className="text-[9px] font-mono text-[#B5652F] uppercase tracking-wider font-bold">
                                    SIZE 6 - 12
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                  {shoeSizeOptions.map(sz => {
                                    const isAvailable = (selectedProduct?.shoeSizes && selectedProduct.shoeSizes.length > 0)
                                      ? selectedProduct.shoeSizes.includes(sz)
                                      : (selectedProduct?.sizes && selectedProduct.sizes.length > 0)
                                        ? selectedProduct.sizes.includes(sz)
                                        : true;
                                    const isSelected = selectedShoeSize === sz;
                                    return (
                                      <button
                                        key={`shoe-${sz}`}
                                        type="button"
                                        onClick={() => {
                                          if (isAvailable) {
                                            setSelectedShoeSize(sz);
                                            setShowNotifyFormForSize(null);
                                          } else {
                                            setShowNotifyFormForSize(showNotifyFormForSize === sz ? null : sz);
                                          }
                                        }}
                                        className={`px-5 py-2.5 border rounded-sm text-xs font-mono transition-all duration-300 relative ${
                                          isSelected
                                            ? "bg-[#1C2333] border-[#1C2333] text-linen font-bold shadow-sm cursor-pointer"
                                            : isAvailable
                                              ? "bg-white hover:bg-[#1C2333] hover:text-linen border-[#1C2333]/30 text-[#1C2333] cursor-pointer"
                                              : "bg-transparent text-earth/30 border-terrain/10 hover:border-[#B5652F]/40 cursor-pointer text-red-700/60"
                                        }`}
                                      >
                                        {sz}
                                        {!isAvailable && (
                                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[6px] font-mono uppercase tracking-tighter text-[#B5652F] font-bold">
                                            OOS
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Row: SINGLE GARMENT SIZE */}
                            {isSingleGarmentProd && (
                              <div className="space-y-2.5 text-left">
                                <span className="text-[10px] uppercase font-mono tracking-wider text-earth/70 font-semibold block">
                                  SELECT SIZE
                                </span>
                                <div className="flex flex-wrap gap-2.5">
                                  {singleGarmentSizeOptions.map(sz => {
                                    const isAvailable = (selectedProduct?.sizes && selectedProduct.sizes.length > 0)
                                      ? selectedProduct.sizes.includes(sz)
                                      : true;
                                    const isSelected = selectedSize === sz || selectedShirtSize === sz || selectedTrouserSize === sz;
                                    return (
                                      <button
                                        key={`single-${sz}`}
                                        type="button"
                                        onClick={() => {
                                          if (isAvailable) {
                                            setSelectedSize(sz);
                                            setSelectedShirtSize(sz);
                                            setSelectedTrouserSize(sz);
                                            setShowNotifyFormForSize(null);
                                          } else {
                                            setShowNotifyFormForSize(showNotifyFormForSize === sz ? null : sz);
                                          }
                                        }}
                                        className={`px-5 py-2.5 border rounded-sm text-xs font-mono transition-all duration-300 relative ${
                                          isSelected
                                            ? "bg-moss border-moss text-linen font-bold shadow-md cursor-pointer"
                                            : isAvailable
                                              ? "bg-white hover:bg-[#1C2333] hover:text-linen border-[#1C2333]/30 text-[#1C2333] cursor-pointer"
                                              : "bg-transparent text-earth/30 border-terrain/10 hover:border-[#B5652F]/40 cursor-pointer text-red-700/60"
                                        }`}
                                      >
                                        {sz}
                                        {!isAvailable && (
                                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[6px] font-mono uppercase tracking-tighter text-[#B5652F] font-bold">
                                            OOS
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Notify Me Form segment */}
                            {notifySizesList.map(sz => {
                              if (showNotifyFormForSize !== sz) return null;
                              return (
                                <div key={sz} className="mt-3 p-4 bg-white border border-moss/20 rounded-sm space-y-2.5 text-left">
                                  <div className="text-xs font-mono text-moss font-bold uppercase tracking-wider">
                                    Notify Me When Size {sz} Restocks
                                  </div>
                                  {notifySubmittedSize === sz ? (
                                    <div className="text-xs font-mono text-moss bg-moss/5 p-2 rounded border border-moss/10">
                                      ✓ Registration successful! You'll receive an instant email alert when back in stock.
                                    </div>
                                  ) : (
                                    <form 
                                      onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (notifyEmail && selectedProduct) {
                                          try {
                                            const res = await fetch("/api/notify", {
                                              method: "POST",
                                              headers: {
                                                "Content-Type": "application/json"
                                              },
                                              body: JSON.stringify({
                                                email: notifyEmail,
                                                productId: selectedProduct.id,
                                                size: sz
                                              })
                                            });
                                            if (res.ok) {
                                              setNotifySubmittedSize(sz);
                                              setNotifyEmail("");
                                            } else {
                                              alert("Failed to register restock notification coordinates.");
                                            }
                                          } catch (err) {
                                            console.error("Restock notification submission failure:", err);
                                            alert("Connection to database failed.");
                                          }
                                        }
                                      }} 
                                      className="flex gap-2"
                                    >
                                      <input 
                                        type="email"
                                        required
                                        value={notifyEmail}
                                        onChange={(e) => setNotifyEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        className="flex-1 bg-[#FAF9F5] border border-terrain/20 rounded p-2 text-xs font-mono focus:outline-none focus:border-moss"
                                      />
                                      <button 
                                        type="submit" 
                                        className="bg-moss text-white px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-sm cursor-pointer hover:bg-moss/90 font-bold"
                                      >
                                        Submit
                                      </button>
                                    </form>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* ACTION BUTTONS: Add to Cart & Wishlist */}
                          <div className="space-y-3.5 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                const sizeStr = getFormattedSizeStr();
                                addToCart(selectedProduct, sizeStr, currentVariantOrCombo);
                                handleOpenCheckout();
                              }}
                              className="w-full py-4 px-6 text-center text-xs font-mono uppercase tracking-widest bg-[#1C2333] hover:bg-[#283144] text-[#D9CBB0] hover:text-linen transition-all duration-300 rounded-sm select-none cursor-pointer flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg font-bold"
                            >
                              <ShoppingBag className="w-4 h-4 text-[#D9CBB0]" />
                              <span>
                                {isThreePieceProd
                                  ? "ADD 3-PIECE SET TO BAG"
                                  : isTwoPieceProd
                                    ? "ADD COMBO TO BAG"
                                    : isShoesProd
                                      ? `ADD SHOES TO BAG (${selectedShoeSize})`
                                      : `Add chosen piece to bag (${selectedSize})`}
                              </span>
                            </button>

                            <div>
                              <button
                                type="button"
                                onClick={() => {
                                  const sizeStr = getFormattedSizeStr();
                                  addToCart(selectedProduct, sizeStr, currentVariantOrCombo);
                                  handleOpenCheckout();
                                }}
                                className="w-full py-3 px-4 text-center text-[10px] font-mono uppercase tracking-widest border border-moss bg-moss text-linen hover:bg-moss/95 transition-all duration-300 rounded-sm select-none cursor-pointer flex items-center justify-center gap-2 font-bold"
                              >
                                <CreditCard className="w-3.5 h-3.5 text-linen" />
                                <span>Buy Now</span>
                              </button>
                            </div>
                          </div>
                        </>
                      );
                    })()}

                    {/* RATINGS & REVIEWS SECTION UNDER BUY NOW */}
                    <ReviewSection
                      product={selectedProduct}
                      currentUser={currentUser}
                      onStatsUpdate={(stats) => handleReviewStatsUpdate(selectedProduct.id, stats)}
                    />



                    {/* Specifications & Highlights */}
                    {selectedProduct.highlights && selectedProduct.highlights.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {selectedProduct.highlights.map((h, hIdx) => (
                          <div key={hIdx} className="flex items-center gap-2 bg-white/50 border border-terrain/10 rounded-sm p-2.5">
                            {renderHighlightIcon(h.icon)}
                            <span className="text-[10px] font-mono uppercase tracking-wider text-ink font-semibold">{h.label}</span>
                          </div>
                        ))}
                      </div>
                    )}



                    {/* Scribe Sizing Advice Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAIConsoleOpen(true);
                      }}
                      className="w-full text-center py-2.5 bg-[#FAF9F5] hover:bg-white border border-terrain text-earth hover:text-ink text-[10px] font-mono uppercase tracking-widest transition duration-300 rounded-sm flex items-center justify-center gap-2 cursor-pointer font-bold mt-4"
                    >
                      <Feather className="w-3.5 h-3.5 text-moss" />
                      <span>Ask Scribe Sizing Advice</span>
                    </button>

                  </div>

                </div>

                {/* "Complete Your Look" Suggestions Row */}
                <div className="mt-24 pt-12 border-t border-[#1C2333]/15 text-left">
                  <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-light text-[#1C2333] uppercase tracking-widest mb-8">
                    Complete Your Look
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {products.filter(p => p.id !== selectedProduct.id).slice(0, 4).map(p => {
                      const refNum = `REF. 0${Math.floor(Math.abs(p.id.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)) % 1000)}/${Math.floor(Math.abs(p.id.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)) % 100)}`;
                      return (
                        <div 
                          key={p.id} 
                          className="group relative space-y-3 cursor-pointer select-none" 
                          onClick={() => { 
                            handleOpenProductDetails(p); 
                            setActiveImgIdx(0); 
                          }}
                        >
                          <div className="aspect-[3/4] overflow-hidden bg-sand/10 border border-terrain/10 rounded-sm relative">
                            <img 
                              src={getDirectImageUrl(p.images?.[0]) || ""} 
                              alt={p.name} 
                              className="w-full h-full object-cover group-hover:scale-103 transition-all duration-700"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-xs text-[7px] font-mono tracking-widest text-moss font-bold uppercase shadow-xs">
                              Recommend
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1 text-xs font-mono">
                            <span className="text-[8px] text-earth/50 font-bold uppercase">{refNum}</span>
                            <div className="flex justify-between items-start">
                              <div className="text-[#1C2333] uppercase truncate pr-2 font-medium">{p.name}</div>
                              <div className="text-earth font-bold">₹{Math.round(p.price).toLocaleString("en-IN")}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* UPGRADED ROBUST RATINGS AND REVIEWS MODULE */}
                {SHOW_SOCIAL_PROOF && selectedProduct.reviewsEnabled !== false && (
                  <div id="pdp-reviews-section" className="mt-20 pt-12 border-t border-[#1C2333]/15 text-left">
                    <ReviewSection
                      product={selectedProduct}
                      currentUser={currentUser}
                      onStatsUpdate={(stats) => handleReviewStatsUpdate(selectedProduct.id, stats)}
                    />
                  </div>
                )}

                {/* MOBILE STICKY ACTION BAR */}
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-t border-[#1C2333]/15 px-4 py-3 lg:hidden flex items-center justify-between gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-mono uppercase text-earth/50">Total Price</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-mono font-bold text-ink">
                        ₹{Math.round(currentPrice - pdpPromoDiscount).toLocaleString("en-IN")}
                      </span>
                      {pdpPromoDiscount > 0 && (
                        <span className="text-[10px] font-mono text-moss font-bold line-through">
                          ₹{Math.round(currentPrice).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-1 max-w-[280px]">
                    <button
                      type="button"
                      onClick={() => {
                        const isShoesProd = selectedProduct.productType === "Shoes" || (selectedProduct.category || "").toLowerCase().includes("footwear") || (selectedProduct.category || "").toLowerCase().includes("shoes");
                        const isThreePieceProd = selectedProduct.productType === "Three-Piece Set";
                        const isTwoPieceProd = !isThreePieceProd && (selectedProduct.category === "Shirt & Pant Combo" || selectedProduct.productType === "Two-Piece Set" || (selectedProduct.name || "").toLowerCase().includes("set") || (selectedProduct.name || "").toLowerCase().includes("combo"));

                        const sizeStr = isThreePieceProd
                          ? `Shirt: ${selectedShirtSize} / Pant: ${selectedTrouserSize} / Shoe: ${selectedShoeSize}`
                          : isTwoPieceProd
                            ? `Shirt: ${selectedShirtSize} / Trouser: ${selectedTrouserSize}`
                            : isShoesProd
                              ? selectedShoeSize
                              : (selectedSize || selectedShirtSize || selectedTrouserSize);

                        addToCart(selectedProduct, sizeStr, currentVariantOrCombo);
                      }}
                      className="flex-1 py-2.5 bg-white border border-[#1C2333] hover:bg-[#FAF9F5] text-ink text-[10px] font-mono uppercase tracking-widest font-bold transition duration-300 rounded-sm"
                    >
                      {selectedProduct.productType === "Three-Piece Set"
                        ? "Add Set"
                        : (selectedProduct.category === "Shirt & Pant Combo" || selectedProduct.productType === "Two-Piece Set" || (selectedProduct.name || "").toLowerCase().includes("set") || (selectedProduct.name || "").toLowerCase().includes("combo"))
                          ? "Add Combo"
                          : (selectedProduct.productType === "Shoes" || (selectedProduct.category || "").toLowerCase().includes("footwear") || (selectedProduct.category || "").toLowerCase().includes("shoes"))
                            ? "Add Shoes"
                            : "Add to Bag"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const isShoesProd = selectedProduct.productType === "Shoes" || (selectedProduct.category || "").toLowerCase().includes("footwear") || (selectedProduct.category || "").toLowerCase().includes("shoes");
                        const isThreePieceProd = selectedProduct.productType === "Three-Piece Set";
                        const isTwoPieceProd = !isThreePieceProd && (selectedProduct.category === "Shirt & Pant Combo" || selectedProduct.productType === "Two-Piece Set" || (selectedProduct.name || "").toLowerCase().includes("set") || (selectedProduct.name || "").toLowerCase().includes("combo"));

                        const sizeStr = isThreePieceProd
                          ? `Shirt: ${selectedShirtSize} / Pant: ${selectedTrouserSize} / Shoe: ${selectedShoeSize}`
                          : isTwoPieceProd
                            ? `Shirt: ${selectedShirtSize} / Trouser: ${selectedTrouserSize}`
                            : isShoesProd
                              ? selectedShoeSize
                              : (selectedSize || selectedShirtSize || selectedTrouserSize);

                        addToCart(selectedProduct, sizeStr, currentVariantOrCombo);
                        handleOpenCheckout();
                      }}
                      className="flex-1 py-2.5 bg-[#1C2333] hover:bg-moss text-white text-[10px] font-mono uppercase tracking-widest font-bold transition duration-300 rounded-sm"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <>
                {/* SINGLE HIGH-IMPACT FULL-BLEED HERO BANNER */}
                <SplitHeroBanner
                  onSelectCategory={handleGlobalCategorySelect}
                  onScrollToCatalog={() => {
                    const section = document.getElementById("products-grid") || document.getElementById("tirupati-merchandise-garments");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }}
                  cmsConfig={cmsConfig}
                  getDirectImageUrl={getDirectImageUrl}
                />





            {/* DYNAMIC HOMEPAGE SECTIONS (EXCLUDING REMOVED FEATURED & BEST SELLERS) */}
            {homepageSections
              .filter((s: any) => s.isActive && s.id !== "sec-featured" && s.id !== "sec-best-sellers")
              .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map((sec: any) => (
                <HomepageDynamicSection
                  key={sec.id}
                  section={sec}
                  products={products}
                  wishlist={wishlist}
                  toggleWishlist={toggleWishlist}
                  setSelectedProduct={handleOpenProductDetails}
                  setActiveImgIdx={setActiveImgIdx}
                  addToCart={addToCart}
                  setIsCheckoutOpen={setIsCheckoutOpen}
                  detectedVideos={detectedVideos}
                  getDirectImageUrl={getDirectImageUrl}
                  getDirectVideoUrl={getDirectVideoUrl}
                />
              ))}




            {/* WHERE TIRUPATI MERCHANDISE HAS BEEN - ATMOSPHERE GRID (3D COVERFLOW CAROUSEL) */}
            <section className="relative overflow-hidden py-8 sm:py-16 px-1.5 sm:px-4 md:px-6 w-full max-w-none border-b border-terrain/10" style={{ clipPath: "inset(0)" }}>
              {/* Background Layer: Fixed position */}
              <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-0 pointer-events-none" />

              {/* Foreground content wrapper: Relative position */}
              <div className="relative z-10 w-full max-w-none space-y-6 sm:space-y-12">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto space-y-1.5 sm:space-y-3">
                  <h2 className="font-serif text-2xl sm:text-4xl text-[#1C2333] font-light leading-tight">
                    Shop by Category
                  </h2>
                  <p className="text-earth/70 text-xs sm:text-sm font-sans font-light max-w-md mx-auto">
                    Explore curated designs & bespoke footwear collections
                  </p>
                </div>

                {/* 3D Coverflow Carousel Stage */}
                <div 
                  className="relative w-full overflow-visible py-3 sm:py-6 flex flex-col items-center"
                  onMouseEnter={() => setIsCarouselHovered(true)}
                  onMouseLeave={() => setIsCarouselHovered(false)}
                >
                  <div 
                    className="relative w-full max-w-5xl h-[340px] sm:h-[540px] flex items-center justify-center overflow-visible"
                    style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setIsCarouselDragging(false)}
                    onMouseUp={(e) => handleMouseUp(e, categoryActiveIdx)}
                  >
                    {/* Far Left Navigation Arrow */}
                    <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setCategoryActiveIdx((prev) => (prev - 1 + categoriesList.length) % categoriesList.length);
                         resetAutoplayTimer();
                       }}
                      className="absolute left-1 sm:left-4 z-40 p-3 rounded-full bg-ink/90 text-linen hover:bg-[#D9CBB0] hover:scale-110 active:scale-95 shadow-md transition-all duration-300"
                      aria-label="Previous category"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {/* Far Right Navigation Arrow */}
                    <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setCategoryActiveIdx((prev) => (prev + 1) % categoriesList.length);
                         resetAutoplayTimer();
                       }}
                      className="absolute right-1 sm:right-4 z-40 p-3 rounded-full bg-ink/90 text-linen hover:bg-[#D9CBB0] hover:scale-110 active:scale-95 shadow-md transition-all duration-300"
                      aria-label="Next category"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    {/* The 3D Slides Container */}
                    <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
                      {categoriesList.map((cat, idx) => {
                        const total = categoriesList.length;
                        let diff = (idx - categoryActiveIdx) % total;
                        if (diff > total / 2) diff -= total;
                        if (diff < -total / 2) diff += total;
                        
                        const isActive = idx === categoryActiveIdx;
                        
                        // Calculate transforms with smooth 3D coverflow perspective
                        let rotateYVal = 0;
                        let translateZVal = 0;
                        let translateXVal = 0;
                        let scaleVal = 1;
                        let zIndexVal = 50;
                        let opacityVal = 1;
                        let filterVal = "none";
                        
                        if (diff === 0) {
                          rotateYVal = 0;
                          translateZVal = 0;
                          translateXVal = 0;
                          scaleVal = 1;
                          zIndexVal = 50;
                          opacityVal = 1;
                          filterVal = "none";
                        } else if (diff === 1) {
                          rotateYVal = -35;
                          translateZVal = -120;
                          translateXVal = isMobile ? 120 : 280;
                          scaleVal = 0.82;
                          zIndexVal = 30;
                          opacityVal = 0.85;
                          filterVal = "brightness(90%)";
                        } else if (diff === -1) {
                          rotateYVal = 35;
                          translateZVal = -120;
                          translateXVal = isMobile ? -120 : -280;
                          scaleVal = 0.82;
                          zIndexVal = 30;
                          opacityVal = 0.85;
                          filterVal = "brightness(90%)";
                        } else if (diff === 2 || diff === -2) {
                          rotateYVal = diff === 2 ? -45 : 45;
                          translateZVal = -240;
                          translateXVal = diff === 2 ? (isMobile ? 200 : 520) : (isMobile ? -200 : -520);
                          scaleVal = 0.65;
                          zIndexVal = 10;
                          // Hide far slides on mobile to prevent screen overflow
                          opacityVal = isMobile ? 0 : 0.4;
                          filterVal = "brightness(75%)";
                        } else {
                          rotateYVal = diff > 0 ? -50 : 50;
                          translateZVal = -300;
                          translateXVal = diff > 0 ? 700 : -700;
                          scaleVal = 0.5;
                          zIndexVal = 0;
                          opacityVal = 0;
                          filterVal = "brightness(50%)";
                        }
                        
                        return (
                          <div
                            key={cat.id}
                            onClick={() => {
                              if (carouselDragMovedRef.current) return;
                              resetAutoplayTimer();

                              const titleLower = (cat.title || "").toLowerCase();
                              const descLower = (cat.description || "").toLowerCase();
                              const idLower = (cat.id || "").toLowerCase();
                              const kwLower = (cat.searchKeyword || "").toLowerCase();
                              const filterTarget = (cat as any).filterTarget;

                              const isShoesCard =
                                filterTarget === "SHOES" ||
                                titleLower.includes("shoe") || titleLower.includes("footwear") || titleLower.includes("kick") || 
                                titleLower.includes("dunk") || titleLower.includes("chunky") || titleLower.includes("tiger") || 
                                titleLower.includes("samba") || titleLower.includes("sneaker") || titleLower.includes("jordan") || 
                                titleLower.includes("runner") || titleLower.includes("trainer") || titleLower.includes("boot") || 
                                titleLower.includes("slide") || titleLower.includes("yeezy") || titleLower.includes("onitsuka") ||
                                idLower.includes("shoe") || idLower.includes("footwear") || idLower.includes("kick") || idLower.includes("sneaker") || idLower.includes("bespoke-shoes") ||
                                kwLower.includes("shoe") || kwLower.includes("footwear") || kwLower.includes("kick") || kwLower.includes("sneaker") ||
                                descLower.includes("shoe") || descLower.includes("footwear") || descLower.includes("sneaker") || descLower.includes("kick") || descLower.includes("sole");

                              const isAccessoriesCard =
                                filterTarget === "ACCESSORIES" ||
                                titleLower.includes("accessory") || titleLower.includes("accessories") || idLower.includes("accessory");

                              const targetFilter = isShoesCard ? "SHOES" : isAccessoriesCard ? "ACCESSORIES" : (filterTarget || "COMBO");

                              setCategoryActiveIdx(idx);
                              setSelectedMainFilter(targetFilter);
                              setSearchQuery("");

                              const targetSection = document.getElementById("tirupati-merchandise-garments") || document.getElementById("products-grid");
                              if (targetSection) {
                                targetSection.scrollIntoView({ behavior: "smooth" });
                              }
                            }}
                            className="absolute w-[264px] sm:w-[384px] aspect-[3/4] cursor-pointer select-none bg-transparent overflow-visible group"
                            style={{
                              transform: `translateX(${translateXVal}px) translateZ(${translateZVal}px) rotateY(${rotateYVal}deg) scale(${scaleVal})`,
                              zIndex: zIndexVal,
                              opacity: opacityVal,
                              filter: filterVal,
                              transformStyle: "preserve-3d",
                              backfaceVisibility: "hidden",
                              willChange: "transform, opacity, filter",
                              transition: isCarouselDragging
                                ? "none"
                                : "transform 500ms cubic-bezier(0.25, 1, 0.5, 1), opacity 500ms cubic-bezier(0.25, 1, 0.5, 1), filter 500ms ease-in-out",
                              pointerEvents: (isMobile && Math.abs(diff) > 1) || Math.abs(diff) > 2 ? "none" : "auto"
                            }}
                          >
                            {/* Slide Image - Rounded portrait image representing the style */}
                            <div className="w-full h-[68%] rounded-xl overflow-hidden border border-[#1C2333]/15 bg-white relative shadow-md">
                              <img
                                src={getDirectImageUrl(cat.image)}
                                alt={cat.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none rounded-xl"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            
                            {/* Elegant Content Overlay with smooth delayed fade-in for active slide */}
                            <div className={`absolute inset-x-0 bottom-0 top-[68%] flex flex-col justify-start pt-4 px-3 text-[#111827] pointer-events-none select-none text-center transition-all duration-500 ${
                              isActive 
                                ? "opacity-100 translate-y-0 delay-300" 
                                : "opacity-0 translate-y-3 delay-0"
                            }`}>
                              <h3 className="font-serif text-lg sm:text-2xl font-light tracking-wide mb-1 text-[#111827] line-clamp-1">
                                {cat.title}
                              </h3>
                              {cat.description && (
                                <p className="text-xs font-sans font-light text-earth/70 line-clamp-1">
                                  {cat.description}
                                </p>
                              )}
                              
                              {/* CTA Button */}
                              <div className="mt-2 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-[9px] font-mono uppercase tracking-widest text-[#111827] border-b border-[#111827] pb-0.5">
                                  Shop Collection
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Pagination Dots */}
                  <div className="flex items-center gap-2.5 mt-6 z-20">
                    {categoriesList.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCategoryActiveIdx(idx);
                          resetAutoplayTimer();
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          idx === categoryActiveIdx 
                            ? "bg-ink w-6" 
                            : "bg-ink/20 hover:bg-ink/40"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>


              </div>
            </section>

            {/* REDESIGNED EDITORIAL PRODUCT GRID */}
            <section className="relative overflow-hidden py-8 sm:py-16 px-1.5 sm:px-4 md:px-6 w-full max-w-none" id="tirupati-merchandise-garments" style={{ clipPath: "inset(0)" }}>
              {/* Background Layer: Fixed position */}
              <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-0 pointer-events-none" />

              {/* Foreground content wrapper: Relative position */}
              <div className="relative z-10 w-full max-w-none space-y-6 sm:space-y-12">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 border-b border-earth/10 pb-4 sm:pb-8 px-1.5 sm:px-0">
                  <div className="space-y-1.5 sm:space-y-3">
                    <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ink font-light leading-tight uppercase tracking-tight">The Collection</h2>
                    <p className="text-earth/70 text-xs sm:text-sm font-sans font-light max-w-xl">
                      Wear it before you leave. Wear it long after you're back.
                    </p>
                  </div>

                </div>



                {/* Redesigned Master Filter Bar */}
                <div className="overflow-x-auto scrollbar-none pb-2 sm:pb-4 select-none -mx-1.5 px-1.5 sm:mx-0 sm:px-0">
                  <div className="flex gap-2 sm:gap-3 min-w-max">
                    {[
                      "ALL",
                      "COMBO",
                      "SHOES",
                      "ACCESSORIES"
                    ].map((filter) => {
                      const isActive = selectedMainFilter === filter;
                      return (
                        <button
                          key={filter}
                          onClick={() => setSelectedMainFilter(filter)}
                          className={`px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-mono uppercase tracking-widest transition duration-300 ${
                            isActive
                              ? "bg-moss text-linen font-bold shadow-sm"
                              : "bg-terrain/25 text-earth hover:bg-sand/40"
                          }`}
                        >
                          {filter}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Modern Refining Sidebar and Product Layout Container */}
                <div className="w-full">
                  
                  {/* Collapsible Sidebar rendered as Modal */}
                  <FilterSidebar
                    isOpen={isFilterSidebarOpen}
                    onClose={() => setIsFilterSidebarOpen(false)}
                    urlParams={urlParams}
                    updateUrlParam={updateUrlParam}
                    clearAllUrlParams={clearAllUrlParams}
                    hasActiveFilters={hasActiveApiFilters}
                    productsCount={sortedAndFilteredProducts.length}
                  />

                  {/* Product Grid and Sort Controls Container */}
                  <div className="w-full space-y-4 sm:space-y-6">

                    {/* Compact Sort & Filter Control Bar */}
                    <div className="flex flex-row items-center justify-between gap-2 py-2 px-3 sm:px-4 bg-sand/20 border border-terrain/15 rounded-md select-none">
                      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-[10px] sm:text-xs font-mono uppercase text-earth/70 font-semibold tracking-wider whitespace-nowrap">Sort by:</span>
                          <select
                            value={sortBy}
                            onChange={(e: any) => setSortBy(e.target.value)}
                            className="bg-white border border-[#1C2333]/15 text-[11px] sm:text-xs text-[#1C2333] rounded-sm px-2.5 py-1 focus:outline-none focus:border-moss font-mono cursor-pointer"
                            title="Sort Option"
                          >
                            <option value="newest">Newest</option>
                            <option value="price-low-high">Price: Low to High</option>
                            <option value="price-high-low">Price: High to Low</option>
                          </select>
                        </div>

                        {/* Active Search Query Pill */}
                        {searchQuery && (
                          <div className="flex items-center gap-1.5 bg-moss/10 border border-moss/30 text-moss px-2.5 py-1 rounded-sm text-[11px] font-mono animate-fade-in font-bold">
                            <span>Search: &quot;{searchQuery}&quot;</span>
                            <button
                              type="button"
                              onClick={() => setSearchQuery("")}
                              className="p-0.5 hover:bg-moss/20 rounded-full transition cursor-pointer text-moss ml-0.5"
                              title="Clear search query"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Filter Toggle Button */}
                        <button
                          onClick={() => setIsFilterSidebarOpen(true)}
                          className="flex items-center gap-1.5 sm:gap-2 bg-moss hover:bg-moss/90 text-linen border border-moss/20 px-3 sm:px-4 py-1.5 rounded-sm text-[11px] font-mono tracking-wider transition-colors duration-300 shadow-xs cursor-pointer"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Filter {[apiGender, apiCategory, apiColor, apiSize].filter(Boolean).length > 0 ? `(${[apiGender, apiCategory, apiColor, apiSize].filter(Boolean).length})` : ""}</span>
                        </button>

                        {/* Clear Filter Button */}
                        {hasActiveApiFilters && (
                          <button
                            onClick={clearAllUrlParams}
                            className="flex items-center gap-1 bg-transparent hover:bg-red-50 text-red-700 hover:text-red-800 border border-red-200 px-2.5 py-1.5 rounded-sm text-[11px] font-mono tracking-wider transition-all duration-300 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Clear</span>
                          </button>
                        )}
                      </div>

                    </div>

                {quotaExceeded && (
                  <div style={{ backgroundColor: "#fffbeb", color: "#92400e", padding: "12px", border: "1px solid #fcd34d", borderRadius: "6px", marginBottom: "16px" }}>
                    <strong>Notice:</strong> High traffic volume. Displaying cached catalog. Some recent updates may not be visible.
                  </div>
                )}

                {/* Streamlined 2-Column Product Grid (Mobile-First 2 columns, Desktop 4 columns) */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-6" id="products-grid">
                  {sortedAndFilteredProducts.length > 0 ? (
                    sortedAndFilteredProducts.map((p, pIdx) => {
                      const isStarred = wishlist.includes(p.id);

                      return (
                        <ProductCard
                          key={p.id}
                          product={p}
                          pIdx={pIdx}
                          isStarred={isStarred}
                          onToggleWishlist={toggleWishlist}
                          onSelectProduct={(prod, imgIdx) => {
                            handleOpenProductDetails(prod);
                            setActiveImgIdx(imgIdx || 0);
                          }}
                          detectedVideos={detectedVideos}
                        />
                      );
                    })
                  ) : (
                    <div className="col-span-2 lg:col-span-3 text-center py-20 text-earth/50 font-serif text-lg">
                      No pieces found matching this search or category filter.
                    </div>
                  )}


                </div>

                </div> {/* Closing tag for Product Grid and Sort Controls Container */}
              </div> {/* Closing tag for Modern Refining Sidebar and Product Layout Container */}

              </div>
            </section>









              </>
            )}
          </div>
        )}

        {/* VIEW 2: OUR ETHOS & PHILOSOPHY */}
        {activeTab === "story" && (
          <section className="max-w-4xl mx-auto px-4 py-24 space-y-16">
            <div className="text-center space-y-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-moss font-bold block">Woven in the Present</span>
              <h2 className="font-serif text-4xl sm:text-5xl text-ink font-bold">The Tirupati Merchandise Chronicle</h2>
              <div className="w-12 h-px bg-moss mx-auto mt-4" />
            </div>

            <div className="aspect-[16/9] overflow-hidden bg-dust border border-terrain/30 rounded-sm">
              <img 
                src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80" 
                alt="Wanderer in warm morning fog studying traditional linen weaving details" 
                className="w-full h-full object-cover filter brightness-[0.9]"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-8 text-earth/95 leading-relaxed font-sans font-light text-base sm:text-lg">
              <p>
                Tirupati Merchandise began as a quiet conversation between travelers standing at an ancient brick temple at dawn. Watching the morning sun spill gold across hand-loomed drapes, we realized that modern traveling apparel had become too busy, too synthetic, and too rushed.
              </p>
              <p>
                We asked ourselves: why is traveler clothing built only for high-speed sports? Why are we covered in plastic logos, neon zippers, and synthetic grids when our goal is to slow down and immerse ourselves in our surroundings?
              </p>
              
              <div className="border-l-2 border-moss pl-6 py-4 my-8 text-ink italic font-serif text-lg sm:text-xl bg-sand/35 rounded-sm">
                "Tirupati Merchandise is the Sanskrit word for the present moment. We believe the clothing you pack should not be a technical distraction, but a quiet partner that helps you feel grounded wherever you step."
              </div>

              <p>
                To achieve this, we returned to first principles. We source rain-fed organic flax from single-origin growers and handloom them with rural artisan collectives. We dye our fabrics with botanical marigolds, local roots, and mineral infusions, ensuring every garment can eventually return to the soil from which it came.
              </p>
              
              <div className="pt-8 text-center">
                <button
                  onClick={() => setActiveTab("store")}
                  className="px-8 py-4 bg-ink hover:bg-moss text-linen text-xs font-mono uppercase tracking-widest transition duration-300 rounded-sm shadow-md cursor-pointer"
                >
                  Examine the Garments
                </button>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 3: DEDICATED ADMIN / MERCHANT PANEL (Protected Guard via Firestore isAdmin Check) */}
        {activeTab === "merchant" && (
          <section className="w-full max-w-none px-2 sm:px-4 md:px-6 lg:px-8 pt-28 sm:pt-32 pb-12 min-h-screen" id="admin-panel-root">
            {isVerifyingAdmin ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="w-8 h-8 border-2 border-[#1C2333] border-t-transparent rounded-full animate-spin"></div>
                <p className="font-mono text-xs uppercase tracking-widest text-[#1C2333]/70">Verifying administrator authorization via Firestore security claims...</p>
              </div>
            ) : !isAdminVerified ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 max-w-md mx-auto">
                <div className="p-4 rounded-full bg-red-100 text-red-800">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#1C2333]">Access Denied</h2>
                <p className="text-sm text-[#1C2333]/70 font-sans">
                  This route requires verified administrator privileges. Your account does not possess the required Firestore isAdmin flag or security claims.
                </p>
                <button
                  onClick={() => navigateTo("store", "/")}
                  className="px-6 py-2.5 bg-[#1C2333] text-[#FAF9F5] font-mono text-xs uppercase tracking-widest font-bold rounded hover:bg-[#283144] transition cursor-pointer"
                >
                  Return to Storefront
                </button>
              </div>
            ) : (
              <AdminDashboard
                products={products}
                orders={orders}
                analytics={analytics}
                currentUser={currentUser}
                authToken={authToken || "token-admin-123"}
                onProductUpdate={fetchProducts}
                onOrderUpdate={fetchOrders}
                cmsConfig={cmsConfig}
                onCmsUpdate={handleCmsUpdate}
                merchantAIReport={merchantAIReport}
                onGenerateInsights={handleGenerateAIInsights}
                isGeneratingInsights={isGeneratingInsights}
              />
            )}
          </section>
        )}

        {/* STANDALONE PAGE 1: SHIPPING & RETURNS */}
        {activeTab === "shipping" && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 animate-fade-in" id="shipping-returns-page">
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-moss block font-bold">Transit & Circularity</span>
                <h1 className="font-serif text-4xl sm:text-5xl text-ink font-light tracking-tight">Shipping, Circularity & The Soil Trial</h1>
                <p className="text-earth/60 font-mono text-xs uppercase tracking-widest">Unhurried journeys require thoughtful logistics</p>
              </div>

              <div className="prose prose-stone max-w-none space-y-8 font-sans font-light text-earth/95 leading-relaxed text-sm sm:text-base">
                <div className="bg-sand/20 border border-terrain/15 p-8 rounded-sm space-y-4">
                  <h3 className="font-serif text-lg font-medium text-ink flex items-center gap-2">
                    <Truck className="w-5 h-5 text-moss" /> Complimentary Domestic Shipping
                  </h3>
                  <p>
                    Every Tirupati Merchandise garment is handloomed to order and travels with mindful intention. We offer <strong>Complimentary Domestic Shipping across India</strong> on all orders exceeding <strong>₹2,999</strong>. For orders below this threshold, a flat transit fee of ₹150 is applied to support our local artisan transport cluster.
                  </p>
                  <p className="font-mono text-xs text-moss/80">
                    * Standard domestic transit requires 5 to 7 travel suns (days) from loom completion to your coordinates.
                  </p>
                </div>

                <div className="bg-sand/20 border border-terrain/15 p-8 rounded-sm space-y-4">
                  <h3 className="font-serif text-lg font-medium text-ink flex items-center gap-2">
                    <Globe className="w-5 h-5 text-moss" /> International Destinations
                  </h3>
                  <p>
                    Tirupati Merchandise garments seek paths worldwide. We ship to over 40 countries. International transit carries a flat charge of ₹2,500 (approx. $30 USD) and takes 10 to 14 travel suns. Any custom coordinates or local duties are handled carefully with our international dispatch partners.
                  </p>
                </div>

                <div className="space-y-6">
                  <h3 className="font-serif text-2xl text-ink font-medium border-b border-earth/10 pb-3 flex items-center gap-2.5">
                    <RotateCcw className="w-6 h-6 text-moss" /> The 14-Day Soil Return Trial
                  </h3>
                  <p>
                    We believe in absolute accountability. If a garment does not feel like a natural extension of your spirit, you can return it within 14 suns (days) of arrival. Because our pieces are 100% biological with zero synthetic threads, returned garments that are unworn are either restored for other seekers or naturally composted back into our Rajasthani agricultural source soil.
                  </p>

                  <div className="grid md:grid-cols-3 gap-6 pt-4">
                    <div className="bg-white border border-terrain/10 p-6 space-y-3 relative">
                      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-moss text-linen flex items-center justify-center font-mono text-xs font-bold shadow-sm">1</div>
                      <h4 className="font-serif font-medium text-ink pt-2">Initiate Request</h4>
                      <p className="text-xs text-earth/70 leading-relaxed">
                        Signal your intention by emailing support@tirupatimerchandise.com with your Order Coordinates and Seeker ID.
                      </p>
                    </div>
                    <div className="bg-white border border-terrain/10 p-6 space-y-3 relative">
                      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-moss text-linen flex items-center justify-center font-mono text-xs font-bold shadow-sm">2</div>
                      <h4 className="font-serif font-medium text-ink pt-2">Gentle Return Transit</h4>
                      <p className="text-xs text-earth/70 leading-relaxed">
                        We arrange a complimentary carbon-neutral courier to retrieve the garment. Ensure original linen pouches and custom wooden tags remain intact.
                      </p>
                    </div>
                    <div className="bg-white border border-terrain/10 p-6 space-y-3 relative">
                      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-moss text-linen flex items-center justify-center font-mono text-xs font-bold shadow-sm">3</div>
                      <h4 className="font-serif font-medium text-ink pt-2">Circularity Audit & Refund</h4>
                      <p className="text-xs text-earth/70 leading-relaxed">
                        Once received, our weavers inspect the piece. Approved returns trigger a full refund to your original payment coordinates within 5 to 7 suns.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-8">
                  <button onClick={() => { setActiveTab("store"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="px-8 py-3.5 bg-ink hover:bg-moss text-linen text-xs font-mono uppercase tracking-widest transition duration-300 rounded-sm cursor-pointer">
                    Return to Storefront
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* STANDALONE PAGE 2: FAQ ACCORDION */}
        {activeTab === "faq" && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 animate-fade-in" id="faq-page">
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-moss block font-bold">Seeker Wisdom</span>
                <h1 className="font-serif text-4xl sm:text-5xl text-ink font-light tracking-tight">Frequently Contemplated</h1>
                <p className="text-earth/60 font-mono text-xs uppercase tracking-widest">An unhurried repository of truth</p>
              </div>

              <div className="space-y-4" id="faq-accordion-container">
                {[
                  {
                    q: "How do I ensure a flawless fit with Tirupati Merchandise's sizing model?",
                    a: "Our garments are loomed with an unstructured, relaxed fit philosophy to facilitate free movement and breathing. We recommend consulting our detailed measurement guide (found next to the size selectors) which lists chest, length, and shoulder specs in centimeters and inches. If in between paths, size down for a more standard fit or keep your true size for our signature relaxed drape."
                  },
                  {
                    q: "What is the proper ritual for caring for natural botanical dyes?",
                    a: "Because we refuse synthetic chemical fixers, our botanical pigments are alive. Wash your garments sparingly using cold water, a neutral liquid soap, and a gentle hand cycle. Dry in shade only—direct sunlight will gracefully age the colors like a sun-bleached desert brick. Slight bleeding during the first wash is normal and expected of pure natural indigo, marigold, and madder root."
                  },
                  {
                    q: "What does the 'Curate Into Capsule' feature do?",
                    a: "Our unique Capsule Curator acts as your virtual wardrobe coordinator. By clicking 'Curate into Capsule' on any product, you store that piece in an active local canvas. In your drawer, you can experiment matching different tops, bottoms, and outerrobes together to ensure you only purchase complementary pieces that work as a unified slow-travel set. This prevents excess buying and encourages styling versatility."
                  },
                  {
                    q: "What are your shipping timelines and pre-launch delivery targets?",
                    a: "Every item is crafted on handlooms by our rural artisan collectives near Jaipur. Standard production takes 3 to 4 suns, and shipping adds another 5 to 7 domestic suns. For our exclusive Pre-Launch collections, delivery coordinates are dispatched strictly starting from September 1st, handled in chronological queue order."
                  },
                  {
                    q: "What is the '200 pieces, no restock' model?",
                    a: "To ensure absolute resource responsibility and protect our artisans from industrial over-work, we strictly limit each editorial collection to exactly 200 physical pieces. Once the raw material for a run has been loomed and tailored, we retire the pattern permanently. We never store excess inventory or restock past drops, making every piece a unique chapter of slow textile history."
                  }
                ].map((item, index) => {
                  const isOpen = expandedFaq === index;
                  return (
                    <div key={index} className="border border-terrain/20 rounded-sm bg-white overflow-hidden shadow-xs hover:shadow-sm transition">
                      <button
                        onClick={() => setExpandedFaq(isOpen ? null : index)}
                        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-serif text-base sm:text-lg text-ink font-medium hover:bg-sand/15 transition select-none outline-none cursor-pointer"
                      >
                        <span>{item.q}</span>
                        <span className="text-moss font-mono text-xl font-light transform transition duration-300 block">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-earth/80 leading-relaxed font-sans font-light border-t border-terrain/10 bg-sand/5 animate-fade-in">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-8">
                <p className="text-xs text-earth/50 font-mono">Still seeking clarity? Reach our travel coordinates at <span className="underline">support@tirupatimerchandise.com</span></p>
              </div>
            </div>
          </section>
        )}

        {/* STANDALONE PAGE 3: FOUNDER & ABOUT */}
        {activeTab === "about" && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 animate-fade-in" id="about-founder-page">
            <div className="grid md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-5 space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-moss block font-bold">The Origin Story</span>
                <h1 className="font-serif text-4xl sm:text-5xl text-ink font-light tracking-tight leading-tight">The Tirupati Merchandise Heritage & Vision</h1>
                <p className="text-earth/60 font-mono text-xs uppercase tracking-widest">Weaving the present moment in Rajasthan</p>
                
                <div className="aspect-[3/4] border border-terrain/15 rounded-sm overflow-hidden shadow-md bg-[#2C2218]/10">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80" 
                    alt="Tirupati Merchandise Founder studying handloom structures under natural sunlight" 
                    className="w-full h-full object-cover grayscale brightness-[0.95] contrast-[1.05]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-[10px] font-mono text-earth/50 text-center italic">
                  Founder & Master Weaver · Jaipur Workspace, June 2026
                </div>
              </div>

              <div className="md:col-span-7 space-y-6 font-sans font-light text-earth/95 leading-relaxed text-sm sm:text-base">
                <h3 className="font-serif text-2xl text-ink font-medium">Why Tirupati Merchandise Exists</h3>
                <p>
                  As an avid traveler, I spent years trekking across mountain passes and desert dunes, always frustrated by the attire available to me. I found myself wrapped in noisy polyester jackets and synthetic hiking trousers adorned with neon plastic logos. I felt like an alien visitor walking through ancient villages—a walking advertisement of technical over-consumption.
                </p>
                <p>
                  I realized that the traveler's clothing should not be a synthetic shield that isolates us from the world. It should be a sensory conductor. It should breathe with the air, catch the humidity of the soil, and carry the memory of the wind.
                </p>

                <h3 className="font-serif text-xl text-ink font-medium pt-4">Our Rajasthani Heritage</h3>
                <p>
                  To bring this vision to life, I returned to my roots in Rajasthan. Around the outskirts of Jaipur, we collaborated with incredible multi-generational artisan clusters. These master weavers don’t use computer-aided machinery. They use pit-looms and frame-looms, guiding rain-fed flax and organic yarns entirely by touch and sight.
                </p>
                <p>
                  Our colors are not synthetic petroleum derivatives. They are the shades of Rajasthan itself—madder root reds, fermented iron grays, hand-harvested indigo blues, and sun-dried marigold golds.
                </p>

                <blockquote className="border-l-2 border-moss pl-6 py-2 my-6 text-ink italic font-serif text-lg bg-sand/20 rounded-sm">
                  "Tirupati Merchandise is a Sanskrit instruction to be present. When you wear our pieces, you aren't just wearing clothes—you are wearing the dust, the sweat, the hands, and the very sun of the moment you step into."
                </blockquote>

                <p>
                  We pledge absolute circularity: zero plastic buttons (we use coconut husk and river shells), zero synthetic polyester labels, and zero synthetic threads. Every Tirupati Merchandise piece can be laid directly in a garden bed at the end of its life, returning to the soil in under three months.
                </p>

                <div className="pt-6">
                  <button onClick={() => { setActiveTab("store"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="px-8 py-3.5 bg-ink hover:bg-moss text-linen text-xs font-mono uppercase tracking-widest transition duration-300 rounded-sm cursor-pointer">
                    Explore Our Garment Trails
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* STANDALONE PAGE 4: MATERIALS & SOURCING */}
        {activeTab === "materials" && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 animate-fade-in" id="materials-sourcing-page">
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-moss block font-bold">Traceable Origin</span>
                <h1 className="font-serif text-4xl sm:text-5xl text-ink font-light tracking-tight">Our Botanical Materials</h1>
                <p className="text-earth/60 font-mono text-xs uppercase tracking-widest">Weaving absolute circularity into every fiber</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Organic Linen */}
                <div className="border border-terrain/15 bg-white p-8 rounded-sm space-y-4 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="h-48 rounded-sm overflow-hidden bg-sand/10 border border-terrain/10">
                      <img 
                        src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80" 
                        alt="Unbleached raw flax linen fabric showing gorgeous irregular slub details" 
                        className="w-full h-full object-cover filter brightness-[0.95]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-moss block font-bold">100% Biodegradable</span>
                    <h3 className="font-serif text-xl font-medium text-ink">Organic Flax Linen</h3>
                    <p className="text-xs text-earth/75 leading-relaxed font-light">
                      Sourced from rain-fed, pesticide-free flax fields. Our linen is celebrated for its irregular slub texture, natural thermoregulation, and high breathability. As you travel, it softens further, mapping the shape of your posture.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-terrain/10 text-[10px] font-mono text-earth/50">
                    Source: GOTS Certified single-origin flax
                  </div>
                </div>

                {/* Handloom Cotton */}
                <div className="border border-terrain/15 bg-white p-8 rounded-sm space-y-4 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="h-48 rounded-sm overflow-hidden bg-sand/10 border border-terrain/10">
                      <img 
                        src="https://images.unsplash.com/photo-1594732832278-abd644401416?w=600&auto=format&fit=crop&q=80" 
                        alt="Raw organically harvested cotton fibers being spun gently onto handloom spools" 
                        className="w-full h-full object-cover filter brightness-[0.95]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-moss block font-bold">Artisan Coops</span>
                    <h3 className="font-serif text-xl font-medium text-ink">Handloomed Cotton</h3>
                    <p className="text-xs text-earth/75 leading-relaxed font-light">
                      Woven by rural artisans near Jaipur using handlooms that consume zero electricity. Hand-spinning leaves the cotton fibers intact and unstressed, creating a remarkably soft, airy drape that synthetics can never replicate.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-terrain/10 text-[10px] font-mono text-earth/50">
                    Source: Jaipur Weaver Guild Collectives
                  </div>
                </div>

                {/* Bamboo Blend */}
                <div className="border border-terrain/15 bg-white p-8 rounded-sm space-y-4 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="h-48 rounded-sm overflow-hidden bg-sand/10 border border-terrain/10">
                      <img 
                        src="https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?w=600&auto=format&fit=crop&q=80" 
                        alt="Natural raw green bamboo shoots basking in warm rain-fed mountain moisture" 
                        className="w-full h-full object-cover filter brightness-[0.95]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-moss block font-bold">Botanical Ingress</span>
                    <h3 className="font-serif text-xl font-medium text-ink">Organic Bamboo Blend</h3>
                    <p className="text-xs text-earth/75 leading-relaxed font-light">
                      Blended with GOTS organic cotton to provide a silky, cooling hand-feel, natural antimicrobial resistance, and high UV protection. Essential for hot humid transit tracks across tropical forest coordinates.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-terrain/10 text-[10px] font-mono text-earth/50">
                    Source: Sustainable mountain bamboo plantations
                  </div>
                </div>
              </div>

              <div className="bg-sand/20 border border-terrain/15 p-8 rounded-sm space-y-4 max-w-3xl mx-auto">
                <h3 className="font-serif text-lg font-medium text-ink text-center">Our 100% Botanical Guarantee</h3>
                <p className="text-sm text-earth/80 text-center leading-relaxed">
                  We verify every single input. Our buttons are sliced from discarded coconuts or gathered river shells. Our sewing threads are organic cotton, not polyester. Our dye baths are pure organic matter. No synthetic microplastics will ever leave a Tirupati Merchandise garment.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* STANDALONE PAGE 5: PRIVACY POLICY */}
        {activeTab === "privacy" && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 animate-fade-in" id="privacy-page">
            <div className="space-y-8">
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-moss block font-bold">Discretion Pledge</span>
                <h1 className="font-serif text-4xl text-ink font-light tracking-tight">Privacy of Your Trail Coordinates</h1>
                <p className="text-earth/60 font-mono text-xs uppercase">Last woven: June 2026</p>
              </div>

              <div className="prose prose-stone font-sans font-light text-earth/95 leading-relaxed text-sm sm:text-base space-y-6">
                <p>
                  At Tirupati Merchandise, we treat your privacy with the same meticulous care we give our organic yarns. We believe your digital footsteps are your own, and we refuse to sell or trade your traveler profiles to third-party advertising grids.
                </p>
                <h3 className="font-serif text-lg font-medium text-ink pt-2">1. Collected Information</h3>
                <p>
                  We store only the absolute minimum coordinates required to fulfill your garment deliveries: your name, contact email address, shipping coordinates, and transaction details. These are safely saved on our secure Firebase database clusters.
                </p>
                <h3 className="font-serif text-lg font-medium text-ink pt-2">2. Zero Tracking Scripts</h3>
                <p>
                  We do not embed third-party tracking scripts, Facebook Pixels, or dynamic retargeting cookies in your browser. We will never haunt your digital travel tracks with unsolicited visual banners across other websites.
                </p>
                <h3 className="font-serif text-lg font-medium text-ink pt-2">3. Account Integrity</h3>
                <p>
                  Your Path Seeker Account credentials are encrypted with industry-standard cryptographic keys. You can completely erase your data footprint at any time by signaling your decision to support@tirupatimerchandise.com.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* STANDALONE PAGE 6: TERMS OF SERVICE */}
        {activeTab === "terms" && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 animate-fade-in" id="terms-page">
            <div className="space-y-8">
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-moss block font-bold">Woven Agreement</span>
                <h1 className="font-serif text-4xl text-ink font-light tracking-tight">Terms of the Tirupati Merchandise Trail</h1>
                <p className="text-earth/60 font-mono text-xs uppercase">Last woven: June 2026</p>
              </div>

              <div className="prose prose-stone font-sans font-light text-earth/95 leading-relaxed text-sm sm:text-base space-y-6">
                <p>
                  By accessing the Tirupati Merchandise digital storefront and placing order coordinates for our hand-loomed pieces, you agree to walk under the following slow textile rules:
                </p>
                <h3 className="font-serif text-lg font-medium text-ink pt-2">1. Handcrafted Imperfection</h3>
                <p>
                  Tirupati Merchandise garments are not standard machine-made uniform pieces. Because they are loomed manually and dyed with living botanical marigolds, madder root, or indigo, minor variations in weave density, yarn slubs, and pigment shade are intended features of raw artisan textile craft. They represent the voice of the loom.
                </p>
                <h3 className="font-serif text-lg font-medium text-ink pt-2">2. Limited Run Limit</h3>
                <p>
                  We enforce a strict 200-piece ceiling on our collections to maintain ecological and weaver health. No customer is permitted to purchase more than five pieces of the same style, preventing reselling and protecting the unhurried craft from bulk market exploitation.
                </p>
                <h3 className="font-serif text-lg font-medium text-ink pt-2">3. Living Pigment Care</h3>
                <p>
                  By purchasing, you acknowledge your responsibility to care for your garment according to our slow wash guides. Natural botanical pigments will fade gracefully with time and sun-exposure, mapping your unique travel suns and pathways.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* STANDALONE PAGE 7: PATH SEEKER ACCOUNT DASHBOARD & LOGIN */}
        {activeTab === "account" && (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 animate-fade-in" id="account-page-root">
            {!currentUser ? (
              <div className="max-w-md mx-auto bg-white border border-terrain/15 p-8 rounded-sm shadow-sm space-y-8">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-sand/35 text-moss mx-auto flex items-center justify-center">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-ink">Connect Your Seeker Profile</h2>
                  <p className="text-earth/60 text-xs font-mono">Establish coordinates to track your garment trails</p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4" autoComplete="off">
                  {authMode === "register" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase text-earth/60">Your Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Enter full name"
                          autoComplete="off"
                          value={authForm.name}
                          onChange={(e) => handleAuthInputChange("name", e.target.value)}
                          className="w-full px-3 py-2 bg-[#F5F0E8]/40 border border-[#1C2333]/15 rounded-xs text-sm placeholder-stone-400 focus:outline-none focus:border-moss outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase text-earth/60">Phone Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="Enter phone number"
                          autoComplete="off"
                          value={authForm.phone}
                          onChange={(e) => handleAuthInputChange("phone", e.target.value)}
                          className="w-full px-3 py-2 bg-[#F5F0E8]/40 border border-[#1C2333]/15 rounded-xs text-sm placeholder-stone-400 focus:outline-none focus:border-moss outline-none"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-earth/60">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="Enter email address"
                      autoComplete="off"
                      value={authForm.email}
                      onChange={(e) => handleAuthInputChange("email", e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F0E8]/40 border border-[#1C2333]/15 rounded-xs text-sm placeholder-stone-400 focus:outline-none focus:border-moss outline-none"
                    />
                  </div>

                  {isTargetAdminEmail(authForm.email) && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono uppercase text-earth/60 font-bold">Admin Password *</label>
                        <span className="text-[9px] text-amber-700 font-mono font-bold">Protected Admin Account</span>
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={authForm.password}
                        onChange={(e) => handleAuthInputChange("password", e.target.value)}
                        className="w-full px-3 py-2 bg-[#F5F0E8]/40 border border-[#1C2333]/30 rounded-xs text-sm placeholder-stone-400 focus:outline-none focus:border-moss outline-none font-sans"
                      />
                    </div>
                  )}

                  {(errorMessage || authError) && (
                    <p className="text-red-500 text-sm text-center font-medium">
                      {errorMessage || authError}
                    </p>
                  )}

                  {authSuccess && (
                    <div className="p-3 bg-moss/10 text-moss text-xs font-mono rounded-sm">
                      {authSuccess}
                    </div>
                  )}

                  {magicLinkSent && (
                    <div className="p-3 bg-[#EAF2EC] text-moss text-xs font-mono rounded-sm">
                      A slow-transit secure magic coordinate has been dispatched to your email address.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-ink hover:bg-moss text-linen text-xs font-mono uppercase tracking-widest font-bold transition rounded-xs cursor-pointer select-none"
                  >
                    {authMode === "login" ? "Sign In with Email" : "Connect Account"}
                  </button>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-terrain/10 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const nextMode = authMode === "login" ? "register" : "login";
                        setAuthMode(nextMode);
                        resetAuthForm();
                      }}
                      className="text-moss hover:underline font-mono"
                    >
                      {authMode === "login" ? "Need a profile? Sign Up" : "Already registered? Sign In"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <UserProfile
                currentUser={currentUser}
                onUpdateProfile={(updated) => setCurrentUser({ ...currentUser, ...updated })}
                onOpenOrders={() => setIsOrdersModalOpen(true)}
              />
            )}
          </section>
        )}

        {/* STANDALONE PAGE: WISHLIST MANAGEMENT PAGE */}
        {activeTab === "wishlist" && (
          <WishlistPage
            wishlist={wishlist}
            products={products}
            onRemoveFromWishlist={(id, name) => toggleWishlist(id, name)}
            onClearWishlist={() => setWishlist([])}
            onAddToCart={(product, size) => addToCart(product, size)}
            onSelectProduct={(product) => {
              handleOpenProductDetails(product);
            }}
            onNavigateToStore={() => setActiveTab("store")}
          />
        )}

        {/* STANDALONE PAGE 8: STANDALONE ORDER CONFIRMATION PAGE */}
        {activeTab === "order-confirmation" && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 animate-fade-in" id="order-confirmation-page">
            <div className="bg-white border border-terrain/15 p-10 rounded-sm shadow-sm space-y-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#EAF2EC] text-moss mx-auto flex items-center justify-center shadow-xs">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-3">
                <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-moss block font-bold">Coordinate Locked</span>
                <h1 className="font-serif text-3xl sm:text-4xl text-ink font-light">Your Trail Has Begun</h1>
                <p className="text-earth/60 text-xs sm:text-sm font-sans font-light max-w-md mx-auto">
                  Your order coordinates have been verified. Rural artisans are preparing the looms for your custom dispatch.
                </p>
              </div>

              {/* Order Detail Summary Box */}
              <div className="border-t border-b border-terrain/15 py-6 text-left space-y-4 max-w-md mx-auto font-mono text-xs text-earth">
                <div className="flex justify-between border-b border-terrain/10 pb-2">
                  <span className="uppercase text-earth/60">Trail ID</span>
                  <span className="text-ink font-bold">#{orders[orders.length - 1]?.id?.slice(0, 10) || "VT-702919"}</span>
                </div>
                <div className="flex justify-between border-b border-terrain/10 pb-2">
                  <span className="uppercase text-earth/60">Payment Coordinates</span>
                  <span className="text-moss font-bold uppercase tracking-wider">Settled Securely</span>
                </div>
                <div className="flex justify-between border-b border-terrain/10 pb-2">
                  <span className="uppercase text-earth/60">Loom Timeline</span>
                  <span className="text-ink font-medium">3-4 Suns Weaving + 5-7 Suns Dispatch</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="uppercase text-earth/60">Circularity Pledge</span>
                  <span className="text-moss font-bold">100% Soil Return Guaranteed</span>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <button
                  onClick={() => { setActiveTab("store"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="px-8 py-3.5 bg-ink hover:bg-moss text-linen text-xs font-mono uppercase tracking-widest font-bold transition rounded-sm shadow-md cursor-pointer inline-block"
                >
                  Return to Exploration
                </button>
                <p className="text-[10px] text-earth/40 font-mono">An unhurried trail notification has been dispatched to your email.</p>
              </div>
            </div>
          </section>
        )}

      </main>







      {/* 9. BRAND FOOTER */}
      <SiteFooter onNavigate={(tab) => setActiveTab(tab as any)} onOpenOrders={() => setIsOrdersModalOpen(true)} />

      {/* DIALOG 1: THE TIRUPATI MERCHANDISE WAITLIST ENTRY */}
      <AnimatePresence>
        {isWaitlistModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsWaitlistModalOpen(false);
                setIsWaitlistSubmitted(false);
                setWaitlistName("");
                setWaitlistEmail("");
              }}
              className="absolute inset-0 bg-[#2C2218]/45 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-[#F5EFE6] rounded-sm shadow-2xl border border-[#D9CBB0] max-w-lg w-full z-10 p-8 sm:p-10 flex flex-col space-y-6"
              id="waitlist-signup-modal"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsWaitlistModalOpen(false);
                  setIsWaitlistSubmitted(false);
                  setWaitlistName("");
                  setWaitlistEmail("");
                }}
                className="absolute top-4 right-4 p-2 text-[#2C2218]/60 hover:text-[#2C2218] transition rounded-full hover:bg-[#D9CBB0]/20"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              {!isWaitlistSubmitted ? (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-[#B5652F] block">Waitlist Seekers</span>
                    <h3 className="font-serif text-3xl font-bold text-[#2C2218]">Join Tirupati Merchandise</h3>
                    <p className="text-xs text-[#2C2218]/70 leading-relaxed font-sans font-light">
                      We weave our vessels in tiny, artisanal batches. Enter your details below to secure priority access to our upcoming Linen and Kala Cotton drop.
                    </p>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setIsWaitlistSubmitted(true);
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-sans font-bold tracking-wider text-[#2C2218]/60 block">Full Name</label>
                      <input 
                        type="text"
                        required
                        value={waitlistName}
                        onChange={(e) => setWaitlistName(e.target.value)}
                        placeholder="e.g. Maya Lin"
                        className="w-full px-4 py-3 bg-[#FAF6F0] text-[#2C2218] border border-[#D9CBB0] rounded-sm text-xs placeholder-[#2C2218]/30 focus:outline-none focus:border-[#B5652F] transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-sans font-bold tracking-wider text-[#2C2218]/60 block">Email Address</label>
                      <input 
                        type="email"
                        required
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        placeholder="e.g. maya@wander.com"
                        className="w-full px-4 py-3 bg-[#FAF6F0] text-[#2C2218] border border-[#D9CBB0] rounded-sm text-xs placeholder-[#2C2218]/30 focus:outline-none focus:border-[#B5652F] transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-sans font-bold tracking-wider text-[#2C2218]/60 block">Preferred Travel Terrain</label>
                      <select 
                        className="w-full px-4 py-3 bg-[#FAF6F0] text-[#2C2218] border border-[#D9CBB0] rounded-sm text-xs focus:outline-none focus:border-[#B5652F] transition"
                      >
                        <option>Arid Deserts & Dry Canyons</option>
                        <option>Humid Tropics & Coastal Lowlands</option>
                        <option>Alpine Peaks & Cold Altitude Passages</option>
                        <option>Urban Transits & Ancient Temples</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 mt-2 bg-[#B5652F] hover:bg-[#9C4D1D] text-white text-xs font-bold uppercase tracking-widest transition duration-300 rounded-sm shadow-md"
                    >
                      Request Waiting Number
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 mx-auto bg-[#4A6741]/10 text-[#4A6741] flex items-center justify-center rounded-full">
                    <Feather className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-bold text-[#2C2218]">You are in the Present</h3>
                    <p className="text-xs text-[#2C2218]/70 leading-relaxed font-sans max-w-sm mx-auto font-light">
                      Thank you, <span className="font-bold text-[#2C2218]">{waitlistName}</span>. We have secured slot <span className="font-mono font-bold text-[#B5652F]">#VT-702</span> for <span className="underline">{waitlistEmail}</span>.
                    </p>
                    <p className="text-xs text-[#4A6741] leading-relaxed font-medium italic pt-2">
                      "We will notify you when the wooden looms begin to turn."
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsWaitlistModalOpen(false);
                      setIsWaitlistSubmitted(false);
                      setWaitlistName("");
                      setWaitlistEmail("");
                    }}
                    className="px-6 py-2.5 bg-[#2C2218] hover:bg-[#B5652F] text-white text-xs font-bold uppercase tracking-widest transition rounded-sm mt-4"
                  >
                    Return to Seeker Log
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 2: LUGGAGE COORDINATOR PLAN */}
      <AnimatePresence>
        {isLuggageModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLuggageModalOpen(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-xs cursor-pointer focus:outline-none"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-[#FAF9F5] rounded-2xl shadow-2xl border border-sand/40 max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden z-10 p-6 sm:p-8 flex flex-col"
              id="luggage-plan-modal"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsLuggageModalOpen(false)}
                className="absolute top-4 right-4 p-2.5 rounded-full hover:bg-sand/30 text-linen/50 hover:text-stone-950 transition z-20 cursor-pointer"
                id="luggage-modal-close-btn"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Progress stepper tabs */}
              <div className="flex flex-wrap items-center gap-2 mb-6 text-[10px] text-linen/40 font-mono tracking-widest uppercase">
                <span className={luggageStep === 1 ? "text-moss font-extrabold" : "text-sand"}>01. TERRAIN</span>
                <ChevronRight className="w-3 h-3 text-linen/60" />
                <span className={luggageStep === 2 ? "text-moss font-extrabold" : "text-sand"}>02. DURATION</span>
                <ChevronRight className="w-3 h-3 text-linen/60" />
                <span className={luggageStep === 3 ? "text-moss font-extrabold" : "text-sand"}>03. EXCURSION BAG</span>
              </div>

              {/* STEP 1: DESTINATION COORDINATES */}
              {luggageStep === 1 && (
                <div className="space-y-6 flex-1">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-moss font-black flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-moss animate-[spin_12s_linear_infinite]" />
                      <span>TERRAWANDER INTEL PORTAL</span>
                    </span>
                    <h3 className="text-2xl font-serif font-black text-ink block leading-tight">Where is your coordinate destination?</h3>
                    <p className="text-ink/60 text-xs leading-relaxed font-light block">
                      Select your travel terrain vector. We will match our slow-dyed botanical weaves to thrive under these exact climate challenges.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "Arid Desert", title: "Arid Desert", desc: "Dry sandstorms, intense baking rays and deep temperature drops at midnight.", icon: Sun },
                      { id: "Humid Tropics", title: "Humid Tropics", desc: "Tropical rainstorms, intense moisture and sticky wet heat.", icon: CloudRain },
                      { id: "High Altitude", title: "High Altitude", desc: "Freezing thermal mountain winds, requiring high insulation.", icon: Mountain },
                      { id: "Urban Transit", title: "Urban Transit", desc: "Train transitions, city streets and high-packability commute clothing.", icon: Route }
                    ].map(item => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setLuggageDestination(item.id)}
                          className={`p-4 rounded-xl border text-left transition duration-300 flex items-start gap-4 cursor-pointer ${
                            luggageDestination === item.id 
                              ? "bg-moss/10 border-moss ring-2 ring-moss/10 shadow-xs"
                              : "bg-white border-sand/40 hover:border-moss/50"
                          }`}
                        >
                          <div className={`p-2.5 rounded-lg shrink-0 ${luggageDestination === item.id ? 'bg-moss text-white' : 'bg-linen/40 text-moss'}`}>
                            <ItemIcon className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <span className="block font-serif text-sm font-bold text-ink">{item.title}</span>
                            <span className="block text-[10px] text-linen/50 leading-normal font-light">{item.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setLuggageStep(2)}
                      className="px-6 py-3 bg-ink hover:bg-ink/90 text-linen rounded-lg text-xs font-semibold tracking-wide transition duration-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Continue to Duration</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DURATION */}
              {luggageStep === 2 && (
                <div className="space-y-6 flex-1">
                  <div className="space-y-1.5 animate-fadeIn">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-moss font-black flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-moss" />
                      <span>EXCURSION TIMELINES</span>
                    </span>
                    <h3 className="text-2xl font-serif font-black text-ink block leading-tight">How long is your trek?</h3>
                    <p className="text-ink/60 text-xs leading-relaxed font-light block">
                      Excursion duration dictates pack counts. Match your travel span parameters below to calculate exact piece variables.
                    </p>
                  </div>

                  {/* Curated duration cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
                    {[
                      { label: "Weekend Excursion", duration: 3, desc: "2 to 3 Days" },
                      { label: "Explorer Week", duration: 7, desc: "5 to 7 Days" },
                      { label: "Nomadic Loop", duration: 15, desc: "15+ Days Journey" }
                    ].map(dur => (
                      <button
                        key={dur.duration}
                        onClick={() => setLuggageDays(dur.duration)}
                        className={`p-4 rounded-xl border text-center transition duration-350 space-y-2.5 cursor-pointer hover:shadow-2xs ${
                          luggageDays === dur.duration 
                            ? "bg-moss/10 border-moss ring-2 ring-moss/10 shadow-xs"
                            : "bg-white border-sand/40 hover:border-moss/50"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-mono tracking-wider text-linen/40 block font-bold">{dur.label}</span>
                        <span className="block text-3xl font-serif font-black text-ink">{dur.duration}</span>
                        <span className="block text-[10px] text-linen/50 leading-none font-light italic">{dur.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Advanced fine-tuner */}
                  <div className="p-4 bg-white rounded-xl border border-sand/40 space-y-3 shadow-3xs">
                    <div className="flex justify-between items-center text-xs text-linen/50 font-mono">
                      <span>Fine-tune duration parameter:</span>
                      <span className="font-extrabold text-moss text-sm">{luggageDays} Days</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={luggageDays}
                      onChange={(e) => setLuggageDays(parseInt(e.target.value))}
                      className="w-full accent-moss h-1 cursor-pointer"
                    />
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      onClick={() => setLuggageStep(1)}
                      className="px-4 py-2 text-linen/50 hover:text-ink text-xs font-mono uppercase hover:underline cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setLuggageStep(3)}
                      className="px-6 py-3 bg-moss hover:bg-moss-hover text-linen rounded-lg text-xs font-semibold tracking-wide transition duration-300 flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-linen/80 animate-pulse" />
                      <span>Generate Custom Packing List</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DYNAMIC CHECKLISTS */}
              {luggageStep === 3 && (() => {
                const matchedProducts = products.filter(p => p.category === luggageDestination);
                // Packing proportion multiplier: for 3 days they need ~2 items, 7 days ~4 items, 15 days ~6 items
                const calculatedQty = Math.max(1, Math.ceil(luggageDays / 2.5));
                
                return (
                  <div className="space-y-6 flex-1">
                    <div className="space-y-2 pb-4 border-b border-sand/40">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-moss font-extrabold flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-moss" />
                          <span>Wanderer Intelligent Roster</span>
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-moss/10 text-moss text-[10px] font-mono font-bold uppercase tracking-widest">
                          Matched Coordinates
                        </span>
                      </div>
                      <h3 className="text-xl font-serif font-black text-ink block leading-tight">
                        Luggage Roster: {luggageDays}-Day {luggageDestination} Excursion
                      </h3>
                      
                      {/* Climatic Survival Advisory line */}
                      <div className="p-3 bg-linen/40 rounded-lg border border-sand/40 text-[11px] text-ink/70 leading-relaxed font-light mt-2 italic flex gap-2.5">
                        <span className="text-moss text-sm shrink-0">🌱</span>
                        <span>
                          {luggageDestination === "Arid Desert" && "Climatic Intel: Intense solar radiation paired with freezing sand winds requires our chapped-cotton desert weaves. Layer up; coordinate pieces for midnight drops."}
                          {luggageDestination === "Humid Tropics" && "Climatic Intel: High-humidity botanical moisture. Focus heavily on low-impact, breathable linens that reject bacteria and dry within hours."}
                          {luggageDestination === "High Altitude" && "Climatic Intel: Freezing mountain gales require thermal thermal pocket retention. Layer overlapping organic linen/hemp jackets."}
                          {luggageDestination === "Urban Transit" && "Climatic Intel: Commutes and trains require adaptive layers that pack completely flat. Focus on light high-ventilation, dirt-resistant shirts."}
                        </span>
                      </div>
                    </div>

                    {/* Renders dynamic items with state checklist */}
                    <div className="space-y-3.5 max-h-[42vh] overflow-y-auto pr-1">
                      {matchedProducts.length === 0 ? (
                        <p className="text-linen/40 text-xs italic text-center py-8">No specific terrain gear found in current release inventory. Explore our general travel accessories collection!</p>
                      ) : (
                        matchedProducts.map(prod => (
                          <LuggageItemRow 
                            key={prod.id} 
                            product={prod} 
                            multiplierQty={calculatedQty} 
                            onSelectAdd={addToCart} 
                          />
                        ))
                      )}
                    </div>

                    <div className="pt-4 border-t border-sand/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <button
                        onClick={() => setLuggageStep(2)}
                        className="px-4 py-2 text-linen/50 hover:text-ink text-xs font-mono uppercase hover:underline cursor-pointer"
                      >
                        ← Change Excursion Variables
                      </button>
                      
                      {matchedProducts.length > 0 && (
                        <button
                          onClick={() => {
                            matchedProducts.forEach(prod => {
                              addToCart(prod, "M");
                            });
                            setIsLuggageModalOpen(false);
                          }}
                          className="w-full sm:w-auto px-5 py-3 bg-moss hover:bg-moss-hover text-linen rounded-lg text-xs font-bold tracking-wider transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <ShoppingBag className="w-4 h-4 text-linen" />
                          <span>Pack Entire Roster (M sizing)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 1: DETAILED SPECS SHEET */}
      <AnimatePresence>
        {selectedProduct && false && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-ink/80 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-linen border border-terrain/30 max-w-4xl w-full max-h-[92vh] overflow-y-auto z-10 p-6 sm:p-10 shadow-2xl rounded-sm"
              id="product-detail-modal"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-sand/35 text-earth hover:text-ink transition z-20"
                id="close-product-modal"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                
                {/* Left Side: Images Swapper with Gallery */}
                <div className="space-y-4">
                  <div className="aspect-[3/4] bg-dust border border-terrain/20 rounded-sm relative overflow-hidden group">
                    {selectedProduct && detectedVideos[displayImages?.[activeImgIdx] || displayImages?.[0] || ""] ? (
                      <video
                        src={getDirectVideoUrl(displayImages?.[activeImgIdx] || displayImages?.[0] || "")}
                        className="absolute inset-0 w-full h-full object-cover filter brightness-[0.98] group-hover:scale-105 transition-transform duration-700"
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={getDirectImageUrl(displayImages?.[activeImgIdx] || displayImages?.[0]) || null}
                        alt={selectedProduct.name}
                        className="absolute inset-0 w-full h-full object-cover filter brightness-[0.98] group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="absolute inset-0 bg-ink/5 mix-blend-multiply pointer-events-none" />
                  </div>
                  
                  {displayImages && displayImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {displayImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImgIdx(i)}
                          className={`w-14 h-18 rounded-sm border overflow-hidden transition relative flex-shrink-0 bg-dust ${
                            activeImgIdx === i ? "border-moss border-2" : "border-terrain/30 hover:border-moss"
                          }`}
                        >
                          <img src={getDirectImageUrl(img) || null} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          {detectedVideos[img] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/45 z-10 text-white">
                              <Play className="w-4 h-4 fill-white text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side: Content specifications */}
                <div className="flex flex-col justify-between space-y-6">
                  
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono uppercase text-moss tracking-widest block font-bold">
                      {selectedProduct.category}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium text-ink uppercase tracking-wide">
                      {activeVariant ? activeVariant.color : selectedProduct.name}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-mono text-ink font-semibold">
                        ₹{Math.round(selectedProduct?.price || 0).toLocaleString("en-IN")}
                      </span>
                      <div className="flex items-center gap-1 bg-moss/5 px-2 py-0.5 rounded-full text-moss text-xs border border-moss/10">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{selectedProduct.rating} / 5</span>
                      </div>
                    </div>
                    
                    <p className="text-earth text-sm leading-relaxed font-light">
                      {selectedProduct.description}
                    </p>

                    <div className="border-l-2 border-terrain/40 pl-4 py-1 italic text-xs text-earth/80">
                      "{selectedProduct.inspiration}"
                    </div>
                  </div>

                  {/* SIZES CHIPS SELECTOR */}
                  <div className="space-y-3 p-5 bg-sand/15 border border-terrain/20 rounded-sm">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-earth block">Choose Travel Vessel Size</span>
                    <div className="flex flex-wrap gap-2">
                      {["S", "M", "L", "XL"].map(sz => {
                        const isAvailable = (selectedProduct?.sizes || []).includes(sz);
                        return (
                          <button
                            key={sz}
                            disabled={!isAvailable}
                            onClick={() => {
                              addToCart(selectedProduct, sz);
                              setSelectedProduct(null);
                              handleOpenCheckout();
                            }}
                            className={`px-4 py-2 border rounded-sm text-xs font-mono transition ${
                              isAvailable
                                ? "bg-linen hover:bg-moss hover:text-linen border-terrain text-ink cursor-pointer"
                                : "bg-transparent text-earth/30 border-terrain/10 line-through cursor-not-allowed"
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* CAPSULE INTEGRATION FOR PDP */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        toggleCapsuleItem(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className={`w-full py-3 px-4 text-center text-xs font-mono uppercase tracking-widest border transition-all duration-300 rounded-sm select-none cursor-pointer flex items-center justify-center gap-2 ${
                        capsuleItems.some(itm => itm.product.id === selectedProduct.id)
                          ? "bg-moss text-linen border-moss hover:bg-moss/90"
                          : "bg-[#1C2333] text-[#D9CBB0] border-[#D9CBB0] hover:bg-[#283144]"
                      }`}
                    >
                      {capsuleItems.some(itm => itm.product.id === selectedProduct.id) ? (
                        <>
                          <Check className="w-4 h-4 text-linen" />
                          <span>Curated in Your Capsule (Remove)</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#D9CBB0] animate-pulse" />
                          <span>Curate Into Capsule Outfit</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Dynamic Tabs at the Bottom */}
                  <div className="border-t border-earth/10 pt-4 space-y-3">
                    <div className="flex border-b border-earth/10">
                      {(["details", "origin", "care"] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setPdpTab(tab)}
                          className={`text-[10px] font-mono tracking-widest uppercase pb-2 flex-1 text-center border-b transition ${
                            pdpTab === tab ? "border-moss text-ink font-bold" : "border-transparent text-earth/50"
                          }`}
                        >
                          {tab === "details" ? "Tactile Details" : tab === "origin" ? "Ethical Origin" : "Transit Care"}
                        </button>
                      ))}
                    </div>

                    <div className="text-xs text-earth/90 leading-relaxed font-light min-h-[50px] transition duration-300">
                      {pdpTab === "details" && (
                        <span>
                          {(selectedProduct.category || "").includes("Shirt") 
                            ? "Crafted in an airy, unbuttoned, relaxed fit. Features organic coconut shell buttons, raw edge tailored hem, and soft micro-pleating at the shoulder yoke." 
                            : (selectedProduct.category || "").includes("Pant") 
                            ? "Features an elasticized continuous cotton drawstring waistband, reinforced deep security passport side slits, and a slightly tapered unstructured ankle cut."
                            : (selectedProduct.category || "").includes("Sweater")
                            ? "Hand-knit from long-staple botanical cotton threads. Features zero-tension breathable ribs, seamless shoulders, and soft sand-washed texture."
                            : "Relaxed unlined traveler coat featuring deep hidden passport pockets, double-stitched natural flax seams, and a storm-ready overlapping wind guard."}
                        </span>
                      )}
                      {pdpTab === "origin" && (
                        <span>
                          100% Certified pure biological origin. Loomed slowly in rain-fed, water-harvested co-ops in India. Hand-dyed using organic marigolds, madder root, and biological iron mordants. Contains zero microplastics.
                        </span>
                      )}
                      {pdpTab === "care" && (
                        <span>
                          Wash cold with mild organic detergents. Line dry in shade to protect the natural pigments. Avoid hot iron plates. The organic fibers are alive; they conform and soften beautifully as they travel with you.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock and Scribe launcher */}
                  <div className="space-y-3 pt-2">
                    <div className="text-[10px] flex items-center justify-between text-earth/60 font-mono">
                      <span>Reserve batch: Certified Origin</span>
                      {selectedProduct.stock <= 15 ? (
                        <span className="text-earth font-bold flex items-center gap-1.5 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-moss" />
                          <span>Only {selectedProduct.stock} vessels remaining</span>
                        </span>
                      ) : (
                        <span className="text-moss flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-moss" />
                          <span>Reserve available ({selectedProduct.stock} pieces)</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setIsAIConsoleOpen(true);
                      }}
                      className="w-full text-center py-3 bg-moss hover:bg-earth text-linen text-xs font-mono uppercase tracking-widest transition duration-300 rounded-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Feather className="w-4 h-4 text-sand animate-pulse" />
                      <span>Ask Scribe Sizing Advice</span>
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 1.5: SIZE GUIDE MODAL */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute inset-0 bg-[#1C1F22]/80 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-[#FAF9F5] border border-[#1C2333]/30 max-w-lg w-full z-10 p-6 sm:p-8 shadow-2xl rounded-sm text-[#1C2333]"
              id="size-guide-modal-box"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-sand/20 text-linen/50 hover:text-[#1C2333] transition z-20 cursor-pointer"
                aria-label="Close size guide"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-6 text-left">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-moss tracking-widest block font-bold">Wanderer Sizing</span>
                  <h3 className="font-serif text-xl sm:text-2xl font-medium uppercase tracking-wide">Size Chart & Metrics</h3>
                  <p className="text-xs text-earth font-light">
                    Every garment is handloomed with unhurried organic fibers. Find your precise travel measurements below.
                  </p>
                </div>

                <div className="overflow-x-auto border border-[#1C2333]/15 rounded-sm bg-white">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="bg-[#1C2333] text-[#FAF9F5]">
                        <th className="p-3 text-left">Size</th>
                        {selectedProduct && ((selectedProduct.category || "").includes("Pant") || (selectedProduct.name || "").includes("Pant")) ? (
                          <>
                            <th className="p-3 text-left">Waist (in/cm)</th>
                            <th className="p-3 text-left">Hip (in/cm)</th>
                            <th className="p-3 text-left">Inseam (in/cm)</th>
                          </>
                        ) : (
                          <>
                            <th className="p-3 text-left">Chest (in/cm)</th>
                            <th className="p-3 text-left">Length (in/cm)</th>
                            <th className="p-3 text-left">Shoulder (in/cm)</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C2333]/10 bg-white text-[#1C2333]">
                      {selectedProduct && ((selectedProduct.category || "").includes("Pant") || (selectedProduct.name || "").includes("Pant")) ? (
                        <>
                          <tr className="hover:bg-[#FAF9F5]">
                            <td className="p-3 font-bold">S</td>
                            <td className="p-3">28-30" / 71-76cm</td>
                            <td className="p-3">37.8" / 96cm</td>
                            <td className="p-3">30" / 76cm</td>
                          </tr>
                          <tr className="hover:bg-[#FAF9F5] bg-linen/20">
                            <td className="p-3 font-bold">M</td>
                            <td className="p-3">31-33" / 78-84cm</td>
                            <td className="p-3">40.2" / 102cm</td>
                            <td className="p-3">30.7" / 78cm</td>
                          </tr>
                          <tr className="hover:bg-[#FAF9F5]">
                            <td className="p-3 font-bold">L</td>
                            <td className="p-3">34-36" / 86-92cm</td>
                            <td className="p-3">42.5" / 108cm</td>
                            <td className="p-3">31.5" / 80cm</td>
                          </tr>
                          <tr className="hover:bg-[#FAF9F5] bg-linen/20">
                            <td className="p-3 font-bold">XL</td>
                            <td className="p-3">37-39" / 94-100cm</td>
                            <td className="p-3">44.9" / 114cm</td>
                            <td className="p-3">32.3" / 82cm</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr className="hover:bg-[#FAF9F5]">
                            <td className="p-3 font-bold">S</td>
                            <td className="p-3">37" / 94cm</td>
                            <td className="p-3">26.8" / 68cm</td>
                            <td className="p-3">16.5" / 42cm</td>
                          </tr>
                          <tr className="hover:bg-[#FAF9F5] bg-linen/20">
                            <td className="p-3 font-bold">M</td>
                            <td className="p-3">39.4" / 100cm</td>
                            <td className="p-3">27.5" / 70cm</td>
                            <td className="p-3">17.3" / 44cm</td>
                          </tr>
                          <tr className="hover:bg-[#FAF9F5]">
                            <td className="p-3 font-bold">L</td>
                            <td className="p-3">41.7" / 106cm</td>
                            <td className="p-3">28.3" / 72cm</td>
                            <td className="p-3">18.1" / 46cm</td>
                          </tr>
                          <tr className="hover:bg-[#FAF9F5] bg-linen/20">
                            <td className="p-3 font-bold">XL</td>
                            <td className="p-3">44.1" / 112cm</td>
                            <td className="p-3">29.1" / 74cm</td>
                            <td className="p-3">18.9" / 48cm</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#FAF9F5] p-4 border border-[#1C2333]/10 rounded-sm space-y-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-moss font-bold block">How to Measure</span>
                  <p className="text-[11px] text-earth font-light leading-relaxed">
                    <strong>Chest / Waist:</strong> Measure around the fullest part of your chest or natural waistline, keeping the tape horizontal. <br />
                    <strong>Length:</strong> Measure from the highest point of your shoulder down to the hem. <br />
                    <strong>Shoulder / Inseam:</strong> Measure across the back from shoulder point to shoulder point, or inseam from crotch to ankle.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 1.6: DIRECT DIRECT UPI CLEARING CORRIDOR */}
      <AnimatePresence>
        {activeUpiPayment && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#121416]/95 backdrop-blur-md cursor-default"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white border border-[#E5E7EB] max-w-md w-full z-10 p-0 shadow-2xl rounded-3xl text-ink overflow-y-auto max-h-[92vh] md:max-h-[95vh] font-sans"
              id="upi-corridor-modal"
            >
              {showCancelConfirm ? (
                <div className="space-y-6 text-center py-10 px-6" id="upi-cancel-confirmation-view">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600 border border-amber-200">
                    <X className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-xl text-gray-800">Cancel Payment?</h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                      This will close the active secure payment window. Your order will remain pending and we will hold your items in reservation.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 max-w-xs mx-auto pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold tracking-wider transition cursor-pointer"
                      id="cancel-keep-open-btn"
                    >
                      Keep Open
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveUpiPayment(null);
                        setShowUtrStep(false);
                        setUtrInput("");
                        setUtrError(null);
                        setUtrSuccess(false);
                        setShowCancelConfirm(false);
                      }}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold tracking-wider transition cursor-pointer"
                      id="cancel-confirm-btn"
                    >
                      Yes, Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* STEP 1: App List and Direct Select */}
                  {!showUtrStep ? (
                    <div className="flex flex-col h-full">
                      
                      {/* Header Row */}
                      <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10">
                        <button
                          type="button"
                          onClick={() => setShowCancelConfirm(true)}
                          className="p-1.5 hover:bg-gray-150 rounded-full text-gray-500 hover:text-gray-900 transition cursor-pointer"
                          aria-label="Back to shop"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="text-center">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block leading-none mb-0.5">Step 3 of 3</span>
                          <h3 className="font-bold text-gray-800 text-lg leading-tight">Payments</h3>
                        </div>

                        <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-bold text-gray-500">
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                          100% Secure
                        </span>
                      </div>

                      {/* Countdown Timer Strip */}
                      <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between text-[11px] text-amber-800">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          <span>Session expires in:</span>
                        </div>
                        <span className="font-mono font-bold">
                          {Math.floor(upiTimer / 60)}:{String(upiTimer % 60).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Total Amount Box */}
                      <div className="mx-4 my-4 p-4 bg-[#F4F7FC] rounded-2xl flex items-center justify-between border border-blue-50/50">
                        <div className="flex items-center gap-1 text-blue-600">
                          <span className="text-sm font-semibold">Total Amount</span>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                        <span className="text-xl font-extrabold text-blue-600">
                          ₹{Number(activeUpiPayment.amountINR).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Custom UPI Section Accordion */}
                      <div className="mx-4 border border-[#E6E6E6] rounded-2xl overflow-hidden bg-white mb-4">
                        {/* Accordion Title */}
                        <div className="p-4 bg-gray-50/40 border-b border-[#F0F0F0] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-gray-800 text-white font-mono font-bold text-[9px] rounded uppercase tracking-wider">UPI</span>
                            <span className="text-sm font-bold text-gray-800">UPI</span>
                          </div>
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        </div>

                        {/* List of UPI Apps */}
                        <div className="divide-y divide-[#F0F0F0]">
                          {[
                            { 
                              id: "paytm", 
                              name: "Paytm", 
                              hasDiscount: true, 
                              logo: (
                                <div className="w-9 h-9 rounded-full bg-[#002970] flex items-center justify-center border border-[#00baf2]/30 shadow-xs">
                                  <span className="text-white font-sans font-black italic tracking-tighter text-[9px] select-none">paytm</span>
                                </div>
                              )
                            },
                            { 
                              id: "super_money", 
                              name: "super.money", 
                              hasDiscount: true, 
                              logo: (
                                <div className="w-9 h-9 rounded-full bg-[#1C1E21] flex items-center justify-center border border-gray-800 shadow-xs relative overflow-hidden">
                                  <span className="text-[#39FF14] font-mono font-black italic tracking-tighter text-[9px] select-none">super</span>
                                </div>
                              )
                            },
                            { 
                              id: "phonepe", 
                              name: "PhonePe", 
                              hasDiscount: true, 
                              logo: (
                                <div className="w-9 h-9 rounded-full bg-[#5f259f] flex items-center justify-center border border-[#5f259f]/20 shadow-xs">
                                  <span className="text-white font-sans font-extrabold text-xs select-none">Pe</span>
                                </div>
                              )
                            },
                            { 
                              id: "gpay", 
                              name: "Google Pay", 
                              hasDiscount: true, 
                              logo: (
                                <div className="w-9 h-9 rounded-full bg-[#E8F0FE] flex items-center justify-center border border-blue-200 shadow-xs">
                                  <span className="text-blue-600 font-sans font-black tracking-tight text-[10px] select-none">GPay</span>
                                </div>
                              )
                            },
                            { 
                              id: "sbi", 
                              name: "Yono SBI", 
                              hasDiscount: false, 
                              logo: (
                                <div className="w-9 h-9 rounded-full bg-[#00a3e0] flex items-center justify-center border border-sky-300 shadow-xs">
                                  <span className="text-white font-mono font-black text-[9px] select-none">SBI</span>
                                </div>
                              )
                            },
                            { 
                              id: "whatsapp", 
                              name: "whatsapp", 
                              hasDiscount: false, 
                              logo: (
                                <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center border border-green-400 shadow-xs">
                                  <span className="text-white font-sans font-black text-[10px] select-none">WA</span>
                                </div>
                              )
                            }
                          ].map((item) => {
                            const isSelected = selectedUpiOption === item.id;
                            return (
                              <div key={item.id} className="transition-colors">
                                <div
                                  onClick={() => {
                                    setSelectedUpiOption(item.id);
                                    const targetApp = (item.id === "gpay" || item.id === "phonepe" || item.id === "paytm") ? item.id : "other";
                                    handleUpiAppClick(targetApp);
                                  }}
                                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/40 transition"
                                >
                                  <div className="flex items-center gap-3">
                                    {/* Radio indicator */}
                                    <div className="relative flex items-center justify-center">
                                      {isSelected ? (
                                        <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                                          <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                        </div>
                                      ) : (
                                        <div className="w-5 h-5 rounded-full border border-gray-300" />
                                      )}
                                    </div>

                                    {/* App details */}
                                    <div>
                                      <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                                      
                                      {/* Discount text (unselected state) */}
                                      {item.hasDiscount && !isSelected && (
                                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-0.5">
                                          <Tag className="w-3 h-3" />
                                          <span>₹16 discount applicable.</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right side app logo */}
                                  <div>
                                    {item.logo}
                                  </div>
                                </div>

                                {/* Active payment expansion */}
                                {isSelected && (
                                  <div className="px-4 pb-4 space-y-3">
                                    {item.hasDiscount && (
                                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold pl-8">
                                        <Check className="w-4 h-4" />
                                        <span>₹16 discount applied.</span>
                                      </div>
                                    )}

                                    <div className="pl-8">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const targetApp = (item.id === "gpay" || item.id === "phonepe" || item.id === "paytm") ? item.id : "other";
                                          handleUpiAppClick(targetApp);
                                        }}
                                        className="w-full py-3 bg-[#FCBF1E] hover:bg-[#E2AB1B] active:scale-[0.99] text-gray-900 font-extrabold rounded-xl text-sm transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                                      >
                                        Pay ₹{Number(activeUpiPayment.amountINR).toLocaleString("en-IN")}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {paymentPublicConfig.codEnabled !== false && (
                        <div className="mx-4 p-4 border border-[#E6E6E6] rounded-2xl bg-white mb-4 flex items-center justify-between cursor-default opacity-85 hover:opacity-100 transition">
                          <div className="flex items-center gap-3">
                            <Banknote className="w-5 h-5 text-gray-400" />
                            <h4 className="text-sm font-bold text-gray-800">Cash on Delivery</h4>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      )}

                      {/* Dynamic shortcut link for UTR verification */}
                      <div className="text-center pb-4">
                        <button
                          type="button"
                          onClick={() => setShowUtrStep(true)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Already transferred? Click here to enter 12-Digit UTR
                        </button>
                      </div>

                      {/* Bottom Webhook Simulator Bar (removed for production) */}
                      {/*
                      <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3" id="upi-developer-bypass-panel">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-gray-800 text-white font-mono text-[8px] rounded uppercase font-bold tracking-wider">Simulator</span>
                          <span className="text-[10px] text-gray-500">Test webhook transaction outcomes synchronously:</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const payload = {
                                  orderId: activeUpiPayment.orderId,
                                  status: "SUCCESS",
                                  signature: "dev-signature-bypass"
                                };
                                const res = await fetch("/api/payments/webhook", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify(payload)
                                });
                                if (res.ok) {
                                  console.log("Simulated webhook success sent successfully!");
                                } else {
                                  const err = await res.json();
                                  alert(err.error || "Simulation webhook declined.");
                                }
                              } catch (err) {
                                alert("Failed contacting dev webhook corridor.");
                              }
                            }}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[10px] transition cursor-pointer text-center"
                            id="sim-success-webhook-btn"
                          >
                            Simulate Success
                          </button>
                          
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const payload = {
                                  orderId: activeUpiPayment.orderId,
                                  status: "FAILED",
                                  signature: "dev-signature-bypass"
                                };
                                const res = await fetch("/api/payments/webhook", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify(payload)
                                });
                                if (res.ok) {
                                  console.log("Simulated webhook failed sent successfully!");
                                } else {
                                  const err = await res.json();
                                  alert(err.error || "Simulation webhook declined.");
                                }
                              } catch (err) {
                                alert("Failed contacting dev webhook corridor.");
                              }
                            }}
                            className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-800 text-gray-300 rounded-lg font-semibold text-[10px] transition cursor-pointer text-center"
                            id="sim-failed-webhook-btn"
                          >
                            Simulate Failure
                          </button>
                        </div>
                      </div>
                      */}

                    </div>
                  ) : (
                    /* STEP 2: QR Code & Manual UTR Verification Form */
                    <div className="flex flex-col h-full">
                      
                      {/* Header Row */}
                      <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUtrStep(false);
                            setUtrError(null);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 transition cursor-pointer"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="text-center">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block leading-none mb-0.5">Verification</span>
                          <h3 className="font-bold text-gray-800 text-base leading-tight">Confirm Payment</h3>
                        </div>

                        <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-bold text-gray-500">
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                          Secure
                        </span>
                      </div>

                      {/* Outer Card with instructions */}
                      <div className="p-4 space-y-4">
                        <div className="text-center space-y-1">
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Transfer amount</span>
                          <div className="text-3xl font-extrabold text-gray-800">
                            ₹{Number(activeUpiPayment.amountINR).toLocaleString("en-IN")}
                          </div>
                          <span className="text-xs text-gray-400 font-mono">Order: {activeUpiPayment.orderId}</span>
                        </div>

                        {/* Optional QR Code Card (Great for desktop-tablet hybrid checkout) */}
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center gap-3">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Scan to Pay via any UPI App</span>
                          <div className="p-2.5 bg-white rounded-xl border border-gray-200/50 shadow-sm">
                            <img 
                              src={activeUpiPayment.qrCode} 
                              alt="UPI QR Code" 
                              className="w-32 h-32 mx-auto" 
                              referrerPolicy="no-referrer" 
                            />
                          </div>
                          <p className="text-[11px] text-center text-gray-500 leading-relaxed max-w-xs font-medium">
                            If using a desktop, scan with GPay, PhonePe, Paytm, or BHIM. If on mobile, checkout should auto-launch the app.
                          </p>
                        </div>

                        {/* Verification Form */}
                        <form onSubmit={handleUtrSubmit} className="space-y-4" id="utr-verification-form">
                          <div className="space-y-1.5">
                            <label htmlFor="utrInput" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block text-center">
                              Enter 12-Digit UTR Reference Code
                            </label>
                            <input
                              type="text"
                              id="utrInput"
                              maxLength={12}
                              value={utrInput}
                              onChange={(e) => {
                                setUtrInput(e.target.value.replace(/\D/g, ""));
                                setUtrError(null);
                              }}
                              placeholder="e.g. 123456789012"
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-center tracking-widest text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                              disabled={utrSubmitting || utrSuccess}
                              required
                            />
                            {utrError && (
                              <p className="text-[11px] text-red-600 font-semibold text-center mt-1" id="utr-validation-error">
                                {utrError}
                              </p>
                            )}
                          </div>

                          {utrSuccess ? (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center space-y-1.5" id="utr-success-alert">
                              <span className="text-xs text-emerald-800 font-extrabold uppercase tracking-wide block animate-bounce">✓ UTR Recorded</span>
                              <p className="text-[11px] text-emerald-700 leading-relaxed">
                                Your reference code is submitted. The browser is syncing coordinates to our admin queue for validation...
                              </p>
                            </div>
                          ) : (
                            <button
                              type="submit"
                              disabled={utrSubmitting || utrInput.length !== 12}
                              className="w-full py-3.5 bg-gray-900 hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-mono uppercase tracking-widest font-extrabold transition-all shadow-sm"
                              id="submit-utr-btn"
                            >
                              {utrSubmitting ? "Validating..." : "Submit UTR Verification"}
                            </button>
                          )}
                        </form>

                        <div className="space-y-1.5 pt-2 text-[11px] text-gray-500 pl-2">
                          <h4 className="font-bold text-gray-700">How to find UTR:</h4>
                          <ol className="list-decimal list-inside space-y-1">
                            <li>Check transaction receipt details on your payment app.</li>
                            <li>Locate the <span className="font-bold">12-digit UTR</span>, UPI Ref No, or Txn ID.</li>
                            <li>Paste it exactly as shown above and submit to verify.</li>
                          </ol>
                        </div>

                        <div className="text-center pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowUtrStep(false);
                              setUtrError(null);
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            &larr; Choose another payment app
                          </button>
                        </div>
                      </div>

                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MULTI-STEP CHECKOUT FLOW WITH STEPPER PROGRESS */}
      <MultiStepCheckout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cmsConfig={cmsConfig}
        cart={cart}
        updateCartQty={updateCartQty}
        removeFromCart={removeFromCart}
        clearCart={() => setCart([])}
        cartSubtotal={cartSubtotal}
        discountAmount={discountAmount}
        cartTotal={cartTotal}
        appliedCoupon={appliedCoupon}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        handleValidateCoupon={handleValidateCoupon}
        couponError={couponError}
        couponSuccess={couponSuccess}
        currentUser={currentUser}
        onUserAuthSuccess={(user, token) => {
          setCurrentUser(user);
          setAuthToken(token);
          try {
            localStorage.setItem("terrawander_token", token);
            localStorage.setItem("terrawander_user", JSON.stringify(user));
          } catch {}
        }}
        onOpenLoginModal={() => {
          openAuthModal("login", "An account with this email already exists. Please sign in to complete your purchase.");
        }}
        onOrderPlacedSuccess={(order) => {
          fetchProducts();
          fetchOrders();
          if (order) {
            const record = convertOrderToOrderRecord(order, products);
            setOrderRecords((prev) => {
              const filtered = prev.filter((r) => r.id !== record.id);
              const updated = [record, ...filtered];
              try {
                localStorage.setItem("tirupati_merchandise_orders", JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        }}
        getDirectImageUrl={getDirectImageUrl}
        paymentPublicConfig={paymentPublicConfig}
      />

      {/* DIALOG 2.1: WISHLIST VIEW DRAWER */}
      <AnimatePresence>
        {isWishlistOpen && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWishlistOpen(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="relative bg-[#FAF9F5] border-l border-sand/40 w-full max-w-lg h-full shadow-2xl z-10 flex flex-col font-sans text-[#1C2333]"
              id="wishlist-drawer-layer"
            >
              {/* Header */}
              <div className="p-4 border-b border-sand/40 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-moss/5 border border-moss/10 rounded">
                    <Heart className="w-5 h-5 text-moss fill-moss animate-pulse" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-serif text-lg font-bold text-[#1C2333]">Your Saved Journey Pieces</h3>
                    <span className="text-xs text-[#B5652F] font-mono italic">Keep wanderings in mind</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="p-1.5 hover:bg-sand/20 rounded text-stone-550 hover:text-stone-955 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {wishlist.length === 0 ? (
                  <div className="text-center py-20 space-y-4 flex flex-col items-center">
                    <Heart className="w-12 h-12 text-linen/60 stroke-[1]" />
                    <h4 className="font-serif text-lg font-medium text-[#1C2333]">Your wishlist is empty</h4>
                    <p className="text-linen/50 text-xs max-w-xs font-light leading-relaxed">
                      Save slow travel coordinate designs for your upcoming routes. They will stay saved during your active session.
                    </p>
                    <button
                      onClick={() => setIsWishlistOpen(false)}
                      className="px-4 py-2 bg-[#1C2333] text-[#D9CBB0] rounded text-xs font-mono uppercase tracking-wider hover:bg-[#283144] transition cursor-pointer"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 block">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#5A6351] font-bold block mb-2 text-left">Saved creations ({wishlist.length})</span>
                    <div className="space-y-3">
                      {wishlist.map(id => {
                        const prd = products.find(p => p.id === id);
                        if (!prd) return null;
                        return (
                          <div 
                            key={prd.id}
                            className="bg-white p-3 rounded-lg border border-sand/40 flex gap-3 items-center"
                          >
                            <img 
                              src={getDirectImageUrl(prd.images?.[0]) || null} 
                              alt={prd.name} 
                              className="w-16 h-16 object-contain p-1 bg-[#f0eae1] rounded border border-sand/40 cursor-pointer"
                              onClick={() => {
                                setSelectedProduct(prd);
                                setIsWishlistOpen(false);
                                setActiveImgIdx(0);
                              }}
                            />
                            <div className="flex-1 space-y-1 text-left">
                              <h5 
                                className="font-serif font-bold text-[#1C2333] text-sm line-clamp-1 hover:underline cursor-pointer"
                                onClick={() => {
                                  handleOpenProductDetails(prd);
                                  setIsWishlistOpen(false);
                                  setActiveImgIdx(0);
                                }}
                              >
                                {prd.name}
                              </h5>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-stone-450 uppercase">
                                <span className="text-moss font-bold">{prd.category}</span>
                                <span>•</span>
                                <span className="font-semibold text-ink">₹{Math.round(prd.price || 0).toLocaleString("en-IN")}</span>
                              </div>
                              <div className="flex items-center gap-2 pt-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    addToCart(prd, "M"); // default size
                                    setIsWishlistOpen(false);
                                    handleOpenCheckout();
                                  }}
                                  className="px-2.5 py-1 bg-moss text-linen text-[10px] font-mono uppercase tracking-wider rounded-sm hover:bg-moss/90 transition cursor-pointer"
                                >
                                  Quick Pack (M)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedProduct(prd);
                                    setIsWishlistOpen(false);
                                    setActiveImgIdx(0);
                                  }}
                                  className="px-2.5 py-1 bg-[#1C2333] text-linen text-[10px] font-mono uppercase tracking-wider rounded-sm hover:bg-[#283144] transition cursor-pointer"
                                >
                                  View Page
                                </button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleWishlist(prd.id, prd.name)}
                              className="p-2 hover:bg-red-50 text-linen/40 hover:text-red-650 rounded transition cursor-pointer"
                              title="Remove from wishlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 2.5: DELETE PRODUCT CONFIRMATION MODAL */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border border-sand/40 rounded-2xl p-6 sm:p-8 max-w-md w-full z-10 space-y-6 shadow-xl"
              id="delete-product-confirm-modal"
            >
              <button
                onClick={() => setProductToDelete(null)}
                className="absolute top-4 right-4 p-1.5 rounded hover:bg-sand/20 text-linen/40 hover:text-ink transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-650 mx-auto flex items-center justify-center">
                  <Trash2 className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="font-serif text-xl font-bold text-ink">
                  Retire Concept Design?
                </h4>
                <p className="text-linen/60 text-sm font-light leading-relaxed">
                  Are you absolutely sure you want to permanently delete the apparel design for <strong className="font-medium text-stone-800">{productToDelete.name}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-2.5 border border-sand text-ink/80 bg-white hover:bg-linen/20 rounded-lg text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteProduct}
                  className="flex-1 py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow-sm transition cursor-pointer"
                  id="confirm-delete-btn"
                >
                  Retire Design
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 3: AUTHENTICATION ENTRANCE MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border border-[#1C2333]/20 shadow-2xl rounded-2xl p-6 sm:p-8 max-w-md w-full z-10 space-y-5 text-[#1C2333]"
              id="auth-credentials-modal"
            >
              <button
                onClick={() => { setShowAuthModal(false); resetAuthForm(); }}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#1C2333]/10 text-[#1C2333]/60 hover:text-[#1C2333] transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#1C2333]/10 text-[#1C2333] mx-auto flex items-center justify-center">
                  <UserIcon className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#1C2333]">
                  {authMode === "login" ? "Account Sign In" : "Create New Account"}
                </h4>
                <p className="text-[#1C2333]/70 text-xs font-medium">
                  {authMode === "login" 
                    ? "Sign in to save items to bag, manage wishlist, and checkout" 
                    : "Create an account to track orders and save your favorite styles"
                  }
                </p>
              </div>

              {/* Login / Register Tab Switcher */}
              <div className="flex bg-[#FAF9F5] p-1 rounded-xl border border-[#1C2333]/20">
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); resetAuthForm(); }}
                  className={`flex-1 py-2 text-xs font-mono uppercase font-bold tracking-wider rounded-lg transition cursor-pointer ${
                    authMode === "login" 
                      ? "bg-[#1C2333] text-[#FAF9F5] shadow-xs" 
                      : "text-[#1C2333]/70 hover:text-[#1C2333]"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("register"); resetAuthForm(); }}
                  className={`flex-1 py-2 text-xs font-mono uppercase font-bold tracking-wider rounded-lg transition cursor-pointer ${
                    authMode === "register" 
                      ? "bg-[#1C2333] text-[#FAF9F5] shadow-xs" 
                      : "text-[#1C2333]/70 hover:text-[#1C2333]"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {authSuccess && (
                <div className="p-3 bg-moss/10 text-moss text-xs font-bold border border-moss/20 rounded-lg font-mono">
                  {authSuccess}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4" autoComplete="off">
                
                {authMode === "register" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C2333] block">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter full name"
                        autoComplete="off"
                        value={authForm.name}
                        onChange={(e) => handleAuthInputChange("name", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#1C2333]/15 rounded-lg text-sm text-[#1C2333] font-medium placeholder-[#1C2333]/40 focus:outline-none focus:border-[#1C2333] focus:ring-1 focus:ring-[#1C2333]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C2333] block">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Enter phone number"
                        autoComplete="off"
                        value={authForm.phone}
                        onChange={(e) => handleAuthInputChange("phone", e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#1C2333]/30 rounded-lg text-sm text-[#1C2333] font-medium placeholder-[#1C2333]/40 focus:outline-none focus:border-[#1C2333] focus:ring-1 focus:ring-[#1C2333]"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C2333] block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    autoComplete="off"
                    value={authForm.email}
                    onChange={(e) => handleAuthInputChange("email", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#1C2333]/30 rounded-lg text-sm text-[#1C2333] font-medium placeholder-[#1C2333]/40 focus:outline-none focus:border-[#1C2333] focus:ring-1 focus:ring-[#1C2333]"
                  />
                </div>

                {isTargetAdminEmail(authForm.email) && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C2333]">
                        Admin Password *
                      </label>
                      <span className="text-[10px] text-amber-800 font-mono font-bold">Protected Admin Account</span>
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authForm.password}
                      onChange={(e) => handleAuthInputChange("password", e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#1C2333]/30 rounded-lg text-sm text-[#1C2333] font-medium placeholder-[#1C2333]/40 focus:outline-none focus:border-[#1C2333] focus:ring-1 focus:ring-[#1C2333]"
                    />
                  </div>
                )}

                {(errorMessage || authError) && (
                  <p className="text-red-500 text-sm text-center font-medium">
                    {errorMessage || authError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1C2333] hover:bg-[#283144] text-[#FAF9F5] text-xs font-mono uppercase tracking-widest font-bold rounded-lg transition duration-300 cursor-pointer shadow-sm hover:shadow"
                  id="auth-submit-btn"
                >
                  {authMode === "login" ? "Sign In with Email" : "Create Account"}
                </button>
              </form>



            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 4: RELEASE / EDIT APPAREL FORM (ADMIN MODAL) */}
      <AnimatePresence>
        {isAddProductOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddProductOpen(false); setEditingProduct(null); }}
              className="absolute inset-0 bg-ink/60 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white border border-sand/40 rounded-2xl p-6 sm:p-8 max-w-2xl w-full z-10 space-y-4 max-h-[90vh] overflow-y-auto"
              id="admin-product-modal"
            >
              <button
                onClick={() => { setIsAddProductOpen(false); setEditingProduct(null); }}
                className="absolute top-4 right-4 p-1.5 rounded hover:bg-sand/20 text-linen/40 hover:text-ink transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b pb-2 flex items-center gap-2">
                <div className="p-1 px-2.5 bg-moss text-linen font-mono rounded text-xs uppercase tracking-wide">
                  {editingProduct ? "Specs editor" : "Apparel Creation Blueprint"}
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  {editingProduct ? `Edit '${editingProduct.name}' specs` : "Compile New Apparel Concept"}
                </h3>
              </div>

              {productFormError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 rounded font-mono">
                  {productFormError}
                </div>
              )}

              <form onSubmit={handleAddOrEditProduct} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-linen/50">Apparel Name Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 'Lost Ocean' Sea-washed Sweater"
                      value={newProductForm.name}
                      onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FAF9F5] border border-sand rounded text-xs focus:outline-none focus:border-moss/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-linen/50">Retail price tag (₹ INR)</label>
                    <input
                      type="number"
                      required
                      step="1"
                      placeholder="650"
                      value={newProductForm.price}
                      onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FAF9F5] border border-sand rounded text-xs focus:outline-none focus:border-moss/30 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-linen/50">Fulfillment Category</label>
                    <select
                      value={newProductForm.category}
                      onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FAF9F5] border border-sand rounded text-xs focus:outline-none focus:border-moss/30"
                    >
                      <option value="T-Shirts">T-Shirts</option>
                      <option value="Outerwear">Outerwear</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-linen/50">Initial Stock Volume</label>
                    <input
                      type="number"
                      required
                      placeholder="15"
                      value={newProductForm.stock}
                      onChange={(e) => setNewProductForm({ ...newProductForm, stock: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FAF9F5] border border-sand rounded text-xs focus:outline-none focus:border-moss/30 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-linen/50">Primary Color Tone</label>
                    <input
                      type="text"
                      placeholder="Sandy Beige"
                      value={newProductForm.color}
                      onChange={(e) => setNewProductForm({ ...newProductForm, color: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FAF9F5] border border-sand rounded text-xs focus:outline-none focus:border-moss/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-linen/50">Basic Fabric Description Segment</label>
                  <textarea
                    rows={2}
                    placeholder="Describe organic combed fiber specifications..."
                    value={newProductForm.description}
                    onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#FAF9F5] border border-sand rounded text-xs focus:outline-none focus:border-moss/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-linen/50">Inspirational Story behind this Creation</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g., Induced by majestic pine heights off the cold fjords..."
                    value={newProductForm.inspiration}
                    onChange={(e) => setNewProductForm({ ...newProductForm, inspiration: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#FAF9F5] border border-sand rounded text-xs focus:outline-none focus:border-moss/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-linen/50">Available size points (comma list)</label>
                    <input
                      type="text"
                      placeholder="S, M, L, XL"
                      value={newProductForm.sizes}
                      onChange={(e) => setNewProductForm({ ...newProductForm, sizes: e.target.value })}
                      className="w-full px-3 py-1.5 bg-[#FAF9F5] border border-sand rounded text-xs focus:outline-none focus:border-moss/30 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-linen/50">Vibe Keywords tags (comma list)</label>
                    <input
                      type="text"
                      placeholder="mountain, peace, minimalist"
                      value={newProductForm.tags}
                      onChange={(e) => setNewProductForm({ ...newProductForm, tags: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-sand rounded px-3 py-1.5 text-xs focus:outline-none focus:border-moss/30 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-1">
                    <label className="text-xs font-mono font-bold text-linen/50">Apparel Image Links ({newProductForm.images.length})</label>
                    <button
                      type="button"
                      onClick={() => {
                        setNewProductForm(prev => ({
                          ...prev,
                          images: [...prev.images, ""]
                        }));
                      }}
                      className="px-2 py-1 text-[10px] bg-linen/40 hover:bg-sand/30 border border-sand text-ink/80 font-semibold rounded transition font-mono flex items-center gap-1 cursor-pointer"
                    >
                      + Add Image Link
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {newProductForm.images.map((imgUrl, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-[10px] text-linen/40 font-mono w-4">#{index + 1}</span>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/..."
                          value={imgUrl}
                          onChange={(e) => {
                            const updated = [...newProductForm.images];
                            updated[index] = e.target.value;
                            setNewProductForm({ ...newProductForm, images: updated });
                          }}
                          className="flex-1 px-3 py-1.5 bg-[#FAF9F5] border border-sand rounded text-xs focus:outline-none focus:border-moss/30 text-[10px] font-mono"
                        />
                        {newProductForm.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = newProductForm.images.filter((_, i) => i !== index);
                              setNewProductForm({ ...newProductForm, images: updated });
                            }}
                            className="p-1.5 text-linen/40 hover:text-red-600 rounded hover:bg-sand/20 transition cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={newProductForm.featured}
                    onChange={(e) => setNewProductForm({ ...newProductForm, featured: e.target.checked })}
                    className="rounded accent-moss"
                  />
                  <label htmlFor="featured" className="text-xs font-mono text-linen/50 cursor-pointer">
                    Promote to high-visibility "Highly Desired Featured Grid"
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-moss hover:bg-moss-hover text-linen text-xs font-bold rounded-lg tracking-wider uppercase transition cursor-pointer"
                  id="admin-product-submit"
                >
                  {editingProduct ? "Save Modified specifications" : "Publish to Explorer Storefront"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BUILD YOUR CAPSULE STICKY BOTTOM BAR */}
      <AnimatePresence>
        {capsuleItems.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed bottom-0 inset-x-0 z-40 bg-[#1C2333] border-t border-[#D9CBB0]/30 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] text-[#F5F0E8] font-sans pb-safe"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Header and counter */}
              <div className="flex flex-col text-center md:text-left space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D9CBB0] animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D9CBB0] font-bold">
                    CURATING YOUR TRAVEL CAPSULE
                  </span>
                </div>
                <h4 className="font-serif text-lg sm:text-xl font-light text-linen">
                  The {capsuleItems.length} Piece Outfit {capsuleItems.length === 3 ? "(Ideal Weight)" : capsuleItems.length === 2 ? "(Add 1 More)" : "(Add 2 More)"}
                </h4>
                <p className="text-[10px] text-linen/60 font-mono">
                  Select sizes for each custom piece below.
                </p>
              </div>

              {/* Selected garment thumbnails with size selectors */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                {capsuleItems.map((itm) => (
                  <div 
                    key={itm.product.id}
                    className="flex items-center gap-3 bg-[#283144] border border-[#D9CBB0]/10 rounded-sm p-2 pr-3.5 relative group hover:border-[#D9CBB0]/30 transition"
                  >
                    {/* Small thumbnail */}
                    <div className="w-12 h-16 bg-dust rounded-xs overflow-hidden relative shrink-0">
                      <img 
                        src={getDirectImageUrl(itm.product.images?.[0]) || null} 
                        alt={itm.product.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Garment details + size switcher */}
                    <div className="flex flex-col text-left space-y-1 min-w-[100px]">
                      <span className="text-xs font-serif truncate max-w-[110px] text-linen font-medium block">
                        {itm.product.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#D9CBB0]">
                        ₹{Math.round(itm.product.price).toLocaleString("en-IN")}
                      </span>
                      
                      {/* Mini size selector */}
                      <div className="flex gap-1 pt-1">
                        {["S", "M", "L", "XL"].map((sz) => {
                          const isAvailable = (itm.product.sizes || []).includes(sz);
                          const isSelected = itm.size === sz;
                          return (
                            <button
                              key={sz}
                              disabled={!isAvailable}
                              onClick={() => updateCapsuleItemSize(itm.product.id, sz)}
                              className={`w-5 h-5 text-[8px] font-mono uppercase transition-all rounded-xs flex items-center justify-center cursor-pointer select-none ${
                                isSelected
                                  ? "bg-[#D9CBB0] text-[#1C2333] font-black"
                                  : isAvailable
                                  ? "bg-[#1C2333] text-linen/70 hover:bg-[#2E3A52]"
                                  : "bg-transparent text-linen/20 line-through cursor-not-allowed"
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => toggleCapsuleItem(itm.product)}
                      className="absolute -top-1.5 -right-1.5 p-1 bg-black/60 hover:bg-black text-linen hover:text-white rounded-full transition cursor-pointer"
                      title="Remove piece"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Placeholders to guide the user to make 3 items */}
                {Array.from({ length: 3 - capsuleItems.length }).map((_, index) => (
                  <div 
                    key={index}
                    className="hidden sm:flex items-center justify-center w-[160px] h-[72px] border border-dashed border-[#D9CBB0]/15 bg-[#1C2333]/40 rounded-sm text-center"
                  >
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#D9CBB0]/30">
                      Empty Slot {capsuleItems.length + index + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Running total price & checkout button */}
              <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t border-[#D9CBB0]/10 md:border-none pt-4 md:pt-0">
                <div className="text-right">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#D9CBB0] block">
                    CAPSULE ESTIMATE
                  </span>
                  <span className="text-xl sm:text-2xl font-serif text-linen tracking-tight">
                    ₹{Math.round(capsuleItems.reduce((sum, itm) => sum + itm.product.price, 0)).toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  onClick={() => {
                    // Add all pieces to the cart
                    capsuleItems.forEach((itm) => {
                      addToCart(itm.product, itm.size);
                    });
                    // Open checkout slide tray
                    handleOpenCheckout();
                    // Clear selected capsule items
                    setCapsuleItems([]);
                    // Show a wonderful success alert/toast
                    setWishlistToast("Travel Capsule successfully packed & integrated!");
                    setTimeout(() => setWishlistToast(null), 3000);
                  }}
                  className="px-6 py-4 bg-[#D9CBB0] hover:bg-[#C0B195] text-[#1C1C1A] text-xs font-mono uppercase tracking-widest font-black transition-all duration-300 rounded-none shadow-md flex items-center gap-2 select-none cursor-pointer"
                >
                  <span>Complete Your Capsule</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 10. FEATURE MODALS */}
      <OrderManagementModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        orders={orderRecords}
        onUpdateOrders={(newOrders) => setOrderRecords(newOrders)}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        productCategory={selectedProduct?.category || "Loomed Shirts"}
      />

      <NotifyMeModal
        isOpen={isNotifyMeOpen}
        onClose={() => setIsNotifyMeOpen(false)}
        productName={selectedProduct?.name || "Loomed Garment"}
      />

      {/* FLOATING BOTTOM CONSOLE LAUNCHER */}
      <AIConsole
        isOpen={isAIConsoleOpen}
        onClose={() => setIsAIConsoleOpen(false)}
        cartItems={cart}
        activeProductId={selectedProduct?.id}
      />

      {/* FLOATING WHATSAPP CUSTOMER SUPPORT WIDGET */}
      {cmsConfig?.whatsappSupportEnabled !== false && activeTab !== "merchant" && (
        <a
          href={`https://wa.me/${(cmsConfig?.whatsappNumber || "919999999999").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
            cmsConfig?.whatsappDefaultMessage || "Hello! I need customer support regarding my order from the website."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-6 z-40 bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all transform hover:scale-105 flex items-center gap-2 group cursor-pointer"
          title="Chat on WhatsApp with Customer Support"
          id="floating-whatsapp-support-btn"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-serif font-bold tracking-wide">
            Support Chat
          </span>
        </a>
      )}



      </div>
    </div>
  );
}

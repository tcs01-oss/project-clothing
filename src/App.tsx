import React, { useState, useEffect, useMemo } from "react";
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
import { Product, CartItem, Order, Coupon, AnalyticsSummary, User } from "./types";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import heroBgImage from "./assets/images/regenerated_image_1782751057651.png";
import { getDirectImageUrl, getDirectVideoUrl } from "./utils";

export function VartmanLogo({ className = "w-10 h-10" }: { className?: string }) {
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
  },
  {
    id: "graphic-prints",
    title: "Graphic Prints",
    description: "Artistic expressions, minimalist typography, and organic botanical-pigment prints.",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
    searchKeyword: "graphic",
  },
  {
    id: "classic-basics",
    title: "Classic Basics",
    description: "The daily luxury. Clean-cut, premium crewnecks crafted from single-origin organic cotton.",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    searchKeyword: "basic",
  },
  {
    id: "heavyweight-tees",
    title: "Heavyweight Tees",
    description: "Substantial premium fabric with a structured, durable drape designed to last lifetimes.",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
    searchKeyword: "heavyweight",
  },
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
  const [activeTab, setActiveTab] = useState<"store" | "merchant" | "story" | "shipping" | "faq" | "about" | "materials" | "privacy" | "terms" | "account" | "order-confirmation" | "men" | "women">("store");
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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Auth Form Toggles
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    isAdminRegister: false
  });
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Pathname routing synchronization
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === "/collections/men") {
        setActiveTab("men");
        setSelectedProduct(null);
      } else if (path === "/collections/women") {
        setActiveTab("women");
        setSelectedProduct(null);
      } else if (path === "/") {
        setActiveTab("store");
      }
    };
    
    // Check on initial load
    handleLocationChange();
    
    // Check on popstate navigation
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const navigateTo = (tabName: typeof activeTab, path: string) => {
    window.history.pushState(null, "", path);
    setActiveTab(tabName);
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [cmsConfig, setCmsConfig] = useState(() => {
    const localCms = localStorage.getItem("vartman_cms_config");
    const defaults = {
      announcementText: "Engineered for the Modern Nomad | Free Worldwide Shipping on orders over ₹12,000",
      heroImageUrl: "https://drive.google.com/file/d/160x326UcArS1sSk4t5VoEikEl6X3ay6b/view?usp=drive_link",
      heroImageUrlMobile: "https://drive.google.com/file/d/160x326UcArS1sSk4t5VoEikEl6X3ay6b/view?usp=drive_link",
      heroTitle: "Wear the Moment.",
      heroSubtitle: "Travel clothing made for the emotional experience of the journey — not just the distance.",
      heroCtaText: "Explore Collection",
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
        return { ...defaults, ...parsed };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  const categoriesList = cmsConfig?.categories && cmsConfig.categories.length > 0 ? cmsConfig.categories : CATEGORIES_DATA;

  // Store lists
  const [products, setProducts] = useState<Product[]>([]);
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
  const [cart, setCart] = useState<CartItem[]>([]);
  
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
  const apiMinPrice = urlParams.get("minPrice");
  const apiMaxPrice = urlParams.get("maxPrice");

  const hasActiveApiFilters = useMemo(() => {
    return !!(apiCategory || apiColor || apiSize || apiGender || apiTags || apiMinPrice || apiMaxPrice);
  }, [apiCategory, apiColor, apiSize, apiGender, apiTags, apiMinPrice, apiMaxPrice]);
  const [waitlistStatus, setWaitlistStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({ type: "idle" });
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("vartman_wishlist");
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
    localStorage.setItem("vartman_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId: string, productName: string) => {
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

  // Selected Detail View
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pdpPromoCode, setPdpPromoCode] = useState<string>("");
  const [pdpPromoDiscount, setPdpPromoDiscount] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedShirtSize, setSelectedShirtSize] = useState<string>("M");
  const [selectedTrouserSize, setSelectedTrouserSize] = useState<string>("M");
  const [selectedComboIdx, setSelectedComboIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedProduct) {
      setPdpPromoCode("");
      setPdpPromoDiscount(0);
    }
  }, [selectedProduct]);
  const [activeImgIdx, setActiveImgIdx] = useState<number>(0);
  const [activeVariant, setActiveVariant] = useState<any>(null);
  const [pdpTab, setPdpTab] = useState<"details" | "origin" | "care">("details");
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
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
    email: "customer@vartmangarments.com",
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
  const [paymentPublicConfig, setPaymentPublicConfig] = useState<{ prepaidEnabled: boolean; codEnabled: boolean }>({
    prepaidEnabled: true,
    codEnabled: true
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    fetch("/api/payments/config")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setPaymentPublicConfig({
            prepaidEnabled: data.prepaidEnabled ?? true,
            codEnabled: data.codEnabled ?? true
          });
          if (data.prepaidEnabled === false && data.codEnabled !== false) {
            setPaymentOption("cod");
          } else if (data.codEnabled === false && data.prepaidEnabled !== false) {
            setPaymentOption("prepaid");
          }
        }
      })
      .catch(() => {});
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
                const localOrdersStr = localStorage.getItem("vartman_custom_orders");
                const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];
                localOrders.push(confirmedOrder);
                localStorage.setItem("vartman_custom_orders", JSON.stringify(localOrders));
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

  // Bootstrap initial items and read storage caches
  useEffect(() => {
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

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        const validData = Array.isArray(data) ? data.filter((p: any) => p && p.name && p.price && p.id !== "writeTest") : [];
        setProducts(validData);
        localStorage.setItem("vartman_cached_products", JSON.stringify(validData));
        return;
      }
    } catch (e) {
      console.error("Unable to gather products list from Firestore, trying cache...", e);
    }

    // Fallback to localStorage if Firestore fetch fails
    const localProductsStr = localStorage.getItem("vartman_cached_products");
    if (localProductsStr) {
      try {
        const parsed = JSON.parse(localProductsStr);
        const validParsed = Array.isArray(parsed) ? parsed.filter((p: any) => p && p.name && p.price && p.id !== "writeTest") : [];
        setProducts(validParsed);
      } catch (e) {
        console.error("Failed to parse cached products", e);
      }
    }
  };

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
        localStorage.setItem("vartman_cached_orders", JSON.stringify(data));
        return;
      }
    } catch (e) {
      console.error("Unable to gather order history from Firestore, trying cache...", e);
    }

    // Fallback to localStorage if Firestore fetch fails
    const localOrdersStr = localStorage.getItem("vartman_cached_orders");
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
      }
    } catch (e) {
      console.error("Unable to compile analytics ledger.", e);
    }
  };

  const fetchCms = async () => {
    try {
      const res = await fetch("/api/cms");
      if (res.ok) {
        const data = await res.json();
        setCmsConfig(data);
        localStorage.setItem("vartman_cms_config", JSON.stringify(data));
        return;
      }
    } catch (e) {
      console.error("Failed to fetch CMS from Firestore, using local fallback...", e);
    }

    // Fallback to localStorage if Firestore fetch fails
    const localCms = localStorage.getItem("vartman_cms_config");
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
      }
    } catch (e) {
      console.error("Unable to gather CRM customers registry.", e);
    }
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

  // --- Auth API Actions ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

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
          throw new Error(data.error || "Login credential mismatch");
        }

        setAuthToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem("terrawander_token", data.token);
        localStorage.setItem("terrawander_user", JSON.stringify(data.user));
        
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

        setAuthSuccess(`Welcome, traveler ${data.user.name}! Connected.`);
        setTimeout(() => {
          setShowAuthModal(false);
          setAuthForm(prev => ({ ...prev, password: "" }));
        }, 1200);

      } catch (err: any) {
        setAuthError(err.message || "Auth channel failure.");
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

        setAuthSuccess("Wanderer Profile Established successfully! Exploring.");
        setTimeout(() => {
          setShowAuthModal(false);
          fetchOrders();
        }, 1200);

      } catch (err: any) {
        setAuthError(err.message || "Registration denied.");
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

  const shippingCost = cartSubtotal > 8500 || cartSubtotal === 0 ? 0 : 723;
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
          const localOrdersStr = localStorage.getItem("vartman_custom_orders");
          const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];
          localOrders.push(data);
          localStorage.setItem("vartman_custom_orders", JSON.stringify(localOrders));
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
            const localOrdersStr = localStorage.getItem("vartman_custom_orders");
            const localOrders = localOrdersStr ? JSON.parse(localOrdersStr) : [];
            localOrders.push(confirmedOrder);
            localStorage.setItem("vartman_custom_orders", JSON.stringify(localOrders));
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
        try {
          if (editingProduct) {
            // Update in Added Products
            const localAddedStr = localStorage.getItem("vartman_added_products");
            const localAdded: Product[] = localAddedStr ? JSON.parse(localAddedStr) : [];
            const addedIdx = localAdded.findIndex(p => p.id === savedProduct.id);
            if (addedIdx !== -1) {
              localAdded[addedIdx] = savedProduct;
              localStorage.setItem("vartman_added_products", JSON.stringify(localAdded));
            } else {
              // Save to Updated Products
              const localUpdatedStr = localStorage.getItem("vartman_updated_products");
              const localUpdated: Product[] = localUpdatedStr ? JSON.parse(localUpdatedStr) : [];
              const updIdx = localUpdated.findIndex(p => p.id === savedProduct.id);
              if (updIdx !== -1) {
                localUpdated[updIdx] = savedProduct;
              } else {
                localUpdated.push(savedProduct);
              }
              localStorage.setItem("vartman_updated_products", JSON.stringify(localUpdated));
            }
          } else {
            // Save to Added Products list
            const localAddedStr = localStorage.getItem("vartman_added_products");
            const localAdded: Product[] = localAddedStr ? JSON.parse(localAddedStr) : [];
            localAdded.push(savedProduct);
            localStorage.setItem("vartman_added_products", JSON.stringify(localAdded));
          }
        } catch (e) {
          console.error("Local product backup failed", e);
        }

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
        try {
          // If it was a custom added product, remove it from localAdded
          const localAddedStr = localStorage.getItem("vartman_added_products");
          const localAdded: Product[] = localAddedStr ? JSON.parse(localAddedStr) : [];
          const filteredAdded = localAdded.filter(p => p.id !== productToDelete.id);
          localStorage.setItem("vartman_added_products", JSON.stringify(filteredAdded));

          // Also clean from localUpdated if present
          const localUpdatedStr = localStorage.getItem("vartman_updated_products");
          const localUpdated: Product[] = localUpdatedStr ? JSON.parse(localUpdatedStr) : [];
          const filteredUpdated = localUpdated.filter(p => p.id !== productToDelete.id);
          localStorage.setItem("vartman_updated_products", JSON.stringify(filteredUpdated));

          // Save to Deleted Products list
          const localDeletedStr = localStorage.getItem("vartman_deleted_product_ids");
          const localDeleted: string[] = localDeletedStr ? JSON.parse(localDeletedStr) : [];
          if (!localDeleted.includes(productToDelete.id)) {
            localDeleted.push(productToDelete.id);
            localStorage.setItem("vartman_deleted_product_ids", JSON.stringify(localDeleted));
          }
        } catch (e) {
          console.error("Local delete tracking failed", e);
        }

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
        try {
          const localStatusStr = localStorage.getItem("vartman_updated_order_status");
          const localStatus = localStatusStr ? JSON.parse(localStatusStr) : {};
          localStatus[orderId] = status;
          localStorage.setItem("vartman_updated_order_status", JSON.stringify(localStatus));
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
      const data = await res.ok ? await res.json() : { text: "Error syncing with Gemini intelligence clusters." };
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
    // newest: we keep the catalog order
    return list;
  }, [filteredProducts, sortBy]);

  const uniqueTagsList = ["organic", "handloom", "minimal", "botanical", "unstructured"];
  const uniqueCategoriesList = ["Loomed Shirts", "Loomed Pants", "Artisan Robes", "Artisan Coats", "Men's T-Shirts", "Women's T-Shirts", "Shirt & Pant Combo", "LOOMED CO-ORD SETS", "SHIRT & TROUSER COMBO"];

  const isTransparent = activeTab === "store" && !selectedProduct && !scrolled && !isHeaderHovered;

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

  return (
    <div className="min-h-screen bg-[#0B0D12] text-earth selection:bg-moss/20 selection:text-ink font-sans flex flex-col antialiased relative">
      {/* Fixed Full-Viewport Background Layer - Dark Textured Reference Image */}
      <div 
        className="fixed inset-0 pointer-events-none z-[-10]"
        style={{
          backgroundImage: `url("/src/assets/images/dark_textured_bg_1783427663751.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />

      {/* Scrollable Content Layer */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Styled Responsive Branding Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 flex flex-col ${
          isTransparent 
            ? "bg-transparent border-b border-transparent/10" 
            : "bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-md"
        }`}
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
        id="brand-header"
      >
        {/* Top Brand Banner - moved inside header so it stays fixed with the header */}
        <div className={`transition-all duration-300 py-1.5 text-[11px] font-mono tracking-[0.15em] border-b select-none relative z-40 uppercase overflow-hidden whitespace-nowrap ${
          isTransparent
            ? "bg-black/20 text-white/90 border-white/5"
            : "bg-ink text-sand border-ink/5"
        }`}>
          <motion.div 
            className="flex gap-16 min-w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              ease: "linear",
              duration: 20,
              repeat: Infinity,
            }}
          >
            {[...Array(6)].map((_, idx) => (
              <span key={idx} className="inline-block px-4 shrink-0">
                {cmsConfig.announcementText}
              </span>
            ))}
          </motion.div>
        </div>

        <div className={`max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
          isTransparent ? "py-5" : "py-3"
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
                }`}>vartman</span>
                <span className={`block text-[8px] sm:text-[9px] font-mono tracking-widest uppercase transition-colors duration-300 ${
                  isTransparent ? "text-white/60" : "text-earth/60"
                }`}>The Present</span>
              </div>
            </button>
          </div>

          {/* Navigation link elements */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
            <button
              onClick={() => navigateTo("store", "/")}
              className={`text-xs uppercase tracking-[0.12em] xl:tracking-[0.15em] transition pb-1 border-b font-medium transition-colors duration-300 ${
                activeTab === "store" 
                  ? (isTransparent ? "border-white text-white" : "border-moss text-ink") 
                  : (isTransparent ? "border-transparent text-white/70 hover:text-white" : "border-transparent text-earth/70 hover:text-ink")
              }`}
              id="nav-store"
            >
              Collections
            </button>
            {currentUser?.role === "admin" && (
              <button
                onClick={() => {
                  setActiveTab("merchant");
                }}
                className={`flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] xl:tracking-[0.15em] transition px-3 py-1.5 rounded-sm font-medium transition-colors duration-300 ${
                  activeTab === "merchant" 
                    ? (isTransparent ? "bg-white/20 text-white border border-white/30" : "bg-sand/35 text-ink border border-terrain") 
                    : (isTransparent ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-earth/70 hover:bg-sand/20 hover:text-ink")
                }`}
                id="nav-merchant"
              >
                <Unlock className="w-3.5 h-3.5 text-moss" />
                <span>Console</span>
              </button>
            )}
          </nav>

          {/* User Context & Bag Badges */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="hidden sm:block text-right">
              <span className={`block text-[9px] font-mono uppercase tracking-wider transition-colors duration-300 ${
                isTransparent ? "text-white/50" : "text-earth/50"
              }`}>Account</span>
              <button 
                onClick={() => currentUser ? handleLogout() : setShowAuthModal(true)} 
                className={`text-xs font-medium pt-0.5 block hover:underline transition-colors duration-300 ${
                  isTransparent ? "text-white" : "text-moss"
                }`}
                id="header-auth-trigger"
              >
                {currentUser ? `Sign Out (${currentUser.name.split(" ")[0]})` : "Connect Account"}
              </button>
            </div>
            <button
              onClick={() => currentUser ? handleLogout() : setShowAuthModal(true)}
              className={`p-2 sm:hidden rounded-full transition transition-colors duration-300 ${
                isTransparent
                  ? "text-white/70 hover:text-white hover:bg-white/10"
                  : "text-earth/60 hover:text-ink hover:bg-sand/20"
              }`}
              title={currentUser ? "Log Out" : "Log In"}
            >
              <UserIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsWishlistOpen(true)}
              className={`relative p-2 sm:p-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md ${
                isTransparent
                  ? "bg-white/10 text-white border border-white/20 hover:border-white/50"
                  : "bg-linen text-ink border border-terrain hover:border-earth"
              }`}
              id="header-wishlist-btn"
              title="Your Wishlist"
            >
              <Heart className={`w-4 h-4 transition-colors duration-300 ${wishlist.length > 0 ? "fill-moss text-moss" : ""}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-moss text-linen text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold tracking-tight">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className={`relative p-2 sm:p-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md ${
                isTransparent
                  ? "bg-white/10 text-white border border-white/20 hover:border-white/50"
                  : "bg-linen text-ink border border-terrain hover:border-earth"
              }`}
              id="header-bag-btn"
            >
              <ShoppingBag className="w-4 h-4 transition-colors duration-300" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-moss text-linen text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold tracking-tight">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
            
            {/* AI Advisor Badge */}
            <button
              onClick={() => setIsAIConsoleOpen(true)}
              className="flex items-center gap-1.5 bg-moss text-linen p-2 sm:px-4 sm:py-2.5 rounded-full text-xs font-semibold tracking-wide hover:bg-earth transition shadow-sm hover:scale-102 duration-200 cursor-pointer"
              id="ai-concierge-toggle"
            >
              <Feather className="w-4 h-4 text-sand animate-pulse" />
              <span className="hidden sm:inline">Ask Scribe</span>
            </button>

            {/* Mobile Navigation Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 sm:p-2.5 lg:hidden rounded-full transition focus:outline-none transition-colors duration-300 ${
                isTransparent ? "text-white hover:text-white/80" : "text-earth/60 hover:text-ink"
              }`}
              id="mobile-menu-toggle"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Overlay Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[200] bg-dust/98 backdrop-blur-md flex flex-col justify-between p-8 lg:hidden text-ink overflow-y-auto"
            id="mobile-nav-panel-fullscreen"
          >
            {/* Header inside overlay */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-serif text-2xl font-bold tracking-[0.15em] text-ink uppercase">vartman</span>
                <span className="block text-[9px] text-earth/60 font-mono tracking-widest uppercase">The Present</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-earth/60 hover:text-ink rounded-full hover:bg-sand/20 transition focus:outline-none cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Centered Large Menu Items */}
            <div className="flex flex-col justify-center items-center gap-6 py-12 flex-1">
              {[
                { label: "collections", tab: "store", scrollId: null }
              ].map((item, idx) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (item.tab === "men") {
                      navigateTo("men", "/collections/men");
                    } else if (item.tab === "women") {
                      navigateTo("women", "/collections/women");
                    } else if (item.tab === "store") {
                      if (item.scrollId) {
                        setActiveTab("store");
                        setTimeout(() => {
                          document.getElementById(item.scrollId!)?.scrollIntoView({ behavior: "smooth" });
                        }, 150);
                      } else {
                        navigateTo("store", "/");
                      }
                    } else {
                      setActiveTab("story");
                    }
                  }}
                  className="font-serif text-[36px] font-normal lowercase tracking-tight hover:text-[#B5652F] transition duration-300 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (currentUser) {
                    handleLogout();
                  } else {
                    setAuthMode("login");
                    setAuthForm(prev => ({ ...prev, email: "admin@vartman.com" }));
                    setAuthError("Please connect using your credentials.");
                    setShowAuthModal(true);
                  }
                }}
                className="font-mono text-xs uppercase tracking-widest text-moss font-bold border border-moss/30 px-6 py-2.5 rounded-sm hover:bg-moss hover:text-linen transition mt-4 cursor-pointer"
              >
                {currentUser ? "Sign Out" : "Connect Account"}
              </button>

              {currentUser?.role === "admin" && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveTab("merchant");
                  }}
                  className="font-mono text-xs uppercase tracking-widest text-amber-600 font-bold border border-amber-600/30 px-6 py-2.5 rounded-sm hover:bg-amber-600 hover:text-linen transition mt-2 cursor-pointer"
                >
                  Console
                </button>
              )}
            </div>

            {/* Elegant Closing Footer inside Overlay */}
            <div className="text-center pt-6 border-t border-earth/10">
              <p className="text-sm text-earth italic font-serif leading-relaxed">
                "Wear the moment. Unhurried garments for unhurried journeys."
              </p>
              <p className="text-[9px] text-earth/50 font-mono uppercase tracking-widest mt-2">
                vartman · biological origin
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Layout Segment */}
      <main className="flex-1">

        {/* VIEW: MEN'S COLLECTION */}
        {activeTab === "men" && (
          <MensTshirtCollection
            products={products}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            wishlist={wishlist}
            setSelectedProduct={setSelectedProduct}
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
            setSelectedProduct={setSelectedProduct}
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
                      onClick={() => setSelectedProduct(null)}
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
                    onClick={() => setSelectedProduct(null)}
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
                          <span>{(selectedProduct.ratingAvg || selectedProduct.rating || 4.7).toFixed(1)}</span>
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500 animate-pulse" />
                        </div>
                        <span className="text-xs text-earth/50 font-mono">|</span>
                        <span className="text-[11px] text-earth/60 font-mono font-medium underline uppercase tracking-wider">
                          {selectedProduct.reviewsCount || 163} ratings
                        </span>
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
                      </div>



                      {selectedProduct.promoText && (
                        <div className="flex items-center gap-2 text-xs font-mono text-moss uppercase tracking-wider bg-moss/5 border border-moss/10 rounded-sm p-3 font-semibold mt-1">
                          <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-moss shrink-0 animate-pulse"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                          <span>{selectedProduct.promoText}</span>
                        </div>
                      )}

                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-moss"></span>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-moss font-bold">
                            {selectedProduct.productType === "Two-Piece Set" || (selectedProduct.name || "").toLowerCase().includes("set") || (selectedProduct.name || "").toLowerCase().includes("combo") || selectedProduct.category === "Shirt & Pant Combo"
                              ? "PANT & SHIRT COMBO SET"
                              : "Premium Coordinated Silhouette"}
                          </span>
                        </div>

                        <div className="border-l border-moss/30 pl-3 py-1.5 text-xs text-earth/70 font-mono tracking-wide">
                          {selectedProduct.productType === "Two-Piece Set" || (selectedProduct.name || "").toLowerCase().includes("set") || (selectedProduct.name || "").toLowerCase().includes("combo") || selectedProduct.category === "Shirt & Pant Combo" ? (
                            <ul className="space-y-1.5">
                              <li className="flex items-center gap-2">
                                <span className="text-[#B5652F] font-bold">•</span>
                                <span>Includes 1x Textured Camp Collar Shirt</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="text-[#B5652F] font-bold">•</span>
                                <span>Includes 1x Flowing Elasticated Trouser</span>
                              </li>
                            </ul>
                          ) : (
                            "Premium double-stitch craftsmanship designed for high tropical breathability"
                          )}
                        </div>
                      </div>
                    </div>



                    {/* SIZES CHIPS SELECTOR WITH NOTIFY ME */}
                    <div className="space-y-5 p-6 bg-sand/15 border border-[#1C2333]/15 rounded-sm">
                      <div className="flex items-center justify-between border-b border-[#1C2333]/10 pb-2">
                        <span className="text-[11px] uppercase font-mono font-bold tracking-widest text-[#1C2333] block">
                          Select Set Sizes
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

                      {/* Row 1: SELECT SHIRT SIZE */}
                      <div className="space-y-2.5 text-left">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-earth/70 font-semibold block">
                          SELECT SHIRT SIZE
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                          {["S", "M", "L", "XL"].map(sz => {
                            const isAvailable = (selectedProduct?.sizes || []).includes(sz);
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

                      {/* Row 2: SELECT TROUSER SIZE */}
                      <div className="space-y-2.5 text-left border-t border-[#1C2333]/5 pt-3">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-earth/70 font-semibold block">
                          SELECT TROUSER SIZE
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                          {["S", "M", "L", "XL"].map(sz => {
                            const isAvailable = (selectedProduct?.sizes || []).includes(sz);
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

                      {/* Notify Me Form segment */}
                      {["S", "M", "L", "XL"].map(sz => {
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
                          const sizeStr = selectedProduct.category === "Shirt & Pant Combo" || selectedProduct.productType === "Two-Piece Set" || (selectedProduct.name || "").toLowerCase().includes("set") || (selectedProduct.name || "").toLowerCase().includes("combo")
                            ? `Shirt: ${selectedShirtSize} / Trouser: ${selectedTrouserSize}`
                            : selectedSize;
                          addToCart(selectedProduct, sizeStr, currentVariantOrCombo);
                          setIsCheckoutOpen(true);
                        }}
                        className="w-full py-4 px-6 text-center text-xs font-mono uppercase tracking-widest bg-[#1C2333] hover:bg-[#283144] text-[#D9CBB0] hover:text-linen transition-all duration-300 rounded-sm select-none cursor-pointer flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg font-bold"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#D9CBB0]" />
                        <span>{selectedProduct.category === "Shirt & Pant Combo" || selectedProduct.productType === "Two-Piece Set" || (selectedProduct.name || "").toLowerCase().includes("set") || (selectedProduct.name || "").toLowerCase().includes("combo") ? "ADD COMBO TO BAG" : `Add chosen piece to bag (${selectedSize})`}</span>
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            toggleWishlist(selectedProduct.id, selectedProduct.name);
                          }}
                          className={`py-3 px-4 text-center text-[10px] font-mono uppercase tracking-widest border transition-all duration-300 rounded-sm select-none cursor-pointer flex items-center justify-center gap-2 ${
                            wishlist.includes(selectedProduct.id)
                              ? "bg-white border-[#B5652F] text-[#1C2333]"
                              : "bg-transparent border-terrain/40 text-earth hover:border-earth"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${wishlist.includes(selectedProduct.id) ? "fill-moss text-moss animate-pulse" : "text-earth/60"}`} />
                          <span>{wishlist.includes(selectedProduct.id) ? "Saved (Remove)" : "Save for Later"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const sizeStr = selectedProduct.category === "Shirt & Pant Combo" || selectedProduct.productType === "Two-Piece Set" || (selectedProduct.name || "").toLowerCase().includes("set") || (selectedProduct.name || "").toLowerCase().includes("combo")
                              ? `Shirt: ${selectedShirtSize} / Trouser: ${selectedTrouserSize}`
                              : selectedSize;
                            addToCart(selectedProduct, sizeStr, currentVariantOrCombo);
                            setIsCheckoutOpen(true);
                          }}
                          className="py-3 px-4 text-center text-[10px] font-mono uppercase tracking-widest border border-moss bg-moss text-linen hover:bg-moss/95 transition-all duration-300 rounded-sm select-none cursor-pointer flex items-center justify-center gap-2 font-bold"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-linen" />
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </div>

                    {/* Logistics, Shipping, and Pincode Check */}
                    <div className="space-y-4 pt-4 border-t border-[#1C2333]/15">
                      <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-earth/60">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-moss"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                        <span>
                          {(selectedProduct.sellingPrice || selectedProduct.price || 0) >= (selectedProduct.freeShippingThreshold ?? 3000) 
                            ? "Complimentary premium shipping included" 
                            : `Complimentary shipping on orders above ₹${(selectedProduct.freeShippingThreshold ?? 3000).toLocaleString("en-IN")}`}
                        </span>
                      </div>
                      
                      {/* ADVANCED LIVE DELIVERY WIDGET */}
                      <AdvancedDelivery brandName="Vartman Express Courier" />

                      {/* PDP TRUST BADGES */}
                      <TrustBadges />
                    </div>

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

                    {/* RATINGS & REVIEWS MODULE */}
                    <div className="pt-4 border-t border-[#1C2333]/15">
                      <SpecsGrid product={selectedProduct} onOpenAuth={() => setShowAuthModal(true)} currentUser={currentUser} />
                    </div>

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
                            setSelectedProduct(p); 
                            setActiveImgIdx(0); 
                            window.scrollTo({ top: 0, behavior: "smooth" }); 
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
                  <div className="mt-20 pt-12 border-t border-[#1C2333]/15 text-left">
                    <ReviewSection product={selectedProduct} />
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
                        const sizeStr = selectedProduct.category === "Shirt & Pant Combo" || selectedProduct.productType === "Two-Piece Set" || (selectedProduct.name || "").toLowerCase().includes("set") || (selectedProduct.name || "").toLowerCase().includes("combo")
                          ? `Shirt: ${selectedShirtSize} / Trouser: ${selectedTrouserSize}`
                          : selectedSize;
                        addToCart(selectedProduct, sizeStr, currentVariantOrCombo);
                      }}
                      className="flex-1 py-2.5 bg-white border border-[#1C2333] hover:bg-[#FAF9F5] text-ink text-[10px] font-mono uppercase tracking-widest font-bold transition duration-300 rounded-sm"
                    >
                      {selectedProduct.category === "Shirt & Pant Combo" || selectedProduct.productType === "Two-Piece Set" || (selectedProduct.name || "").toLowerCase().includes("set") || (selectedProduct.name || "").toLowerCase().includes("combo") ? "Add Combo" : "Add to Bag"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const sizeStr = selectedProduct.category === "Shirt & Pant Combo" || selectedProduct.productType === "Two-Piece Set" || (selectedProduct.name || "").toLowerCase().includes("set") || (selectedProduct.name || "").toLowerCase().includes("combo")
                          ? `Shirt: ${selectedShirtSize} / Trouser: ${selectedTrouserSize}`
                          : selectedSize;
                        addToCart(selectedProduct, sizeStr, currentVariantOrCombo);
                        setIsCheckoutOpen(true);
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
                {/* HERO SECTION - REDESIGNED EDITORIAL COVER */}
                <section className="relative w-full min-h-screen flex flex-col justify-end border-b border-earth/10 bg-transparent overflow-hidden" id="storefront-hero">
                  {/* Background Video/Image Layer with Intelligent Fallback - Absolute position inside hero */}
                  <div className="absolute inset-0 z-0 overflow-hidden bg-[#1C2333] pointer-events-none">
                    <AnimatePresence mode="popLayout">
                      {activeHeroImages.map((mediaUrl, idx) => {
                        if (idx !== currentHeroIdx) return null;
                        const isVideo = detectedVideos[mediaUrl] === true;
                        return (
                          <motion.div
                            key={mediaUrl + "-" + idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.85 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 w-full h-full"
                          >
                            {isVideo ? (
                              <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="auto"
                                src={getDirectVideoUrl(mediaUrl)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={getDirectImageUrl(mediaUrl) || undefined}
                                alt="Storefront Hero Background"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {/* Soft dark gradient overlay for superb readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 pointer-events-none z-10" />
                  </div>

                  {/* Foreground content wrapped in separate relative z-10 layer */}
                  <div 
                    className="relative z-10 w-full min-h-screen flex flex-col justify-end bg-black/10"
                  >
                {/* Overlay Content: Bottom-Left Alignment with top-padding to clear the fixed header and tighter bottom padding */}
                <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 pt-28 pb-16 sm:pb-24 md:pb-28 flex flex-col items-start text-left space-y-4 sm:space-y-6">
                  <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl xl:text-8xl text-white font-light leading-tight tracking-tight max-w-4xl">
                    {cmsConfig.heroTitle || "we own the present"}
                  </h1>

                  {/* Real-time Keyword Search Input with Predictive Suggestions Overlay */}
                  <div className="w-full max-w-md pt-2" id="hero-storefront-search-container">
                    <div className="relative group">
                      <input
                        id="hero-storefront-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          const section = document.getElementById("vartman-garments");
                          if (section) {
                            section.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                        placeholder="Search garments (e.g. shirt, linen, pant)..."
                        className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/60 rounded-sm font-mono text-xs uppercase tracking-wider pl-11 pr-10 py-3.5 shadow-sm focus:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-300"
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-white transition-colors duration-300" />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/20 rounded-full transition-colors duration-300"
                          id="clear-hero-search"
                        >
                          <X className="w-3.5 h-3.5 text-white/70 hover:text-white" />
                        </button>
                      )}

                      {/* Real-time Predictive Suggestions Dropdown Overlay */}
                      {searchQuery.trim().length >= 2 && (
                        <div className="absolute left-0 right-0 mt-2 bg-[#FBF9F6] border border-[#1C2333]/15 text-[#1C2333] shadow-2xl rounded-sm z-50 p-4 space-y-4 max-h-[300px] overflow-y-auto">
                          {/* Suggested Queries */}
                          <div>
                            <span className="text-[9px] font-mono text-earth/50 uppercase tracking-widest font-bold block mb-2">Garment Suggestions</span>
                            <div className="flex flex-col gap-1">
                              {products
                                .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.category || "").toLowerCase().includes(searchQuery.toLowerCase()))
                                .slice(0, 5)
                                .map(p => (
                                  <button
                                    key={p.id}
                                    onClick={() => {
                                      setSelectedProduct(p);
                                      setActiveImgIdx(0);
                                      setSearchQuery("");
                                    }}
                                    className="flex items-center justify-between text-left px-2.5 py-1.5 hover:bg-sand/30 text-xs font-mono text-ink rounded transition-colors duration-200 cursor-pointer"
                                  >
                                    <span className="truncate pr-4 uppercase">{p.name}</span>
                                    <span className="text-[10px] text-earth/60 font-bold">₹{Math.round(p.price).toLocaleString("en-IN")}</span>
                                  </button>
                                ))}
                              {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.category || "").toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                <div className="text-[10px] font-mono text-earth/50 italic p-2">No direct garment matches found</div>
                              )}
                            </div>
                          </div>

                          {/* Quick Categories Filter */}
                          <div>
                            <span className="text-[9px] font-mono text-earth/50 uppercase tracking-widest font-bold block mb-2">Explore Category</span>
                            <div className="flex flex-wrap gap-1.5">
                              {["Loomed Shirts", "Loomed Pants", "Artisan Robes", "Artisan Coats", "Men's T-Shirts", "Women's T-Shirts", "Shirt & Pant Combo", "LOOMED CO-ORD SETS", "SHIRT & TROUSER COMBO"]
                                .filter(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(cat => (
                                  <button
                                    key={cat}
                                    onClick={() => {
                                      updateUrlParam("category", cat);
                                      setSearchQuery("");
                                      const section = document.getElementById("vartman-garments");
                                      if (section) section.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="px-2.5 py-1 bg-moss/10 text-moss text-[10px] font-mono rounded hover:bg-moss hover:text-white transition duration-300 cursor-pointer"
                                  >
                                    {cat}
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => {
                        const section = document.getElementById("vartman-garments");
                        if (section) section.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-8 py-3.5 bg-transparent border border-white text-white hover:bg-[#F5F0E8] hover:text-[#1C2333] hover:border-[#F5F0E8] rounded-sm text-xs font-mono uppercase tracking-widest transition-all duration-300 cursor-pointer"
                      id="hero-cta-button"
                    >
                      {cmsConfig.heroCtaText || "Begin the Journey"}
                    </button>

                    {/* Slideshow Arrows if > 1 images */}
                    {activeHeroImages.length > 1 && (
                      <div className="flex items-center gap-2 bg-black/20 backdrop-blur-xs p-1 rounded border border-white/10">
                        <button
                          onClick={handlePrevSlide}
                          className="p-2 hover:bg-white/10 rounded text-white transition-colors"
                          title="Previous Slide"
                        >
                          &larr;
                        </button>
                        <span className="text-[10px] font-mono text-white/70 px-1">
                          {currentHeroIdx + 1} / {activeHeroImages.length}
                        </span>
                        <button
                          onClick={handleNextSlide}
                          className="p-2 hover:bg-white/10 rounded text-white transition-colors"
                          title="Next Slide"
                        >
                          &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Slideshow dot indicators at bottom center */}
                {activeHeroImages.length > 1 && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                    {activeHeroImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSlide(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          idx === currentHeroIdx ? "bg-white scale-125 w-4" : "bg-white/40 hover:bg-white/70"
                        }`}
                        title={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Centered Scroll Indicator */}
                <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/70 animate-bounce pointer-events-none">
                  <span className="text-[9px] font-mono tracking-widest uppercase opacity-80">Scroll</span>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </section>

            {/* SHOP BY GENDER / CATEGORY DEEP DIVE */}
            {SHOW_GENDER_SPLIT && (
              <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8 mx-3 sm:mx-6 md:mx-8 lg:mx-12 rounded-2xl border border-white/50 bg-[#F5F0E8]/95 shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.1)] transition-all duration-500 my-8" id="shop-by-gender-section">
                <div className="relative z-10 max-w-7xl mx-auto space-y-12">
                  {/* Header */}
                  <div className="text-center max-w-2xl mx-auto space-y-3">
                    <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B5652F] block font-bold">
                      Where the Path Divides
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl text-[#1C2333] font-light leading-tight">
                      Shop For Him & Her
                    </h2>
                    <p className="text-earth/70 text-xs sm:text-sm font-sans font-light max-w-md mx-auto">
                      Flowing botanical garments tailored to breathe and drape seamlessly across diverse terrains.
                    </p>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Men's Card */}
                    <div className="group relative rounded-lg overflow-hidden aspect-[16/10] md:aspect-[4/3] lg:aspect-[16/10] border border-terrain/15 shadow-sm hover:shadow-lg transition-all duration-500">
                      <img
                        src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80"
                        alt="Men's collection lifestyle organic linen"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1C2333]/90 via-[#1C2333]/30 to-transparent pointer-events-none" />
                      
                      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end text-left space-y-3">
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#D9CBB0] font-semibold">
                          Travel Essentials
                        </span>
                        <h3 className="font-serif text-2xl sm:text-3xl text-linen font-light">
                          Men's Collection
                        </h3>
                        <p className="font-sans text-xs text-linen/80 font-light leading-relaxed max-w-sm">
                          Unhurried linen tops, unstructured travel trousers, and breathable layers tailored for high-altitude trails or quiet retreats.
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => navigateTo("men", "/collections/men")}
                            className="px-5 py-2.5 bg-[#F5F0E8] hover:bg-[#B5652F] text-[#1C2333] hover:text-white rounded-xs text-[10px] font-mono uppercase tracking-widest transition duration-300 font-semibold shadow-sm"
                          >
                            Shop Men's
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Women's Card */}
                    <div className="group relative rounded-lg overflow-hidden aspect-[16/10] md:aspect-[4/3] lg:aspect-[16/10] border border-terrain/15 shadow-sm hover:shadow-lg transition-all duration-500">
                      <img
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&auto=format&fit=crop&q=80"
                        alt="Women's collection lifestyle botanical drapes"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1C2333]/90 via-[#1C2333]/30 to-transparent pointer-events-none" />
                      
                      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end text-left space-y-3">
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#D9CBB0] font-semibold">
                          Mindful Silhouettes
                        </span>
                        <h3 className="font-serif text-2xl sm:text-3xl text-linen font-light">
                          Women's Collection
                        </h3>
                        <p className="font-sans text-xs text-linen/80 font-light leading-relaxed max-w-sm">
                          Flowing linen pants, botanical robes, and unhurried cotton knits crafted to drape elegantly and celebrate lightweight freedom.
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => navigateTo("women", "/collections/women")}
                            className="px-5 py-2.5 bg-[#F5F0E8] hover:bg-[#B5652F] text-[#1C2333] hover:text-white rounded-xs text-[10px] font-mono uppercase tracking-widest transition duration-300 font-semibold shadow-sm"
                          >
                            Shop Women's
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* FEATURED COLLECTIONS SECTION */}
            {homepageSections.filter((s: any) => s.isActive).length > 0 ? (
              homepageSections
                .filter((s: any) => s.isActive)
                .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
                .map((sec: any) => (
                  <HomepageDynamicSection
                    key={sec.id}
                    section={sec}
                    products={products}
                    wishlist={wishlist}
                    toggleWishlist={toggleWishlist}
                    setSelectedProduct={setSelectedProduct}
                    setActiveImgIdx={setActiveImgIdx}
                    addToCart={addToCart}
                    setIsCheckoutOpen={setIsCheckoutOpen}
                    detectedVideos={detectedVideos}
                    getDirectImageUrl={getDirectImageUrl}
                    getDirectVideoUrl={getDirectVideoUrl}
                  />
                ))
            ) : (
              <section className="relative overflow-hidden py-16 px-4 md:px-6 w-full max-w-none bg-[#F5F0E8]/95 border-b border-terrain/10" id="featured-collections-section">
              <div className="relative z-10 w-full max-w-none space-y-12">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B5652F] block font-bold">
                    Curated Roster
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl text-[#1C2333] font-light leading-tight">
                    Discover What's New
                  </h2>
                  <p className="text-earth/70 text-xs sm:text-sm font-sans font-light max-w-md mx-auto">
                    Slowly woven, unhurried garments. Certified organic origin designed to last lifetimes.
                  </p>
                </div>

                {/* Products Grid - Carousel with dragging and arrow controls */}
                <div className="relative">
                  {/* Left arrow button */}
                  <button 
                    onClick={scrollDiscoverLeft} 
                    className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-[#1C2333] hover:scale-105 p-3 rounded-full shadow-md border border-terrain/10 transition-all opacity-80 hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
                    aria-label="Slide Left"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Right arrow button */}
                  <button 
                    onClick={scrollDiscoverRight} 
                    className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-[#1C2333] hover:scale-105 p-3 rounded-full shadow-md border border-terrain/10 transition-all opacity-80 hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
                    aria-label="Slide Right"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div 
                    ref={discoverCarouselRef}
                    onMouseDown={handleDiscoverMouseDown}
                    onMouseLeave={handleDiscoverMouseLeaveOrUp}
                    onMouseUp={handleDiscoverMouseLeaveOrUp}
                    onMouseMove={handleDiscoverMouseMove}
                    className={`flex flex-row overflow-x-auto gap-2 sm:gap-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-4 cursor-grab ${isDiscoverDragging ? 'cursor-grabbing select-none' : ''}`}
                  >
                    {products.slice(0, 8).map((p) => {
                      const isStarred = wishlist.includes(p.id);
                      return (
                        <div key={`featured-${p.id}`} className="group flex flex-col justify-between relative animate-fade-in w-[46.5vw] xs:w-[47vw] md:w-[400px] shrink-0 snap-start" id={`featured-card-${p.id}`}>
                          <div 
                            onClick={(e) => { 
                              if (discoverHasDragged.current) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                              }
                              setSelectedProduct(p); 
                              setActiveImgIdx(0); 
                            }}
                            className="relative aspect-[3/4] bg-white border border-terrain/15 cursor-pointer overflow-hidden rounded-sm shadow-[0_12px_24px_rgba(28,28,26,0.03)] group-hover:shadow-[0_24px_50px_rgba(28,28,26,0.07)] group-hover:-translate-y-1 transition-all duration-500"
                          >
                                                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-moss/90 text-linen text-[9px] sm:text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-xs shadow-sm select-none">
                            {p.category === "Loomed Shirts" ? "LINEN" : p.category === "Loomed Pants" ? "BOTANICAL FLAX" : p.category === "Artisan Robes" ? "ORGANIC COTTON" : p.category === "Shirt & Pant Combo" ? "CO-ORD COMBO" : "NATURAL OVERCOAT"}
                          </div>

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(p.id, p.name);
                            }}
                            className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 bg-black/20 backdrop-blur-xs text-white hover:text-white hover:scale-105 transition rounded-full"
                            title={isStarred ? "Remove from Wishlist" : "Save for Later"}
                          >
                            <Heart className="w-4 h-4 text-white" />
                          </button>

                          {/* Default Product Image (Lifestyle) */}
                          {detectedVideos[p.images?.[0]] ? (
                            <video
                              src={getDirectVideoUrl(p.images[0])}
                              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-100 ${p.images?.[1] ? "group-hover:opacity-0" : "group-hover:opacity-100"} group-hover:scale-110 select-none`}
                              autoPlay
                              loop
                              muted
                              playsInline
                              preload="metadata"
                              style={{ transform: "translateZ(0)" }}
                            />
                          ) : (
                            <img
                              src={getDirectImageUrl(p.images?.[0]) || null}
                              alt={p.name}
                              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-100 ${p.images?.[1] ? "group-hover:opacity-0" : "group-hover:opacity-100"} group-hover:scale-110 select-none`}
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                          )}

                          {/* Hover Flat Lay Image */}
                          {p.images?.[1] && (
                            detectedVideos[p.images[1]] ? (
                              <video
                                src={getDirectVideoUrl(p.images[1])}
                                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110 select-none"
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="none"
                              />
                            ) : (
                              <img
                                src={getDirectImageUrl(p.images?.[1]) || null}
                                alt={`${p.name} flat lay`}
                                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110 select-none"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                            )
                          )}
                        </div>

                        {/* Below Image Product Information */}
                        <div className="mt-3.5 space-y-1.5 text-left px-1 sm:px-0">
                          <div className="flex justify-between items-start gap-1.5">
                            <h3 
                              onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                              className="font-serif text-base sm:text-lg text-ink hover:text-terrain transition cursor-pointer leading-tight font-medium"
                            >
                              {p.name}
                            </h3>
                            <span className="font-mono text-xs sm:text-sm text-ink shrink-0 font-medium">
                              ₹{Math.round(p.price || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-widest text-terrain font-medium">
                              {p.category}
                            </span>
                            <button
                              onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                              className="text-[10px] sm:text-[11px] text-earth/50 hover:text-ink font-mono uppercase tracking-wider transition underline"
                            >
                              Details →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>
            </section>
            )}

            {/* WHERE VARTMAN HAS BEEN - ATMOSPHERE GRID (3D COVERFLOW CAROUSEL) */}
            <section className="relative overflow-hidden py-16 px-4 md:px-6 w-full max-w-none border-b border-terrain/10" style={{ clipPath: "inset(0)" }}>
              {/* Background Layer: Fixed position */}
              <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-0 pointer-events-none" />

              {/* Foreground content wrapper: Relative position */}
              <div className="relative z-10 w-full max-w-none space-y-12">
                {/* Section Title */}
                <div className="text-center space-y-2">
                  <h2 className="font-serif text-3xl sm:text-4xl text-ink font-light tracking-wide">
                     {cmsConfig.categoriesTitle || "Shop By Category"}
                  </h2>
                </div>

                {/* 3D Coverflow Carousel Stage */}
                <div 
                  className="relative w-full overflow-visible py-6 flex flex-col items-center"
                  onMouseEnter={() => setIsCarouselHovered(true)}
                  onMouseLeave={() => setIsCarouselHovered(false)}
                >
                  <div 
                    className="relative w-full max-w-5xl h-[408px] sm:h-[540px] flex items-center justify-center overflow-visible"
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
                        let diff = idx - categoryActiveIdx;
                        if (diff < -2) diff += categoriesList.length;
                        if (diff > 2) diff -= categoriesList.length;
                        
                        const isActive = idx === categoryActiveIdx;
                        
                        // Calculate transforms
                        let rotateYVal = 0;
                        let translateZVal = 0;
                        let translateXVal = 0;
                        let scaleVal = 1;
                        let zIndexVal = 30;
                        let opacityVal = 1;
                        
                        if (diff === 0) {
                          rotateYVal = 0;
                          translateZVal = 0;
                          translateXVal = 0;
                          scaleVal = 1;
                          zIndexVal = 30;
                          opacityVal = 1;
                        } else if (diff === 1) {
                          rotateYVal = -35;
                          translateZVal = -120;
                          translateXVal = isMobile ? 130 : 300;
                          scaleVal = 0.82;
                          zIndexVal = 20;
                          opacityVal = 0.8;
                        } else if (diff === -1) {
                          rotateYVal = 35;
                          translateZVal = -120;
                          translateXVal = isMobile ? -130 : -300;
                          scaleVal = 0.82;
                          zIndexVal = 20;
                          opacityVal = 0.8;
                        } else if (diff === 2 || diff === -2) {
                          rotateYVal = diff === 2 ? -45 : 45;
                          translateZVal = -240;
                          translateXVal = diff === 2 ? (isMobile ? 210 : 540) : (isMobile ? -210 : -540);
                          scaleVal = 0.65;
                          zIndexVal = 10;
                          // Hide far slides on mobile to prevent screen overflow
                          opacityVal = isMobile ? 0 : 0.4;
                        }
                        
                        return (
                          <div
                            key={cat.id}
                            onClick={() => {
                              if (carouselDragMovedRef.current) return;
                              resetAutoplayTimer();
                              if (isActive) {
                                // Set filter and scroll
                                const keyword = cat.searchKeyword || (
                                  cat.id === "oversized-fits" ? "oversized" :
                                  cat.id === "graphic-prints" ? "graphic" :
                                  cat.id === "classic-basics" ? "basic" :
                                  cat.id === "heavyweight-tees" ? "heavy" : ""
                                );
                                if (keyword) {
                                  setSelectedMainFilter("TOPS");
                                  setSearchQuery(keyword);
                                } else {
                                  setSelectedMainFilter("ALL");
                                  setSearchQuery("");
                                }
                                const target = document.getElementById("vartman-garments");
                                if (target) {
                                  target.scrollIntoView({ behavior: "smooth" });
                                }
                              } else {
                                setCategoryActiveIdx(idx);
                              }
                            }}
                            className={`absolute w-[264px] sm:w-[384px] aspect-[3/4] cursor-pointer select-none bg-transparent overflow-visible group`}
                            style={{
                              transform: `translateX(${translateXVal}px) translateZ(${translateZVal}px) rotateY(${rotateYVal}deg) scale(${scaleVal})`,
                              zIndex: zIndexVal,
                              opacity: opacityVal,
                              transformStyle: "preserve-3d",
                              backfaceVisibility: "hidden",
                              transition: isCarouselDragging ? "none" : "transform 450ms ease-in-out, opacity 450ms ease-in-out, z-index 450ms ease-in-out",
                              pointerEvents: (isMobile && Math.abs(diff) > 1) ? "none" : "auto"
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
                            
                            {/* Elegant Content Overlay with legible dark typography positioned under the video */}
                            <div className="absolute inset-x-0 bottom-0 top-[68%] flex flex-col justify-start pt-4 px-3 text-[#111827] pointer-events-none select-none text-center">
                              <span className="text-[9px] font-mono tracking-[0.2em] text-[#111827]/60 uppercase mb-1">
                                Category
                              </span>
                              <h3 className="font-serif text-lg sm:text-2xl font-light tracking-wide mb-1 text-[#111827]">
                                {cat.title}
                              </h3>
                              <p className="font-sans text-[10px] sm:text-xs text-[#111827]/70 font-light leading-relaxed line-clamp-2">
                                {cat.description}
                              </p>
                              
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

                {/* Caption */}
                <div className="text-center pt-4">
                  <p className="font-serif text-sm sm:text-base text-ink/60 italic tracking-wide">
                    Not a guarantee. A feeling you already know.
                  </p>
                </div>
              </div>
            </section>

            {/* REDESIGNED EDITORIAL PRODUCT GRID */}
            <section className="relative overflow-hidden py-16 px-1.5 sm:px-4 md:px-6 w-full max-w-none" id="vartman-garments" style={{ clipPath: "inset(0)" }}>
              {/* Background Layer: Fixed position */}
              <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-0 pointer-events-none" />

              {/* Foreground content wrapper: Relative position */}
              <div className="relative z-10 w-full max-w-none space-y-12">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-earth/10 pb-8 px-1.5 sm:px-0">
                  <div className="space-y-3">
                    <span className="text-[11px] sm:text-xs uppercase font-mono tracking-[0.25em] text-moss block font-bold">The Collection</span>
                    <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ink font-light leading-tight">Made for the In-Between Moments</h2>
                    <p className="text-earth/70 text-xs sm:text-sm font-sans font-light max-w-xl">
                      Wear it before you leave. Wear it long after you're back.
                    </p>
                  </div>
                  <div className="text-xs text-earth/50 font-mono tracking-wider">
                    Editorial Catalog · {sortedAndFilteredProducts.length} Pieces
                  </div>
                </div>

                {/* Wishlist Toast Notification */}
                <AnimatePresence>
                  {wishlistToast && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="fixed bottom-8 left-8 z-50 bg-ink text-linen border border-terrain/20 px-4 py-3 rounded-sm shadow-xl flex items-center gap-2.5 text-xs font-mono font-medium"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#B5652F] animate-ping" />
                      <span>{wishlistToast}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Redesigned Master Filter Bar */}
                <div className="overflow-x-auto scrollbar-none pb-4 select-none -mx-1.5 px-1.5 sm:mx-0 sm:px-0">
                  <div className="flex gap-3 min-w-max">
                    {[
                      "ALL",
                      "TOPS",
                      "BOTTOMS",
                      "OUTERWEAR",
                      "LINEN",
                      "ORGANIC COTTON",
                      "UNDER ₹5K",
                      "UNDER ₹9K"
                    ].map((filter) => {
                      const isActive = selectedMainFilter === filter;
                      return (
                        <button
                          key={filter}
                          onClick={() => setSelectedMainFilter(filter)}
                          className={`px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest transition duration-300 ${
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
                  <div className="w-full space-y-6">

                    {/* Elegant Sort & Count Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-3 sm:px-4 bg-sand/20 border border-terrain/15 rounded-sm select-none">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono uppercase text-earth/60 tracking-wider">Sequence:</span>
                          <div className="flex items-center gap-2">
                            <select
                              value={sortBy}
                              onChange={(e: any) => setSortBy(e.target.value)}
                              className="bg-white border border-[#1C2333]/15 text-xs text-[#1C2333] rounded-sm px-3 py-1.5 focus:outline-none focus:border-moss font-mono outline-none cursor-pointer"
                              title="Sort Option"
                            >
                              <option value="newest">Newest Dispatches</option>
                              <option value="price-low-high">Price: Low to High</option>
                              <option value="price-high-low">Price: High to Low</option>
                            </select>
                          </div>
                        </div>

                        {/* Filter Toggle Button */}
                        <button
                          onClick={() => setIsFilterSidebarOpen(true)}
                          className="flex items-center gap-2 bg-moss hover:bg-moss/90 text-linen border border-moss/20 px-4 py-1.5 rounded-sm text-[11px] font-mono tracking-wider transition-colors duration-300 shadow-sm cursor-pointer animate-fade-in"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                          <span>Filter {[apiGender, apiCategory, apiColor, apiSize].filter(Boolean).length > 0 ? `(${[apiGender, apiCategory, apiColor, apiSize].filter(Boolean).length})` : ""}</span>
                        </button>

                        {/* Clear Filter Button */}
                        {hasActiveApiFilters && (
                          <button
                            onClick={clearAllUrlParams}
                            className="flex items-center gap-1.5 bg-transparent hover:bg-red-50 text-red-700 hover:text-red-800 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-sm text-[11px] font-mono tracking-wider transition-all duration-300 shadow-xs cursor-pointer animate-fade-in"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Clear Filter</span>
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-[#1C2333]/75 tracking-wider uppercase">
                        Presently Showing {sortedAndFilteredProducts.length} of {products.length} Travel Coordinates
                      </div>
                    </div>

                {/* Dynamic Brand-Compliant Product Grid (2 columns mobile, 4 columns desktop) */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-6" id="products-grid">
                  {sortedAndFilteredProducts.length > 0 ? (
                    sortedAndFilteredProducts.map((p) => {
                      const isStarred = wishlist.includes(p.id);

                      return (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-100px" }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="group flex flex-col justify-between relative h-full"
                          id={`product-card-${p.id}`}
                        >
                          <div 
                            onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                            className="relative aspect-[3/4] bg-[#F7F5F0] border border-terrain/20 cursor-pointer overflow-hidden rounded-xl shadow-[0_8px_20px_rgba(28,28,26,0.04)] group-hover:shadow-[0_20px_45px_rgba(28,28,26,0.08)] group-hover:-translate-y-1 transition-all duration-500"
                          >
                            {/* Category Tag Badge */}
                            <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 bg-[#2C3327]/90 text-white font-mono text-[8.5px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-xs select-none backdrop-blur-xs">
                              {p.category === "Loomed Shirts" ? "LINEN" : p.category === "Loomed Pants" ? "BOTANICAL FLAX" : p.category === "Artisan Robes" ? "ORGANIC COTTON" : p.category === "Shirt & Pant Combo" ? "CO-ORD COMBO" : "NATURAL OVERCOAT"}
                            </div>

                            {/* Wishlist Heart Button */}
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWishlist(p.id, p.name);
                              }}
                              className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-black/30 backdrop-blur-md text-white hover:bg-black/50 hover:scale-105 transition rounded-full flex items-center justify-center border border-white/20 shadow-xs cursor-pointer"
                              title={isStarred ? "Remove from Wishlist" : "Save for Later"}
                            >
                              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isStarred ? "fill-[#B5652F] text-[#B5652F]" : "text-white"}`} />
                            </button>

                            {/* Default Product Image (Lifestyle) */}
                            {detectedVideos[p.images?.[0]] ? (
                              <video
                                src={getDirectVideoUrl(p.images[0])}
                                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-100 ${p.images?.[1] ? "group-hover:opacity-0" : "group-hover:opacity-100"} group-hover:scale-110 select-none rounded-xl`}
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="metadata"
                                style={{ transform: "translateZ(0)" }}
                              />
                            ) : (
                              <img
                                src={getDirectImageUrl(p.images?.[0]) || null}
                                alt={p.name}
                                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-100 ${p.images?.[1] ? "group-hover:opacity-0" : "group-hover:opacity-100"} group-hover:scale-110 select-none rounded-xl`}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                            )}

                            {/* Hover Flat Lay Image */}
                            {p.images?.[1] && (
                              detectedVideos[p.images[1]] ? (
                                <video
                                  src={getDirectVideoUrl(p.images[1])}
                                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110 select-none rounded-xl"
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  preload="none"
                                />
                              ) : (
                                <img
                                  src={getDirectImageUrl(p.images?.[1]) || null}
                                  alt={`${p.name} flat lay`}
                                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110 select-none rounded-xl"
                                  referrerPolicy="no-referrer"
                                  loading="lazy"
                                />
                              )
                            )}
                          </div>

                          {/* Below Image Product Information */}
                          <div className="mt-3.5 space-y-1.5 text-left px-0.5 sm:px-0">
                            <div className="flex justify-between items-start gap-1.5">
                              <h3 
                                onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                                className="font-serif text-sm sm:text-base md:text-lg text-ink hover:text-terrain transition cursor-pointer leading-snug font-medium line-clamp-2"
                              >
                                {p.name}
                              </h3>
                              <span className="font-mono text-xs sm:text-sm text-ink shrink-0 font-medium pt-0.5">
                                ₹{Math.round(p.price || 0).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-widest text-terrain font-medium">
                                {p.category}
                              </span>
                              <button
                                onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                                className="text-[10px] sm:text-[11px] text-earth/50 hover:text-ink font-mono uppercase tracking-wider transition underline"
                              >
                                Details →
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 lg:col-span-3 text-center py-20 text-earth/50 font-serif text-lg">
                      No pieces found matching this search or category filter.
                    </div>
                  )}

                  {/* Vartman Pact Content Card */}
                  {sortedAndFilteredProducts.length > 0 && (
                    <div className="bg-moss/10 border border-moss/20 p-8 flex flex-col justify-between rounded-sm relative overflow-hidden min-h-[250px] col-span-2 lg:col-span-1">
                      <div className="absolute inset-0 opacity-[0.03] bg-linen-organic pointer-events-none" />
                      <div className="space-y-4 relative z-10">
                        <span className="text-[9px] uppercase tracking-widest font-mono text-moss block font-bold">The Vartman Pact</span>
                        <p className="text-earth text-sm italic font-serif leading-relaxed">
                          "Our garments contain zero plastic, zero polyester, and zero synthetic reinforcement. They are handwoven to map your journey and return completely to the soil."
                        </p>
                      </div>
                      <div className="pt-4 border-t border-earth/10 flex items-center justify-between relative z-10">
                        <span className="text-[10px] font-mono uppercase text-moss tracking-widest">100% Biological Origin</span>
                        <Globe className="w-4 h-4 text-moss" />
                      </div>
                    </div>
                  )}
                </div>

                </div> {/* Closing tag for Product Grid and Sort Controls Container */}
              </div> {/* Closing tag for Modern Refining Sidebar and Product Layout Container */}

              </div>
            </section>

            {/* BEST SELLERS / CUSTOMER FAVORITES */}
            {homepageSections.filter((s: any) => s.isActive).length === 0 && (
            <section className="relative overflow-hidden py-16 px-1.5 sm:px-4 md:px-6 w-full max-w-none bg-[#F5F0E8]/95 border-b border-terrain/10" id="best-sellers-section">
              <div className="relative z-10 w-full max-w-none space-y-12">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto space-y-3 px-1.5 sm:px-0">
                  <span className="text-[11px] sm:text-xs uppercase font-mono tracking-[0.25em] text-[#B5652F] block font-bold">
                    Highly Revered
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl text-[#1C2333] font-light leading-tight">
                    Customer Favorites
                  </h2>
                  <p className="text-earth/70 text-xs sm:text-sm font-sans font-light max-w-md mx-auto">
                    A collection of our most celebrated traveler garments, heavily praised for comfortable movement and unhurried endurance.
                  </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-6">
                  {products.slice(1, 5).map((p) => {
                    const isStarred = wishlist.includes(p.id);
                    return (
                      <div key={`bestseller-${p.id}`} className="group flex flex-col justify-between relative h-full animate-fade-in" id={`bestseller-card-${p.id}`}>
                        <div 
                          onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                          className="relative aspect-[3/4] bg-[#F7F5F0] border border-terrain/20 cursor-pointer overflow-hidden rounded-xl shadow-[0_8px_20px_rgba(28,28,26,0.04)] group-hover:shadow-[0_20px_45px_rgba(28,28,26,0.08)] group-hover:-translate-y-1 transition-all duration-500"
                        >
                          {/* Category Tag Badge */}
                          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 bg-[#2C3327]/90 text-white font-mono text-[8.5px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-xs select-none backdrop-blur-xs">
                            {p.category === "Loomed Shirts" ? "LINEN" : p.category === "Loomed Pants" ? "BOTANICAL FLAX" : p.category === "Artisan Robes" ? "ORGANIC COTTON" : p.category === "Shirt & Pant Combo" ? "CO-ORD COMBO" : "NATURAL OVERCOAT"}
                          </div>

                          {/* Wishlist Heart Button */}
                          <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(p.id, p.name);
                            }}
                            className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-black/30 backdrop-blur-md text-white hover:bg-black/50 hover:scale-105 transition rounded-full flex items-center justify-center border border-white/20 shadow-xs cursor-pointer"
                            title={isStarred ? "Remove from Wishlist" : "Save for Later"}
                          >
                            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isStarred ? "fill-[#B5652F] text-[#B5652F]" : "text-white"}`} />
                          </button>

                          {/* Default Product Image (Lifestyle) */}
                          {detectedVideos[p.images?.[0]] ? (
                            <video
                              src={getDirectVideoUrl(p.images[0])}
                              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-100 ${p.images?.[1] ? "group-hover:opacity-0" : "group-hover:opacity-100"} group-hover:scale-110 select-none rounded-xl`}
                              autoPlay
                              loop
                              muted
                              playsInline
                              preload="metadata"
                              style={{ transform: "translateZ(0)" }}
                            />
                          ) : (
                            <img
                              src={getDirectImageUrl(p.images?.[0]) || null}
                              alt={p.name}
                              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-100 ${p.images?.[1] ? "group-hover:opacity-0" : "group-hover:opacity-100"} group-hover:scale-110 select-none rounded-xl`}
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                          )}

                          {/* Hover Flat Lay Image */}
                          {p.images?.[1] && (
                            detectedVideos[p.images[1]] ? (
                              <video
                                src={getDirectVideoUrl(p.images[1])}
                                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110 select-none rounded-xl"
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="none"
                              />
                            ) : (
                              <img
                                src={getDirectImageUrl(p.images?.[1]) || null}
                                alt={`${p.name} flat lay`}
                                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110 select-none rounded-xl"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                              />
                            )
                          )}
                        </div>

                        {/* Below Image Product Information with Stars */}
                        <div className="mt-3.5 space-y-1.5 text-left px-0.5 sm:px-0">
                          <div className="flex justify-between items-start gap-1.5">
                            <h3 
                              onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                              className="font-serif text-sm sm:text-base md:text-lg text-ink hover:text-terrain transition cursor-pointer leading-snug font-medium line-clamp-2"
                            >
                              {p.name}
                            </h3>
                            <span className="font-mono text-xs sm:text-sm text-ink shrink-0 font-medium">
                              ₹{Math.round(p.price || 0).toLocaleString("en-IN")}
                            </span>
                          </div>

                          {/* Star Ratings & Review Counts */}
                          {SHOW_SOCIAL_PROOF && (
                            <div className="flex items-center gap-1.5 py-0.5">
                              <div className="flex items-center text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3.5 h-3.5 ${i < Math.floor(p.rating || 4.8) ? "fill-current" : "opacity-30"}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] sm:text-[11px] font-mono text-earth/60">
                                {(p.rating || 4.8).toFixed(1)} ({p.reviewsCount || 42} reviews)
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-widest text-terrain font-medium">
                              {p.category}
                            </span>
                            <button
                              onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                              className="text-[10px] sm:text-[11px] text-earth/50 hover:text-ink font-mono uppercase tracking-wider transition underline"
                            >
                              Details →
                            </button>
                          </div>

                          {/* Add to Cart button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const defaultSize = p.sizes?.[0] || "M";
                              addToCart(p, defaultSize);
                              setIsCheckoutOpen(true);
                            }}
                            className="w-full mt-3 py-2.5 px-4 text-center text-[11px] sm:text-xs font-mono uppercase tracking-widest border border-moss/20 bg-moss text-linen hover:bg-moss/90 transition-all duration-300 rounded-xs select-none cursor-pointer flex items-center justify-center gap-2"
                          >
                            <ShoppingBag className="w-4 h-4 text-linen" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
            )}



            {/* CUSTOMER TESTIMONIALS / SOCIAL PROOF */}
            <section className="relative overflow-hidden py-16 px-4 md:px-6 w-full max-w-none bg-[#F5F0E8]/95 border-b border-terrain/10" id="testimonials-section">
              <div className="relative z-10 w-full max-w-none space-y-12">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B5652F] block font-bold">
                    Wanderers' Voices
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl text-[#1C2333] font-light leading-tight">
                    Loved by Our Community
                  </h2>
                  <p className="text-earth/70 text-xs sm:text-sm font-sans font-light max-w-md mx-auto">
                    Honest chronicles shared by slow travelers and mindful explorers who pack light and live fully.
                  </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  {[
                    {
                      quote: "The unhurried weave of the Zen Nomad shirt is unlike anything else. It breathes with you on humid Kyoto streets and washes like a dream.",
                      author: "Elena R.",
                      location: "Kyoto, Japan",
                      avatar: "ER"
                    },
                    {
                      quote: "Vartman garments represent a quiet rebellion against fast fashion. The natural clay dyes develop a beautiful patina over months of wandering.",
                      author: "Marcus T.",
                      location: "Varanasi, India",
                      avatar: "MT"
                    },
                    {
                      quote: "Knowing that my travel robe will compost completely back into the soil when its journey is over gives me a deep sense of peace.",
                      author: "Sophia K.",
                      location: "Andes, Peru",
                      avatar: "SK"
                    }
                  ].map((test, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white border border-terrain/15 p-8 rounded-sm shadow-[0_12px_24px_rgba(28,28,26,0.02)] hover:shadow-[0_20px_40px_rgba(28,28,26,0.05)] transition-all duration-300 flex flex-col justify-between space-y-6"
                    >
                      <div className="space-y-4">
                        {/* Quote mark or icon */}
                        <span className="font-serif text-5xl text-[#B5652F]/20 block h-4 leading-none select-none">“</span>
                        <p className="font-serif text-[#1C2333] text-sm italic leading-relaxed text-left">
                          {test.quote}
                        </p>
                      </div>

                      <div className="flex items-center gap-3.5 pt-4 border-t border-earth/10">
                        <div className="w-9 h-9 rounded-full bg-[#1C2333]/5 border border-[#1C2333]/15 flex items-center justify-center font-mono text-[11px] font-bold text-[#1C2333] select-none">
                          {test.avatar}
                        </div>
                        <div className="text-left">
                          <span className="font-sans text-xs font-semibold text-[#1C2333] block">
                            {test.author}
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-earth/60 block">
                            {test.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>





            {/* 6. MINIMAL ROAD QUOTE SECTION */}
            <section className="bg-white/95 backdrop-blur-md py-24 px-6 border border-white/50 mx-3 sm:mx-6 md:mx-8 lg:mx-12 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.1)] transition-all duration-500 my-8 flex flex-col items-center justify-center text-center" id="terrapledge-guarantee">
              <div className="max-w-3xl mx-auto">
                <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink leading-relaxed font-light italic">
                  "We don't promise it will change your life. We just made it for the road."
                </p>
              </div>
            </section>

            {/* 7. FOUNDER'S STATEMENT QUOTE BLOCK */}
            <section className="bg-white/90 backdrop-blur-md py-24 px-4 sm:px-6 lg:px-8 border border-white/50 mx-3 sm:mx-6 md:mx-8 lg:mx-12 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.1)] transition-all duration-500 my-8 relative overflow-hidden" id="vartman-journal">
              <div className="max-w-5xl mx-auto">
                {/* Structured as a grid that defaults to a single text-only centered column, but can support an image on the right if added later */}
                <div className="grid grid-cols-1 gap-12 items-center justify-center text-center">
                  <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                    {/* Large serif quote mark */}
                    <div className="font-serif text-6xl sm:text-7xl md:text-8xl text-[#D9CBB0]/40 select-none leading-none -mb-6">
                      “
                    </div>
                    {/* Quote */}
                    <p className="font-serif text-xl sm:text-2xl md:text-3xl text-ink leading-relaxed font-light italic">
                      I built Vartman for the version of you that's already somewhere else in your mind.
                    </p>
                    {/* Signature */}
                    <div className="pt-4">
                      <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-earth font-bold block">
                        — Founder & Weaver
                      </span>
                    </div>
                  </div>
                  
                  {/* Future Two-Column Support Placeholder (uncomment and replace src when founder photo is available) */}
                  {/* 
                  <div className="hidden md:block w-full max-w-sm mx-auto aspect-[3/4] overflow-hidden rounded-sm border border-terrain/20 shadow-sm">
                    <img src="FOUNDER_PHOTO_URL_HERE" alt="Founder & Weaver" className="w-full h-full object-cover" />
                  </div>
                  */}
                </div>
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
              <h2 className="font-serif text-4xl sm:text-5xl text-ink font-bold">The Vartman Chronicle</h2>
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
                Vartman began as a quiet conversation between travelers standing at an ancient brick temple at dawn. Watching the morning sun spill gold across hand-loomed drapes, we realized that modern traveling apparel had become too busy, too synthetic, and too rushed.
              </p>
              <p>
                We asked ourselves: why is traveler clothing built only for high-speed sports? Why are we covered in plastic logos, neon zippers, and synthetic grids when our goal is to slow down and immerse ourselves in our surroundings?
              </p>
              
              <div className="border-l-2 border-moss pl-6 py-4 my-8 text-ink italic font-serif text-lg sm:text-xl bg-sand/35 rounded-sm">
                "Vartman is the Sanskrit word for the present moment. We believe the clothing you pack should not be a technical distraction, but a quiet partner that helps you feel grounded wherever you step."
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

        {/* VIEW 3: DEDICATED ADMIN / MERCHANT PANEL (Protected Guard) */}
        {activeTab === "merchant" && currentUser?.role === "admin" && (
          <section className="w-full max-w-none px-2 sm:px-4 md:px-6 lg:px-8 pt-28 sm:pt-32 pb-12 min-h-screen" id="admin-panel-root">
            <AdminDashboard
              products={products}
              orders={orders}
              analytics={analytics}
              currentUser={currentUser}
              authToken={authToken}
              onProductUpdate={fetchProducts}
              onOrderUpdate={fetchOrders}
              cmsConfig={cmsConfig}
              onCmsUpdate={(newCms) => setCmsConfig(newCms)}
              merchantAIReport={merchantAIReport}
              onGenerateInsights={handleGenerateAIInsights}
              isGeneratingInsights={isGeneratingInsights}
            />
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
                    Every Vartman garment is handloomed to order and travels with mindful intention. We offer <strong>Complimentary Domestic Shipping across India</strong> on all orders exceeding <strong>₹2,999</strong>. For orders below this threshold, a flat transit fee of ₹150 is applied to support our local artisan transport cluster.
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
                    Vartman garments seek paths worldwide. We ship to over 40 countries. International transit carries a flat charge of ₹2,500 (approx. $30 USD) and takes 10 to 14 travel suns. Any custom coordinates or local duties are handled carefully with our international dispatch partners.
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
                        Signal your intention by emailing support@vartmangarments.com with your Order Coordinates and Seeker ID.
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
                    q: "How do I ensure a flawless fit with Vartman's sizing model?",
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
                <p className="text-xs text-earth/50 font-mono">Still seeking clarity? Reach our travel coordinates at <span className="underline">support@vartmangarments.com</span></p>
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
                <h1 className="font-serif text-4xl sm:text-5xl text-ink font-light tracking-tight leading-tight">The Vartman Heritage & Vision</h1>
                <p className="text-earth/60 font-mono text-xs uppercase tracking-widest">Weaving the present moment in Rajasthan</p>
                
                <div className="aspect-[3/4] border border-terrain/15 rounded-sm overflow-hidden shadow-md bg-[#2C2218]/10">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80" 
                    alt="Vartman Founder studying handloom structures under natural sunlight" 
                    className="w-full h-full object-cover grayscale brightness-[0.95] contrast-[1.05]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-[10px] font-mono text-earth/50 text-center italic">
                  Founder & Master Weaver · Jaipur Workspace, June 2026
                </div>
              </div>

              <div className="md:col-span-7 space-y-6 font-sans font-light text-earth/95 leading-relaxed text-sm sm:text-base">
                <h3 className="font-serif text-2xl text-ink font-medium">Why Vartman Exists</h3>
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
                  "Vartman is a Sanskrit instruction to be present. When you wear our pieces, you aren't just wearing clothes—you are wearing the dust, the sweat, the hands, and the very sun of the moment you step into."
                </blockquote>

                <p>
                  We pledge absolute circularity: zero plastic buttons (we use coconut husk and river shells), zero synthetic polyester labels, and zero synthetic threads. Every Vartman piece can be laid directly in a garden bed at the end of its life, returning to the soil in under three months.
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
                  We verify every single input. Our buttons are sliced from discarded coconuts or gathered river shells. Our sewing threads are organic cotton, not polyester. Our dye baths are pure organic matter. No synthetic microplastics will ever leave a Vartman garment.
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
                  At Vartman, we treat your privacy with the same meticulous care we give our organic yarns. We believe your digital footsteps are your own, and we refuse to sell or trade your traveler profiles to third-party advertising grids.
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
                  Your Path Seeker Account credentials are encrypted with industry-standard cryptographic keys. You can completely erase your data footprint at any time by signaling your decision to support@vartmangarments.com.
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
                <h1 className="font-serif text-4xl text-ink font-light tracking-tight">Terms of the Vartman Trail</h1>
                <p className="text-earth/60 font-mono text-xs uppercase">Last woven: June 2026</p>
              </div>

              <div className="prose prose-stone font-sans font-light text-earth/95 leading-relaxed text-sm sm:text-base space-y-6">
                <p>
                  By accessing the Vartman digital storefront and placing order coordinates for our hand-loomed pieces, you agree to walk under the following slow textile rules:
                </p>
                <h3 className="font-serif text-lg font-medium text-ink pt-2">1. Handcrafted Imperfection</h3>
                <p>
                  Vartman garments are not standard machine-made uniform pieces. Because they are loomed manually and dyed with living botanical marigolds, madder root, or indigo, minor variations in weave density, yarn slubs, and pigment shade are intended features of raw artisan textile craft. They represent the voice of the loom.
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

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === "register" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-earth/60">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Arjun Verma"
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-[#F5F0E8]/40 border border-[#1C2333]/15 rounded-xs text-sm placeholder-stone-400 focus:outline-none focus:border-moss outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-earth/60">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="support@vartmangarments.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F5F0E8]/40 border border-[#1C2333]/15 rounded-xs text-sm placeholder-stone-400 focus:outline-none focus:border-moss outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-earth/60">Secure Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F5F0E8]/40 border border-[#1C2333]/15 rounded-xs text-sm placeholder-stone-400 focus:outline-none focus:border-moss outline-none"
                    />
                  </div>

                  {authError && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs font-mono rounded-sm">
                      {authError}
                    </div>
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
                    {authMode === "login" ? "Verify Credentials" : "Weave My Profile"}
                  </button>

                  <div className="flex items-center justify-between pt-2 border-t border-terrain/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                      className="text-moss hover:underline font-mono"
                    >
                      {authMode === "login" ? "Need a slow profile? Sign Up" : "Already registered? Sign In"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!authForm.email) {
                          setAuthError("Enter your email address first to dispatch magic coordinates.");
                          return;
                        }
                        setAuthError("");
                        setMagicLinkSent(true);
                      }}
                      className="text-earth/60 hover:text-moss font-mono"
                    >
                      Send Magic Link
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Profile Header */}
                <div className="bg-sand/15 border border-terrain/15 p-8 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-moss font-bold px-2 py-0.5 bg-moss/10 rounded-full">
                      Verified Path Seeker
                    </span>
                    <h2 className="font-serif text-3xl font-light text-ink">{currentUser.name}</h2>
                    <p className="text-xs font-mono text-earth/60">Seeker ID: <span className="text-ink">#{currentUser.id?.slice(0, 8) || "VT-802"}</span> · Coordinates: {currentUser.email}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {currentUser.role === "admin" && (
                      <button
                        onClick={() => setActiveTab("merchant")}
                        className="px-4 py-2 bg-moss text-linen text-xs font-mono uppercase tracking-widest rounded-sm hover:bg-moss/95"
                      >
                        Merchant Panel
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 border border-earth/20 hover:border-earth text-earth hover:text-ink text-xs font-mono uppercase tracking-widest rounded-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* Account Details & Shipping Coordinates */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white border border-terrain/10 p-6 space-y-4 rounded-sm">
                    <h4 className="font-serif font-medium text-ink flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-moss" /> Transit Coordinates
                    </h4>
                    {currentUser.shippingAddress ? (
                      <div className="text-xs text-earth/80 space-y-1 font-mono">
                        <p>{currentUser.shippingAddress.street}</p>
                        <p>{currentUser.shippingAddress.city}, {currentUser.shippingAddress.state}</p>
                        <p>Postal Code: {currentUser.shippingAddress.zip}</p>
                        <p>Country: {currentUser.shippingAddress.country || "India"}</p>
                      </div>
                    ) : (
                      <div className="text-xs text-earth/50 italic font-mono space-y-2">
                        <p>No transit coordinates registered yet.</p>
                        <button onClick={() => { setActiveTab("store"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-moss underline uppercase text-[10px] font-bold block">Add on checkout</button>
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-terrain/10 p-6 space-y-4 rounded-sm md:col-span-2">
                    <h4 className="font-serif font-medium text-ink flex items-center gap-2">
                      <Package className="w-4 h-4 text-moss" /> Your Garment Trails (My Orders)
                    </h4>

                    {orders.filter(o => o.customerEmail === currentUser.email).length > 0 ? (
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                        {orders
                          .filter(o => o.customerEmail === currentUser.email)
                          .map((order) => (
                            <div key={order.id} className="border border-terrain/15 p-4 rounded-sm space-y-3 bg-sand/5 hover:border-terrain transition">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-mono text-[11px] font-bold">Trail ID: #{order.id.slice(0, 8)}</span>
                                <span className="text-earth/60 font-mono">{new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                              </div>

                              <div className="border-t border-b border-terrain/10 py-2 space-y-1 text-xs text-earth">
                                {order.items.map((itm: any, i: number) => (
                                  <div key={i} className="flex justify-between font-light">
                                    <span>{itm.productName} · Size {itm.size} x {itm.quantity}</span>
                                    <span className="font-mono font-medium">₹{((itm.price || 0) * 15).toLocaleString("en-IN")}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="flex justify-between items-center text-xs pt-1">
                                <div className="flex items-center gap-1.5 font-mono">
                                  <span className="w-2 h-2 rounded-full bg-moss animate-pulse" />
                                  <span className="text-moss text-[10px] uppercase font-bold tracking-wider">
                                    {order.status === "pending" ? "Warp Prep" : order.status === "processing" ? "Artisan Weaving" : order.status === "shipped" ? "Soil Transit" : "Arrived"}
                                  </span>
                                </div>
                                <div className="font-mono text-ink font-bold">
                                  Total: ₹{(order.totalAmount * 15).toLocaleString("en-IN")}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center space-y-3">
                        <p className="text-xs text-earth/50 italic font-mono">No garment trails recorded yet. Your unhurried travel coordinates are waiting to be woven.</p>
                        <button
                          onClick={() => { setActiveTab("store"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className="px-6 py-2 bg-ink hover:bg-moss text-linen text-[10px] font-mono uppercase tracking-widest rounded-sm cursor-pointer"
                        >
                          Begin Exploring
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
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



      {/* 8.8 MINIMAL CONTACT STRIP */}
      {(activeTab === "store" || activeTab === "story") && (
        <section className="relative z-10 bg-[#F5F0E8] py-12 px-4 sm:px-6 lg:px-8 border-t border-b border-terrain/20 w-full" id="contact-strip">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#1C2333]/70 block font-bold">Get In Touch</span>
              <p className="font-serif text-lg text-[#1C2333] font-light">Have questions about our garments or journeys?</p>
            </div>
            
            <div className="w-full max-w-xl md:w-auto">
              {!isContactSubmitted ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (contactName.trim() && contactEmail.trim()) {
                      setIsContactSubmitted(true);
                    }
                  }}
                  className="flex flex-col sm:flex-row items-center gap-3 w-full"
                >
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full sm:w-48 px-4 py-2.5 bg-[#F5F0E8] text-[#1C2333] border border-[#1C2333]/20 focus:border-[#1C2333] rounded-none text-xs placeholder-[#1C2333]/40 focus:outline-none transition font-sans focus:ring-0"
                  />
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Your Email"
                    className="w-full sm:w-64 px-4 py-2.5 bg-[#F5F0E8] text-[#1C2333] border border-[#1C2333]/20 focus:border-[#1C2333] rounded-none text-xs placeholder-[#1C2333]/40 focus:outline-none transition font-sans focus:ring-0"
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#1C2333] hover:bg-[#5C3A21] text-[#F5F0E8] text-xs font-mono uppercase tracking-widest transition-colors duration-300 rounded-none cursor-pointer whitespace-nowrap"
                  >
                    Get in Touch
                  </button>
                </form>
              ) : (
                <div className="py-2.5 px-6 bg-[#1C2333] text-[#F5F0E8] text-center rounded-none animate-fade-in">
                  <p className="font-serif text-xs uppercase tracking-wider">
                    Thank you, {contactName.split(" ")[0]}. We will be in touch shortly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 9. BRAND FOOTER */}
      <footer className="relative z-10 bg-[#1C2333] text-[#F5F0E8] py-16 border-t border-earth/10" id="brand-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Column 1: Brand Wordmark, Tagline & Social Media Icons */}
            <div className="space-y-5">
              <h3 className="font-serif text-4xl sm:text-5xl font-light tracking-widest text-[#F5F0E8]">vartman</h3>
              <p className="text-xs text-[#F5F0E8]/60 leading-relaxed font-sans font-light">
                Mindful traveling apparel woven in quiet collective environments. Crafted to celebrate the present and leave zero trace.
              </p>
              
              {/* Social Media Icons */}
              <div className="flex items-center gap-4 text-[#F5F0E8]/60">
                <a href="#instagram" className="hover:text-[#D9CBB0] transition duration-300" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#facebook" className="hover:text-[#D9CBB0] transition duration-300" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#twitter" className="hover:text-[#D9CBB0] transition duration-300" aria-label="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#youtube" className="hover:text-[#D9CBB0] transition duration-300" aria-label="Youtube">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#D9CBB0] block font-semibold">Explore</span>
              <ul className="space-y-2 text-xs text-[#F5F0E8]/75 font-sans font-light">
                <li>
                  <button 
                    onClick={() => { setActiveTab("story"); setSelectedProduct(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                    className="hover:text-[#D9CBB0] transition text-left"
                  >
                    Philosophy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setActiveTab("about"); setSelectedProduct(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                    className="hover:text-[#D9CBB0] transition text-left"
                  >
                    Founder Story
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setActiveTab("materials"); setSelectedProduct(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                    className="hover:text-[#D9CBB0] transition text-left"
                  >
                    Materials & Sourcing
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setActiveTab("faq"); setSelectedProduct(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                    className="hover:text-[#D9CBB0] transition text-left"
                  >
                    FAQs
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setActiveTab("shipping"); setSelectedProduct(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                    className="hover:text-[#D9CBB0] transition text-left"
                  >
                    Shipping & Returns
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setActiveTab("privacy"); setSelectedProduct(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                    className="hover:text-[#D9CBB0] transition text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setActiveTab("terms"); setSelectedProduct(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
                    className="hover:text-[#D9CBB0] transition text-left"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Seeker Assistance & Collections */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#D9CBB0] block font-semibold">Seeker Assistance</span>
              <ul className="space-y-2 text-xs text-[#F5F0E8]/75 font-sans font-light">
                <li>support@vartmangarments.com</li>
                <li>Complimentary Shipping Above ₹2,999</li>
                <li>14-Day Soil Return Trial</li>
                <li className="pt-2 border-t border-[#F5F0E8]/10 mt-2">
                  <span className="text-[9px] uppercase font-mono text-[#D9CBB0]/60 block mb-1">Our Clusters</span>
                  <button onClick={() => { setActiveTab("store"); setSelectedProduct(null); setSelectedMainFilter("LINEN"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-[#D9CBB0] transition text-left block">Loomed Linen</button>
                  <button onClick={() => { setActiveTab("store"); setSelectedProduct(null); setSelectedMainFilter("ORGANIC COTTON"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-[#D9CBB0] transition text-left block">Organic Cotton</button>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter (The Chronicle) */}
            <div className="space-y-3">
              <form 
                onSubmit={async (e) => { 
                  e.preventDefault(); 
                  const form = e.currentTarget;
                  const emailInput = form.elements.namedItem("chronicle_email") as HTMLInputElement;
                  const email = emailInput?.value || "";
                  if (email) {
                    try {
                      const res = await fetch("/api/waitlist", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, source: "footer_newsletter" })
                      });
                      const data = await res.json();
                      alert(data.message || "Thank you! You are subscribed to the chronicle.");
                      form.reset();
                    } catch (err) {
                      console.error("Newsletter error:", err);
                      alert("Captured your registration for the Vartman Chronicle!");
                    }
                  }
                }} 
                className="space-y-3"
              >
                <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#D9CBB0] block font-semibold">The Chronicle</span>
                <p className="text-xs text-[#F5F0E8]/60 font-sans font-light">
                  Receive botanical dye chronicles and slow travel itineraries.
                </p>
                <div className="flex border-b border-[#F5F0E8]/30 pb-2 pt-1">
                  <input 
                    name="chronicle_email"
                    type="email" 
                    required 
                    placeholder="Your email address" 
                    className="bg-transparent text-[#F5F0E8] text-xs focus:outline-none w-full placeholder-[#F5F0E8]/30 outline-none"
                  />
                  <button type="submit" className="text-[#F5F0E8] hover:text-[#D9CBB0] text-xs font-mono uppercase tracking-widest pl-2 outline-none">
                    →
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="pt-8 border-t border-[#F5F0E8]/10 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#F5F0E8]/40 gap-4">
            <span>© Vartman {new Date().getFullYear()}. All Rights Reserved.</span>
            <div className="flex gap-2">
              <span>Coded with Antigravity inside AI Studio</span>
            </div>
          </div>
        </div>
      </footer>

      {/* DIALOG 1: THE VARTMAN WAITLIST ENTRY */}
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
                    <h3 className="font-serif text-3xl font-bold text-[#2C2218]">Join Vartman</h3>
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
                              setIsCheckoutOpen(true);
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
                                  onClick={() => setSelectedUpiOption(item.id)}
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

                      <div className="mx-4 p-4 border border-[#E6E6E6] rounded-2xl bg-white mb-4 flex items-center justify-between cursor-default opacity-85 hover:opacity-100 transition">
                        <div className="flex items-center gap-3">
                          <Banknote className="w-5 h-5 text-gray-400" />
                          <h4 className="text-sm font-bold text-gray-800">Cash on Delivery</h4>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>

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

                      {/* Bottom Webhook Simulator Bar */}
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

      {/* DIALOG 2: SHOPPING BASKET & CHECKOUT SLIDE TRAY */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="relative bg-[#FAF9F5] border-l border-sand/40 w-full max-w-lg h-full shadow-2xl z-10 flex flex-col font-sans"
              id="checkout-tray-layer"
            >
              
              {/* Header */}
              <div className="p-4 border-b border-sand/40 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-moss/10 border border-moss/10 rounded">
                    <ShoppingBag className="w-5 h-5 text-moss" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink">Your Wanderlust Pack</h3>
                    <span className="text-xs text-linen/40 font-mono italic">Pack light, wander free</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1.5 hover:bg-sand/20 rounded text-ink/60 hover:text-ink transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SUCCESSFUL RESERVATION */}
              {orderSuccess ? (
                <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-moss/10 text-moss flex items-center justify-center border-2 border-moss shadow">
                    <Check className="w-10 h-10 stroke-[3]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif text-2xl font-bold text-ink">Wanderings confirmed!</h4>
                    <p className="text-linen/50 text-sm max-w-xs font-light">
                      Your vartman dispatch has been registered within our secure logs. We are wrapping your organic pieces in seed-infused bio paper.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-linen/40 rounded-lg w-full text-left space-y-2.5 border border-sand/40 font-mono text-xs text-ink/70">
                    <div className="flex justify-between border-b pb-1">
                      <span>Log Ticket Code:</span>
                      <span className="font-bold text-moss">{orderSuccess.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tracking Index:</span>
                      <span className="font-bold text-moss">{orderSuccess.trackingNumber || "Assigned shortly"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Consignee Email:</span>
                      <span className="font-bold">{orderSuccess.customerEmail}</span>
                    </div>
                    <div className="flex justify-between text-ink/85 font-bold border-t pt-1">
                      <span>Final Transaction Sum:</span>
                      <span>₹{Math.round(orderSuccess.total || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setOrderSuccess(null);
                      setIsCheckoutOpen(false);
                      setActiveTab("store");
                    }}
                    className="w-full py-3.5 bg-moss hover:bg-moss-hover text-linen rounded-lg text-sm font-semibold tracking-wide shadow transition"
                  >
                    Connect with Another Path
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto flex flex-col justify-between">
                  
                  {/* Dynamic Items list */}
                  <div className="p-4 space-y-4 flex-1">
                    {cart.length === 0 ? (
                      <div className="text-center py-20 space-y-4 flex flex-col items-center">
                        <ShoppingBag className="w-12 h-12 text-linen/60 stroke-[1]" />
                        <h4 className="font-serif text-lg font-bold text-ink">Wanderlust Pack is empty</h4>
                        <p className="text-linen/50 text-xs max-w-xs font-light leading-relaxed">
                          Check our coordinate catalog and select premium organic t-shirts crafted seamlessly for your outbound excursions!
                        </p>
                        <button
                          onClick={() => setIsCheckoutOpen(false)}
                          className="px-4 py-2 bg-moss text-white rounded text-xs font-bold hover:bg-moss-hover transition"
                        >
                          Explore T-Shirts
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 block">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-[#5A6351] font-bold block mb-2">Item overview ({cart.length})</span>
                        <div className="space-y-3">
                          {cart.map((itm, idx) => {
                            const itemImage = itm.selectedVariant?.images?.[0] || itm.product.images?.[0];
                            return (
                              <div 
                                key={`${itm.product.id}-${itm.selectedSize}-${idx}`}
                                className="bg-white p-3 rounded-lg border border-sand/40 flex gap-3 items-center"
                              >
                                <img 
                                  src={getDirectImageUrl(itemImage) || null} 
                                  alt="" 
                                  className="w-16 h-16 object-contain p-1 bg-[#f0eae1] rounded border border-sand/40"
                                />
                                <div className="flex-1 space-y-1">
                                  <h5 className="font-serif font-bold text-ink text-sm line-clamp-1">{itm.product.name}</h5>
                                  {itm.selectedVariant && (
                                    <div className="text-[9px] font-mono text-amber-700 uppercase font-semibold">
                                      <span>Variant: {itm.selectedVariant.color} ({itm.selectedVariant.design})</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-[10px] font-mono text-linen/50 uppercase">
                                    <span>Size: <strong className="text-moss">{itm.selectedSize}</strong></span>
                                    <span>•</span>
                                    <span>Unit Cost: ₹{Math.round(itm.selectedVariant 
                                      ? (itm.selectedVariant.sellingPrice || itm.selectedVariant.price || itm.product.price)
                                      : (itm.product.sellingPrice || itm.product.price)).toLocaleString("en-IN")}</span>
                                  </div>
                                  <div className="flex items-center gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => updateCartQty(itm.product.id, itm.selectedSize || "Standard", -1, itm.selectedVariant)}
                                      className="p-1 bg-linen/40 hover:bg-sand/30 rounded text-ink/90 transition text-xs font-mono font-bold"
                                    >
                                      -
                                    </button>
                                    <span className="text-xs font-mono font-bold px-1">{itm.quantity}</span>
                                    <button
                                      type="button"
                                      onClick={() => updateCartQty(itm.product.id, itm.selectedSize || "Standard", 1, itm.selectedVariant)}
                                      className="p-1 bg-linen/40 hover:bg-sand/30 rounded text-ink/90 transition text-xs font-mono font-bold"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(itm.product.id, itm.selectedSize || "Standard", itm.selectedVariant)}
                                className="p-2 hover:bg-red-50 text-red-600/80 hover:text-red-600 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center border border-red-100"
                                title="Remove piece"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            );
                          })}
                        </div>

                        {/* COUPLER PROMO CODE ENTRY */}
                        <div className="pt-4 border-t border-sand/40">
                          <label className="text-[10px] uppercase font-mono tracking-widest text-linen/50 font-bold block mb-1.5">Apply Wilderness Voucher</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              placeholder="e.g., WANDERLUST, PEACE10"
                              className="flex-1 pl-3 bg-white border border-sand rounded text-xs font-mono placeholder-stone-400 focus:outline-none focus:border-moss/30 transition uppercase"
                            />
                            <button
                              type="button"
                              onClick={handleValidateCoupon}
                              className="px-4 py-2 bg-ink hover:bg-ink/90 text-linen text-xs font-bold rounded transition"
                            >
                              Verify Code
                            </button>
                          </div>
                          {couponError && (
                            <span className="text-red-600 text-[10px] block mt-1 font-mono">{couponError}</span>
                          )}
                          {couponSuccess && (
                            <span className="text-emerald-700 text-[10px] font-bold block mt-1 font-mono">{couponSuccess}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SHIPPING & TRANSACTION INFO */}
                  {cart.length > 0 && (
                    <form onSubmit={handlePlaceOrder} className="bg-white p-4 border-t border-sand/40 space-y-4">
                      
                      <div className="space-y-2.5">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-[#5A6351] font-bold block">Outbound Shipping Details</span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Full Name"
                            value={shippingForm.name}
                            onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                            className="bg-[#FAF9F5] border border-sand rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-moss/30"
                          />
                          <input
                            type="email"
                            required
                            placeholder="Email Address"
                            value={shippingForm.email}
                            onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                            className="bg-[#FAF9F5] border border-sand rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-moss/30"
                          />
                        </div>

                        <input
                          type="text"
                          required
                          placeholder="Street Address"
                          value={shippingForm.street}
                          onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                          className="w-full bg-[#FAF9F5] border border-sand rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-moss/30"
                        />

                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="City"
                            value={shippingForm.city}
                            onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                            className="bg-[#FAF9F5] border border-sand rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-moss/30"
                          />
                          <input
                            type="text"
                            required
                            placeholder="State"
                            value={shippingForm.state}
                            onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                            className="bg-[#FAF9F5] border border-sand rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-moss/30"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Zip"
                            value={shippingForm.zip}
                            onChange={(e) => setShippingForm({ ...shippingForm, zip: e.target.value })}
                            className="bg-[#FAF9F5] border border-sand rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-moss/30"
                          />
                        </div>

                        {/* Payment Method Selector */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-[#5A6351] font-bold block">Secure Payment Method</span>
                          <div className="grid grid-cols-2 gap-2">
                            {paymentPublicConfig.prepaidEnabled !== false && (
                              <button
                                type="button"
                                onClick={() => setPaymentOption("prepaid")}
                                className={`py-2.5 px-3 rounded text-xs font-mono border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                                  paymentOption === "prepaid"
                                    ? "bg-moss text-[#FAF9F5] border-moss font-bold shadow-sm"
                                    : "bg-[#FAF9F5] text-ink/70 border-sand/40 hover:bg-sand/10"
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Prepaid</span>
                                </div>
                                <span className="text-[8px] opacity-70 font-normal leading-tight">Pay full amount now</span>
                              </button>
                            )}

                            {paymentPublicConfig.codEnabled !== false && (
                              <button
                                type="button"
                                onClick={() => setPaymentOption("cod")}
                                className={`py-2.5 px-3 rounded text-xs font-mono border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                                  paymentOption === "cod"
                                    ? "bg-moss text-[#FAF9F5] border-moss font-bold shadow-sm"
                                    : "bg-[#FAF9F5] text-ink/70 border-sand/40 hover:bg-sand/10"
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <Banknote className="w-3.5 h-3.5" />
                                  <span>COD</span>
                                </div>
                                <span className="text-[8px] opacity-70 font-normal leading-tight">₹200 advance, rest on delivery</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Calculations total sum box */}
                      <div className="p-3 bg-linen/20 rounded-lg space-y-1.5 text-xs border border-sand/40">
                        <div className="flex justify-between">
                          <span className="text-linen/50">Excursions Subtotal:</span>
                          <span className="font-mono text-ink font-semibold">₹{Math.round(cartSubtotal || 0).toLocaleString("en-IN")}</span>
                        </div>
                        {appliedCoupon && (
                          <div className="flex justify-between text-moss">
                            <span>Promo Discount ({appliedCoupon.code}):</span>
                            <span className="font-mono font-bold">-₹{Math.round(discountAmount || 0).toLocaleString("en-IN")}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-linen/50 font-light">Earthy Packaging & Shipping:</span>
                          <span className="font-mono">
                            {shippingCost === 0 ? <strong className="text-moss text-[10px]">PLEDGE FREE SHIPPING</strong> : `₹${Math.round(shippingCost || 0).toLocaleString("en-IN")}`}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-sand/40 pt-1.5 text-sm font-bold text-[#1C1F22]">
                          <span>Journey Reserves Secure Total:</span>
                          <span className="font-mono font-extrabold text-emerald-950">₹{Math.round(cartTotal || 0).toLocaleString("en-IN")}</span>
                        </div>
                        {shippingCost > 0 && (
                          <div className="text-[10px] text-linen/40 font-mono italic pt-0.5">
                            (Spend ₹{ Math.round(Math.max(0, 8500 - (cartSubtotal || 0))).toLocaleString("en-IN") } more to secure complementary shipping!)
                          </div>
                        )}

                        {paymentOption === "cod" && (
                          <div className="border-t border-dashed border-sand/40 pt-1.5 space-y-1 text-[11px] font-mono">
                            <div className="flex justify-between text-amber-800 font-bold">
                              <span>Advance Due Now (INR):</span>
                              <span>₹200</span>
                            </div>
                            <div className="flex justify-between text-linen/60 font-medium">
                              <span>Remaining Cash On Delivery:</span>
                              <span>₹{Math.round(Math.max(0, cartTotal - 200)).toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingOrder}
                        className="w-full py-3.5 bg-moss hover:bg-moss disabled:opacity-50 text-white font-serif font-semibold tracking-wide rounded-lg shadow-lg hover:shadow-emerald-990/10 cursor-pointer block"
                        id="checkout-place-order-btn"
                      >
                        {isSubmittingOrder 
                          ? "Establishing satellite corridor..." 
                          : paymentOption === "cod"
                            ? "Dispatch COD (Pay ₹200 Advance)"
                            : `Dispatch Wardrobe Route (₹${Math.round(cartTotal || 0).toLocaleString("en-IN")})`
                        }
                      </button>

                    </form>
                  )}

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                                  setSelectedProduct(prd);
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
                                    setIsCheckoutOpen(true);
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
              className="relative bg-white border border-sand/40 rounded-2xl p-6 sm:p-8 max-w-md w-full z-10 space-y-6"
              id="auth-credentials-modal"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded hover:bg-sand/20 text-linen/40 hover:text-ink transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-moss/10 text-moss mx-auto flex items-center justify-center">
                  <UserIcon className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-xl font-bold text-ink">
                  {authMode === "login" ? "Outbound Seeker Connect" : "Create Wilderness Coordinates"}
                </h4>
                <p className="text-linen/50 text-xs font-light">
                  {authMode === "login" 
                    ? "Connect your email credentials to access tracking histories" 
                    : "Establish a secure profile to track your garment trails"
                  }
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 rounded font-mono">
                  {authError}
                </div>
              )}
              {authSuccess && (
                <div className="p-3 bg-moss/10 text-moss text-xs font-bold border border-moss/20 rounded font-mono">
                  {authSuccess}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                
                {authMode === "register" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-linen/70">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Arjun Verma"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-linen/20 border border-sand rounded text-sm placeholder-stone-400 focus:outline-none focus:border-moss/30"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-linen/70">Registered Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@vartman.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-linen/20 border border-sand rounded text-sm placeholder-stone-400 focus:outline-none focus:border-moss/30"
                  />
                  {authForm.email === "admin@vartman.com" && (
                    <span className="text-[10px] text-moss block font-mono font-bold">Admin credentials loaded. Passcode: admin@123</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-linen/70">Account Passcode</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-linen/20 border border-sand rounded text-sm placeholder-stone-400 focus:outline-none focus:border-moss/30"
                  />
                </div>

                {authMode === "register" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold text-linen/70">Quick Destination Address (Optional)</label>
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={authForm.street}
                        onChange={(e) => setAuthForm({ ...authForm, street: e.target.value })}
                        className="w-full px-3 py-1.5 bg-linen/20 border border-sand rounded text-xs"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={authForm.city}
                          onChange={(e) => setAuthForm({ ...authForm, city: e.target.value })}
                          className="px-2 py-1 bg-linen/20 border border-sand rounded text-xs"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={authForm.state}
                          onChange={(e) => setAuthForm({ ...authForm, state: e.target.value })}
                          className="px-2 py-1 bg-linen/20 border border-sand rounded text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Zip"
                          value={authForm.zip}
                          onChange={(e) => setAuthForm({ ...authForm, zip: e.target.value })}
                          className="px-2 py-1 bg-linen/20 border border-sand rounded text-xs"
                        />
                      </div>
                    </div>

                    {authForm.email.toLowerCase().trim() === "admin@vartman.com" && (
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="isAdminRegister"
                          checked={authForm.isAdminRegister}
                          onChange={(e) => setAuthForm({ ...authForm, isAdminRegister: e.target.checked })}
                          className="rounded accent-moss"
                        />
                        <label htmlFor="isAdminRegister" className="text-xs font-mono text-linen/50 cursor-pointer">
                          Register with Admin privileges (Demonstration control)
                        </label>
                      </div>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-moss hover:bg-moss-hover text-white text-sm font-semibold rounded transition cursor-pointer"
                  id="auth-submit-btn"
                >
                  {authMode === "login" ? "Sign In Outbound" : "Register Coordinates"}
                </button>
              </form>

              <div className="text-center text-xs">
                {authMode === "login" ? (
                  <span>
                    No coordinates?{" "}
                    <button 
                      onClick={() => { setAuthMode("register"); setAuthError(""); }}
                      className="text-moss font-bold underline focus:outline-none"
                    >
                      Establish a Member Profile here
                    </button>
                  </span>
                ) : (
                  <span>
                    Already verified?{" "}
                    <button 
                      onClick={() => { setAuthMode("login"); setAuthError(""); }}
                      className="text-moss font-bold underline focus:outline-none"
                    >
                      Return to Sign-In gate
                    </button>
                  </span>
                )}
              </div>

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
                    setIsCheckoutOpen(true);
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

      {/* FLOATING BOTTOM CONSOLE LAUNCHER */}
      <AIConsole
        isOpen={isAIConsoleOpen}
        onClose={() => setIsAIConsoleOpen(false)}
        cartItems={cart}
        activeProductId={selectedProduct?.id}
      />

      {/* GLOBAL TOAST NOTIFICATION FOR WISHLIST & CART */}
      <AnimatePresence>
        {(wishlistToast || cartToast) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[200] bg-[#1C2333] text-[#FAF9F5] border border-[#D9CBB0]/30 px-5 py-3.5 rounded-sm shadow-2xl flex items-center gap-3 text-xs font-mono font-medium max-w-sm pointer-events-none"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>{wishlistToast || cartToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
}

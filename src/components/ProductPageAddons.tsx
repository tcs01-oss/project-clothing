import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  Leaf, 
  ThumbsUp, 
  ThumbsDown, 
  Star,
  MapPin,
  Clock,
  Award
} from "lucide-react";
import { Product } from "../types";

// ==========================================
// 1. BANK OFFERS COMPONENT
// ==========================================
interface BankOffersProps {
  sellingPrice: number;
  onApplyPromoCode: (code: string, discount: number) => void;
}

export const BankOffers: React.FC<BankOffersProps> = ({ sellingPrice, onApplyPromoCode }) => {
  const [activeCode, setActiveCode] = useState<string | null>(null);

  const offers = [
    {
      id: "VARTMAN10",
      type: "instant",
      title: "10% INSTANT DISCOUNT",
      description: "Get 10% instant discount up to ₹1,000 on ICICI and HDFC Bank Credit Cards.",
      code: "VARTMAN10",
      calcDiscount: (price: number) => Math.min(price * 0.1, 1000),
    },
    {
      id: "CAPSULE15",
      type: "coupon",
      title: "CAPSULE WARDROBE OFFERS",
      description: "Buy 2 items and apply CAPSULE15 to save flat ₹500 on your luxury travel selection.",
      code: "CAPSULE15",
      calcDiscount: () => 500,
    },
    {
      id: "AXISFEST",
      type: "cashback",
      title: "AXIS UNLIMITED CASHBACK",
      description: "5% unlimited cashback on Axis Bank Vartman Signature Cards.",
      code: "AXISFEST",
      calcDiscount: (price: number) => price * 0.05,
    }
  ];

  const handleApply = (code: string, calcFn: (price: number) => number) => {
    if (activeCode === code) {
      // Toggle off
      setActiveCode(null);
      onApplyPromoCode("", 0);
    } else {
      setActiveCode(code);
      const discount = Math.round(calcFn(sellingPrice));
      onApplyPromoCode(code, discount);
    }
  };

  return (
    <div className="space-y-3.5 border border-[#1C2333]/15 p-4 rounded-sm bg-white/40">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase text-earth/50 tracking-widest font-bold block">Available Offers & Promotions</span>
        <span className="text-[9px] font-mono bg-[#B5652F]/10 text-[#B5652F] px-2 py-0.5 rounded-xs font-bold uppercase">3 Offers Active</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {offers.map((offer) => {
          const discountAmt = Math.round(offer.calcDiscount(sellingPrice));
          const isApplied = activeCode === offer.code;

          return (
            <div 
              key={offer.id} 
              className={`border p-3 rounded-sm flex flex-col justify-between text-left transition duration-300 ${
                isApplied 
                  ? "border-[#B5652F] bg-[#FAF9F5] shadow-xs" 
                  : "border-terrain/10 bg-white/60 hover:bg-white"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#1C2333]">
                  <CreditCard className="w-3.5 h-3.5 text-moss shrink-0" />
                  <span className="truncate">{offer.title}</span>
                </div>
                <p className="text-[10px] text-earth/80 font-mono leading-relaxed line-clamp-3">
                  {offer.description}
                </p>
              </div>

              <div className="pt-2.5 mt-2 border-t border-terrain/10 flex items-center justify-between gap-1">
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono text-earth/50 uppercase">Savings</span>
                  <span className="text-[11px] font-mono font-bold text-moss">₹{discountAmt} Off</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleApply(offer.code, offer.calcDiscount)}
                  className={`px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-wider rounded-xs transition duration-200 cursor-pointer ${
                    isApplied 
                      ? "bg-[#1C2333] text-white" 
                      : "bg-[#FAF9F5] text-ink border border-terrain hover:bg-white"
                  }`}
                >
                  {isApplied ? "Applied" : "Apply"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// ==========================================
// 2. ADVANCED DELIVERY COMPONENT
// ==========================================
interface AdvancedDeliveryProps {
  brandName?: string;
}

export const AdvancedDelivery: React.FC<AdvancedDeliveryProps> = ({ brandName = "Vartman Express" }) => {
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "delivered" | "error">("idle");
  const [deliveryInfo, setDeliveryInfo] = useState<{ date: string; fee: string } | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length !== 6 || isNaN(Number(pincode))) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    setTimeout(() => {
      // Mock some logical dates based on Indian pincodes
      const days = pincode.startsWith("11") || pincode.startsWith("40") || pincode.startsWith("56") ? 2 : 4;
      const date = new Date();
      date.setDate(date.getDate() + days);
      const formattedDate = date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
      
      setDeliveryInfo({
        date: formattedDate,
        fee: "COMPLIMENTARY EXPRESS DELIVERY"
      });
      setStatus("delivered");
    }, 1200);
  };

  return (
    <div className="bg-white/60 border border-[#1C2333]/10 p-4 rounded-sm space-y-3 text-left">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-moss shrink-0" />
        <span className="text-[10px] font-mono uppercase text-earth/50 tracking-widest font-bold">Check Local Delivery Timeline</span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, ""));
            if (status !== "idle") setStatus("idle");
          }}
          placeholder="Enter 6-digit Pincode"
          className="flex-1 bg-white border border-terrain text-ink text-[11px] font-mono px-3 py-2 rounded-xs focus:outline-none focus:border-[#1C2333]"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-[#1C2333] hover:bg-moss text-white text-[10px] font-mono uppercase tracking-widest px-4 py-2 font-bold transition duration-300 disabled:opacity-50 cursor-pointer rounded-xs"
        >
          {status === "loading" ? "Checking..." : "Verify"}
        </button>
      </form>

      {status === "error" && (
        <p className="text-[10px] font-mono text-red-600 font-bold uppercase">✕ Please enter a valid 6-digit postal code.</p>
      )}

      {status === "delivered" && deliveryInfo && (
        <div className="bg-[#FAF9F5] border border-moss/10 p-3 rounded-xs space-y-2 font-mono">
          <div className="flex items-center gap-2 text-moss">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-bold uppercase">Estimated Delivery: {deliveryInfo.date}</span>
          </div>
          <div className="space-y-1 pl-6 text-[10px] text-earth/80">
            <p>• Dispatch within 12 hours via <span className="font-bold text-[#1C2333]">{brandName}</span> premium air priority.</p>
            <p>• Shipping Charge: <span className="text-moss font-bold">{deliveryInfo.fee}</span></p>
            <p>• Contactless premium delivery and transit tracking logs will be emailed.</p>
          </div>
        </div>
      )}

      {status === "idle" && (
        <div className="flex items-center gap-2 pl-1.5 text-[9px] font-mono text-earth/50">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>Typically delivers in 2-3 days for metros, 3-5 days for other regions.</span>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 3. PDP TRUST BADGES COMPONENT
// ==========================================
export const TrustBadges: React.FC = () => {
  const badges = [
    {
      id: "secure",
      icon: <ShieldCheck className="w-5 h-5 text-moss" />,
      title: "AUTHENTIC & SECURE",
      desc: "100% genuine luxury wear with sealed microtags"
    },
    {
      id: "craft",
      icon: <Award className="w-5 h-5 text-moss" />,
      title: "ARTISANAL LEGACY",
      desc: "Individually loomed by certified weaver guilds"
    },
    {
      id: "eco",
      icon: <Leaf className="w-5 h-5 text-moss" />,
      title: "BOTANICAL CORES",
      desc: "Colored with organic dyes, completely chemical-free"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1.5 text-left">
      {badges.map((b) => (
        <div key={b.id} className="flex gap-3 bg-[#FAF9F5]/80 border border-[#1C2333]/5 p-3 rounded-sm">
          <div className="shrink-0 pt-0.5">{b.icon}</div>
          <div className="space-y-0.5">
            <h4 className="text-[9px] font-mono font-bold text-[#1C2333] tracking-wider uppercase">{b.title}</h4>
            <p className="text-[9px] font-mono text-earth/70 leading-normal uppercase">{b.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
};


// ==========================================
// 4. SPECSGRID COMPONENT (RATINGS & REVIEWS MODULE)
// ==========================================
interface SpecsGridProps {
  product: Product;
  onOpenAuth?: () => void;
  currentUser?: any;
}

export const SpecsGrid: React.FC<SpecsGridProps> = ({ product, onOpenAuth, currentUser }) => {
  const [activeTab, setActiveTab] = useState<"specs" | "narrative" | "artisan">("specs");
  const [fetchedReviews, setFetchedReviews] = useState<any[]>([]);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!product?.id) return;
    const loadReviews = async () => {
      try {
        const res = await fetch(`/api/products/${product.id}/reviews`);
        if (res.ok) {
          const data = await res.json();
          setFetchedReviews(data);
        }
      } catch (e) {
        console.error("Failed to load reviews", e);
      }
    };
    loadReviews();
  }, [product?.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: currentUser?.name || currentUser?.email || "ANONYMOUS",
          userEmail: currentUser?.email || "",
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
      if (res.ok) {
        setNewReview({ rating: 5, comment: "" });
        setShowWriteForm(false);
        const updated = await fetch(`/api/products/${product.id}/reviews`);
        if (updated.ok) setFetchedReviews(await updated.json());
      }
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultReviews = [
    {
      id: "rev1",
      author: "SIDDHARTH R.",
      date: "JULY 12, 2026",
      rating: 5,
      comment: "Substantial yet remarkably breathable linen. Wore it on an 8-hour flight and arrived feeling comfortable and wrinkle-relaxed. A staple piece."
    },
    {
      id: "rev2",
      author: "MEERA PATEL",
      date: "JULY 05, 2026",
      rating: 5,
      comment: "The botanical dye has a subtle organic depth that looks exceptionally rich in natural daylight. Truly stands out as a quiet luxury garment."
    },
    {
      id: "rev3",
      author: "ANANYA S.",
      date: "JUNE 28, 2026",
      rating: 5,
      comment: "Impeccable hand-loomed texture with a beautifully relaxed fit. Pays immense attention to detail with natural mother-of-pearl buttons."
    }
  ];

  const allReviews = [
    ...fetchedReviews.map(f => ({
      id: f.id || Math.random().toString(),
      author: (f.userName || "VERIFIED BUYER").toUpperCase(),
      date: (f.date || "RECENTLY").toUpperCase(),
      rating: f.rating || 5,
      comment: f.comment
    })),
    ...defaultReviews
  ];

  return (
    <div className="space-y-10 text-left py-2">
      {/* ==================== UPPER SECTION: PRODUCT DETAILS TABS ==================== */}
      <div className="space-y-5">
        {/* Tab Navigation Menu */}
        <div className="flex border-b border-[#1C2333]/15">
          {[
            { id: "specs", label: "SPECIFICATIONS" },
            { id: "narrative", label: "PRODUCT NARRATIVE" },
            { id: "artisan", label: "ARTISAN & CARE" }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 py-3 text-center text-[10px] font-mono uppercase tracking-widest border-b-2 font-bold cursor-pointer transition-all duration-300 ${
                activeTab === t.id 
                  ? "border-[#1C2333] text-[#1C2333]" 
                  : "border-transparent text-[#1C2333]/50 hover:text-[#1C2333]/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content Box */}
        <div className="bg-[#FAF9F5] p-5 sm:p-6 rounded-sm border border-[#1C2333]/10 min-h-[200px] transition-all duration-300">
          {activeTab === "specs" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shirt / Top Details */}
                <div className="space-y-3">
                  <h5 className="font-mono text-[10px] font-bold text-[#1C2333] uppercase tracking-widest border-b border-[#1C2333]/15 pb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1C2333]"></span>
                    Shirt & Fabric Specifications
                  </h5>
                  <div className="space-y-2.5">
                    {[
                      { key: "MATERIAL & WEAVE", value: "100% Certified Organic Belgian Flax Linen (175 GSM)" },
                      { key: "SILHOUETTE / FIT", value: "Textured Camp Collar with relaxed unstructured drape" },
                      { key: "WEAVE DENSITY", value: "Lightweight, breathable open-weave construction" },
                      { key: "BUTTON DETAILS", value: "Sustainably harvested genuine Mother-of-Pearl shell buttons" }
                    ].map((item) => (
                      <div key={item.key} className="border-b border-[#1C2333]/10 pb-2 flex flex-col gap-0.5 text-left">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[#1C2333]/60 font-medium">
                          {item.key}
                        </span>
                        <span className="font-serif text-[13px] text-[#1C2333] leading-normal font-medium">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trouser / Craft Details */}
                <div className="space-y-3">
                  <h5 className="font-mono text-[10px] font-bold text-[#1C2333] uppercase tracking-widest border-b border-[#1C2333]/15 pb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1C2333]"></span>
                    Construction & Finishing
                  </h5>
                  <div className="space-y-2.5">
                    {[
                      { key: "MATERIAL & COMPOSITION", value: "100% Premium Organic Flax Linen (Pre-Shrunk)" },
                      { key: "FIT PROFILE", value: "Flowing Elasticated Trousers with loose straight-leg cut" },
                      { key: "POCKET COORDINATES", value: "Dual deep-seated side pockets & single reverse welt pocket" },
                      { key: "WAISTBAND CORES", value: "High-density elastic waistband with inner natural drawstring cord" }
                    ].map((item) => (
                      <div key={item.key} className="border-b border-[#1C2333]/10 pb-2 flex flex-col gap-0.5 text-left">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-[#1C2333]/60 font-medium">
                          {item.key}
                        </span>
                        <span className="font-serif text-[13px] text-[#1C2333] leading-normal font-medium">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "narrative" && (
            <div className="space-y-4 font-serif text-[13.5px] text-[#1C2333]/90 leading-relaxed max-w-2xl animate-fadeIn">
              <div className="flex items-center gap-2 text-[#1C2333] font-bold uppercase text-[9px] font-mono tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#1C2333]" />
                <span>Garment Legacy</span>
              </div>
              
              <p>
                Conceived as an effortless capsule for modern nomads, this piece captures the quiet confidence of relaxed linen wear. Every yarn is spun with patience, preserving the natural slub of organic Belgian flax to create a texture that feels deeply tactile and alive.
              </p>

              <blockquote className="border-l-2 border-[#1C2333] pl-4 italic text-[#1C2333] font-serif my-4 text-[14px] bg-white/50 py-2 pr-2">
                "{product.inspiration || "A quiet study in linen. Designed to exist beautifully in motion, catching the sea wind and softening with every sunset."}"
              </blockquote>

              <p>
                Its design ignores fleeting trends, prioritizing an unstructured silhouette that rests weightlessly on the shoulders. Intended to pair seamlessly, it serves as the foundation for a highly curated travel wardrobe.
              </p>
            </div>
          )}

          {activeTab === "artisan" && (
            <div className="space-y-5 animate-fadeIn">
              {/* Care Icons List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex gap-3 items-start bg-white/60 p-3 rounded-sm border border-[#1C2333]/10">
                  <RotateCcw className="w-4 h-4 text-[#1C2333] shrink-0 mt-0.5" />
                  <div className="text-left">
                    <span className="font-mono text-[9px] font-bold text-[#1C2333] uppercase tracking-wider block">COLD HAND WASH</span>
                    <span className="font-sans text-[11px] text-[#1C2333]/70">Use pH-neutral organic soap. Do not wring.</span>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start bg-white/60 p-3 rounded-sm border border-[#1C2333]/10">
                  <Leaf className="w-4 h-4 text-[#1C2333] shrink-0 mt-0.5" />
                  <div className="text-left">
                    <span className="font-mono text-[9px] font-bold text-[#1C2333] uppercase tracking-wider block">DRY FLAT IN SHADE</span>
                    <span className="font-sans text-[11px] text-[#1C2333]/70">Reshape while damp. Avoid direct blazing sunlight.</span>
                  </div>
                </div>

                <div className="flex gap-3 items-start bg-white/60 p-3 rounded-sm border border-[#1C2333]/10">
                  <Sparkles className="w-4 h-4 text-[#1C2333] shrink-0 mt-0.5" />
                  <div className="text-left">
                    <span className="font-mono text-[9px] font-bold text-[#1C2333] uppercase tracking-wider block">IRON INSIDE-OUT</span>
                    <span className="font-sans text-[11px] text-[#1C2333]/70">Iron on warm setting while slightly damp.</span>
                  </div>
                </div>
              </div>

              {/* Artisan Cooperative Note */}
              <div className="pt-4 border-t border-[#1C2333]/10 space-y-2">
                <span className="font-mono text-[9px] font-bold text-[#1C2333] uppercase tracking-widest block">ARTISAN WEAVER COOPERATIVE</span>
                <p className="font-serif text-[13px] text-[#1C2333]/90 leading-relaxed">
                  Hand-spun and loomed at certified weaver guilds in West Bengal and Uttar Pradesh, India. Each piece preserves age-old local techniques while ensuring guaranteed fair living wages, healthcare, and ecological preservation parameters for the weaver families.
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <CheckCircle className="w-4 h-4 text-[#1C2333]" />
                  <span className="font-mono text-[8px] text-[#1C2333] uppercase tracking-widest font-bold">100% Certified Ethical Looming</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thin Horizontal Divider */}
      <hr className="border-t border-[#1C2333]/15 my-6" />

      {/* ==================== LOWER SECTION: RATINGS & REVIEWS ==================== */}
      {/* 2. LEAVE A REVIEW CALL-TO-ACTION */}
      <div className="pb-6 border-b border-[#1C2333]/15 space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#1C2333]">
          LEAVE A REVIEW
        </h4>
        <p className="text-xs font-sans text-[#1C2333]/70 font-light">
          {currentUser ? `Logged in as ${currentUser.name || currentUser.email}. Share your thoughts on this garment.` : "Log in to share your thoughts on this garment."}
        </p>
        <div>
          <button
            type="button"
            onClick={() => {
              if (currentUser) {
                setShowWriteForm(!showWriteForm);
              } else if (onOpenAuth) {
                onOpenAuth();
              }
            }}
            className="w-full sm:w-auto text-center py-2.5 px-6 bg-[#FAF9F5] hover:bg-white border border-[#1C2333]/30 hover:border-[#1C2333]/60 text-[#1C2333] hover:text-black text-[10px] font-mono uppercase tracking-widest transition duration-300 rounded-sm flex items-center justify-center gap-2 cursor-pointer font-bold"
          >
            {currentUser ? (showWriteForm ? "CANCEL REVIEW" : "WRITE A REVIEW") : "LOG IN"}
          </button>
        </div>

        {/* Inline review form when logged in */}
        {showWriteForm && currentUser && (
          <form onSubmit={handleReviewSubmit} className="pt-4 space-y-3 border-t border-[#1C2333]/10 mt-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 font-bold">RATING:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="p-0.5 cursor-pointer text-[#1C2333]"
                  >
                    <Star className={`w-4 h-4 ${star <= newReview.rating ? "fill-[#1C2333] text-[#1C2333]" : "text-[#1C2333]/20"}`} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={3}
              required
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share your thoughts on the fit, fabric, and craftsmanship..."
              className="w-full bg-[#FAF9F5] border border-[#1C2333]/20 rounded-sm p-3 text-xs font-sans text-[#1C2333] focus:outline-none focus:border-[#1C2333]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-6 bg-[#FAF9F5] hover:bg-white border border-[#1C2333]/30 text-[#1C2333] hover:text-black text-[10px] font-mono uppercase tracking-widest transition duration-300 rounded-sm cursor-pointer font-bold"
            >
              {isSubmitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
            </button>
          </form>
        )}
      </div>

      {/* 3. CUSTOMER REVIEWS FEED */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#1C2333]">
          CUSTOMER REVIEWS
        </h4>

        <div className="divide-y divide-[#1C2333]/10">
          {allReviews.map((review) => (
            <div key={review.id} className="py-4 space-y-2 text-left">
              {/* Header: Reviewer Name & Date */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1C2333]">
                  {review.author}
                </span>
                <span className="font-mono text-[10px] text-[#1C2333]/50 uppercase tracking-wider">
                  {review.date}
                </span>
              </div>

              {/* 4. Rating: 5-star display below name (Monochrome/premium solid black active stars) */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= review.rating
                        ? "fill-[#1C2333] text-[#1C2333]"
                        : "text-[#1C2333]/20"
                    }`}
                  />
                ))}
              </div>

              {/* Body: Clean body font with ample padding */}
              <p className="font-sans text-xs sm:text-[13px] text-[#1C2333]/85 leading-relaxed font-light pt-1">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// ==========================================
// 5. REVIEWSECTION COMPONENT
// ==========================================
interface ReviewSectionProps {
  product: Product;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ product }) => {
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [clickedActions, setClickedActions] = useState<Record<string, boolean>>({});
  const [fetchedReviews, setFetchedReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [newReview, setNewReview] = useState({
    userName: "",
    userEmail: "",
    rating: 5,
    comment: ""
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const ratingAvg = product.ratingAvg || product.rating || 4.8;
  const reviewsCount = (product.reviewsCount || 168) + fetchedReviews.length;

  const loadProductReviews = async () => {
    if (!product?.id) return;
    setIsLoadingReviews(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setFetchedReviews(data);
      }
    } catch (e) {
      console.error("Failed to load product reviews", e);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadProductReviews();
  }, [product?.id]);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.userName || !newReview.comment) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setShowWriteModal(false);
          setNewReview({ userName: "", userEmail: "", rating: 5, comment: "" });
        }, 2000);
        loadProductReviews();
      }
    } catch (err) {
      console.error("Failed to post review", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Horizontal meter metrics
  const reviewAspects = [
    { label: "Fabric Feel", score: 98 },
    { label: "Fit Accuracy", score: 95 },
    { label: "Color Retention", score: 96 }
  ];

  const defaultReviews = [
    {
      id: "rev1",
      author: "Siddharth R.",
      date: "July 12, 2026",
      rating: 5,
      comment: "Absolutely top-tier linen material. The weight is substantial but remarkably breathable. I wore it during an 8-hour flight and arrived feeling completely comfortable and wrinkle-relaxed. A must-buy.",
      sizePurchased: "M",
      initialHelpful: 14
    },
    {
      id: "rev2",
      author: "Meera Patel",
      date: "July 05, 2026",
      rating: 5,
      comment: "The dye has this beautiful, earthy organic unevenness that looks incredibly rich. Truly stands out as a luxurious handcrafted garment. Planning to purchase the charcoal pants next.",
      sizePurchased: "S",
      initialHelpful: 9
    }
  ];

  const allDisplayedReviews = [
    ...fetchedReviews.map(f => ({
      id: f.id,
      author: f.userName,
      date: f.date,
      rating: f.rating,
      comment: f.comment,
      sizePurchased: "M",
      initialHelpful: 0
    })),
    ...defaultReviews
  ];

  const handleHelpfulClick = (reviewId: string) => {
    if (clickedActions[reviewId]) return;
    setClickedActions({ ...clickedActions, [reviewId]: true });
    setLikes({ ...likes, [reviewId]: (likes[reviewId] || 0) + 1 });
  };

  return (
    <div className="space-y-8 text-left py-4">
      {/* Title block with Write Review button */}
      <div className="border-b border-[#1C2333]/10 pb-4 flex items-center justify-between">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-earth/60">
          VERIFIED CUSTOMER LOGS
        </h3>
        <button
          onClick={() => setShowWriteModal(true)}
          className="px-3 py-1.5 bg-moss text-white rounded text-[11px] font-mono uppercase tracking-wider font-bold hover:bg-moss/90 cursor-pointer transition shadow-xs"
        >
          + Write Review
        </button>
      </div>

      {/* Submit Review Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4 shadow-2xl text-ink">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-serif text-lg font-bold">Write a Customer Review</h4>
              <button onClick={() => setShowWriteModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            {submitSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-mono text-center">
                ✓ Your review has been submitted for moderation!
              </div>
            ) : (
              <form onSubmit={handleCreateReview} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-gray-600 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={newReview.userName}
                    onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-moss"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-gray-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newReview.userEmail}
                    onChange={(e) => setNewReview({ ...newReview, userEmail: e.target.value })}
                    placeholder="ananya@example.com"
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-moss"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-gray-600 mb-1">Rating</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-moss bg-white font-mono"
                  >
                    <option value={5}>5 Stars - Excellent</option>
                    <option value={4}>4 Stars - Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Below Average</option>
                    <option value={1}>1 Star - Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-gray-600 mb-1">Your Review *</label>
                  <textarea
                    required
                    rows={3}
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share your experience with fit, fabric quality, and comfort..."
                    className="w-full border rounded p-2 text-xs focus:outline-none focus:border-moss"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWriteModal(false)}
                    className="px-3 py-2 border rounded text-xs font-mono uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-4 py-2 bg-moss text-white font-mono font-bold text-xs uppercase rounded hover:bg-moss/90"
                  >
                    {isSubmittingReview ? "Posting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Aggregate Score & Graphical Breakdown Section */}
      <div className="bg-[#F9F8F6] p-6 rounded-xs border border-[#1C2333]/5 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Prominent Score */}
        <div className="md:col-span-5 space-y-2 text-center md:text-left border-b md:border-b-0 md:border-r border-[#1C2333]/10 pb-6 md:pb-0 md:pr-8">
          <span className="font-mono text-[9px] uppercase tracking-widest text-earth/50 block">OVERALL IMPRESSION</span>
          <div className="flex items-baseline justify-center md:justify-start gap-1">
            <span className="font-serif text-5xl font-light text-ink">
              {ratingAvg.toFixed(1)}
            </span>
            <span className="font-mono text-sm text-earth/50 font-medium">/ 5.0</span>
          </div>
          
          <div className="flex items-center justify-center md:justify-start text-[#B5652F] py-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < Math.floor(ratingAvg) ? "fill-[#B5652F]" : "text-earth/20"}`} 
              />
            ))}
          </div>

          <span className="font-mono text-[9px] text-moss font-bold uppercase tracking-wider block">
            Based on {reviewsCount} verified purchase logs
          </span>
        </div>

        {/* Satisfaction meters */}
        <div className="md:col-span-7 space-y-3.5">
          <span className="font-mono text-[9px] uppercase tracking-widest text-earth/50 block">GARMENT SATISFACTION INDEX</span>
          
          <div className="space-y-3">
            {reviewAspects.map((aspect) => (
              <div key={aspect.label} className="space-y-1">
                <div className="flex justify-between items-center font-mono text-[10px]">
                  <span className="text-[#1C2333] font-bold tracking-wider uppercase">{aspect.label}</span>
                  <span className="text-moss font-bold">{aspect.score}% Satisfied</span>
                </div>
                <div className="h-1 w-full bg-[#1C2333]/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-moss rounded-full transition-all duration-1000" 
                    style={{ width: `${aspect.score}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-6 divide-y divide-[#1C2333]/5">
        {allDisplayedReviews.map((rev, rIdx) => {
          const isClicked = clickedActions[rev.id];
          const currentHelpful = (rev.initialHelpful || 0) + (likes[rev.id] || 0);

          return (
            <div key={rev.id} className={`${rIdx > 0 ? "pt-6" : ""} space-y-3.5`}>
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-[14px] text-ink font-medium uppercase tracking-wide">
                    {rev.author}
                  </span>
                  
                  {/* Verified Checkmark Badge */}
                  <div className="flex items-center gap-1 bg-moss/10 px-1.5 py-0.5 rounded-full shrink-0">
                    <CheckCircle className="w-3 h-3 text-moss" />
                    <span className="font-mono text-[8px] text-moss uppercase tracking-widest font-bold">Verified</span>
                  </div>
                </div>

                <span className="font-mono text-[10px] text-earth/50">{rev.date}</span>
              </div>

              {/* Star Rating and Purchased Size */}
              <div className="flex items-center gap-3">
                <div className="flex items-center text-[#B5652F]">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-[#B5652F]" : "text-earth/20"}`} 
                    />
                  ))}
                </div>
                <span className="font-mono text-[9px] bg-[#1C2333]/5 text-[#1C2333]/80 px-2 py-0.5 rounded-xs uppercase">
                  Size Bought: {rev.sizePurchased}
                </span>
              </div>

              {/* Review Text */}
              <p className="font-serif text-[13.5px] text-earth/90 leading-relaxed max-w-3xl">
                "{rev.comment}"
              </p>

              {/* Helpfulness Tally */}
              <div className="flex items-center gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleHelpfulClick(rev.id)}
                  disabled={isClicked}
                  className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest transition duration-200 ${
                    isClicked 
                      ? "text-moss font-bold cursor-default" 
                      : "text-earth/60 hover:text-ink cursor-pointer"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>
                    {isClicked ? "Thank you" : "Helpful"}
                  </span>
                </button>
                <span className="font-mono text-[9px] text-earth/50">
                  • &nbsp;{currentHelpful} found this helpful
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

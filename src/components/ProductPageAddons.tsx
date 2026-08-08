import React, { useState, useEffect, useRef } from "react";
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
import { subscribeToReviews, addReviewToFirestore, db } from "../lib/firebase";

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
      id: "TIRUPATI MERCHANDISE10",
      type: "instant",
      title: "10% INSTANT DISCOUNT",
      description: "Get 10% instant discount up to ₹1,000 on ICICI and HDFC Bank Credit Cards.",
      code: "TIRUPATI MERCHANDISE10",
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
      description: "5% unlimited cashback on Axis Bank Tirupati Merchandise Signature Cards.",
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

export const AdvancedDelivery: React.FC<AdvancedDeliveryProps> = ({ brandName = "Tirupati Merchandise Express" }) => {
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
    const unsub = subscribeToReviews(
      product.id,
      (reviewsData) => {
        setFetchedReviews(reviewsData);
      },
      (err) => {
        console.warn("Failed to subscribe to reviews in real-time", err);
      }
    );
    return () => unsub();
  }, [product?.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    setIsSubmitting(true);
    try {
      const authorName = currentUser?.name || currentUser?.email || "ANONYMOUS";
      const authorEmail = currentUser?.email || "";
      await addReviewToFirestore({
        productId: product.id,
        userName: authorName,
        userEmail: authorEmail,
        rating: newReview.rating,
        comment: newReview.comment,
        status: "Approved",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      });
      setNewReview({ rating: 5, comment: "" });
      setShowWriteForm(false);
    } catch (err) {
      console.error("Failed to submit review to Firestore", err);
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
          {allReviews.map((review, idx) => (
            <div key={review.id ? `${review.id}-${idx}` : `rev-idx-${idx}`} className="py-4 space-y-2 text-left">
              {/* Header: Reviewer Name */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1C2333]">
                  {review.author}
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
  currentUser?: { name?: string; email?: string } | null;
  onStatsUpdate?: (stats: { ratingAvg: number; reviewsCount: number }) => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ product, currentUser, onStatsUpdate }) => {
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [clickedActions, setClickedActions] = useState<Record<string, boolean>>({});
  const [fetchedReviews, setFetchedReviews] = useState<any[]>([]);
  const [localSubmittedReviews, setLocalSubmittedReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ""
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  useEffect(() => {
    if (!product?.id) return;
    setIsLoadingReviews(true);
    const unsub = subscribeToReviews(
      product.id,
      (reviewsData) => {
        setFetchedReviews(reviewsData);
        setIsLoadingReviews(false);
      },
      (err) => {
        console.warn("Failed to stream product reviews from Firestore", err);
        setIsLoadingReviews(false);
      }
    );
    return () => unsub();
  }, [product?.id]);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    setIsSubmittingReview(true);

    const authorName = currentUser?.name || "Verified Customer";
    const authorEmail = currentUser?.email || "";

    try {
      await addReviewToFirestore({
        productId: product.id,
        userName: authorName,
        userEmail: authorEmail,
        rating: newReview.rating,
        comment: newReview.comment,
        status: "Approved",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      });
      setSubmitSuccess(true);
      setNewReview({ rating: 5, comment: "" });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to post review to Firestore", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const allDisplayedReviews = [
    ...(fetchedReviews.length > 0
      ? fetchedReviews.map(f => ({
          id: f.id,
          author: f.userName,
          date: f.date,
          rating: f.rating,
          comment: f.comment,
          sizePurchased: "M",
          initialHelpful: 0
        }))
      : defaultReviews)
  ];

  const ratingAvg = allDisplayedReviews.length > 0
    ? (allDisplayedReviews.reduce((sum, r) => sum + r.rating, 0) / allDisplayedReviews.length)
    : (product.ratingAvg || product.rating || 4.8);
  
  const reviewsCount = allDisplayedReviews.length;

  const onStatsUpdateRef = useRef(onStatsUpdate);
  useEffect(() => {
    onStatsUpdateRef.current = onStatsUpdate;
  }, [onStatsUpdate]);

  const prevStatsRef = useRef<{ ratingAvg: number; reviewsCount: number } | null>(null);
  useEffect(() => {
    if (onStatsUpdateRef.current) {
      if (
        !prevStatsRef.current ||
        prevStatsRef.current.ratingAvg !== ratingAvg ||
        prevStatsRef.current.reviewsCount !== reviewsCount
      ) {
        prevStatsRef.current = { ratingAvg, reviewsCount };
        onStatsUpdateRef.current({ ratingAvg, reviewsCount });
      }
    }
  }, [ratingAvg, reviewsCount]);

  const handleHelpfulClick = (reviewId: string) => {
    if (clickedActions[reviewId]) return;
    setClickedActions({ ...clickedActions, [reviewId]: true });
    setLikes({ ...likes, [reviewId]: (likes[reviewId] || 0) + 1 });
  };

  return (
    <div className="space-y-6 text-left py-4 border-t border-[#1C2333]/15 mt-4">
      {/* 1. INPUT SECTION FOR RATING & REVIEW */}
      <div className="bg-[#FAF9F5] p-4 sm:p-5 rounded border border-[#1C2333]/10 space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#1C2333]/10 pb-2">
          <h4 className="font-mono text-xs uppercase tracking-widest font-bold text-[#1C2333]">
            Write a Review & Rating
          </h4>
          <span className="text-[10px] font-mono text-earth/60">Share your experience</span>
        </div>

        {submitSuccess ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-mono flex items-center justify-between">
            <span>✓ Thanks for your feedback!</span>
          </div>
        ) : (
          <form onSubmit={handleCreateReview} className="space-y-3 text-xs">
            {/* User Profile Info Badge */}
            <div className="flex items-center justify-between text-[11px] font-mono text-earth/80 bg-white/70 p-2 rounded border border-terrain/20">
              <span className="text-earth/60 uppercase text-[9px] font-bold tracking-wider">Reviewing As:</span>
              <span className="font-bold text-ink">{currentUser?.name || "Verified Customer"}</span>
            </div>

            {/* Rating Star Selection */}
            <div>
              <label className="block text-[10px] uppercase font-mono font-bold text-earth/70 mb-1">
                Your Rating *
              </label>
              <div className="flex items-center gap-1 text-[#B5652F]">
                {[1, 2, 3, 4, 5].map((star) => {
                  const activeStar = hoverRating !== null ? hoverRating : newReview.rating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-1 hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= activeStar ? "fill-[#B5652F] text-[#B5652F]" : "text-earth/30"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="font-mono text-[11px] text-earth ml-2 font-semibold">
                  {newReview.rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-[10px] uppercase font-mono font-bold text-earth/70 mb-1">
                Your Review *
              </label>
              <textarea
                required
                rows={2}
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Write your review about fabric, fit, and comfort..."
                className="w-full border border-terrain/40 rounded p-2 text-xs bg-white focus:outline-none focus:border-moss"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="w-full py-2.5 bg-moss hover:bg-moss/90 text-white font-mono font-bold text-xs uppercase tracking-wider rounded transition cursor-pointer"
            >
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </div>

      {/* 2. PUBLIC REVIEWS SECTION */}
      <div className="space-y-4 pt-2">
        {/* Aggregate Summary */}
        <div className="flex items-center justify-between bg-white p-3.5 border border-terrain/20 rounded">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-earth/50 block">PUBLIC REVIEWS</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-serif text-2xl font-bold text-ink">{ratingAvg.toFixed(1)}</span>
              <span className="font-mono text-xs text-earth/60">/ 5.0 ({reviewsCount} reviews)</span>
            </div>
          </div>
          <div className="flex items-center text-[#B5652F]">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.round(ratingAvg) ? "fill-[#B5652F]" : "text-earth/20"}`}
              />
            ))}
          </div>
        </div>

        {/* List of Reviews */}
        <div className="space-y-4 divide-y divide-[#1C2333]/10">
          {allDisplayedReviews.map((rev, rIdx) => {
            const isClicked = clickedActions[rev.id];
            const currentHelpful = (rev.initialHelpful || 0) + (likes[rev.id] || 0);

            return (
              <div key={rev.id ? `${rev.id}-${rIdx}` : `disp-rev-${rIdx}`} className={`${rIdx > 0 ? "pt-4" : ""} space-y-2`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm font-medium text-ink uppercase">{rev.author}</span>
                    <div className="flex items-center gap-1 bg-moss/10 px-1.5 py-0.5 rounded-full shrink-0">
                      <CheckCircle className="w-3 h-3 text-moss" />
                      <span className="font-mono text-[8px] text-moss uppercase font-bold">Verified</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#B5652F]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < rev.rating ? "fill-[#B5652F]" : "text-earth/20"}`}
                    />
                  ))}
                </div>

                <p className="font-serif text-xs text-earth/90 leading-relaxed">
                  "{rev.comment}"
                </p>


              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

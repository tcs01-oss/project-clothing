import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Copy, Check, ChevronLeft, ChevronRight, X, Tag } from "lucide-react";

export interface Promotion {
  id: string;
  headline: string;
  couponCode: string;
  badge?: string;
  bgHex?: string;
  textColorHex?: string;
  isActive?: boolean;
}

interface PromoBannerProps {
  onApplyCouponCode?: (code: string) => void;
  autoRotateIntervalMs?: number;
  isAtTop?: boolean;
}

const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: "promo-1",
    headline: "🌿 Summer Wanderlust Offer: Use code WANDERLUST for 15% off your order",
    couponCode: "WANDERLUST",
    badge: "15% OFF",
    bgHex: "#2D3B2D",
    textColorHex: "#FAF9F5"
  },
  {
    id: "promo-2",
    headline: "✨ Welcome Offer: Get 10% off your first purchase with code WELCOME10",
    couponCode: "WELCOME10",
    badge: "WELCOME",
    bgHex: "#1F2937",
    textColorHex: "#FAF9F5"
  },
  {
    id: "promo-3",
    headline: "✈️ Complimentary Shipping on all organic garment orders above ₹2,999",
    couponCode: "PEACE10",
    badge: "FREE SHIPPING",
    bgHex: "#3F4E3E",
    textColorHex: "#FAF9F5"
  }
];

export const PromoBanner: React.FC<PromoBannerProps> = ({
  onApplyCouponCode,
  autoRotateIntervalMs = 6000,
  isAtTop
}) => {
  const [promotions, setPromotions] = useState<Promotion[]>(DEFAULT_PROMOTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [internalIsAtTop, setInternalIsAtTop] = useState(true);

  // Auto hide on scroll down, show on scroll back up to top
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setInternalIsAtTop(window.scrollY <= 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showBanner = isAtTop !== undefined ? isAtTop : internalIsAtTop;

  // Check localStorage for dismissed state
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("tirupati_merchandise_promo_banner_dismissed");
      if (dismissed === "true") {
        setIsDismissed(true);
      }
    } catch (e) {
      console.error("Failed to read promo dismissal state from localStorage", e);
    }
  }, []);

  // Fetch active promotions from backend
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await fetch("/api/promotions/active");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.promotions) && data.promotions.length > 0) {
            setPromotions(data.promotions);
          }
        }
      } catch (err) {
        console.error("Failed to fetch active promotions, using default set:", err);
      }
    };
    fetchPromotions();
  }, []);

  // Auto-rotate Cycling Timer
  useEffect(() => {
    if (isDismissed || promotions.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, autoRotateIntervalMs);
    return () => clearInterval(timer);
  }, [isDismissed, promotions.length, autoRotateIntervalMs]);

  if (isDismissed || promotions.length === 0) {
    return null;
  }

  const currentPromo = promotions[currentIndex] || promotions[0];

  const handleCopyAndApply = (code: string) => {
    if (!code) return;
    
    // Copy to clipboard
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setToastMessage(`Copied code "${code}"! Discount code ready for checkout.`);

    // Optional callback to apply code to cart state
    if (onApplyCouponCode) {
      onApplyCouponCode(code);
    }

    setTimeout(() => {
      setCopiedCode(null);
      setToastMessage(null);
    }, 3000);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem("tirupati_merchandise_promo_banner_dismissed", "true");
    } catch (e) {
      console.error("Failed to persist promo dismissal to localStorage", e);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  return (
    <>
      <motion.div
        id="dynamic-promo-banner"
        initial={false}
        animate={{
          height: showBanner ? "auto" : 0,
          opacity: showBanner ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full transition-colors duration-500 shadow-sm font-sans overflow-hidden"
        style={{
          backgroundColor: currentPromo.bgHex || "#2D3B2D",
          color: currentPromo.textColorHex || "#FAF9F5"
        }}
      >
        <div className="max-w-7xl mx-auto px-3 py-2 md:py-2.5 flex items-center justify-between gap-2 text-xs">
          
          {/* Left Arrow Navigation */}
          {promotions.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white shrink-0 cursor-pointer"
              title="Previous Offer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Center Promo Headline & CTA */}
          <div className="flex-1 flex items-center justify-center gap-2 overflow-hidden text-center cursor-pointer"
               onClick={() => handleCopyAndApply(currentPromo.couponCode)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPromo.id || currentIndex}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-center gap-2 flex-wrap"
              >
                {currentPromo.badge && (
                  <span className="bg-white/20 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    {currentPromo.badge}
                  </span>
                )}

                <span className="font-serif font-medium text-xs md:text-sm tracking-wide truncate max-w-xl">
                  {currentPromo.headline}
                </span>

                {currentPromo.couponCode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyAndApply(currentPromo.couponCode);
                    }}
                    className="ml-1 px-2.5 py-0.5 bg-white text-ink hover:bg-amber-100 font-mono font-bold text-[10px] rounded flex items-center gap-1 shadow-xs transition transform hover:scale-105 cursor-pointer shrink-0"
                  >
                    {copiedCode === currentPromo.couponCode ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span className="text-emerald-800">APPLIED</span>
                      </>
                    ) : (
                      <>
                        <Tag className="w-2.5 h-2.5 text-moss" />
                        <span>Code: {currentPromo.couponCode}</span>
                        <Copy className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Controls (Next + Dismiss) */}
          <div className="flex items-center gap-1 shrink-0">
            {promotions.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="p-1 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white cursor-pointer"
                title="Next Offer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded-full transition text-white/80 hover:text-white cursor-pointer ml-1"
              title="Dismiss Promo Bar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[200] bg-ink text-white px-4 py-2.5 rounded-xl shadow-2xl border border-sand/30 flex items-center gap-2.5 text-xs font-mono font-semibold"
          >
            <div className="p-1 bg-moss text-white rounded-full">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

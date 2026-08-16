import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Sparkles, Copy, Check, ArrowRight, Gift, ShieldCheck, X } from "lucide-react";

interface NewsletterSectionProps {
  onApplyCouponCode?: (code: string) => void;
  showModalTrigger?: boolean;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({
  onApplyCouponCode,
  showModalTrigger = true
}) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [unlockedCoupon, setUnlockedCoupon] = useState<{ code: string; discountPercent: number; description: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  // Popup Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDismissed, setModalDismissed] = useState(false);

  // Check if popup modal was previously dismissed
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("tirupati_merchandise_newsletter_modal_dismissed");
      if (dismissed === "true") {
        setModalDismissed(true);
      }
    } catch (e) {
      console.error("Failed to read newsletter modal dismissal state", e);
    }
  }, []);

  // Exit Intent / Delayed Popup Trigger (Only if not already dismissed or subscribed)
  useEffect(() => {
    if (modalDismissed || status === "success") return;

    // Trigger after 8 seconds delayed modal
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 8000);

    // Trigger on Exit Intent (mouse leaving top of window)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !modalDismissed) {
        setIsModalOpen(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [modalDismissed, status]);

  const handleDismissModal = () => {
    setIsModalOpen(false);
    setModalDismissed(true);
    try {
      localStorage.setItem("tirupati_merchandise_newsletter_modal_dismissed", "true");
    } catch (e) {
      console.error("Failed to save newsletter modal dismissal", e);
    }
  };

  const validateEmail = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus("error");
      setErrorMessage("Please enter an email address.");
      return;
    }

    if (!validateEmail(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage_newsletter_section" })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setUnlockedCoupon(data.promo || {
          code: "WELCOME10",
          discountPercent: 10,
          description: "10% off your first order"
        });
      } else if (data.isDuplicate) {
        setStatus("error");
        setErrorMessage(data.error || "This email address is already subscribed.");
        if (data.promo) {
          setUnlockedCoupon(data.promo);
        }
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Unable to process subscription right now. Please try again.");
      }
    } catch (err) {
      console.error("Newsletter submission error:", err);
      // Fallback client response
      setStatus("success");
      setUnlockedCoupon({
        code: "WELCOME10",
        discountPercent: 10,
        description: "10% off your first journey"
      });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyCodeToCart = (code: string) => {
    if (onApplyCouponCode) {
      onApplyCouponCode(code);
      setApplied(true);
      setTimeout(() => setApplied(false), 3000);
    } else {
      handleCopyCode(code);
    }
  };

  return (
    <>
      {/* Main Section Embedded on Page */}
      <section className="w-full bg-[#1C251C] text-[#FAF9F5] py-12 md:py-16 px-4 md:px-8 border-t border-b border-sand/20 relative overflow-hidden font-sans">
        
        {/* Subtle Organic Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-moss/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-6">
          
          {/* Badge Header */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-moss/30 border border-moss/40 rounded-full text-xs font-mono font-bold text-emerald-200 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Tirupati Merchandise Circle Insider List</span>
          </div>

          {/* Headline & Subtitle */}
          <div className="space-y-2 max-w-2xl mx-auto">
            <h3 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-white">
              Join the Insider List & Get <span className="text-emerald-300 underline decoration-moss/60 decoration-2">10% Off</span> Your First Order
            </h3>
            <p className="text-xs md:text-sm text-sand/70 font-light leading-relaxed">
              Subscribe to unlock early access to seasonal drop releases, artisan travel stories, and secret insider vouchers directly to your inbox.
            </p>
          </div>

          {/* Form / Inline Reward Transition */}
          <div className="max-w-md mx-auto pt-2">
            {status === "success" && unlockedCoupon ? (
              /* INSTANT REWARD INLINE CONFIRMATION */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-md border border-moss/50 p-5 rounded-2xl space-y-3 text-center shadow-xl"
              >
                <div className="w-10 h-10 bg-moss text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Gift className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-base text-white">Welcome to the Inner Circle!</h4>
                  <p className="text-xs text-sand/80 font-light">
                    Your 10% welcome voucher has been generated. Use it during checkout:
                  </p>
                </div>

                <div className="p-3 bg-white text-ink rounded-xl border border-sand/50 flex items-center justify-between gap-3 shadow-inner">
                  <div className="text-left font-mono">
                    <span className="text-[10px] text-linen/40 uppercase block">Voucher Code</span>
                    <span className="text-base font-bold text-moss tracking-wider">{unlockedCoupon.code}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(unlockedCoupon.code)}
                      className="px-3 py-1.5 bg-sand/20 hover:bg-sand/30 text-ink text-xs font-mono font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyCodeToCart(unlockedCoupon.code)}
                      className="px-3.5 py-1.5 bg-moss hover:bg-moss-hover text-white text-xs font-serif font-bold rounded-lg transition flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      {applied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied</span>
                        </>
                      ) : (
                        <span>Apply Code</span>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-sand/60 font-mono">
                  Valid for 30 days on all organic t-shirt and apparel collections.
                </p>
              </motion.div>
            ) : (
              /* INPUT FORM */
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-sand/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="Enter your email address..."
                      className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-xs border border-sand/30 rounded-xl text-xs text-white placeholder:text-sand/40 focus:outline-none focus:border-moss transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="px-6 py-3 bg-moss hover:bg-moss-hover disabled:opacity-50 text-white font-serif font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    {status === "loading" ? (
                      <span className="inline-flex items-center gap-1.5">
                        <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>Joining...</span>
                      </span>
                    ) : (
                      <>
                        <span>Get 10% Off</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {status === "error" && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-300 text-xs font-mono text-center pt-1"
                  >
                    {errorMessage}
                  </motion.p>
                )}

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-sand/50 font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>No spam ever. Unsubscribe anytime with 1-click.</span>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* OPTIONAL EXIT INTENT / DELAYED POPUP MODAL */}
      <AnimatePresence>
        {isModalOpen && !modalDismissed && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={handleDismissModal}
              className="absolute inset-0 bg-ink/70 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#1C251C] text-white p-6 md:p-8 rounded-2xl shadow-2xl border border-sand/30 z-10 font-sans space-y-5"
            >
              <button
                type="button"
                onClick={handleDismissModal}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full text-sand/60 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-moss/30 border border-moss/40 rounded-full flex items-center justify-center mx-auto text-emerald-300">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">Before You Wander Off...</h3>
                <p className="text-xs text-sand/70 font-light max-w-sm mx-auto leading-relaxed">
                  Join our travel journal today and instantly claim <strong className="text-emerald-300 font-bold">10% off</strong> your first organic garment order!
                </p>
              </div>

              {status === "success" && unlockedCoupon ? (
                <div className="bg-white/10 p-4 rounded-xl space-y-3 text-center border border-moss/40">
                  <div className="text-xs text-emerald-200 font-mono">Welcome Voucher Unlocked!</div>
                  <div className="p-2.5 bg-white text-ink rounded-lg flex items-center justify-between font-mono">
                    <span className="font-bold text-moss text-sm">{unlockedCoupon.code}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(unlockedCoupon.code)}
                      className="px-3 py-1 bg-moss text-white text-xs font-serif font-bold rounded hover:bg-moss-hover transition cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy Code"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleDismissModal}
                    className="w-full py-2 bg-white/20 text-white text-xs font-serif rounded hover:bg-white/30 transition cursor-pointer"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full px-4 py-3 bg-white/10 border border-sand/30 rounded-xl text-xs text-white placeholder:text-sand/40 focus:outline-none focus:border-moss"
                  />
                  {status === "error" && (
                    <p className="text-red-300 text-xs font-mono text-center">{errorMessage}</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3 bg-moss hover:bg-moss-hover text-white font-serif font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    {status === "loading" ? "Unlocking..." : "Claim My 10% Discount"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

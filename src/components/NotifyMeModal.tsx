import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, BellRing, CheckCircle, Mail, Phone } from "lucide-react";

interface NotifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productImage?: string;
  selectedSize?: string;
  currentUserEmail?: string;
}

export const NotifyMeModal: React.FC<NotifyMeModalProps> = ({
  isOpen,
  onClose,
  productName,
  productImage,
  selectedSize = "M",
  currentUserEmail = "",
}) => {
  const [email, setEmail] = useState(currentUserEmail);
  const [phone, setPhone] = useState("");
  const [enableWhatsapp, setEnableWhatsapp] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0B0D12]/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#FAF9F5] border border-[#1C2333]/20 shadow-2xl rounded-sm p-6 sm:p-8 z-10 text-[#1C2333]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#1C2333]/60 hover:text-[#1C2333] hover:bg-[#1C2333]/5 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {!submitted ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1C2333]/10 flex items-center justify-center text-[#1C2333]">
                  <BellRing className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-[#1C2333]">
                    BACK-IN-STOCK ALERT
                  </h3>
                  <p className="text-xs font-mono text-[#1C2333]/60 uppercase">
                    RECEIVE INSTANT RESTOCK NOTIFICATION
                  </p>
                </div>
              </div>

              {/* Product Snippet */}
              <div className="flex items-center gap-3 p-3 bg-white border border-[#1C2333]/10 rounded-sm">
                {productImage && (
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-12 h-16 object-cover rounded-xs border border-[#1C2333]/10"
                  />
                )}
                <div className="text-left space-y-0.5">
                  <h4 className="font-serif text-sm font-semibold text-[#1C2333] line-clamp-1">{productName}</h4>
                  <span className="font-mono text-[10px] bg-[#1C2333]/10 text-[#1C2333] px-2 py-0.5 rounded-xs inline-block font-bold">
                    SIZE: {selectedSize}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 font-bold mb-1">
                    YOUR EMAIL ADDRESS *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-[#1C2333]/40" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nomad@domain.com"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] focus:outline-none focus:border-[#1C2333] rounded-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 font-bold mb-1">
                    WHATSAPP / MOBILE NUMBER (OPTIONAL)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-[#1C2333]/40" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder=""
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] focus:outline-none focus:border-[#1C2333] rounded-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="whatsapp-alert"
                    checked={enableWhatsapp}
                    onChange={(e) => setEnableWhatsapp(e.target.checked)}
                    className="accent-[#1C2333] cursor-pointer"
                  />
                  <label htmlFor="whatsapp-alert" className="text-xs font-mono text-[#1C2333]/80 cursor-pointer">
                    Send VIP WhatsApp alert when available
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#1C2333] hover:bg-[#1C2333]/90 text-[#FAF9F5] text-xs font-mono uppercase tracking-widest font-bold transition duration-300 rounded-xs cursor-pointer"
                >
                  {loading ? "REGISTERING ALERT..." : "NOTIFY ME WHEN RESTOCKED"}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C2333] uppercase">ALERT REGISTERED!</h3>
              <p className="text-xs font-sans text-[#1C2333]/80 max-w-xs mx-auto">
                We'll notify <strong>{email}</strong> the moment size <strong>{selectedSize}</strong> of <em>{productName}</em> becomes available.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-6 bg-[#1C2333] text-[#FAF9F5] text-xs font-mono uppercase tracking-wider font-bold rounded-xs cursor-pointer"
              >
                BACK TO STORE
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState } from "react";
import { 
  Zap, 
  RefreshCw, 
  ShieldCheck, 
  Truck, 
  Mail, 
  CheckCircle2, 
  HelpCircle, 
  Ruler, 
  X, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  PackageCheck,
  CreditCard,
  Heart
} from "lucide-react";

interface SiteFooterProps {
  onNavigate: (tab: string) => void;
  onOpenOrders: () => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ onNavigate, onOpenOrders }) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [activeModal, setActiveModal] = useState<"faq" | "sizing" | "shipping" | null>(null);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) {
      setSubscribed(true);
    }
  };

  const faqData = [
    {
      q: "How long will it take to get my order?",
      a: "We pride ourselves on speed. All orders are processed and delivered within 3 business days."
    },
    {
      q: "What is your return and replacement policy?",
      a: "We offer a hassle-free 7-day return and replacement window from the date of delivery. Items must be unworn, unwashed, and in their original packaging."
    },
    {
      q: "How do I track my order?",
      a: "Once your order is dispatched, you can track your order in your profile > my orders & tracking section."
    },
    {
      q: "Do you offer Cash on Delivery (COD)?",
      a: "No, Cash on Delivery is not available currently."
    }
  ];

  return (
    <footer className="bg-[#1C2333] text-[#FAF9F5] pt-10 sm:pt-16 pb-8 sm:pb-12 border-t border-[#D9CBB0]/20 text-left select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* 1. Core Trust Badges / Policies Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-6 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center gap-3.5 p-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-white">⚡ Fast 3-Day Delivery</h5>
              <p className="font-mono text-[11px] text-gray-400 mt-0.5">All orders delivered within 3 business days</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-white">🔄 7-Day Replacement & Return</h5>
              <p className="font-mono text-[11px] text-gray-400 mt-0.5">Hassle-free 7-day return window</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-white">100% Authentic Quality</h5>
              <p className="font-mono text-[11px] text-gray-400 mt-0.5">Premium craftsmanship & materials</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-white">Secure Payments</h5>
              <p className="font-mono text-[11px] text-gray-400 mt-0.5">Encrypted UPI, Cards & Netbanking</p>
            </div>
          </div>
        </div>

        {/* 2. Structured Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pt-4">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="font-serif text-2xl font-bold tracking-[0.12em] text-white uppercase">
                TIRUPATI MERCHANDISE
              </h3>
              <p className="font-mono text-[10px] text-gray-400 tracking-widest uppercase mt-1">
                Authentic Premium Apparel & Footwear
              </p>
            </div>
            <p className="font-sans text-xs text-gray-300 leading-relaxed max-w-sm">
              Delivering high-performance footwear and premium apparel crafted for comfort, durability, and modern style across India.
            </p>
            <div className="pt-1 space-y-2 text-xs font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tirupati Merchandise Logistics Hub, India</span>
              </div>
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Express 3-Day Dispatch Nationwide</span>
              </div>
            </div>
          </div>

          {/* Col 2: Customer Care */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">
              CUSTOMER CARE
            </h4>
            <ul className="space-y-2.5 font-mono text-xs text-gray-300">
              <li>
                <button 
                  onClick={onOpenOrders} 
                  className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1.5 font-bold text-emerald-400"
                >
                  <span>Track My Order</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal("faq")} 
                  className="hover:text-white text-gray-300 transition cursor-pointer flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                  <span>FAQs & Help</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal("sizing")} 
                  className="hover:text-white text-gray-300 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Ruler className="w-3.5 h-3.5 text-gray-400" />
                  <span>Sizing Guide</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveModal("shipping")} 
                  className="hover:text-white text-gray-300 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5 text-gray-400" />
                  <span>Shipping & Returns Policy</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Links / Categories */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">
              CATEGORIES
            </h4>
            <ul className="space-y-2.5 font-mono text-xs text-gray-300">
              <li>
                <button onClick={() => onNavigate("store")} className="hover:text-white transition cursor-pointer">
                  All Products
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2">
              STAY UPDATED
            </h4>
            <p className="font-sans text-xs text-gray-300 leading-relaxed">
              Subscribe to get release updates, special discounts, and fast delivery notifications.
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 text-xs font-mono text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 rounded-md"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-mono uppercase tracking-wider font-bold transition rounded-md cursor-pointer"
                >
                  SUBSCRIBE
                </button>
              </form>
            ) : (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-md space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Subscribed Successfully!</span>
                </div>
                <p className="font-mono text-[10px] text-gray-300">
                  Thank you for subscribing to Tirupati Merchandise updates.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Bottom Legal & Payment Badges */}
        <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-gray-400">
          <div className="flex flex-wrap gap-4 items-center">
            <button onClick={() => setActiveModal("shipping")} className="hover:text-white cursor-pointer transition">
              Fast 3-Day Delivery
            </button>
            <span>•</span>
            <button onClick={() => setActiveModal("shipping")} className="hover:text-white cursor-pointer transition">
              7-Day Returns
            </button>
            <span>•</span>
            <button onClick={() => setActiveModal("faq")} className="hover:text-white cursor-pointer transition">
              FAQ
            </button>
            <span>•</span>
            <button onClick={() => setActiveModal("sizing")} className="hover:text-white cursor-pointer transition">
              Sizing Guide
            </button>
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">ACCEPTED PAYMENTS:</span>
            <span className="px-2 py-0.5 bg-white/10 border border-white/10 text-white font-bold rounded-xs text-[10px]">UPI</span>
            <span className="px-2 py-0.5 bg-white/10 border border-white/10 text-white font-bold rounded-xs text-[10px]">CARDS</span>
            <span className="px-2 py-0.5 bg-white/10 border border-white/10 text-white font-bold rounded-xs text-[10px]">NETBANKING</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-2 text-[11px] font-mono text-gray-400 flex items-center justify-center gap-1 flex-wrap">
          <span>© 2026 TIRUPATI MERCHANDISE. ALL RIGHTS RESERVED. CRAFTED WITH</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
        </div>
      </div>

      {/* MODAL 1: SIZING GUIDE */}
      {activeModal === "sizing" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#1C2333] border border-white/20 text-[#FAF9F5] max-w-xl w-full rounded-xl p-6 shadow-2xl space-y-5 relative">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Ruler className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-white">Sizing Guide</h3>
                <p className="font-mono text-xs text-gray-400">Tirupati Merchandise Fit Reference</p>
              </div>
            </div>

            <div className="space-y-4 font-sans text-xs text-gray-200 leading-relaxed">
              <p className="bg-white/5 p-4 rounded-lg border border-white/10">
                Our footwear follows standard US/UK sizing. We recommend checking individual product descriptions, as select performance or retro models may run a half-size small. If you are between sizes, we generally suggest sizing up for the best fit. For apparel, our items are true-to-size with a modern, relaxed fit.
              </p>

              <div className="space-y-2">
                <h4 className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">Footwear Quick Size Chart</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-[11px]">
                    <thead>
                      <tr className="border-b border-white/20 text-gray-400 bg-white/5">
                        <th className="p-2">UK Size</th>
                        <th className="p-2">US Size</th>
                        <th className="p-2">EU Size</th>
                        <th className="p-2">Foot Length (CM)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      <tr><td className="p-2">UK 6</td><td className="p-2">US 7</td><td className="p-2">EU 40</td><td className="p-2">25.0 cm</td></tr>
                      <tr><td className="p-2">UK 7</td><td className="p-2">US 8</td><td className="p-2">EU 41</td><td className="p-2">25.8 cm</td></tr>
                      <tr><td className="p-2">UK 8</td><td className="p-2">US 9</td><td className="p-2">EU 42</td><td className="p-2">26.5 cm</td></tr>
                      <tr><td className="p-2">UK 9</td><td className="p-2">US 10</td><td className="p-2">EU 43</td><td className="p-2">27.3 cm</td></tr>
                      <tr><td className="p-2">UK 10</td><td className="p-2">US 11</td><td className="p-2">EU 44</td><td className="p-2">28.0 cm</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)} 
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase rounded-md cursor-pointer"
              >
                Close Sizing Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FREQUENTLY ASKED QUESTIONS (FAQ) */}
      {activeModal === "faq" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#1C2333] border border-white/20 text-[#FAF9F5] max-w-xl w-full rounded-xl p-6 shadow-2xl space-y-5 relative">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-white">Frequently Asked Questions</h3>
                <p className="font-mono text-xs text-gray-400">Everything you need to know about ordering & delivery</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {faqData.map((item, idx) => {
                const isOpen = expandedFaqIndex === idx;
                return (
                  <div key={idx} className="border border-white/10 rounded-lg overflow-hidden bg-white/5">
                    <button
                      onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left p-4 flex items-center justify-between gap-3 text-xs font-mono font-bold text-white hover:bg-white/5 cursor-pointer transition"
                    >
                      <span>Q: {item.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-0 text-xs font-sans text-gray-300 leading-relaxed border-t border-white/5">
                        <p className="mt-2 text-gray-200">A: {item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs font-mono">
              <button
                onClick={() => {
                  setActiveModal(null);
                  onOpenOrders();
                }}
                className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                Need to track an order? Click here
              </button>
              <button 
                onClick={() => setActiveModal(null)} 
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase rounded-md cursor-pointer"
              >
                Close FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SHIPPING & RETURNS POLICY */}
      {activeModal === "shipping" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#1C2333] border border-white/20 text-[#FAF9F5] max-w-xl w-full rounded-xl p-6 shadow-2xl space-y-5 relative">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Truck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-white">Shipping & Return Policy</h3>
                <p className="font-mono text-xs text-gray-400">Speedy delivery & 7-day hassle-free returns</p>
              </div>
            </div>

            <div className="space-y-4 font-sans text-xs text-gray-200 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-2">
                <h4 className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4" /> ⚡ Fast 3-Day Delivery
                </h4>
                <p>
                  We pride ourselves on speed. All orders are processed immediately upon placement and delivered within 3 business days across India. Once dispatched, live tracking updates are made available directly under your Profile &gt; My Orders section.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-2">
                <h4 className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> 🔄 7-Day Replacement & Return Policy
                </h4>
                <p>
                  We offer a hassle-free 7-day return and replacement window from the date of delivery. Items must be unworn, unwashed, and in their original packaging with tags intact.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-2">
                <h4 className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Payment Modes
                </h4>
                <p>
                  We support secure instant payments via UPI, Credit/Debit Cards, and Netbanking. Please note that Cash on Delivery (COD) is not available currently.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)} 
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase rounded-md cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
};

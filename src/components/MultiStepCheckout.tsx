import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import {
  ShoppingBag,
  Truck,
  CreditCard,
  CheckCircle2,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Trash2,
  ShieldCheck,
  Building2,
  QrCode,
  Banknote,
  Sparkles,
  Lock,
  ArrowRight,
  Package,
  Clock,
  Copy,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Smartphone,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { CartItem, Product, User } from "../types";

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  password?: string;
}

export interface PaymentDetails {
  method: "card" | "upi" | "netbanking" | "cod";
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardHolder: string;
  upiId: string;
  upiApp?: "phonepe" | "paytm" | "gpay" | "bhim" | "vpa";
  bankName: string;
  sameAsShippingBilling: boolean;
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
}

export interface FinalOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
  }>;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  userId?: string;
  password?: string;
}

interface MultiStepCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateCartQty: (productId: string, size: string, delta: number, variant?: any) => void;
  removeFromCart: (productId: string, size: string, variant?: any) => void;
  clearCart: () => void;
  cartSubtotal: number;
  discountAmount: number;
  cartTotal: number;
  appliedCoupon: any;
  couponCode: string;
  setCouponCode: (code: string) => void;
  handleValidateCoupon: () => void;
  couponError: string;
  couponSuccess: string;
  currentUser: User | null;
  onOrderPlacedSuccess?: (order: any) => void;
  onUserAuthSuccess?: (user: User, token: string) => void;
  onOpenLoginModal?: (email?: string) => void;
  getDirectImageUrl: (url?: string) => string;
  cmsConfig?: any;
  paymentPublicConfig?: { 
    codEnabled?: boolean; 
    prepaidEnabled?: boolean;
    cardEnabled?: boolean;
    upiEnabled?: boolean;
    netbankingEnabled?: boolean;
    intentEnabled?: boolean;
    qrEnabled?: boolean;
    upiVpa?: string;
    prepaidDeliveryCost?: number;
    codDeliveryCost?: number;
    freeShippingThreshold?: number;
  };
}

type CheckoutStep = 1 | 2 | 3 | 4;

const STEP_LABELS = [
  { id: 1, title: "Cart Review", subtitle: "Verify items", icon: ShoppingBag },
  { id: 2, title: "Shipping", subtitle: "Delivery details", icon: Truck },
  { id: 3, title: "Payment", subtitle: "Method & Billing", icon: CreditCard },
  { id: 4, title: "Confirmation", subtitle: "Order complete", icon: CheckCircle2 }
];

// ==========================================
// 1. STEPPER COMPONENT
// ==========================================
export const CheckoutStepper: React.FC<{
  currentStep: CheckoutStep;
  completedSteps: Set<number>;
  onStepClick: (step: CheckoutStep) => void;
}> = ({ currentStep, completedSteps, onStepClick }) => {
  return (
    <div className="w-full bg-[#FAF9F5] border-b border-sand/40 px-4 py-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-center justify-between">
          {/* Background Connecting Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-sand/30 -z-0" />
          
          {/* Active Progress Line */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-moss transition-all duration-500 ease-in-out -z-0"
            style={{
              width: `${((Math.min(currentStep, 4) - 1) / (STEP_LABELS.length - 1)) * 100}%`
            }}
          />

          {STEP_LABELS.map((step) => {
            const isCurrent = currentStep === step.id;
            const isCompleted = completedSteps.has(step.id) || currentStep > step.id;
            const isClickable = (completedSteps.has(step.id) || step.id < currentStep) && currentStep !== 4;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center group cursor-default"
              >
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick(step.id as CheckoutStep)}
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 border ${
                    isCompleted
                      ? "bg-moss text-white border-moss shadow-sm hover:scale-105 cursor-pointer"
                      : isCurrent
                      ? "bg-white text-moss border-2 border-moss shadow-md ring-4 ring-moss/10"
                      : "bg-white text-earth/40 border-sand/60"
                  } ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
                  ) : (
                    <span className="flex items-center justify-center">
                      <Icon className={`w-4 h-4 md:w-4 md:h-4 ${isCurrent ? "text-moss" : "text-earth/40"}`} />
                    </span>
                  )}
                </button>

                {/* Step Title Label */}
                <div className="text-center mt-2">
                  <span
                    className={`block text-[11px] md:text-xs font-serif font-bold transition-colors ${
                      isCurrent
                        ? "text-ink font-semibold"
                        : isCompleted
                        ? "text-moss font-medium"
                        : "text-earth/40"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="hidden md:block text-[9px] font-mono text-linen/40 uppercase tracking-tight">
                    {step.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. STEP 1: CART REVIEW COMPONENT
// ==========================================
const CartReviewStep: React.FC<{
  cart: CartItem[];
  updateCartQty: (productId: string, size: string, delta: number, variant?: any) => void;
  removeFromCart: (productId: string, size: string, variant?: any) => void;
  cartSubtotal: number;
  discountAmount: number;
  cartTotal: number;
  appliedCoupon: any;
  couponCode: string;
  setCouponCode: (c: string) => void;
  handleValidateCoupon: () => void;
  couponError: string;
  couponSuccess: string;
  getDirectImageUrl: (url?: string) => string;
  onProceed: () => void;
  paymentPublicConfig?: { 
    codEnabled?: boolean; 
    prepaidEnabled?: boolean;
    prepaidDeliveryCost?: number;
    codDeliveryCost?: number;
    freeShippingThreshold?: number;
  };
  lastCancelledOrder?: any;
  onDismissCancelledOrder?: () => void;
  onClose?: () => void;
}> = ({
  cart,
  updateCartQty,
  removeFromCart,
  cartSubtotal,
  discountAmount,
  cartTotal,
  appliedCoupon,
  couponCode,
  setCouponCode,
  handleValidateCoupon,
  couponError,
  couponSuccess,
  getDirectImageUrl,
  onProceed,
  paymentPublicConfig,
  lastCancelledOrder,
  onDismissCancelledOrder,
  onClose
}) => {
  const freeThreshold = paymentPublicConfig?.freeShippingThreshold ?? 2999;
  const prepaidCost = paymentPublicConfig?.prepaidDeliveryCost ?? 0;
  const shippingCost = cartSubtotal >= freeThreshold || cartSubtotal === 0 ? 0 : prepaidCost;
  const calculatedTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  if (cart.length === 0) {
    return (
      <div className="space-y-6 py-12 flex flex-col items-center justify-center text-center">
        {lastCancelledOrder && (
          <div className="p-4 bg-red-950/10 border border-red-800/30 rounded-xl space-y-2 text-left shadow-xs w-full max-w-md">
            <div className="flex items-center justify-between pb-1.5 border-b border-red-200/50">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-red-100 text-red-700 rounded-md">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="font-serif font-bold text-red-900 text-xs">Payment Session Canceled</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-300">
                Payment Canceled
              </span>
            </div>
            <div className="text-xs text-earth/80 font-mono flex justify-between items-center pt-1">
              <span className="font-semibold text-ink">Order #{lastCancelledOrder.id || "ORD-CANCELLED"}</span>
              <span className="font-bold text-moss">₹{Math.round(lastCancelledOrder.total || 0).toLocaleString("en-IN")}</span>
            </div>
            <p className="text-[11px] text-earth/70 leading-relaxed font-sans">
              Your previous payment attempt was canceled.
            </p>
            {onDismissCancelledOrder && (
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={onDismissCancelledOrder}
                  className="text-red-700 hover:underline cursor-pointer font-bold text-[10px] font-mono"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}
        <div className="w-20 h-20 rounded-full bg-sand/20 border border-sand/30 flex items-center justify-center text-[#B5652F] shadow-inner mb-1">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h4 className="font-serif text-2xl font-bold text-ink">your cart is empty</h4>
        <p className="text-linen/50 text-xs max-w-sm font-light leading-relaxed">
          Explore our artisan travel collections and add premium organic garments to begin your journey.
        </p>
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            const collectionEl = document.getElementById("collection-section") || document.getElementById("brand-collection-grid") || document.querySelector("main");
            if (collectionEl) {
              collectionEl.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="mt-3 px-8 py-3.5 bg-[#1C2333] hover:bg-[#283144] text-[#D9CBB0] hover:text-linen text-xs font-mono uppercase tracking-widest font-bold transition-all duration-300 rounded-sm shadow-md cursor-pointer flex items-center gap-2"
        >
          <span>show collection</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending / Cancelled Order Banner */}
      {lastCancelledOrder && (
        <div className="p-4 bg-red-950/10 border border-red-800/30 rounded-xl space-y-2 text-left shadow-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-red-200/50">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-red-100 text-red-700 rounded-md">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <span className="font-serif font-bold text-red-900 text-xs">Payment Session Canceled</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-300">
              Payment Canceled
            </span>
          </div>
          <div className="text-xs text-earth/80 font-mono flex justify-between items-center pt-1">
            <span className="font-semibold text-ink">Order #{lastCancelledOrder.id || "ORD-CANCELLED"}</span>
            <span className="font-bold text-moss">₹{Math.round(lastCancelledOrder.total || 0).toLocaleString("en-IN")}</span>
          </div>
          <p className="text-[11px] text-earth/70 leading-relaxed font-sans">
            Your previous payment attempt was canceled. Your cart items are preserved below so you can review and retry checkout when ready.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-earth/50 font-mono">
            <span>Status: Logged as Cancelled Order</span>
            {onDismissCancelledOrder && (
              <button
                type="button"
                onClick={onDismissCancelledOrder}
                className="text-red-700 hover:underline cursor-pointer font-bold"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-sand/40">
          <span className="text-[10px] font-mono uppercase tracking-widest text-moss font-bold">
            Cart Items ({cart.reduce((acc, item) => acc + item.quantity, 0)})
          </span>
          <span className="text-xs text-linen/40 font-mono">Prices in INR (₹)</span>
        </div>

        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {cart.map((itm, idx) => {
            const itemImage = itm.selectedVariant?.images?.[0] || itm.product.images?.[0];
            const unitPrice = Math.round(
              itm.selectedVariant
                ? (itm.selectedVariant.sellingPrice || itm.selectedVariant.price || itm.product.price)
                : (itm.product.sellingPrice || itm.product.price)
            );
            const itemTotal = unitPrice * itm.quantity;

            return (
              <div
                key={`${itm.product.id}-${itm.selectedSize}-${idx}`}
                className="bg-white p-3.5 rounded-xl border border-sand/40 flex gap-3.5 items-center shadow-xs hover:border-sand transition"
              >
                <div className="w-16 h-20 bg-[#FAF9F5] rounded-lg border border-sand/30 overflow-hidden shrink-0 flex items-center justify-center p-1">
                  <img
                    src={getDirectImageUrl(itemImage) || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"}
                    alt={itm.product.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h5 className="font-serif font-bold text-ink text-sm truncate">{itm.product.name}</h5>
                  
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-earth/60 font-mono">
                    <span className="bg-sand/20 px-1.5 py-0.5 rounded text-moss font-semibold">
                      Size: {itm.selectedSize || "M"}
                    </span>
                    {itm.selectedVariant?.color && (
                      <span className="bg-sand/20 px-1.5 py-0.5 rounded">
                        Color: {itm.selectedVariant.color}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center border border-sand/50 rounded-md bg-[#FAF9F5] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateCartQty(itm.product.id, itm.selectedSize || "Standard", -1, itm.selectedVariant)}
                        className="px-2.5 py-1 text-ink/70 hover:bg-sand/30 transition text-xs font-mono font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-ink">{itm.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(itm.product.id, itm.selectedSize || "Standard", 1, itm.selectedVariant)}
                        className="px-2.5 py-1 text-ink/70 hover:bg-sand/30 transition text-xs font-mono font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-ink">₹{itemTotal.toLocaleString("en-IN")}</div>
                      {itm.quantity > 1 && (
                        <div className="text-[10px] text-linen/40">₹{unitPrice.toLocaleString("en-IN")} each</div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(itm.product.id, itm.selectedSize || "Standard", itm.selectedVariant)}
                  className="p-1.5 text-red-500/70 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Pricing Breakdown */}
      <div className="p-4 bg-white rounded-xl border border-sand/40 space-y-2 text-xs">
        <div className="flex justify-between text-earth/70">
          <span>Subtotal</span>
          <span className="font-mono font-semibold text-ink">₹{Math.round(cartSubtotal).toLocaleString("en-IN")}</span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-moss font-semibold">
            <span>Promo Discount ({appliedCoupon.code})</span>
            <span className="font-mono">-₹{Math.round(discountAmount).toLocaleString("en-IN")}</span>
          </div>
        )}

        <div className="flex justify-between text-earth/70">
          <span>Eco Packaging & Shipping</span>
          <span className="font-mono font-semibold text-ink">
            {shippingCost === 0 ? (
              <span className="text-moss font-bold text-[11px]">FREE</span>
            ) : (
              `₹${shippingCost.toLocaleString("en-IN")}`
            )}
          </span>
        </div>

        <div className="border-t border-sand/40 pt-2 flex justify-between text-sm font-bold text-ink">
          <span>Estimated Total</span>
          <span className="font-mono text-base text-moss">₹{Math.round(calculatedTotal).toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onProceed}
        className="w-full py-3.5 bg-moss hover:bg-moss-hover text-white font-serif font-bold text-sm tracking-wide rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export function validateEmailFormat(email: string): { isValid: boolean; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { isValid: false, error: "Email address is required" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { isValid: false, error: "Invalid email format. Example: name@gmail.com" };
  }
  if (!cleanEmail.endsWith("@gmail.com")) {
    return { isValid: false, error: "Invalid email domain. Only @gmail.com addresses allowed" };
  }
  return { isValid: true };
}

export function validatePhoneFormat(phone: string): { isValid: boolean; error?: string } {
  const cleanPhone = phone.trim().replace(/\D/g, "");
  if (!cleanPhone) {
    return { isValid: false, error: "Mobile number is required" };
  }
  if (!/^[6-9]/.test(cleanPhone)) {
    return { isValid: false, error: "Invalid mobile number: Must start with 6, 7, 8, or 9" };
  }
  if (cleanPhone.length !== 10) {
    return { isValid: false, error: `Invalid mobile number: Must be exactly 10 digits (${cleanPhone.length}/10 entered)` };
  }
  return { isValid: true };
}

// ==========================================
// 3. STEP 2: SHIPPING DETAILS COMPONENT
// ==========================================
const ShippingStep: React.FC<{
  shipping: ShippingDetails;
  currentUser: User | null;
  onChange: (updated: Partial<ShippingDetails>) => void;
  onBack: () => void;
  onProceed: () => void;
  isLoggingIn?: boolean;
  emailExistsError?: string;
  onOpenLoginModal?: (email?: string) => void;
}> = ({ shipping, currentUser, onChange, onBack, onProceed, isLoggingIn, emailExistsError, onOpenLoginModal }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [phoneFocused, setPhoneFocused] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const phoneRes = validatePhoneFormat(shipping.phone);
  const emailRes = validateEmailFormat(shipping.email);

  const showPhoneError = !phoneFocused && ((phoneTouched && !phoneRes.isValid && shipping.phone.length > 0) || (errors.phone && !phoneRes.isValid));
  const showPhoneSuccess = phoneRes.isValid;

  const showEmailError = !emailFocused && ((emailTouched && !emailRes.isValid && shipping.email.length > 0) || (errors.email && !emailRes.isValid));
  const showEmailSuccess = emailRes.isValid;

  const validate = () => {
    setPhoneTouched(true);
    setEmailTouched(true);
    const errs: Record<string, string> = {};
    if (!shipping.fullName.trim()) errs.fullName = "Full name is required";
    
    if (!emailRes.isValid && emailRes.error) {
      errs.email = emailRes.error;
    }

    if (!phoneRes.isValid && phoneRes.error) {
      errs.phone = phoneRes.error;
    }

    if (!shipping.street.trim()) errs.street = "Street address is required";
    if (!shipping.city.trim()) errs.city = "City is required";
    if (!shipping.state.trim()) errs.state = "State is required";
    if (!shipping.zip.trim()) {
      errs.zip = "PIN / ZIP code is required";
    } else if (!/^\d{6}$/.test(shipping.zip.trim())) {
      errs.zip = "PIN / ZIP code must be 6 numeric digits";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onProceed();
    }
  };

  const isFormValid =
    shipping.fullName.trim().length > 0 &&
    emailRes.isValid &&
    phoneRes.isValid &&
    shipping.street.trim().length > 0 &&
    shipping.city.trim().length > 0 &&
    shipping.state.trim().length > 0 &&
    shipping.zip.trim().length === 6 &&
    /^\d{6}$/.test(shipping.zip.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {emailExistsError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-red-900 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-950">{emailExistsError}</p>
              <p className="text-[10px] text-red-700 mt-0.5">
                Sign in to your existing account to quickly complete your checkout.
              </p>
            </div>
          </div>
          {onOpenLoginModal && (
            <button
              type="button"
              onClick={() => onOpenLoginModal(shipping.email)}
              className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white font-mono text-xs font-bold rounded-lg transition shrink-0 shadow-xs"
            >
              Sign In Now
            </button>
          )}
        </div>
      )}

      <div className="bg-white p-4 md:p-5 rounded-xl border border-sand/40 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-sand/40">
          <Truck className="w-4 h-4 text-moss" />
          <h4 className="font-serif font-bold text-ink text-sm">Delivery & Contact Information</h4>
        </div>

        {/* Full Name & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-earth/60 font-bold block">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Aarav Sharma"
              value={shipping.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              className={`w-full px-3 py-2 bg-[#FAF9F5] border rounded-lg text-xs font-sans focus:outline-none transition ${
                errors.fullName ? "border-red-500 bg-red-50/20" : "border-sand/60 focus:border-moss"
              }`}
            />
            {errors.fullName && <p className="text-red-500 text-[10px] font-mono">{errors.fullName}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-wider text-earth/60 font-bold block">
                Mobile Number (10 Digits) *
              </label>
              {phoneFocused ? (
                <span className="text-[9px] font-mono font-medium text-earth/60">
                  {shipping.phone.length}/10 entered
                </span>
              ) : showPhoneError ? (
                <span className="text-[9px] font-mono font-bold text-red-500">
                  ⚠️ Invalid Format
                </span>
              ) : (
                <span className="text-[9px] font-mono font-medium text-earth/50">
                  {shipping.phone.length}/10 entered
                </span>
              )}
            </div>
            <input
              type="tel"
              maxLength={10}
              placeholder="9800000000"
              value={shipping.phone}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => {
                setPhoneFocused(false);
                setPhoneTouched(true);
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                onChange({ phone: val });
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
              }}
              className={`w-full px-3 py-2 bg-[#FAF9F5] border rounded-lg text-xs font-mono tracking-wider focus:outline-none transition ${
                phoneFocused
                  ? "border-moss bg-white ring-1 ring-moss/20"
                  : showPhoneError
                  ? "border-red-500 bg-red-50/20 text-red-900"
                  : errors.phone && !phoneFocused
                  ? "border-red-500 bg-red-50/20"
                  : "border-sand/60 focus:border-moss"
              }`}
            />
            {phoneFocused ? (
              <p className="text-[10px] font-mono text-earth/60 flex items-center justify-between">
                <span>{shipping.phone.length}/10 entered</span>
                <span className="text-[9px] text-earth/50">Starts with 6, 7, 8, or 9</span>
              </p>
            ) : showPhoneError ? (
              <p className="text-red-500 text-[10px] font-mono font-semibold flex items-center gap-1">
                ⚠️ {phoneRes.error || errors.phone}
              </p>
            ) : (
              <p className="text-[9px] text-earth/50">
                {shipping.phone.length > 0 ? `${shipping.phone.length}/10 entered` : "10-digit Indian mobile starting with 6, 7, 8, or 9"}
              </p>
            )}
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono uppercase tracking-wider text-earth/60 font-bold block">
              Email Address (@gmail.com only) *
            </label>
            {emailFocused ? (
              <span className="text-[9px] font-mono text-earth/60">
                Entering email...
              </span>
            ) : showEmailError ? (
              <span className="text-[9px] font-mono font-bold text-red-500">
                ⚠️ Invalid Format
              </span>
            ) : null}
          </div>
          <input
            type="email"
            placeholder="aarav@gmail.com"
            value={shipping.email}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => {
              setEmailFocused(false);
              setEmailTouched(true);
            }}
            onChange={(e) => {
              onChange({ email: e.target.value });
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            className={`w-full px-3 py-2 bg-[#FAF9F5] border rounded-lg text-xs font-sans focus:outline-none transition ${
              emailFocused
                ? "border-moss bg-white ring-1 ring-moss/20"
                : showEmailError
                ? "border-red-500 bg-red-50/20 text-red-900"
                : errors.email && !emailFocused
                ? "border-red-500 bg-red-50/20"
                : "border-sand/60 focus:border-moss"
            }`}
          />
          {emailFocused ? (
            <p className="text-[10px] font-mono text-earth/60">
              Only Gmail addresses ending with @gmail.com are accepted
            </p>
          ) : showEmailError ? (
            <p className="text-red-500 text-[10px] font-mono font-semibold flex items-center gap-1">
              ⚠️ {emailRes.error || errors.email}
            </p>
          ) : (
            <p className="text-[9px] text-earth/50">Only Gmail addresses (@gmail.com) allowed for tracking</p>
          )}
        </div>

        {/* Account Info Notice (For Guest Checkout) */}
        {!currentUser && (
          <div className="p-2.5 bg-moss/10 border border-moss/20 rounded-lg flex items-center justify-between text-xs font-mono text-moss font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 shrink-0 text-moss" />
              Account auto-linked to email for instant order tracking
            </span>
          </div>
        )}

        {/* Street Address */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-earth/60 font-bold block">
            Street Address *
          </label>
          <input
            type="text"
            placeholder="Flat/House No., Building, Street, Landmark"
            value={shipping.street}
            onChange={(e) => onChange({ street: e.target.value })}
            className={`w-full px-3 py-2 bg-[#FAF9F5] border rounded-lg text-xs font-sans focus:outline-none transition ${
              errors.street ? "border-red-500 bg-red-50/20" : "border-sand/60 focus:border-moss"
            }`}
          />
          {errors.street && <p className="text-red-500 text-[10px] font-mono">{errors.street}</p>}
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-earth/60 font-bold block">
              City *
            </label>
            <input
              type="text"
              placeholder="Jaipur"
              value={shipping.city}
              onChange={(e) => onChange({ city: e.target.value })}
              className={`w-full px-2.5 py-2 bg-[#FAF9F5] border rounded-lg text-xs font-sans focus:outline-none transition ${
                errors.city ? "border-red-500 bg-red-50/20" : "border-sand/60 focus:border-moss"
              }`}
            />
            {errors.city && <p className="text-red-500 text-[10px] font-mono">{errors.city}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-earth/60 font-bold block">
              State *
            </label>
            <input
              type="text"
              placeholder="Rajasthan"
              value={shipping.state}
              onChange={(e) => onChange({ state: e.target.value })}
              className={`w-full px-2.5 py-2 bg-[#FAF9F5] border rounded-lg text-xs font-sans focus:outline-none transition ${
                errors.state ? "border-red-500 bg-red-50/20" : "border-sand/60 focus:border-moss"
              }`}
            />
            {errors.state && <p className="text-red-500 text-[10px] font-mono">{errors.state}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-earth/60 font-bold block">
              PIN / ZIP *
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="302001"
              value={shipping.zip}
              onChange={(e) => {
                const numericOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
                onChange({ zip: numericOnly });
                if (errors.zip) setErrors((prev) => ({ ...prev, zip: "" }));
              }}
              className={`w-full px-2.5 py-2 bg-[#FAF9F5] border rounded-lg text-xs font-mono focus:outline-none transition ${
                errors.zip ? "border-red-500 bg-red-50/20" : "border-sand/60 focus:border-moss"
              }`}
            />
            {errors.zip && <p className="text-red-500 text-[10px] font-mono">{errors.zip}</p>}
          </div>
        </div>

        {/* Country */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-earth/60 font-bold block">
            Country
          </label>
          <input
            type="text"
            disabled
            value={shipping.country || "India"}
            className="w-full px-3 py-2 bg-sand/10 border border-sand/40 rounded-lg text-xs font-sans text-earth/60 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-3 bg-white hover:bg-sand/20 border border-sand text-ink text-xs font-serif font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        <button
          type="submit"
          disabled={!isFormValid || isLoggingIn}
          className={`flex-1 py-3.5 text-white font-serif font-bold text-sm tracking-wide rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
            isFormValid && !isLoggingIn
              ? "bg-moss hover:bg-moss-hover"
              : "bg-moss/40 cursor-not-allowed"
          }`}
        >
          {isLoggingIn ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Connecting Account & Proceeding...</span>
            </>
          ) : (
            <>
              <span>Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// ==========================================
// UPI PAYMENT SUBCOMPONENT (Responsive Mobile Intent vs Desktop QR)
// ==========================================
export const triggerUpiIntent = (
  appKey: string,
  amount: number,
  merchantVpa: string,
  merchantName: string = "Wanderer Store"
) => {
  const cleanAmount = Math.round(amount);
  const cleanVpa = (merchantVpa || "").trim() || "techbuddystorelimited-2@oksbi";
  const encodedName = encodeURIComponent(merchantName);
  const encodedNote = encodeURIComponent("Wanderer Order");

  const baseParams = `pa=${cleanVpa}&pn=${encodedName}&am=${cleanAmount}&cu=INR&tn=${encodedNote}`;

  let primaryUri = `upi://pay?${baseParams}`;

  if (appKey === "phonepe") {
    primaryUri = `phonepe://pay?${baseParams}`;
  } else if (appKey === "gpay") {
    primaryUri = `tez://upi/pay?${baseParams}`;
  } else if (appKey === "paytm") {
    primaryUri = `paytmmp://pay?${baseParams}`;
  } else if (appKey === "bhim") {
    primaryUri = `upi://pay?${baseParams}`;
  }

  console.log(`[UPI Intent] Launching ${appKey} via: ${primaryUri}`);

  // 1. Primary anchor tag trigger
  try {
    const a = document.createElement("a");
    a.href = primaryUri;
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    console.warn("Anchor click failed:", e);
  }

  // 2. Direct location assignment fallback
  setTimeout(() => {
    try {
      window.location.href = primaryUri;
    } catch (e) {
      console.warn("Location assign failed:", e);
    }
  }, 50);

  // 3. Android Intent package redirect fallback
  const isAndroid = /Android/i.test(navigator.userAgent || "");
  if (isAndroid) {
    let pkg = "";
    if (appKey === "phonepe") pkg = "com.phonepe.app";
    else if (appKey === "gpay") pkg = "com.google.android.apps.nbu.paisa.user";
    else if (appKey === "paytm") pkg = "net.one97.paytm";

    if (pkg) {
      setTimeout(() => {
        const intentUrl = `intent://pay?${baseParams}#Intent;scheme=upi;package=${pkg};end;`;
        try {
          window.location.href = intentUrl;
        } catch (e) {
          console.warn("Android Intent launch failed:", e);
        }
      }, 300);
    }
  }

  // 4. Generic upi:// fallback
  if (primaryUri !== `upi://pay?${baseParams}`) {
    setTimeout(() => {
      try {
        window.location.href = `upi://pay?${baseParams}`;
      } catch (e) {
        console.warn("Generic UPI fallback failed:", e);
      }
    }, 600);
  }
};

const PhonePeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#5F259F" />
    <circle cx="50" cy="50" r="30" fill="#FFFFFF" />
    <path d="M53 38.5 L45 26.5" stroke="#5F259F" strokeWidth="5.5" strokeLinecap="round" />
    <rect x="34" y="38.5" width="32" height="5.5" rx="2.5" fill="#5F259F" />
    <path
      d="M42 41.5 V52 C42 56 45 59 49 59 C53 59 56 56 56 52 V41.5"
      stroke="#5F259F"
      strokeWidth="5.5"
      strokeLinecap="round"
      fill="none"
    />
    <rect x="53.5" y="41.5" width="5.5" height="28" rx="2.5" fill="#5F259F" />
  </svg>
);

const PaytmIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
    <g transform="translate(10, 10)">
      <text x="6" y="28" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="22" fill="#002E6E" letterSpacing="-0.5">
        pay
      </text>
      <text x="46" y="28" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="22" fill="#00BAF2" letterSpacing="-0.5">
        tm
      </text>
      <rect x="6" y="37" width="28" height="3.5" rx="1" fill="#00BAF2" />
      <path d="M40 34 C37.5 31.5 33 33 33 36.5 C33 41 40 45.5 40 45.5 C40 45.5 47 41 47 36.5 C47 33 42.5 31.5 40 34 Z" fill="#FF3E55" />
      <rect x="46" y="37" width="28" height="3.5" rx="1" fill="#002E6E" />
      <text x="8" y="68" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontStyle="italic" fontSize="22" fill="#4B5563" letterSpacing="0.5">
        UPI
      </text>
      <polygon points="56,52 65,60 56,68" fill="#F97316" />
      <polygon points="63,52 72,60 63,68" fill="#22C55E" />
    </g>
  </svg>
);

const GPayIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
    <g strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M 38 60 L 26 42" stroke="#4285F4" />
      <path d="M 26 42 L 56 22" stroke="#34A853" />
      <path d="M 56 22 L 44 68" stroke="#FBBC04" />
      <path d="M 44 68 L 74 42" stroke="#EA4335" />
    </g>
  </svg>
);

const BhimIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#0B2154" />
    <path d="M28 25 H52 C60 25 66 29 66 36 C66 41 62 45 56 46 C64 48 70 53 70 61 C70 70 62 75 52 75 H28 V25 Z M40 42 H50 C54 42 57 39 57 35.5 C57 32 54 29 50 29 H40 V42 Z M40 68 H51 C55 68 59 65 59 61 C59 57 55 54 51 54 H40 V68 Z" fill="#22C55E" />
    <path d="M68 75 L82 40 L74 32 L60 67 L68 75 Z" fill="#F97316" />
  </svg>
);

const UpiPaymentSection: React.FC<{
  payment: PaymentDetails;
  onChange: (updated: Partial<PaymentDetails>) => void;
  calculatedTotal: number;
  paymentPublicConfig?: {
    intentEnabled?: boolean;
    qrEnabled?: boolean;
    upiVpa?: string;
  };
  paymentTimerSeconds: number;
  formatTime: (sec: number) => string;
  onShowWhatsapp: () => void;
}> = ({
  payment,
  onChange,
  calculatedTotal,
  paymentPublicConfig,
  paymentTimerSeconds,
  formatTime,
  onShowWhatsapp,
}) => {
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  const [vpaCopied, setVpaCopied] = useState<boolean>(false);
  const [liveVpa, setLiveVpa] = useState<string>(paymentPublicConfig?.upiVpa || "");

  useEffect(() => {
    if (paymentPublicConfig?.upiVpa) {
      setLiveVpa(paymentPublicConfig.upiVpa);
    }
  }, [paymentPublicConfig?.upiVpa]);

  useEffect(() => {
    const fetchLatestVpa = () => {
      fetch("/api/payments/config")
        .then((res) => (res.ok && res.headers.get("content-type")?.includes("application/json") ? res.json() : null))
        .then((data) => {
          if (data?.upiVpa !== undefined) {
            setLiveVpa(data.upiVpa);
          }
        })
        .catch(() => {});
    };
    fetchLatestVpa();
    window.addEventListener("payment-config-updated", fetchLatestVpa);
    return () => window.removeEventListener("payment-config-updated", fetchLatestVpa);
  }, []);

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || "";
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isTouchOrSmall = window.innerWidth <= 768 || ("ontouchstart" in window && window.innerWidth <= 1024);
      setIsMobileDevice(mobileRegex.test(userAgent) || isTouchOrSmall);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const intentAllowed = paymentPublicConfig?.intentEnabled !== false;
  const qrAllowed = paymentPublicConfig?.qrEnabled !== false;

  const isMobile = intentAllowed && !qrAllowed 
    ? true 
    : !intentAllowed && qrAllowed 
    ? false 
    : isMobileDevice;

  const merchantVpa = (liveVpa || paymentPublicConfig?.upiVpa || "").trim() || "techbuddystorelimited-2@oksbi";
  const merchantName = "Wanderer Store";
  const upiUri = `upi://pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${calculatedTotal}&cu=INR&tn=${encodeURIComponent("Wanderer Order")}`;

  const selectedApp = (payment.upiApp === "phonepe" || payment.upiApp === "gpay" || payment.upiApp === "paytm" || payment.upiApp === "bhim") ? payment.upiApp : "phonepe";

  const handleSelectApp = (appKey: "phonepe" | "paytm" | "gpay" | "bhim") => {
    onChange({ upiApp: appKey });
    triggerUpiIntent(appKey, calculatedTotal, merchantVpa, merchantName);
  };

  return (
    <div className="p-4 bg-[#FAF9F5] rounded-xl border border-sand/60 space-y-4 text-xs font-sans">
      {/* Device Mode Detector Header & Manual Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-sand/40">
        <div className="flex items-center gap-2">
          {isMobile ? (
            <Smartphone className="w-4 h-4 text-moss shrink-0" />
          ) : (
            <QrCode className="w-4 h-4 text-moss shrink-0" />
          )}
          <div>
            <span className="font-serif font-bold text-ink block text-xs">
              {isMobile ? "UPI App Direct Intent" : "Dynamic UPI QR Code"}
            </span>
            <span className="text-[10px] text-earth/60">
              {isMobile ? "Instant payment via installed mobile apps" : "Scan & pay with any UPI application"}
            </span>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW: UPI Intent App Selector */}
      {isMobile ? (
        <div className="space-y-3">
          <label className="text-[10px] font-mono uppercase tracking-wider text-earth/60 font-bold block">
            Select UPI Application
          </label>

          <div className="space-y-2">
            {/* PhonePe */}
            <div
              onClick={() => handleSelectApp("phonepe")}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedApp === "phonepe"
                  ? "bg-white border-[#2C3327] ring-1 ring-[#2C3327] shadow-xs"
                  : "bg-white/60 border-sand/60 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="upiAppSelection"
                    checked={selectedApp === "phonepe"}
                    onChange={() => handleSelectApp("phonepe")}
                    className="accent-moss w-4 h-4 cursor-pointer"
                  />
                  <PhonePeIcon className="w-6 h-6 shrink-0" />
                  <div>
                    <span className="font-serif font-bold text-ink text-xs block">PhonePe</span>
                    <span className="text-[10px] text-earth/60">Pay instantly via PhonePe App</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-moss bg-moss/10 px-2 py-0.5 rounded">
                  RECOMMENDED
                </span>
              </div>
            </div>

            {/* Google Pay */}
            <div
              onClick={() => handleSelectApp("gpay")}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedApp === "gpay"
                  ? "bg-white border-[#2C3327] ring-1 ring-[#2C3327] shadow-xs"
                  : "bg-white/60 border-sand/60 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="upiAppSelection"
                    checked={selectedApp === "gpay"}
                    onChange={() => handleSelectApp("gpay")}
                    className="accent-moss w-4 h-4 cursor-pointer"
                  />
                  <GPayIcon className="w-6 h-6 shrink-0" />
                  <div>
                    <span className="font-serif font-bold text-ink text-xs block">Google Pay</span>
                    <span className="text-[10px] text-earth/60">Pay securely with GPay</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Paytm */}
            <div
              onClick={() => handleSelectApp("paytm")}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedApp === "paytm"
                  ? "bg-white border-[#2C3327] ring-1 ring-[#2C3327] shadow-xs"
                  : "bg-white/60 border-sand/60 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="upiAppSelection"
                    checked={selectedApp === "paytm"}
                    onChange={() => handleSelectApp("paytm")}
                    className="accent-moss w-4 h-4 cursor-pointer"
                  />
                  <PaytmIcon className="w-6 h-6 shrink-0" />
                  <div>
                    <span className="font-serif font-bold text-ink text-xs block">Paytm UPI</span>
                    <span className="text-[10px] text-earth/60">Pay via Paytm Wallet / UPI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-moss/5 border border-moss/20 rounded-lg flex items-center gap-2 text-[11px] text-earth/80">
            <ShieldCheck className="w-4 h-4 text-moss shrink-0" />
            <span>Scan QR code with your UPI app to pay <strong>₹{Math.round(calculatedTotal).toLocaleString("en-IN")}</strong>.</span>
          </div>

          {/* Little Countdown Bar (Reference Design) */}
          <div className="pt-2 pb-1 flex flex-col items-center justify-center space-y-1.5 max-w-[220px] mx-auto">
            <div className="text-xs text-slate-700 font-sans tracking-tight text-center">
              {paymentTimerSeconds > 0 ? (
                <>
                  UPI session valid for <span className="font-bold text-slate-900">{formatTime(paymentTimerSeconds)}</span> minutes
                </>
              ) : (
                <span className="text-red-600 font-bold">Session expired</span>
              )}
            </div>
            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  paymentTimerSeconds <= 30 ? "bg-red-500" : "bg-blue-600"
                }`}
                style={{ width: `${(paymentTimerSeconds / 120) * 100}%` }}
              />
            </div>
            {paymentTimerSeconds === 0 && (
              <button
                type="button"
                onClick={onShowWhatsapp}
                className="mt-1 px-3 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold rounded-md shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Support</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* DESKTOP VIEW: Dynamic QR Code Flow */
        <div className="space-y-4 text-center">
          <div className="bg-white p-4 rounded-xl border border-sand/60 shadow-xs space-y-3 max-w-sm mx-auto">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-earth/60 font-bold block">
                Scan QR using any UPI App
              </span>
              <div className="font-mono text-moss font-bold text-base">
                Grand Total: ₹{Math.round(calculatedTotal).toLocaleString("en-IN")}
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-[#FAF9F5] rounded-xl border border-sand/60 inline-block shadow-inner relative group">
              <QRCodeSVG
                value={upiUri}
                size={160}
                bgColor="#FAF9F5"
                fgColor="#1C2333"
                level="H"
                includeMargin={false}
              />
              <div className="mt-2 text-[10px] font-mono font-bold text-earth/70 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-moss" />
                <span>Exact Total Encoded</span>
              </div>
            </div>

            {/* Little Countdown Bar (Reference Design) */}
            <div className="py-1 flex flex-col items-center justify-center space-y-1.5 max-w-[200px] mx-auto">
              <div className="text-xs text-slate-700 font-sans tracking-tight text-center">
                {paymentTimerSeconds > 0 ? (
                  <>
                    QR valid for <span className="font-bold text-slate-900">{formatTime(paymentTimerSeconds)}</span> minutes
                  </>
                ) : (
                  <span className="text-red-600 font-bold">QR code expired</span>
                )}
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    paymentTimerSeconds <= 30 ? "bg-red-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${(paymentTimerSeconds / 120) * 100}%` }}
                />
              </div>
              {paymentTimerSeconds === 0 && (
                <button
                  type="button"
                  onClick={onShowWhatsapp}
                  className="mt-1 px-3 py-1 bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold rounded-md shadow-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Support</span>
                </button>
              )}
            </div>

            {/* Helper Text & Logos */}
            <div className="space-y-2 pt-2 border-t border-sand/30">
              <p className="text-[11px] text-earth/70 font-sans">
                Scan QR using <strong>PhonePe, Google Pay, Paytm, BHIM</strong>, or any bank app to pay.
              </p>
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <PhonePeIcon className="w-5 h-5 opacity-90 hover:opacity-100 transition" />
                <GPayIcon className="w-5 h-5 opacity-90 hover:opacity-100 transition" />
                <PaytmIcon className="w-5 h-5 opacity-90 hover:opacity-100 transition" />
                <BhimIcon className="w-5 h-5 opacity-90 hover:opacity-100 transition" />
              </div>
            </div>
          </div>


        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. STEP 3: PAYMENT & BILLING COMPONENT
// ==========================================
const PaymentStep: React.FC<{
  payment: PaymentDetails;
  onChange: (updated: Partial<PaymentDetails>) => void;
  shipping: ShippingDetails;
  cartTotal: number;
  cartSubtotal: number;
  discountAmount: number;
  appliedCoupon: any;
  onBack: () => void;
  onPlaceOrder: () => void;
  isSubmitting: boolean;
  paymentPublicConfig?: { 
    codEnabled?: boolean; 
    prepaidEnabled?: boolean;
    cardEnabled?: boolean;
    upiEnabled?: boolean;
    netbankingEnabled?: boolean;
    intentEnabled?: boolean;
    qrEnabled?: boolean;
    upiVpa?: string;
    prepaidDeliveryCost?: number;
    codDeliveryCost?: number;
    freeShippingThreshold?: number;
  };
  paymentTimerSeconds: number;
  formatTime: (sec: number) => string;
  onShowWhatsapp: () => void;
  onResetTimer: () => void;
}> = ({
  payment,
  onChange,
  shipping,
  cartTotal,
  cartSubtotal,
  discountAmount,
  appliedCoupon,
  onBack,
  onPlaceOrder,
  isSubmitting,
  paymentPublicConfig,
  paymentTimerSeconds,
  formatTime,
  onShowWhatsapp,
  onResetTimer
}) => {
  const freeThreshold = paymentPublicConfig?.freeShippingThreshold ?? 2999;
  const prepaidCost = paymentPublicConfig?.prepaidDeliveryCost ?? 0;
  const codCost = paymentPublicConfig?.codDeliveryCost ?? 200;

  const isPrepaidAllowed = paymentPublicConfig?.prepaidEnabled !== false;
  const isCardAllowed = isPrepaidAllowed && paymentPublicConfig?.cardEnabled !== false;
  const isUpiAllowed = isPrepaidAllowed && paymentPublicConfig?.upiEnabled !== false;
  const isNetbankingAllowed = isPrepaidAllowed && paymentPublicConfig?.netbankingEnabled !== false;
  const isCodAllowed = paymentPublicConfig?.codEnabled !== false;

  useEffect(() => {
    const isCurrentAllowed =
      (payment.method === "card" && isCardAllowed) ||
      (payment.method === "upi" && isUpiAllowed) ||
      (payment.method === "netbanking" && isNetbankingAllowed) ||
      (payment.method === "cod" && isCodAllowed);

    if (!isCurrentAllowed) {
      if (isCardAllowed) onChange({ method: "card" });
      else if (isUpiAllowed) onChange({ method: "upi" });
      else if (isNetbankingAllowed) onChange({ method: "netbanking" });
      else if (isCodAllowed) onChange({ method: "cod" });
    }
  }, [isCardAllowed, isUpiAllowed, isNetbankingAllowed, isCodAllowed, payment.method]);
  
  const isFreeDelivery = cartSubtotal >= freeThreshold || cartSubtotal === 0;
  const shippingCost = isFreeDelivery ? 0 : (payment.method === "cod" ? codCost : prepaidCost);
  const calculatedTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  const phoneRes = validatePhoneFormat(shipping.phone);
  const emailRes = validateEmailFormat(shipping.email);
  const isContactValid = phoneRes.isValid && emailRes.isValid;

  return (
    <div className="space-y-5">
      {/* Final Order Review Card */}
      <div className="p-4 bg-white rounded-xl border border-sand/40 space-y-2 text-xs">
        <div className="flex justify-between text-earth/70">
          <span>Delivery Address:</span>
          <span className="font-medium text-ink text-right max-w-[200px] truncate">
            {shipping.street}, {shipping.city}
          </span>
        </div>

        <div className="flex justify-between text-earth/70">
          <span>Mobile Number:</span>
          <span className={`font-mono font-medium ${phoneRes.isValid ? "text-ink" : "text-red-600 font-bold"}`}>
            {shipping.phone || "Not provided"} {phoneRes.isValid ? "✓" : "⚠️ Invalid"}
          </span>
        </div>

        <div className="flex justify-between text-earth/70">
          <span>Contact Email:</span>
          <span className={`font-mono font-medium ${emailRes.isValid ? "text-ink" : "text-red-600 font-bold"}`}>
            {shipping.email || "Not provided"} {emailRes.isValid ? "✓" : "⚠️ Invalid"}
          </span>
        </div>

        <div className="flex justify-between text-earth/70 pt-1 border-t border-sand/30">
          <span>Items Subtotal:</span>
          <span className="font-mono">₹{Math.round(cartSubtotal).toLocaleString("en-IN")}</span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-moss font-semibold">
            <span>Discount ({appliedCoupon.code}):</span>
            <span className="font-mono">-₹{Math.round(discountAmount).toLocaleString("en-IN")}</span>
          </div>
        )}

        <div className="flex justify-between text-earth/70">
          <span>Shipping Fee ({payment.method === "cod" ? "COD" : "Prepaid"}):</span>
          <span className="font-mono font-semibold">
            {shippingCost === 0 ? (
              <span className="text-moss font-bold text-xs">FREE</span>
            ) : (
              `₹${shippingCost}`
            )}
          </span>
        </div>

        <div className="border-t border-sand/40 pt-2 flex justify-between text-base font-bold text-ink">
          <span>Grand Total</span>
          <span className="font-mono text-moss text-lg">₹{Math.round(calculatedTotal).toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="bg-white p-4 md:p-5 rounded-xl border border-sand/40 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-sand/40">
          <CreditCard className="w-4 h-4 text-moss" />
          <h4 className="font-serif font-bold text-ink text-sm">Select Payment Method</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {/* Card Option */}
          {isCardAllowed && (
            <button
              type="button"
              onClick={() => onChange({ method: "card" })}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                payment.method === "card"
                  ? "bg-moss text-white border-moss font-bold shadow-sm"
                  : "bg-[#FAF9F5] text-ink/70 border-sand/40 hover:bg-sand/10"
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-xs font-serif">Credit / Debit</span>
            </button>
          )}

          {/* UPI Option */}
          {isUpiAllowed && (
            <button
              type="button"
              onClick={() => onChange({ method: "upi" })}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                payment.method === "upi"
                  ? "bg-moss text-white border-moss font-bold shadow-sm"
                  : "bg-[#FAF9F5] text-ink/70 border-sand/40 hover:bg-sand/10"
              }`}
            >
              <QrCode className="w-5 h-5" />
              <span className="text-xs font-serif">UPI / QR</span>
            </button>
          )}

          {/* Netbanking Option */}
          {isNetbankingAllowed && (
            <button
              type="button"
              onClick={() => onChange({ method: "netbanking" })}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                payment.method === "netbanking"
                  ? "bg-moss text-white border-moss font-bold shadow-sm"
                  : "bg-[#FAF9F5] text-ink/70 border-sand/40 hover:bg-sand/10"
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span className="text-xs font-serif">Net Banking</span>
            </button>
          )}

          {/* COD Option */}
          {isCodAllowed && (
            <button
              type="button"
              onClick={() => onChange({ method: "cod" })}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                payment.method === "cod"
                  ? "bg-moss text-white border-moss font-bold shadow-sm"
                  : "bg-[#FAF9F5] text-ink/70 border-sand/40 hover:bg-sand/10"
              }`}
            >
              <Banknote className="w-5 h-5" />
              <span className="text-xs font-serif">Cash on Delivery</span>
            </button>
          )}
        </div>

        {!isCardAllowed && !isUpiAllowed && !isNetbankingAllowed && !isCodAllowed && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>No payment methods are currently active. Please contact support.</span>
          </div>
        )}

        {/* Dynamic Payment Details Inputs */}
        <div className="pt-2">
          {payment.method === "card" && isCardAllowed && (
            <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-sand/40 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-earth/60 font-bold block">
                  Card Number
                </label>
                <input
                  type="text"
                  maxLength={19}
                  placeholder="4532 •••• •••• 8920"
                  value={payment.cardNumber}
                  onChange={(e) => onChange({ cardNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-sand/60 rounded-lg font-mono focus:outline-none focus:border-moss"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-earth/60 font-bold block">
                    Expiry Date (MM/YY)
                  </label>
                  <input
                    type="text"
                    placeholder="08/28"
                    maxLength={5}
                    value={payment.cardExpiry}
                    onChange={(e) => onChange({ cardExpiry: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-sand/60 rounded-lg font-mono focus:outline-none focus:border-moss"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-earth/60 font-bold block">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    value={payment.cardCvv}
                    onChange={(e) => onChange({ cardCvv: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-sand/60 rounded-lg font-mono focus:outline-none focus:border-moss"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-earth/60 font-bold block">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="Name on Card"
                  value={payment.cardHolder}
                  onChange={(e) => onChange({ cardHolder: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-sand/60 rounded-lg focus:outline-none focus:border-moss"
                />
              </div>
            </div>
          )}

          {payment.method === "upi" && isUpiAllowed && (
            <UpiPaymentSection
              payment={payment}
              onChange={onChange}
              calculatedTotal={calculatedTotal}
              paymentPublicConfig={paymentPublicConfig}
              paymentTimerSeconds={paymentTimerSeconds}
              formatTime={formatTime}
              onShowWhatsapp={onShowWhatsapp}
            />
          )}

          {payment.method === "netbanking" && (
            <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-sand/40 space-y-3 text-xs">
              <label className="text-[10px] font-mono uppercase tracking-wider text-earth/60 font-bold block">
                Select Your Bank
              </label>
              <select
                value={payment.bankName}
                onChange={(e) => onChange({ bankName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-sand/60 rounded-lg focus:outline-none focus:border-moss"
              >
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="State Bank of India">State Bank of India (SBI)</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
              </select>
            </div>
          )}

          {payment.method === "cod" && (
            <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold font-serif">
                <Banknote className="w-4 h-4" />
                <span>Cash On Delivery Notice</span>
              </div>
              <p className="text-amber-800/80 leading-relaxed text-[11px]">
                A ₹200 advance commitment token is required to dispatch cash-on-delivery orders. The remaining ₹{Math.max(0, Math.round(cartTotal) - 200).toLocaleString("en-IN")} will be collected upon doorstep delivery.
              </p>
            </div>
          )}
        </div>

      </div>

      {!isContactValid && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-1 text-xs text-red-800">
          <div className="flex items-center gap-1.5 font-bold text-red-900">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Invalid Contact Details Format</span>
          </div>
          {!phoneRes.isValid && <p className="text-[11px] font-mono">• {phoneRes.error}</p>}
          {!emailRes.isValid && <p className="text-[11px] font-mono">• {emailRes.error}</p>}
          <button
            type="button"
            onClick={onBack}
            className="text-[11px] font-bold text-red-700 underline pt-1 block cursor-pointer"
          >
            ← Click here to return to Shipping & fix contact details
          </button>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 pt-3 border-t border-sand/40">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full py-3 bg-white hover:bg-sand/20 border border-sand text-ink text-xs font-serif font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Shipping</span>
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 5. STEP 4: CONFIRMATION COMPONENT
// ==========================================
const ConfirmationStep: React.FC<{
  placedOrder: any;
  onContinueShopping: () => void;
}> = ({ placedOrder, onContinueShopping }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyOrderId = () => {
    if (placedOrder?.id) {
      navigator.clipboard.writeText(placedOrder.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="py-6 px-4 md:px-6 space-y-6 text-center max-w-lg mx-auto">
      {/* Animated Success Icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full bg-moss/10 text-moss border-2 border-moss flex items-center justify-center mx-auto shadow-lg"
      >
        <CheckCircle className="w-12 h-12 stroke-[2.5]" />
      </motion.div>

      <div className="space-y-1.5">
        <h3 className="font-serif text-2xl font-bold text-ink">Order Confirmed!</h3>
        <p className="text-earth/60 text-xs font-sans max-w-sm mx-auto leading-relaxed">
          Thank you for your order. We are carefully preparing your artisanal pieces for dispatch.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="p-4 bg-white rounded-2xl border border-sand/50 shadow-sm text-left space-y-3 font-mono text-xs">
        <div className="flex justify-between items-center pb-2 border-b border-sand/40">
          <span className="text-earth/60">Order ID Number:</span>
          <div className="flex items-center gap-1.5 font-bold text-moss">
            <span>{placedOrder?.id || "ORD-930211"}</span>
            <button
              onClick={handleCopyOrderId}
              className="p-1 hover:bg-sand/30 rounded cursor-pointer transition text-earth/50 hover:text-earth"
              title="Copy Order ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-moss" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-earth/70">
          <span>Tracking Code:</span>
          <span className="font-semibold text-ink">{placedOrder?.trackingNumber || "Assigned upon dispatch"}</span>
        </div>

        <div className="flex justify-between items-center text-earth/70">
          <span>Customer Email:</span>
          <span className="font-medium text-ink truncate max-w-[180px]">{placedOrder?.customerEmail}</span>
        </div>

        <div className="flex justify-between items-center text-earth/70">
          <span>Payment Status:</span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
            {placedOrder?.paymentStatus || "PAID SECURELY"}
          </span>
        </div>

        <div className="border-t border-sand/40 pt-2 flex justify-between items-center text-sm font-bold text-ink">
          <span>Total Paid:</span>
          <span className="text-moss font-mono text-base">₹{Math.round(placedOrder?.total || 0).toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onContinueShopping}
        className="w-full py-3.5 bg-moss hover:bg-moss-hover text-white font-serif font-bold text-sm tracking-wide rounded-xl shadow-md transition cursor-pointer"
      >
        Continue Shopping
      </button>
    </div>
  );
};

// ==========================================
// MAIN MULTI-STEP CHECKOUT WRAPPER
// ==========================================
export const MultiStepCheckout: React.FC<MultiStepCheckoutProps> = ({
  isOpen,
  onClose,
  cart,
  updateCartQty,
  removeFromCart,
  clearCart,
  cartSubtotal,
  discountAmount,
  cartTotal,
  appliedCoupon,
  couponCode,
  setCouponCode,
  handleValidateCoupon,
  couponError,
  couponSuccess,
  currentUser,
  onOrderPlacedSuccess,
  onUserAuthSuccess,
  onOpenLoginModal,
  getDirectImageUrl,
  cmsConfig,
  paymentPublicConfig
}) => {
  const [liveConfig, setLiveConfig] = useState(paymentPublicConfig);
  const [emailExistsError, setEmailExistsError] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  useEffect(() => {
    if (paymentPublicConfig) {
      setLiveConfig((prev) => ({ ...prev, ...paymentPublicConfig }));
    }
  }, [paymentPublicConfig]);

  const fetchLiveConfig = () => {
    fetch("/api/payments/config")
      .then((res) => (res.ok && res.headers.get("content-type")?.includes("application/json") ? res.json() : null))
      .then((data) => {
        if (data) setLiveConfig(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (isOpen) {
      fetchLiveConfig();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleConfigUpdate = () => {
      fetchLiveConfig();
    };
    window.addEventListener("payment-config-updated", handleConfigUpdate);
    return () => window.removeEventListener("payment-config-updated", handleConfigUpdate);
  }, []);

  // Main Step State: 1 = Cart, 2 = Shipping, 3 = Payment, 4 = Confirmation
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const sanitizePhone = (p?: string) => {
    if (!p) return "";
    const digits = p.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
    return digits.slice(-10);
  };

  // Form State
  const [shipping, setShipping] = useState<ShippingDetails>({
    fullName: currentUser?.displayName || currentUser?.name || "",
    email: currentUser?.email || "",
    phone: sanitizePhone(currentUser?.phone),
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India"
  });

  const [payment, setPayment] = useState<PaymentDetails>({
    method: "card",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardHolder: currentUser?.displayName || currentUser?.name || "",
    upiId: "",
    upiApp: "phonepe",
    bankName: "HDFC Bank",
    sameAsShippingBilling: true,
    billingStreet: "",
    billingCity: "",
    billingState: "",
    billingZip: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [lastCancelledOrder, setLastCancelledOrder] = useState<any>(null);

  // 2-Minutes Timer & Cancel Modal State
  const [paymentTimerSeconds, setPaymentTimerSeconds] = useState<number>(120);
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState<boolean>(false);
  const [pendingCancelAction, setPendingCancelAction] = useState<(() => void) | null>(null);

  // Timer Countdown Effect on Payment Step (Step 3)
  useEffect(() => {
    let interval: any = null;
    if (currentStep === 3 && isOpen && !isSubmitting) {
      interval = setInterval(() => {
        setPaymentTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setWhatsappModalOpen(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep, isOpen, isSubmitting]);

  // Reset timer whenever step 3 opens or is re-entered
  useEffect(() => {
    if (currentStep === 3) {
      setPaymentTimerSeconds(120);
      setWhatsappModalOpen(false);
    }
  }, [currentStep]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const recordCancelledPaymentOrder = async () => {
    if (cart.length === 0) return;
    try {
      const shippingAddress = {
        street: shipping.street || "N/A",
        city: shipping.city || "N/A",
        state: shipping.state || "N/A",
        zip: shipping.zip || "N/A",
        country: shipping.country || "India"
      };
      const cancelledPayload = {
        customerName: shipping.fullName || currentUser?.displayName || currentUser?.name || "Customer",
        customerEmail: shipping.email || currentUser?.email || "guest@example.com",
        customerPhone: shipping.phone || "",
        shippingAddress,
        items: cart.map((itm) => {
          const itemImg = itm.selectedVariant?.images?.[0] || itm.product.images?.[0] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80";
          return {
            productId: itm.product.id,
            name: itm.selectedVariant
              ? `${itm.product.name} (${itm.selectedVariant.color})`
              : itm.product.name,
            price: itm.selectedVariant
              ? (itm.selectedVariant.sellingPrice || itm.selectedVariant.price || itm.product.price)
              : (itm.product.sellingPrice || itm.product.price),
            quantity: itm.quantity,
            size: itm.selectedSize || "M",
            color: itm.selectedVariant?.color || itm.product.colors?.[0] || "Default",
            image: itemImg,
            imageUrl: itemImg
          };
        }),
        subtotal: cartSubtotal,
        discount: discountAmount,
        total: Math.max(0, cartSubtotal - discountAmount),
        paymentMethod: (payment.method || "online").toUpperCase(),
        paymentStatus: "Payment Canceled",
        status: "Cancelled",
        tags: ["payment canceled"],
        userId: currentUser?.id || "guest"
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cancelledPayload)
      });
      const data = await res.json();
      const savedOrder = data?.id ? data : cancelledPayload;
      setLastCancelledOrder(savedOrder);

      if (onOrderPlacedSuccess) {
        onOrderPlacedSuccess(savedOrder);
      }
    } catch (err) {
      console.error("Error posting cancelled payment order:", err);
    }
  };

  const handleInterceptCancel = (action: () => void) => {
    if (currentStep === 3) {
      setPendingCancelAction(() => action);
      setCancelModalOpen(true);
    } else {
      action();
    }
  };

  const handleConfirmCancelAction = async () => {
    setCancelModalOpen(false);
    if (currentStep === 3) {
      await recordCancelledPaymentOrder();
      // Reset payment view and return to Cart Review step (Step 1)
      setCurrentStep(1);
      setCompletedSteps(new Set());
      setPayment((prev) => ({
        ...prev,
        method: "card",
        upiId: ""
      }));
      setPaymentTimerSeconds(120);
    } else if (pendingCancelAction) {
      pendingCancelAction();
    }
    setPendingCancelAction(null);
  };

  const handleDismissCancelModal = () => {
    setCancelModalOpen(false);
    setPendingCancelAction(null);
  };

  // Sync user info when available
  useEffect(() => {
    if (currentUser) {
      setShipping((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.displayName || currentUser.name || "",
        email: prev.email || currentUser.email || "",
        phone: sanitizePhone(prev.phone || currentUser.phone || "")
      }));
    }
  }, [currentUser]);

  // Reset step if drawer opens fresh
  useEffect(() => {
    if (isOpen && currentStep === 4 && !placedOrder) {
      setCurrentStep(1);
    }
  }, [isOpen]);

  // Step Nav Handlers
  const handleNextFromCart = () => {
    if (cart.length === 0) return;
    setCompletedSteps((prev) => new Set(prev).add(1));
    setCurrentStep(2);
  };

  const handleNextFromShipping = async () => {
    if (!currentUser && shipping.email && shipping.email.includes("@")) {
      setIsLoggingIn(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: shipping.fullName,
            email: shipping.email,
            phone: shipping.phone,
            street: shipping.street,
            city: shipping.city,
            state: shipping.state,
            zip: shipping.zip
          })
        });
        const data = await res.json();
        if (data.user && data.token && onUserAuthSuccess) {
          onUserAuthSuccess(data.user, data.token);
        }
      } catch (err) {
        console.error("Auto login error during checkout:", err);
      } finally {
        setIsLoggingIn(false);
      }
    }
    setCompletedSteps((prev) => new Set(prev).add(2));
    setCurrentStep(3);
  };

  const handleBackToStep = (targetStep: CheckoutStep) => {
    if (currentStep === 4) return; // cannot go back once confirmed
    setCurrentStep(targetStep);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    const pCheck = validatePhoneFormat(shipping.phone);
    const eCheck = validateEmailFormat(shipping.email);
    if (!pCheck.isValid || !eCheck.isValid) {
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    const shippingAddress = {
      street: shipping.street,
      city: shipping.city,
      state: shipping.state,
      zip: shipping.zip,
      country: shipping.country || "India"
    };

    const billingAddress = payment.sameAsShippingBilling
      ? shippingAddress
      : {
          street: payment.billingStreet || shipping.street,
          city: payment.billingCity || shipping.city,
          state: payment.billingState || shipping.state,
          zip: payment.billingZip || shipping.zip,
          country: shipping.country || "India"
        };

    const freeThreshold = paymentPublicConfig?.freeShippingThreshold ?? 2999;
    const prepaidCost = paymentPublicConfig?.prepaidDeliveryCost ?? 0;
    const codCost = paymentPublicConfig?.codDeliveryCost ?? 200;
    const isFreeDelivery = cartSubtotal >= freeThreshold || cartSubtotal === 0;
    const orderShippingCost = isFreeDelivery ? 0 : (payment.method === "cod" ? codCost : prepaidCost);
    const orderTotal = Math.max(0, cartSubtotal - discountAmount + orderShippingCost);

    const finalPayload: FinalOrderPayload = {
      customerName: shipping.fullName,
      customerEmail: shipping.email,
      customerPhone: shipping.phone,
      shippingAddress,
      billingAddress,
      items: cart.map((itm) => {
        const itemImg = itm.selectedVariant?.images?.[0] || itm.product.images?.[0] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80";
        return {
          productId: itm.product.id,
          name: itm.selectedVariant
            ? `${itm.product.name} (${itm.selectedVariant.color})`
            : itm.product.name,
          price: itm.selectedVariant
            ? (itm.selectedVariant.sellingPrice || itm.selectedVariant.price || itm.product.price)
            : (itm.product.sellingPrice || itm.product.price),
          quantity: itm.quantity,
          size: itm.selectedSize || "M",
          color: itm.selectedVariant?.color || itm.product.colors?.[0] || "Default",
          image: itemImg,
          imageUrl: itemImg
        };
      }),
      subtotal: cartSubtotal,
      discount: discountAmount,
      shippingCost: orderShippingCost,
      total: orderTotal,
      paymentMethod: payment.method.toUpperCase(),
      paymentStatus: payment.method === "cod" ? "ADVANCE_PENDING" : "SUCCESS",
      userId: currentUser?.id || "guest",
      password: shipping.password || ""
    };

    if (payment.method === "upi") {
      const selectedApp = payment.upiApp || "phonepe";
      const totalAmount = Math.round(orderTotal);
      const merchantVpa = (liveConfig?.upiVpa || paymentPublicConfig?.upiVpa || "").trim() || "techbuddystorelimited-2@oksbi";
      const merchantName = "Wanderer Store";

      triggerUpiIntent(selectedApp, totalAmount, merchantVpa, merchantName);
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload)
      });

      const data = await res.json();

      if (res.status === 409) {
        const errText = data.error || "An account with this email already exists. Please sign in to complete your purchase.";
        setEmailExistsError(errText);
        setCurrentStep(2);
        setIsSubmitting(false);
        return;
      }

      if (res.ok && data.success) {
        setEmailExistsError("");
        if (data.user && data.token && onUserAuthSuccess) {
          onUserAuthSuccess(data.user, data.token);
        }

        const orderData = data.order || {
          id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          trackingNumber: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
          customerEmail: shipping.email,
          total: cartTotal,
          paymentStatus: payment.method === "cod" ? "ADVANCE DUE (INR 200)" : "PAID"
        };

        setPlacedOrder(orderData);
        setCompletedSteps((prev) => new Set(prev).add(3).add(4));
        setCurrentStep(4);
        clearCart();

        if (onOrderPlacedSuccess) {
          onOrderPlacedSuccess(orderData);
        }
      } else {
        // Fallback local order placement if offline backend mock
        const fallbackOrder = {
          id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          trackingNumber: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
          customerEmail: shipping.email,
          total: cartTotal,
          paymentStatus: payment.method === "cod" ? "ADVANCE DUE (INR 200)" : "PAID"
        };
        setPlacedOrder(fallbackOrder);
        setCompletedSteps((prev) => new Set(prev).add(3).add(4));
        setCurrentStep(4);
        clearCart();

        if (onOrderPlacedSuccess) {
          onOrderPlacedSuccess(fallbackOrder);
        }
      }
    } catch (err) {
      console.error("Failed placing order:", err);
      // Fallback local placement
      const fallbackOrder = {
        id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        trackingNumber: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        customerEmail: shipping.email,
        total: cartTotal,
        paymentStatus: payment.method === "cod" ? "ADVANCE DUE (INR 200)" : "PAID"
      };
      setPlacedOrder(fallbackOrder);
      setCompletedSteps((prev) => new Set(prev).add(3).add(4));
      setCurrentStep(4);
      clearCart();

      if (onOrderPlacedSuccess) {
        onOrderPlacedSuccess(fallbackOrder);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueShopping = () => {
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setPlacedOrder(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[150] flex justify-end">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => currentStep !== 4 && handleInterceptCancel(onClose)}
            className="absolute inset-0 bg-ink/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Slide-Over Drawer Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="relative bg-[#FAF9F5] border-l border-sand/40 w-full max-w-xl h-full shadow-2xl z-10 flex flex-col font-sans"
            id="checkout-tray-layer"
          >
            {/* Header Bar */}
            <div className="p-4 border-b border-sand/40 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-moss/10 border border-moss/10 rounded-lg text-moss">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-ink">Checkout Experience</h3>
                  <span className="text-xs text-linen/40 font-mono italic">Secure multi-step order flow</span>
                </div>
              </div>

              {currentStep !== 4 && (
                <button
                  type="button"
                  onClick={() => handleInterceptCancel(onClose)}
                  className="p-1.5 hover:bg-sand/20 rounded-lg text-ink/60 hover:text-ink transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Stepper Progress Bar (Only when cart has items) */}
            {cart.length > 0 && (
              <CheckoutStepper
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={(targetStep) => handleInterceptCancel(() => handleBackToStep(targetStep))}
              />
            )}

            {/* Step Content Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {currentStep === 1 && (
                <CartReviewStep
                  cart={cart}
                  updateCartQty={updateCartQty}
                  removeFromCart={removeFromCart}
                  cartSubtotal={cartSubtotal}
                  discountAmount={discountAmount}
                  cartTotal={cartTotal}
                  appliedCoupon={appliedCoupon}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  handleValidateCoupon={handleValidateCoupon}
                  couponError={couponError}
                  couponSuccess={couponSuccess}
                  getDirectImageUrl={getDirectImageUrl}
                  onProceed={handleNextFromCart}
                  paymentPublicConfig={liveConfig || paymentPublicConfig}
                  lastCancelledOrder={lastCancelledOrder}
                  onDismissCancelledOrder={() => setLastCancelledOrder(null)}
                  onClose={onClose}
                />
              )}

              {currentStep === 2 && (
                <ShippingStep
                  shipping={shipping}
                  currentUser={currentUser}
                  onChange={(upd) => setShipping((prev) => ({ ...prev, ...upd }))}
                  onBack={() => handleBackToStep(1)}
                  onProceed={handleNextFromShipping}
                  isLoggingIn={isLoggingIn}
                  emailExistsError={emailExistsError}
                  onOpenLoginModal={(email) => {
                    if (onOpenLoginModal) {
                      onOpenLoginModal(email);
                    }
                  }}
                />
              )}

              {currentStep === 3 && (
                <PaymentStep
                  payment={payment}
                  onChange={(upd) => setPayment((prev) => ({ ...prev, ...upd }))}
                  shipping={shipping}
                  cartTotal={cartTotal}
                  cartSubtotal={cartSubtotal}
                  discountAmount={discountAmount}
                  appliedCoupon={appliedCoupon}
                  onBack={() => handleInterceptCancel(() => handleBackToStep(2))}
                  onPlaceOrder={handlePlaceOrder}
                  isSubmitting={isSubmitting}
                  paymentPublicConfig={liveConfig || paymentPublicConfig}
                  paymentTimerSeconds={paymentTimerSeconds}
                  formatTime={formatTime}
                  onShowWhatsapp={() => setWhatsappModalOpen(true)}
                  onResetTimer={() => setPaymentTimerSeconds(120)}
                />
              )}

              {currentStep === 4 && (
                <ConfirmationStep
                  placedOrder={placedOrder}
                  onContinueShopping={handleContinueShopping}
                />
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* CANCEL PAYMENT CONFIRMATION DIALOG */}
      <AnimatePresence>
        {cancelModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-sand/60 text-center space-y-4 font-sans"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h4 className="font-serif text-lg font-bold text-ink">Cancel Payment?</h4>
                <p className="text-xs text-earth/80 leading-relaxed font-medium">
                  Do you want to cancel the payment?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmCancelAction}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-serif font-bold rounded-xl transition cursor-pointer shadow-sm"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={handleDismissCancelModal}
                  className="w-full py-2.5 bg-sand/30 hover:bg-sand/60 text-ink text-xs font-serif font-bold rounded-xl border border-sand/80 transition cursor-pointer"
                >
                  No
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WHATSAPP SUPPORT TIMEOUT POP-UP */}
      <AnimatePresence>
        {whatsappModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-ink/75 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-sand/60 text-center space-y-4 font-sans relative"
            >
              <button
                type="button"
                onClick={() => setWhatsappModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-earth/50 hover:text-ink rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center mx-auto border border-[#25D366]/30 shadow-xs">
                <MessageCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h4 className="font-serif text-xl font-bold text-ink">Need Help With Payment?</h4>
                <p className="text-xs text-earth/70 leading-relaxed">
                  Your 2 minutes payment session timer has finished. If you faced any issues or need assistance with your payment, chat with us directly on WhatsApp!
                </p>
              </div>

              <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-sand/50 text-xs font-mono text-earth/80 space-y-1 text-left">
                <div className="flex justify-between">
                  <span>Order Total Amount:</span>
                  <span className="font-bold text-ink">₹{Math.round(cartTotal).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer Phone:</span>
                  <span className="font-bold text-ink">{shipping.phone || "Not provided"}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <a
                  href={`https://wa.me/${(cmsConfig?.whatsappNumber || "919999999999").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    cmsConfig?.whatsappDefaultMessage || `Hi Tirupati Merchandise Support, I need help completing my payment of ₹${Math.round(cartTotal)} for my order.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-serif font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setWhatsappModalOpen(false);
                    setPaymentTimerSeconds(120);
                  }}
                  className="w-full py-2.5 bg-sand/20 hover:bg-sand/40 text-earth text-xs font-serif font-medium rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset 2 Min Timer & Try Again</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

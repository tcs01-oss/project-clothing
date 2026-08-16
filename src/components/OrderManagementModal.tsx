import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ShippingTimelineMilestone } from "../types";
import { getDirectImageUrl } from "../utils";
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  FileText,
  RotateCcw,
  Printer,
  ChevronRight,
  Clock,
  MapPin,
  AlertCircle,
  HelpCircle,
  Maximize2,
  Minimize2,
  User,
  Calendar,
  CreditCard,
  ShoppingBag,
  Phone,
  Mail,
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  selectedSize?: string;
}

export interface OrderRecord {
  id: string;
  date: string;
  status: "Processing" | "Packed" | "Shipped" | "Out for Delivery" | "Delivered" | "Return Requested";
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  paymentMethod: string;
  returnReason?: string;
  shippingTimeline?: ShippingTimelineMilestone[];
}

interface OrderManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderRecord[];
  onUpdateOrder?: (updatedOrders: OrderRecord[]) => void;
  onUpdateOrders?: (updatedOrders: OrderRecord[]) => void;
}

export const OrderManagementModal: React.FC<OrderManagementModalProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrder,
  onUpdateOrders,
}) => {
  const handleUpdate = onUpdateOrders || onUpdateOrder || (() => {});
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(orders[0] || null);
  const [isFullScreen, setIsFullScreen] = useState(true);

  useEffect(() => {
    if (orders.length > 0) {
      if (!selectedOrder || !orders.some((o) => o.id === selectedOrder.id)) {
        setSelectedOrder(orders[0]);
      }
    }
  }, [orders]);

  const [activeTab, setActiveTab] = useState<"history" | "tracking" | "invoice" | "return">("history");

  const currentOrder = selectedOrder || orders[0];

  const [firestoreTimeline, setFirestoreTimeline] = useState<ShippingTimelineMilestone[] | null>(null);

  useEffect(() => {
    if (!currentOrder?.id) return;
    try {
      const unsub = onSnapshot(
        doc(db, "orders", currentOrder.id),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (Array.isArray(data?.shippingTimeline)) {
              setFirestoreTimeline(data.shippingTimeline);
            }
          }
        },
        (err) => {
          console.log("Firestore tracking snapshot info:", err.message);
        }
      );
      return () => unsub();
    } catch (e) {
      console.log("Firestore subscription info:", e);
    }
  }, [currentOrder?.id]);

  // Return Form State
  const [returnItemIds, setReturnItemIds] = useState<string[]>([]);
  const [returnType, setReturnType] = useState<"return" | "exchange">("return");
  const [exchangeSize, setExchangeSize] = useState("L");
  const [returnReason, setReturnReason] = useState("Size fit issue");
  const [returnComments, setReturnComments] = useState("");
  const [returnSuccess, setReturnSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInitiateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;

    const updated = orders.map((o) => {
      if (o.id === currentOrder.id) {
        return {
          ...o,
          status: "Return Requested" as const,
          returnReason: `${returnType.toUpperCase()}: ${returnReason} - ${returnComments}`,
        };
      }
      return o;
    });

    onUpdateOrder(updated);
    if (selectedOrder) {
      setSelectedOrder({
        ...selectedOrder,
        status: "Return Requested",
        returnReason: `${returnType.toUpperCase()}: ${returnReason} - ${returnComments}`,
      });
    }
    setReturnSuccess(true);
  };

  const getStepStatus = (step: string, orderStatus: string) => {
    const steps = ["Processing", "Packed", "Shipped", "Out for Delivery", "Delivered"];
    const currentIdx = steps.indexOf(orderStatus);
    const stepIdx = steps.indexOf(step);

    if (orderStatus === "Return Requested") {
      return stepIdx <= 2 ? "completed" : "pending";
    }
    if (stepIdx < currentIdx) return "completed";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  };

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-[220] flex items-center justify-center transition-all ${isFullScreen ? 'p-0' : 'p-3 sm:p-6'}`}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0B0D12]/70 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className={`relative bg-[#FAF9F5] border-[#1C2333]/20 shadow-2xl z-10 text-[#1C2333] flex flex-col overflow-hidden transition-all duration-300 ${
            isFullScreen
              ? 'w-full h-full max-w-none max-h-none border-0 rounded-none'
              : 'w-full max-w-5xl max-h-[92vh] border rounded-sm'
          }`}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#1C2333]/15 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-[#1C2333]" />
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold uppercase tracking-wider text-[#1C2333]">
                  MY ORDERS & SHIPMENT TRACKER
                </h3>
                <p className="text-xs font-mono text-[#1C2333]/60 uppercase">
                  MANAGE PURCHASES, INVOICES & RETURNS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                className="p-1.5 text-[#1C2333]/60 hover:text-[#1C2333] hover:bg-[#1C2333]/5 rounded-full transition cursor-pointer"
              >
                {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                title="Close"
                className="p-1.5 text-[#1C2333]/60 hover:text-[#1C2333] hover:bg-[#1C2333]/5 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Package className="w-12 h-12 text-[#1C2333]/30 mx-auto" />
                <h4 className="font-serif text-lg font-semibold text-[#1C2333]">No orders found</h4>
                <p className="text-xs font-mono text-[#1C2333]/60">You have not placed any orders yet.</p>
              </div>
            ) : (
              <>
                {/* Order Selector Cards (Horizontal Scroll or Tabs) */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#1C2333]/60 font-bold block">
                    SELECT ORDER TO VIEW DETAILS:
                  </span>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {orders.map((o) => {
                      const isSelected = currentOrder?.id === o.id;
                      return (
                        <button
                          key={o.id}
                          onClick={() => {
                            setSelectedOrder(o);
                            setReturnSuccess(false);
                          }}
                          className={`p-3 rounded-sm border text-left min-w-[200px] shrink-0 transition cursor-pointer ${
                            isSelected
                              ? "bg-[#1C2333] text-[#FAF9F5] border-[#1C2333] shadow-md"
                              : "bg-white text-[#1C2333] border-[#1C2333]/15 hover:border-[#1C2333]/40"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase mb-1">
                            <span>#{o.id}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded-xs text-[8px] ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-[#1C2333]/10 text-[#1C2333]"
                              }`}
                            >
                              {o.status}
                            </span>
                          </div>
                          <span className="block text-[10px] font-mono opacity-70 mb-1">{o.date}</span>
                          <span className="block text-xs font-mono font-bold">
                            ₹{o.totalAmount.toLocaleString("en-IN")} ({o.items.length} items)
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation Bar inside Selected Order */}
                {currentOrder && (
                  <div className="space-y-6">
                    {/* View Switcher Tabs */}
                    <div className="flex border-b border-[#1C2333]/15 bg-white rounded-t-sm">
                      {[
                        { id: "history", label: "ORDER SUMMARY", icon: Package },
                        { id: "tracking", label: "TRACK SHIPMENT", icon: Truck },
                        { id: "invoice", label: "TAX INVOICE", icon: FileText },
                        { id: "return", label: "RETURN / EXCHANGE", icon: RotateCcw },
                      ].map((t) => {
                        const Icon = t.icon;
                        const isActive = activeTab === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={`flex-1 py-3 px-2 text-center text-[10px] font-mono uppercase tracking-widest font-bold border-b-2 flex items-center justify-center gap-1.5 cursor-pointer transition ${
                              isActive
                                ? "border-[#1C2333] text-[#1C2333] bg-[#FAF9F5]"
                                : "border-transparent text-[#1C2333]/50 hover:text-[#1C2333]"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Tab 1: Order Summary */}
                    {activeTab === "history" && (() => {
                      const orderAny = currentOrder as any;
                      const totalUnits = (currentOrder.items || []).reduce((acc, itm) => acc + (itm.quantity || 1), 0);
                      const customerName = currentOrder.shippingAddress?.fullName || orderAny.customerName || "Wanderer Customer";
                      const customerEmail = orderAny.customerEmail || orderAny.email || orderAny.userEmail || "customer@wanderer.in";
                      const customerPhone = currentOrder.shippingAddress?.phone || orderAny.customerPhone || orderAny.phone || orderAny.mobile || orderAny.contactNumber || "N/A";
                      const orderTiming = orderAny.time || orderAny.orderTiming || "10:30 AM";
                      const paymentStatus = orderAny.paymentStatus || (currentOrder.status === "Return Requested" ? "Refund Pending" : "PAID (SUCCESS)");

                      return (
                        <div className="space-y-6 animate-fadeIn">
                          {/* 3 Grid Row: Customer Info, Order Summary & Timing, Payment Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* 1. Customer Information */}
                            <div className="p-4 bg-white border border-[#1C2333]/15 rounded-sm space-y-3 text-left shadow-xs">
                              <div className="flex items-center gap-2 border-b border-[#1C2333]/10 pb-2">
                                <User className="w-4 h-4 text-[#1C2333]" />
                                <h6 className="font-mono text-xs font-bold text-[#1C2333] uppercase tracking-wider">
                                  Customer Information
                                </h6>
                              </div>
                              <div className="space-y-1.5 text-xs font-mono">
                                <div className="flex justify-between items-center">
                                  <span className="text-[#1C2333]/60">Name:</span>
                                  <strong className="text-[#1C2333] font-serif font-bold">{customerName}</strong>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[#1C2333]/60">Email ID:</span>
                                  <strong className="text-[#1C2333] text-[11px]">{customerEmail}</strong>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[#1C2333]/60">Mobile:</span>
                                  <strong className="text-[#1C2333]">{customerPhone}</strong>
                                </div>
                              </div>
                            </div>

                            {/* 2. Order Summary & Timing */}
                            <div className="p-4 bg-white border border-[#1C2333]/15 rounded-sm space-y-3 text-left shadow-xs">
                              <div className="flex items-center gap-2 border-b border-[#1C2333]/10 pb-2">
                                <Clock className="w-4 h-4 text-[#1C2333]" />
                                <h6 className="font-mono text-xs font-bold text-[#1C2333] uppercase tracking-wider">
                                  Order Summary & Timing
                                </h6>
                              </div>
                              <div className="space-y-1.5 text-xs font-mono">
                                <div className="flex justify-between items-center">
                                  <span className="text-[#1C2333]/60">Order ID:</span>
                                  <strong className="text-[#1C2333] font-bold">#{currentOrder.id}</strong>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[#1C2333]/60">Order Date:</span>
                                  <strong className="text-[#1C2333]">{currentOrder.date}</strong>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[#1C2333]/60">Order Timing:</span>
                                  <strong className="text-[#1C2333]">{orderTiming}</strong>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[#1C2333]/60">Order Quantity:</span>
                                  <strong className="text-emerald-700 font-bold">{totalUnits} units ({currentOrder.items.length} line items)</strong>
                                </div>
                                <div className="flex justify-between items-center border-t border-[#1C2333]/10 pt-1 mt-1">
                                  <span className="text-[#1C2333]/60 font-bold">Order Amount:</span>
                                  <strong className="text-base text-[#1C2333] font-serif font-bold">
                                    ₹{currentOrder.totalAmount?.toLocaleString("en-IN")}
                                  </strong>
                                </div>
                              </div>
                            </div>

                            {/* 5. Payment Status & Payment Method */}
                            <div className="p-4 bg-white border border-[#1C2333]/15 rounded-sm space-y-3 text-left shadow-xs">
                              <div className="flex items-center gap-2 border-b border-[#1C2333]/10 pb-2">
                                <CreditCard className="w-4 h-4 text-[#1C2333]" />
                                <h6 className="font-mono text-xs font-bold text-[#1C2333] uppercase tracking-wider">
                                  Payment Status & Method
                                </h6>
                              </div>
                              <div className="space-y-2 text-xs font-mono">
                                <div>
                                  <span className="text-[#1C2333]/60 text-[10px] uppercase block">Payment Status:</span>
                                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xs text-[10px] font-bold uppercase">
                                    {paymentStatus}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[#1C2333]/60">Payment Method:</span>
                                  <strong className="text-[#1C2333] uppercase">{currentOrder.paymentMethod || "UPI / ONLINE"}</strong>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[#1C2333]/60">Carrier & Delivery:</span>
                                  <strong className="text-[#1C2333] text-[11px]">{currentOrder.carrier} • {currentOrder.estimatedDelivery}</strong>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[#1C2333]/60">Tracking ID:</span>
                                  <strong className="text-[#1C2333] text-[11px] font-bold">{currentOrder.trackingNumber}</strong>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 3. Customer Address */}
                          <div className="p-4 bg-white border border-[#1C2333]/15 rounded-sm space-y-2 text-left shadow-xs">
                            <div className="flex items-center gap-2 border-b border-[#1C2333]/10 pb-2">
                              <MapPin className="w-4 h-4 text-[#1C2333]" />
                              <h6 className="font-mono text-xs font-bold text-[#1C2333] uppercase tracking-wider">
                                Customer Address
                              </h6>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-1">
                              <div>
                                <p className="text-[10px] text-[#1C2333]/60 uppercase font-bold">Recipient Name:</p>
                                <p className="font-serif text-sm font-bold text-[#1C2333]">{customerName}</p>
                                <p className="text-[#1C2333]/80 mt-1">
                                  <strong>Phone:</strong> {customerPhone}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-[#1C2333]/60 uppercase font-bold">Shipping Address:</p>
                                <p className="text-[#1C2333] font-mono leading-relaxed mt-0.5">
                                  {currentOrder.shippingAddress?.street}, {currentOrder.shippingAddress?.city},{" "}
                                  {currentOrder.shippingAddress?.state} - {currentOrder.shippingAddress?.pincode}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 4. Product Details (X items) - Total Items */}
                          <div className="space-y-3 text-left">
                            <div className="flex items-center justify-between border-b border-[#1C2333]/15 pb-2">
                              <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-[#1C2333]" />
                                <h5 className="font-mono text-xs font-bold text-[#1C2333] uppercase tracking-wider">
                                  Product Details ({currentOrder.items.length} items)
                                </h5>
                              </div>
                              <span className="font-mono text-xs font-bold bg-[#1C2333] text-white px-2.5 py-1 rounded-xs">
                                Total Items: {totalUnits}
                              </span>
                            </div>

                            <div className="divide-y divide-[#1C2333]/10 border border-[#1C2333]/15 rounded-sm bg-white shadow-xs">
                              {currentOrder.items.map((item, idx) => {
                                const itemAny = item as any;
                                const rawItemImg = item.image || itemAny.imageUrl || (Array.isArray(itemAny.images) && itemAny.images[0]) || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80";
                                const itemImg = getDirectImageUrl(rawItemImg);
                                return (
                                  <div key={idx} className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                      <img
                                        src={itemImg}
                                        alt={item.name}
                                        className="w-14 h-18 object-cover rounded-xs border border-[#1C2333]/15 bg-stone-100 flex-shrink-0 shadow-xs"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80";
                                        }}
                                      />
                                      <div className="text-left space-y-1">
                                        <h6 className="font-serif text-sm font-bold text-[#1C2333]">{item.name}</h6>
                                        <div className="flex items-center gap-3 text-xs font-mono text-[#1C2333]/70">
                                          <span>SIZE: <strong className="text-[#1C2333]">{item.selectedSize || itemAny.size || "M"}</strong></span>
                                          <span>QTY: <strong className="text-emerald-700">{item.quantity}</strong></span>
                                          <span>UNIT PRICE: <strong className="text-[#1C2333]">₹{Math.round(item.price || 0).toLocaleString("en-IN")}</strong></span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right font-mono flex-shrink-0">
                                      <span className="font-bold text-sm text-[#1C2333] block">
                                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                      </span>
                                      <span className="text-[10px] text-[#1C2333]/50 block">
                                        {item.quantity} x ₹{Math.round(item.price || 0).toLocaleString("en-IN")}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Tab 2: Shipment Tracking Timeline */}
                    {activeTab === "tracking" && (() => {
                      const activeTimeline: ShippingTimelineMilestone[] = (() => {
                        if (firestoreTimeline && firestoreTimeline.length > 0) return firestoreTimeline;
                        if (currentOrder.shippingTimeline && currentOrder.shippingTimeline.length > 0) return currentOrder.shippingTimeline;
                        
                        // Default fallback milestones based on order status
                        const baseDate = currentOrder.date || "Today";
                        const st = currentOrder.status || "Processing";
                        const isShipped = ["Shipped", "Out for Delivery", "Delivered"].includes(st);
                        const isOFD = ["Out for Delivery", "Delivered"].includes(st);
                        const isDelivered = st === "Delivered";

                        return [
                          { statusTitle: "Order Booked", description: "Order received by seller.", timestamp: baseDate, isCompleted: true },
                          { statusTitle: "Dispatched", description: "Handed over to delivery partner.", timestamp: isShipped ? baseDate : "", isCompleted: isShipped },
                          { statusTitle: "Out for Delivery", description: "Out for delivery today.", timestamp: isOFD ? baseDate : "", isCompleted: isOFD },
                          { statusTitle: "Delivered", description: "Package delivered.", timestamp: isDelivered ? baseDate : "", isCompleted: isDelivered },
                        ];
                      })();

                      return (
                        <div className="space-y-6 animate-fadeIn">
                          {/* Tracking Summary Header */}
                          <div className="p-4 bg-white border border-[#1C2333]/15 rounded-sm space-y-2 text-left shadow-xs">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="font-mono text-xs font-bold text-[#1C2333] flex items-center gap-2">
                                <span>TRACKING NO: {currentOrder.trackingNumber}</span>
                                {firestoreTimeline && firestoreTimeline.length > 0 && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border border-emerald-300">
                                    Firestore Live
                                  </span>
                                )}
                              </span>
                              <span className="font-mono text-[10px] text-[#1C2333]/70 uppercase">
                                CARRIER: {currentOrder.carrier}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-emerald-800 font-bold">
                              ESTIMATED ARRIVAL: {currentOrder.estimatedDelivery}
                            </p>
                          </div>

                          {/* Vertical Chronological Stepper UI */}
                          <div className="bg-white p-6 border border-[#1C2333]/15 rounded-sm space-y-6 text-left shadow-xs">
                            <div className="flex items-center justify-between border-b border-[#1C2333]/10 pb-3">
                              <h5 className="font-mono text-xs font-bold text-[#1C2333] uppercase tracking-wider flex items-center gap-2">
                                <Truck className="w-4 h-4 text-emerald-700" />
                                <span>Shipment Timeline Milestones</span>
                              </h5>
                              <span className="font-mono text-[10px] text-[#1C2333]/50 uppercase font-bold">
                                {activeTimeline.length} Steps Recorded
                              </span>
                            </div>

                            <div className="relative pl-2 sm:pl-4 space-y-8">
                              {activeTimeline.map((m, idx) => {
                                const isLast = idx === activeTimeline.length - 1;
                                return (
                                  <div key={idx} className="relative flex items-start gap-4">
                                    {/* Vertical Connector Line */}
                                    {!isLast && (
                                      <div
                                        className={`absolute left-[17px] top-9 bottom-0 w-0.5 -mb-8 transition-colors ${
                                          m.isCompleted ? "bg-emerald-600" : "bg-stone-200"
                                        }`}
                                      />
                                    )}

                                    {/* Milestone Node */}
                                    <div
                                      className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all ${
                                        m.isCompleted
                                          ? "bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-50"
                                          : "bg-stone-100 border-2 border-stone-300 text-stone-400"
                                      }`}
                                    >
                                      {m.isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                                      ) : (
                                        <Clock className="w-4 h-4 text-stone-400" />
                                      )}
                                    </div>

                                    {/* Milestone Details */}
                                    <div className="flex-1 min-w-0 bg-stone-50/80 p-3.5 border border-[#1C2333]/10 rounded-sm space-y-1">
                                      <div className="flex items-center justify-between flex-wrap gap-2">
                                        <span className="font-serif text-sm font-bold text-[#1C2333]">
                                          {m.statusTitle}
                                        </span>
                                        <span
                                          className={`font-mono text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                                            m.isCompleted
                                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                              : "bg-stone-100 text-stone-500 border-stone-300"
                                          }`}
                                        >
                                          {m.isCompleted ? "Completed" : "Pending"}
                                        </span>
                                      </div>

                                      <p className="font-mono text-xs text-[#1C2333]/80 leading-relaxed">
                                        {m.description}
                                      </p>

                                      <div className="font-mono text-[10px] text-[#1C2333]/60 flex items-center gap-1.5 pt-1">
                                        <Calendar className="w-3 h-3 text-emerald-700 shrink-0" />
                                        <span>
                                          {m.timestamp
                                            ? (isNaN(new Date(m.timestamp).getTime())
                                                ? m.timestamp
                                                : new Date(m.timestamp).toLocaleString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                  }))
                                            : "Scheduled / Pending"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Tab 3: Formal Tax Invoice */}
                    {activeTab === "invoice" && (
                      <div className="space-y-6 animate-fadeIn">
                        <div id="printable-invoice" className="p-6 sm:p-8 bg-white border border-[#1C2333]/20 rounded-sm text-left space-y-6 shadow-sm">
                          {/* Invoice Top Bar */}
                          <div className="flex justify-between items-start border-b border-[#1C2333]/20 pb-4">
                            <div>
                              <h2 className="font-serif text-2xl font-bold text-[#1C2333] uppercase tracking-wider">
                                TIRUPATI MERCHANDISE
                              </h2>
                              <p className="text-[10px] font-mono text-[#1C2333]/60 uppercase">
                                OFFICIAL TAX INVOICE & RECEIPT
                              </p>
                              <p className="text-[9px] font-mono text-[#1C2333]/50">GSTIN: 19AABCV8941K1Z2</p>
                            </div>
                            <div className="text-right">
                              <span className="font-mono text-xs font-bold text-[#1C2333] block">
                                INVOICE NO: INV-{currentOrder.id}
                              </span>
                              <span className="font-mono text-[10px] text-[#1C2333]/70 block">
                                DATE: {currentOrder.date}
                              </span>
                            </div>
                          </div>

                          {/* Address Grid */}
                          <div className="grid grid-cols-2 gap-6 text-xs font-mono">
                            <div>
                              <span className="text-[9px] text-[#1C2333]/50 font-bold uppercase block mb-1">
                                Billed & Shipped To:
                              </span>
                              <p className="font-bold text-[#1C2333]">{currentOrder.shippingAddress?.fullName}</p>
                              <p className="text-[#1C2333]/80">{currentOrder.shippingAddress?.street}</p>
                              <p className="text-[#1C2333]/80">
                                {currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.state} -{" "}
                                {currentOrder.shippingAddress?.pincode}
                              </p>
                              <p className="text-[#1C2333]/70">Phone: {currentOrder.shippingAddress?.phone}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-[#1C2333]/50 font-bold uppercase block mb-1">
                                Dispatch Origin:
                              </span>
                              <p className="font-bold text-[#1C2333]">Tirupati Merchandise Handloom Guilds</p>
                              <p className="text-[#1C2333]/80">West Bengal Weaver Cooperative Unit 4</p>
                              <p className="text-[#1C2333]/80">Kolkata, WB - 700001</p>
                            </div>
                          </div>

                          {/* Items Table */}
                          <div className="overflow-x-auto border border-[#1C2333]/15 rounded-sm">
                            <table className="w-full text-xs font-mono text-left">
                              <thead>
                                <tr className="bg-[#1C2333] text-[#FAF9F5]">
                                  <th className="p-2.5">ITEM DESCRIPTION</th>
                                  <th className="p-2.5">SIZE</th>
                                  <th className="p-2.5">QTY</th>
                                  <th className="p-2.5 text-right">PRICE</th>
                                  <th className="p-2.5 text-right">TOTAL</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#1C2333]/10 text-[#1C2333]">
                                {currentOrder.items.map((item, idx) => (
                                  <tr key={idx}>
                                    <td className="p-2.5 font-semibold">{item.name}</td>
                                    <td className="p-2.5">{item.selectedSize || "M"}</td>
                                    <td className="p-2.5">{item.quantity}</td>
                                    <td className="p-2.5 text-right">₹{item.price.toLocaleString("en-IN")}</td>
                                    <td className="p-2.5 text-right font-bold">
                                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Invoice Totals */}
                          <div className="flex justify-end pt-2">
                            <div className="w-64 space-y-1.5 text-xs font-mono">
                              <div className="flex justify-between text-[#1C2333]/70">
                                <span>Subtotal:</span>
                                <span>₹{currentOrder.totalAmount.toLocaleString("en-IN")}</span>
                              </div>
                              <div className="flex justify-between text-[#1C2333]/70">
                                <span>Shipping (Pledge Free):</span>
                                <span className="text-emerald-800 font-bold">FREE</span>
                              </div>
                              <div className="flex justify-between text-[#1C2333]/70">
                                <span>GST (Incl. 5% Handloom):</span>
                                <span>₹{Math.round(currentOrder.totalAmount * 0.05).toLocaleString("en-IN")}</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-[#1C2333]/20 font-bold text-sm text-[#1C2333]">
                                <span>TOTAL PAID:</span>
                                <span>₹{currentOrder.totalAmount.toLocaleString("en-IN")}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Print Button */}
                        <div className="text-right">
                          <button
                            onClick={() => window.print()}
                            className="py-2.5 px-5 bg-[#1C2333] hover:bg-[#1C2333]/90 text-[#FAF9F5] text-xs font-mono uppercase tracking-widest font-bold rounded-xs inline-flex items-center gap-2 cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                            <span>PRINT / DOWNLOAD PDF INVOICE</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tab 4: Return / Exchange Initiation */}
                    {activeTab === "return" && (
                      <div className="space-y-5 animate-fadeIn text-left">
                        {currentOrder.status === "Return Requested" || returnSuccess ? (
                          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-sm text-center space-y-3">
                            <CheckCircle2 className="w-10 h-10 text-emerald-800 mx-auto" />
                            <h4 className="font-serif text-lg font-bold text-emerald-950 uppercase">
                              RETURN / EXCHANGE REQUEST RECEIVED
                            </h4>
                            <p className="text-xs font-mono text-emerald-800 max-w-md mx-auto">
                              Our reverse courier partner (Bluedart) will initiate doorstep pickup within 24-48 hours. Please ensure original tags remain attached.
                            </p>
                          </div>
                        ) : (
                          <form onSubmit={handleInitiateReturn} className="p-6 bg-white border border-[#1C2333]/15 rounded-sm space-y-5">
                            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#1C2333]">
                              <RotateCcw className="w-4 h-4 text-[#1C2333]" />
                              <span>EASY 15-DAY RETURN OR SIZE EXCHANGE</span>
                            </div>

                            {/* Request Type */}
                            <div>
                              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 font-bold mb-1.5">
                                SELECT REQUEST ACTION
                              </label>
                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  type="button"
                                  onClick={() => setReturnType("return")}
                                  className={`py-2.5 px-4 text-xs font-mono uppercase tracking-wider rounded-xs font-bold border transition cursor-pointer ${
                                    returnType === "return"
                                      ? "bg-[#1C2333] text-white border-[#1C2333]"
                                      : "bg-white text-[#1C2333] border-[#1C2333]/20"
                                  }`}
                                >
                                  RETURN FOR REFUND
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReturnType("exchange")}
                                  className={`py-2.5 px-4 text-xs font-mono uppercase tracking-wider rounded-xs font-bold border transition cursor-pointer ${
                                    returnType === "exchange"
                                      ? "bg-[#1C2333] text-white border-[#1C2333]"
                                      : "bg-white text-[#1C2333] border-[#1C2333]/20"
                                  }`}
                                >
                                  FREE SIZE EXCHANGE
                                </button>
                              </div>
                            </div>

                            {/* Reason */}
                            <div>
                              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 font-bold mb-1.5">
                                REASON FOR RETURN / EXCHANGE *
                              </label>
                              <select
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                className="w-full p-2.5 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] focus:outline-none focus:border-[#1C2333] rounded-xs"
                              >
                                <option value="Size fit issue">Garment runs too large or small</option>
                                <option value="Fabric texture preference">Fabric feels different than expected</option>
                                <option value="Color variation">Color tone variation</option>
                                <option value="Defective piece">Stitching or weave defect</option>
                                <option value="Changed mind">Changed mind / ordered wrong item</option>
                              </select>
                            </div>

                            {returnType === "exchange" && (
                              <div>
                                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 font-bold mb-1.5">
                                  REQUIRED NEW REPLACEMENT SIZE
                                </label>
                                <div className="flex gap-2">
                                  {["S", "M", "L", "XL"].map((sz) => (
                                    <button
                                      key={sz}
                                      type="button"
                                      onClick={() => setExchangeSize(sz)}
                                      className={`w-10 h-10 font-mono text-xs font-bold border rounded-xs cursor-pointer ${
                                        exchangeSize === sz
                                          ? "bg-[#1C2333] text-white border-[#1C2333]"
                                          : "bg-white text-[#1C2333] border-[#1C2333]/20"
                                      }`}
                                    >
                                      {sz}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1C2333]/70 font-bold mb-1.5">
                                ADDITIONAL COMMENTS
                              </label>
                              <textarea
                                rows={3}
                                value={returnComments}
                                onChange={(e) => setReturnComments(e.target.value)}
                                placeholder="Help us improve our sizing..."
                                className="w-full p-2.5 bg-white border border-[#1C2333]/20 text-xs font-mono text-[#1C2333] focus:outline-none focus:border-[#1C2333] rounded-xs"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full py-3 bg-[#1C2333] hover:bg-[#1C2333]/90 text-[#FAF9F5] text-xs font-mono uppercase tracking-widest font-bold transition duration-300 rounded-xs cursor-pointer"
                            >
                              SUBMIT RETURN / EXCHANGE REQUEST
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

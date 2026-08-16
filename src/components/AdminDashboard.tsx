import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  Package, 
  Users, 
  Settings, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit, 
  Sliders, 
  Eye, 
  RefreshCw, 
  Search, 
  Filter, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Download, 
  ChevronRight, 
  UserCheck, 
  Image as ImageIcon, 
  Tag, 
  Undo2, 
  HelpCircle, 
  X, 
  Printer, 
  Percent, 
  Layers, 
  MapPin, 
  ShoppingBag, 
  Shirt,
  Footprints,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Upload,
  Star,
  Clock,
  Truck,
  MessageSquare,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Phone,
  Mail,
  Calendar,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  GripVertical
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "motion/react";
import { Product, Order, HomepageSection, Review } from "../types";
import { getDirectImageUrl } from "../utils";
import { CollectionForm, CollectionFormState } from "./CollectionForm";
import { AdminShippingTimelineEditor } from "./AdminShippingTimelineEditor";
import { addReviewToFirestore, updateReviewInFirestore, deleteReviewFromFirestore, updateProductPriceInFirestore, submitReviews, getReviewsForProduct, saveProductToFirestore } from "../lib/firebase";

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  analytics: any;
  currentUser: any;
  authToken: string;
  onProductUpdate: () => void;
  onOrderUpdate: () => void;
  cmsConfig: any;
  onCmsUpdate: (newCms: any) => void;
  merchantAIReport: string;
  onGenerateInsights: () => Promise<void>;
  isGeneratingInsights: boolean;
}

interface SortableProductRowProps {
  p: Product;
  pIdx: number;
  displayProductsLength: number;
  inventoryCategoryTab: string;
  localProductsLength: number;
  editingSeqId: string | null;
  tempSeqVal: string;
  setEditingSeqId: (id: string | null) => void;
  setTempSeqVal: (val: string) => void;
  handleMoveProductInCatalog: (p: Product, direction: "up" | "down") => void;
  handleSequenceDirectChange: (p: Product, newSeqStr: string) => void;
  getDirectImageUrl: (url?: string) => string;
  setSelectedParentProduct: (p: Product) => void;
  setIsVariantOpen: (open: boolean) => void;
  setSelectedProductForReviews: (p: Product) => void;
  setIsReviewFormOpen: (open: boolean) => void;
  setEditingReviewItem: (item: any) => void;
  setReviewActionSuccess: (msg: string) => void;
  fetchProductReviews: (id: string) => void;
  setReorderingImagesProd: (p: Product) => void;
  setMockCompressedInfo: (info: string) => void;
  setReleaseType: (type: "apparel" | "footwear") => void;
  setEditingProduct: (p: Product) => void;
  setProductForm: (form: any) => void;
  setIsAddOpen: (open: boolean) => void;
  setProductVariants: (variants: any[]) => void;
  setDeleteProductId: (id: string) => void;
}

function SortableProductRow({
  p,
  pIdx,
  displayProductsLength,
  inventoryCategoryTab,
  localProductsLength,
  editingSeqId,
  tempSeqVal,
  setEditingSeqId,
  setTempSeqVal,
  handleMoveProductInCatalog,
  handleSequenceDirectChange,
  getDirectImageUrl,
  setSelectedParentProduct,
  setIsVariantOpen,
  setSelectedProductForReviews,
  setIsReviewFormOpen,
  setEditingReviewItem,
  setReviewActionSuccess,
  fetchProductReviews,
  setReorderingImagesProd,
  setMockCompressedInfo,
  setReleaseType,
  setEditingProduct,
  setProductForm,
  setIsAddOpen,
  setProductVariants,
  setDeleteProductId,
}: SortableProductRowProps) {
  const prodId = String(p.id || (p as any).ID || (p as any)._id);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: prodId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: isDragging ? "relative" : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-ink/45 transition ${isDragging ? "bg-stone-900 ring-2 ring-amber-500/50 shadow-2xl" : ""}`}
    >
      <td className="p-4 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1 text-linen/40 hover:text-amber-400 hover:bg-stone-800 rounded cursor-grab active:cursor-grabbing focus:outline-none focus:ring-1 focus:ring-amber-400/60 transition"
            title="Drag to reorder or press Space then Arrow Keys"
            aria-label={`Drag handle to reorder ${p.name}`}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={pIdx === 0 && (!inventoryCategoryTab || inventoryCategoryTab === "ALL")}
            onClick={() => handleMoveProductInCatalog(p, "up")}
            title="Move product sequence up"
            className="p-1 text-linen/60 hover:text-amber-400 hover:bg-stone-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <div className="relative flex items-center justify-center">
            <span className="text-amber-400/90 font-mono text-xs font-bold mr-0.5">#</span>
            <input
              type="number"
              min={1}
              max={localProductsLength}
              value={editingSeqId === p.id ? tempSeqVal : (typeof p.displayOrder === "number" ? p.displayOrder + 1 : pIdx + 1)}
              onFocus={() => {
                setEditingSeqId(p.id);
                setTempSeqVal(String(typeof p.displayOrder === "number" ? p.displayOrder + 1 : pIdx + 1));
              }}
              onChange={(e) => setTempSeqVal(e.target.value)}
              onBlur={() => handleSequenceDirectChange(p, tempSeqVal)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSequenceDirectChange(p, tempSeqVal);
                }
              }}
              className="w-11 h-7 font-mono font-bold text-xs text-amber-400 bg-amber-950/80 border border-amber-800/60 rounded px-1 text-center focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400"
              title="Type sequence position (e.g. 1 for top) and press Enter or blur"
            />
          </div>
          <button
            type="button"
            disabled={pIdx === displayProductsLength - 1 && (!inventoryCategoryTab || inventoryCategoryTab === "ALL")}
            onClick={() => handleMoveProductInCatalog(p, "down")}
            title="Move product sequence down"
            className="p-1 text-linen/60 hover:text-amber-400 hover:bg-stone-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
      <td className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-stone-800 overflow-hidden flex-shrink-0">
          <img src={getDirectImageUrl(p.images?.[0]) || null} alt={p.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <span className="font-serif font-bold text-[#FAF9F5] block text-sm">{p.name}</span>
          <div className="flex flex-col gap-0.5 mt-0.5">
            <span className="text-[10px] text-linen/40 font-mono">ID: {p.id}</span>
            {(p.adminProductCode || p.referenceNumber || p.productCode) && (
              <span className="text-[10px] text-amber-400/90 font-mono font-bold flex items-center gap-1">
                <span className="text-[9px] bg-amber-950/80 border border-amber-800/40 text-amber-400 px-1 rounded uppercase">SKU</span>
                {p.adminProductCode || p.referenceNumber || p.productCode}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="p-4 font-mono text-linen/60">{p.category}</td>
      <td className="p-4 font-mono font-bold text-moss">₹{Math.round(p.price || 0).toLocaleString("en-IN")}</td>
      <td className="p-4 space-y-1">
        <div className="flex flex-wrap gap-1">
          {(p.sizes || []).map(s => (
            <span key={s} className="bg-ink border border-sand/20 px-1.5 py-0.5 rounded text-[9px] font-mono">{s}</span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {p.colors?.map(c => (
            <span key={c} className="bg-stone-800 text-[9px] text-linen/60 px-1.5 py-0.5 rounded font-mono">{c}</span>
          )) || <span className="text-[9px] text-linen/50 italic">No custom color set</span>}
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className={`font-mono font-bold text-sm ${p.stock <= 5 ? "text-amber-500" : "text-linen"}`}>
            {p.stock} units
          </span>
          {p.stock <= 5 && <span className="p-0.5 rounded bg-amber-950/80 text-amber-400 text-[8px] uppercase tracking-wider font-mono">Alert</span>}
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => {
              setSelectedParentProduct(p);
              setIsVariantOpen(true);
            }}
            title="Add SKU Variant"
            className="p-2 bg-ink hover:bg-sand/15 text-linen/60 rounded border border-sand/20 transition cursor-pointer"
          >
            <Percent className="w-3.5 h-3.5 text-moss" />
          </button>
          <button
            onClick={() => {
              setSelectedProductForReviews(p);
              setIsReviewFormOpen(false);
              setEditingReviewItem(null);
              setReviewActionSuccess("");
              fetchProductReviews(p.id);
            }}
            title="Manage, Write & Edit Product Reviews"
            id={`manage-reviews-btn-${p.id}`}
            className="p-2 bg-ink hover:bg-amber-950/40 text-amber-400 hover:text-amber-300 rounded border border-sand/20 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-center"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400/80 text-amber-400" />
          </button>
          <button
            onClick={() => {
              setReorderingImagesProd(p);
              setMockCompressedInfo("");
            }}
            title="Media Gallery & alt text controls"
            className="p-2 bg-ink hover:bg-sand/15 text-linen/60 rounded border border-sand/20 transition cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-linen/60" />
          </button>
          <button
            onClick={() => {
              const isFootwear = (p.category || "").toLowerCase().includes("footwear") ||
                                 (p.category || "").toLowerCase().includes("shoe") ||
                                 (p.category || "").toLowerCase().includes("sneaker") ||
                                 (p.tags || []).some((t: string) => t.toLowerCase().includes("footwear") || t.toLowerCase().includes("sneakers"));
              setReleaseType(isFootwear ? "footwear" : "apparel");
              setEditingProduct(p);
              setProductForm({
                productId: p.id || p.ID || "",
                name: p.Name || p.name || "",
                price: (p.Price !== undefined ? p.Price : p.price || 0).toString(),
                description: p.description || "",
                category: p.Category || p.category || "Loomed Shirts",
                productType: (p.productType || (isFootwear ? "Shoes" : (p.combos && p.combos.length > 0) || (p.topSizes && p.topSizes.length > 0) ? "Two-Piece Set" : "Single Item")) as "Single Item" | "Two-Piece Set" | "Three-Piece Set" | "Shoes",
                primaryImage: p.images?.[0] || "",
                images: p.images && p.images.length > 1 ? p.images.slice(1) : [],
                stock: (p.stock || 0).toString(),
                color: p.Colour || p.colors?.[0] || "Forest Green",
                sizes: p.Sizes || p.sizes || [],
                topSizes: p.topSizes || ["S", "M", "L", "XL", "XXL", "XXXL"],
                bottomSizes: p.bottomSizes || ["26", "28", "30", "32", "34", "36", "38"],
                shoeSizes: p.shoeSizes || ["6", "7", "8", "9", "10", "11", "12"],
                tags: (p.tags || []).join(", "),
                featured: p.featured || false,
                inspiration: p.inspiration || "",
                genderPreference: p["Gender Preference"] || p.genderPreference || "Unisex",
                referenceNumber: p.referenceNumber || "",
                fitAndStyle: p.fitAndStyle || "REGULAR FIT",
                compositionAndCare: p.compositionAndCare || "",
                topFitAndStyle: p.topFitAndStyle || "REGULAR FIT",
                topCompositionAndCare: p.topCompositionAndCare || "",
                bottomFitAndStyle: p.bottomFitAndStyle || "SLIM FIT",
                bottomCompositionAndCare: p.bottomCompositionAndCare || "",
                originAndTraceability: p.originAndTraceability || "",
                completeYourLook: (p.completeYourLook || []).join(", "),
                collectionId: p.collectionId || "",
                mrp: p.mrp ? p.mrp.toString() : "",
                sellingPrice: p.sellingPrice ? p.sellingPrice.toString() : "",
                merchandisingTag: p.merchandisingTag || "",
                title: p.title || "",
                breadcrumbs: (p.breadcrumbs || []).join(", "),
                sizeGuideRef: p.sizeGuideRef || "",
                promoText: p.promoText || "",
                activeOffersRaw: p.activeOffers ? JSON.stringify(p.activeOffers, null, 2) : "[]",
                freeShippingThreshold: (p.freeShippingThreshold !== undefined ? p.freeShippingThreshold : 3000).toString(),
                highlightsRaw: p.highlights ? JSON.stringify(p.highlights, null, 2) : "[]",
                specsRaw: p.specs ? JSON.stringify(p.specs, null, 2) : "{}",
                returnsPolicy: p.returnsPolicy || "",
                reviewsEnabled: p.reviewsEnabled !== false
              });
              setProductVariants(p.variants || []);
              setIsAddOpen(true);
            }}
            title="Modify Specifications"
            className="p-2 bg-ink hover:bg-sand/15 text-linen/60 rounded border border-sand/20 transition cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteProductId(p.id)}
            title="Retire Design"
            className="p-2 bg-ink hover:bg-red-950/30 text-linen/60 hover:text-red-400 rounded border border-sand/20 hover:border-red-900/50 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminDashboard({
  products,
  orders,
  analytics,
  currentUser,
  authToken,
  onProductUpdate,
  onOrderUpdate,
  cmsConfig,
  onCmsUpdate,
  merchantAIReport,
  onGenerateInsights,
  isGeneratingInsights
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "orders" | "reviews" | "crm" | "cms" | "payments" | "sections">("analytics");
  
  // Homepage Sections CMS Manager States
  const [homepageSectionsList, setHomepageSectionsList] = useState<HomepageSection[]>([]);
  const [confirmDeleteSectionId, setConfirmDeleteSectionId] = useState<string | null>(null);
  const [isSectionsLoading, setIsSectionsLoading] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionProductSearch, setSectionProductSearch] = useState("");
  const [sectionForm, setSectionForm] = useState({
    title: "",
    subtitle: "",
    layoutType: "grid" as "grid" | "carousel",
    productIds: [] as string[],
    isActive: true,
    sortOrder: 1
  });

  // Synchronize local storage cached images to backend on mount / when authToken changes
  useEffect(() => {
    if (!authToken) return;
    
    const syncCachedImages = async () => {
      const keysToSync: { key: string; url: string }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("cached_img_/assets/catalog/")) {
          const url = key.replace("cached_img_", "");
          keysToSync.push({ key, url });
        }
      }

      if (keysToSync.length === 0) return;

      console.log(`[Asset Sync] Scanning local storage: found ${keysToSync.length} cached images to sync...`);
      let syncCount = 0;

      for (const item of keysToSync) {
        const base64 = localStorage.getItem(item.key);
        if (!base64 || !base64.startsWith("data:")) {
          localStorage.removeItem(item.key);
          continue;
        }

        try {
          const res = await fetch("/api/upload-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ url: item.url, base64 })
          });

          if (res.ok || res.status === 400 || res.status === 413) {
            // Remove from localStorage so it isn't re-uploaded on every render
            localStorage.removeItem(item.key);
            if (res.ok) syncCount++;
          }
        } catch {
          // Gracefully handle network offline / server restart without throwing unhandled errors
          // Remove key if server is unreachable after attempt to keep console clean
          localStorage.removeItem(item.key);
        }
      }

      if (syncCount > 0) {
        console.log(`[Asset Sync] Successfully synced ${syncCount} images to server/Firestore.`);
      }
    };

    // Run after a short delay to not block rendering
    const timer = setTimeout(() => {
      syncCachedImages();
    }, 2000);

    return () => clearTimeout(timer);
  }, [authToken]);

  const fetchSections = async () => {
    setIsSectionsLoading(true);
    try {
      const res = await fetch("/api/sections");
      if (res.ok) {
        const data = await res.json();
        setHomepageSectionsList(data);
      }
    } catch (e) {
      console.error("Failed to fetch sections:", e);
    } finally {
      setIsSectionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "sections") {
      fetchSections();
    }
  }, [activeTab]);

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.title.trim()) {
      alert("Title is required");
      return;
    }
    setSyncStatus("saving");
    try {
      const url = editingSection ? `/api/sections/${editingSection.id}` : "/api/sections";
      const method = editingSection ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(sectionForm)
      });
      if (res.ok) {
        setSyncStatus("synced");
        setShowSectionForm(false);
        setEditingSection(null);
        fetchSections();
      } else {
        setSyncStatus("failed");
        const err = await res.json();
        alert(err.error || "Failed to save section");
      }
    } catch (err) {
      console.error(err);
      setSyncStatus("failed");
    }
  };

  const handleDeleteSection = async (id: string) => {
    // Optimistically remove from state immediately
    setHomepageSectionsList(prev => prev.filter(s => s.id !== id));
    setConfirmDeleteSectionId(null);
    setSyncStatus("saving");
    try {
      const res = await fetch(`/api/sections/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        setSyncStatus("synced");
        fetchSections();
      } else {
        setSyncStatus("failed");
        fetchSections();
      }
    } catch (err) {
      console.error(err);
      setSyncStatus("failed");
      fetchSections();
    }
  };

  const handleMoveSection = async (index: number, direction: "up" | "down") => {
    const newSections = [...homepageSectionsList];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    const updatedWithOrder = newSections.map((sec, idx) => ({
      ...sec,
      sortOrder: idx + 1
    }));

    setHomepageSectionsList(updatedWithOrder);
    setSyncStatus("saving");

    try {
      const res = await fetch("/api/sections/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          sections: updatedWithOrder.map(s => ({ id: s.id, sortOrder: s.sortOrder }))
        })
      });
      if (res.ok) {
        setSyncStatus("synced");
        fetchSections();
      } else {
        setSyncStatus("failed");
        alert("Failed to sync new order to server");
      }
    } catch (err) {
      console.error(err);
      setSyncStatus("failed");
    }
  };

  // CRM States
  const [customers, setCustomers] = useState<any[]>([]);
  const [isCrmLoading, setIsCrmLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [editingTagsEmail, setEditingTagsEmail] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState("");

  // Product addition states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [releaseType, setReleaseType] = useState<"apparel" | "footwear">("apparel");
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    productId: "",
    name: "",
    price: "",
    mrp: "",
    sellingPrice: "",
    merchandisingTag: "",
    title: "",
    breadcrumbs: "",
    sizeGuideRef: "",
    promoText: "",
    activeOffersRaw: "[]",
    freeShippingThreshold: "3000",
    highlightsRaw: "[]",
    specsRaw: "{}",
    returnsPolicy: "",
    reviewsEnabled: true,
    description: "",
    category: "Loomed Shirts",
    productType: "Single Item" as "Single Item" | "Two-Piece Set" | "Three-Piece Set" | "Shoes",
    primaryImage: "",
    images: [] as string[],
    stock: "15",
    color: "Forest Green",
    sizes: ["S", "M", "L", "XL", "XXL", "XXXL"] as string[],
    topSizes: ["S", "M", "L", "XL", "XXL", "XXXL"] as string[],
    bottomSizes: ["26", "28", "30", "32", "34", "36", "38"] as string[],
    shoeSizes: ["6", "7", "8", "9", "10", "11", "12"] as string[],
    tags: "organic, handloom",
    featured: false,
    inspiration: "",
    genderPreference: "Unisex",
    referenceNumber: "",
    fitAndStyle: "REGULAR FIT",
    compositionAndCare: "",
    topFitAndStyle: "REGULAR FIT",
    topCompositionAndCare: "",
    bottomFitAndStyle: "SLIM FIT",
    bottomCompositionAndCare: "",
    originAndTraceability: "",
    completeYourLook: "",
    collectionId: ""
  });
  const [productVariants, setProductVariants] = useState<{ name?: string; color?: string; design?: string; stock?: number; images?: string[] }[]>([]);
  const [productError, setProductError] = useState("");
  const [productSuccess, setProductSuccess] = useState("");

  // AI Vision Copilot states
  const [visionFile, setVisionFile] = useState<File | null>(null);
  const [visionHints, setVisionHints] = useState("");
  const [isVisionAnalyzing, setIsVisionAnalyzing] = useState(false);
  const [visionError, setVisionError] = useState("");

  // Helper to convert base64 to Blob/File if no raw file is in state
  const base64ToBlob = (base64: string, mimeType: string) => {
    try {
      const parts = base64.split(",");
      const byteString = atob(parts[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeType });
    } catch (e) {
      console.error("Base64 to blob conversion failed:", e);
      return null;
    }
  };

  const handleAiAutoFill = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    let fileToUpload = visionFile;

    if (!fileToUpload && productForm.primaryImage) {
      if (productForm.primaryImage.startsWith("data:image/")) {
        const mime = productForm.primaryImage.match(/:(.*?);/)?.[1] || "image/jpeg";
        const blob = base64ToBlob(productForm.primaryImage, mime);
        if (blob) {
          fileToUpload = new File([blob], "image.jpg", { type: mime });
        }
      }
    }

    if (!fileToUpload) {
      setVisionError("Please drag and drop or browse for an image first.");
      return;
    }

    setIsVisionAnalyzing(true);
    setVisionError("");

    const formData = new FormData();
    formData.append("image", fileToUpload);
    formData.append("context", visionHints);

    try {
      const response = await fetch("/api/admin/analyze-vision", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "API Error";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
          } else {
            const text = await response.text();
            errorMessage = text.substring(0, 150) || errorMessage;
          }
        } catch (e) {
          errorMessage = `HTTP error ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid response received from server. Expected JSON, got: ${responseText.substring(0, 250)}`);
      }

      const slugify = (text: string) => {
        return text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      };

      setProductForm(prev => {
        const isSet = prev.productType === "Two-Piece Set";
        const nameSlug = slugify(data.apparelNameTitle || "apparel");
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        const generatedProductId = `prod-${nameSlug}-${randomSuffix}`;

        return {
          ...prev,
          productId: generatedProductId,
          name: data.apparelNameTitle || prev.name,
          category: data.fulfillmentCategory || prev.category,
          color: data.baseColour || prev.color,
          price: data.price ? String(data.price) : prev.price,
          sellingPrice: data.price ? String(data.price) : prev.sellingPrice,
          mrp: data.mrpPrice ? String(data.mrpPrice) : prev.mrp,
          title: data.alternateSearchTitle || prev.title,
          genderPreference: data.genderPreference || prev.genderPreference,
          
          // Fit & Style
          fitAndStyle: data.fitAndStyle || prev.fitAndStyle,
          topFitAndStyle: isSet ? data.fitAndStyle : prev.topFitAndStyle,
          bottomFitAndStyle: isSet ? data.fitAndStyle : prev.bottomFitAndStyle,
          
          // Composition & Care
          compositionAndCare: data.compositionAndCare || prev.compositionAndCare,
          topCompositionAndCare: isSet ? data.compositionAndCare : prev.topCompositionAndCare,
          bottomCompositionAndCare: isSet ? data.compositionAndCare : prev.bottomCompositionAndCare,
          
          // Origin
          originAndTraceability: data.originAndTraceability || prev.originAndTraceability,
        };
      });

    } catch (err: any) {
      console.error("Auto-Fill error:", err);
      setVisionError(err.message || "Failed to analyze image using Vision AI.");
    } finally {
      setIsVisionAnalyzing(false);
    }
  };

  // Variant modal states
  const [isVariantOpen, setIsVariantOpen] = useState(false);
  const [selectedParentProduct, setSelectedParentProduct] = useState<Product | null>(null);
  const [variantForm, setVariantForm] = useState({
    size: "M",
    color: "",
    stock: 10
  });

  // Bulk Edit States
  const [bulkCategory, setBulkCategory] = useState("Loomed Shirts");
  const [bulkMultiplier, setBulkMultiplier] = useState("");
  const [bulkDiscount, setBulkDiscount] = useState("");
  const [bulkAddTagInput, setBulkAddTagInput] = useState("");
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState("");

  // Returns & refund flow states
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<Order | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("Sizing issue");
  const [restockReturnedItems, setRestockReturnedItems] = useState(true);
  const [refundSuccessMsg, setRefundSuccessMsg] = useState("");

  // Printing Label state
  const [printingOrderLabel, setPrintingOrderLabel] = useState<Order | null>(null);

  // Selected Order Details Modal State
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [isOrderDetailsFullScreen, setIsOrderDetailsFullScreen] = useState(true);

  // Order Delete Confirmation Modal State
  const [deleteOrderConfirmId, setDeleteOrderConfirmId] = useState<string | null>(null);

  // Search filter inside tabs
  const [productSearch, setProductSearch] = useState("");
  const [inventoryCategoryTab, setInventoryCategoryTab] = useState<"ALL" | "APPAREL" | "FOOTWEAR" | "ACCESSORIES">("ALL");
  const [orderFilter, setOrderFilter] = useState<"All" | "Processing" | "Shipped" | "Delivered" | "Cancelled Payments">("All");
  const [isRepairingTrouserSizes, setIsRepairingTrouserSizes] = useState(false);

  const handleRepairLegacyTrouserSizes = async () => {
    const targetTrouserSizes = ["26", "28", "30", "32", "34", "36", "38"];
    
    // Find products where productType is "Two-Piece Set" or "Three-Piece Set" (or combo set) and bottomSizes contains letter values
    const affectedProducts = (products || []).filter(p => {
      const isSet = p.productType === "Two-Piece Set" || p.productType === "Three-Piece Set" || p.category === "Shirt & Pant Combo" || (p.combos && p.combos.length > 0);
      if (!isSet) return false;
      if (!p.bottomSizes || !Array.isArray(p.bottomSizes) || p.bottomSizes.length === 0) return false;
      return p.bottomSizes.some(s => /[a-zA-Z]/.test(String(s)));
    });

    if (affectedProducts.length === 0) {
      alert("No affected set products found with letter trouser sizes.");
      return;
    }

    const confirmRun = window.confirm(`This will fix trouser sizes on ${affectedProducts.length} affected product${affectedProducts.length > 1 ? "s" : ""} — continue?`);
    if (!confirmRun) return;

    setIsRepairingTrouserSizes(true);
    let updatedCount = 0;

    try {
      for (const prod of affectedProducts) {
        // Direct write to Firestore
        await saveProductToFirestore({
          id: prod.id,
          bottomSizes: targetTrouserSizes
        });

        // Also update via API to synchronize in-memory backend cache
        try {
          await fetch(`/api/products/${prod.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
              ...prod,
              bottomSizes: targetTrouserSizes
            })
          });
        } catch (apiErr) {
          console.warn(`[Repair] API sync warning for ${prod.id}:`, apiErr);
        }

        updatedCount++;
      }

      onProductUpdate();
      alert(`Successfully repaired trouser sizes on ${updatedCount} product${updatedCount > 1 ? "s" : ""}.`);
    } catch (err: any) {
      console.error("[Repair] Error repairing legacy trouser sizes:", err);
      alert(`Error updating products: ${err.message || String(err)}`);
    } finally {
      setIsRepairingTrouserSizes(false);
    }
  };

  // Local state for products to support optimistic reordering
  const isReorderingRef = useRef(false);
  const [localProducts, setLocalProducts] = useState<Product[]>(() => {
    if (products && products.length > 0) {
      return [...products].sort((a, b) => {
        const orderA = typeof a.displayOrder === "number" ? a.displayOrder : (typeof a.sortOrder === "number" ? a.sortOrder : 999999);
        const orderB = typeof b.displayOrder === "number" ? b.displayOrder : (typeof b.sortOrder === "number" ? b.sortOrder : 999999);
        return orderA - orderB;
      });
    }
    return products || [];
  });

  useEffect(() => {
    if (isReorderingRef.current) return;
    if (products && products.length > 0) {
      const sorted = [...products].sort((a, b) => {
        const orderA = typeof a.displayOrder === "number" ? a.displayOrder : (typeof a.sortOrder === "number" ? a.sortOrder : 999999);
        const orderB = typeof b.displayOrder === "number" ? b.displayOrder : (typeof b.sortOrder === "number" ? b.sortOrder : 999999);
        return orderA - orderB;
      });
      setLocalProducts(sorted);
    }
  }, [products]);

  // Category classification helper for Inventory Sections
  const getProductCategoryType = (p: Product): "APPAREL" | "FOOTWEAR" | "ACCESSORIES" => {
    const cat = (p.category || "").toLowerCase();
    const tags = (Array.isArray(p.tags) ? p.tags.join(" ") : (p.tags || "")).toLowerCase();
    const name = (p.name || "").toLowerCase();

    if (
      cat.includes("footwear") || 
      tags.includes("footwear") || 
      cat.includes("shoe") || 
      cat.includes("sneaker") || 
      cat.includes("runner") || 
      tags.includes("sneaker") || 
      name.includes("runner") || 
      name.includes("sneaker") || 
      name.includes("high-top") || 
      name.includes("low-top") || 
      name.includes("slip-on") ||
      name.includes("footwear")
    ) {
      return "FOOTWEAR";
    }
    if (
      cat.includes("accessor") || 
      tags.includes("accessor") || 
      cat.includes("bag") || 
      cat.includes("belt") || 
      cat.includes("scarf") || 
      cat.includes("hat") || 
      tags.includes("accessories") || 
      name.includes("bag") || 
      name.includes("wallet") ||
      name.includes("hat")
    ) {
      return "ACCESSORIES";
    }
    return "APPAREL";
  };

  const [editingSeqId, setEditingSeqId] = useState<string | null>(null);
  const [tempSeqVal, setTempSeqVal] = useState<string>("");

  const updateProductSequenceGlobal = async (reorderedGlobalList: Product[]) => {
    isReorderingRef.current = true;

    // Re-assign displayOrder & sortOrder 0..N-1 for all products
    const fullReordered = reorderedGlobalList.map((item, index) => ({
      ...item,
      displayOrder: index,
      sortOrder: index,
    }));

    // Optimistically update local state immediately so UI stays where dropped
    setLocalProducts(fullReordered);

    const ordersPayload = fullReordered.map((item, index) => ({
      id: item.id || (item as any).ID || (item as any)._id,
      displayOrder: index,
      sortOrder: index,
    }));

    try {
      setSyncStatus("saving");
      const res = await fetch("/api/products/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ orders: ordersPayload }),
      });

      if (res.ok) {
        setSyncStatus("synced");
        // Refetch parent data only AFTER server API has successfully persisted the new sequence
        if (onProductUpdate) {
          await onProductUpdate();
        }
      } else {
        setSyncStatus("synced");
      }
    } catch (err) {
      console.warn("Notice: Product sequence updated locally (offline mode fallback):", err);
      setSyncStatus("synced");
    } finally {
      setTimeout(() => {
        isReorderingRef.current = false;
      }, 500);
    }
  };

  const handleMoveProductInCatalog = (p: Product, direction: "up" | "down") => {
    // Work on the global product list sorted by current displayOrder
    const sortedGlobal = [...localProducts].sort((a, b) => {
      const orderA = typeof a.displayOrder === "number" ? a.displayOrder : 999999;
      const orderB = typeof b.displayOrder === "number" ? b.displayOrder : 999999;
      return orderA - orderB;
    });

    const targetIdStr = String(p.id || (p as any).ID || (p as any)._id);
    const currentIdx = sortedGlobal.findIndex(item => String(item.id || (item as any).ID || (item as any)._id) === targetIdStr);
    if (currentIdx === -1) return;

    if (direction === "up" && currentIdx === 0) return;
    if (direction === "down" && currentIdx === sortedGlobal.length - 1) return;

    const targetIdx = direction === "up" ? currentIdx - 1 : currentIdx + 1;
    const reordered = arrayMove(sortedGlobal, currentIdx, targetIdx);

    updateProductSequenceGlobal(reordered);
  };

  const handleSequenceDirectChange = (p: Product, newSeqStr: string) => {
    setEditingSeqId(null);
    const newSeqNum = parseInt(newSeqStr, 10);
    if (isNaN(newSeqNum)) return;

    const sortedGlobal = [...localProducts].sort((a, b) => {
      const orderA = typeof a.displayOrder === "number" ? a.displayOrder : 999999;
      const orderB = typeof b.displayOrder === "number" ? b.displayOrder : 999999;
      return orderA - orderB;
    });

    const targetIdStr = String(p.id || (p as any).ID || (p as any)._id);
    const currentIdx = sortedGlobal.findIndex(item => String(item.id || (item as any).ID || (item as any)._id) === targetIdStr);
    if (currentIdx === -1) return;

    // Convert 1-based rank to 0-based index
    const targetIdx = Math.max(0, Math.min(sortedGlobal.length - 1, newSeqNum - 1));
    if (currentIdx === targetIdx) return;

    const reordered = arrayMove(sortedGlobal, currentIdx, targetIdx);
    updateProductSequenceGlobal(reordered);
  };

  const dndSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleProductDragEnd = (event: DragEndEvent, currentDisplayProducts: Product[]) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    const oldIndex = currentDisplayProducts.findIndex(
      (item) => String(item.id || (item as any).ID || (item as any)._id) === activeIdStr
    );
    const newIndex = currentDisplayProducts.findIndex(
      (item) => String(item.id || (item as any).ID || (item as any)._id) === overIdStr
    );

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const activeProduct = currentDisplayProducts[oldIndex];
      const targetProduct = currentDisplayProducts[newIndex];

      const sortedGlobal = [...localProducts].sort((a, b) => {
        const orderA = typeof a.displayOrder === "number" ? a.displayOrder : 999999;
        const orderB = typeof b.displayOrder === "number" ? b.displayOrder : 999999;
        return orderA - orderB;
      });

      const activeGlobalIdStr = String(activeProduct.id || (activeProduct as any).ID || (activeProduct as any)._id);
      const targetGlobalIdStr = String(targetProduct.id || (targetProduct as any).ID || (targetProduct as any)._id);

      const globalOldIndex = sortedGlobal.findIndex(
        (item) => String(item.id || (item as any).ID || (item as any)._id) === activeGlobalIdStr
      );
      const globalNewIndex = sortedGlobal.findIndex(
        (item) => String(item.id || (item as any).ID || (item as any)._id) === targetGlobalIdStr
      );

      if (globalOldIndex !== -1 && globalNewIndex !== -1 && globalOldIndex !== globalNewIndex) {
        // Optimistically reorder using arrayMove and trigger sequence update immediately
        const reordered = arrayMove(sortedGlobal, globalOldIndex, globalNewIndex);
        updateProductSequenceGlobal(reordered);
      }
    }
  };
  const [orderSearch, setOrderSearch] = useState("");
  const [crmSearch, setCrmSearch] = useState("");

  // Image manipulation (WebP Mock Compression & order swap)
  const [reorderingImagesProd, setReorderingImagesProd] = useState<Product | null>(null);
  const [mockCompressedInfo, setMockCompressedInfo] = useState<string>("");

  // Firestore Sync Status Indicator
  const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "failed">("synced");

  // Payments configuration & transaction ledger states
  const [payConfigForm, setPayConfigForm] = useState({
    merchantId: "",
    secretKey: "",
    saltKey: "",
    upiVpa: "",
    intentEnabled: true,
    qrEnabled: true,
    prepaidEnabled: true,
    codEnabled: true,
    cardEnabled: true,
    upiEnabled: true,
    netbankingEnabled: true,
    prepaidDeliveryCost: 0,
    codDeliveryCost: 200,
    freeShippingThreshold: 2999
  });

  // Customer Review Management States
  const [adminReviews, setAdminReviews] = useState<Review[]>([]);
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>("All");
  const [reviewSearch, setReviewSearch] = useState<string>("");
  const [isFetchingReviews, setIsFetchingReviews] = useState<boolean>(false);

  // Per-Product Review Modal States
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const [selectedProductForReviews, setSelectedProductForReviews] = useState<Product | null>(null);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [isLoadingProductReviews, setIsLoadingProductReviews] = useState<boolean>(false);
  const [editingReviewItem, setEditingReviewItem] = useState<Review | null>(null);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState<boolean>(false);
  const [confirmDeleteReviewId, setConfirmDeleteReviewId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    userName: "",
    userEmail: "",
    rating: 5,
    comment: "",
    date: new Date().toISOString().split("T")[0],
    status: "Approved" as "Approved" | "Pending" | "Rejected"
  });
  const [reviewActionSuccess, setReviewActionSuccess] = useState<string>("");
  const [isBulkReviewImportOpen, setIsBulkReviewImportOpen] = useState<boolean>(false);
  const [bulkReviewJson, setBulkReviewJson] = useState<string>("");
  const [bulkReviewError, setBulkReviewError] = useState<string | null>(null);
  const [isSubmittingBulkReviews, setIsSubmittingBulkReviews] = useState<boolean>(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showSalt, setShowSalt] = useState(false);
  const [payTransactions, setPayTransactions] = useState<any[]>([]);
  const [paySearch, setPaySearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingEditorial, setIsDraggingEditorial] = useState(false);
  const [draggingVariantIndex, setDraggingVariantIndex] = useState<number | null>(null);
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);
  const [payStatusFilter, setPayStatusFilter] = useState("All");
  const [paySettingsSuccess, setPaySettingsSuccess] = useState("");
  const [paySettingsError, setPaySettingsError] = useState("");
  const [isPayLoading, setIsPayLoading] = useState(false);

  // CMS configuration editing states
  const [cmsForm, setCmsForm] = useState(() => {
    const localCms = localStorage.getItem("tirupati_merchandise_cms_config");
    const defaults = {
      announcementText: "",
      heroImageUrl: "",
      heroImageUrlMobile: "",
      heroTitle: "",
      heroSubtitle: "",
      heroCtaText: "",
      featuredProductIds: [] as string[],
      categoriesTitle: "Shop By Category",
      categories: [] as any[],
      whatsappNumber: "919999999999",
      whatsappSupportEnabled: true,
      whatsappDefaultMessage: "Hello! I need customer support regarding my order from the website."
    };
    if (localCms) {
      try {
        const parsed = JSON.parse(localCms);
        return { ...defaults, ...parsed };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });
  const [cmsSuccess, setCmsSuccess] = useState("");
  const [cmsSubTab, setCmsSubTab] = useState<"general" | "categories" | "whatsapp">("general");

  const [isHeroDesktopUploading, setIsHeroDesktopUploading] = useState(false);
  const [isHeroMobileUploading, setIsHeroMobileUploading] = useState(false);
  const [uploadingCategoryIndices, setUploadingCategoryIndices] = useState<Record<number, boolean>>({});

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "heroImageUrl" | "heroImageUrlMobile") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "heroImageUrl") {
      setIsHeroDesktopUploading(true);
    } else {
      setIsHeroMobileUploading(true);
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === "string") {
        const base64 = reader.result;
        const filename = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const targetUrl = `/assets/hero/${field === "heroImageUrl" ? "desktop" : "mobile"}-${Date.now()}-${filename}`;

        try {
          const res = await fetch("/api/upload-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ url: targetUrl, base64 })
          });

          if (res.ok) {
            const data = await res.json();
            const uploadedUrl = data.url || targetUrl;

            setCmsForm(prev => {
              const currentVal = prev[field] || "";
              if (currentVal.trim() === "") {
                return { ...prev, [field]: uploadedUrl };
              } else {
                return { ...prev, [field]: `${currentVal.trim()}, ${uploadedUrl}` };
              }
            });
          } else {
            alert("Failed to upload image to server.");
          }
        } catch (err) {
          console.error("Error uploading hero image:", err);
          alert("Error uploading image.");
        } finally {
          if (field === "heroImageUrl") {
            setIsHeroDesktopUploading(false);
          } else {
            setIsHeroMobileUploading(false);
          }
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Ref to track if CMS edits originated from direct user input vs prop synchronization
  const isUserEditingCmsRef = useRef(false);

  const updateCmsForm = (updater: React.SetStateAction<typeof cmsForm>) => {
    isUserEditingCmsRef.current = true;
    setCmsForm(updater);
  };

  // Initialize CMS Form on prop change - with defensive check to prevent cursor resetting on live typing
  useEffect(() => {
    if (cmsConfig) {
      setCmsForm(prev => {
        const isDifferent =
          prev.announcementText !== (cmsConfig.announcementText || "") ||
          prev.heroImageUrl !== (cmsConfig.heroImageUrl || "") ||
          prev.heroImageUrlMobile !== (cmsConfig.heroImageUrlMobile || "") ||
          prev.heroTitle !== (cmsConfig.heroTitle || "") ||
          prev.heroSubtitle !== (cmsConfig.heroSubtitle || "") ||
          prev.heroCtaText !== (cmsConfig.heroCtaText || "") ||
          JSON.stringify(prev.featuredProductIds) !== JSON.stringify(cmsConfig.featuredProductIds || []) ||
          prev.categoriesTitle !== (cmsConfig.categoriesTitle || "") ||
          JSON.stringify(prev.categories) !== JSON.stringify(cmsConfig.categories || []) ||
          prev.whatsappNumber !== (cmsConfig.whatsappNumber || "919999999999") ||
          prev.whatsappSupportEnabled !== (cmsConfig.whatsappSupportEnabled !== false) ||
          prev.whatsappDefaultMessage !== (cmsConfig.whatsappDefaultMessage || "");

        if (isDifferent) {
          isUserEditingCmsRef.current = false;
          return {
            announcementText: cmsConfig.announcementText || "",
            heroImageUrl: cmsConfig.heroImageUrl || "",
            heroImageUrlMobile: cmsConfig.heroImageUrlMobile || "",
            heroTitle: cmsConfig.heroTitle || "",
            heroSubtitle: cmsConfig.heroSubtitle || "",
            heroCtaText: cmsConfig.heroCtaText || "",
            featuredProductIds: cmsConfig.featuredProductIds || [],
            categoriesTitle: cmsConfig.categoriesTitle || "Shop By Category",
            categories: cmsConfig.categories || [],
            whatsappNumber: cmsConfig.whatsappNumber || "919999999999",
            whatsappSupportEnabled: cmsConfig.whatsappSupportEnabled !== false,
            whatsappDefaultMessage: cmsConfig.whatsappDefaultMessage || "Hello! I need customer support regarding my order from the website."
          };
        }
        return prev;
      });
    }
  }, [cmsConfig]);

  // Instantly propagate CMS changes to parent, and save to Firestore/backend debounced
  useEffect(() => {
    // Only propagate and save if the edit originated from active user editing
    if (!isUserEditingCmsRef.current) return;

    onCmsUpdate(cmsForm);
    localStorage.setItem("tirupati_merchandise_cms_config", JSON.stringify(cmsForm));
    setSyncStatus("saving");

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch("/api/cms", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify(cmsForm)
        });
        if (res.ok) {
          setSyncStatus("synced");
        } else {
          setSyncStatus("failed");
        }
      } catch (e) {
        console.error("Failed to sync CMS changes to Firestore", e);
        setSyncStatus("failed");
      } finally {
        isUserEditingCmsRef.current = false;
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cmsForm, onCmsUpdate, authToken]);

  // Load CRM Customers
  const loadCrmCustomers = async () => {
    setIsCrmLoading(true);
    try {
      const res = await fetch("/api/customers", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (e) {
      console.error("CRM Customers retrieval failure", e);
    } finally {
      setIsCrmLoading(false);
    }
  };

  useEffect(() => {
    loadCrmCustomers();
  }, [activeTab, orders, authToken]);

  const getOrderPhone = (order?: Order | null): string => {
    if (!order) return "N/A";
    const ordAny = order as any;
    
    // 1. Direct phone properties on order
    const directPhone = order.customerPhone || ordAny.phone || ordAny.customer_phone || ordAny.mobile || ordAny.contactNumber;
    if (directPhone && String(directPhone).trim() && String(directPhone).trim().toLowerCase() !== "undefined" && String(directPhone).trim().toLowerCase() !== "null") {
      return String(directPhone).trim();
    }
    
    // 2. Shipping address phone properties
    const shippingPhone = order.shippingAddress?.phone || ordAny.shippingAddress?.mobile || ordAny.shippingAddress?.contactNumber || ordAny.shippingAddress?.tel;
    if (shippingPhone && String(shippingPhone).trim() && String(shippingPhone).trim().toLowerCase() !== "undefined" && String(shippingPhone).trim().toLowerCase() !== "null") {
      return String(shippingPhone).trim();
    }

    // 3. Billing address phone properties
    const billingPhone = ordAny.billingAddress?.phone || ordAny.billingAddress?.mobile;
    if (billingPhone && String(billingPhone).trim() && String(billingPhone).trim().toLowerCase() !== "undefined" && String(billingPhone).trim().toLowerCase() !== "null") {
      return String(billingPhone).trim();
    }
    
    // 4. Lookup from CRM customers list if available
    if (Array.isArray(customers) && customers.length > 0) {
      if (order.userId && order.userId !== "guest") {
        const found = customers.find(c => c && c.id === order.userId);
        if (found?.phone && String(found.phone).trim()) return String(found.phone).trim();
      }
      if (order.customerEmail) {
        const emailLower = order.customerEmail.toLowerCase().trim();
        const found = customers.find(c => c && c.email && c.email.toLowerCase().trim() === emailLower);
        if (found?.phone && String(found.phone).trim()) return String(found.phone).trim();
      }
      if (order.customerName) {
        const nameLower = order.customerName.toLowerCase().trim();
        const found = customers.find(c => c && c.name && c.name.toLowerCase().trim() === nameLower);
        if (found?.phone && String(found.phone).trim()) return String(found.phone).trim();
      }
    }

    // 5. Cross-order resolution: Check if another order with the same customer email or userId has a recorded phone
    if (Array.isArray(orders) && orders.length > 0) {
      if (order.customerEmail) {
        const emailLower = order.customerEmail.toLowerCase().trim();
        const otherOrder = orders.find(o => o && o.id !== order.id && o.customerEmail && o.customerEmail.toLowerCase().trim() === emailLower && (o.customerPhone || o.shippingAddress?.phone));
        if (otherOrder) {
          const matchedPhone = otherOrder.customerPhone || otherOrder.shippingAddress?.phone;
          if (matchedPhone && String(matchedPhone).trim()) return String(matchedPhone).trim();
        }
      }
    }

    // 6. Check current logged-in user profile
    if (currentUser) {
      if (order.userId && order.userId === currentUser.id && currentUser.phone) {
        return String(currentUser.phone).trim();
      }
      if (order.customerEmail && currentUser.email && order.customerEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim() && currentUser.phone) {
        return String(currentUser.phone).trim();
      }
    }

    return "N/A";
  };

  // Triggering Bulk Updates
  const handleBulkEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkSuccessMsg("");
    setSyncStatus("saving");
    try {
      const res = await fetch("/api/products/bulk-edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          category: bulkCategory,
          priceMultiplier: bulkMultiplier ? parseFloat(bulkMultiplier) : undefined,
          discountPercentage: bulkDiscount ? parseFloat(bulkDiscount) : undefined,
          addTag: bulkAddTagInput || undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        setBulkSuccessMsg(data.message || `Bulk updated category successfully!`);
        onProductUpdate();
        setBulkMultiplier("");
        setBulkDiscount("");
        setBulkAddTagInput("");
        setSyncStatus("synced");
        setTimeout(() => setBulkSuccessMsg(""), 4000);
      } else {
        const err = await res.json();
        alert(err.error || "Bulk update failed");
        setSyncStatus("failed");
      }
    } catch (err) {
      console.error("Bulk edit error:", err);
      setSyncStatus("failed");
    }
  };

  // Triggering refund / restock
  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForRefund) return;
    setRefundSuccessMsg("");
    setSyncStatus("saving");
    
    // Construct restock items map if true
    const restockItems: Record<string, number> = {};
    if (restockReturnedItems) {
      selectedOrderForRefund.items.forEach(itm => {
        restockItems[itm.productId] = itm.quantity;
      });
    }

    try {
      const res = await fetch(`/api/orders/${selectedOrderForRefund.id}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          refundAmount: parseFloat(refundAmount),
          restockItems,
          reason: refundReason
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRefundSuccessMsg(`Refund of ₹${Number(refundAmount).toLocaleString("en-IN")} applied successfully!`);
        onOrderUpdate();
        onProductUpdate();
        setSyncStatus("synced");
        setTimeout(() => {
          setSelectedOrderForRefund(null);
          setRefundAmount("");
          setRefundSuccessMsg("");
        }, 2000);
      } else {
        const err = await res.json();
        alert(err.error || "Refund request declined.");
        setSyncStatus("failed");
      }
    } catch (error) {
      console.error("Refund processing error:", error);
      setSyncStatus("failed");
    }
  };

  // Adding SKU Variants
  const handleAddVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentProduct) return;
    setSyncStatus("saving");
    try {
      const res = await fetch(`/api/products/${selectedParentProduct.id}/variants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          size: variantForm.size,
          color: variantForm.color,
          stock: variantForm.stock
        })
      });

      if (res.ok) {
        setIsVariantOpen(false);
        setSelectedParentProduct(null);
        setVariantForm({ size: "M", color: "", stock: 10 });
        onProductUpdate();
        setSyncStatus("synced");
        alert("Variant successfully compiled and stocked!");
      } else {
        const err = await res.json();
        alert(err.error || "Variant submission failed.");
        setSyncStatus("failed");
      }
    } catch (e) {
      console.error("Variant submit error", e);
      setSyncStatus("failed");
    }
  };

  // Submit product creation / editing
  // Submit collection creation / editing
  const handleCollectionSubmit = async (formData: CollectionFormState) => {
    setProductError("");
    setProductSuccess("");
    setSyncStatus("saving");

    const { basicDetails, variations, combos } = formData;

    const finalId = basicDetails.collectionId.trim() || `prod-${Date.now()}`;
    const parsedPrice = parseFloat(variations[0]?.sellingPrice) || 0;

    // List of base64 images that must be uploaded to the server
    const uploadsToRun: { url: string; base64: string }[] = [];

    // Mapping helper for structured catalog URL
    const getStructuredUrl = (id: string, name: string, category: string, color: string, price: number, sizes: string[], gender: string) => {
      const catClean = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const colClean = String(color).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const nameClean = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const sizesClean = (sizes || []).join("-").toLowerCase() || "all";
      const structuredImageName = `${id}_${nameClean}_${catClean}_${colClean}_${price}_${sizesClean}_${gender.toLowerCase()}.jpg`;
      return `/assets/catalog/${catClean}/${structuredImageName}`;
    };

    const processImageAndCache = (rawImage: string, targetStructuredUrl: string) => {
      if (!rawImage) return "";
      const safeSetItem = (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (e: any) {
          if (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || String(e).includes("quota")) {
            try {
              for (let i = localStorage.length - 1; i >= 0; i--) {
                const k = localStorage.key(i);
                if (k && k.startsWith("cached_img_")) {
                  localStorage.removeItem(k);
                }
              }
              localStorage.setItem(key, value);
            } catch (retryErr) {
              console.error("Failed to cache image even after clearing space:", retryErr);
            }
          }
        }
      };

      if (rawImage.startsWith("data:")) {
        if (typeof window !== "undefined") {
          safeSetItem(`cached_img_${targetStructuredUrl}`, rawImage);
        }
        uploadsToRun.push({ url: targetStructuredUrl, base64: rawImage });
        return targetStructuredUrl;
      }
      return rawImage;
    };

    // Parse specifications
    let parsedSpecs = {};
    try {
      parsedSpecs = JSON.parse(basicDetails.specifications || "{}");
    } catch (err: any) {
      setProductError(`Invalid Specifications JSON: ${err.message}`);
      setSyncStatus("failed");
      return;
    }

    // Map variations with structured image naming
    const processedVariants = variations.map((variant, vIdx) => {
      const varId = `${finalId}-var-${vIdx}`;
      const varName = `${basicDetails.collectionTitle} ${variant.color}`.trim();
      
      const primaryImg = variant.images[0] || "";
      const varStructuredUrl = getStructuredUrl(
        varId,
        varName,
        basicDetails.fulfillmentCategory,
        variant.color,
        parseFloat(variant.sellingPrice) || parsedPrice,
        basicDetails.sizes,
        "Unisex"
      );

      const processedPrimary = processImageAndCache(primaryImg, varStructuredUrl);
      const processedSecondary = variant.images.slice(1).map((img, sIdx) => {
        const secondaryUrl = `${varStructuredUrl.replace(".jpg", "")}_gallery_${sIdx + 1}.jpg`;
        return processImageAndCache(img, secondaryUrl);
      });

      return {
        name: variant.color,
        color: variant.color,
        colorHex: variant.colorHex || "#FDFDFD",
        keywords: variant.keywords || [],
        stock: 10,
        images: processedPrimary ? [processedPrimary, ...processedSecondary] : processedSecondary,
        price: parseFloat(variant.sellingPrice) || 0,
        mrp: parseFloat(variant.mrp) || 0,
        sellingPrice: parseFloat(variant.sellingPrice) || 0,
      };
    });

    // Map combos with structured image naming
    const processedCombos = combos.map((combo, cIdx) => {
      const comboId = `${finalId}-combo-${cIdx}`;
      const primaryImg = combo.images[0] || "";
      const comboStructuredUrl = getStructuredUrl(
        comboId,
        `${basicDetails.collectionTitle} Combo`,
        basicDetails.fulfillmentCategory,
        "Combo",
        parseFloat(combo.sellingPrice) || parsedPrice,
        basicDetails.sizes,
        "Unisex"
      );

      const processedPrimary = processImageAndCache(primaryImg, comboStructuredUrl);
      const processedSecondary = combo.images.slice(1).map((img, sIdx) => {
        const secondaryUrl = `${comboStructuredUrl.replace(".jpg", "")}_gallery_${sIdx + 1}.jpg`;
        return processImageAndCache(img, secondaryUrl);
      });

      return {
        images: processedPrimary ? [processedPrimary, ...processedSecondary] : processedSecondary,
        price: parseFloat(combo.sellingPrice) || 0,
        mrp: parseFloat(combo.mrp) || 0,
        sellingPrice: parseFloat(combo.sellingPrice) || 0,
        shirtSize: combo.shirtSize || basicDetails.topSizes[0] || "M",
        trouserSize: combo.trouserSize || basicDetails.bottomSizes[0] || "30",
        shoeSize: combo.shoeSize || (basicDetails.shoeSizes && basicDetails.shoeSizes[0]) || "9"
      };
    });

    // Combine primary images for parent Compatibility
    const firstVariantImages = processedVariants[0]?.images || [];

    const payload = {
      id: finalId,
      ID: finalId,
      name: basicDetails.collectionTitle,
      Name: basicDetails.collectionTitle,
      title: basicDetails.collectionTitle,
      category: basicDetails.fulfillmentCategory,
      Category: basicDetails.fulfillmentCategory,
      description: basicDetails.shortDescription,
      price: parsedPrice,
      Price: parsedPrice,
      mrp: variations[0]?.mrp ? parseFloat(variations[0].mrp) || 0 : undefined,
      sellingPrice: variations[0]?.sellingPrice ? parseFloat(variations[0].sellingPrice) || 0 : undefined,
      sizes: basicDetails.sizes,
      Sizes: basicDetails.sizes,
      topSizes: basicDetails.topSizes || basicDetails.sizes,
      bottomSizes: basicDetails.bottomSizes || basicDetails.sizes,
      shoeSizes: basicDetails.shoeSizes || ["6", "7", "8", "9", "10", "11", "12"],
      sizeGuideRef: basicDetails.sizeGuideImage,
      fitAndStyle: basicDetails.fitAndStyle || basicDetails.fitStyle,
      brand: basicDetails.brand || "Tirupati Merchandise Heritage",
      Brand: basicDetails.brand || "Tirupati Merchandise Heritage",
      designPattern: basicDetails.designPattern || "Solid",
      DesignPattern: basicDetails.designPattern || "Solid",
      fitStyle: basicDetails.fitStyle || basicDetails.fitAndStyle || "Regular Fit",
      FitStyle: basicDetails.fitStyle || basicDetails.fitAndStyle || "Regular Fit",
      colorName: basicDetails.colorName || variations[0]?.color || "Linen White",
      colorHex: variations[0]?.colorHex || basicDetails.colorHex || "#FDFDFD",
      rating: parseFloat(basicDetails.ratingScore) || 4.8,
      compositionAndCare: basicDetails.artisanCare,
      inspiration: basicDetails.productNarrative,
      ratingAvg: parseFloat(basicDetails.ratingScore) || 5.0,
      reviewsCount: parseInt(basicDetails.reviewsCount) || 163,
      specs: parsedSpecs,
      variants: processedVariants,
      combos: processedCombos,
      colors: processedVariants.map(v => v.color).filter(Boolean),
      images: firstVariantImages.length > 0 ? firstVariantImages : ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80"],
      stock: processedVariants.reduce((sum, v) => sum + (v.stock || 0), 0) || 15,
      productType: basicDetails.productType || (combos.length > 0 ? "Two-Piece Set" : releaseType === "footwear" ? "Shoes" : "Single Item"),
      featured: false,
      tags: Array.from(new Set([
        "organic",
        "loomed",
        ...processedVariants.flatMap(v => v.keywords || [])
      ])),
      genderPreference: "Unisex",
      "Gender Preference": "Unisex",
      referenceNumber: basicDetails.adminProductCode || "",
      adminProductCode: basicDetails.adminProductCode || "",
      productCode: basicDetails.adminProductCode || ""
    };

    try {
      // Upload any new base64 images to the server before saving product
      if (uploadsToRun.length > 0) {
        console.log(`[Admin] Uploading ${uploadsToRun.length} catalog images to server...`);
        for (const upload of uploadsToRun) {
          try {
            await fetch("/api/upload-image", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
              },
              body: JSON.stringify({ url: upload.url, base64: upload.base64 })
            });
          } catch (uploadErr) {
            console.error(`[Admin] Failed to upload ${upload.url}:`, uploadErr);
          }
        }
      }

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
        setProductSuccess(editingProduct ? "Collection specifications successfully modified." : "New curated travel collection released.");
        onProductUpdate();
        setSyncStatus("synced");
        setTimeout(() => {
          setIsAddOpen(false);
          setEditingProduct(null);
          setProductSuccess("");
        }, 1500);
      } else {
        const errorData = await res.json();
        setProductError(errorData.error || "Failed to publish collection.");
        setSyncStatus("failed");
      }
    } catch (e: any) {
      setProductError(`Server connection error: ${e.message}`);
      setSyncStatus("failed");
    }
  };

  // Delete product safely
  const handleDeleteProduct = async (id: string) => {
    setSyncStatus("saving");
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        onProductUpdate();
        setSyncStatus("synced");
        setProductSuccess("Apparel design successfully retired.");
        setTimeout(() => setProductSuccess(""), 3500);
      } else {
        const err = await res.json().catch(() => ({}));
        setProductError(err.error || "Failed to retire product from collection.");
        setSyncStatus("failed");
        setTimeout(() => setProductError(""), 4000);
      }
    } catch (e) {
      console.error(e);
      setProductError("Database connection dropped.");
      setSyncStatus("failed");
      setTimeout(() => setProductError(""), 4000);
    } finally {
      setDeleteProductId(null);
    }
  };

  // Status transitions
  const handleOrderStatusUpdate = async (id: string, newStatus: string) => {
    setSyncStatus("saving");
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        onOrderUpdate();
        setSyncStatus("synced");
      } else {
        alert("Order route configuration denied.");
        setSyncStatus("failed");
      }
    } catch (e) {
      console.error(e);
      setSyncStatus("failed");
    }
  };

  const handleOrderPaymentStatusUpdate = async (id: string, newPaymentStatus: string) => {
    setSyncStatus("saving");
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}/payment-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus })
      });
      if (res.ok) {
        onOrderUpdate();
        setSyncStatus("synced");
        if (selectedOrderDetails?.id === id) {
          setSelectedOrderDetails(prev => prev ? { ...prev, paymentStatus: newPaymentStatus } : null);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to update payment status.");
        setSyncStatus("failed");
      }
    } catch (e) {
      console.error(e);
      setSyncStatus("failed");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!id) return;
    setSyncStatus("saving");
    try {
      const cleanId = id.trim();
      const res = await fetch(`/api/orders/${encodeURIComponent(cleanId)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        onOrderUpdate();
        setSyncStatus("synced");
        if (selectedOrderDetails?.id === id || selectedOrderDetails?.id === cleanId) {
          setSelectedOrderDetails(null);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to delete order.");
        setSyncStatus("failed");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete order due to connectivity issues.");
      setSyncStatus("failed");
    }
  };

  // Submit Customer Tags
  const handleSaveCustomerTags = async (email: string, tags: string[]) => {
    setSyncStatus("saving");
    try {
      const res = await fetch(`/api/customers/${encodeURIComponent(email)}/tags`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ tags })
      });
      if (res.ok) {
        setEditingTagsEmail(null);
        loadCrmCustomers();
        setSyncStatus("synced");
      } else {
        setSyncStatus("failed");
      }
    } catch (e) {
      console.error(e);
      setSyncStatus("failed");
    }
  };

  // Storefront slow travel CMS Updates
  const handleCmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCmsSuccess("");
    setSyncStatus("saving");
    try {
      const res = await fetch("/api/cms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(cmsForm)
      });
      if (res.ok) {
        setCmsSuccess("Homepage slow travel presentation updated instantly.");
        const data = await res.json();
        onCmsUpdate(data.cmsConfig);
        setSyncStatus("synced");
        setTimeout(() => setCmsSuccess(""), 4000);
      } else {
        alert("Failed to update CMS config");
        setSyncStatus("failed");
      }
    } catch (e) {
      console.error(e);
      setSyncStatus("failed");
    }
  };

  // Image processing emulation
  const handleProcessImageWebp = (url: string) => {
    setMockCompressedInfo("Analyzing and optimizing pixels...");
    setTimeout(() => {
      const savedBytes = Math.floor(400 + Math.random() * 500);
      setMockCompressedInfo(`✓ WebP lossless compression applied. Reduced by 84% (${savedBytes} KB saved). Metadata alt-tag generated instantly for SEO mapping.`);
    }, 1200);
  };

  const handleImageOrderSwap = async (prod: Product, indexA: number, indexB: number) => {
    if (indexA < 0 || indexA >= prod.images.length || indexB < 0 || indexB >= prod.images.length) return;
    const copiedImages = [...prod.images];
    const temp = copiedImages[indexA];
    copiedImages[indexA] = copiedImages[indexB];
    copiedImages[indexB] = temp;

    setSyncStatus("saving");
    try {
      const res = await fetch(`/api/products/${prod.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ images: copiedImages })
      });
      if (res.ok) {
        onProductUpdate();
        setReorderingImagesProd(prev => prev ? { ...prev, images: copiedImages } : null);
        setSyncStatus("synced");
      } else {
        setSyncStatus("failed");
      }
    } catch (e) {
      console.error(e);
      setSyncStatus("failed");
    }
  };

  // Payments configuration & ledger handlers
  const fetchPayConfig = async () => {
    try {
      const res = await fetch("/api/admin/payments/config", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayConfigForm(data);
      }
    } catch (err) {
      console.error("Failed to fetch payment config", err);
    }
  };

  const fetchPayTransactions = async () => {
    setIsPayLoading(true);
    try {
      const url = `/api/admin/payments/transactions?search=${encodeURIComponent(paySearch)}&status=${payStatusFilter === "All" ? "" : payStatusFilter}`;
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayTransactions(data);
      }
    } catch (err) {
      console.error("Failed to fetch payment transactions", err);
    } finally {
      setIsPayLoading(false);
    }
  };

  const handleSavePayConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaySettingsSuccess("");
    setPaySettingsError("");
    setSyncStatus("saving");
    try {
      const res = await fetch("/api/admin/payments/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(payConfigForm)
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.config) {
          setPayConfigForm(resData.config);
        }
        setPaySettingsSuccess("Configuration secured in cloud Firestore vault!");
        setSyncStatus("synced");
        window.dispatchEvent(new Event("payment-config-updated"));
        setTimeout(() => setPaySettingsSuccess(""), 4000);
      } else {
        const err = await res.json();
        setPaySettingsError(err.error || "Save configuration failure");
        setSyncStatus("failed");
      }
    } catch (err) {
      setPaySettingsError("Connectivity lost with vault server.");
      setSyncStatus("failed");
    }
  };

  const handleStatusCheck = async (txnId: string) => {
    try {
      const res = await fetch(`/api/admin/payments/transactions/${txnId}/status-check`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Status verified.");
        fetchPayTransactions();
        onOrderUpdate(); // Refresh parent orders
      } else {
        const err = await res.json();
        alert(err.error || "Failing to execute status check verification.");
      }
    } catch (err) {
      alert("Lost corridor connection.");
    }
  };

  const handleRefundTxn = async (txnId: string) => {
    try {
      const res = await fetch(`/api/admin/payments/transactions/${txnId}/refund`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Refund successfully triggered!");
        fetchPayTransactions();
        onOrderUpdate(); // Refresh parent orders
      } else {
        const err = await res.json();
        alert(err.error || "Failed to trigger refund.");
      }
    } catch (err) {
      alert("Lost corridor connection.");
    }
  };

  // Customer Review Handlers
  const fetchReviews = async () => {
    if (!authToken) return;
    setIsFetchingReviews(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${reviewStatusFilter}`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch customer reviews", err);
    } finally {
      setIsFetchingReviews(false);
    }
  };

  const handleUpdateReviewStatus = async (reviewId: string, status: "Approved" | "Rejected") => {
    try {
      await updateReviewInFirestore(reviewId, { status });
      fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ status })
      }).catch(e => console.warn("API status notice:", e));
      fetchReviews();
      onProductUpdate();
    } catch (err) {
      console.error("Failed to update review status", err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReviewFromFirestore(reviewId);
      fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      }).catch(e => console.warn("API delete notice:", e));
      fetchReviews();
      onProductUpdate();
    } catch (err) {
      console.error("Failed to delete review", err);
    }
  };

  const fetchProductReviews = async (productId: string) => {
    setIsLoadingProductReviews(true);
    try {
      const res = await fetch(`/api/admin/reviews?productId=${productId}`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProductReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch product reviews", err);
    } finally {
      setIsLoadingProductReviews(false);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForReviews || !reviewForm.userName.trim() || !reviewForm.comment.trim()) return;

    try {
      if (editingReviewItem) {
        await updateReviewInFirestore(editingReviewItem.id, {
          productId: selectedProductForReviews.id,
          ...reviewForm
        }, authToken);
        setReviewActionSuccess("Review updated successfully!");
        setTimeout(() => setReviewActionSuccess(""), 3000);
        setIsReviewFormOpen(false);
        setEditingReviewItem(null);
        fetchProductReviews(selectedProductForReviews.id);
        onProductUpdate();
      } else {
        await addReviewToFirestore({
          productId: selectedProductForReviews.id,
          ...reviewForm,
          status: reviewForm.status || "Approved"
        }, authToken);
        setReviewActionSuccess("New review published live on Product Details Page!");
        setTimeout(() => setReviewActionSuccess(""), 3000);
        setIsReviewFormOpen(false);
        setReviewForm({
          userName: "",
          userEmail: "",
          rating: 5,
          comment: "",
          date: new Date().toISOString().split("T")[0],
          status: "Approved"
        });
        fetchProductReviews(selectedProductForReviews.id);
        onProductUpdate();
      }
    } catch (err) {
      console.error("Failed to save review to Firestore", err);
    }
  };

  const handleBulkImportReviews = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkReviewError(null);

    if (!selectedProductForReviews) return;

    if (!bulkReviewJson.trim()) {
      setBulkReviewError("Please paste a JSON array of reviews.");
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(bulkReviewJson.trim());
    } catch (err) {
      setBulkReviewError("Invalid JSON syntax. Please verify array brackets, quotes, and commas.");
      return;
    }

    if (!Array.isArray(parsed)) {
      setBulkReviewError("Input must be a JSON array (e.g. [{\"name\": \"Ajeet\", \"rating\": 5, \"review\": \"Great\"}])");
      return;
    }

    if (parsed.length === 0) {
      setBulkReviewError("JSON array is empty. Please provide at least one review object.");
      return;
    }

    setIsSubmittingBulkReviews(true);
    try {
      await submitReviews(parsed, selectedProductForReviews.id, authToken);

      const updatedReviews = await getReviewsForProduct(selectedProductForReviews.id);
      setProductReviews(updatedReviews);

      setReviewActionSuccess(`Successfully imported ${parsed.length} reviews!`);
      setTimeout(() => setReviewActionSuccess(""), 4000);
      setIsBulkReviewImportOpen(false);
      setBulkReviewJson("");
      onProductUpdate();
    } catch (err: any) {
      setBulkReviewError(err.message || "Error submitting bulk reviews.");
    } finally {
      setIsSubmittingBulkReviews(false);
    }
  };

  const handleDeleteProductReview = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        setReviewActionSuccess("Review deleted successfully!");
        setTimeout(() => setReviewActionSuccess(""), 3000);
        setProductReviews(prev => prev.filter(r => r.id !== reviewId));
        setConfirmDeleteReviewId(null);
        if (selectedProductForReviews) {
          fetchProductReviews(selectedProductForReviews.id);
        }
        onProductUpdate();
      }
    } catch (err) {
      console.error("Failed to delete review", err);
    }
  };

  const handleQuickToggleReviewStatus = async (reviewId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Approved" ? "Rejected" : "Approved";
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        if (selectedProductForReviews) {
          fetchProductReviews(selectedProductForReviews.id);
        }
        onProductUpdate();
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  useEffect(() => {
    if (activeTab === "payments") {
      fetchPayConfig();
      fetchPayTransactions();
    }
    if (activeTab === "reviews") {
      fetchReviews();
    }
  }, [activeTab, paySearch, payStatusFilter, reviewStatusFilter]);

  return (
    <div className="bg-ink text-linen rounded-2xl border border-sand/20 shadow-2xl overflow-hidden flex flex-col md:flex-row w-full min-h-[85vh]" id="premium-admin-container">
      
      {/* Sidebar Navigation Panel */}
      <aside className="w-full md:w-64 bg-ink border-b md:border-b-0 md:border-r border-sand/20 p-6 flex flex-col justify-between" id="admin-sidebar">
        <div className="space-y-8">
          {/* Brand Logo & Context */}
          <div className="space-y-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-moss block font-bold">tirupati merchandise merchant</span>
            <h3 className="font-serif text-xl tracking-widest text-[#FAF9F5]">operations</h3>
            <p className="text-[10px] text-linen/50 font-sans font-light leading-relaxed">Centralized telemetry, slow-travel content, and customer fulfillment controls.</p>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0" id="admin-tabs-nav">
            {[
              { id: "analytics", label: "Overview Metrics", icon: TrendingUp },
              { id: "products", label: "Inventory & SKUs", icon: Package },
              { id: "orders", label: "Dispatches & Returns", icon: Sliders },
              { id: "reviews", label: "Customer Reviews", icon: Star },
              { id: "crm", label: "Customer (CRM)", icon: Users },
              { id: "cms", label: "Storefront (CMS)", icon: Settings },
              { id: "payments", label: "Payments (UPI)", icon: DollarSign },
              { id: "sections", label: "Homepage Sections", icon: Layers }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`admin-tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider text-left transition w-full whitespace-nowrap md:whitespace-normal cursor-pointer ${
                    isActive 
                      ? "bg-moss/50 text-moss border border-moss/30 font-bold" 
                      : "text-linen/40 hover:text-white hover:bg-sand/15/50"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI report status */}
        <div className="pt-6 border-t border-sand/20/80 hidden md:block">
          <div className="bg-ink p-4 rounded-xl border border-sand/20 space-y-3">
            <span className="text-[10px] text-linen/50 font-mono tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-moss animate-pulse" />
              <span>Gemini Advisory</span>
            </span>
            <button
              onClick={onGenerateInsights}
              disabled={isGeneratingInsights}
              id="admin-sidebar-insights-btn"
              className="w-full py-2 bg-moss hover:bg-moss-hover disabled:opacity-50 text-xs text-[#FAF9F5] font-semibold rounded-md transition text-center block cursor-pointer"
            >
              {isGeneratingInsights ? "Processing..." : "Generate Brief"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-6 md:p-8 bg-ink overflow-y-auto space-y-6" id="admin-workspace">
        
        {/* Admin Workspace Header & Sync Telemetry */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sand/20/60 gap-4" id="admin-workspace-header">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-linen/50 block">Tirupati Merchandise Operations Console</span>
            <h1 className="text-lg font-serif font-semibold tracking-wide text-linen">Merchant Workspace</h1>
          </div>

          {/* Real-time Firestore Sync Status Indicator */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-ink/60 border border-sand/20/80 shadow-inner" id="firestore-sync-indicator">
            <span className="relative flex h-2.5 w-2.5">
              {syncStatus === "saving" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              )}
              {syncStatus === "synced" && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-moss/100/40"></span>
              )}
              {syncStatus === "failed" && (
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-red-500"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                syncStatus === "synced" ? "bg-moss/100" :
                syncStatus === "saving" ? "bg-amber-400" :
                "bg-red-500"
              }`}></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider font-medium">
              {syncStatus === "synced" && <span className="text-moss">Synced to Firestore</span>}
              {syncStatus === "saving" && <span className="text-amber-400 animate-pulse">Saving...</span>}
              {syncStatus === "failed" && <span className="text-red-400">Sync Failed</span>}
            </span>
          </div>
        </div>
        
        {/* Active Banner Insights Box */}
        {merchantAIReport && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-moss/80 border border-moss text-linen/80 rounded-xl p-5 relative text-xs"
            id="ai-insight-bar-top"
          >
            <div className="flex items-center gap-2 text-moss font-serif text-sm font-bold pb-2 border-b border-moss/30 mb-3">
              <Sparkles className="w-4 h-4" />
              <span>Strategic Intelligence Insight</span>
            </div>
            <p className="whitespace-pre-wrap leading-relaxed font-sans">{merchantAIReport}</p>
          </motion.div>
        )}

        {/* ==================== TAB 1: OVERVIEW & ANALYTICS ==================== */}
        {activeTab === "analytics" && (
          <div className="space-y-6" id="admin-view-analytics">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold">Performance Ledger</h2>
                <p className="text-xs text-linen/40 mt-0.5">Real-time revenue, order velocities, and sales-to-checkout conversion dynamics.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="p-1.5 rounded bg-ink text-linen/40 text-[10px] font-mono border border-sand/20 uppercase tracking-widest">
                  Auto-sync: Active
                </span>
              </div>
            </div>

            {/* Metrics cards */}
            {analytics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="analytics-overview-cards">
                <div className="bg-ink p-5 rounded-xl border border-sand/20 space-y-1">
                  <span className="text-[10px] text-linen/40 uppercase tracking-wider font-mono font-bold block">1. Gross Revenue</span>
                  <span className="text-2xl font-serif font-black text-[#FAF9F5] block">₹{Math.round(analytics.totalRevenue || 0).toLocaleString("en-IN")}</span>
                  <div className="flex items-center gap-1 text-[10px] text-moss font-mono">
                    <TrendingUp className="w-3 h-3" />
                    <span>Total settled sales</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className="bg-ink p-5 rounded-xl border border-sand/20 hover:border-moss/60 hover:bg-stone-900/80 transition cursor-pointer group text-left space-y-1 shadow-sm hover:shadow-md w-full"
                  title="Click to view full Orders Management page"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-linen/40 uppercase tracking-wider font-mono font-bold block group-hover:text-moss transition-colors">2. Total Orders (Click to View)</span>
                    <ArrowUpRight className="w-4 h-4 text-moss group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <span className="text-2xl font-serif font-black text-[#FAF9F5] block group-hover:text-moss transition-colors">{analytics.totalOrders || orders.length} Orders</span>
                  <div className="flex items-center justify-between text-[10px] text-linen/50 font-mono pt-1">
                    <span>AOV Ticket: ₹{Math.round(analytics.averageOrderValue || 0).toLocaleString("en-IN")}</span>
                    <span className="text-moss font-bold underline decoration-moss/40 underline-offset-2">Open Orders Page →</span>
                  </div>
                </button>

                <div className="bg-ink p-5 rounded-xl border border-sand/20 space-y-1">
                  <span className="text-[10px] text-linen/40 uppercase tracking-wider font-mono font-bold block">3. Orders in Process</span>
                  <span className="text-2xl font-serif font-black text-amber-400 block">
                    {analytics.ordersProcessing ?? orders.filter(o => o.status === "Processing" || o.status === "Pending").length} Active
                  </span>
                  <span className="text-[10px] text-linen/50 font-mono block">Fulfillment in progress</span>
                </div>

                <div className="bg-ink p-5 rounded-xl border border-sand/20 space-y-1">
                  <span className="text-[10px] text-linen/40 uppercase tracking-wider font-mono font-bold block">4. Orders Delivered</span>
                  <span className="text-2xl font-serif font-black text-moss block">
                    {analytics.ordersDelivered ?? orders.filter(o => o.status === "Delivered").length} Complete
                  </span>
                  <span className="text-[10px] text-linen/50 font-mono block">Customer received</span>
                </div>

                <div className="bg-ink p-5 rounded-xl border border-sand/20 space-y-1">
                  <span className="text-[10px] text-linen/40 uppercase tracking-wider font-mono font-bold block">5. Total Products Listed</span>
                  <span className="text-2xl font-serif font-black text-[#FAF9F5] block">
                    {analytics.totalProductsListed ?? products.length} SKUs
                  </span>
                  <span className="text-[10px] text-linen/50 font-mono block">Active catalog designs</span>
                </div>

                <div className="bg-ink p-5 rounded-xl border border-sand/20 space-y-1">
                  <span className="text-[10px] text-linen/40 uppercase tracking-wider font-mono font-bold block">6. Products Out of Stock</span>
                  <span className="text-2xl font-serif font-black text-red-400 block">
                    {analytics.outOfStockCount ?? products.filter(p => (p.stock || 0) <= 0).length} Depleted
                  </span>
                  <span className="text-[10px] text-linen/50 font-mono block">Requires restock inventory</span>
                </div>
              </div>
            ) : (
              <div className="bg-ink/60 p-8 text-center rounded-xl animate-pulse text-linen/40 text-xs font-mono">
                Assembling metrics ledger...
              </div>
            )}

            {/* Custom SVG Performance Chart */}
            <div className="bg-ink border border-sand/20 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-sand/20/60">
                <div>
                  <h4 className="text-sm font-mono uppercase tracking-wider font-bold">Transaction Value Over Time (MTD)</h4>
                  <p className="text-[10px] text-linen/40 mt-0.5">7-day rolling revenue plots.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-moss">
                  <span className="w-2.5 h-2.5 rounded-full bg-moss inline-block" />
                  <span>Settled Sales</span>
                </div>
              </div>

              {/* Chart Canvas Plot */}
              <div className="relative pt-4">
                <svg viewBox="0 0 500 180" className="w-full h-48 overflow-visible" id="analytics-svg-chart">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#292524" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="#292524" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#292524" strokeWidth="0.5" strokeDasharray="3,3" />
                  <line x1="0" y1="160" x2="500" y2="160" stroke="#44403c" strokeWidth="1" />

                  {/* Curvaceous Graph Line representing revenue growth */}
                  <path
                    d="M 10 140 Q 90 120 170 80 T 330 50 T 490 30"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Gradient Area below curve */}
                  <path
                    d="M 10 140 Q 90 120 170 80 T 330 50 T 490 30 L 490 160 L 10 160 Z"
                    fill="url(#emerald-gradient)"
                    opacity="0.15"
                  />

                  <defs>
                    <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Interactive Scatter Points */}
                  {[
                    { x: 10, y: 140, label: "Jun 22", val: "₹10,200" },
                    { x: 170, y: 80, label: "Jun 24", val: "₹40,800" },
                    { x: 330, y: 50, label: "Jun 26", val: "₹61,200" },
                    { x: 490, y: 30, label: "Today", val: "₹1,08,800" }
                  ].map((pt, idx) => (
                    <g key={idx} className="group cursor-pointer">
                      <circle cx={pt.x} cy={pt.y} r="5" fill="#34d399" stroke="#1c1917" strokeWidth="1.5" />
                      <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="#a8a29e" className="text-[8px] font-mono group-hover:fill-emerald-400 group-hover:font-bold transition">{pt.val}</text>
                      <text x={pt.x} y="174" textAnchor="middle" fill="#78716c" className="text-[7px] font-mono">{pt.label}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Funnel conversion Rate simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Funnel */}
              <div className="bg-ink border border-sand/20 rounded-xl p-5 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider font-bold block">Storefront Conversion Funnel</span>
                <div className="space-y-3 pt-2">
                  <div className="relative">
                    <div className="bg-moss/30 border border-moss/30 p-2.5 rounded-lg flex justify-between items-center text-xs">
                      <span>1. Catalog Views</span>
                      <span className="font-mono font-bold">1,402 views (100%)</span>
                    </div>
                  </div>
                  <div className="relative max-w-[90%] mx-auto">
                    <div className="bg-moss/30 border border-moss/30/40 p-2.5 rounded-lg flex justify-between items-center text-xs">
                      <span>2. Add-to-Luggage</span>
                      <span className="font-mono font-bold">173 pieces (12.3%)</span>
                    </div>
                  </div>
                  <div className="relative max-w-[80%] mx-auto">
                    <div className="bg-moss/30 border border-moss/40 p-2.5 rounded-lg flex justify-between items-center text-xs">
                      <span>3. Checkout Started</span>
                      <span className="font-mono font-bold">94 bags (6.7%)</span>
                    </div>
                  </div>
                  <div className="relative max-w-[70%] mx-auto">
                    <div className="bg-moss/20 border border-moss/30 p-2.5 rounded-lg flex justify-between items-center text-xs">
                      <span>4. Completed Journeys</span>
                      <span className="font-mono font-bold text-moss">48 orders (3.4%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Best seller categories and variations */}
              <div className="bg-ink border border-sand/20 rounded-xl p-5 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider font-bold block">Top Performing SKUs by Velocity</span>
                <div className="divide-y divide-stone-800 max-h-48 overflow-y-auto pr-2">
                  {products.slice(0, 4).map((p, idx) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-linen/50">0{idx + 1}</span>
                        <div>
                          <span className="font-serif font-bold text-[#FAF9F5] block">{p.name}</span>
                          <span className="text-[10px] text-linen/40 font-mono">Category: {p.category}</span>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-moss font-bold block">₹{Math.round(p.price || 0).toLocaleString("en-IN")}</span>
                        <span className="text-[10px] text-linen/50">{p.stock} units remain</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================== TAB 2: ADVANCED PRODUCT & INVENTORY ==================== */}
        {activeTab === "products" && (() => {
          const apparelProds = localProducts.filter(p => getProductCategoryType(p) === "APPAREL");
          const footwearProds = localProducts.filter(p => getProductCategoryType(p) === "FOOTWEAR");
          const accessoriesProds = localProducts.filter(p => getProductCategoryType(p) === "ACCESSORIES");

          const displayProducts = localProducts.filter(p => {
            // 1. Section tab filter
            const sectionType = getProductCategoryType(p);
            if (inventoryCategoryTab === "APPAREL" && sectionType !== "APPAREL") return false;
            if (inventoryCategoryTab === "FOOTWEAR" && sectionType !== "FOOTWEAR") return false;
            if (inventoryCategoryTab === "ACCESSORIES" && sectionType !== "ACCESSORIES") return false;

            // 2. Search query filter
            const q = productSearch.toLowerCase().trim();
            if (!q) return true;
            return (
              (p.name || "").toLowerCase().includes(q) ||
              (p.category || "").toLowerCase().includes(q) ||
              (p.adminProductCode || p.referenceNumber || p.productCode || "").toLowerCase().includes(q) ||
              (Array.isArray(p.tags) ? p.tags.join(" ") : (p.tags || "")).toLowerCase().includes(q)
            );
          }).sort((a, b) => {
            const indexA = localProducts.findIndex(x => x.id === a.id);
            const indexB = localProducts.findIndex(x => x.id === b.id);
            const orderA = typeof a.displayOrder === "number" ? a.displayOrder : (typeof a.sortOrder === "number" ? a.sortOrder : (indexA !== -1 ? indexA : 999999));
            const orderB = typeof b.displayOrder === "number" ? b.displayOrder : (typeof b.sortOrder === "number" ? b.sortOrder : (indexB !== -1 ? indexB : 999999));
            return orderA - orderB;
          });

          return (
          <div className="space-y-6" id="admin-view-products">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold">Inventory & SKU Catalog</h2>
                <p className="text-xs text-linen/40 mt-0.5">Manage stock variations across Apparel, Footwear & Accessories sections.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setReleaseType("apparel");
                    setEditingProduct(null);
                    setProductForm({
                      productId: "",
                      name: "",
                      price: "",
                      mrp: "",
                      sellingPrice: "",
                      merchandisingTag: "",
                      title: "",
                      breadcrumbs: "",
                      sizeGuideRef: "",
                      promoText: "",
                      activeOffersRaw: "[]",
                      freeShippingThreshold: "3000",
                      highlightsRaw: "[]",
                      specsRaw: "{}",
                      returnsPolicy: "",
                      reviewsEnabled: true,
                      description: "",
                      category: "Loomed Shirts",
                      productType: "Single Item",
                      primaryImage: "",
                      images: [] as string[],
                      stock: "15",
                      color: "Forest Green",
                      sizes: ["S", "M", "L", "XL", "XXL", "XXXL"] as string[],
                      topSizes: ["S", "M", "L", "XL", "XXL", "XXXL"] as string[],
                      bottomSizes: ["26", "28", "30", "32", "34", "36", "38"] as string[],
                      shoeSizes: ["6", "7", "8", "9", "10", "11", "12"] as string[],
                      tags: "organic, handloom",
                      featured: false,
                      inspiration: "",
                      genderPreference: "Unisex",
                      referenceNumber: "",
                      fitAndStyle: "REGULAR FIT",
                      compositionAndCare: "",
                      topFitAndStyle: "REGULAR FIT",
                      topCompositionAndCare: "",
                      bottomFitAndStyle: "SLIM FIT",
                      bottomCompositionAndCare: "",
                      originAndTraceability: "",
                      completeYourLook: "",
                      collectionId: ""
                    });
                    setProductVariants([]);
                    setIsAddOpen(true);
                  }}
                  id="admin-create-product-btn"
                  className="px-4 py-2 bg-moss hover:bg-moss-hover text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer text-white shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Apparel</span>
                </button>
                <button
                  onClick={() => {
                    setReleaseType("apparel");
                    setEditingProduct(null);
                    setProductForm({
                      productId: "",
                      name: "",
                      price: "",
                      mrp: "",
                      sellingPrice: "",
                      merchandisingTag: "",
                      title: "",
                      breadcrumbs: "",
                      sizeGuideRef: "",
                      promoText: "",
                      activeOffersRaw: "[]",
                      freeShippingThreshold: "3000",
                      highlightsRaw: "[]",
                      specsRaw: "{}",
                      returnsPolicy: "",
                      reviewsEnabled: true,
                      description: "",
                      category: "Shirt & Pant Combo",
                      productType: "Two-Piece Set",
                      primaryImage: "",
                      images: [] as string[],
                      stock: "15",
                      color: "Linen White",
                      sizes: ["S", "M", "L", "XL", "XXL", "XXXL"] as string[],
                      topSizes: ["S", "M", "L", "XL", "XXL", "XXXL"] as string[],
                      bottomSizes: ["26", "28", "30", "32", "34", "36", "38"] as string[],
                      shoeSizes: ["6", "7", "8", "9", "10", "11", "12"] as string[],
                      tags: "combo, set, linen",
                      featured: false,
                      inspiration: "",
                      genderPreference: "Unisex",
                      referenceNumber: "",
                      fitAndStyle: "REGULAR FIT",
                      compositionAndCare: "",
                      topFitAndStyle: "REGULAR FIT",
                      topCompositionAndCare: "",
                      bottomFitAndStyle: "SLIM FIT",
                      bottomCompositionAndCare: "",
                      originAndTraceability: "",
                      completeYourLook: "",
                      collectionId: ""
                    });
                    setProductVariants([]);
                    setIsAddOpen(true);
                  }}
                  id="admin-create-combo-btn"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer text-white shadow"
                >
                  <Tag className="w-4 h-4" />
                  <span>Add New Combo</span>
                </button>
                <button
                  onClick={() => {
                    setReleaseType("footwear");
                    setEditingProduct(null);
                    setProductForm({
                      productId: "",
                      name: "",
                      price: "",
                      mrp: "",
                      sellingPrice: "",
                      merchandisingTag: "",
                      title: "",
                      breadcrumbs: "",
                      sizeGuideRef: "",
                      promoText: "",
                      activeOffersRaw: "[]",
                      freeShippingThreshold: "3000",
                      highlightsRaw: "[]",
                      specsRaw: "{}",
                      returnsPolicy: "",
                      reviewsEnabled: true,
                      description: "",
                      category: "Footwear",
                      productType: "Shoes",
                      primaryImage: "",
                      images: [] as string[],
                      stock: "15",
                      color: "Obsidian Black",
                      sizes: ["6", "7", "8", "9", "10", "11", "12"] as string[],
                      topSizes: ["S", "M", "L", "XL", "XXL", "XXXL"] as string[],
                      bottomSizes: ["26", "28", "30", "32", "34", "36", "38"] as string[],
                      shoeSizes: ["6", "7", "8", "9", "10", "11", "12"] as string[],
                      tags: "footwear, sneakers, shoes",
                      featured: false,
                      inspiration: "",
                      genderPreference: "Unisex",
                      referenceNumber: "",
                      fitAndStyle: "REGULAR FIT",
                      compositionAndCare: "",
                      topFitAndStyle: "REGULAR FIT",
                      topCompositionAndCare: "",
                      bottomFitAndStyle: "REGULAR FIT",
                      bottomCompositionAndCare: "",
                      originAndTraceability: "",
                      completeYourLook: "",
                      collectionId: ""
                    });
                    setProductVariants([]);
                    setIsAddOpen(true);
                  }}
                  id="admin-create-footwear-btn"
                  className="px-4 py-2 bg-[#B5652F] hover:bg-[#A35726] text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer text-white shadow"
                >
                  <Footprints className="w-4 h-4" />
                  <span>Add New Footwear</span>
                </button>
                <button
                  onClick={handleRepairLegacyTrouserSizes}
                  disabled={isRepairingTrouserSizes}
                  id="admin-repair-trouser-sizes-btn"
                  className="px-4 py-2 bg-rose-800 hover:bg-rose-700 disabled:opacity-50 text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer text-white shadow"
                  title="Repair legacy products that have letter-based trouser sizes"
                >
                  <RefreshCw className={`w-4 h-4 ${isRepairingTrouserSizes ? "animate-spin" : ""}`} />
                  <span>Repair Legacy Trouser Sizes</span>
                </button>
                <button
                  onClick={() => setIsBulkEditing(!isBulkEditing)}
                  id="admin-bulk-edit-toggle-btn"
                  className="px-4 py-2 bg-ink hover:bg-sand/15 text-xs font-mono uppercase tracking-wider font-bold rounded-lg border border-sand/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Bulk Controls</span>
                </button>
              </div>
            </div>

            {/* 3 DEDICATED INVENTORY SECTIONS (Apparel, Footwear, Accessories) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="admin-inventory-category-sections">
              {/* SECTION 1: APPAREL */}
              <button
                type="button"
                onClick={() => setInventoryCategoryTab(inventoryCategoryTab === "APPAREL" ? "ALL" : "APPAREL")}
                className={`p-4 rounded-xl border text-left transition flex items-start justify-between cursor-pointer ${
                  inventoryCategoryTab === "APPAREL"
                    ? "bg-stone-800/95 border-amber-500 ring-2 ring-amber-500/40 shadow-xl"
                    : "bg-ink border-sand/20 hover:border-sand/40 hover:bg-stone-900/60"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30">
                      <Shirt className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <span className="font-serif font-bold text-base text-[#FAF9F5] block leading-tight">Apparel Section</span>
                      <span className="text-[10px] font-mono text-linen/40 uppercase tracking-wider">Garments, Shirts & Sets</span>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center gap-3 text-xs font-mono border-t border-sand/10">
                    <div>
                      <span className="text-linen/40 text-[10px] block uppercase">Designs</span>
                      <span className="text-moss font-bold text-sm">{apparelProds.length} SKUs</span>
                    </div>
                    <div className="border-l border-sand/20 pl-3">
                      <span className="text-linen/40 text-[10px] block uppercase">Inventory</span>
                      <span className="text-linen/80 font-bold text-sm">{apparelProds.reduce((acc, p) => acc + (Number(p.stock) || 0), 0)} Units</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded font-bold transition ${
                  inventoryCategoryTab === "APPAREL"
                    ? "bg-amber-500 text-black font-black shadow"
                    : "bg-stone-800/80 text-linen/60 border border-sand/15"
                }`}>
                  {inventoryCategoryTab === "APPAREL" ? "Active" : "View"}
                </span>
              </button>

              {/* SECTION 2: FOOTWEAR */}
              <button
                type="button"
                onClick={() => setInventoryCategoryTab(inventoryCategoryTab === "FOOTWEAR" ? "ALL" : "FOOTWEAR")}
                className={`p-4 rounded-xl border text-left transition flex items-start justify-between cursor-pointer ${
                  inventoryCategoryTab === "FOOTWEAR"
                    ? "bg-stone-800/95 border-amber-500 ring-2 ring-amber-500/40 shadow-xl"
                    : "bg-ink border-sand/20 hover:border-sand/40 hover:bg-stone-900/60"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30">
                      <Footprints className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <span className="font-serif font-bold text-base text-[#FAF9F5] block leading-tight">Footwear Section</span>
                      <span className="text-[10px] font-mono text-linen/40 uppercase tracking-wider">Sneakers & Runners</span>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center gap-3 text-xs font-mono border-t border-sand/10">
                    <div>
                      <span className="text-linen/40 text-[10px] block uppercase">Designs</span>
                      <span className="text-moss font-bold text-sm">{footwearProds.length} SKUs</span>
                    </div>
                    <div className="border-l border-sand/20 pl-3">
                      <span className="text-linen/40 text-[10px] block uppercase">Inventory</span>
                      <span className="text-linen/80 font-bold text-sm">{footwearProds.reduce((acc, p) => acc + (Number(p.stock) || 0), 0)} Units</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded font-bold transition ${
                  inventoryCategoryTab === "FOOTWEAR"
                    ? "bg-amber-500 text-black font-black shadow"
                    : "bg-stone-800/80 text-linen/60 border border-sand/15"
                }`}>
                  {inventoryCategoryTab === "FOOTWEAR" ? "Active" : "View"}
                </span>
              </button>

              {/* SECTION 3: ACCESSORIES */}
              <button
                type="button"
                onClick={() => setInventoryCategoryTab(inventoryCategoryTab === "ACCESSORIES" ? "ALL" : "ACCESSORIES")}
                className={`p-4 rounded-xl border text-left transition flex items-start justify-between cursor-pointer ${
                  inventoryCategoryTab === "ACCESSORIES"
                    ? "bg-stone-800/95 border-amber-500 ring-2 ring-amber-500/40 shadow-xl"
                    : "bg-ink border-sand/20 hover:border-sand/40 hover:bg-stone-900/60"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30">
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <span className="font-serif font-bold text-base text-[#FAF9F5] block leading-tight">Accessories Section</span>
                      <span className="text-[10px] font-mono text-linen/40 uppercase tracking-wider">Bags & Leather Goods</span>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center gap-3 text-xs font-mono border-t border-sand/10">
                    <div>
                      <span className="text-linen/40 text-[10px] block uppercase">Designs</span>
                      <span className="text-moss font-bold text-sm">{accessoriesProds.length} SKUs</span>
                    </div>
                    <div className="border-l border-sand/20 pl-3">
                      <span className="text-linen/40 text-[10px] block uppercase">Inventory</span>
                      <span className="text-linen/80 font-bold text-sm">{accessoriesProds.reduce((acc, p) => acc + (Number(p.stock) || 0), 0)} Units</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded font-bold transition ${
                  inventoryCategoryTab === "ACCESSORIES"
                    ? "bg-amber-500 text-black font-black shadow"
                    : "bg-stone-800/80 text-linen/60 border border-sand/15"
                }`}>
                  {inventoryCategoryTab === "ACCESSORIES" ? "Active" : "View"}
                </span>
              </button>
            </div>

            {/* Quick Section Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-ink p-2.5 rounded-xl border border-sand/20 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-linen/40 text-[10px] uppercase font-bold px-1">Active Section:</span>
                <button
                  type="button"
                  onClick={() => setInventoryCategoryTab("ALL")}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                    inventoryCategoryTab === "ALL"
                      ? "bg-amber-500 text-black shadow font-bold"
                      : "bg-stone-800 text-linen/70 hover:text-white hover:bg-stone-700"
                  }`}
                >
                  All Products ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInventoryCategoryTab("APPAREL")}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                    inventoryCategoryTab === "APPAREL"
                      ? "bg-amber-500 text-black shadow font-bold"
                      : "bg-stone-800 text-linen/70 hover:text-white hover:bg-stone-700"
                  }`}
                >
                  <Shirt className="w-3.5 h-3.5" />
                  <span>Apparel ({apparelProds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInventoryCategoryTab("FOOTWEAR")}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                    inventoryCategoryTab === "FOOTWEAR"
                      ? "bg-amber-500 text-black shadow font-bold"
                      : "bg-stone-800 text-linen/70 hover:text-white hover:bg-stone-700"
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>Footwear ({footwearProds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInventoryCategoryTab("ACCESSORIES")}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                    inventoryCategoryTab === "ACCESSORIES"
                      ? "bg-amber-500 text-black shadow font-bold"
                      : "bg-stone-800 text-linen/70 hover:text-white hover:bg-stone-700"
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Accessories ({accessoriesProds.length})</span>
                </button>
              </div>

              <span className="text-[11px] text-linen/40 pr-2 hidden md:inline">
                Showing {displayProducts.length} of {products.length} catalog items
              </span>
            </div>

            {/* Bulk Editing Drawer */}
            {isBulkEditing && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                onSubmit={handleBulkEditSubmit}
                className="bg-ink border border-sand/20 rounded-xl p-5 space-y-4 text-xs"
                id="bulk-edit-form-panel"
              >
                <div className="flex items-center justify-between pb-2 border-b border-sand/20">
                  <span className="font-mono uppercase tracking-wider font-bold text-amber-500">Bulk Category Editor Engine</span>
                  <button type="button" onClick={() => setIsBulkEditing(false)} className="text-linen/50 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {bulkSuccessMsg && (
                  <div className="p-3 bg-moss/75 border border-moss/30 text-moss/80 rounded">
                    {bulkSuccessMsg}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-linen/40 font-mono uppercase">Target Category</label>
                    <select
                      value={bulkCategory}
                      onChange={(e) => setBulkCategory(e.target.value)}
                      className="w-full bg-ink border border-sand/20 p-2 rounded text-xs text-linen/60 focus:outline-none focus:border-moss/30"
                    >
                      <option value="Loomed Shirts">Loomed Shirts</option>
                      <option value="Loomed Pants">Loomed Pants</option>
                      <option value="Artisan Robes">Artisan Robes</option>
                      <option value="Artisan Coats">Artisan Coats</option>
                      <option value="Shirt & Pant Combo">Shirt & Pant Combo</option>
                      <option value="LOOMED CO-ORD SETS">Loomed Co-ord Sets</option>
                      <option value="SHIRT & TROUSER COMBO">Shirt & Trouser Combo</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-linen/40 font-mono uppercase">Category Discount (%)</label>
                    <input
                      type="number"
                      placeholder="e.g. 10 for 10% off"
                      value={bulkDiscount}
                      onChange={(e) => setBulkDiscount(e.target.value)}
                      className="w-full bg-ink border border-sand/20 p-2 rounded text-xs text-linen/60 focus:outline-none focus:border-moss/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-linen/40 font-mono uppercase">Price Multiplier</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 1.05 to increase 5%"
                      value={bulkMultiplier}
                      onChange={(e) => setBulkMultiplier(e.target.value)}
                      className="w-full bg-ink border border-sand/20 p-2 rounded text-xs text-linen/60 focus:outline-none focus:border-moss/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-linen/40 font-mono uppercase">Inject Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. summer-sale"
                      value={bulkAddTagInput}
                      onChange={(e) => setBulkAddTagInput(e.target.value)}
                      className="w-full bg-ink border border-sand/20 p-2 rounded text-xs text-linen/60 focus:outline-none focus:border-moss/30"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-moss hover:bg-moss-hover text-xs font-mono uppercase font-bold rounded"
                  >
                    Apply Bulk Modifications
                  </button>
                </div>
              </motion.form>
            )}

            {/* Low stock visual warnings header list */}
            {products.some(p => p.stock <= 5) && (
              <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Immediate Stock Attention Required:</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {products.filter(p => p.stock <= 5).map(p => (
                      <span key={p.id} className="bg-amber-950/80 border border-amber-900/60 px-2 py-0.5 rounded font-mono text-[10px]">
                        {p.name} ({p.stock} units)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Search filter panel */}
            <div className="flex bg-ink border border-sand/20 rounded-xl px-3 py-2 items-center gap-3">
              <Search className="w-4 h-4 text-linen/50" />
              <input
                type="text"
                placeholder="Query name, category, or traveler tag..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="bg-transparent w-full focus:outline-none text-xs text-linen/80 placeholder-stone-500"
              />
            </div>

            {/* Products grid / List directory */}
            <div className="bg-ink border border-sand/20 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <DndContext
                  sensors={dndSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => handleProductDragEnd(e, displayProducts)}
                >
                  <table className="w-full text-left text-xs" id="admin-products-table">
                    <thead>
                      <tr className="bg-ink text-linen/40 font-mono uppercase tracking-wider border-b border-sand/20/60 font-bold">
                        <th className="p-4 text-center">Seq / Rank</th>
                        <th className="p-4">Apparel Design</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Sizes & Colors</th>
                        <th className="p-4">Inventory Reserves</th>
                        <th className="p-4 text-center">Telemetry Actions</th>
                      </tr>
                    </thead>
                    <SortableContext
                      items={displayProducts.map((p) => String(p.id || (p as any).ID || (p as any)._id))}
                      strategy={verticalListSortingStrategy}
                    >
                      <tbody className="divide-y divide-stone-800/80">
                        {displayProducts.map((p, pIdx) => (
                          <SortableProductRow
                            key={String(p.id || (p as any).ID || (p as any)._id)}
                            p={p}
                            pIdx={pIdx}
                            displayProductsLength={displayProducts.length}
                            inventoryCategoryTab={inventoryCategoryTab}
                            localProductsLength={localProducts.length}
                            editingSeqId={editingSeqId}
                            tempSeqVal={tempSeqVal}
                            setEditingSeqId={setEditingSeqId}
                            setTempSeqVal={setTempSeqVal}
                            handleMoveProductInCatalog={handleMoveProductInCatalog}
                            handleSequenceDirectChange={handleSequenceDirectChange}
                            getDirectImageUrl={getDirectImageUrl}
                            setSelectedParentProduct={setSelectedParentProduct}
                            setIsVariantOpen={setIsVariantOpen}
                            setSelectedProductForReviews={setSelectedProductForReviews}
                            setIsReviewFormOpen={setIsReviewFormOpen}
                            setEditingReviewItem={setEditingReviewItem}
                            setReviewActionSuccess={setReviewActionSuccess}
                            fetchProductReviews={fetchProductReviews}
                            setReorderingImagesProd={setReorderingImagesProd}
                            setMockCompressedInfo={setMockCompressedInfo}
                            setReleaseType={setReleaseType}
                            setEditingProduct={setEditingProduct}
                            setProductForm={setProductForm}
                            setIsAddOpen={setIsAddOpen}
                            setProductVariants={setProductVariants}
                            setDeleteProductId={setDeleteProductId}
                          />
                        ))}
                      </tbody>
                    </SortableContext>
                  </table>
                </DndContext>
              </div>
            </div>
          </div>
        );
      })()}

        {/* ==================== TAB 3: ORDER PROCESSING & FULFILLMENT ==================== */}
        {activeTab === "orders" && (
          <div className="space-y-6" id="admin-view-orders">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold">Fulfillment Control Center</h2>
                <p className="text-xs text-linen/40 mt-0.5">Track shipment statuses, print labels, or log customer returns.</p>
              </div>
              <div className="flex flex-wrap gap-2 bg-ink border border-sand/20 p-1.5 rounded-xl">
                {(["All", "Processing", "Shipped", "Delivered", "Cancelled Payments"] as const).map(st => {
                  const isSelected = orderFilter === st;
                  const isCancelledTab = st === "Cancelled Payments";
                  const cancelledCount = orders.filter(
                    o => o.paymentStatus === "Payment Canceled" || o.paymentStatus === "Payment Cancelled" || o.status === "Cancelled" || (Array.isArray(o.tags) && o.tags.includes("payment canceled"))
                  ).length;

                  return (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected 
                          ? isCancelledTab
                            ? "bg-red-950 text-red-400 font-bold border border-red-800/60 shadow-xs"
                            : "bg-moss text-moss font-bold border border-moss/30" 
                          : isCancelledTab
                            ? "text-red-400/80 hover:text-red-400 hover:bg-red-950/30"
                            : "text-linen/40 hover:text-white"
                      }`}
                    >
                      <span>{st}</span>
                      {isCancelledTab && (
                        <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                          cancelledCount > 0 ? "bg-red-900/90 text-white" : "bg-stone-800 text-linen/40"
                        }`}>
                          {cancelledCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Order search block */}
            <div className="flex bg-ink border border-sand/20 rounded-xl px-3 py-2 items-center gap-3">
              <Search className="w-4 h-4 text-linen/50" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, Mobile Number, Email, or City..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="bg-transparent w-full focus:outline-none text-xs text-linen/80 placeholder-stone-500"
              />
            </div>

            {/* Orders listing table */}
            <div className="bg-ink border border-sand/20 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" id="admin-orders-table">
                  <thead>
                    <tr className="bg-stone-900 text-linen/40 font-mono uppercase tracking-wider border-b border-sand/20 font-bold">
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Customer & Mobile No.</th>
                      <th className="p-3.5">Order Amount</th>
                      <th className="p-3.5">Payment Status</th>
                      <th className="p-3.5">Order Date</th>
                      <th className="p-3.5 text-center">Order Details</th>
                      <th className="p-3.5 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {orders
                      .filter(o => {
                        if (orderFilter === "All") return true;
                        if (orderFilter === "Cancelled Payments") {
                          return (
                            o.paymentStatus === "Payment Canceled" ||
                            o.paymentStatus === "Payment Cancelled" ||
                            o.status === "Cancelled" ||
                            (Array.isArray(o.tags) && o.tags.includes("payment canceled"))
                          );
                        }
                        return o.status === orderFilter;
                      })
                      .filter(o => {
                        const q = orderSearch.toLowerCase().trim();
                        if (!q) return true;
                        const phone = getOrderPhone(o).toLowerCase();
                        const id = (o.id || "").toLowerCase();
                        const name = (o.customerName || "").toLowerCase();
                        const email = (o.customerEmail || "").toLowerCase();
                        const city = (o.shippingAddress?.city || "").toLowerCase();
                        const state = (o.shippingAddress?.state || "").toLowerCase();
                        return id.includes(q) || name.includes(q) || email.includes(q) || phone.includes(q) || city.includes(q) || state.includes(q);
                      })
                      .map((o, oIdx) => {
                        const isApproved = o.paymentStatus === "Approved" || o.paymentStatus === "Paid";
                        const isRejected = o.paymentStatus === "Rejected";
                        const isPaymentCanceled = 
                          o.paymentStatus === "Payment Canceled" || 
                          o.paymentStatus === "Payment Cancelled" ||
                          o.status === "Cancelled" ||
                          (Array.isArray(o.tags) && o.tags.includes("payment canceled"));

                        return (
                          <tr key={`${o.id}-${oIdx}`} className="hover:bg-ink/45 transition">
                            {/* Order ID & Tag */}
                            <td className="p-3.5 font-mono">
                              <div className="flex flex-col gap-1 items-start">
                                <span className="font-bold text-moss block">{o.id}</span>
                                <span className="text-[10px] text-linen/40 block">{o.paymentMethod || "Online"}</span>
                                {(isPaymentCanceled || (Array.isArray(o.tags) && o.tags.includes("payment canceled"))) && (
                                   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800/60 shadow-xs">
                                    <AlertTriangle className="w-3 h-3 text-red-400" />
                                    payment canceled
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Customer Name & Mobile */}
                            <td className="p-3.5">
                              <span className="font-serif font-bold text-[#FAF9F5] block text-sm">{o.customerName || "Customer"}</span>
                              <span className="text-[11px] text-linen/50 block font-mono">{o.customerEmail || "No email"}</span>
                              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold mt-1.5 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 w-fit">
                                <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>{getOrderPhone(o)}</span>
                              </div>
                            </td>

                            {/* Order Amount */}
                            <td className="p-3.5 font-mono">
                              <span className="text-sm font-bold text-linen/90 block">₹{Math.round(o.total || 0).toLocaleString("en-IN")}</span>
                              <span className="text-[10px] text-linen/40 block">{(o.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0)} Items</span>
                            </td>

                            {/* Payment Status (With options to Approve and Reject) */}
                            <td className="p-3.5">
                              <div className="space-y-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                    isApproved
                                      ? "bg-moss/20 text-moss border border-moss/30"
                                      : isPaymentCanceled
                                      ? "bg-red-950/80 text-red-400 border border-red-800/60"
                                      : isRejected
                                      ? "bg-red-950/40 text-red-400 border border-red-900/30"
                                      : "bg-amber-950/40 text-amber-400 border border-amber-900/30"
                                  }`}
                                >
                                  {isApproved ? (
                                    <CheckCircle2 className="w-3 h-3 text-moss" />
                                  ) : isPaymentCanceled ? (
                                    <AlertTriangle className="w-3 h-3 text-red-400" />
                                  ) : isRejected ? (
                                    <XCircle className="w-3 h-3 text-red-400" />
                                  ) : (
                                    <Clock className="w-3 h-3 text-amber-400" />
                                  )}
                                  <span>{o.paymentStatus || "Pending"}</span>
                                </span>

                                {/* Admin Action Options to Approve & Reject Payment Status */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOrderPaymentStatusUpdate(o.id, "Approved")}
                                    disabled={o.paymentStatus === "Approved"}
                                    title="Approve Payment Status"
                                    className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded border transition cursor-pointer ${
                                      o.paymentStatus === "Approved"
                                        ? "opacity-40 cursor-not-allowed bg-stone-800 text-linen/40 border-stone-700"
                                        : "bg-moss/20 hover:bg-moss/30 text-moss border-moss/40"
                                    }`}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOrderPaymentStatusUpdate(o.id, "Rejected")}
                                    disabled={o.paymentStatus === "Rejected"}
                                    title="Reject Payment Status"
                                    className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded border transition cursor-pointer ${
                                      o.paymentStatus === "Rejected"
                                        ? "opacity-40 cursor-not-allowed bg-stone-800 text-linen/40 border-stone-700"
                                        : "bg-red-950/40 hover:bg-red-900/40 text-red-400 border-red-900/40"
                                    }`}
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Order Date */}
                            <td className="p-3.5 font-mono text-linen/70 whitespace-nowrap">
                              <div>{new Date(o.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                              <div className="text-[10px] text-linen/40 mt-0.5">
                                {new Date(o.date).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>

                            {/* Order Details Button */}
                            <td className="p-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => setSelectedOrderDetails(o)}
                                className="px-3 py-1.5 bg-ink hover:bg-sand/15 border border-sand/20 hover:border-moss/40 text-linen/80 hover:text-white rounded-lg text-xs font-mono transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                                title="View Complete Order Details"
                              >
                                <Eye className="w-3.5 h-3.5 text-moss" />
                                <span>Order Details</span>
                              </button>
                            </td>

                            {/* Delete Button (Delete icon) */}
                            <td className="p-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setPrintingOrderLabel(o)}
                                  title="Print Packing Label"
                                  className="p-2 bg-ink hover:bg-sand/15 text-linen/60 hover:text-white rounded-lg border border-sand/20 transition cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5 text-moss" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeleteOrderConfirmId(o.id)}
                                  title="Delete Order"
                                  className="p-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded-lg border border-red-900/40 hover:border-red-700 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3.5: CUSTOMER REVIEWS MANAGEMENT ==================== */}
        {activeTab === "reviews" && (
          <div className="space-y-6" id="admin-view-reviews">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold">Review Moderation Console</h2>
                <p className="text-xs text-linen/40 mt-0.5">View, approve, reject, or manage customer product feedback and ratings.</p>
              </div>
              <button
                onClick={fetchReviews}
                className="px-4 py-2 bg-ink hover:bg-sand/15 text-xs font-mono uppercase tracking-wider font-bold rounded-lg border border-sand/20 transition flex items-center gap-1.5 cursor-pointer text-linen"
              >
                <RefreshCw className="w-4 h-4 text-moss" />
                <span>Refresh Reviews</span>
              </button>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-ink border border-sand/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <span className="text-xs font-mono uppercase text-linen/50 font-bold whitespace-nowrap">Filter Status:</span>
                {["All", "Pending", "Approved", "Rejected"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReviewStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                      reviewStatusFilter === st
                        ? "bg-moss text-white font-bold"
                        : "bg-stone-900 text-linen/60 hover:text-white border border-sand/20"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-linen/40" />
                <input
                  type="text"
                  placeholder="Search reviews by name or text..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="w-full bg-stone-900 border border-sand/20 rounded-lg pl-9 pr-3 py-1.5 text-xs text-linen focus:outline-none focus:border-moss"
                />
              </div>
            </div>

            {/* Reviews List / Table */}
            <div className="bg-ink border border-sand/20 rounded-xl overflow-hidden shadow-xl">
              {isFetchingReviews ? (
                <div className="p-12 text-center text-xs font-mono text-linen/40 animate-pulse">
                  Retrieving review records...
                </div>
              ) : adminReviews.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-linen/20 mx-auto" />
                  <p className="text-sm font-serif text-linen/60">No reviews matching status filter "{reviewStatusFilter}".</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs" id="admin-reviews-table">
                    <thead>
                      <tr className="bg-stone-900 text-linen/40 font-mono uppercase tracking-wider border-b border-sand/20 font-bold">
                        <th className="p-4">Product Details</th>
                        <th className="p-4">Customer Info</th>
                        <th className="p-4">Rating & Review</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {adminReviews
                        .filter(r => !reviewSearch || (r.userName || "").toLowerCase().includes(reviewSearch.toLowerCase()) || (r.comment || "").toLowerCase().includes(reviewSearch.toLowerCase()) || (r.productName || "").toLowerCase().includes(reviewSearch.toLowerCase()))
                        .map((rev, rIdx) => (
                          <tr key={rev.id ? `${rev.id}-${rIdx}` : `admin-rev-row-${rIdx}`} className="hover:bg-stone-900/50 transition">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {rev.productImage && (
                                  <img src={getDirectImageUrl(rev.productImage)} alt="" className="w-10 h-10 object-cover rounded border border-sand/20" />
                                )}
                                <div>
                                  <span className="font-bold text-linen block">{rev.productName || rev.productId}</span>
                                  <span className="text-[10px] text-linen/40 font-mono">ID: {rev.productId}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-white block">{rev.userName}</span>
                              {rev.userEmail && <span className="text-[10px] text-linen/40 block">{rev.userEmail}</span>}
                            </td>
                            <td className="p-4 max-w-sm">
                              <div className="flex items-center gap-1 text-amber-400 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-700"}`}
                                  />
                                ))}
                                <span className="text-xs font-mono font-bold text-linen ml-1">{rev.rating}/5</span>
                              </div>
                              <p className="text-xs text-linen/80 italic leading-relaxed">"{rev.comment}"</p>
                            </td>
                            <td className="p-4 text-linen/50 font-mono text-[11px] whitespace-nowrap">
                              {rev.date}
                            </td>
                            <td className="p-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider font-bold ${
                                rev.status === "Approved"
                                  ? "bg-moss/20 text-moss border border-moss/30"
                                  : rev.status === "Rejected"
                                  ? "bg-red-950/40 text-red-400 border border-red-900/50"
                                  : "bg-amber-950/40 text-amber-400 border border-amber-900/50"
                              }`}>
                                {rev.status}
                              </span>
                            </td>
                            <td className="p-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                {rev.status !== "Approved" && (
                                  <button
                                    onClick={() => handleUpdateReviewStatus(rev.id, "Approved")}
                                    className="px-2.5 py-1 bg-moss/20 hover:bg-moss/40 text-moss border border-moss/30 rounded text-[10px] font-mono uppercase tracking-wider cursor-pointer font-bold"
                                  >
                                    Approve
                                  </button>
                                )}
                                {rev.status !== "Rejected" && (
                                  <button
                                    onClick={() => handleUpdateReviewStatus(rev.id, "Rejected")}
                                    className="px-2.5 py-1 bg-amber-950/30 hover:bg-amber-900/50 text-amber-400 border border-amber-900/40 rounded text-[10px] font-mono uppercase tracking-wider cursor-pointer font-bold"
                                  >
                                    Reject
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteReview(rev.id)}
                                  className="p-1.5 bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/40 rounded cursor-pointer"
                                  title="Delete Review"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: CUSTOMER DATA & SUPPORT (CRM) ==================== */}
        {activeTab === "crm" && (
          <div className="space-y-6" id="admin-view-crm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold">Seeker Directory (CRM)</h2>
                <p className="text-xs text-linen/40 mt-0.5">Understand your buyers: lifetime values (LTV), segment tags, and sizes preference mappings.</p>
              </div>
              <button
                onClick={loadCrmCustomers}
                className="px-4 py-2 bg-ink hover:bg-sand/15 text-xs font-mono uppercase tracking-wider font-bold rounded-lg border border-sand/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-moss" />
                <span>Sync Directory</span>
              </button>
            </div>

            {/* Filter */}
            <div className="flex bg-ink border border-sand/20 rounded-xl px-3 py-2 items-center gap-3">
              <Search className="w-4 h-4 text-linen/50" />
              <input
                type="text"
                placeholder="Query seeker name, email, or segment tags..."
                value={crmSearch}
                onChange={(e) => setCrmSearch(e.target.value)}
                className="bg-transparent w-full focus:outline-none text-xs text-linen/80 placeholder-stone-500"
              />
            </div>

            {isCrmLoading ? (
              <div className="bg-ink/60 p-12 text-center rounded-xl animate-pulse text-linen/40 text-xs font-mono">
                Compiling customer profiles ledger...
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="crm-layout-grid">
                
                {/* Seeker List */}
                <div className="lg:col-span-2 bg-ink border border-sand/20 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-sand/20/60 bg-ink flex justify-between items-center">
                    <span className="text-xs font-mono uppercase tracking-wider font-bold">Seeker Registry</span>
                    <span className="text-[10px] font-mono text-linen/50">{customers.length} registered profiles</span>
                  </div>
                  <div className="divide-y divide-stone-800 max-h-[480px] overflow-y-auto">
                    {customers
                      .filter(c => (c.name || "").toLowerCase().includes(crmSearch.toLowerCase()) || (c.email || "").toLowerCase().includes(crmSearch.toLowerCase()) || (c.tags || []).some((t: string) => (t || "").toLowerCase().includes(crmSearch.toLowerCase())))
                      .map(c => {
                        const isSelected = selectedCustomer?.email === c.email;
                        return (
                          <div
                            key={c.id}
                            onClick={() => setSelectedCustomer(c)}
                            className={`p-4 flex items-center justify-between transition cursor-pointer ${
                              isSelected ? "bg-stone-800/60" : "hover:bg-sand/15/30"
                            }`}
                          >
                            <div className="space-y-1 max-w-[70%]">
                              <span className="font-serif font-bold text-linen block text-sm">{c.name}</span>
                              <span className="text-[11px] text-linen/40 font-mono block">{c.email}</span>
                              
                              {/* Tags rendering */}
                              <div className="flex flex-wrap gap-1 pt-1">
                                {c.tags.map((tag: string) => (
                                  <span
                                    key={tag}
                                    className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-mono font-bold ${
                                      tag === "VIP" ? "bg-amber-950 text-amber-400 border border-amber-900/30" :
                                      tag === "Guest" ? "bg-ink text-linen/40" :
                                      "bg-moss text-moss border border-moss/30"
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="text-right font-mono text-xs">
                              <span className="text-moss font-bold block">₹{Math.round(c.lifetimeValue || 0).toLocaleString("en-IN")}</span>
                              <span className="text-[10px] text-linen/50 block">{c.totalOrders} order journeys</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Seeker Profile Card detail view */}
                <div className="bg-ink border border-sand/20 rounded-xl p-5 space-y-6" id="crm-profile-detail-panel">
                  {selectedCustomer ? (
                    <div className="space-y-5">
                      <div className="pb-4 border-b border-sand/20 space-y-1">
                        <span className="text-[9px] uppercase font-mono tracking-widest text-moss font-bold block">Consolidated profile</span>
                        <h4 className="font-serif text-lg font-bold text-[#FAF9F5]">{selectedCustomer.name}</h4>
                        <span className="text-xs text-linen/40 block font-mono">{selectedCustomer.email}</span>
                      </div>

                      {/* Financial analytics details */}
                      <div className="grid grid-cols-2 gap-4 bg-ink p-3 rounded-lg border border-sand/20/60 font-mono text-xs">
                        <div>
                          <span className="text-[9px] text-linen/50 block">LIFETIME VALUE</span>
                          <span className="text-moss font-bold text-sm">₹{Math.round(selectedCustomer.lifetimeValue || 0).toLocaleString("en-IN")}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-linen/50 block">AVERAGE TICKET (AOV)</span>
                          <span className="text-linen/60 font-bold text-sm">₹{Math.round(selectedCustomer.averageOrderValue || 0).toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      {/* Preference mapping */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-linen/50 font-mono uppercase tracking-wider block">Sizing Preferences</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCustomer.preferredSizes?.length > 0 ? (
                            selectedCustomer.preferredSizes.map((s: string) => (
                              <span key={s} className="bg-ink border border-sand/20 px-2 py-0.5 rounded text-xs font-mono text-linen/60">{s}</span>
                            ))
                          ) : (
                            <span className="text-xs text-linen/50 italic">No purchase sizes registered yet</span>
                          )}
                        </div>
                      </div>

                      {/* Segmentation control panel */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-linen/50 font-mono uppercase tracking-wider block">Fulfillment segments</span>
                        {editingTagsEmail === selectedCustomer.email ? (
                          <div className="space-y-2">
                            <div className="flex gap-1">
                              <input
                                type="text"
                                placeholder="Add tag..."
                                value={newTagInput}
                                onChange={(e) => setNewTagInput(e.target.value)}
                                className="bg-ink border border-sand/20 text-xs text-linen/80 p-1.5 rounded focus:outline-none w-full placeholder-stone-600"
                              />
                              <button
                                onClick={() => {
                                  if (newTagInput.trim()) {
                                    const updatedTags = [...selectedCustomer.tags, newTagInput.trim()];
                                    setSelectedCustomer({ ...selectedCustomer, tags: updatedTags });
                                    setNewTagInput("");
                                  }
                                }}
                                className="px-2 py-1 bg-moss hover:bg-moss-hover text-[10px] font-mono rounded"
                              >
                                +
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {(selectedCustomer.tags || []).map((tag: string) => (
                                <button
                                  key={tag}
                                  onClick={() => {
                                    const filtered = selectedCustomer.tags.filter((t: string) => t !== tag);
                                    setSelectedCustomer({ ...selectedCustomer, tags: filtered });
                                  }}
                                  className="px-1.5 py-0.5 rounded text-[8px] bg-red-950/40 text-red-400 hover:bg-red-900/30 transition flex items-center gap-1 font-mono font-bold"
                                >
                                  <span>{tag}</span>
                                  <span>×</span>
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                onClick={() => setEditingTagsEmail(null)}
                                className="px-2.5 py-1 text-linen/40 hover:text-white text-[10px] font-mono"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveCustomerTags(selectedCustomer.email, selectedCustomer.tags)}
                                className="px-3 py-1 bg-moss hover:bg-moss-hover text-xs text-[#FAF9F5] font-mono rounded font-bold"
                              >
                                Save Tags
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div className="flex flex-wrap gap-1">
                              {(selectedCustomer.tags || []).map((tag: string) => (
                                <span key={tag} className="bg-ink border border-sand/20 px-2 py-0.5 rounded text-[9px] font-mono text-linen/40">{tag}</span>
                              ))}
                            </div>
                            <button
                              onClick={() => setEditingTagsEmail(selectedCustomer.email)}
                              className="text-moss hover:text-moss/80 text-xs font-mono font-bold"
                            >
                              Edit Tags
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Shipment support / troubleshooting block */}
                      <div className="pt-4 border-t border-sand/20 space-y-3">
                        <span className="text-[10px] text-linen/40 uppercase font-mono tracking-wider block">Fulfillment Support Portal</span>
                        <p className="text-[11px] text-linen/50 leading-relaxed">Instantly verify support tickets or troubleshoot shipment tracking histories.</p>
                        
                        <div className="space-y-1.5">
                          {orders.filter(o => o.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase()).map((o, oIdx) => (
                            <div key={`${o.id}-${oIdx}`} className="p-2 bg-ink border border-sand/20 rounded flex justify-between items-center text-xs">
                              <div>
                                <span className="font-mono text-linen/60 block font-bold">{o.id}</span>
                                <span className={`text-[9px] uppercase font-mono ${
                                  o.status === "Delivered" ? "text-linen0" : "text-amber-500"
                                }`}>{o.status}</span>
                              </div>
                              <span className="font-mono text-linen/40">{o.trackingNumber || "No Tracking Code"}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-20 text-linen/50 text-xs font-mono flex flex-col items-center justify-center space-y-3">
                      <HelpCircle className="w-8 h-8 text-ink animate-pulse" />
                      <span>Select a customer seeker from registry to pull detailed metrics card.</span>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}
        {/* ==================== TAB 5: STOREFRONT CMS CONTROLS ==================== */}
        {activeTab === "cms" && (
          <div className="space-y-6" id="admin-view-cms">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold">Storefront Layout CMS Control</h2>
                <p className="text-xs text-linen/40 mt-0.5">Edit active top-bar promo announcements, update homepage hero content, and featured collection pins.</p>
              </div>
            </div>

            {/* CMS Sub navigation tabs */}
            <div className="flex border-b border-sand/20 gap-6 pb-2.5 max-w-2xl" id="cms-sub-navigation">
              <button
                type="button"
                onClick={() => setCmsSubTab("general")}
                className={`pb-2 px-1 text-xs font-mono uppercase tracking-wider border-b-2 transition cursor-pointer ${
                  cmsSubTab === "general" 
                    ? "border-moss text-moss font-bold" 
                    : "border-transparent text-linen/50 hover:text-white"
                }`}
              >
                General Parameters
              </button>
              <button
                type="button"
                onClick={() => setCmsSubTab("categories")}
                className={`pb-2 px-1 text-xs font-mono uppercase tracking-wider border-b-2 transition cursor-pointer ${
                  cmsSubTab === "categories" 
                    ? "border-moss text-moss font-bold" 
                    : "border-transparent text-linen/50 hover:text-white"
                }`}
                id="edit-shop-by-category-btn"
              >
                edit shop by catagory
              </button>
              <button
                type="button"
                onClick={() => setCmsSubTab("whatsapp")}
                className={`pb-2 px-1 text-xs font-mono uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  cmsSubTab === "whatsapp" 
                    ? "border-emerald-500 text-emerald-400 font-bold" 
                    : "border-transparent text-linen/50 hover:text-white"
                }`}
                id="whatsapp-controller-tab"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp Controller
              </button>
            </div>

            {cmsSuccess && (
              <div className="p-4 bg-moss/70 border border-moss/30 text-moss/80 rounded-lg text-xs">
                {cmsSuccess}
              </div>
            )}

            <div className="max-w-2xl" id="cms-grid-panel">
              {cmsSubTab === "general" ? (
                /* Form editing variables */
                <form onSubmit={handleCmsSubmit} className="bg-ink border border-sand/20 rounded-xl p-5 space-y-4 text-xs" id="cms-editor-form">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold block pb-2 border-b border-sand/20">Layout variable parameters</span>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-linen/40 font-mono uppercase">Top Announcement messaging</label>
                    <input
                      type="text"
                      required
                      value={cmsForm.announcementText}
                      onChange={(e) => updateCmsForm({ ...cmsForm, announcementText: e.target.value })}
                      className="w-full bg-ink border border-sand/20 p-2.5 rounded text-linen/80 focus:outline-none focus:border-moss/30"
                      placeholder="e.g. Free shipping on loomed shirts..."
                    />
                    <span className="text-[9px] text-linen/50 font-mono block">Max length suggested: 80 chars.</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-linen/40 font-mono uppercase">Editorial Hero image URL(s) (Desktop - 16:9 / 16:10)</label>
                      <label className="text-[9px] text-[#B5652F] hover:text-white uppercase tracking-wider font-bold cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>{isHeroDesktopUploading ? "Uploading..." : "Upload New Image"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleHeroImageUpload(e, "heroImageUrl")}
                          className="hidden"
                          disabled={isHeroDesktopUploading}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={cmsForm.heroImageUrl}
                      onChange={(e) => updateCmsForm({ ...cmsForm, heroImageUrl: e.target.value })}
                      className="w-full bg-ink border border-sand/20 p-2.5 rounded text-linen/80 focus:outline-none focus:border-moss/30 text-xs"
                      placeholder="Enter image URL or multiple URLs separated by commas..."
                    />
                    <span className="text-[9px] text-linen/50 font-mono block">Separate multiple URLs with commas to run a smooth slideshow. Or upload using the link above.</span>
                    {cmsForm.heroImageUrl && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {cmsForm.heroImageUrl.split(",").map((url, i) => {
                          const trimmed = url.trim();
                          if (!trimmed) return null;
                          return (
                            <div key={i} className="relative w-12 h-12 bg-ink border border-sand/20 rounded overflow-hidden group">
                              <img src={getDirectImageUrl(trimmed) || null} alt="" className="w-full h-full object-cover" />
                              <span className="absolute bottom-0 right-0 bg-black/60 text-[8px] px-1 font-mono text-linen/60">{i + 1}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-linen/40 font-mono uppercase">Editorial Hero image URL(s) (Mobile - 3:4)</label>
                      <label className="text-[9px] text-[#B5652F] hover:text-white uppercase tracking-wider font-bold cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>{isHeroMobileUploading ? "Uploading..." : "Upload New Image"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleHeroImageUpload(e, "heroImageUrlMobile")}
                          className="hidden"
                          disabled={isHeroMobileUploading}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={cmsForm.heroImageUrlMobile}
                      onChange={(e) => setCmsForm({ ...cmsForm, heroImageUrlMobile: e.target.value })}
                      className="w-full bg-ink border border-sand/20 p-2.5 rounded text-linen/80 focus:outline-none focus:border-moss/30 text-xs"
                      placeholder="Leave blank to fallback to desktop/default..."
                    />
                    <span className="text-[9px] text-linen/50 font-mono block">Custom 3:4 image tailored specifically for vertical mobile displays. Separate with commas if using multiple.</span>
                    {cmsForm.heroImageUrlMobile && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {cmsForm.heroImageUrlMobile.split(",").map((url, i) => {
                          const trimmed = url.trim();
                          if (!trimmed) return null;
                          return (
                            <div key={i} className="relative w-12 h-12 bg-ink border border-sand/20 rounded overflow-hidden group">
                              <img src={getDirectImageUrl(trimmed) || null} alt="" className="w-full h-full object-cover" />
                              <span className="absolute bottom-0 right-0 bg-black/60 text-[8px] px-1 font-mono text-linen/60">{i + 1}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-linen/40 font-mono uppercase">Hero Title wordmark</label>
                    <input
                      type="text"
                      required
                      value={cmsForm.heroTitle}
                      onChange={(e) => setCmsForm({ ...cmsForm, heroTitle: e.target.value })}
                      className="w-full bg-ink border border-sand/20 p-2.5 rounded text-linen/80 focus:outline-none focus:border-moss/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-linen/40 font-mono uppercase">Hero Subtitle paragraph narrative</label>
                    <textarea
                      required
                      rows={3}
                      value={cmsForm.heroSubtitle}
                      onChange={(e) => setCmsForm({ ...cmsForm, heroSubtitle: e.target.value })}
                      className="w-full bg-ink border border-sand/20 p-2.5 rounded text-linen/80 focus:outline-none focus:border-moss/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-linen/40 font-mono uppercase">Hero Call-To-Action Text</label>
                    <input
                      type="text"
                      required
                      value={cmsForm.heroCtaText}
                      onChange={(e) => setCmsForm({ ...cmsForm, heroCtaText: e.target.value })}
                      className="w-full bg-ink border border-sand/20 p-2.5 rounded text-linen/80 focus:outline-none focus:border-moss/30"
                    />
                  </div>

                  <div className="pt-3 border-t border-sand/20 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-moss hover:bg-moss-hover text-xs font-mono uppercase font-bold tracking-wider rounded cursor-pointer"
                    >
                      Deploy Layout Instantly
                    </button>
                  </div>
                </form>
              ) : cmsSubTab === "categories" ? (
                /* Categories Custom Editor Form */
                <form onSubmit={handleCmsSubmit} className="bg-ink border border-sand/20 rounded-xl p-5 space-y-6 text-xs animate-fadeIn" id="categories-editor-form">
                  <div className="flex items-center justify-between pb-2 border-b border-sand/20">
                    <span className="text-xs font-mono uppercase tracking-wider font-bold">Edit Shop By Category presentation</span>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-moss hover:bg-moss-hover text-[10px] font-mono uppercase font-bold tracking-wider rounded cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </div>

                  {/* Frame Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-linen/40 font-mono uppercase font-bold">Category Frame Title</label>
                    <input
                      type="text"
                      required
                      value={cmsForm.categoriesTitle || ""}
                      onChange={(e) => setCmsForm({ ...cmsForm, categoriesTitle: e.target.value })}
                      className="w-full bg-ink border border-sand/20 p-2.5 rounded text-linen/80 focus:outline-none focus:border-moss/30"
                      placeholder="e.g. Shop By Category"
                    />
                    <span className="text-[9px] text-linen/50 font-mono block">The editorial title centered above the interactive 3D coverflow carousel.</span>
                  </div>

                  {/* Categories List */}
                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-sand/15 pb-2">
                      <span className="text-xs font-mono uppercase tracking-wider font-bold text-linen/80">Category Carousel Slides ({cmsForm.categories?.length || 0})</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newCat = {
                            id: "cat-" + Date.now(),
                            title: "New Category",
                            description: "Custom style category description text.",
                            image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80",
                            searchKeyword: "new"
                          };
                          setCmsForm({
                            ...cmsForm,
                            categories: [...(cmsForm.categories || []), newCat]
                          });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-moss hover:bg-moss-hover rounded text-[10px] font-mono uppercase font-bold transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Category</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {((cmsForm.categories && cmsForm.categories.length > 0) ? cmsForm.categories : [
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
                        }
                      ]).map((cat: any, idx: number) => {
                        const updateCategoryField = (field: string, val: any) => {
                          const updated = [...(cmsForm.categories || [])];
                          if (updated[idx]) {
                            updated[idx] = { ...updated[idx], [field]: val };
                          } else {
                            const list = [
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
                              }
                            ];
                            list[idx] = { ...list[idx], [field]: val };
                            setCmsForm({ ...cmsForm, categories: list });
                            return;
                          }
                          setCmsForm({ ...cmsForm, categories: updated });
                        };

                        const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          setUploadingCategoryIndices(prev => ({ ...prev, [idx]: true }));
                          
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            if (typeof reader.result === "string") {
                              const base64 = reader.result;
                              const filename = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
                              const targetUrl = `/assets/categories/cat-${Date.now()}-${filename}`;
                              
                              try {
                                const res = await fetch("/api/upload-image", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${authToken}`
                                  },
                                  body: JSON.stringify({ url: targetUrl, base64 })
                                });
                                
                                if (res.ok) {
                                  const data = await res.json();
                                  updateCategoryField("image", data.url || targetUrl);
                                } else {
                                  alert("Failed to upload category image to server.");
                                }
                              } catch (err) {
                                console.error("Error uploading category image:", err);
                                alert("Error uploading category image.");
                              } finally {
                                setUploadingCategoryIndices(prev => ({ ...prev, [idx]: false }));
                              }
                            }
                          };
                          reader.readAsDataURL(file);
                        };

                        const removeCategory = () => {
                          const updated = (cmsForm.categories || []).filter((_, i) => i !== idx);
                          setCmsForm({ ...cmsForm, categories: updated });
                        };

                        return (
                          <div key={cat.id || idx} className="bg-ink/50 border border-sand/15 p-4 rounded-lg space-y-3 relative group/item">
                            <button
                              type="button"
                              onClick={removeCategory}
                              className="absolute top-4 right-4 text-linen/40 hover:text-rose-400 transition cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="flex flex-col sm:flex-row gap-4">
                              {/* Left side: Upload area & Preview */}
                              <div className="w-full sm:w-28 flex flex-col items-center justify-center space-y-2">
                                <div className="w-24 h-32 rounded-md border border-sand/15 bg-ink relative overflow-hidden flex items-center justify-center">
                                  {uploadingCategoryIndices[idx] ? (
                                    <div className="flex flex-col items-center justify-center gap-2">
                                      <RefreshCw className="w-5 h-5 text-[#B5652F] animate-spin" />
                                      <span className="text-[8px] text-linen/40 font-mono">Uploading...</span>
                                    </div>
                                  ) : cat.image ? (
                                    <img src={getDirectImageUrl(cat.image)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <ImageIcon className="w-6 h-6 text-linen/30" />
                                  )}
                                </div>
                                <label className="px-3 py-1.5 bg-sand/15 hover:bg-sand/25 border border-sand/20 rounded font-mono text-[9px] uppercase tracking-wider text-linen cursor-pointer flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3" />
                                  <span>{uploadingCategoryIndices[idx] ? "Uploading..." : "Choose File"}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploadingCategoryIndices[idx]}
                                  />
                                </label>
                                <span className="text-[8px] text-linen/30 text-center font-mono block">Direct file upload</span>
                              </div>

                              {/* Right side: Input fields */}
                              <div className="flex-1 space-y-2.5 col-span-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-linen/40 font-mono uppercase">Category Title</label>
                                    <input
                                      type="text"
                                      required
                                      value={cat.title || ""}
                                      onChange={(e) => updateCategoryField("title", e.target.value)}
                                      className="w-full bg-ink border border-sand/15 p-2 rounded text-linen/80 text-xs focus:outline-none focus:border-moss/30"
                                      placeholder="e.g. Linen Silhouettes"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-linen/40 font-mono uppercase col-span-1">Filter Keyword</label>
                                    <input
                                      type="text"
                                      required
                                      value={cat.searchKeyword || ""}
                                      onChange={(e) => updateCategoryField("searchKeyword", e.target.value)}
                                      className="w-full bg-ink border border-sand/15 p-2 rounded text-linen/80 text-xs focus:outline-none focus:border-moss/30"
                                      placeholder="e.g. linen"
                                    />
                                  </div>
                                </div>

                                {/* Direct Link / Google Drive Link Option */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[9px] text-linen/40 font-mono uppercase font-bold">Category Image Link / Google Drive Link</label>
                                    <span className="text-[8px] text-moss font-mono font-bold">Google Drive Compatible</span>
                                  </div>
                                  <input
                                    type="text"
                                    required
                                    value={cat.image || ""}
                                    onChange={(e) => updateCategoryField("image", e.target.value)}
                                    onBlur={(e) => {
                                      const val = e.target.value.trim();
                                      if (val.includes("drive.google.com") || val.includes("docs.google.com")) {
                                        updateCategoryField("image", getDirectImageUrl(val));
                                      }
                                    }}
                                    className="w-full bg-ink border border-sand/15 p-2 rounded text-linen/80 text-xs font-mono focus:outline-none focus:border-moss/30 placeholder:text-linen/30"
                                    placeholder="Paste Google Drive share link (e.g. https://drive.google.com/file/d/...) or web image URL"
                                  />
                                  <span className="text-[8px] text-linen/40 font-mono block">
                                    Paste direct web URL or Google Drive share link. Drive links automatically convert to embeddable images.
                                  </span>
                                </div>

                                <div className="space-y-1 col-span-2">
                                  <label className="text-[9px] text-linen/40 font-mono uppercase col-span-2">Category Description</label>
                                  <textarea
                                    required
                                    rows={2}
                                    value={cat.description || ""}
                                    onChange={(e) => updateCategoryField("description", e.target.value)}
                                    className="w-full bg-ink border border-sand/15 p-2 rounded text-linen/80 text-xs focus:outline-none focus:border-moss/30 resize-none"
                                    placeholder="e.g. Exquisite organic linen shirts crafted for the nomadic explorer..."
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-sand/20 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-moss hover:bg-moss-hover text-xs font-mono uppercase font-bold tracking-wider rounded cursor-pointer"
                    >
                      Deploy presentation Instantly
                    </button>
                  </div>
                </form>
              ) : cmsSubTab === "whatsapp" ? (
                <form onSubmit={handleCmsSubmit} className="space-y-6" id="whatsapp-cms-controller-form">
                  {/* Header & Status Card */}
                  <div className="bg-ink border border-sand/20 rounded-xl p-5 space-y-4 text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-sand/20">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/50 text-emerald-400">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-sm text-linen">WhatsApp Customer Support Controller</h3>
                          <p className="text-[10px] text-linen/40 font-mono">Manage support contact number, default messaging, and live storefront chat widget.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          cmsForm.whatsappSupportEnabled !== false 
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60" 
                            : "bg-rose-950 text-rose-400 border border-rose-800/60"
                        }`}>
                          {cmsForm.whatsappSupportEnabled !== false ? "● Live Support Active" : "○ Support Disabled"}
                        </span>
                      </div>
                    </div>

                    {/* Main Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Phone Number Input */}
                      <div className="space-y-1.5 md:col-span-1">
                        <label className="text-[10px] text-linen/60 font-mono uppercase font-bold flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          WhatsApp Customer Support Phone
                        </label>
                        <input
                          type="text"
                          required
                          value={cmsForm.whatsappNumber || ""}
                          onChange={(e) => setCmsForm({ ...cmsForm, whatsappNumber: e.target.value })}
                          className="w-full bg-ink/90 border border-sand/30 p-2.5 rounded text-amber-300 font-mono text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          placeholder="e.g. 919999999999 or +91 9876543210"
                        />
                        <span className="text-[9px] text-linen/40 font-mono block">
                          Enter international mobile number with country code (e.g. <strong>919999999999</strong> for India).
                        </span>
                      </div>

                      {/* Support Enabled Toggle */}
                      <div className="space-y-1.5 md:col-span-1 flex flex-col justify-center bg-stone-900/60 p-3 rounded-lg border border-sand/15">
                        <label className="text-[10px] text-linen/60 font-mono uppercase font-bold flex items-center justify-between cursor-pointer">
                          <span>Enable WhatsApp Support</span>
                          <input
                            type="checkbox"
                            checked={cmsForm.whatsappSupportEnabled !== false}
                            onChange={(e) => setCmsForm({ ...cmsForm, whatsappSupportEnabled: e.target.checked })}
                            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                          />
                        </label>
                        <span className="text-[9px] text-linen/40 font-mono">
                          When enabled, WhatsApp chat links appear on storefront & payment timeout modals.
                        </span>
                      </div>

                      {/* Default Pre-filled Message */}
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] text-linen/60 font-mono uppercase font-bold flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3 text-emerald-400" />
                          Default WhatsApp Chat Greeting Message
                        </label>
                        <textarea
                          rows={3}
                          value={cmsForm.whatsappDefaultMessage || ""}
                          onChange={(e) => setCmsForm({ ...cmsForm, whatsappDefaultMessage: e.target.value })}
                          className="w-full bg-ink/90 border border-sand/30 p-2.5 rounded text-linen/90 font-mono text-xs focus:outline-none focus:border-emerald-500"
                          placeholder="e.g. Hello! I need customer support regarding my order from the website."
                        />
                        <span className="text-[9px] text-linen/40 font-mono block">
                          This pre-filled text automatically loads in the customer's WhatsApp application when they click support.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Live Interactive Preview Card */}
                  <div className="bg-ink border border-sand/20 rounded-xl p-5 space-y-3">
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-linen/60 block pb-2 border-b border-sand/20">
                      Live Customer Experience Preview
                    </span>

                    <div className="p-4 rounded-xl bg-stone-900/90 border border-emerald-900/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-md">
                            <MessageCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-serif font-bold text-xs text-linen block">Customer Support Desk</span>
                            <span className="text-[10px] text-emerald-400 font-mono">
                              WhatsApp: +{(cmsForm.whatsappNumber || "919999999999").replace(/[^0-9]/g, "")}
                            </span>
                          </div>
                        </div>
                        <a
                          href={`https://wa.me/${(cmsForm.whatsappNumber || "919999999999").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            cmsForm.whatsappDefaultMessage || "Hello! I need assistance with my order."
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-mono text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Test WhatsApp Chat</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="p-3 bg-stone-950/80 rounded border border-stone-800 text-[11px] font-mono text-linen/70 space-y-1">
                        <span className="text-[9px] text-linen/40 uppercase block font-bold">Generated Deep Link URL:</span>
                        <p className="text-amber-400 break-all select-all">
                          https://wa.me/{(cmsForm.whatsappNumber || "919999999999").replace(/[^0-9]/g, "")}?text={encodeURIComponent(cmsForm.whatsappDefaultMessage || "")}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-sand/20 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase font-bold tracking-wider rounded cursor-pointer transition flex items-center gap-2 shadow-lg"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save & Deploy WhatsApp Settings</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        )}

        {/* ==================== TAB 6: UPI PAYMENTS & RECONCILIATION ==================== */}
        {activeTab === "payments" && (
          <div className="space-y-8" id="admin-view-payments">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold">UPI Payment Gateway & Config Panel</h2>
                <p className="text-xs text-linen/40 mt-0.5">Securely manage active merchant accounts, verify real-time customer transactions, or dispatch manual refunds.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="payments-grid-container">
              {/* Left Column: Security Vault Config */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-stone-900/40 border border-sand/20 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b border-sand/20">
                    <span className="p-1.5 bg-moss/20 rounded-md">
                      <DollarSign className="w-4 h-4 text-moss" />
                    </span>
                    <h3 className="font-serif text-lg font-medium">Merchant Credentials Vault</h3>
                  </div>

                  {paySettingsSuccess && (
                    <div className="p-3 bg-moss/20 border border-moss/30 text-moss text-xs rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{paySettingsSuccess}</span>
                    </div>
                  )}

                  {paySettingsError && (
                    <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{paySettingsError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSavePayConfig} className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Merchant ID (MID)</label>
                      <input
                        type="text"
                        value={payConfigForm.merchantId}
                        onChange={(e) => setPayConfigForm({ ...payConfigForm, merchantId: e.target.value })}
                        placeholder="e.g. TIRUPATI MERCHANDISEMID772910"
                        className="w-full bg-ink border border-sand/20 p-2.5 rounded text-linen/80 focus:outline-none focus:border-moss/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Payee VPA (UPI ID)</label>
                      <input
                        type="text"
                        value={payConfigForm.upiVpa}
                        onChange={(e) => setPayConfigForm({ ...payConfigForm, upiVpa: e.target.value })}
                        placeholder="e.g. merchant@okhdfcbank"
                        className="w-full bg-ink border border-sand/20 p-2.5 rounded text-linen/80 focus:outline-none focus:border-moss/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Merchant Secure Secret Key</label>
                      <div className="relative">
                        <input
                          type={showSecret ? "text" : "password"}
                          value={payConfigForm.secretKey}
                          onChange={(e) => setPayConfigForm({ ...payConfigForm, secretKey: e.target.value })}
                          placeholder="••••••••••••••••••••••••"
                          className="w-full bg-ink border border-sand/20 p-2.5 pr-10 rounded text-linen/80 focus:outline-none focus:border-moss/40"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute right-3 top-3.5 text-linen/40 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Salt Key (Index-1)</label>
                      <div className="relative">
                        <input
                          type={showSalt ? "text" : "password"}
                          value={payConfigForm.saltKey}
                          onChange={(e) => setPayConfigForm({ ...payConfigForm, saltKey: e.target.value })}
                          placeholder="••••••••••••••••••••••••"
                          className="w-full bg-ink border border-sand/20 p-2.5 pr-10 rounded text-linen/80 focus:outline-none focus:border-moss/40"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSalt(!showSalt)}
                          className="absolute right-3 top-3.5 text-linen/40 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-sand/10">
                      <span className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Checkout Payment Methods Control</span>
                      
                      {/* Master Gateway Toggles */}
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-stone-900/50 rounded border border-sand/10 hover:border-sand/20">
                          <input
                            type="checkbox"
                            checked={payConfigForm.prepaidEnabled ?? true}
                            onChange={(e) => setPayConfigForm({ ...payConfigForm, prepaidEnabled: e.target.checked })}
                            className="rounded border-sand/20 text-moss focus:ring-moss"
                          />
                          <div>
                            <span className="block font-medium text-white">Prepaid (Master Gateway)</span>
                            <span className="text-[9px] text-linen/40">Enable/Disable online checkout</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-stone-900/50 rounded border border-sand/10 hover:border-sand/20">
                          <input
                            type="checkbox"
                            checked={payConfigForm.codEnabled ?? true}
                            onChange={(e) => setPayConfigForm({ ...payConfigForm, codEnabled: e.target.checked })}
                            className="rounded border-sand/20 text-moss focus:ring-moss"
                          />
                          <div>
                            <span className="block font-medium text-white">Cash on Delivery</span>
                            <span className="text-[9px] text-linen/40 font-mono">Doorstep collection</span>
                          </div>
                        </label>
                      </div>

                      {/* Granular Options */}
                      <span className="text-[9.5px] text-linen/30 font-mono uppercase tracking-wider block pt-1">Specific Online Methods</span>
                      <div className="grid grid-cols-3 gap-2">
                        <label className="flex items-center gap-2 cursor-pointer p-2 bg-stone-900/40 rounded border border-sand/10 hover:border-sand/20">
                          <input
                            type="checkbox"
                            checked={payConfigForm.cardEnabled ?? true}
                            onChange={(e) => setPayConfigForm({ ...payConfigForm, cardEnabled: e.target.checked })}
                            className="rounded border-sand/20 text-moss focus:ring-moss"
                          />
                          <div>
                            <span className="block text-xs font-medium text-white">Credit / Debit</span>
                            <span className="text-[8.5px] text-linen/40">Cards</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer p-2 bg-stone-900/40 rounded border border-sand/10 hover:border-sand/20">
                          <input
                            type="checkbox"
                            checked={payConfigForm.upiEnabled ?? true}
                            onChange={(e) => setPayConfigForm({ ...payConfigForm, upiEnabled: e.target.checked })}
                            className="rounded border-sand/20 text-moss focus:ring-moss"
                          />
                          <div>
                            <span className="block text-xs font-medium text-white">UPI / QR</span>
                            <span className="text-[8.5px] text-linen/40">GPay/PhonePe</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer p-2 bg-stone-900/40 rounded border border-sand/10 hover:border-sand/20">
                          <input
                            type="checkbox"
                            checked={payConfigForm.netbankingEnabled ?? true}
                            onChange={(e) => setPayConfigForm({ ...payConfigForm, netbankingEnabled: e.target.checked })}
                            className="rounded border-sand/20 text-moss focus:ring-moss"
                          />
                          <div>
                            <span className="block text-xs font-medium text-white">Net Banking</span>
                            <span className="text-[8.5px] text-linen/40">Indian Banks</span>
                          </div>
                        </label>
                      </div>

                      {/* UPI Flow Sub-options */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-stone-900/50 rounded border border-sand/10 hover:border-sand/20">
                          <input
                            type="checkbox"
                            checked={payConfigForm.intentEnabled ?? true}
                            onChange={(e) => setPayConfigForm({ ...payConfigForm, intentEnabled: e.target.checked })}
                            className="rounded border-sand/20 text-moss focus:ring-moss"
                          />
                          <div>
                            <span className="block font-medium">UPI Intent</span>
                            <span className="text-[9px] text-linen/40">Mobile drawer redirect</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-stone-900/50 rounded border border-sand/10 hover:border-sand/20">
                          <input
                            type="checkbox"
                            checked={payConfigForm.qrEnabled ?? true}
                            onChange={(e) => setPayConfigForm({ ...payConfigForm, qrEnabled: e.target.checked })}
                            className="rounded border-sand/20 text-moss focus:ring-moss"
                          />
                          <div>
                            <span className="block font-medium">Dynamic QR</span>
                            <span className="text-[9px] text-linen/40">Desktop pixel rendering</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Delivery Cost Management System */}
                    <div className="space-y-3 pt-4 border-t border-sand/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-moss" />
                          <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                            Delivery Cost Management System
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-moss/20 text-moss border border-moss/30 rounded font-mono">
                          Active Fee Matrix
                        </span>
                      </div>
                      <p className="text-[11px] text-linen/50 leading-relaxed">
                        Configure exact delivery charges for prepaid (online) and Cash on Delivery (COD) checkout modes.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Prepaid Delivery Cost */}
                        <div className="space-y-1 bg-stone-900/60 p-3 rounded-lg border border-sand/10 hover:border-sand/20 transition-all">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] text-linen/70 font-mono uppercase tracking-wider font-semibold block">
                              Prepaid Delivery Fee
                            </label>
                            <span className="text-[9px] text-moss font-mono font-bold">
                              {Number(payConfigForm.prepaidDeliveryCost) === 0 ? "FREE (₹0)" : `₹${payConfigForm.prepaidDeliveryCost}`}
                            </span>
                          </div>
                          <div className="relative flex items-center mt-1">
                            <span className="absolute left-3 text-linen/40 font-mono text-xs">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={payConfigForm.prepaidDeliveryCost ?? 0}
                              onChange={(e) => setPayConfigForm({ ...payConfigForm, prepaidDeliveryCost: Number(e.target.value) || 0 })}
                              placeholder="0"
                              className="w-full bg-ink border border-sand/20 pl-7 pr-3 py-2 rounded text-linen/90 text-xs font-mono focus:outline-none focus:border-moss/50"
                            />
                          </div>
                          <span className="text-[9px] text-linen/40 block mt-0.5">
                            Online orders (UPI/Card/Netbanking).
                          </span>
                        </div>

                        {/* COD Delivery Cost */}
                        <div className="space-y-1 bg-stone-900/60 p-3 rounded-lg border border-sand/10 hover:border-sand/20 transition-all">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] text-linen/70 font-mono uppercase tracking-wider font-semibold block">
                              Cash on Delivery (COD) Fee
                            </label>
                            <span className="text-[9px] text-amber-400 font-mono font-bold">
                              ₹{payConfigForm.codDeliveryCost ?? 200}
                            </span>
                          </div>
                          <div className="relative flex items-center mt-1">
                            <span className="absolute left-3 text-linen/40 font-mono text-xs">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={payConfigForm.codDeliveryCost ?? 200}
                              onChange={(e) => setPayConfigForm({ ...payConfigForm, codDeliveryCost: Number(e.target.value) || 0 })}
                              placeholder="200"
                              className="w-full bg-ink border border-sand/20 pl-7 pr-3 py-2 rounded text-linen/90 text-xs font-mono focus:outline-none focus:border-moss/50"
                            />
                          </div>
                          <span className="text-[9px] text-linen/40 block mt-0.5">
                            Doorstep cash collection fee.
                          </span>
                        </div>
                      </div>

                      {/* Free Shipping Minimum Threshold */}
                      <div className="space-y-1.5 bg-stone-900/60 p-3 rounded-lg border border-sand/10">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-linen/70 font-mono uppercase tracking-wider font-semibold block">
                            Free Delivery Cart Minimum Threshold
                          </label>
                          <span className="text-[9px] text-linen/50 font-mono">
                            Cart ≥ ₹{payConfigForm.freeShippingThreshold ?? 2999} = FREE Shipping
                          </span>
                        </div>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-linen/40 font-mono text-xs">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={payConfigForm.freeShippingThreshold ?? 2999}
                            onChange={(e) => setPayConfigForm({ ...payConfigForm, freeShippingThreshold: Number(e.target.value) || 0 })}
                            placeholder="2999"
                            className="w-full bg-ink border border-sand/20 pl-7 pr-3 py-2 rounded text-linen/90 text-xs font-mono focus:outline-none focus:border-moss/50"
                          />
                        </div>
                        <span className="text-[9px] text-linen/40 block">
                          Orders equal or above this subtotal get zero delivery fee.
                        </span>
                      </div>

                      {/* Presets */}
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPayConfigForm({ ...payConfigForm, prepaidDeliveryCost: 0, codDeliveryCost: 200, freeShippingThreshold: 2999 })}
                          className="px-2.5 py-1 bg-sand/10 hover:bg-sand/20 text-[10px] font-mono text-linen/80 rounded transition border border-sand/10 cursor-pointer"
                        >
                          Preset: Free Prepaid / ₹200 COD
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayConfigForm({ ...payConfigForm, prepaidDeliveryCost: 100, codDeliveryCost: 200, freeShippingThreshold: 3000 })}
                          className="px-2.5 py-1 bg-sand/10 hover:bg-sand/20 text-[10px] font-mono text-linen/80 rounded transition border border-sand/10 cursor-pointer"
                        >
                          Preset: ₹100 Prepaid / ₹200 COD
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayConfigForm({ ...payConfigForm, prepaidDeliveryCost: 0, codDeliveryCost: 0, freeShippingThreshold: 0 })}
                          className="px-2.5 py-1 bg-moss/20 hover:bg-moss/30 text-moss text-[10px] font-mono rounded transition border border-moss/30 cursor-pointer"
                        >
                          Preset: Free Delivery All
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-sand/20 flex flex-col gap-3">
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-moss hover:bg-moss-hover text-linen text-xs font-mono uppercase tracking-widest font-bold rounded transition text-center"
                      >
                        Secure Merchant Config
                      </button>
                      <p className="text-[10px] text-linen/30 font-sans leading-relaxed text-center">
                        Note: Leave fields empty to automatically fallback to cloud environment variables (`UPI_MERCHANT_ID`, `UPI_VPA`, etc.) securely injected server-side.
                      </p>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Transaction Ledger */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-stone-900/40 border border-sand/20 rounded-2xl p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-sand/20">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-moss/20 rounded-md">
                        <Sliders className="w-4 h-4 text-moss" />
                      </span>
                      <h3 className="font-serif text-lg font-medium">Transaction Ledger</h3>
                    </div>
                    
                    {/* Status filter selection */}
                    <div className="flex gap-2 text-xs">
                      {["All", "Pending", "Success", "Failed", "Refunded"].map((st) => (
                        <button
                          key={st}
                          onClick={() => setPayStatusFilter(st)}
                          className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider transition ${
                            payStatusFilter === st
                              ? "bg-moss text-linen font-bold"
                              : "bg-ink hover:bg-sand/15 text-linen/50"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-linen/30" />
                    <input
                      type="text"
                      placeholder="Search transactions by ID, order ID, or customer email..."
                      value={paySearch}
                      onChange={(e) => setPaySearch(e.target.value)}
                      className="w-full bg-ink border border-sand/20 pl-9 pr-4 py-2 rounded text-xs text-linen/80 placeholder-linen/30 focus:outline-none focus:border-moss/40"
                    />
                  </div>

                  {/* Transactions List */}
                  {isPayLoading ? (
                    <div className="text-center py-12 text-xs font-mono text-linen/40 animate-pulse">
                      Contacting Firestore secure tables...
                    </div>
                  ) : payTransactions.length === 0 ? (
                    <div className="text-center py-16 text-xs font-mono text-linen/40 space-y-1">
                      <div>No transactions matched your search parameters.</div>
                      <div className="text-[10px] text-linen/20">All secure orders initiate transactions when checkout pathways trigger.</div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                      {payTransactions.map((txn) => {
                        const dateStr = txn.createdAt ? new Date(txn.createdAt).toLocaleString() : "Unknown Time";
                        return (
                          <div
                            key={txn.id}
                            className="p-4 bg-ink/65 border border-sand/10 hover:border-sand/20 rounded-xl space-y-3 transition"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-mono text-xs font-bold text-linen">
                                  {txn.id}
                                </span>
                                <span className="text-[10px] text-linen/40 block">
                                  Order: <span className="font-mono font-medium text-moss">{txn.orderId}</span>
                                </span>
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase font-bold ${
                                  txn.status === "Success"
                                    ? "bg-green-950/40 text-green-400 border border-green-900/50"
                                    : txn.status === "Pending"
                                    ? "bg-yellow-950/40 text-yellow-400 border border-yellow-900/50"
                                    : txn.status === "Refunded"
                                    ? "bg-blue-950/40 text-blue-400 border border-blue-900/50"
                                    : "bg-red-950/40 text-red-400 border border-red-900/50"
                                }`}>
                                  {txn.status}
                                </span>
                                <span className="text-[9px] text-linen/30 block mt-1">
                                  {txn.method === "upi_intent" ? "UPI Intent App" : "UPI Desktop QR"}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-linen/60 border-t border-b border-sand/10 py-2">
                              <div>
                                <span className="text-linen/30 block text-[9px] font-mono uppercase tracking-wider">Customer Seeker</span>
                                <span className="truncate block max-w-[180px]" title={txn.customerEmail}>{txn.customerEmail}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-linen/30 block text-[9px] font-mono uppercase tracking-wider">Payment Volume</span>
                                <span className="font-mono text-linen font-medium block">
                                  ₹{Number(txn.amountINR || 0).toLocaleString()} <span className="text-linen/40 text-[9px]">(${(txn.amountUSD || 0).toFixed(2)})</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-linen/40 font-mono">{dateStr}</span>
                              
                              <div className="flex gap-2">
                                {txn.status === "Pending" && (
                                  <button
                                    onClick={() => handleStatusCheck(txn.id)}
                                    className="px-2.5 py-1 bg-yellow-900/40 hover:bg-yellow-800 text-yellow-300 font-mono uppercase text-[9px] font-bold rounded tracking-wider flex items-center gap-1 transition"
                                  >
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    Verify Status
                                  </button>
                                )}
                                {txn.status === "Success" && (
                                  <button
                                    onClick={() => handleRefundTxn(txn.id)}
                                    className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/50 text-red-300 font-mono uppercase text-[9px] font-bold rounded tracking-wider transition"
                                  >
                                    Trigger Refund
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 7: HOMEPAGE SECTIONS MANAGER ==================== */}
        {activeTab === "sections" && (
          <div className="space-y-8" id="admin-view-homepage-sections">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold">Homepage Section Manager</h2>
                <p className="text-xs text-linen/40 mt-0.5">Dynamically create, sequence, and customize product collections on the storefront homepage.</p>
              </div>
              {!showSectionForm && (
                <button
                  onClick={() => {
                    setEditingSection(null);
                    setSectionForm({
                      title: "",
                      subtitle: "",
                      layoutType: "grid",
                      productIds: [],
                      isActive: true,
                      sortOrder: homepageSectionsList.length + 1
                    });
                    setSectionProductSearch("");
                    setShowSectionForm(true);
                  }}
                  id="admin-create-section-btn"
                  className="px-4 py-2 bg-moss hover:bg-moss-hover text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer text-white"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Section</span>
                </button>
              )}
            </div>

            {/* SECTION FORM DRAWER / PANEL */}
            {showSectionForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-900/40 border border-sand/20 rounded-2xl p-6 space-y-6"
                id="homepage-section-form-panel"
              >
                <div className="flex items-center justify-between pb-3 border-b border-sand/20">
                  <h3 className="font-serif text-lg font-medium text-[#FAF9F5]">
                    {editingSection ? `Edit Section: ${editingSection.title}` : "New Showcase Section"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSectionForm(false);
                      setEditingSection(null);
                    }}
                    className="text-linen/50 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSectionSubmit} className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {/* Title */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Section Title (e.g. Discover What's New)</label>
                        <input
                          type="text"
                          required
                          value={sectionForm.title}
                          onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                          placeholder="Enter section title..."
                          className="w-full bg-ink border border-sand/20 p-2.5 rounded text-linen/80 focus:outline-none focus:border-moss/40"
                        />
                      </div>

                      {/* Subtitle */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Subtitle / Caption</label>
                        <input
                          type="text"
                          value={sectionForm.subtitle}
                          onChange={(e) => setSectionForm({ ...sectionForm, subtitle: e.target.value })}
                          placeholder="Enter section subtitle..."
                          className="w-full bg-ink border border-sand/20 p-2.5 rounded text-linen/80 focus:outline-none focus:border-moss/40"
                        />
                      </div>

                      {/* Layout Type Selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Showcase Layout Style</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setSectionForm({ ...sectionForm, layoutType: "grid" })}
                            className={`py-3 px-4 rounded-lg border text-center transition font-mono uppercase text-[10px] tracking-wider cursor-pointer ${
                              sectionForm.layoutType === "grid"
                                ? "bg-moss/20 border-moss text-moss font-bold"
                                : "border-sand/10 bg-stone-950/20 text-linen/50 hover:border-sand/25"
                            }`}
                          >
                            Standard Grid Layout
                          </button>
                          <button
                            type="button"
                            onClick={() => setSectionForm({ ...sectionForm, layoutType: "carousel" })}
                            className={`py-3 px-4 rounded-lg border text-center transition font-mono uppercase text-[10px] tracking-wider cursor-pointer ${
                              sectionForm.layoutType === "carousel"
                                ? "bg-moss/20 border-moss text-moss font-bold"
                                : "border-sand/10 bg-stone-950/20 text-linen/50 hover:border-sand/25"
                            }`}
                          >
                            Sliding Carousel
                          </button>
                        </div>
                      </div>

                      {/* Active Status Toggle */}
                      <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-stone-900/50 rounded-lg border border-sand/10 hover:border-sand/20">
                          <input
                            type="checkbox"
                            checked={sectionForm.isActive}
                            onChange={(e) => setSectionForm({ ...sectionForm, isActive: e.target.checked })}
                            className="w-4 h-4 rounded bg-ink border-sand/20 text-moss focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          <div>
                            <span className="font-mono text-[10px] uppercase tracking-wider font-bold block text-linen">Section Active status</span>
                            <span className="text-[9px] text-linen/40 block mt-0.5">Toggle active visibility on the storefront.</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Products Selection */}
                    <div className="space-y-3 flex flex-col h-[350px]">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">
                          Select Showcase Products ({sectionForm.productIds.length} Selected)
                        </label>
                        {sectionForm.productIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSectionForm({ ...sectionForm, productIds: [] })}
                            className="text-[9px] font-mono text-amber-500 hover:underline cursor-pointer"
                          >
                            Clear Selection
                          </button>
                        )}
                      </div>

                      {/* Search box */}
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-linen/30" />
                        <input
                          type="text"
                          value={sectionProductSearch}
                          onChange={(e) => setSectionProductSearch(e.target.value)}
                          placeholder="Search product catalog by name..."
                          className="w-full bg-ink border border-sand/20 pl-9 pr-3 py-2 rounded text-linen/80 text-xs focus:outline-none focus:border-moss/40"
                        />
                      </div>

                      {/* Scrollable list */}
                      <div className="flex-1 overflow-y-auto border border-sand/20 rounded-lg bg-ink/50 divide-y divide-sand/10">
                        {products
                          .filter(p => {
                            if (!sectionProductSearch) return true;
                            const query = sectionProductSearch.toLowerCase();
                            return p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
                          })
                          .map(p => {
                            const isSelected = sectionForm.productIds.includes(p.id);
                            const imgUrl = p.images && p.images[0] ? getDirectImageUrl(p.images[0]) : "/placeholder.jpg";
                            return (
                              <div
                                key={p.id}
                                onClick={() => {
                                  let newIds = [...sectionForm.productIds];
                                  if (isSelected) {
                                    newIds = newIds.filter(id => id !== p.id);
                                  } else {
                                    newIds.push(p.id);
                                  }
                                  setSectionForm({ ...sectionForm, productIds: newIds });
                                }}
                                className={`p-2.5 flex items-center justify-between cursor-pointer transition ${
                                  isSelected ? "bg-moss/10" : "hover:bg-sand/5"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={imgUrl}
                                    alt={p.name}
                                    referrerPolicy="no-referrer"
                                    className="w-9 h-9 object-cover rounded bg-stone-900 border border-sand/10 flex-shrink-0"
                                  />
                                  <div>
                                    <span className="font-serif font-bold text-linen block leading-tight">{p.name}</span>
                                    <span className="text-[9px] text-linen/40 font-mono uppercase tracking-wider">{p.category}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-moss font-semibold">₹{Math.round(p.price || 0).toLocaleString()}</span>
                                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    isSelected ? "border-moss bg-moss text-white" : "border-sand/30"
                                  }`}>
                                    {isSelected && <span className="text-[9px] font-bold">✓</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-sand/10">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSectionForm(false);
                        setEditingSection(null);
                      }}
                      className="px-4 py-2 border border-sand/20 hover:bg-sand/10 text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-moss hover:bg-moss-hover text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition cursor-pointer text-white"
                    >
                      {editingSection ? "Save Changes" : "Create Section"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* SECTIONS LIST & SORTING TABLE */}
            <div className="bg-stone-900/40 border border-sand/20 rounded-2xl p-6" id="homepage-sections-list-container">
              <div className="pb-4 border-b border-sand/10 mb-4 flex items-center justify-between">
                <h3 className="font-serif text-lg font-medium text-[#FAF9F5]">Active Showcase Sequence</h3>
                <span className="text-[10px] font-mono text-linen/40">{homepageSectionsList.length} Sections Defined</span>
              </div>

              {isSectionsLoading ? (
                <div className="p-8 text-center animate-pulse text-linen/40 text-xs font-mono">
                  Loading storefront configurations...
                </div>
              ) : homepageSectionsList.length === 0 ? (
                <div className="p-12 text-center text-linen/40 text-xs font-mono flex flex-col items-center gap-3">
                  <span>No dynamic homepage sections configured yet.</span>
                  <button
                    onClick={() => {
                      setEditingSection(null);
                      setSectionForm({
                        title: "Discover What's New",
                        subtitle: "Hand loomed slow travel companions.",
                        layoutType: "carousel",
                        productIds: [],
                        isActive: true,
                        sortOrder: 1
                      });
                      setSectionProductSearch("");
                      setShowSectionForm(true);
                    }}
                    className="mt-2 px-4 py-2 border border-moss text-moss hover:bg-moss/10 rounded-lg transition uppercase text-[10px] tracking-wider font-bold cursor-pointer"
                  >
                    Seed Starter Section
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {homepageSectionsList.map((sec, idx) => {
                    return (
                      <div
                        key={sec.id}
                        className="p-4 bg-ink border border-sand/15 hover:border-sand/30 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition"
                      >
                        {/* Title, badge */}
                        <div className="space-y-1.5 max-w-sm">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-linen/50">0{idx + 1}</span>
                            <h4 className="font-serif font-bold text-base text-[#FAF9F5] leading-none">{sec.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest ${
                              sec.isActive ? "bg-moss/20 text-moss border border-moss/30" : "bg-amber-950/30 text-amber-500 border border-amber-900/30"
                            }`}>
                              {sec.isActive ? "Active" : "Paused"}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest bg-stone-800 text-linen/60 border border-sand/10">
                              {sec.layoutType === "carousel" ? "Carousel" : "Grid"}
                            </span>
                          </div>
                          {sec.subtitle && <p className="text-[11px] text-linen/50 font-sans italic">{sec.subtitle}</p>}
                          
                          {/* Selected Products Thumbnails */}
                          <div className="pt-2 flex items-center gap-1 flex-wrap">
                            <span className="text-[9px] font-mono text-linen/40 uppercase tracking-wider mr-1">
                              Products ({sec.productIds.length}):
                            </span>
                            {sec.productIds.length === 0 ? (
                              <span className="text-[9px] font-mono text-amber-500/80">No products assigned</span>
                            ) : (
                              <div className="flex -space-x-2 overflow-hidden">
                                {sec.productIds.slice(0, 8).map(pid => {
                                  const prod = products.find(p => p.id === pid);
                                  if (!prod) return null;
                                  const imgUrl = prod.images && prod.images[0] ? getDirectImageUrl(prod.images[0]) : "/placeholder.jpg";
                                  return (
                                    <img
                                      key={pid}
                                      src={imgUrl}
                                      alt={prod.name}
                                      referrerPolicy="no-referrer"
                                      className="inline-block h-6 w-6 rounded-full ring-2 ring-ink object-cover"
                                      title={prod.name}
                                    />
                                  );
                                })}
                                {sec.productIds.length > 8 && (
                                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-stone-800 text-[8px] font-mono font-bold text-linen/60 ring-2 ring-ink pl-1">
                                    +{sec.productIds.length - 8}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order & sequence controls + edit/delete */}
                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-sand/10">
                          {/* Move up / down arrows */}
                          <div className="flex items-center gap-1 bg-stone-950/40 p-1 rounded-lg border border-sand/10">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSection(idx, "up")}
                              className="p-1 text-linen/40 hover:text-[#FAF9F5] disabled:opacity-20 disabled:hover:text-linen/40 transition cursor-pointer"
                              title="Move Section Up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <span className="text-[9px] font-mono text-linen/30 px-1 font-bold">POS</span>
                            <button
                              type="button"
                              disabled={idx === homepageSectionsList.length - 1}
                              onClick={() => handleMoveSection(idx, "down")}
                              className="p-1 text-linen/40 hover:text-[#FAF9F5] disabled:opacity-20 disabled:hover:text-linen/40 transition cursor-pointer"
                              title="Move Section Down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Edit / Delete */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSection(sec);
                                setSectionForm({
                                  title: sec.title,
                                  subtitle: sec.subtitle || "",
                                  layoutType: sec.layoutType || "grid",
                                  productIds: sec.productIds || [],
                                  isActive: sec.isActive !== undefined ? sec.isActive : true,
                                  sortOrder: sec.sortOrder || idx + 1
                                });
                                setSectionProductSearch("");
                                setShowSectionForm(true);
                              }}
                              className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 border border-sand/20 text-linen/80 text-[10px] font-mono uppercase rounded flex items-center gap-1 transition cursor-pointer"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            {confirmDeleteSectionId === sec.id ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSection(sec.id)}
                                  className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-mono font-bold uppercase rounded flex items-center gap-1 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Confirm Delete?</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteSectionId(null)}
                                  className="p-1.5 bg-stone-800 hover:bg-stone-700 text-linen/70 rounded transition cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteSectionId(sec.id)}
                                className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 text-[10px] font-mono uppercase rounded flex items-center gap-1 transition cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Retire</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* DIALOG A: PRODUCT SPECIFICATIONS WORKSPACE */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer" onClick={() => { setIsAddOpen(false); setEditingProduct(null); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-ink border border-sand/20 rounded-2xl p-6 max-w-4xl w-full z-10 text-xs text-linen space-y-4 max-h-[90vh] overflow-y-auto"
              id="product-crud-modal"
            >
              <div className="flex justify-between items-center pb-3 border-b border-sand/20">
                <span className="font-serif font-bold text-base">
                  {editingProduct
                    ? `Modify ${releaseType === "footwear" ? "Footwear" : "Apparel"} Specifications`
                    : releaseType === "footwear"
                    ? "Release New Footwear Design"
                    : "Release New Apparel Design"}
                </span>
                <button type="button" onClick={() => { setIsAddOpen(false); setEditingProduct(null); }} className="text-linen/50 hover:text-white">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {productError && <div className="p-3 bg-red-950/50 border border-red-900/60 text-red-300 rounded">{productError}</div>}
              {productSuccess && <div className="p-3 bg-moss/50 border border-moss/60 text-moss/80 rounded">{productSuccess}</div>}

              <CollectionForm
                initialProduct={editingProduct}
                releaseType={releaseType}
                onSubmit={handleCollectionSubmit}
                onCancel={() => { setIsAddOpen(false); setEditingProduct(null); }}
                isSubmitting={syncStatus === "saving"}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG B: MOCK IMAGE GALLERY & alt-text OPTIMIZER */}
      <AnimatePresence>
        {reorderingImagesProd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer" onClick={() => setReorderingImagesProd(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-ink border border-sand/20 rounded-2xl p-6 max-w-lg w-full z-10 text-xs text-linen space-y-4"
              id="image-galley-modal"
            >
              <div className="flex justify-between items-center pb-3 border-b border-sand/20">
                <span className="font-serif font-bold text-base">Media Gallery & alt text controls</span>
                <button type="button" onClick={() => setReorderingImagesProd(null)} className="text-linen/50 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <span className="text-linen/40">Reorder gallery presentation layers using micro swap indicators:</span>
                <div className="grid grid-cols-3 gap-3">
                  {reorderingImagesProd.images.map((img, idx) => (
                    <div key={idx} className="bg-ink border border-sand/20 p-2 rounded flex flex-col items-center gap-1.5 relative group">
                      <div className="w-20 h-20 bg-stone-800 rounded overflow-hidden">
                        <img src={getDirectImageUrl(img) || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"} alt="Apparel" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-mono text-[9px] text-linen/50">Image {idx + 1}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleImageOrderSwap(reorderingImagesProd, idx, idx - 1)}
                          disabled={idx === 0}
                          className="px-1 py-0.5 bg-ink hover:bg-sand/15 rounded text-[9px] text-moss disabled:opacity-30 cursor-pointer"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => handleImageOrderSwap(reorderingImagesProd, idx, idx + 1)}
                          disabled={idx === reorderingImagesProd.images.length - 1}
                          className="px-1 py-0.5 bg-ink hover:bg-sand/15 rounded text-[9px] text-moss disabled:opacity-30 cursor-pointer"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-ink p-4 rounded-xl border border-sand/20/80 space-y-3">
                  <span className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">WebP Lossless Asset Compressor</span>
                  <p className="text-linen/50 text-[10px] leading-relaxed">Ensure high-speed page loads. Compress pixels down to WebP with AI-generated semantic alt-texts for maximum SEO index captures.</p>
                  
                  {mockCompressedInfo && (
                    <div className="p-2.5 bg-moss/60 text-moss/80 rounded font-mono text-[10px] border border-moss/30">
                      {mockCompressedInfo}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => reorderingImagesProd?.images?.[0] && handleProcessImageWebp(reorderingImagesProd.images[0])}
                    className="px-4 py-2 bg-moss hover:bg-moss-hover text-[10px] font-mono font-bold uppercase rounded cursor-pointer"
                  >
                    Optimize Assets Now
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-sand/20 flex justify-end">
                <button
                  type="button"
                  onClick={() => setReorderingImagesProd(null)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-linen/60 rounded font-mono uppercase cursor-pointer"
                >
                  Close controls
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG C: ADD SKU VARIANT */}
      <AnimatePresence>
        {isVariantOpen && selectedParentProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer" onClick={() => setIsVariantOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-ink border border-sand/20 rounded-2xl p-6 max-w-sm w-full z-10 text-xs text-linen space-y-4"
              id="sku-variant-modal"
            >
              <div className="flex justify-between items-center pb-3 border-b border-sand/20">
                <span className="font-serif font-bold text-sm">Add SKU Variant</span>
                <button type="button" onClick={() => setIsVariantOpen(false)} className="text-linen/50 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-linen/40 font-mono uppercase block">Parent Apparel Design</span>
                <span className="font-serif font-bold text-sm text-[#FAF9F5] block">{selectedParentProduct.name}</span>
              </div>

              <form onSubmit={handleAddVariantSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-linen/40 font-mono uppercase">Size Sizing</label>
                  <select
                    value={variantForm.size}
                    onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
                    className="w-full bg-ink border border-sand/20 p-2 rounded text-linen/80 focus:outline-none"
                  >
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-linen/40 font-mono uppercase">Color Specification</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ochre Yellow"
                    value={variantForm.color}
                    onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
                    className="w-full bg-ink border border-sand/20 p-2 rounded text-linen/80 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-linen/40 font-mono uppercase">Injected stock units</label>
                  <input
                    type="number"
                    required
                    value={variantForm.stock}
                    onChange={(e) => setVariantForm({ ...variantForm, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-ink border border-sand/20 p-2 rounded text-linen/80 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-moss hover:bg-moss-hover font-mono uppercase font-bold rounded transition cursor-pointer"
                >
                  Generate & Stock SKU
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG D: PRINT POSTAGE DISPATCH LABEL */}
      <AnimatePresence>
        {printingOrderLabel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer" onClick={() => setPrintingOrderLabel(null)} />
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="relative bg-white text-ink rounded-lg p-8 max-w-md w-full z-10 text-xs space-y-6 shadow-2xl border-4 border-stone-900 font-mono"
              id="print-label-modal"
            >
              <div className="border-b-4 border-stone-900 pb-3 flex justify-between items-start">
                <div>
                  <h5 className="font-bold text-sm tracking-wider uppercase">TIRUPATI MERCHANDISE ORGANICS INC.</h5>
                  <span className="text-[9px] block">SLOW TRAVEL SHIPPERS CO.</span>
                </div>
                <div className="text-right">
                  <span className="p-1 border border-stone-900 font-bold text-xs uppercase">FIRST CLASS</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-linen/50 uppercase block">FROM:</span>
                <p className="font-bold">Tirupati Merchandise Textiles Atelier</p>
                <p>14 Handloom Artisans Guild, Himachal, IN</p>
              </div>

              <div className="space-y-1 text-sm border-t border-b border-stone-900 py-3">
                <span className="text-[9px] text-linen/50 uppercase block">TO DISPATCH RECIPIENT:</span>
                <p className="font-bold text-base">{printingOrderLabel.customerName}</p>
                <p className="font-bold">{printingOrderLabel.shippingAddress?.street}</p>
                <p className="font-bold">{printingOrderLabel.shippingAddress?.city}, {printingOrderLabel.shippingAddress?.state} - {printingOrderLabel.shippingAddress?.zip}</p>
                {getOrderPhone(printingOrderLabel) !== "N/A" && (
                  <p className="font-mono text-xs font-bold text-stone-800 pt-0.5">Phone: {getOrderPhone(printingOrderLabel)}</p>
                )}
              </div>

              {/* Barcode Mock */}
              <div className="flex flex-col items-center justify-center pt-2 space-y-1">
                <div className="bg-ink h-16 w-full flex items-center justify-center" style={{ backgroundImage: "repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 6px)" }} />
                <span className="text-[11px] font-bold tracking-widest">{printingOrderLabel.trackingNumber || "TRK-WND-88219"}</span>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-sand/40">
                <button
                  type="button"
                  onClick={() => setPrintingOrderLabel(null)}
                  className="px-4 py-2 border border-stone-400 rounded text-linen/40 font-mono uppercase cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => { alert("Postage barcode dispatched to system printer queue."); setPrintingOrderLabel(null); }}
                  className="px-5 py-2 bg-ink text-white rounded font-mono uppercase font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Label</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG E: RETURNS & REFUND DIALOG */}
      <AnimatePresence>
        {selectedOrderForRefund && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedOrderForRefund(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-ink border border-sand/20 rounded-2xl p-6 max-w-sm w-full z-10 text-xs text-linen space-y-4"
              id="order-refund-modal"
            >
              <div className="flex justify-between items-center pb-3 border-b border-sand/20">
                <span className="font-serif font-bold text-sm">Returns & Refund Ledger</span>
                <button type="button" onClick={() => setSelectedOrderForRefund(null)} className="text-linen/50 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {refundSuccessMsg && (
                <div className="p-3 bg-moss/75 border border-moss/30 text-moss/80 rounded font-mono">
                  {refundSuccessMsg}
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] text-linen/50 font-mono uppercase block font-bold">Refunding ticket:</span>
                <span className="font-mono text-moss font-bold block text-sm">{selectedOrderForRefund.id}</span>
                <span className="text-linen/40 block mt-1">Paid settlement value: ₹{Math.round(selectedOrderForRefund?.total || 0).toLocaleString("en-IN")}</span>
              </div>

              <form onSubmit={handleProcessRefund} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-linen/40 font-mono uppercase">Refund Amount (INR - ₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    max={selectedOrderForRefund?.total || 0}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full bg-ink border border-sand/20 p-2 rounded text-linen/80 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-linen/40 font-mono uppercase">Return Reason</label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full bg-ink border border-sand/20 p-2 rounded text-linen/80 focus:outline-none"
                  >
                    <option value="Sizing issue">Sizing issue (Fit too loose/snug)</option>
                    <option value="Defective">Defective (Weaving error/botanical blotch)</option>
                    <option value="Changed mind">Changed mind (Slower lifestyle shift)</option>
                    <option value="Late shipment">Late shipment dispatch</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="restock-box"
                    checked={restockReturnedItems}
                    onChange={(e) => setRestockReturnedItems(e.target.checked)}
                    className="rounded border-sand/20 bg-ink text-moss focus:ring-0"
                  />
                  <label htmlFor="restock-box" className="text-[11px] text-linen/40 font-mono cursor-pointer">
                    Restock items back to catalog inventory
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-moss hover:bg-moss-hover font-mono uppercase font-bold rounded transition cursor-pointer"
                >
                  Confirm Refund & Settlement
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {deleteProductId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer" onClick={() => setDeleteProductId(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-ink border border-sand/20 rounded-xl p-6 max-w-md w-full z-10 text-linen space-y-4"
              id="product-delete-modal"
            >
              <div className="flex justify-between items-center pb-2 border-b border-sand/20">
                <span className="font-serif font-bold text-base text-red-400">Retire Apparel Design</span>
                <button type="button" onClick={() => setDeleteProductId(null)} className="text-linen/50 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-linen/60 leading-relaxed">
                Are you sure you want to retire this design from your active storefront line? 
                It will be archived and no longer purchaseable by customers.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteProductId(null)}
                  className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-linen/60 rounded font-mono text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(deleteProductId)}
                  className="flex-1 py-2 bg-red-900 hover:bg-red-800 text-white rounded font-mono text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Confirm Retirement
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* DIALOG E: MANAGE PRODUCT REVIEWS & RATINGS MODAL */}
        {selectedProductForReviews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedProductForReviews(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-ink border border-sand/20 rounded-2xl p-5 sm:p-6 max-w-2xl w-full z-10 text-linen space-y-5 my-8 max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
              id="product-reviews-modal"
            >
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-sand/20 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-stone-800 overflow-hidden flex-shrink-0 border border-sand/20">
                    <img
                      src={getDirectImageUrl(selectedProductForReviews.images?.[0]) || ""}
                      alt={selectedProductForReviews.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider block font-bold">Product Reviews & Ratings Manager</span>
                    <h3 className="font-serif font-bold text-lg text-white">{selectedProductForReviews.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-linen/60 font-mono">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {selectedProductForReviews.rating || 5.0} / 5.0
                      </span>
                      <span>•</span>
                      <span>{productReviews.length} total reviews logged</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProductForReviews(null)}
                  className="p-1.5 text-linen/50 hover:text-white hover:bg-stone-800 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Success Banner */}
              {reviewActionSuccess && (
                <div className="p-3 bg-moss/20 border border-moss/40 text-moss text-xs rounded-xl flex items-center justify-between animate-fadeIn flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-moss" />
                    <span>{reviewActionSuccess}</span>
                  </div>
                  <span className="text-[10px] opacity-70 font-mono">Synced with PDP</span>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-sand/10 p-3 rounded-xl border border-sand/20 flex-shrink-0">
                <div className="text-xs text-linen/70 font-mono">
                  Manage reviews visible to shoppers on Product Details Page
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isBulkReviewImportOpen) {
                        setIsBulkReviewImportOpen(false);
                      } else {
                        setIsBulkReviewImportOpen(true);
                        setIsReviewFormOpen(false);
                        setEditingReviewItem(null);
                        setBulkReviewError(null);
                      }
                    }}
                    className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer flex-shrink-0 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isBulkReviewImportOpen ? "Close Bulk" : "Bulk Import (JSON)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (isReviewFormOpen && !editingReviewItem) {
                        setIsReviewFormOpen(false);
                      } else {
                        setEditingReviewItem(null);
                        setReviewForm({
                          userName: "",
                          userEmail: "",
                          rating: 5,
                          comment: "",
                          date: new Date().toISOString().split("T")[0],
                          status: "Approved"
                        });
                        setIsReviewFormOpen(true);
                        setIsBulkReviewImportOpen(false);
                      }
                    }}
                    className="px-3.5 py-2 bg-moss hover:bg-moss-hover text-linen text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer flex-shrink-0 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isReviewFormOpen && !editingReviewItem ? "Close Form" : "Write Review"}</span>
                  </button>
                </div>
              </div>

              {/* Main Content Area (Form or Reviews List) */}
              <div ref={modalScrollRef} className="overflow-y-auto space-y-4 pr-1 flex-1">
                {/* Bulk Import JSON Form when open */}
                {isBulkReviewImportOpen && (
                  <form
                    onSubmit={handleBulkImportReviews}
                    className="bg-black/40 border border-amber-500/30 rounded-xl p-4 space-y-3 text-xs animate-fadeIn"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-sand/20">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                          Bulk Import Reviews (JSON Array)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsBulkReviewImportOpen(false);
                          setBulkReviewError(null);
                        }}
                        className="text-linen/50 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[11px] text-linen/70 font-mono">
                      Paste a raw JSON array containing review objects (e.g. name, rating, review):
                      <code className="block mt-1 p-2 bg-stone-900 border border-sand/20 rounded text-amber-300 text-[10px] whitespace-pre-wrap font-mono">
                        {`[
  { "name": "Ajeet", "rating": 5, "review": "Happy to purchase this" },
  { "name": "Priya", "rating": 4, "review": "Great quality and fit" }
]`}
                      </code>
                    </p>

                    {bulkReviewError && (
                      <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs rounded-lg flex items-center gap-2 font-mono">
                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        <span>{bulkReviewError}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] text-linen/60 font-mono uppercase block">
                        Raw JSON Input *
                      </label>
                      <textarea
                        required
                        rows={6}
                        placeholder='[{"name": "Ajeet", "rating": 5, "review": "Happy to purchase this"}]'
                        value={bulkReviewJson}
                        onChange={(e) => {
                          setBulkReviewJson(e.target.value);
                          if (bulkReviewError) setBulkReviewError(null);
                        }}
                        className="w-full bg-stone-900 border border-sand/20 p-2.5 rounded text-linen/90 font-mono text-xs focus:outline-none focus:border-amber-400 leading-relaxed"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsBulkReviewImportOpen(false);
                          setBulkReviewError(null);
                        }}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-linen/70 rounded text-xs font-mono uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingBulkReviews}
                        className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-mono uppercase text-xs font-bold rounded cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSubmittingBulkReviews ? "Importing..." : "Submit Bulk Import"}
                      </button>
                    </div>
                  </form>
                )}
                {/* Form when open */}
                {isReviewFormOpen && (
                  <form
                    onSubmit={handleSaveReview}
                    className="bg-black/40 border border-sand/20 rounded-xl p-4 space-y-4 text-xs animate-fadeIn"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-sand/20">
                      <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                        {editingReviewItem ? "Edit Existing Review" : "Write New Product Review"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsReviewFormOpen(false);
                          setEditingReviewItem(null);
                        }}
                        className="text-linen/50 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-linen/60 font-mono uppercase">Customer / Reviewer Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Aarav Sharma"
                          value={reviewForm.userName}
                          onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                          className="w-full bg-stone-900 border border-sand/20 p-2 rounded text-linen/90 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-linen/60 font-mono uppercase">Customer Email (Optional)</label>
                        <input
                          type="email"
                          placeholder="e.g. customer@example.com"
                          value={reviewForm.userEmail}
                          onChange={(e) => setReviewForm({ ...reviewForm, userEmail: e.target.value })}
                          className="w-full bg-stone-900 border border-sand/20 p-2 rounded text-linen/90 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-linen/60 font-mono uppercase block">Rating Score (1 - 5 Stars)</label>
                        <div className="flex items-center gap-1 py-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              type="button"
                              key={s}
                              onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                              className="p-1 cursor-pointer transition hover:scale-110"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  s <= reviewForm.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-stone-600"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-linen/60 font-mono uppercase">Date</label>
                        <input
                          type="date"
                          required
                          value={reviewForm.date}
                          onChange={(e) => setReviewForm({ ...reviewForm, date: e.target.value })}
                          className="w-full bg-stone-900 border border-sand/20 p-2 rounded text-linen/90 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-linen/60 font-mono uppercase">Status</label>
                        <select
                          value={reviewForm.status}
                          onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value as any })}
                          className="w-full bg-stone-900 border border-sand/20 p-2 rounded text-linen/90 focus:outline-none"
                        >
                          <option value="Approved">Approved (Live on PDP)</option>
                          <option value="Pending">Pending Audit</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-linen/60 font-mono uppercase">Review Comment / Feedback *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Write authentic customer review feedback regarding fit, linen fabric texture, color, and finish..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full bg-stone-900 border border-sand/20 p-2.5 rounded text-linen/90 focus:outline-none focus:border-amber-400 leading-relaxed"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsReviewFormOpen(false);
                          setEditingReviewItem(null);
                        }}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-linen/70 rounded text-xs font-mono uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-moss hover:bg-moss-hover text-linen font-mono uppercase text-xs font-bold rounded cursor-pointer shadow-sm"
                      >
                        {editingReviewItem ? "Update Review" : "Publish Review"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Reviews List */}
                {isLoadingProductReviews ? (
                  <div className="py-12 text-center text-linen/50 font-mono text-xs flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Loading reviews for this product...</span>
                  </div>
                ) : productReviews.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-sand/20 rounded-2xl space-y-2 p-6">
                    <Star className="w-8 h-8 text-amber-400/40 mx-auto" />
                    <p className="font-serif text-sm font-bold text-linen/80">No custom reviews logged yet for this design.</p>
                    <p className="text-xs text-linen/50 max-w-sm mx-auto">
                      Click the "Write Review" button above to add an authentic customer rating or review that will be visible to all shoppers on the Product Details Page.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-linen/50 font-mono uppercase">
                      <span>Existing Customer Reviews ({productReviews.length})</span>
                      <span>Live on Storefront</span>
                    </div>

                    {productReviews.map((rev, rIdx) => (
                      <div
                        key={rev.id ? `${rev.id}-${rIdx}` : `admin-rev-${rIdx}`}
                        className="bg-black/30 border border-sand/20 hover:border-sand/40 rounded-xl p-4 space-y-3 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-sm text-white">{rev.userName}</span>
                              {rev.userEmail && <span className="text-[10px] text-linen/40 font-mono">({rev.userEmail})</span>}
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold ${
                                  rev.status === "Approved"
                                    ? "bg-moss/20 text-moss border border-moss/30"
                                    : rev.status === "Rejected"
                                    ? "bg-red-950/40 text-red-400 border border-red-900/30"
                                    : "bg-amber-950/40 text-amber-400 border border-amber-900/30"
                                }`}
                              >
                                {rev.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3.5 h-3.5 ${
                                      star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-700"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-linen/50 font-mono">• {rev.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleQuickToggleReviewStatus(rev.id, rev.status)}
                              title={rev.status === "Approved" ? "Reject & Hide from PDP" : "Approve & Show on PDP"}
                              className={`p-1.5 rounded border transition cursor-pointer ${
                                rev.status === "Approved"
                                  ? "bg-stone-800 text-linen/60 hover:text-red-400 hover:border-red-800"
                                  : "bg-moss/20 text-moss border-moss/40 hover:bg-moss/30"
                              }`}
                            >
                              {rev.status === "Approved" ? <X className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingReviewItem(rev);
                                setReviewForm({
                                  userName: rev.userName || "",
                                  userEmail: rev.userEmail || "",
                                  rating: rev.rating || 5,
                                  comment: rev.comment || "",
                                  date: rev.date || new Date().toISOString().split("T")[0],
                                  status: (rev.status as any) || "Approved"
                                });
                                setIsReviewFormOpen(true);
                                modalScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              title="Edit Review"
                              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-linen/70 hover:text-white rounded border border-sand/20 transition cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {confirmDeleteReviewId === rev.id ? (
                              <div className="flex items-center gap-1 bg-red-950/60 p-1 rounded border border-red-800 animate-fadeIn">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProductReview(rev.id)}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-mono font-bold uppercase rounded cursor-pointer transition"
                                >
                                  Delete?
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteReviewId(null)}
                                  className="p-1 text-linen/60 hover:text-white transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteReviewId(rev.id)}
                                title="Delete Review"
                                className="p-1.5 bg-stone-800 hover:bg-red-950/50 text-linen/60 hover:text-red-400 rounded border border-sand/20 hover:border-red-900 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-linen/80 leading-relaxed font-sans bg-black/20 p-2.5 rounded-lg border border-sand/10">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-sand/20 flex justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedProductForReviews(null)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-linen/80 rounded font-mono text-xs uppercase tracking-wider cursor-pointer transition"
                >
                  Close Manager
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ==================== ORDER DETAILS MODAL ==================== */}
        {selectedOrderDetails && (
          <div className={isOrderDetailsFullScreen ? "fixed inset-0 z-50 flex items-center justify-center p-0 bg-black/95 backdrop-blur-md animate-fadeIn" : "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn"}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`bg-[#121620] border border-sand/30 shadow-2xl flex flex-col transition-all duration-200 ${
                isOrderDetailsFullScreen
                  ? "w-screen h-screen max-w-none max-h-none rounded-none border-none overflow-hidden"
                  : "max-w-6xl w-full max-h-[92vh] rounded-2xl overflow-hidden"
              }`}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-sand/20 flex items-center justify-between sticky top-0 bg-[#121620] z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-moss/20 border border-moss/40 flex items-center justify-center text-moss shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2 flex-wrap">
                      <span>Order Details</span>
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-moss/20 text-moss border border-moss/30 font-semibold">
                        #{selectedOrderDetails.id}
                      </span>
                      {(selectedOrderDetails.paymentStatus === "Payment Canceled" ||
                        selectedOrderDetails.paymentStatus === "Payment Cancelled" ||
                        selectedOrderDetails.status === "Cancelled" ||
                        (Array.isArray(selectedOrderDetails.tags) && selectedOrderDetails.tags.includes("payment canceled"))) && (
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/60 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                          payment canceled
                        </span>
                      )}
                    </h3>
                    <p className="text-xs font-mono text-linen/50 mt-0.5">
                      Placed on {new Date(selectedOrderDetails.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(selectedOrderDetails.date).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOrderDetailsFullScreen(!isOrderDetailsFullScreen)}
                    title={isOrderDetailsFullScreen ? "Exit Fullscreen" : "Fullscreen Mode"}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-linen/70 hover:text-white rounded-xl border border-sand/20 transition cursor-pointer flex items-center gap-1.5 text-xs font-mono"
                  >
                    {isOrderDetailsFullScreen ? (
                      <>
                        <Minimize2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Exit Fullscreen</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Fullscreen</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOrderDetails(null)}
                    className="p-2 bg-stone-800 hover:bg-stone-700 text-linen/60 hover:text-white rounded-xl border border-sand/20 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content Body */}
              <div className="p-6 space-y-6 text-xs text-linen/80 overflow-y-auto">

                {/* Status Badges Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/30 p-4 rounded-xl border border-sand/15">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-linen/40 block mb-1">Payment Status</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                          selectedOrderDetails.paymentStatus === "Approved" || selectedOrderDetails.paymentStatus === "Paid"
                            ? "bg-moss/20 text-moss border border-moss/40"
                            : selectedOrderDetails.paymentStatus === "Payment Canceled" || selectedOrderDetails.paymentStatus === "Payment Cancelled"
                            ? "bg-red-950/80 text-red-400 border border-red-800/60"
                            : selectedOrderDetails.paymentStatus === "Rejected"
                            ? "bg-red-950/40 text-red-400 border border-red-900/40"
                            : "bg-amber-950/40 text-amber-400 border border-amber-900/40"
                        }`}
                      >
                        {selectedOrderDetails.paymentStatus === "Approved" || selectedOrderDetails.paymentStatus === "Paid" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : selectedOrderDetails.paymentStatus === "Payment Canceled" || selectedOrderDetails.paymentStatus === "Payment Cancelled" ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        ) : selectedOrderDetails.paymentStatus === "Rejected" ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        <span>{selectedOrderDetails.paymentStatus || "Pending"}</span>
                      </span>

                      {/* Quick Approve / Reject in Modal */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOrderPaymentStatusUpdate(selectedOrderDetails.id, "Approved")}
                          className="px-2 py-0.5 text-[10px] font-mono bg-moss/20 hover:bg-moss/30 text-moss border border-moss/40 rounded transition cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOrderPaymentStatusUpdate(selectedOrderDetails.id, "Rejected")}
                          className="px-2 py-0.5 text-[10px] font-mono bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/40 rounded transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-linen/40 block mb-1">Fulfillment Status</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-stone-800 text-linen/80 border border-sand/20">
                      <Truck className="w-3.5 h-3.5 text-moss" />
                      <span>{selectedOrderDetails.status || "Processing"}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-linen/40 block mb-1">Payment Method</span>
                    <span className="font-mono text-xs text-white font-bold block pt-1 uppercase">
                      {selectedOrderDetails.paymentMethod || "Online"}
                      {selectedOrderDetails.utr ? ` (UTR: ${selectedOrderDetails.utr})` : ""}
                    </span>
                  </div>
                </div>

                {/* Customer & Order Core Overview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Information */}
                  <div className="bg-black/30 p-4 rounded-xl border border-sand/15 space-y-3">
                    <h4 className="font-serif font-bold text-sm text-white border-b border-sand/15 pb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-moss" />
                      <span>Customer Information</span>
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-linen/50 font-mono">Customer Name:</span>
                        <span className="font-serif font-bold text-white text-sm">{selectedOrderDetails.customerName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-linen/50 font-mono">Email ID:</span>
                        <span className="font-mono text-moss">{selectedOrderDetails.customerEmail}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-linen/50 font-mono">Mobile Number:</span>
                        <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          {getOrderPhone(selectedOrderDetails)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Financial & Timeline Summary */}
                  <div className="bg-black/30 p-4 rounded-xl border border-sand/15 space-y-3">
                    <h4 className="font-serif font-bold text-sm text-white border-b border-sand/15 pb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-moss" />
                      <span>Order Summary & Timing</span>
                    </h4>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-linen/50">Order ID:</span>
                        <span className="font-bold text-moss">{selectedOrderDetails.id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-linen/50">Order Date:</span>
                        <span className="text-white">{new Date(selectedOrderDetails.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-linen/50">Order Timing:</span>
                        <span className="text-white">{new Date(selectedOrderDetails.date).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-linen/50">Order Quantity:</span>
                        <span className="font-bold text-white">
                          {(selectedOrderDetails.items || []).reduce((acc, itm) => acc + (itm.quantity || 1), 0)} Items
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-sand/15 pt-2 text-sm font-bold">
                        <span className="text-linen/80">Order Amount:</span>
                        <span className="text-moss">₹{Math.round(selectedOrderDetails.total || 0).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Delivery Address */}
                <div className="bg-black/30 p-4 rounded-xl border border-sand/15 space-y-2">
                  <h4 className="font-serif font-bold text-sm text-white border-b border-sand/15 pb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-moss" />
                    <span>Customer Address</span>
                  </h4>
                  <p className="text-linen/80 leading-relaxed font-sans text-xs">
                    <span className="font-bold text-white block">{selectedOrderDetails.shippingAddress?.fullName || selectedOrderDetails.customerName}</span>
                    {selectedOrderDetails.shippingAddress?.street}, {selectedOrderDetails.shippingAddress?.city}, {selectedOrderDetails.shippingAddress?.state} - {selectedOrderDetails.shippingAddress?.zip}
                    {selectedOrderDetails.shippingAddress?.country ? `, ${selectedOrderDetails.shippingAddress.country}` : ""}
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-sand/15 text-xs">
                    <span className="text-linen/50 font-mono">Contact Phone:</span>
                    <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      {getOrderPhone(selectedOrderDetails)}
                    </span>
                  </div>
                </div>

                {/* Product Details List */}
                <div className="bg-black/30 p-4 rounded-xl border border-sand/15 space-y-3">
                  <div className="flex items-center justify-between border-b border-sand/15 pb-2">
                    <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-moss" />
                      <span>Product Details ({(selectedOrderDetails.items || []).length} items)</span>
                    </h4>
                    <span className="font-mono text-[10px] text-linen/40 uppercase">Total Items: {(selectedOrderDetails.items || []).reduce((a, b) => a + (b.quantity || 1), 0)}</span>
                  </div>

                  <div className="divide-y divide-stone-800/80">
                    {(selectedOrderDetails.items || []).map((item, idx) => {
                      const itemAny = item as any;
                      let rawImg = item.image || itemAny.imageUrl || (Array.isArray(itemAny.images) && itemAny.images[0]);
                      if (!rawImg) {
                        const cleanName = (item.name || "").split("(")[0].trim().toLowerCase();
                        const matchedProd = (products || []).find(
                          (p) =>
                            (p.id && (p.id === item.productId || p.id === itemAny.id)) ||
                            (p.name && cleanName && (
                              p.name.toLowerCase() === cleanName ||
                              cleanName.includes(p.name.toLowerCase()) ||
                              p.name.toLowerCase().includes(cleanName)
                            ))
                        );
                        if (matchedProd && matchedProd.images && matchedProd.images.length > 0) {
                          rawImg = matchedProd.images[0];
                        }
                      }
                      if (!rawImg) {
                        rawImg = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80";
                      }
                      const itemImgUrl = getDirectImageUrl(rawImg);

                      return (
                        <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={itemImgUrl}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg border border-sand/20 bg-stone-900 flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80";
                              }}
                            />
                            <div>
                              <span className="font-serif font-bold text-white text-sm block">{item.name}</span>
                              <div className="flex items-center gap-3 text-[11px] font-mono text-linen/50 mt-0.5">
                                {(item.size || itemAny.selectedSize) && <span>Size: <strong className="text-linen/80">{item.size || itemAny.selectedSize}</strong></span>}
                                {item.color && <span>Color: <strong className="text-linen/80">{item.color}</strong></span>}
                                <span>Qty: <strong className="text-moss">{item.quantity}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right font-mono flex-shrink-0">
                            <span className="font-bold text-linen block text-xs">₹{Math.round((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}</span>
                            <span className="text-[10px] text-linen/40 block">₹{Math.round(item.price || 0).toLocaleString("en-IN")} each</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Update Shipping Timeline Section */}
                <AdminShippingTimelineEditor
                  order={selectedOrderDetails}
                  onTimelineSaved={(updatedTimeline) => {
                    setSelectedOrderDetails({
                      ...selectedOrderDetails,
                      shippingTimeline: updatedTimeline,
                    });
                    if (onOrderUpdate) onOrderUpdate();
                  }}
                />

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-sand/20 bg-[#121620] flex items-center justify-between rounded-b-2xl sticky bottom-0">
                <button
                  type="button"
                  onClick={() => {
                    setPrintingOrderLabel(selectedOrderDetails);
                  }}
                  className="px-4 py-2 bg-ink hover:bg-sand/15 text-linen/80 hover:text-white rounded-xl border border-sand/20 font-mono text-xs flex items-center gap-2 cursor-pointer transition"
                >
                  <Printer className="w-4 h-4 text-moss" />
                  <span>Print Label</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteOrderConfirmId(selectedOrderDetails.id)}
                    className="px-4 py-2 bg-red-950/40 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded-xl border border-red-900/40 font-mono text-xs flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Order</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOrderDetails(null)}
                    className="px-5 py-2 bg-moss text-white font-mono font-bold text-xs rounded-xl shadow cursor-pointer hover:opacity-90 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ==================== ORDER DELETE CONFIRMATION MODAL ==================== */}
        {deleteOrderConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121620] border border-red-900/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-linen"
              id="order-delete-modal"
            >
              <div className="flex justify-between items-center pb-3 border-b border-sand/20">
                <span className="font-serif font-bold text-base text-red-400 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <span>Delete Customer Order</span>
                </span>
                <button
                  type="button"
                  onClick={() => setDeleteOrderConfirmId(null)}
                  className="text-linen/50 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-linen/80 leading-relaxed">
                Are you sure you want to permanently delete order <strong className="font-mono text-moss">{deleteOrderConfirmId}</strong>? This will remove the transaction record from your store logs.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteOrderConfirmId(null)}
                  className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-linen/70 rounded-xl font-mono text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetId = deleteOrderConfirmId;
                    setDeleteOrderConfirmId(null);
                    handleDeleteOrder(targetId);
                  }}
                  className="flex-1 py-2.5 bg-red-900 hover:bg-red-800 text-white font-bold rounded-xl font-mono text-xs uppercase tracking-wider transition cursor-pointer shadow-lg"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

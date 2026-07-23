import React, { useState, useEffect } from "react";
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
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Upload,
  Star,
  Clock,
  Truck,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, Order, HomepageSection, Review } from "../types";
import { getDirectImageUrl } from "../utils";
import { CollectionForm, CollectionFormState } from "./CollectionForm";

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
      console.log("[Asset Sync] Scanning local storage for cached catalog images...");
      let syncCount = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("cached_img_/assets/catalog/")) {
          const url = key.replace("cached_img_", "");
          const base64 = localStorage.getItem(key);
          if (base64 && base64.startsWith("data:")) {
            try {
              console.log(`[Asset Sync] Uploading cached image to server: ${url}`);
              const res = await fetch("/api/upload-image", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ url, base64 })
              });
              if (res.ok) {
                syncCount++;
              }
            } catch (err) {
              console.error(`[Asset Sync] Failed to upload ${url}:`, err);
            }
          }
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
    if (!window.confirm("Are you sure you want to retire this homepage section?")) return;
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
        alert("Failed to delete section");
      }
    } catch (err) {
      console.error(err);
      setSyncStatus("failed");
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
    productType: "Single Item" as "Single Item" | "Two-Piece Set",
    primaryImage: "",
    images: [] as string[],
    stock: "15",
    color: "Forest Green",
    sizes: ["S", "M", "L", "XL"] as string[],
    topSizes: ["S", "M", "L"] as string[],
    bottomSizes: ["28", "30", "32", "34"] as string[],
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

  // Search filter inside tabs
  const [productSearch, setProductSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<"All" | "Processing" | "Shipped" | "Delivered">("All");
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
    codEnabled: true
  });

  // Customer Review Management States
  const [adminReviews, setAdminReviews] = useState<Review[]>([]);
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>("All");
  const [reviewSearch, setReviewSearch] = useState<string>("");
  const [isFetchingReviews, setIsFetchingReviews] = useState<boolean>(false);
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
    const localCms = localStorage.getItem("vartman_cms_config");
    const defaults = {
      announcementText: "",
      heroImageUrl: "",
      heroImageUrlMobile: "",
      heroTitle: "",
      heroSubtitle: "",
      heroCtaText: "",
      featuredProductIds: [] as string[],
      categoriesTitle: "Shop By Category",
      categories: [] as any[]
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
  const [cmsSubTab, setCmsSubTab] = useState<"general" | "categories">("general");

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
          JSON.stringify(prev.categories) !== JSON.stringify(cmsConfig.categories || []);

        if (isDifferent) {
          return {
            announcementText: cmsConfig.announcementText || "",
            heroImageUrl: cmsConfig.heroImageUrl || "",
            heroImageUrlMobile: cmsConfig.heroImageUrlMobile || "",
            heroTitle: cmsConfig.heroTitle || "",
            heroSubtitle: cmsConfig.heroSubtitle || "",
            heroCtaText: cmsConfig.heroCtaText || "",
            featuredProductIds: cmsConfig.featuredProductIds || [],
            categoriesTitle: cmsConfig.categoriesTitle || "Shop By Category",
            categories: cmsConfig.categories || []
          };
        }
        return prev;
      });
    }
  }, [cmsConfig]);

  // Instantly propagate CMS changes to parent, and save to Firestore/backend debounced
  useEffect(() => {
    onCmsUpdate(cmsForm);
    localStorage.setItem("vartman_cms_config", JSON.stringify(cmsForm));

    // Detect if we actually changed from cmsConfig to avoid setting "saving" on mount
    const isDifferent =
      cmsConfig && (
        cmsForm.announcementText !== (cmsConfig.announcementText || "") ||
        cmsForm.heroImageUrl !== (cmsConfig.heroImageUrl || "") ||
        cmsForm.heroImageUrlMobile !== (cmsConfig.heroImageUrlMobile || "") ||
        cmsForm.heroTitle !== (cmsConfig.heroTitle || "") ||
        cmsForm.heroSubtitle !== (cmsConfig.heroSubtitle || "") ||
        cmsForm.heroCtaText !== (cmsConfig.heroCtaText || "") ||
        JSON.stringify(cmsForm.featuredProductIds) !== JSON.stringify(cmsConfig.featuredProductIds || []) ||
        cmsForm.categoriesTitle !== (cmsConfig.categoriesTitle || "") ||
        JSON.stringify(cmsForm.categories) !== JSON.stringify(cmsConfig.categories || [])
      );

    if (isDifferent) {
      setSyncStatus("saving");
    }

    const timeoutId = setTimeout(async () => {
      if (!isDifferent) return;
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
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cmsForm, onCmsUpdate, authToken, cmsConfig]);

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
    if (activeTab === "crm") {
      loadCrmCustomers();
    }
  }, [activeTab, orders]);

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
        trouserSize: combo.trouserSize || basicDetails.bottomSizes[0] || "M"
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
      sizeGuideRef: basicDetails.sizeGuideImage,
      fitAndStyle: basicDetails.fitAndStyle,
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
      productType: combos.length > 0 ? ("Two-Piece Set" as const) : ("Single Item" as const),
      featured: false,
      tags: ["organic", "loomed"],
      genderPreference: "Unisex",
      "Gender Preference": "Unisex"
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
        setPaySettingsSuccess("Configuration secured in cloud Firestore vault!");
        setSyncStatus("synced");
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
    if (!window.confirm("Are you sure you want to trigger a full refund for this transaction? This will restore inventory stock counts.")) {
      return;
    }
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
      const res = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchReviews();
        onProductUpdate();
      }
    } catch (err) {
      console.error("Failed to update review status", err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this customer review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        fetchReviews();
        onProductUpdate();
      }
    } catch (err) {
      console.error("Failed to delete review", err);
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
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-moss block font-bold">vartman merchant</span>
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
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-linen/50 block">Vartman Operations Console</span>
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

                <div className="bg-ink p-5 rounded-xl border border-sand/20 space-y-1">
                  <span className="text-[10px] text-linen/40 uppercase tracking-wider font-mono font-bold block">2. Total Orders</span>
                  <span className="text-2xl font-serif font-black text-[#FAF9F5] block">{analytics.totalOrders || orders.length} Orders</span>
                  <span className="text-[10px] text-linen/50 font-mono block">AOV Ticket: ₹{Math.round(analytics.averageOrderValue || 0).toLocaleString("en-IN")}</span>
                </div>

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
        {activeTab === "products" && (
          <div className="space-y-6" id="admin-view-products">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold">Apparel Design Catalog</h2>
                <p className="text-xs text-linen/40 mt-0.5">Manage SKU variations, bulk pricing rules, and optimize product images.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
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
                      productType: "Single Item" as "Single Item" | "Two-Piece Set",
                      primaryImage: "",
                      images: [] as string[],
                      stock: "15",
                      color: "Forest Green",
                      sizes: ["S", "M", "L", "XL"] as string[],
                      topSizes: ["S", "M", "L"] as string[],
                      bottomSizes: ["28", "30", "32", "34"] as string[],
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
                      completeYourLook: ""
                    });
                    setProductVariants([]);
                    setIsAddOpen(true);
                  }}
                  id="admin-create-product-btn"
                  className="px-4 py-2 bg-moss hover:bg-moss-hover text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Release Design</span>
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
                <table className="w-full text-left text-xs" id="admin-products-table">
                  <thead>
                    <tr className="bg-ink text-linen/40 font-mono uppercase tracking-wider border-b border-sand/20/60 font-bold">
                      <th className="p-4">Apparel Design</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Sizes & Colors</th>
                      <th className="p-4">Inventory Reserves</th>
                      <th className="p-4 text-center">Telemetry Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {products
                      .filter(p => (p.name || "").toLowerCase().includes(productSearch.toLowerCase()) || (p.category || "").toLowerCase().includes(productSearch.toLowerCase()))
                      .map(p => (
                        <tr key={p.id} className="hover:bg-ink/45 transition">
                          <td className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-stone-800 overflow-hidden flex-shrink-0">
                              <img src={getDirectImageUrl(p.images?.[0]) || null} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-serif font-bold text-[#FAF9F5] block text-sm">{p.name}</span>
                              <span className="text-[10px] text-linen0 font-mono block">ID: {p.id}</span>
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
                                  setEditingProduct(p);
                                  setProductForm({
                                    productId: p.id || p.ID || "",
                                    name: p.Name || p.name || "",
                                    price: (p.Price !== undefined ? p.Price : p.price || 0).toString(),
                                    description: p.description || "",
                                    category: p.Category || p.category || "Loomed Shirts",
                                    productType: p.productType || (p.topSizes && p.topSizes.length > 0 ? "Two-Piece Set" : "Single Item") as "Single Item" | "Two-Piece Set",
                                    primaryImage: p.images?.[0] || "",
                                    images: p.images && p.images.length > 1 ? p.images.slice(1) : [],
                                    stock: (p.stock || 0).toString(),
                                    color: p.Colour || p.colors?.[0] || "Forest Green",
                                    sizes: p.Sizes || p.sizes || [],
                                    topSizes: p.topSizes || ["S", "M", "L"],
                                    bottomSizes: p.bottomSizes || ["28", "30", "32", "34"],
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
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: ORDER PROCESSING & FULFILLMENT ==================== */}
        {activeTab === "orders" && (
          <div className="space-y-6" id="admin-view-orders">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold">Fulfillment Control Center</h2>
                <p className="text-xs text-linen/40 mt-0.5">Track shipment statuses, print labels, or log customer returns.</p>
              </div>
              <div className="flex gap-2 bg-ink border border-sand/20 p-1 rounded-lg">
                {(["All", "Processing", "Shipped", "Delivered"] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition cursor-pointer ${
                      orderFilter === st 
                        ? "bg-moss text-moss font-bold border border-moss/30" 
                        : "text-linen/40 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Order search block */}
            <div className="flex bg-ink border border-sand/20 rounded-xl px-3 py-2 items-center gap-3">
              <Search className="w-4 h-4 text-linen/50" />
              <input
                type="text"
                placeholder="Query Ticket ID, customer name or dispatch address..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="bg-transparent w-full focus:outline-none text-xs text-linen/80 placeholder-stone-500"
              />
            </div>

            {/* Orders listing table */}
            <div className="bg-ink border border-sand/20 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" id="admin-orders-table">
                  <thead>
                    <tr className="bg-ink text-linen/40 font-mono uppercase tracking-wider border-b border-sand/20/60 font-bold">
                      <th className="p-4">Ticket ID</th>
                      <th className="p-4">Customer info</th>
                      <th className="p-4">Items Summary</th>
                      <th className="p-4">Value Settlement</th>
                      <th className="p-4">Fulfillment Phase</th>
                      <th className="p-4 text-center">Fulfillment Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {orders
                      .filter(o => orderFilter === "All" || o.status === orderFilter)
                      .filter(o => (o.id || "").toLowerCase().includes(orderSearch.toLowerCase()) || (o.customerName || "").toLowerCase().includes(orderSearch.toLowerCase()) || (o.shippingAddress?.city || "").toLowerCase().includes(orderSearch.toLowerCase()))
                      .map(o => (
                        <tr key={o.id} className="hover:bg-ink/45 transition">
                          <td className="p-4">
                            <span className="font-mono font-bold text-moss block">{o.id}</span>
                            <span className="text-[10px] text-linen/50 font-mono block mt-0.5">
                              {new Date(o.date).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-4 space-y-0.5">
                            <span className="font-serif font-bold text-[#FAF9F5] block text-sm">{o.customerName}</span>
                            <span className="text-[11px] text-linen/40 block">{o.customerEmail}</span>
                            <span className="text-[10px] text-linen/50 block leading-relaxed max-w-[200px] truncate">{o.shippingAddress.street}, {o.shippingAddress.city}</span>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              {(o.items || []).map((itm, i) => (
                                <div key={i} className="text-linen/60">
                                  {itm.name} <span className="text-linen/50">({itm.size || "M"})</span> <span className="font-mono font-bold text-moss">x{itm.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-sm font-bold text-linen/80 block">₹{Math.round(o.total || 0).toLocaleString("en-IN")}</span>
                            <span className="text-[9px] text-linen/50 font-mono block uppercase">{o.paymentMethod}</span>
                            {o.utr && (
                              <span className="mt-1.5 px-1.5 py-0.5 bg-moss/25 text-moss border border-moss/45 rounded text-[9px] font-mono font-bold block w-fit">
                                UTR: {o.utr}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="space-y-1.5">
                              <select
                                value={o.status}
                                onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
                                className="text-xs bg-ink border border-sand/20 text-linen/80 rounded p-1.5 font-mono focus:outline-none focus:border-moss/30"
                              >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                              {o.trackingNumber && (
                                <span className="text-[9px] text-linen/50 font-mono block">TRK: {o.trackingNumber}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center space-y-1.5">
                            <div className="flex flex-col items-center gap-1.5">
                              <button
                                onClick={() => setPrintingOrderLabel(o)}
                                className="px-2.5 py-1 bg-ink hover:bg-sand/15 border border-sand/20 text-linen/60 rounded text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                              >
                                <Printer className="w-3 h-3 text-moss" />
                                <span>Label</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedOrderForRefund(o);
                                  setRefundAmount(o.total.toString());
                                  setRefundReason("Sizing issue");
                                }}
                                className="px-2.5 py-1 bg-ink hover:bg-red-950/20 border border-sand/20 hover:border-red-900/50 text-linen/60 hover:text-red-400 rounded text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                              >
                                <Undo2 className="w-3 h-3" />
                                <span>Return/Refund</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
                        .map((rev) => (
                          <tr key={rev.id} className="hover:bg-stone-900/50 transition">
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
                          {orders.filter(o => o.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase()).map(o => (
                            <div key={o.id} className="p-2 bg-ink border border-sand/20 rounded flex justify-between items-center text-xs">
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
                      onChange={(e) => setCmsForm({ ...cmsForm, announcementText: e.target.value })}
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
                      onChange={(e) => setCmsForm({ ...cmsForm, heroImageUrl: e.target.value })}
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
              ) : (
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
                              {/* Left side: Upload area (strictly direct file uploads) */}
                              <div className="w-full sm:w-28 flex flex-col items-center justify-center space-y-2">
                                <div className="w-24 h-32 rounded-md border border-sand/15 bg-ink relative overflow-hidden flex items-center justify-center">
                                  {uploadingCategoryIndices[idx] ? (
                                    <div className="flex flex-col items-center justify-center gap-2">
                                      <RefreshCw className="w-5 h-5 text-[#B5652F] animate-spin" />
                                      <span className="text-[8px] text-linen/40 font-mono">Uploading...</span>
                                    </div>
                                  ) : cat.image ? (
                                    <img src={getDirectImageUrl(cat.image)} alt="" className="w-full h-full object-cover" />
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
                              <div className="flex-1 space-y-2 col-span-3">
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
              )}
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
                        placeholder="e.g. VARTMANMID772910"
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

                    <div className="space-y-2 pt-2 border-t border-sand/10">
                      <span className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Checkout Payment Methods</span>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-stone-900/50 rounded border border-sand/10 hover:border-sand/20">
                          <input
                            type="checkbox"
                            checked={payConfigForm.prepaidEnabled ?? true}
                            onChange={(e) => setPayConfigForm({ ...payConfigForm, prepaidEnabled: e.target.checked })}
                            className="rounded border-sand/20 text-moss focus:ring-moss"
                          />
                          <div>
                            <span className="block font-medium text-white">Prepaid (UPI/Card)</span>
                            <span className="text-[9px] text-linen/40">Online gateway payment</span>
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
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-stone-900/50 rounded border border-sand/10 hover:border-sand/20">
                        <input
                          type="checkbox"
                          checked={payConfigForm.intentEnabled}
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
                          checked={payConfigForm.qrEnabled}
                          onChange={(e) => setPayConfigForm({ ...payConfigForm, qrEnabled: e.target.checked })}
                          className="rounded border-sand/20 text-moss focus:ring-moss"
                        />
                        <div>
                          <span className="block font-medium">Dynamic QR</span>
                          <span className="text-[9px] text-linen/40">Desktop pixel rendering</span>
                        </div>
                      </label>
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
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(sec.id)}
                              className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 text-[10px] font-mono uppercase rounded flex items-center gap-1 transition cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Retire</span>
                            </button>
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
                <span className="font-serif font-bold text-base">{editingProduct ? "Modify Specifications" : "Release New Apparel Design"}</span>
                <button type="button" onClick={() => { setIsAddOpen(false); setEditingProduct(null); }} className="text-linen/50 hover:text-white">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {productError && <div className="p-3 bg-red-950/50 border border-red-900/60 text-red-300 rounded">{productError}</div>}
              {productSuccess && <div className="p-3 bg-moss/50 border border-moss/60 text-moss/80 rounded">{productSuccess}</div>}

              <CollectionForm
                initialProduct={editingProduct}
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
                  <h5 className="font-bold text-sm tracking-wider uppercase">VARTMAN ORGANICS INC.</h5>
                  <span className="text-[9px] block">SLOW TRAVEL SHIPPERS CO.</span>
                </div>
                <div className="text-right">
                  <span className="p-1 border border-stone-900 font-bold text-xs uppercase">FIRST CLASS</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-linen/50 uppercase block">FROM:</span>
                <p className="font-bold">Vartman Textiles Atelier</p>
                <p>14 Handloom Artisans Guild, Himachal, IN</p>
              </div>

              <div className="space-y-1 text-sm border-t border-b border-stone-900 py-3">
                <span className="text-[9px] text-linen/50 uppercase block">TO DISPATCH RECIPIENT:</span>
                <p className="font-bold text-base">{printingOrderLabel.customerName}</p>
                <p className="font-bold">{printingOrderLabel.shippingAddress.street}</p>
                <p className="font-bold">{printingOrderLabel.shippingAddress.city}, {printingOrderLabel.shippingAddress.state} - {printingOrderLabel.shippingAddress.zip}</p>
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
      </AnimatePresence>

    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, Ruler, Upload, HelpCircle, Sparkles, RefreshCw, X, Link2, Lock, Tag } from "lucide-react";
import { getDirectImageUrl } from "../utils";
import { Product } from "../types";

export interface CollectionFormState {
  basicDetails: {
    collectionId: string;
    fulfillmentCategory: string;
    collectionTitle: string;
    adminProductCode: string; // Unique private tracking code / SKU for admin use only
    brand: string;
    designPattern: string;
    fitStyle: string;
    colorName: string;
    colorHex: string;
    ratingScore: string;
    reviewsCount: string;
    fitAndStyle: string;
    shortDescription: string;
    productType?: "Single Item" | "Two-Piece Set" | "Three-Piece Set" | "Shoes";
    sizes: string[];
    topSizes: string[];
    bottomSizes: string[];
    shoeSizes: string[];
    sizeGuideImage: string;
    specifications: string;
    productNarrative: string;
    artisanCare: string;
  };
  variations: {
    color: string;
    colorHex?: string;
    keywords?: string[];
    images: string[];
    sellingPrice: string;
    mrp: string;
  }[];
  combos: {
    images: string[];
    sellingPrice: string;
    mrp: string;
    shirtSize?: string;
    trouserSize?: string;
    shoeSize?: string;
  }[];
}

export interface CollectionFormProps {
  initialProduct: Product | null;
  onSubmit: (formData: CollectionFormState) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  releaseType?: "apparel" | "footwear";
}

// Helper to initialize state from product
export const getInitialCollectionState = (
  product: Product | null,
  releaseType: "apparel" | "footwear" = "apparel"
): CollectionFormState => {
  const defaultTopSizes = ["S", "M", "L", "XL", "XXL", "XXXL"];
  const defaultTrouserSizes = ["26", "28", "30", "32", "34", "36", "38"];
  const defaultShoeSizes = ["6", "7", "8", "9", "10", "11", "12"];

  if (!product) {
    if (releaseType === "footwear") {
      return {
        basicDetails: {
          collectionId: "",
          fulfillmentCategory: "Footwear",
          collectionTitle: "",
          adminProductCode: "",
          brand: "Tirupati Merchandise Footwear",
          designPattern: "Solid",
          fitStyle: "Regular Fit",
          colorName: "Obsidian Black",
          colorHex: "#111111",
          ratingScore: "4.9",
          reviewsCount: "128",
          fitAndStyle: "REGULAR FIT",
          shortDescription: "",
          productType: "Shoes",
          sizes: defaultShoeSizes,
          topSizes: defaultTopSizes,
          bottomSizes: defaultTrouserSizes,
          shoeSizes: defaultShoeSizes,
          sizeGuideImage: "",
          specifications: JSON.stringify(
            {
              "SHOE_DETAILS": {
                "UPPER_MATERIAL": "Premium Suede & Breathable Mesh",
                "SOLE_MATERIAL": "Shock-Absorbing EVA",
                "CLOSURE": "Lace-up"
              }
            },
            null,
            2
          ),
          productNarrative: "",
          artisanCare: "",
        },
        variations: [
          {
            color: "Obsidian Black",
            colorHex: "#111111",
            keywords: ["footwear", "sneakers", "shoes", "tech runner", "suede"],
            images: [],
            sellingPrice: "6800",
            mrp: "7990"
          }
        ],
        combos: []
      };
    }
    return {
      basicDetails: {
        collectionId: "",
        fulfillmentCategory: "Shirt & Pant Combo",
        collectionTitle: "",
        adminProductCode: "",
        brand: "Tirupati Merchandise Heritage",
        designPattern: "Solid",
        fitStyle: "Regular Fit",
        colorName: "Linen White",
        colorHex: "#FDFDFD",
        ratingScore: "4.8",
        reviewsCount: "163",
        fitAndStyle: "REGULAR FIT",
        shortDescription: "",
        productType: "Two-Piece Set",
        sizes: defaultTopSizes,
        topSizes: defaultTopSizes,
        bottomSizes: defaultTrouserSizes,
        shoeSizes: defaultShoeSizes,
        sizeGuideImage: "",
        specifications: JSON.stringify(
          {
            "SHIRT_DETAILS": {
              "TEXTILE COMPOSITION": "100% Linen",
              "FIT": "Relaxed",
              "WEAVE DENSITY": "175 GSM",
              "BUTTON DETAILS": "Sustainably harvested Mother-of-Pearl shell buttons"
            },
            "TROUSER_DETAILS": {
              "WAIST": "Elasticated Drawstring",
              "POCKETS": "Side Seam",
              "MATERIAL & COMPOSITION": "100% Premium Flax Linen"
            }
          },
          null,
          2
        ),
        productNarrative: "",
        artisanCare: "",
      },
      variations: [
        {
          color: "Linen White",
          colorHex: "#FDFDFD",
          keywords: ["white colour", "regular fit", "half sleeves", "printed", "plain", "cotton"],
          images: [],
          sellingPrice: "4800",
          mrp: "5490"
        }
      ],
      combos: []
    };
  }

  const isFootwearProduct = (product.category || "").toLowerCase().includes("footwear") ||
                            (product.category || "").toLowerCase().includes("shoe") ||
                            (product.category || "").toLowerCase().includes("sneaker") ||
                            (product.tags || []).some((t: string) => t.toLowerCase().includes("footwear") || t.toLowerCase().includes("sneakers"));

  const isFootwear = releaseType === "footwear" || isFootwearProduct;

  const derivedProductType = product.productType || (
    isFootwear
      ? "Shoes"
      : (product.combos && product.combos.length > 0) || (product.category === "Shirt & Pant Combo") || (product.name || "").toLowerCase().includes("combo") || (product.name || "").toLowerCase().includes("set")
        ? "Two-Piece Set"
        : "Single Item"
  );

  // Parse specifications
  const specsStr = product.specs ? JSON.stringify(product.specs, null, 2) : "{}";
  const defaultFootwearSpecs = JSON.stringify({
    "SHOE_DETAILS": {
      "UPPER_MATERIAL": "Premium Suede & Breathable Mesh",
      "SOLE_MATERIAL": "Shock-Absorbing EVA",
      "CLOSURE": "Lace-up"
    }
  }, null, 2);

  // Validate bottomSizes: if it contains letter values (e.g. S, M, L, XL), fall back to defaultTrouserSizes
  const hasLetterBottomSizes = Array.isArray(product.bottomSizes) && product.bottomSizes.some((s: string) => /[a-zA-Z]/.test(String(s)));
  const validBottomSizes = (product.bottomSizes && product.bottomSizes.length > 0 && !hasLetterBottomSizes)
    ? product.bottomSizes
    : defaultTrouserSizes;

  return {
    basicDetails: {
      collectionId: product.id || "",
      fulfillmentCategory: product.category || (isFootwear ? "Footwear" : "Shirt & Pant Combo"),
      collectionTitle: product.title || product.name || "",
      adminProductCode: product.adminProductCode || product.referenceNumber || product.productCode || "",
      brand: product.brand || product.Brand || (isFootwear ? "Tirupati Merchandise Footwear" : "Tirupati Merchandise Heritage"),
      designPattern: product.designPattern || product.DesignPattern || "Solid",
      fitStyle: typeof product.fitStyle === "string" ? product.fitStyle : (typeof product.fitStyle === "string" ? product.fitStyle : (typeof product.fitAndStyle === "string" ? product.fitAndStyle : "Regular Fit")),
      colorName: product.colorName || product.Colour || (isFootwear ? "Obsidian Black" : "Linen White"),
      colorHex: product.colorHex || (isFootwear ? "#111111" : "#FDFDFD"),
      ratingScore: String(product.ratingAvg || product.rating || "4.8"),
      reviewsCount: String(product.reviewsCount || "163"),
      fitAndStyle: typeof product.fitAndStyle === "string" ? product.fitAndStyle : (typeof product.fitStyle === "string" ? product.fitStyle : "REGULAR FIT"),
      shortDescription: product.description || "",
      productType: derivedProductType as any,
      sizes: product.sizes || (derivedProductType === "Shoes" ? defaultShoeSizes : defaultTopSizes),
      topSizes: product.topSizes || defaultTopSizes,
      bottomSizes: validBottomSizes,
      shoeSizes: product.shoeSizes || defaultShoeSizes,
      sizeGuideImage: product.sizeGuideRef || "",
      specifications: specsStr !== "{}" ? specsStr : (isFootwear ? defaultFootwearSpecs : specsStr),
      productNarrative: product.inspiration || "",
      artisanCare: typeof product.compositionAndCare === "string" ? product.compositionAndCare : (product.compositionAndCare ? JSON.stringify(product.compositionAndCare) : ""),
    },
    variations: (product.variants && product.variants.length > 0)
      ? product.variants.map((v: any) => ({
          color: v.color || "",
          colorHex: v.colorHex || product.colorHex || (isFootwear ? "#111111" : "#FDFDFD"),
          keywords: Array.isArray(v.keywords)
            ? v.keywords
            : (v.keywords ? String(v.keywords).split(',').map(s => s.trim()).filter(Boolean) : (product.tags || [])),
          images: v.images || [],
          sellingPrice: String(v.price || v.sellingPrice || product.price || ""),
          mrp: String(v.mrp || product.mrp || ""),
        }))
      : [
          {
            color: product.colorName || product.colors?.[0] || product.Colour || (isFootwear ? "Obsidian Black" : "Linen White"),
            colorHex: product.colorHex || (isFootwear ? "#111111" : "#FDFDFD"),
            keywords: product.tags || (isFootwear ? ["footwear", "sneakers"] : ["linen white", "regular fit"]),
            images: product.images || [],
            sellingPrice: String(product.sellingPrice || product.price || ""),
            mrp: String(product.mrp || ""),
          }
        ],
    combos: (product as any).combos
      ? (product as any).combos.map((c: any) => ({
          images: c.images || [],
          sellingPrice: String(c.price || c.sellingPrice || ""),
          mrp: String(c.mrp || ""),
          shirtSize: c.shirtSize || "M",
          trouserSize: c.trouserSize || "M"
        }))
      : []
  };
};

// ==========================================
// DUAL OPTION GALLERY IMAGE PICKER (File Upload + Google Drive Link)
// ==========================================
export const GalleryImagePicker: React.FC<{
  images: string[];
  onAddImages: (newImages: string[]) => void;
  onRemoveImage: (index: number) => void;
  label?: string;
  idPrefix?: string;
}> = ({ images, onAddImages, onRemoveImage, label = "Images Gallery", idPrefix = "img-picker" }) => {
  const [activeTab, setActiveTab] = useState<"upload" | "drive">("upload");
  const [driveInput, setDriveInput] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const array = Array.from(files);
    const newImgs: string[] = [];
    let loadedCount = 0;
    array.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          newImgs.push(reader.result as string);
        }
        loadedCount++;
        if (loadedCount === array.length) {
          onAddImages(newImgs);
          setFeedback(`Uploaded ${newImgs.length} image(s) ✓`);
          setTimeout(() => setFeedback(""), 3000);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const processAndCommitDriveLinks = (textToProcess?: string) => {
    const text = textToProcess !== undefined ? textToProcess : driveInput;
    if (!text || !text.trim()) return;

    // Split by newlines or commas
    const rawLinks = text.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (rawLinks.length === 0) return;

    const parsedLinks = rawLinks.map((link) => getDirectImageUrl(link));
    if (parsedLinks.length > 0) {
      onAddImages(parsedLinks);
      setDriveInput("");
      setFeedback(`Added ${parsedLinks.length} Drive link(s) ✓`);
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const handleAddDriveLinks = () => {
    processAndCommitDriveLinks(driveInput);
  };

  return (
    <div className="space-y-3 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-linen/60 font-mono uppercase tracking-wider block font-bold">{label}</label>
          {feedback && (
            <span className="text-[9px] font-mono text-moss bg-moss/10 px-2 py-0.5 rounded border border-moss/30 animate-fadeIn">
              {feedback}
            </span>
          )}
        </div>
        
        {/* Dual Option Mode Switcher */}
        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 font-mono text-[9px]">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer ${
              activeTab === "upload" ? "bg-moss text-linen font-bold shadow" : "text-linen/50 hover:text-linen"
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Option 1: Upload Files</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("drive")}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer ${
              activeTab === "drive" ? "bg-moss text-linen font-bold shadow" : "text-linen/50 hover:text-linen"
            }`}
          >
            <Link2 className="w-3 h-3" />
            <span>Option 2: Google Drive Link</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Input Box: Upload vs Drive Link */}
        <div className="md:col-span-5">
          {activeTab === "upload" ? (
            <div
              onClick={() => document.getElementById(`${idPrefix}-file-input`)?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files);
              }}
              className="border border-dashed border-slate-700 hover:border-moss/60 bg-slate-950/80 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-slate-900 cursor-pointer transition duration-200 min-h-[110px]"
            >
              <input
                type="file"
                id={`${idPrefix}-file-input`}
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <Upload className="w-5 h-5 text-moss/80 mb-1.5" />
              <span className="text-[10px] text-linen/70 font-mono font-medium uppercase tracking-wider">Drag & Drop Images</span>
              <span className="text-[8px] text-linen/40 font-mono mt-0.5">or click to browse local files</span>
            </div>
          ) : (
            <div className="bg-slate-950/90 p-3 rounded-lg border border-slate-800 space-y-2 min-h-[110px]">
              <div className="flex items-center justify-between text-moss text-[10px] font-mono font-bold">
                <span className="flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Paste Google Drive Share Link(s)</span>
                </span>
              </div>
              <textarea
                rows={2}
                placeholder="https://drive.google.com/file/d/1ABC.../view?usp=sharing"
                value={driveInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setDriveInput(val);
                  if (
                    val.endsWith("\n") ||
                    val.endsWith(",") ||
                    val.endsWith(" ")
                  ) {
                    processAndCommitDriveLinks(val);
                  }
                }}
                onPaste={(e) => {
                  const pastedText = e.clipboardData.getData("text");
                  if (
                    pastedText &&
                    (pastedText.includes("drive.google.com") ||
                      pastedText.includes("googleusercontent.com") ||
                      pastedText.includes("http://") ||
                      pastedText.includes("https://"))
                  ) {
                    e.preventDefault();
                    processAndCommitDriveLinks(pastedText);
                  }
                }}
                onBlur={() => {
                  if (driveInput.trim()) {
                    processAndCommitDriveLinks(driveInput);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    processAndCommitDriveLinks(driveInput);
                  }
                }}
                className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-linen/90 text-xs font-mono focus:outline-none focus:border-moss/50 transition placeholder:text-slate-600"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-[8px] text-linen/40 font-mono">Multiple links allowed (newlines or commas)</span>
                <button
                  type="button"
                  onClick={handleAddDriveLinks}
                  disabled={!driveInput.trim()}
                  className="px-3 py-1 bg-moss hover:bg-moss/80 disabled:opacity-40 text-linen text-[9px] font-mono uppercase font-bold rounded flex items-center gap-1 cursor-pointer transition whitespace-nowrap"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Drive Link</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Gallery Preview Area */}
        <div className="md:col-span-7">
          {images && images.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-1.5 border border-slate-800 rounded-lg bg-slate-950/60">
              {images.map((img, imgIdx) => {
                const isDrive = img.includes("googleusercontent.com") || img.includes("drive.google.com");
                return (
                  <div key={imgIdx} className="relative w-16 h-20 bg-slate-900 rounded border border-slate-800 overflow-hidden group flex-shrink-0">
                    <img src={getDirectImageUrl(img)} alt={`Gallery item ${imgIdx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => onRemoveImage(imgIdx)}
                      className="absolute top-0.5 right-0.5 bg-black/80 hover:bg-red-950 hover:text-red-300 text-red-400 p-0.5 rounded-full transition cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[7px] font-mono text-linen/90 py-0.5 flex justify-between px-1">
                      <span>{imgIdx === 0 ? "MAIN" : `#${imgIdx}`}</span>
                      {isDrive && <span className="text-moss font-bold">DRIVE</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[110px] flex flex-col items-center justify-center border border-slate-900 bg-slate-950/30 rounded-lg p-2 text-center">
              <ImageIcon className="w-5 h-5 text-slate-700 mb-1" />
              <p className="text-[10px] text-linen/40 font-mono italic">No images loaded yet.</p>
              <p className="text-[8px] text-linen/25 font-mono mt-0.5">Use Option 1 (Upload Files) or Option 2 (Google Drive Link).</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SECTION 1: COLLECTION BASIC DETAILS Component
// ==========================================
export const CollectionBasicDetails: React.FC<{
  details: CollectionFormState["basicDetails"];
  onChange: (updated: Partial<CollectionFormState["basicDetails"]>) => void;
  onAutoFillAll?: (data: any) => void;
  onAutoFillRaw?: (rawData: string) => { varsCount: number; combosCount: number };
  releaseType?: "apparel" | "footwear";
}> = ({ details, onChange, onAutoFillAll, onAutoFillRaw, releaseType = "apparel" }) => {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotFile, setCopilotFile] = useState<File | null>(null);
  const [copilotPreview, setCopilotPreview] = useState<string>("");
  const [copilotHints, setCopilotHints] = useState("");
  const [isCopilotAnalyzing, setIsCopilotAnalyzing] = useState(false);
  const [copilotError, setCopilotError] = useState("");
  const [copilotSuccess, setCopilotSuccess] = useState("");
  const [sizeGuideTab, setSizeGuideTab] = useState<"upload" | "drive">("upload");
  const [sizeGuideDriveUrl, setSizeGuideDriveUrl] = useState("");
  const [autoFillText, setAutoFillText] = useState("");
  const [autoFillStatus, setAutoFillStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handlePopulateClick = () => {
    if (!autoFillText.trim()) {
      setAutoFillStatus({ type: "error", msg: "Please paste valid JSON data into the box before populating." });
      return;
    }

    try {
      if (onAutoFillRaw) {
        const result = onAutoFillRaw(autoFillText);
        setAutoFillStatus({
          type: "success",
          msg: `Successfully populated form state across Section 1 (Basic Details), Section 2 (${result.varsCount} Color Variation${result.varsCount === 1 ? "" : "s"})${releaseType !== "footwear" ? `, and Section 3 (${result.combosCount} Bundle Combo${result.combosCount === 1 ? "" : "s"})` : ""}!`
        });
      } else if (onAutoFillAll) {
        const parsed = JSON.parse(autoFillText.trim());
        onAutoFillAll(parsed);
        setAutoFillStatus({ type: "success", msg: "Successfully populated all sections ✓" });
      }
    } catch (err: any) {
      setAutoFillStatus({
        type: "error",
        msg: err.message || "Invalid JSON structure. Please check formatting and try again."
      });
    }
  };

  const categories = [
    "Footwear",
    "Sneakers",
    "Shoes",
    "Architectural Footwear",
    "Loomed Shirts",
    "Loomed Pants",
    "Artisan Robes",
    "Artisan Coats",
    "Men's T-Shirts",
    "Women's T-Shirts",
    "Shirt & Pant Combo",
    "LOOMED CO-ORD SETS",
    "SHIRT & TROUSER COMBO"
  ];

  const fits = [
    "REGULAR FIT",
    "FLOWING LOOSE FIT",
    "UNSTRUCTURED COMFORT FIT",
    "SLIM FIT",
    "OVERSIZED FIT"
  ];

  const standardSizes = ["S", "M", "L", "XL", "XXL", "XXXL"];
  const standardTrouserSizes = ["26", "28", "30", "32", "34", "36", "38"];
  const standardShoeSizes = ["6", "7", "8", "9", "10", "11", "12"];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ sizeGuideImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopilotFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCopilotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCopilotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopilotAnalyze = async () => {
    if (!copilotFile) {
      setCopilotError("Please select an apparel image to analyze first.");
      return;
    }

    setIsCopilotAnalyzing(true);
    setCopilotError("");
    setCopilotSuccess("");

    const token = localStorage.getItem("terrawander_token");
    const formData = new FormData();
    formData.append("image", copilotFile);
    formData.append("context", copilotHints);

    try {
      const res = await fetch("/api/admin/analyze-vision", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error(`Vision analysis failed with HTTP status ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received an invalid response from the server. The server might be restarting or offline. Please try again in a few moments.");
      }

      const data = await res.json();
      if (onAutoFillAll) {
        onAutoFillAll(data);
        setCopilotSuccess("Successfully analyzed apparel! Collection details have been auto-filled below.");
        setTimeout(() => {
          setIsCopilotOpen(false);
          setCopilotFile(null);
          setCopilotPreview("");
          setCopilotHints("");
          setCopilotSuccess("");
        }, 2500);
      }
    } catch (err: any) {
      console.error(err);
      setCopilotError(err.message || "An error occurred during AI analysis.");
    } finally {
      setIsCopilotAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 border border-slate-800 bg-slate-900/40 p-5 rounded-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-moss/20 text-moss text-xs font-mono font-bold">1</span>
          <h3 className="font-serif font-bold text-linen/90 text-sm uppercase tracking-wider">Section 1: Collection Basic Details</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-moss/30 to-moss/10 hover:from-moss/45 hover:to-moss/20 text-moss border border-moss/40 rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition duration-200 shadow-sm shadow-moss/5"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          AI Vision Copilot
        </button>
      </div>

      {isCopilotOpen && (
        <div className="p-4 bg-slate-950 border border-moss/30 rounded-lg space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <span className="font-mono font-bold uppercase tracking-wider text-moss flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              AI Vision Analysis Panel
            </span>
            <button
              type="button"
              onClick={() => setIsCopilotOpen(false)}
              className="text-linen/40 hover:text-linen transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-linen/60 leading-relaxed font-sans">
            Upload an image of your garment (or handloomed swatch). Our catalog copywriter model will automatically extract design features, suggest optimal pricing, select a matching category, and draft product descriptions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Drag Drop or Browse */}
            <div className="space-y-2">
              <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Garment Image</label>
              <div className="border border-dashed border-slate-800 bg-slate-900/20 rounded-lg p-4 flex flex-col items-center justify-center relative hover:border-slate-700 transition">
                {copilotPreview ? (
                  <div className="relative w-full aspect-video max-h-36 rounded overflow-hidden flex items-center justify-center">
                    <img src={copilotPreview} alt="Apparel preview" className="max-h-32 object-contain" />
                    <button
                      type="button"
                      onClick={() => { setCopilotFile(null); setCopilotPreview(""); }}
                      className="absolute top-1 right-1 bg-black/80 p-1 rounded-full text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-3 w-full">
                    <Upload className="w-6 h-6 text-linen/30 mb-2" />
                    <span className="text-[11px] text-linen/70 font-mono font-medium">BROWSE APPAREL</span>
                    <span className="text-[9px] text-linen/30 mt-1">PNG, JPG, or WEBP up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCopilotFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Right: Notes / Extra Hints */}
            <div className="space-y-2">
              <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Context / Styling Hints (Optional)</label>
              <textarea
                rows={4}
                value={copilotHints}
                onChange={(e) => setCopilotHints(e.target.value)}
                placeholder="e.g. Olive green unisex camp shirt, standard sizing, custom horn buttons, crafted in handloom village."
                className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200"
              />
            </div>
          </div>

          {copilotError && (
            <div className="p-2.5 bg-red-950/40 border border-red-900/50 text-red-400 rounded text-[11px] font-mono">
              ✕ {copilotError}
            </div>
          )}

          {copilotSuccess && (
            <div className="p-2.5 bg-moss/20 border border-moss/50 text-moss text-[11px] font-mono">
              ✓ {copilotSuccess}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              disabled={isCopilotAnalyzing}
              onClick={handleCopilotAnalyze}
              className="flex items-center gap-1.5 px-4 py-2 bg-moss hover:bg-moss/90 text-linen rounded font-mono uppercase font-bold text-xs tracking-wider cursor-pointer disabled:opacity-50 transition"
            >
              {isCopilotAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analyzing with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze & Auto-Fill
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MAGIC AUTO-FILL (RAW DATA) COMPONENT */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-moss flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            MAGIC AUTO-FILL (RAW DATA)
          </label>
          <span className="text-[9px] font-mono text-linen/40">
            Paste raw JSON to populate Section 1, 2 & 3
          </span>
        </div>

        <textarea
          rows={4}
          value={autoFillText}
          onChange={(e) => {
            setAutoFillText(e.target.value);
            if (autoFillStatus) setAutoFillStatus(null);
          }}
          placeholder={`Paste raw JSON master data here... E.g.
{
  "fulfillmentCategory": "SHIRT & TROUSER COMBO",
  "collectionTitle": "Handloomed Indigo Co-ord Set",
  "ratingsScore": 4.9,
  "numberOfRatings": 142,
  "brandLabel": "Tirupati Merchandise Heritage",
  "designPattern": "Solid",
  "fitStyle": "REGULAR FIT",
  "shortDescription": "• 100% Organic Cotton\\n• Hand-dyed in natural indigo",
  "tab1Specifications": { "Fabric": "100% Cotton", "Weave": "Handloom" },
  "variations": [
    {
      "colorName": "Indigo Blue",
      "hexCode": "#1A2332",
      "sellingPrice": "4800",
      "mrp": "5990",
      "searchKeywords": ["indigo blue", "regular fit", "cotton"]
    }
  ],
  "combos": [
    { "sellingPrice": "7990", "mrp": "9980", "shirtSize": "M", "trouserSize": "M" }
  ]
}`}
          className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-linen/90 text-xs font-mono focus:outline-none focus:border-moss/50 transition placeholder:text-slate-600 resize-y"
        />

        {autoFillStatus && (
          <div
            className={`p-2.5 rounded-lg text-[11px] font-mono flex items-center justify-between gap-2 ${
              autoFillStatus.type === "success"
                ? "bg-moss/20 border border-moss/50 text-moss"
                : "bg-red-950/40 border border-red-900/50 text-red-400"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{autoFillStatus.type === "success" ? "✓" : "✕"}</span>
              <span>{autoFillStatus.msg}</span>
            </div>
            <button
              type="button"
              onClick={() => setAutoFillStatus(null)}
              className="text-linen/40 hover:text-linen text-xs cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handlePopulateClick}
            disabled={!autoFillText.trim()}
            className="px-4 py-2 bg-moss hover:bg-moss/90 disabled:opacity-40 text-linen rounded-lg text-xs font-mono uppercase font-bold tracking-wider flex items-center gap-2 cursor-pointer transition shadow-md shadow-moss/10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Populate All Sections</span>
          </button>

          {autoFillText.trim() && (
            <button
              type="button"
              onClick={() => {
                setAutoFillText("");
                setAutoFillStatus(null);
              }}
              className="text-[10px] font-mono text-slate-400 hover:text-red-400 underline cursor-pointer"
            >
              Clear Raw Data
            </button>
          )}
        </div>
      </div>

      {/* INTERNAL PRODUCT CODE / SKU (ADMIN ONLY) */}
      <div className="p-3.5 bg-slate-950/90 border border-amber-900/40 rounded-xl space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            INTERNAL PRODUCT CODE / SKU
            <span className="text-[9px] font-mono font-normal text-amber-400/90 bg-amber-950/80 border border-amber-800/50 px-1.5 py-0.5 rounded ml-1">
              ADMIN ONLY
            </span>
          </label>
          <span className="text-[9px] font-mono text-linen/40 italic">
            Not visible on public website
          </span>
        </div>
        <input
          type="text"
          placeholder="e.g. SKU-2026-INDIGO-01 or VART-LMN-004 (Private Admin Tracking Code)"
          value={details.adminProductCode || ""}
          onChange={(e) => onChange({ adminProductCode: e.target.value })}
          className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500/50 transition placeholder:text-slate-600"
        />
        <p className="text-[10px] text-linen/50 font-sans leading-tight">
          Keep track of uploaded items & prevent duplicates. <strong className="text-amber-400/90 font-mono font-normal">Only visible to administrators</strong> in dashboard and search filters.
        </p>
      </div>

      {/* EXPLICIT PRODUCT TYPE SELECTOR */}
      <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-moss flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-moss" />
            PRODUCT TYPE ARCHITECTURE
          </label>
          <span className="text-[9px] font-mono text-linen/40">
            Select architecture (Single Item, 2-Piece, 3-Piece, Shoes)
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {(["Single Item", "Two-Piece Set", "Three-Piece Set", "Shoes"] as const).map((pType) => {
            const isSelected = (details.productType || (releaseType === "footwear" ? "Shoes" : "Single Item")) === pType;
            return (
              <button
                type="button"
                key={pType}
                onClick={() => {
                  let defaultCategory = details.fulfillmentCategory;
                  if (pType === "Shoes" && !["Footwear", "Sneakers", "Shoes"].includes(details.fulfillmentCategory)) {
                    defaultCategory = "Footwear";
                  } else if ((pType === "Two-Piece Set" || pType === "Three-Piece Set") && details.fulfillmentCategory === "Footwear") {
                    defaultCategory = "Shirt & Pant Combo";
                  }
                  onChange({
                    productType: pType,
                    fulfillmentCategory: defaultCategory
                  });
                }}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase transition flex items-center justify-center cursor-pointer border ${
                  isSelected
                    ? "bg-moss text-linen border-moss shadow-md"
                    : "bg-slate-900 text-linen/60 border-slate-800 hover:border-slate-700 hover:text-linen"
                }`}
              >
                {pType}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category & Title */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Fulfillment Category</label>
          <select
            value={details.fulfillmentCategory}
            onChange={(e) => onChange({ fulfillmentCategory: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-950">
                {cat.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Collection Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Linen Co-ord Set"
            value={details.collectionTitle}
            onChange={(e) => onChange({ collectionTitle: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200 font-sans"
          />
        </div>

        {/* Social Proof Overrides */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Ratings Score (Social Proof)</label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="5"
            placeholder="e.g. 5.0"
            value={details.ratingScore}
            onChange={(e) => onChange({ ratingScore: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Number of Ratings</label>
          <input
            type="number"
            placeholder="e.g. 163"
            value={details.reviewsCount}
            onChange={(e) => onChange({ reviewsCount: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200 font-mono"
          />
        </div>

        {/* Brand & Design Pattern */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Brand / Artisan Label</label>
          <select
            value={details.brand}
            onChange={(e) => onChange({ brand: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200"
          >
            {["Tirupati Merchandise Heritage", "Flanders Flax Guild", "Bengal Handloom Co.", "Loom & Slub Studio", "Artisan Nomad"].map((b) => (
              <option key={b} value={b} className="bg-slate-950">
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Design / Pattern</label>
          <select
            value={details.designPattern}
            onChange={(e) => onChange({ designPattern: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200"
          >
            {["Solid", "Striped", "Floral", "Checkered", "Graphic", "Textured"].map((dp) => (
              <option key={dp} value={dp} className="bg-slate-950">
                {dp}
              </option>
            ))}
          </select>
        </div>

        {/* Fit & Style */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Fit / Style Classification</label>
          <select
            value={details.fitStyle || details.fitAndStyle}
            onChange={(e) => onChange({ fitStyle: e.target.value, fitAndStyle: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200"
          >
            {["Regular Fit", "Slim Fit", "Oversized", "Relaxed Fit", "FLOWING LOOSE FIT"].map((fit) => (
              <option key={fit} value={fit} className="bg-slate-950">
                {fit}
              </option>
            ))}
          </select>
        </div>


        {/* Short Description */}
        <div className="space-y-1.5 md:col-span-2">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Short Description / Combo Details</label>
            <span className="text-[8px] text-moss font-mono uppercase font-semibold">Preserves line breaks & markdown</span>
          </div>
          <textarea
            required
            rows={4}
            placeholder={`• Includes 1x Linen Camp Shirt\n• Includes 1x Relaxed Drawstring Trouser\n\nEnter the primary narrative or combo highlights exactly as it should render...`}
            value={details.shortDescription}
            onChange={(e) => onChange({ shortDescription: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200 font-sans whitespace-pre-wrap"
          />
          <p className="text-[9px] text-linen/30 font-mono leading-relaxed mt-0.5">
            💡 Formatting and bullet items will be rendered exactly with strict line-break integrity on product detail pages.
          </p>
        </div>

        {/* Sizing & Sizing Guide File */}
        <div className="space-y-4 md:col-span-2 border border-slate-800 bg-slate-950/40 p-4 rounded-lg">
          <span className="text-[10px] text-amber-500 font-mono uppercase font-bold block border-b border-slate-800 pb-1.5">Size Matrices & Sizing Guide</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              const pType = details.productType || (releaseType === "footwear" ? "Shoes" : "Single Item");
              const isShoes = pType === "Shoes";
              const isThreePiece = pType === "Three-Piece Set";
              const isTwoPiece = pType === "Two-Piece Set";
              const isSingle = pType === "Single Item";

              const isBottomCat = (details.fulfillmentCategory || "").toLowerCase().includes("pant") ||
                                  (details.fulfillmentCategory || "").toLowerCase().includes("trouser") ||
                                  (details.fulfillmentCategory || "").toLowerCase().includes("bottom") ||
                                  (details.fulfillmentCategory || "").toLowerCase().includes("jeans");

              const showTopSizes = isTwoPiece || isThreePiece || (isSingle && !isBottomCat);
              const showBottomSizes = isTwoPiece || isThreePiece || (isSingle && isBottomCat);
              const showShoeSizes = isShoes || isThreePiece;

              return (
                <div className="space-y-3">
                  {/* AVAILABLE SHIRT SIZES */}
                  {showTopSizes && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-linen/40 font-mono uppercase tracking-wider block font-semibold text-moss">AVAILABLE SHIRT SIZES</label>
                      <div className="flex flex-wrap gap-1.5">
                        {standardSizes.map((sz) => {
                          const isSelected = (details.topSizes || []).includes(sz);
                          return (
                            <button
                              type="button"
                              key={`shirt-${sz}`}
                              onClick={() => {
                                const currentTop = details.topSizes || [];
                                const nextTopSizes = currentTop.includes(sz)
                                  ? currentTop.filter((s) => s !== sz)
                                  : [...currentTop, sz];
                                onChange({
                                  topSizes: nextTopSizes,
                                  sizes: Array.from(new Set([...nextTopSizes, ...(details.bottomSizes || [])]))
                                });
                              }}
                              className={`px-3 py-1.5 rounded text-xs font-mono transition duration-150 cursor-pointer ${
                                isSelected
                                  ? "bg-moss text-linen border border-moss font-bold"
                                  : "bg-slate-950 border border-slate-800 text-linen/60 hover:border-slate-700"
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* AVAILABLE TROUSER SIZES */}
                  {showBottomSizes && (
                    <div className={`space-y-1.5 ${showTopSizes ? "pt-2 border-t border-slate-800/40" : ""}`}>
                      <label className="text-[9px] text-linen/40 font-mono uppercase tracking-wider block font-semibold text-[#B5652F]">AVAILABLE TROUSER SIZES</label>
                      <div className="flex flex-wrap gap-1.5">
                        {standardTrouserSizes.map((sz) => {
                          const isSelected = (details.bottomSizes || []).includes(sz);
                          return (
                            <button
                              type="button"
                              key={`trouser-${sz}`}
                              onClick={() => {
                                const currentBottom = details.bottomSizes || [];
                                const nextBottomSizes = currentBottom.includes(sz)
                                  ? currentBottom.filter((s) => s !== sz)
                                  : [...currentBottom, sz];
                                onChange({
                                  bottomSizes: nextBottomSizes,
                                  sizes: Array.from(new Set([...(details.topSizes || []), ...nextBottomSizes]))
                                });
                              }}
                              className={`px-3 py-1.5 rounded text-xs font-mono transition duration-150 cursor-pointer ${
                                isSelected
                                  ? "bg-[#B5652F] text-linen border border-[#B5652F] font-bold"
                                  : "bg-slate-950 border border-slate-800 text-linen/60 hover:border-slate-700"
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* AVAILABLE SHOE SIZES */}
                  {showShoeSizes && (
                    <div className={`space-y-1.5 ${(showTopSizes || showBottomSizes) ? "pt-2 border-t border-slate-800/40" : ""}`}>
                      <label className="text-[9px] text-amber-500 font-mono uppercase tracking-wider block font-semibold">AVAILABLE SHOE SIZES (UK/IN)</label>
                      <div className="flex flex-wrap gap-1.5">
                        {standardShoeSizes.map((sz) => {
                          const isSelected = (details.shoeSizes || []).some(
                            (s) => s === sz || s === `UK ${sz}` || s.replace(/^UK\s*/i, "") === sz
                          );
                          return (
                            <button
                              type="button"
                              key={`shoe-${sz}`}
                              onClick={() => {
                                const currentShoe = details.shoeSizes || [];
                                const hasSz = currentShoe.some(
                                  (s) => s === sz || s === `UK ${sz}` || s.replace(/^UK\s*/i, "") === sz
                                );
                                const nextShoeSizes = hasSz
                                  ? currentShoe.filter((s) => s !== sz && s !== `UK ${sz}` && s.replace(/^UK\s*/i, "") !== sz)
                                  : [...currentShoe.filter((s) => s !== sz && s !== `UK ${sz}` && s.replace(/^UK\s*/i, "") !== sz), sz];
                                onChange({
                                  shoeSizes: nextShoeSizes,
                                  sizes: isShoes ? nextShoeSizes : details.sizes
                                });
                              }}
                              className={`px-3.5 py-1.5 rounded text-xs font-mono transition duration-150 cursor-pointer ${
                                isSelected
                                  ? "bg-amber-600 text-linen border border-amber-500 font-bold shadow"
                                  : "bg-slate-950 border border-slate-800 text-linen/60 hover:border-slate-700"
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[9px] text-linen/40 font-mono uppercase tracking-wider block">Sizing Guide Image</label>
                <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800 font-mono text-[8px]">
                  <button
                    type="button"
                    onClick={() => setSizeGuideTab("upload")}
                    className={`px-2 py-0.5 rounded transition ${sizeGuideTab === "upload" ? "bg-moss text-linen font-bold" : "text-linen/50 hover:text-linen"}`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizeGuideTab("drive")}
                    className={`px-2 py-0.5 rounded transition ${sizeGuideTab === "drive" ? "bg-moss text-linen font-bold" : "text-linen/50 hover:text-linen"}`}
                  >
                    Drive Link
                  </button>
                </div>
              </div>

              {sizeGuideTab === "upload" ? (
                <div
                  onClick={() => document.getElementById("size-guide-file")?.click()}
                  className="border border-dashed border-slate-800 bg-slate-950 hover:bg-slate-900/40 hover:border-slate-700 transition rounded-lg p-3 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <input
                    type="file"
                    id="size-guide-file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  {details.sizeGuideImage ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded overflow-hidden border border-slate-800">
                        <img src={getDirectImageUrl(details.sizeGuideImage)} alt="Size Guide" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] text-linen/60 font-mono">Image Loaded ✓</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-slate-500" />
                      <span className="text-[10px] text-linen/40 font-mono">Click to upload Size Guide</span>
                    </div>
                  )}
                  <span className="text-[9px] text-moss uppercase font-mono font-bold hover:underline">Browse</span>
                </div>
              ) : (
                <div className="space-y-1.5 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Paste Google Drive link (e.g. https://drive.google.com/file/d/.../view)"
                      value={sizeGuideDriveUrl}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSizeGuideDriveUrl(val);
                        if (val.trim() && (val.includes("drive.google.com") || val.includes("googleusercontent.com"))) {
                          onChange({ sizeGuideImage: getDirectImageUrl(val.trim()) });
                        }
                      }}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData("text");
                        if (pasted && pasted.trim()) {
                          onChange({ sizeGuideImage: getDirectImageUrl(pasted.trim()) });
                        }
                      }}
                      onBlur={() => {
                        if (sizeGuideDriveUrl.trim()) {
                          onChange({ sizeGuideImage: getDirectImageUrl(sizeGuideDriveUrl.trim()) });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (sizeGuideDriveUrl.trim()) {
                            onChange({ sizeGuideImage: getDirectImageUrl(sizeGuideDriveUrl.trim()) });
                          }
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-800 p-2 rounded text-linen/80 text-xs font-mono focus:outline-none focus:border-moss/40"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (sizeGuideDriveUrl.trim()) {
                          onChange({ sizeGuideImage: getDirectImageUrl(sizeGuideDriveUrl.trim()) });
                          setSizeGuideDriveUrl("");
                        }
                      }}
                      className="px-3 py-2 bg-moss hover:bg-moss/80 text-linen text-[9px] font-mono uppercase font-bold rounded cursor-pointer whitespace-nowrap"
                    >
                      Set Link
                    </button>
                  </div>
                  {details.sizeGuideImage && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-8 h-8 rounded overflow-hidden border border-slate-800">
                        <img src={getDirectImageUrl(details.sizeGuideImage)} alt="Size Guide" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] text-moss font-mono">Current Link Set ✓</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail Tabs Mapping Section */}
        <div className="md:col-span-2 border border-slate-800 bg-slate-950/40 p-4 rounded-lg space-y-4">
          <span className="text-[10px] text-moss font-mono uppercase font-bold block">Detail Tabs Content (Scribe specifications)</span>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider">Tab 1: Specifications (JSON template)</label>
                <span className="text-[9px] text-linen/30 font-mono">Must be valid JSON object (supports nesting)</span>
              </div>
              <textarea
                rows={6}
                value={details.specifications}
                onChange={(e) => onChange({ specifications: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs font-mono focus:outline-none focus:border-moss/40 transition duration-200"
                placeholder={
                  releaseType === "footwear"
                    ? `{\n  "SHOE_DETAILS": {\n    "UPPER_MATERIAL": "Premium Suede & Breathable Mesh",\n    "SOLE_MATERIAL": "Shock-Absorbing EVA",\n    "CLOSURE": "Lace-up"\n  }\n}`
                    : `{\n  "SHIRT_DETAILS": {\n    "TEXTILE COMPOSITION": "100% Linen",\n    "FIT": "Relaxed"\n  },\n  "TROUSER_DETAILS": {\n    "WAIST": "Elasticated Drawstring",\n    "POCKETS": "Side Seam"\n  }\n}`
                }
              />
              <p className="text-[9px] text-linen/30 font-mono leading-relaxed mt-0.5">
                💡 Enter separate specification sections (e.g. {releaseType === "footwear" ? "SHOE_DETAILS" : "SHIRT_DETAILS, TROUSER_DETAILS"}) as key-value items or nested objects.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Tab 2: Product Narrative / Inspiration Story</label>
              <textarea
                rows={3}
                value={details.productNarrative}
                onChange={(e) => onChange({ productNarrative: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200 font-sans"
                placeholder="Narrative quote or back story for wanderlust exploration..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Tab 3: Artisan & Care Instructions</label>
              <textarea
                rows={3}
                value={details.artisanCare}
                onChange={(e) => onChange({ artisanCare: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200 font-sans"
                placeholder="Details on cold hand washing, shade drying, and Jaipur weavers..."
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// KEYWORDS TAG INPUT COMPONENT
// ==========================================
export const KeywordsTagInput: React.FC<{
  keywords: string[];
  onChangeKeywords: (newKeywords: string[]) => void;
  label?: string;
}> = ({ keywords = [], onChangeKeywords, label = "SEARCH KEYWORDS" }) => {
  const [inputValue, setInputValue] = useState("");

  const processAndAddKeywords = (text: string) => {
    if (!text) return;
    const items = text
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (items.length === 0) return;

    // Deduplicate case-insensitively
    const existingLower = new Set(keywords.map((k) => k.toLowerCase()));
    const newItems: string[] = [];

    for (const item of items) {
      if (!existingLower.has(item.toLowerCase())) {
        newItems.push(item);
        existingLower.add(item.toLowerCase());
      }
    }

    if (newItems.length > 0) {
      onChangeKeywords([...keywords, ...newItems]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      processAndAddKeywords(val);
      setInputValue("");
    } else {
      setInputValue(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        processAndAddKeywords(inputValue);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && keywords.length > 0) {
      onChangeKeywords(keywords.slice(0, -1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted) {
      e.preventDefault();
      processAndAddKeywords(pasted);
      setInputValue("");
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      processAndAddKeywords(inputValue);
      setInputValue("");
    }
  };

  const removeKeyword = (idxToRemove: number) => {
    onChangeKeywords(keywords.filter((_, i) => i !== idxToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-linen/60 font-mono uppercase tracking-wider font-bold block">
          {label}
        </label>
        <span className="text-[9px] text-linen/40 font-mono">
          {keywords.length} tag{keywords.length === 1 ? "" : "s"} added
        </span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 space-y-2 focus-within:border-moss/50 transition">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder="Paste or type comma-separated keywords (e.g. white colour, regular fit, half sleeves, printed, cotton)"
          className="w-full bg-transparent text-linen/90 text-xs font-mono focus:outline-none placeholder:text-slate-600"
        />

        {keywords && keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-800/80">
            {keywords.map((kw, kwIdx) => (
              <span
                key={kwIdx}
                className="inline-flex items-center gap-1 bg-slate-950 border border-slate-750 text-linen/90 px-2.5 py-0.5 rounded text-[10px] font-mono shadow-sm group hover:border-moss/40 transition"
              >
                <span>{kw}</span>
                <button
                  type="button"
                  onClick={() => removeKeyword(kwIdx)}
                  className="text-slate-400 hover:text-red-400 p-0.5 rounded transition cursor-pointer"
                  title="Remove keyword tag"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => onChangeKeywords([])}
              className="text-[9px] font-mono text-red-400/70 hover:text-red-400 px-1 py-0.5 underline cursor-pointer self-center ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
      <p className="text-[8px] text-linen/30 font-mono">
        💡 Separate multiple keywords with commas or press Enter. Matches search queries & filter categories on storefront.
      </p>
    </div>
  );
};

// ==========================================
// SECTION 2: VARIATIONS Component
// ==========================================
export const CollectionVariations: React.FC<{
  variations: CollectionFormState["variations"];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, updated: Partial<CollectionFormState["variations"][number]>) => void;
}> = ({ variations, onAdd, onRemove, onChange }) => {

  const removeImage = (varIdx: number, imgIdx: number) => {
    const nextImages = variations[varIdx].images.filter((_, i) => i !== imgIdx);
    onChange(varIdx, { images: nextImages });
  };

  return (
    <div className="space-y-6 border border-slate-800 bg-slate-900/40 p-5 rounded-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-moss/20 text-moss text-xs font-mono font-bold">2</span>
          <div>
            <h3 className="font-serif font-bold text-linen/90 text-sm uppercase tracking-wider">Section 2: Color Variations</h3>
            <p className="text-[9px] text-linen/40 font-mono">Create unique combinations of color, custom images, price blocks, and search keywords.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="px-3.5 py-1.5 bg-moss hover:bg-moss/80 text-linen text-[10px] font-mono uppercase font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition duration-150"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Variant
        </button>
      </div>

      {variations.length === 0 ? (
        <div className="py-6 text-center border border-dashed border-slate-800 rounded-xl">
          <p className="text-[11px] text-linen/40 font-mono italic">No variations added. Add at least one color variant.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {variations.map((variant, idx) => {
            const sellingPriceNum = parseFloat(variant.sellingPrice) || 0;
            const mrpNum = parseFloat(variant.mrp) || 0;
            const discountPercent = mrpNum > sellingPriceNum && mrpNum > 0
              ? Math.round(((mrpNum - sellingPriceNum) / mrpNum) * 100)
              : 0;

            return (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4 relative">
                {variations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="absolute top-3 right-3 text-red-400 hover:text-red-300 p-1.5 rounded-full hover:bg-red-950/20 transition cursor-pointer z-10"
                    title="Remove Variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* ROW 1: COLOR SWATCH (HEX & NAME) & PRICING */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* COLOR SWATCH (HEX & NAME) */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block font-bold">
                      COLOR SWATCH (HEX & NAME)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      {/* Color Name Input */}
                      <div className="sm:col-span-7">
                        <input
                          type="text"
                          required
                          placeholder="Color Name (e.g. Linen White, Charcoal)"
                          value={variant.color}
                          onChange={(e) => onChange(idx, { color: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200"
                        />
                      </div>

                      {/* Color Hex & Color Picker Swatch */}
                      <div className="sm:col-span-5 flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
                        <div className="relative flex items-center justify-center shrink-0">
                          <input
                            type="color"
                            value={variant.colorHex || "#FDFDFD"}
                            onChange={(e) => onChange(idx, { colorHex: e.target.value })}
                            className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer p-0 opacity-0 absolute inset-0 z-10"
                            title="Pick Color Hex"
                          />
                          <div
                            className="w-7 h-7 rounded border border-slate-700 shadow-inner shrink-0"
                            style={{ backgroundColor: variant.colorHex || "#FDFDFD" }}
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="#FDFDFD"
                          value={variant.colorHex || "#FDFDFD"}
                          onChange={(e) => onChange(idx, { colorHex: e.target.value })}
                          className="w-full bg-transparent text-linen/90 text-xs font-mono uppercase focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Quick Preset Color Swatches */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[8px] text-linen/30 font-mono uppercase">Presets:</span>
                      {[
                        { name: "Linen White", hex: "#FDFDFD" },
                        { name: "Off-White", hex: "#F5F2EB" },
                        { name: "Charcoal", hex: "#2D313A" },
                        { name: "Olive Green", hex: "#4A5844" },
                        { name: "Midnight Navy", hex: "#1A2332" },
                        { name: "Terracotta", hex: "#B85A48" },
                        { name: "Sandy Beige", hex: "#D4C3AC" }
                      ].map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => onChange(idx, { color: variant.color || preset.name, colorHex: preset.hex })}
                          className="w-4 h-4 rounded-full border border-slate-700 hover:scale-110 transition cursor-pointer shadow-sm"
                          style={{ backgroundColor: preset.hex }}
                          title={`${preset.name} (${preset.hex})`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Pricing Inputs */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Selling Price (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 4800"
                      value={variant.sellingPrice}
                      onChange={(e) => onChange(idx, { sellingPrice: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider">MRP / List Price (₹)</label>
                      {discountPercent > 0 && (
                        <span className="text-[9px] font-mono text-moss font-bold bg-moss/10 px-1.5 rounded">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5490"
                      value={variant.mrp}
                      onChange={(e) => onChange(idx, { mrp: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200 font-mono"
                    />
                  </div>
                </div>

                {/* ROW 2: SEARCH KEYWORDS TAG INPUT SYSTEM */}
                <KeywordsTagInput
                  keywords={variant.keywords || []}
                  onChangeKeywords={(newKws) => onChange(idx, { keywords: newKws })}
                  label="SEARCH KEYWORDS"
                />

                {/* ROW 3: VARIANT IMAGES GALLERY */}
                <GalleryImagePicker
                  images={variant.images || []}
                  label="Variant Images Gallery"
                  idPrefix={`variant-${idx}`}
                  onAddImages={(newImages) => {
                    const currentImages = variant.images || [];
                    onChange(idx, { images: [...currentImages, ...newImages] });
                  }}
                  onRemoveImage={(imgIdx) => {
                    removeImage(idx, imgIdx);
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==========================================
// SECTION 3: COMBOS Component
// ==========================================
export const CollectionCombos: React.FC<{
  combos: CollectionFormState["combos"];
  topSizes: string[];
  bottomSizes: string[];
  shoeSizes?: string[];
  showShoeSize?: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, updated: Partial<CollectionFormState["combos"][number]>) => void;
}> = ({ combos, topSizes = ["S", "M", "L", "XL", "XXL"], bottomSizes = ["26", "28", "30", "32", "34", "36", "38"], shoeSizes = ["6", "7", "8", "9", "10", "11", "12"], showShoeSize = false, onAdd, onRemove, onChange }) => {

  const handleFileUpload = (index: number, files: FileList | null) => {
    if (!files) return;
    const array = Array.from(files);
    array.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const currentImages = combos[index].images || [];
        onChange(index, { images: [...currentImages, reader.result as string] });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (comboIdx: number, imgIdx: number) => {
    const nextImages = combos[comboIdx].images.filter((_, i) => i !== imgIdx);
    onChange(comboIdx, { images: nextImages });
  };

  return (
    <div className="space-y-6 border border-slate-800 bg-slate-900/40 p-5 rounded-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-moss/20 text-moss text-xs font-mono font-bold">3</span>
          <div>
            <h3 className="font-serif font-bold text-linen/90 text-sm uppercase tracking-wider">Section 3: Bundle Combos</h3>
            <p className="text-[9px] text-linen/40 font-mono">Create bundled offers within the collection (e.g. Pant + Shirt Combo).</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="px-3.5 py-1.5 bg-moss hover:bg-moss/80 text-linen text-[10px] font-mono uppercase font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition duration-150"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Combo
        </button>
      </div>

      {combos.length === 0 ? (
        <div className="py-6 text-center border border-dashed border-slate-800 rounded-xl">
          <p className="text-[11px] text-linen/40 font-mono italic">No bundle combos configured yet. Click "+ Add Combo" if applicable.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {combos.map((combo, idx) => {
            const sellingPriceNum = parseFloat(combo.sellingPrice) || 0;
            const mrpNum = parseFloat(combo.mrp) || 0;
            const discountPercent = mrpNum > sellingPriceNum && mrpNum > 0
              ? Math.round(((mrpNum - sellingPriceNum) / mrpNum) * 100)
              : 0;

            return (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4 relative animate-fadeIn">
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-300 p-1.5 rounded-full hover:bg-red-950/20 transition cursor-pointer"
                  title="Remove Combo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Pricing */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Combo Selling Price (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 7990"
                      value={combo.sellingPrice}
                      onChange={(e) => onChange(idx, { sellingPrice: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider">Combo MRP / Compare Price (₹)</label>
                      {discountPercent > 0 && (
                        <span className="text-[9px] font-mono text-moss font-bold bg-moss/10 px-1.5 rounded">
                          Combo {discountPercent}% OFF
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 9980"
                      value={combo.mrp}
                      onChange={(e) => onChange(idx, { mrp: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200 font-mono"
                    />
                  </div>
                </div>

                {/* Mixed Size Association */}
                <div className={`grid grid-cols-1 ${showShoeSize ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4 bg-slate-900/40 p-3.5 rounded-lg border border-slate-800/60`}>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-moss font-mono uppercase tracking-wider block font-semibold">Associated Shirt Size (Top)</label>
                    <select
                      value={combo.shirtSize || (topSizes && topSizes[0]) || "M"}
                      onChange={(e) => onChange(idx, { shirtSize: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition font-mono"
                    >
                      {(topSizes && topSizes.length > 0 ? topSizes : ["S", "M", "L", "XL", "XXL", "XXXL"]).map((sz) => (
                        <option key={sz} value={sz} className="bg-slate-950">
                          {sz} (Shirt SKU Link)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#B5652F] font-mono uppercase tracking-wider block font-semibold">Associated Trouser Size (Bottom)</label>
                    <select
                      value={combo.trouserSize || (bottomSizes && bottomSizes[0]) || "30"}
                      onChange={(e) => onChange(idx, { trouserSize: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition font-mono"
                    >
                      {(bottomSizes && bottomSizes.length > 0 ? bottomSizes : ["26", "28", "30", "32", "34", "36", "38"]).map((sz) => (
                        <option key={sz} value={sz} className="bg-slate-950">
                          {sz} (Trouser SKU Link)
                        </option>
                      ))}
                    </select>
                  </div>

                  {showShoeSize && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-amber-500 font-mono uppercase tracking-wider block font-semibold">Associated Shoe Size (Footwear)</label>
                      <select
                        value={combo.shoeSize || (shoeSizes && shoeSizes[0]) || "9"}
                        onChange={(e) => onChange(idx, { shoeSize: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-linen/80 text-xs focus:outline-none focus:border-amber-500/40 transition font-mono"
                      >
                        {(shoeSizes && shoeSizes.length > 0 ? shoeSizes : ["6", "7", "8", "9", "10", "11", "12"]).map((sz) => (
                          <option key={sz} value={sz} className="bg-slate-950">
                            {sz} (Shoe SKU Link)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Combo Images Upload and Previews (Dual Option: Direct Upload or Google Drive Links) */}
                <GalleryImagePicker
                  images={combo.images || []}
                  label="Combo Promo Image Gallery"
                  idPrefix={`combo-${idx}`}
                  onAddImages={(newImages) => {
                    const currentImages = combo.images || [];
                    onChange(idx, { images: [...currentImages, ...newImages] });
                  }}
                  onRemoveImage={(imgIdx) => {
                    removeImage(idx, imgIdx);
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==========================================
// MASTER COLLECTION FORM COMPONENT
// ==========================================
export const CollectionForm: React.FC<CollectionFormProps> = ({
  initialProduct,
  onSubmit,
  onCancel,
  isSubmitting = false,
  releaseType = "apparel"
}) => {
  const [formState, setFormState] = useState<CollectionFormState>(() =>
    getInitialCollectionState(initialProduct, releaseType)
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setFormState(getInitialCollectionState(initialProduct, releaseType));
  }, [initialProduct?.id, releaseType]);

  const handleBasicDetailsChange = (updated: Partial<CollectionFormState["basicDetails"]>) => {
    setFormState((prev) => ({
      ...prev,
      basicDetails: {
        ...prev.basicDetails,
        ...updated
      }
    }));
  };

  const handleAutoFillRaw = (rawDataInput: any): { varsCount: number; combosCount: number } => {
    let data: any;
    if (typeof rawDataInput === "string") {
      const trimmed = rawDataInput.trim();
      if (!trimmed) {
        throw new Error("Raw data text box is empty. Please paste valid JSON data.");
      }
      let jsonStr = trimmed;
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
      }
      try {
        data = JSON.parse(jsonStr);
      } catch (err) {
        throw new Error("Invalid JSON format. Please verify syntax (quotes, brackets, commas) and try again.");
      }
    } else if (typeof rawDataInput === "object" && rawDataInput !== null) {
      data = rawDataInput;
    } else {
      throw new Error("Invalid data format provided.");
    }

    if (typeof data !== "object" || data === null) {
      throw new Error("Raw data must be a JSON object.");
    }

    // SECTION 1: Basic Details
    const s1 = data.section_1 || data.basicDetails || data.section1 || data;

    const rawCat = s1.fulfillmentCategory || s1.fulfillment_category || s1.category || data.fulfillmentCategory || data.fulfillment_category || data.category;
    let matchedCategory: string | undefined;
    if (rawCat) {
      const upperCat = String(rawCat).toUpperCase();
      if (upperCat.includes("PANT COMBO") || upperCat.includes("TROUSER COMBO") || upperCat.includes("CO-ORD") || upperCat.includes("COMBO")) {
        matchedCategory = "SHIRT & TROUSER COMBO";
      } else if (upperCat.includes("SHIRT")) {
        matchedCategory = "Loomed Shirts";
      } else if (upperCat.includes("PANT")) {
        matchedCategory = "Loomed Pants";
      } else {
        matchedCategory = String(rawCat);
      }
    }

    const collectionTitle = s1.collectionTitle || s1.collection_title || s1.title || s1.name || data.collectionTitle || data.collection_title || data.title || data.name;

    const adminProductCodeParsed = s1.adminProductCode || s1.admin_product_code || s1.productCode || s1.product_code || s1.referenceNumber || s1.reference_number || s1.sku || s1.skuCode || s1.sku_code || data.adminProductCode || data.productCode || data.referenceNumber || data.sku;

    const ratingScore = s1.ratingsScore || s1.ratings_score || s1.ratingScore || s1.rating_score || s1.rating || data.ratingsScore || data.ratings_score || data.ratingScore || data.rating_score || data.rating;

    const reviewsCount = s1.numberOfRatings || s1.number_of_ratings || s1.reviewsCount || s1.reviews_count || s1.ratingsCount || s1.ratings_count || s1.reviews || data.numberOfRatings || data.number_of_ratings || data.reviewsCount || data.reviews_count;

    const brand = s1.brandLabel || s1.brand_label || s1.brand || s1.brandName || s1.brand_name || data.brandLabel || data.brand_label || data.brand;

    const designPattern = s1.designPattern || s1.design_pattern || s1.pattern || s1.design || data.designPattern || data.design_pattern || data.pattern || data.design;

    const fitStyle = s1.fitStyle || s1.fit_style || s1.fitAndStyle || s1.fit_and_style || s1.fit || data.fitStyle || data.fit_style || data.fitAndStyle || data.fit_and_style || data.fit;

    const shortDescription = s1.shortDescription || s1.short_description || s1.description || s1.details || data.shortDescription || data.short_description || data.description;

    const rawSpecs = s1.tab1Specifications || s1.tab_1_specifications || s1.specifications || s1.specs || s1.tab1_specifications || data.tab1Specifications || data.tab_1_specifications || data.specifications;
    let specificationsStr: string | undefined;
    if (typeof rawSpecs === "object" && rawSpecs !== null) {
      specificationsStr = JSON.stringify(rawSpecs, null, 2);
    } else if (rawSpecs) {
      specificationsStr = String(rawSpecs);
    }

    // SECTION 2: Variations
    const rawVariations = data.section_2_variations || data.variations || data.variants || data.colorVariations || data.color_variations || data.color_variants || data.colorVariants || [];
    let parsedVars: CollectionFormState["variations"] = [];
    if (Array.isArray(rawVariations) && rawVariations.length > 0) {
      parsedVars = rawVariations.map((v: any, idx: number) => {
        const colorName = v.colorName || v.color_name || v.colour_name || v.color || v.colour || v.name || `Variant ${idx + 1}`;
        const hexCode = v.hexCode || v.hex_code || v.colorHex || v.color_hex || v.hex || "#FDFDFD";
        const sellingPrice = v.sellingPrice ?? v.selling_price ?? v.price ?? "";
        const mrp = v.mrp ?? v.mrpPrice ?? v.mrp_price ?? v.comparePrice ?? "";
        
        let rawKws = v.searchKeywords ?? v.search_keywords ?? v.keywords ?? v.tags;
        let keywordsArr: string[] = [];
        if (Array.isArray(rawKws)) {
          keywordsArr = rawKws.map((k: any) => String(k).trim()).filter(Boolean);
        } else if (typeof rawKws === "string") {
          keywordsArr = rawKws.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
        }

        let rawImgs = v.images || v.image_urls || [];
        let imagesArr: string[] = [];
        if (Array.isArray(rawImgs)) {
          imagesArr = rawImgs.map((img: any) => String(img).trim()).filter(Boolean);
        } else if (typeof rawImgs === "string") {
          imagesArr = rawImgs.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
        }

        return {
          color: String(colorName),
          colorHex: String(hexCode),
          keywords: keywordsArr,
          sellingPrice: String(sellingPrice),
          mrp: String(mrp),
          images: imagesArr
        };
      });
    }

    // SECTION 3: Combos
    const rawCombos = data.section_3_bundles || data.combos || data.bundles || data.bundleCombos || data.bundle_combos || [];
    let parsedCombos: CollectionFormState["combos"] = [];
    if (Array.isArray(rawCombos) && rawCombos.length > 0) {
      parsedCombos = rawCombos.map((b: any) => {
        const sellingPrice = b.sellingPrice ?? b.selling_price ?? b.price ?? "";
        const mrp = b.mrp ?? b.mrpPrice ?? b.mrp_price ?? "";
        const shirtSize = b.shirtSize || b.shirt_size || b.topSize || b.top_size || "M";
        const trouserSize = b.trouserSize || b.trouser_size || b.bottomSize || b.bottom_size || "M";

        let rawImgs = b.images || b.image_urls || [];
        let imagesArr: string[] = [];
        if (Array.isArray(rawImgs)) {
          imagesArr = rawImgs.map((img: any) => String(img).trim()).filter(Boolean);
        } else if (typeof rawImgs === "string") {
          imagesArr = rawImgs.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
        }

        return {
          sellingPrice: String(sellingPrice),
          mrp: String(mrp),
          shirtSize: String(shirtSize),
          trouserSize: String(trouserSize),
          images: imagesArr
        };
      });
    }

    // Perform state overwrite
    setFormState((prev) => ({
      ...prev,
      basicDetails: {
        ...prev.basicDetails,
        fulfillmentCategory: matchedCategory !== undefined ? matchedCategory : prev.basicDetails.fulfillmentCategory,
        collectionTitle: collectionTitle !== undefined ? String(collectionTitle) : prev.basicDetails.collectionTitle,
        adminProductCode: adminProductCodeParsed !== undefined ? String(adminProductCodeParsed) : prev.basicDetails.adminProductCode,
        ratingScore: ratingScore !== undefined ? String(ratingScore) : prev.basicDetails.ratingScore,
        reviewsCount: reviewsCount !== undefined ? String(reviewsCount) : prev.basicDetails.reviewsCount,
        brand: brand !== undefined ? String(brand) : prev.basicDetails.brand,
        designPattern: designPattern !== undefined ? String(designPattern) : prev.basicDetails.designPattern,
        fitStyle: fitStyle !== undefined ? String(fitStyle) : prev.basicDetails.fitStyle,
        fitAndStyle: fitStyle !== undefined ? String(fitStyle) : prev.basicDetails.fitAndStyle,
        colorName: parsedVars[0]?.color || prev.basicDetails.colorName,
        colorHex: parsedVars[0]?.colorHex || prev.basicDetails.colorHex,
        shortDescription: shortDescription !== undefined ? String(shortDescription) : prev.basicDetails.shortDescription,
        specifications: specificationsStr !== undefined ? specificationsStr : prev.basicDetails.specifications
      },
      variations: parsedVars.length > 0 ? parsedVars : prev.variations,
      combos: parsedCombos.length > 0 ? parsedCombos : prev.combos
    }));

    return {
      varsCount: parsedVars.length,
      combosCount: parsedCombos.length
    };
  };

  const handleAutoFillAll = (data: any) => {
    handleAutoFillRaw(data);
  };

  const handleAddVariation = () => {
    setFormState((prev) => ({
      ...prev,
      variations: [
        ...prev.variations,
        { color: "", colorHex: "#FDFDFD", keywords: [], images: [], sellingPrice: "", mrp: "" }
      ]
    }));
  };

  const handleRemoveVariation = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const handleVariationChange = (index: number, updated: Partial<CollectionFormState["variations"][number]>) => {
    setFormState((prev) => {
      const nextVars = [...prev.variations];
      nextVars[index] = {
        ...nextVars[index],
        ...updated
      };
      return {
        ...prev,
        variations: nextVars
      };
    });
  };

  const handleAddCombo = () => {
    setFormState((prev) => ({
      ...prev,
      combos: [
        ...prev.combos,
        {
          images: [],
          sellingPrice: "",
          mrp: "",
          shirtSize: prev.basicDetails.topSizes[0] || "M",
          trouserSize: prev.basicDetails.bottomSizes[0] || "M"
        }
      ]
    }));
  };

  const handleRemoveCombo = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      combos: prev.combos.filter((_, i) => i !== index)
    }));
  };

  const handleComboChange = (index: number, updated: Partial<CollectionFormState["combos"][number]>) => {
    setFormState((prev) => {
      const nextCombos = [...prev.combos];
      nextCombos[index] = {
        ...nextCombos[index],
        ...updated
      };
      return {
        ...prev,
        combos: nextCombos
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Simple validation
    if (!formState.basicDetails.collectionTitle.trim()) {
      setErrorMsg("Collection Title is required.");
      return;
    }

    if (!formState.basicDetails.shortDescription.trim()) {
      setErrorMsg("Short Description / Combo Details narrative is required.");
      return;
    }

    if (formState.variations.length === 0) {
      setErrorMsg("At least one Variation is required to compile a collection.");
      return;
    }

    // JSON Validation for specifications
    try {
      JSON.parse(formState.basicDetails.specifications);
    } catch (e: any) {
      setErrorMsg(`Invalid JSON format in Tab 1 Specifications: ${e.message}`);
      return;
    }

    onSubmit(formState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-10">
      {errorMsg && (
        <div className="p-3.5 bg-red-950/40 border border-red-900/60 text-red-300 rounded-lg text-xs font-mono">
          ✕ {errorMsg}
        </div>
      )}

      {/* Section 1 */}
      <CollectionBasicDetails
        details={formState.basicDetails}
        onChange={handleBasicDetailsChange}
        onAutoFillAll={handleAutoFillAll}
        onAutoFillRaw={handleAutoFillRaw}
        releaseType={releaseType}
      />

      {/* Section 2 */}
      <CollectionVariations
        variations={formState.variations}
        onAdd={handleAddVariation}
        onRemove={handleRemoveVariation}
        onChange={handleVariationChange}
      />

      {/* Section 3 (Apparel / Combos / Multi-piece Sets) */}
      {(releaseType !== "footwear" || formState.basicDetails.productType === "Three-Piece Set") && (
        <CollectionCombos
          combos={formState.combos}
          topSizes={formState.basicDetails.topSizes}
          bottomSizes={formState.basicDetails.bottomSizes}
          shoeSizes={formState.basicDetails.shoeSizes}
          showShoeSize={formState.basicDetails.productType === "Three-Piece Set"}
          onAdd={handleAddCombo}
          onRemove={handleRemoveCombo}
          onChange={handleComboChange}
        />
      )}

      {/* Form Action Controls */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-linen/75 hover:text-linen rounded-lg text-xs font-mono uppercase font-bold border border-slate-800 tracking-wider cursor-pointer transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-moss hover:bg-moss/90 text-linen rounded-lg text-xs font-mono uppercase font-bold tracking-wider cursor-pointer shadow-md shadow-moss/10 disabled:opacity-50 transition"
        >
          {isSubmitting
            ? "Compiling..."
            : initialProduct
            ? "Update Collection"
            : releaseType === "footwear"
            ? "Release Footwear Design"
            : "Release Collection"}
        </button>
      </div>
    </form>
  );
};

export const FootwearReleaseForm: React.FC<Omit<CollectionFormProps, "releaseType">> = (props) => (
  <CollectionForm {...props} releaseType="footwear" />
);

export const ProductReleaseForm: React.FC<CollectionFormProps & { type?: "apparel" | "footwear" }> = ({ type, releaseType, ...props }) => (
  <CollectionForm {...props} releaseType={type || releaseType || "apparel"} />
);


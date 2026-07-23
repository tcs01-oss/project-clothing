import React, { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, Ruler, Upload, HelpCircle, Sparkles, RefreshCw, X } from "lucide-react";
import { getDirectImageUrl } from "../utils";
import { Product } from "../types";

export interface CollectionFormState {
  basicDetails: {
    collectionId: string;
    fulfillmentCategory: string;
    collectionTitle: string;
    ratingScore: string;
    reviewsCount: string;
    fitAndStyle: string;
    shortDescription: string;
    sizes: string[];
    topSizes: string[];
    bottomSizes: string[];
    sizeGuideImage: string;
    specifications: string;
    productNarrative: string;
    artisanCare: string;
  };
  variations: {
    color: string;
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
  }[];
}

interface CollectionFormProps {
  initialProduct: Product | null;
  onSubmit: (formData: CollectionFormState) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// Helper to initialize state from product
export const getInitialCollectionState = (product: Product | null): CollectionFormState => {
  if (!product) {
    return {
      basicDetails: {
        collectionId: "",
        fulfillmentCategory: "Shirt & Pant Combo",
        collectionTitle: "",
        ratingScore: "5.0",
        reviewsCount: "163",
        fitAndStyle: "REGULAR FIT",
        shortDescription: "",
        sizes: ["S", "M", "L", "XL", "XXL"],
        topSizes: ["S", "M", "L", "XL", "XXL"],
        bottomSizes: ["S", "M", "L", "XL", "XXL"],
        sizeGuideImage: "",
        specifications: JSON.stringify({
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
        }, null, 2),
        productNarrative: "",
        artisanCare: "",
      },
      variations: [
        { color: "Linen White", images: [], sellingPrice: "4800", mrp: "5490" }
      ],
      combos: []
    };
  }

  // Parse specifications
  const specsStr = product.specs ? JSON.stringify(product.specs, null, 2) : "{}";

  return {
    basicDetails: {
      collectionId: product.id || "",
      fulfillmentCategory: product.category || "Shirt & Pant Combo",
      collectionTitle: product.title || product.name || "",
      ratingScore: String(product.ratingAvg || product.rating || "5.0"),
      reviewsCount: String(product.reviewsCount || "163"),
      fitAndStyle: product.fitAndStyle || "REGULAR FIT",
      shortDescription: product.description || "",
      sizes: product.sizes || ["S", "M", "L", "XL", "XXL"],
      topSizes: product.topSizes || product.sizes || ["S", "M", "L", "XL", "XXL"],
      bottomSizes: product.bottomSizes || product.sizes || ["S", "M", "L", "XL", "XXL"],
      sizeGuideImage: product.sizeGuideRef || "",
      specifications: specsStr,
      productNarrative: product.inspiration || "",
      artisanCare: product.compositionAndCare || "",
    },
    variations: (product.variants && product.variants.length > 0)
      ? product.variants.map((v: any) => ({
          color: v.color || "",
          images: v.images || [],
          sellingPrice: String(v.price || v.sellingPrice || product.price || ""),
          mrp: String(v.mrp || product.mrp || ""),
        }))
      : [
          {
            color: product.colors?.[0] || product.Colour || "Linen White",
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
// SECTION 1: COLLECTION BASIC DETAILS Component
// ==========================================
export const CollectionBasicDetails: React.FC<{
  details: CollectionFormState["basicDetails"];
  onChange: (updated: Partial<CollectionFormState["basicDetails"]>) => void;
  onAutoFillAll?: (data: any) => void;
}> = ({ details, onChange, onAutoFillAll }) => {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotFile, setCopilotFile] = useState<File | null>(null);
  const [copilotPreview, setCopilotPreview] = useState<string>("");
  const [copilotHints, setCopilotHints] = useState("");
  const [isCopilotAnalyzing, setIsCopilotAnalyzing] = useState(false);
  const [copilotError, setCopilotError] = useState("");
  const [copilotSuccess, setCopilotSuccess] = useState("");

  const categories = [
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

  const standardSizes = ["S", "M", "L", "XL", "XXL"];

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

        {/* Fit & Style */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Fit & Style</label>
          <select
            value={details.fitAndStyle}
            onChange={(e) => onChange({ fitAndStyle: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200"
          >
            {fits.map((fit) => (
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
          <span className="text-[10px] text-moss font-mono uppercase font-bold block border-b border-slate-800 pb-1.5">Size Matrices & Sizing Guide</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {/* AVAILABLE SHIRT SIZES */}
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
                          const nextTopSizes = (details.topSizes || []).includes(sz)
                            ? (details.topSizes || []).filter((s) => s !== sz)
                            : [...(details.topSizes || []), sz];
                          onChange({
                            topSizes: nextTopSizes,
                            sizes: Array.from(new Set([...nextTopSizes, ...(details.bottomSizes || details.sizes || [])]))
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

              {/* AVAILABLE TROUSER SIZES */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/40">
                <label className="text-[9px] text-linen/40 font-mono uppercase tracking-wider block font-semibold text-[#B5652F]">AVAILABLE TROUSER SIZES</label>
                <div className="flex flex-wrap gap-1.5">
                  {standardSizes.map((sz) => {
                    const isSelected = (details.bottomSizes || []).includes(sz);
                    return (
                      <button
                        type="button"
                        key={`trouser-${sz}`}
                        onClick={() => {
                          const nextBottomSizes = (details.bottomSizes || []).includes(sz)
                            ? (details.bottomSizes || []).filter((s) => s !== sz)
                            : [...(details.bottomSizes || []), sz];
                          onChange({
                            bottomSizes: nextBottomSizes,
                            sizes: Array.from(new Set([...(details.topSizes || details.sizes || []), ...nextBottomSizes]))
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
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-linen/40 font-mono uppercase tracking-wider block">Sizing Guide Image</label>
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
                placeholder={`{\n  "SHIRT_DETAILS": {\n    "TEXTILE COMPOSITION": "100% Linen",\n    "FIT": "Relaxed"\n  },\n  "TROUSER_DETAILS": {\n    "WAIST": "Elasticated Drawstring",\n    "POCKETS": "Side Seam"\n  }\n}`}
              />
              <p className="text-[9px] text-linen/30 font-mono leading-relaxed mt-0.5">
                💡 Enter separate specification sections (e.g. SHIRT_DETAILS, TROUSER_DETAILS) as key-value items or nested objects to isolate details for combo products.
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
// SECTION 2: VARIATIONS Component
// ==========================================
export const CollectionVariations: React.FC<{
  variations: CollectionFormState["variations"];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, updated: Partial<CollectionFormState["variations"][number]>) => void;
}> = ({ variations, onAdd, onRemove, onChange }) => {

  const handleFileUpload = (index: number, files: FileList | null) => {
    if (!files) return;
    const array = Array.from(files);
    
    array.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const currentImages = variations[index].images || [];
        onChange(index, { images: [...currentImages, reader.result as string] });
      };
      reader.readAsDataURL(file);
    });
  };

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
            <p className="text-[9px] text-linen/40 font-mono">Create unique combinations of color, custom images, and price blocks.</p>
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
                    className="absolute top-3 right-3 text-red-400 hover:text-red-300 p-1.5 rounded-full hover:bg-red-950/20 transition cursor-pointer"
                    title="Remove Variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Colour Input */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Colour</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Linen White, Charcoal Gray"
                      value={variant.color}
                      onChange={(e) => onChange(idx, { color: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition duration-200"
                    />
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

                {/* Variant Images Upload and Previews */}
                <div className="space-y-3">
                  <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Variant Images Gallery</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-4">
                      <div
                        onClick={() => document.getElementById(`variant-file-input-${idx}`)?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleFileUpload(idx, e.dataTransfer.files);
                        }}
                        className="border border-dashed border-slate-800 bg-slate-900/50 rounded-lg p-5 flex flex-col items-center justify-center text-center hover:border-slate-700 hover:bg-slate-900 cursor-pointer transition min-h-[100px]"
                      >
                        <input
                          type="file"
                          id={`variant-file-input-${idx}`}
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFileUpload(idx, e.target.files)}
                        />
                        <Upload className="w-5 h-5 text-slate-500 mb-1.5" />
                        <span className="text-[10px] text-linen/50 font-mono font-medium uppercase tracking-wider">Drag & Drop Images</span>
                        <span className="text-[8px] text-linen/30 font-mono mt-0.5">or browse multiple files</span>
                      </div>
                    </div>

                    <div className="md:col-span-8">
                      {variant.images && variant.images.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {variant.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="relative w-16 h-20 bg-slate-900 rounded border border-slate-800 overflow-hidden group">
                              <img src={getDirectImageUrl(img)} alt={`Variant ${idx} img`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(idx, imgIdx)}
                                className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-red-950 hover:text-red-300 text-red-400 p-0.5 rounded-full transition cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] font-mono text-center text-linen/80 py-0.5">
                                {imgIdx === 0 ? "PRIMARY" : `#${imgIdx}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-[100px] flex items-center justify-center border border-slate-900 bg-slate-900/10 rounded-lg">
                          <p className="text-[10px] text-linen/30 font-mono italic">No images loaded yet. Upload variant images.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, updated: Partial<CollectionFormState["combos"][number]>) => void;
}> = ({ combos, topSizes = ["S", "M", "L", "XL", "XXL"], bottomSizes = ["S", "M", "L", "XL", "XXL"], onAdd, onRemove, onChange }) => {

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/40 p-3.5 rounded-lg border border-slate-800/60">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-moss font-mono uppercase tracking-wider block font-semibold">Associated Shirt Size (Top)</label>
                    <select
                      value={combo.shirtSize || (topSizes && topSizes[0]) || "M"}
                      onChange={(e) => onChange(idx, { shirtSize: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition font-mono"
                    >
                      {(topSizes && topSizes.length > 0 ? topSizes : ["S", "M", "L", "XL", "XXL"]).map((sz) => (
                        <option key={sz} value={sz} className="bg-slate-950">
                          {sz} (Shirt SKU Link)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#B5652F] font-mono uppercase tracking-wider block font-semibold">Associated Trouser Size (Bottom)</label>
                    <select
                      value={combo.trouserSize || (bottomSizes && bottomSizes[0]) || "M"}
                      onChange={(e) => onChange(idx, { trouserSize: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded text-linen/80 text-xs focus:outline-none focus:border-moss/40 transition font-mono"
                    >
                      {(bottomSizes && bottomSizes.length > 0 ? bottomSizes : ["S", "M", "L", "XL", "XXL"]).map((sz) => (
                        <option key={sz} value={sz} className="bg-slate-950">
                          {sz} (Trouser SKU Link)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-3">
                  <label className="text-[10px] text-linen/40 font-mono uppercase tracking-wider block">Combo Promo Image</label>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-4">
                      <div
                        onClick={() => document.getElementById(`combo-file-input-${idx}`)?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleFileUpload(idx, e.dataTransfer.files);
                        }}
                        className="border border-dashed border-slate-800 bg-slate-900/50 rounded-lg p-5 flex flex-col items-center justify-center text-center hover:border-slate-700 hover:bg-slate-900 cursor-pointer transition min-h-[100px]"
                      >
                        <input
                          type="file"
                          id={`combo-file-input-${idx}`}
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFileUpload(idx, e.target.files)}
                        />
                        <Upload className="w-5 h-5 text-slate-500 mb-1.5" />
                        <span className="text-[10px] text-linen/50 font-mono font-medium uppercase tracking-wider">Upload Combo Media</span>
                      </div>
                    </div>

                    <div className="md:col-span-8">
                      {combo.images && combo.images.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {combo.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="relative w-16 h-20 bg-slate-900 rounded border border-slate-800 overflow-hidden group">
                              <img src={getDirectImageUrl(img)} alt={`Combo ${idx} img`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(idx, imgIdx)}
                                className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-red-950 hover:text-red-300 text-red-400 p-0.5 rounded-full transition cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-[100px] flex items-center justify-center border border-slate-900 bg-slate-900/10 rounded-lg">
                          <p className="text-[10px] text-linen/30 font-mono italic">No images loaded yet. Upload combo images.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
  isSubmitting = false
}) => {
  const [formState, setFormState] = useState<CollectionFormState>(() =>
    getInitialCollectionState(initialProduct)
  );
  const [errorMsg, setErrorMsg] = useState("");

  const handleBasicDetailsChange = (updated: Partial<CollectionFormState["basicDetails"]>) => {
    setFormState((prev) => ({
      ...prev,
      basicDetails: {
        ...prev.basicDetails,
        ...updated
      }
    }));
  };

  const handleAutoFillAll = (data: any) => {
    setFormState((prev) => {
      // 1. Process Fulfillment Category
      const rawCat = (data.section_1?.fulfillment_category || "").toUpperCase();
      let matchedCategory = prev.basicDetails.fulfillmentCategory;
      if (rawCat.includes("PANT COMBO") || rawCat.includes("TROUSER COMBO") || rawCat.includes("CO-ORD") || rawCat.includes("COMBO")) {
        matchedCategory = "SHIRT & TROUSER COMBO";
      } else if (rawCat.includes("SHIRT")) {
        matchedCategory = "Loomed Shirts";
      } else if (rawCat.includes("PANT")) {
        matchedCategory = "Loomed Pants";
      }

      // 2. Process Fit & Style
      const rawFit = (data.section_1?.fit_and_style || "").toUpperCase();
      let matchedFit = "UNSTRUCTURED COMFORT FIT";
      if (rawFit.includes("REGULAR")) matchedFit = "REGULAR FIT";
      else if (rawFit.includes("LOOSE") || rawFit.includes("FLOWING") || rawFit.includes("RELAXED")) matchedFit = "FLOWING LOOSE FIT";
      else if (rawFit.includes("SLIM")) matchedFit = "SLIM FIT";
      else if (rawFit.includes("OVERSIZED")) matchedFit = "OVERSIZED FIT";
      else if (rawFit.includes("UNSTRUCTURED") || rawFit.includes("COMFORT")) matchedFit = "UNSTRUCTURED COMFORT FIT";

      // 3. Process specifications
      const specObj = data.section_1?.tab_1_specifications || {};
      const specificationsStr = typeof specObj === "object" ? JSON.stringify(specObj, null, 2) : String(specObj);

      // 4. Process Variations
      const aiVariations = data.section_2_variations || [];
      const updatedVars = aiVariations.map((v: any, index: number) => {
        const existingVar = prev.variations[index] || {};
        return {
          color: v.colour_name || existingVar.color || "Linen White",
          images: existingVar.images || [],
          sellingPrice: v.selling_price ? String(v.selling_price) : (existingVar.sellingPrice || ""),
          mrp: v.mrp ? String(v.mrp) : (existingVar.mrp || ""),
        };
      });
      const finalVars = updatedVars.length > 0 ? updatedVars : prev.variations;

      // 5. Process Combos
      const aiBundles = data.section_3_bundles || [];
      const updatedCombos = aiBundles.map((b: any, index: number) => {
        const existingCombo = prev.combos[index] || {};
        return {
          images: existingCombo.images || [],
          sellingPrice: existingCombo.sellingPrice || "",
          mrp: existingCombo.mrp || "",
          shirtSize: prev.basicDetails.topSizes[0] || "M",
          trouserSize: prev.basicDetails.bottomSizes[0] || "M"
        };
      });
      const finalCombos = updatedCombos.length > 0 ? updatedCombos : prev.combos;

      const shirtSizes = data.section_1?.available_shirt_sizes || prev.basicDetails.topSizes;
      const trouserSizes = data.section_1?.available_trouser_sizes || prev.basicDetails.bottomSizes;

      return {
        ...prev,
        basicDetails: {
          ...prev.basicDetails,
          collectionTitle: data.section_1?.collection_title || prev.basicDetails.collectionTitle,
          fulfillmentCategory: matchedCategory,
          shortDescription: data.section_1?.short_description || prev.basicDetails.shortDescription,
          fitAndStyle: matchedFit,
          topSizes: shirtSizes,
          bottomSizes: trouserSizes,
          sizes: Array.from(new Set([...shirtSizes, ...trouserSizes])),
          specifications: specificationsStr,
          productNarrative: data.section_1?.tab_2_narrative || prev.basicDetails.productNarrative,
          artisanCare: data.section_1?.tab_3_care_instructions || prev.basicDetails.artisanCare,
        },
        variations: finalVars,
        combos: finalCombos
      };
    });
  };

  const handleAddVariation = () => {
    setFormState((prev) => ({
      ...prev,
      variations: [
        ...prev.variations,
        { color: "", images: [], sellingPrice: "", mrp: "" }
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
      />

      {/* Section 2 */}
      <CollectionVariations
        variations={formState.variations}
        onAdd={handleAddVariation}
        onRemove={handleRemoveVariation}
        onChange={handleVariationChange}
      />

      {/* Section 3 */}
      <CollectionCombos
        combos={formState.combos}
        topSizes={formState.basicDetails.topSizes}
        bottomSizes={formState.basicDetails.bottomSizes}
        onAdd={handleAddCombo}
        onRemove={handleRemoveCombo}
        onChange={handleComboChange}
      />

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
          {isSubmitting ? "Compiling..." : initialProduct ? "Update Collection" : "Release Collection"}
        </button>
      </div>
    </form>
  );
};

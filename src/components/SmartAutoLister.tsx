"use client";

import React, { useState, useRef } from "react";
import { Upload, Sparkles, AlertCircle, CheckCircle2, Image as ImageIcon, RefreshCw, X } from "lucide-react";

interface AutoListResponse {
  success: boolean;
  message: string;
  data: {
    productId: string;
    name: string;
    category: string;
    constructedImageUrl: string;
    dbRecord: {
      product: {
        id: string;
        name: string;
        description: string;
        price: number;
        category: string;
        genderPreference: string;
        sizes: string[];
        colors: string[];
        tags: string[];
      };
      variant: {
        id: string;
        productId: string;
        color: string;
        design: string;
        topFitStyle: string;
        bottomFitStyle: string;
        stock: number;
        images: string[];
      };
    };
  };
}

export default function SmartAutoLister() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [context, setContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<AutoListResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File selection helper
  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setErrorMsg(null);
      setSuccessData(null);
    } else {
      setErrorMsg("Please select a valid image file.");
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setImageFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setContext("");
    setSuccessData(null);
    setErrorMsg(null);
  };

  // Submit form data to /api/admin/auto-list
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setErrorMsg("Please upload a product image first.");
      return;
    }
    if (!context.trim()) {
      setErrorMsg("Please enter context hints (e.g., Price, Sizes, Fabric) for the AI.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessData(null);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("context", context);

    try {
      const response = await fetch("/api/admin/auto-list", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received an invalid response from the server. The server might be restarting or offline. Please try again in a few moments.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to auto-list product.");
      }

      setSuccessData(data);
    } catch (err: any) {
      console.error("Auto-Lister error:", err);
      setErrorMsg(err.message || "An unexpected error occurred during AI analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#1C2333] border border-sand/15 rounded-2xl p-6 sm:p-8 text-[#F5F0E8] shadow-2xl space-y-8" id="smart-auto-lister-root">
      {/* HEADER SECTION */}
      <div className="flex items-start justify-between border-b border-sand/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-moss/20 text-moss rounded-md border border-moss/30 animate-pulse">
              <Sparkles className="w-4 h-4 text-moss" />
            </span>
            <span className="font-mono text-[10px] tracking-widest text-moss font-bold uppercase">Intelligent Retail Engine</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-light tracking-tight mt-1 text-white">AI Auto-Lister Panel</h2>
          <p className="font-sans text-xs sm:text-sm text-linen/60 max-w-xl font-light">
            Upload a single raw model photo or apparel flat-lay. Provide brief manager context hints, and let our vision model dynamically draft, catalog, and store the digital assets.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: IMAGE UPLOAD / PREVIEW */}
        <div className="space-y-4">
          <label className="text-[11px] font-mono tracking-wider text-linen/70 uppercase block">1. Raw Apparel Image Capture</label>
          
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={!previewUrl ? handleBrowseClick : undefined}
            className={`relative min-h-[320px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all duration-300 ${
              previewUrl ? "border-sand/20 bg-black/25" : "cursor-pointer"
            } ${
              isDragging 
                ? "border-moss bg-moss/10 shadow-lg" 
                : "border-sand/20 hover:border-moss/40 hover:bg-black/10"
            }`}
          >
            {/* Native Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              accept="image/*"
              className="hidden"
              disabled={isLoading}
            />

            {previewUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4 animate-fade-in">
                <div className="relative group max-w-[240px] aspect-[3/4] rounded-lg overflow-hidden border border-sand/20 shadow-md">
                  <img src={previewUrl} alt="Apparel preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBrowseClick();
                      }}
                      className="px-3 py-1.5 bg-white text-ink text-xs font-mono font-medium rounded hover:bg-sand transition"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-linen/60 max-w-[200px] truncate">{imageFile?.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="p-1 hover:bg-white/10 rounded-full transition text-linen/40 hover:text-white"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pointer-events-none">
                <div className="mx-auto w-12 h-12 rounded-full bg-white/5 border border-sand/15 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-sand/60" />
                </div>
                <div className="space-y-1">
                  <p className="font-sans text-sm text-linen/80">Drag & Drop visual asset here</p>
                  <p className="font-sans text-xs text-linen/40">or click to browse local folders</p>
                </div>
                <div className="pt-2">
                  <span className="inline-block px-3 py-1 bg-white/5 border border-sand/10 rounded font-mono text-[9px] uppercase tracking-wider text-linen/50">
                    Supports PNG, JPG, WEBP
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CONTEXT INPUTS & TRIGGER */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono tracking-wider text-linen/70 uppercase block">2. Manager context & specifications</label>
              <p className="text-[11px] text-linen/40 font-sans leading-normal">
                Provide brief guidance for the AI (e.g., actual retail pricing, specific sizing structure, fiber blend percentage, or targeted marketing focus).
              </p>
            </div>

            <div className="space-y-1">
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. Price: 3499, Unisex, sizes M-XXL, 100% fine handloomed linen. Premium look with traditional coconut shell buttons."
                rows={5}
                disabled={isLoading}
                className="w-full bg-black/20 border border-sand/20 rounded-xl p-3 text-sm text-linen/90 placeholder-linen/30 focus:outline-none focus:border-moss/40 transition font-sans leading-relaxed"
              />
            </div>

            {/* Quick Suggestions Helper */}
            <div className="pt-1">
              <span className="text-[10px] font-mono text-linen/40 block mb-1">PRO-TIPS FOR BEST OUTPUT:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Include precise price (e.g. Price: 2900)",
                  "State fibers (e.g. 100% organic cotton)",
                  "Mention set if two-piece set",
                ].map((tip, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-white/5 border border-sand/10 rounded-full font-sans text-[10px] text-linen/50">
                    {tip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* ACTION TRIGGERS */}
            <div className="flex items-center gap-3 pt-4 border-t border-sand/10">
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading || (!imageFile && !context)}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 text-linen/80 text-xs font-mono uppercase tracking-wider transition rounded-lg border border-sand/10 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Clear Inputs
              </button>
              <button
                type="submit"
                disabled={isLoading || !imageFile || !context.trim()}
                className="flex-1 py-3 bg-moss hover:bg-moss-hover text-[#F5F0E8] font-mono text-xs uppercase tracking-widest font-bold transition rounded-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Vision AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Auto-Draft & List Product</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-start gap-2 p-3.5 bg-red-950/30 border border-red-900/30 rounded-lg text-red-200 text-xs animate-fade-in font-sans">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold block font-mono">Error Processing Request</span>
                  <span className="text-red-300/80 leading-normal">{errorMsg}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </form>

      {/* SUCCESS / COMPLETED RECORD OVERVIEW */}
      {successData && (
        <div className="bg-black/30 border border-moss/30 rounded-xl p-5 sm:p-6 space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 border-b border-sand/10 pb-3">
            <CheckCircle2 className="w-5 h-5 text-moss" />
            <h3 className="font-serif text-lg font-light text-white">Successfully Cataloged & Listed</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Generated Catalog Thumbnail */}
            <div className="space-y-1">
              <span className="text-[10px] text-linen/40 font-mono uppercase block">Strict Mapped Filename</span>
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-sand/20 bg-black/40">
                <img src={previewUrl || ""} alt="Constructed asset" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2 border-t border-sand/10">
                  <span className="font-mono text-[9px] text-linen/90 truncate block">{successData.data.constructedImageUrl}</span>
                </div>
              </div>
            </div>

            {/* Schema Record Overview */}
            <div className="sm:col-span-2 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-linen/40 font-mono uppercase block">Apparel Title</span>
                  <span className="font-medium text-white text-sm">{successData.data.name}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-linen/40 font-mono uppercase block">Category / Collection</span>
                  <span className="font-medium text-white text-sm">{successData.data.category}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-linen/40 font-mono uppercase block">Price</span>
                  <span className="font-medium text-white text-sm">₹{successData.data.dbRecord.product.price}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-linen/40 font-mono uppercase block">Gender preference</span>
                  <span className="font-medium text-white text-sm">{successData.data.dbRecord.product.genderPreference}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-linen/40 font-mono uppercase block">AI Drafted Description</span>
                <p className="text-linen/70 leading-relaxed italic">{successData.data.dbRecord.product.description}</p>
              </div>

              <div className="pt-2 border-t border-sand/10 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-linen/40 font-mono uppercase block">Primary Variant Color</span>
                  <span className="font-medium text-white">{successData.data.dbRecord.variant.color}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-linen/40 font-mono uppercase block">Pattern / Design</span>
                  <span className="font-medium text-white">{successData.data.dbRecord.variant.design}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-linen/40 font-mono uppercase block">Top Fit / Style</span>
                  <span className="font-medium text-white">{successData.data.dbRecord.variant.topFitStyle}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-linen/40 font-mono uppercase block">Bottom Fit / Style</span>
                  <span className="font-medium text-white">{successData.data.dbRecord.variant.bottomFitStyle}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-sand/10 flex flex-wrap gap-2">
                <span className="font-mono text-[9px] text-[#B5652F] uppercase">System tags applied:</span>
                {successData.data.dbRecord.product.tags.map((tag, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-[#B5652F]/10 border border-[#B5652F]/20 rounded font-mono text-[9px] text-[#B5652F]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

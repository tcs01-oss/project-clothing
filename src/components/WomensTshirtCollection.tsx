import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Sparkles, 
  Check, 
  SlidersHorizontal, 
  ArrowLeft, 
  ShoppingBag, 
  Eye, 
  X,
  Search,
  Grid,
  Sparkle
} from "lucide-react";
import { Product } from "../types";

interface WomensTshirtCollectionProps {
  products: Product[];
  addToCart: (product: Product, size: string) => void;
  toggleWishlist: (id: string, name: string) => void;
  wishlist: string[];
  setSelectedProduct: (p: Product) => void;
  setActiveImgIdx: (i: number) => void;
  setIsCheckoutOpen: (o: boolean) => void;
  capsuleItems: any[];
  toggleCapsuleItem: (p: Product) => void;
  onBackToStore: () => void;
}

export default function WomensTshirtCollection({
  products,
  addToCart,
  toggleWishlist,
  wishlist,
  setSelectedProduct,
  setActiveImgIdx,
  setIsCheckoutOpen,
  capsuleItems,
  toggleCapsuleItem,
  onBackToStore
}: WomensTshirtCollectionProps) {
  // Filters specific to Women's T-Shirts
  const [selectedStyle, setSelectedStyle] = useState<string>("ALL");
  const [selectedColor, setSelectedColor] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"featured" | "price-low-high" | "price-high-low" | "rating">("featured");
  const [searchQuery, setSearchQuery] = useState("");

  // Strict Data Filtering: Women's T-Shirts ONLY. Absolute separation, zero cross-pollination.
  const womensTshirts = useMemo(() => {
    return products.filter(p => {
      const hasWomenTag = p.tags.some(t => t.toLowerCase() === "women" || t.toLowerCase() === "womens");
      const hasTshirtTag = p.tags.some(t => t.toLowerCase() === "t-shirt" || t.toLowerCase() === "tshirt" || t.toLowerCase() === "tees");
      const isWomenCategory = p.category.toLowerCase().includes("women") && p.category.toLowerCase().includes("t-shirt");
      return (hasWomenTag && hasTshirtTag) || isWomenCategory;
    });
  }, [products]);

  // Apply sub-filters
  const filteredProducts = useMemo(() => {
    let result = [...womensTshirts];

    // Filter by Style
    if (selectedStyle !== "ALL") {
      result = result.filter(p => p.tags.some(t => t.toLowerCase() === selectedStyle.toLowerCase()));
    }

    // Filter by Color
    if (selectedColor !== "ALL") {
      result = result.filter(p => p.colors?.some(c => c.toLowerCase().includes(selectedColor.toLowerCase())));
    }

    // Filter by Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.inspiration.toLowerCase().includes(q)
      );
    }

    // Sort products
    if (sortBy === "price-low-high") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high-low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [womensTshirts, selectedStyle, selectedColor, searchQuery, sortBy]);

  // Available unique Women's styles for layout filter (Crop, Oversized, Slim Fit, Relaxed)
  const availableStyles = ["ALL", "Crop", "Oversized", "Slim Fit", "Relaxed"];

  // Available colors extracted from actual women's t-shirts
  const availableColors = useMemo(() => {
    const colorsSet = new Set<string>();
    womensTshirts.forEach(p => {
      p.colors?.forEach(c => colorsSet.add(c));
    });
    return ["ALL", ...Array.from(colorsSet)];
  }, [womensTshirts]);

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#1C2333] font-sans pt-24 pb-16" id="womens-collection-page">
      
      {/* Centered Minimalist Hero Section with Botanical Touches */}
      <div className="relative overflow-hidden mb-12 border-b border-[#1C2333]/10 bg-[#FAF7F2] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtle decorative background vector pattern */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#B5652F_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <button 
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-[#B5652F] hover:text-[#1C2333] transition group mb-4"
            id="womens-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Return to Sanctuary</span>
          </button>
          
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#B5652F]/10 text-[#B5652F] text-[10px] font-mono uppercase tracking-[0.2em] rounded-full">
              <Sparkle className="w-3 h-3 animate-spin" style={{ animationDuration: "12s" }} />
              <span>Botanical Pigment Dyes</span>
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl text-[#1C2333] font-light leading-tight tracking-tight">
            Women's Crop & <br />
            <span className="italic font-extralight text-[#B5652F]">Unhurried Drapes</span>
          </h1>

          <p className="text-earth/80 text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed">
            Floating, organic cotton and wild flax silhouettes dyed slowly with flower roots, bark, and plant matter. Tailored to drop weightlessly and celebrate lightweight, absolute freedom of movement across diverse terrains.
          </p>

          <div className="flex items-center justify-center gap-6 text-xs font-mono text-[#1C2333]/60 pt-4">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-moss" /> 100% Unbleached Linen
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-moss" /> Zero Synthetic Fibers
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area - Elegant Top Filtering & Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* TOP FILTER CONTROLS - Women's Specific Design */}
        <div className="bg-[#FAF7F2]/80 border border-[#1C2333]/10 rounded-lg p-5 sm:p-6 space-y-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
            
            {/* Left Section: Active filters and counter */}
            <div className="text-left space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#B5652F] font-bold">Women's Curated Inventory</span>
              <h2 className="font-serif text-xl sm:text-2xl text-[#1C2333] font-light">
                Explore <span className="font-mono text-lg font-bold text-[#B5652F]">{filteredProducts.length}</span> T-Shirt Concepts
              </h2>
            </div>

            {/* Middle Section: Integrated Search */}
            <div className="relative max-w-sm w-full lg:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1C2333]/40" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search botanical drapes..." 
                className="w-full pl-10 pr-4 py-2 bg-white/95 border border-[#1C2333]/15 focus:border-[#B5652F] rounded-xs text-xs font-mono text-[#1C2333] placeholder-[#1C2333]/40 focus:outline-none transition"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-earth/60 hover:text-ink"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          <hr className="border-[#1C2333]/10" />

          {/* Filtering row: Silhouette style tags & sorting */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Silhouettes / Styles */}
            <div className="flex flex-wrap items-center gap-2 text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-earth/60 mr-2 font-bold">Silhouettes:</span>
              {availableStyles.map(style => (
                <button
                  key={`women-style-${style}`}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-xs transition-all duration-300 ${
                    selectedStyle === style 
                      ? "bg-[#B5652F] text-white font-medium shadow-sm" 
                      : "bg-white hover:bg-white/50 border border-[#1C2333]/10 text-earth hover:text-ink"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            {/* Colors and Ordering */}
            <div className="flex flex-wrap items-center gap-4 text-left">
              
              {/* Color dropdown filter */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-earth/60 font-bold">Pigment:</span>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="bg-white border border-[#1C2333]/10 rounded-xs py-1.5 px-3 text-xs font-mono text-earth focus:outline-none focus:border-[#B5652F] cursor-pointer"
                >
                  {availableColors.map(c => (
                    <option key={`color-opt-${c}`} value={c}>
                      {c === "ALL" ? "All Pigments" : c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order by */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-earth/60 font-bold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-[#1C2333]/10 rounded-xs py-1.5 px-3 text-xs font-mono text-earth focus:outline-none focus:border-[#B5652F] cursor-pointer"
                >
                  <option value="featured">Botanical Choice</option>
                  <option value="price-low-high">Price: Low-High</option>
                  <option value="price-high-low">Price: High-Low</option>
                  <option value="rating">Reviews Rating</option>
                </select>
              </div>

            </div>

          </div>
        </div>

        {/* ACTIVE FILTER TOKENS */}
        {(selectedStyle !== "ALL" || selectedColor !== "ALL") && (
          <div className="flex flex-wrap gap-2 justify-start items-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-earth/60">Active Parameters:</span>
            {selectedStyle !== "ALL" && (
              <button
                onClick={() => setSelectedStyle("ALL")}
                className="inline-flex items-center gap-1.5 bg-[#B5652F]/10 border border-[#B5652F]/20 rounded-xs px-2.5 py-1 text-[10px] font-mono text-[#B5652F] hover:bg-transparent transition"
              >
                <span>Silhouette: {selectedStyle}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {selectedColor !== "ALL" && (
              <button
                onClick={() => setSelectedColor("ALL")}
                className="inline-flex items-center gap-1.5 bg-[#FAF7F2] border border-[#1C2333]/15 rounded-xs px-2.5 py-1 text-[10px] font-mono text-earth hover:bg-transparent transition"
              >
                <span>Color: {selectedColor}</span>
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => { setSelectedStyle("ALL"); setSelectedColor("ALL"); }}
              className="text-[10px] font-mono uppercase tracking-wider text-[#B5652F] hover:underline font-bold"
            >
              Clear parameters
            </button>
          </div>
        )}

        {/* WOMEN'S FILTERED PRODUCT GRID */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-[#1C2333]/15 rounded-lg bg-[#FAF7F2] max-w-xl mx-auto">
            <SlidersHorizontal className="w-8 h-8 text-[#B5652F]/40 mx-auto mb-4" />
            <h3 className="font-serif text-lg text-[#1C2333] font-light">No botanical garments matched your filters</h3>
            <p className="text-xs text-earth/60 max-w-xs mx-auto mt-2 font-mono font-light">
              Try exploring different silhouette parameters, organic colors, or natural search keywords.
            </p>
            <button
              onClick={() => { setSelectedStyle("ALL"); setSelectedColor("ALL"); setSearchQuery(""); }}
              className="mt-6 px-4 py-2 bg-[#B5652F] hover:bg-[#B5652F]/90 text-white rounded-xs text-[10px] font-mono uppercase tracking-widest transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map(p => {
              const isStarred = wishlist.includes(p.id);
              const isCurated = capsuleItems.some(itm => itm.product.id === p.id);
              
              return (
                <motion.div
                  key={`women-prod-${p.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                  className="group flex flex-col justify-between relative bg-white border border-[#1C2333]/10 rounded-lg p-4 hover:border-[#B5652F]/40 hover:shadow-md transition-all duration-300"
                  id={`women-card-${p.id}`}
                >
                  {/* Product Visual Stage */}
                  <div 
                    onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                    className="relative aspect-[3/4] bg-[#FAF7F2] overflow-hidden rounded-md cursor-pointer mb-4"
                  >
                    {/* Style Fitting Tag */}
                    <div className="absolute top-3 left-3 z-10 bg-moss text-[#FAF7F2] text-[8px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm">
                      {p.tags.includes("crop") ? "Crop Cut" : p.tags.includes("oversized") ? "Oversized Drapery" : "Classic Fit"}
                    </div>

                    {/* Starred Wishlist Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p.id, p.name);
                      }}
                      className="absolute top-3 right-3 z-10 p-2 bg-white/65 backdrop-blur-xs text-earth hover:text-[#B5652F] hover:scale-105 transition rounded-full hover:bg-white shadow-sm border border-[#1C2333]/10"
                      title={isStarred ? "Remove from Sanctuary" : "Save for Later"}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isStarred ? "fill-[#B5652F] text-[#B5652F]" : "text-earth"}`} />
                    </button>

                    <img
                      src={p.images?.[0]}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 select-none"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />

                    {p.images?.[1] && (
                      <img
                        src={p.images?.[1]}
                        alt={`${p.name} alternate view`}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 group-hover:opacity-100 select-none"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    )}

                    {/* Quick Add To Cart Tray */}
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-white/95 backdrop-blur-xs flex flex-col gap-2 border-t border-[#1C2333]/10 z-20">
                      <span className="text-[9px] text-[#B5652F] font-mono uppercase tracking-[0.2em] text-center font-bold">Select Size</span>
                      <div className="flex gap-1.5 justify-center">
                        {p.sizes.map(sz => (
                          <button
                            key={sz}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(p, sz);
                              setIsCheckoutOpen(true);
                            }}
                            className="flex-1 py-1.5 bg-[#FAF7F2] hover:bg-[#B5652F] text-earth hover:text-white border border-[#1C2333]/10 hover:border-[#B5652F] rounded-xs text-[10px] font-mono transition duration-250 text-center flex items-center justify-center cursor-pointer font-bold"
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Descriptions below */}
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-start gap-2">
                      <h3 
                        onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                        className="font-serif text-base sm:text-lg text-[#1C2333] hover:text-[#B5652F] transition cursor-pointer font-light leading-tight"
                      >
                        {p.name}
                      </h3>
                      <span className="font-mono text-xs sm:text-sm text-[#1C2333] shrink-0 font-medium">
                        ₹{Math.round((p.price || 0) * 85).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <p className="text-xs text-earth/70 line-clamp-2 font-sans font-light leading-relaxed">
                      {p.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                      <span className="text-earth/40 uppercase tracking-widest">{p.colors?.[0]}</span>
                      <button
                        onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                        className="text-[#B5652F] hover:text-[#1C2333] transition underline tracking-wider"
                      >
                        Explore →
                      </button>
                    </div>

                    {/* Capsule Coordination Integration */}
                    <button
                      onClick={() => toggleCapsuleItem(p)}
                      className={`w-full py-2 px-3 text-center text-[10px] font-mono uppercase tracking-widest border transition-all duration-300 rounded-xs flex items-center justify-center gap-2 ${
                        isCurated 
                          ? "bg-moss text-[#FAF7F2] border-moss hover:bg-moss/90" 
                          : "bg-transparent text-[#B5652F] border-[#B5652F]/30 hover:border-[#B5652F]/70 hover:text-[#B5652F]"
                      }`}
                    >
                      {isCurated ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#FAF7F2]" />
                          <span>Curated in Capsule</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#B5652F]" />
                          <span>Curate to Capsule</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

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
  TrendingUp
} from "lucide-react";
import { Product } from "../types";

interface MensTshirtCollectionProps {
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

export default function MensTshirtCollection({
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
}: MensTshirtCollectionProps) {
  // Filters specific to Men's T-Shirts
  const [selectedStyle, setSelectedStyle] = useState<string>("ALL");
  const [selectedColor, setSelectedColor] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"featured" | "price-low-high" | "price-high-low" | "rating">("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Strict Data Filtering: Men's T-Shirts ONLY. Absolute separation, zero cross-pollination.
  const mensTshirts = useMemo(() => {
    return products.filter(p => {
      const hasMenTag = p.tags.some(t => t.toLowerCase() === "men" || t.toLowerCase() === "mens");
      const hasTshirtTag = p.tags.some(t => t.toLowerCase() === "t-shirt" || t.toLowerCase() === "tshirt" || t.toLowerCase() === "tees");
      const isMenCategory = p.category.toLowerCase().includes("men") && p.category.toLowerCase().includes("t-shirt");
      return (hasMenTag && hasTshirtTag) || isMenCategory;
    });
  }, [products]);

  // Apply sub-filters
  const filteredProducts = useMemo(() => {
    let result = [...mensTshirts];

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
  }, [mensTshirts, selectedStyle, selectedColor, searchQuery, sortBy]);

  // Available unique Men's styles for sidebar filter
  const availableStyles = ["ALL", "Oversized", "Slim Fit", "Longline", "Relaxed"];

  // Available colors extracted from actual men's t-shirts
  const availableColors = useMemo(() => {
    const colorsSet = new Set<string>();
    mensTshirts.forEach(p => {
      p.colors?.forEach(c => colorsSet.add(c));
    });
    return ["ALL", ...Array.from(colorsSet)];
  }, [mensTshirts]);

  return (
    <div className="min-h-screen bg-[#111111] text-[#EFECE6] font-sans pt-24 pb-16" id="mens-collection-page">
      {/* Premium Bold Hero Section with Asymmetric Layout */}
      <div className="relative overflow-hidden mb-16 border-b border-white/10 bg-gradient-to-b from-black to-[#111111] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1C2333_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10 items-center">
          {/* Hero Content Left */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <button 
              onClick={onBackToStore}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#D9CBB0] hover:text-white transition group mb-4"
              id="mens-back-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Sanctuary</span>
            </button>
            <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#B5652F] block font-semibold">
              The Architectural Blueprint
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl text-white font-medium leading-none tracking-tight">
              Men's Box & <br />
              <span className="font-sans italic font-light text-[#D9CBB0]">Structured Tees</span>
            </h1>
            <p className="text-[#A5A198] text-sm sm:text-base font-light max-w-xl leading-relaxed">
              No brand noise. No synthetic filler. Our men's t-shirt collection focuses on heavier weights, drop shoulders, and organic hemp-cotton weaves engineered to hold structure through a lifetime of exploration.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xs px-3 py-1.5 text-xs font-mono text-[#D9CBB0]">
                <Check className="w-3.5 h-3.5 text-[#B5652F]" />
                <span>280GSM Heavyweight Knit</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xs px-3 py-1.5 text-xs font-mono text-[#D9CBB0]">
                <TrendingUp className="w-3.5 h-3.5 text-[#B5652F]" />
                <span>Zero Biological Bleach</span>
              </div>
            </div>
          </div>

          {/* Hero Image Right (Asymmetrical Visual) */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <img 
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80" 
                alt="Men's collection lifestyle organic linen" 
                className="w-full h-full object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-700 select-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 text-left p-3">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#D9CBB0]">Featured Artifact</span>
                <p className="text-xs font-mono font-medium text-white">The Heavyweight Box Tee — Indigo Charcoal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* DESKTOP SIDEBAR - Men's Exclusive Style Controls */}
          <aside className="hidden lg:block space-y-8 text-left border-r border-white/10 pr-8">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#A5A198] font-bold">Search Catalog</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find linen, hemp, ecru..." 
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 focus:border-[#B5652F] rounded-xs text-xs font-mono text-white placeholder-white/30 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Silhouette / Style Filter */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#A5A198] font-bold block">Apparel Silhouette</label>
              <div className="flex flex-col gap-1.5">
                {availableStyles.map(style => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`text-left text-xs font-mono py-1 px-2.5 rounded-xs transition duration-200 flex items-center justify-between ${
                      selectedStyle === style 
                        ? "bg-[#B5652F] text-white font-medium shadow-sm" 
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{style}</span>
                    {selectedStyle === style && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Organic Color Pigments Filter */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#A5A198] font-bold block">Color Palette</label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 border text-[10px] font-mono rounded-xs uppercase tracking-wider transition ${
                      selectedColor === color 
                        ? "border-[#B5652F] bg-[#B5652F]/10 text-[#D9CBB0]" 
                        : "border-white/10 hover:border-white/30 text-white/70 hover:text-white"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#A5A198] font-bold block">Order By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-xs py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-[#B5652F] cursor-pointer"
              >
                <option value="featured" className="bg-[#111111]">Featured Designs</option>
                <option value="price-low-high" className="bg-[#111111]">Price: Low to High</option>
                <option value="price-high-low" className="bg-[#111111]">Price: High to Low</option>
                <option value="rating" className="bg-[#111111]">Top Rated</option>
              </select>
            </div>

            {/* Botanical Disclaimer */}
            <div className="p-4 bg-white/5 rounded-xs border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-[#D9CBB0]">
                <Sparkles className="w-4 h-4 text-[#B5652F]" />
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold">100% Purity</span>
              </div>
              <p className="text-[10px] text-white/50 leading-relaxed font-light font-sans">
                Our materials are strictly loomed from organic fibers without any synthetics. Pure, structural comfort for active minds.
              </p>
            </div>
          </aside>

          {/* MAIN PRODUCT GRID */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Mobile Filter Toggle & Search */}
            <div className="lg:hidden flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-b border-white/10 pb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Men's Tees..." 
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 focus:border-[#B5652F] rounded-xs text-xs font-mono text-white placeholder-white/30 focus:outline-none transition"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/30 text-xs font-mono rounded-xs text-white flex items-center gap-2 justify-center flex-1 sm:flex-initial cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#D9CBB0]" />
                  <span>Configure ({filteredProducts.length})</span>
                </button>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white/5 border border-white/10 rounded-xs py-2 px-3 text-xs font-mono text-white focus:outline-none cursor-pointer"
                >
                  <option value="featured" className="bg-[#111111]">Featured</option>
                  <option value="price-low-high" className="bg-[#111111]">Price: Low-High</option>
                  <option value="price-high-low" className="bg-[#111111]">Price: High-Low</option>
                </select>
              </div>
            </div>

            {/* Products Counter / Active Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-left">
                <span className="text-xs font-mono text-[#A5A198]">Showing </span>
                <span className="text-xs font-mono font-bold text-white">{filteredProducts.length}</span>
                <span className="text-xs font-mono text-[#A5A198]"> meticulously crafted Men's tees</span>
              </div>
              
              <div className="flex gap-2">
                {selectedStyle !== "ALL" && (
                  <button 
                    onClick={() => setSelectedStyle("ALL")}
                    className="inline-flex items-center gap-1 bg-[#B5652F]/20 border border-[#B5652F]/40 rounded-xs px-2.5 py-1 text-[10px] font-mono text-[#D9CBB0] hover:bg-transparent transition"
                  >
                    <span>Silhouette: {selectedStyle}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                {selectedColor !== "ALL" && (
                  <button 
                    onClick={() => setSelectedColor("ALL")}
                    className="inline-flex items-center gap-1 bg-white/10 border border-white/20 rounded-xs px-2.5 py-1 text-[10px] font-mono text-white/90 hover:bg-transparent transition"
                  >
                    <span>Color: {selectedColor}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Grid Container */}
            {filteredProducts.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-white/10 rounded-sm bg-white/2 max-w-xl mx-auto">
                <SlidersHorizontal className="w-8 h-8 text-white/30 mx-auto mb-4" />
                <h3 className="font-serif text-lg text-white font-light">No matching specifications found</h3>
                <p className="text-xs text-white/50 max-w-xs mx-auto mt-2 font-mono font-light">
                  Try adjusting your apparel silhouettes, organic colors, or search queries.
                </p>
                <button
                  onClick={() => { setSelectedStyle("ALL"); setSelectedColor("ALL"); setSearchQuery(""); }}
                  className="mt-6 px-4 py-2 bg-[#B5652F] hover:bg-[#B5652F]/80 text-white rounded-xs text-[10px] font-mono uppercase tracking-widest transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredProducts.map(p => {
                  const isStarred = wishlist.includes(p.id);
                  const isCurated = capsuleItems.some(itm => itm.product.id === p.id);
                  
                  return (
                    <motion.div
                      key={`men-prod-${p.id}`}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4 }}
                      className="group flex flex-col justify-between relative bg-[#181818] border border-white/5 rounded-xs p-4 hover:border-white/10 hover:bg-[#1E1E1E] transition-all duration-300 shadow-lg"
                      id={`men-card-${p.id}`}
                    >
                      {/* Product Image Stage */}
                      <div 
                        onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                        className="relative aspect-[3/4] bg-[#222222] overflow-hidden rounded-xs cursor-pointer mb-4"
                      >
                        {/* Style / Silhouette Tag */}
                        <div className="absolute top-3 left-3 z-10 bg-[#B5652F] text-white text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-xs shadow-md">
                          {p.tags.includes("oversized") ? "Oversized Fit" : p.tags.includes("slim fit") ? "Slim Fit" : p.tags.includes("longline") ? "Longline Profile" : "Relaxed Draping"}
                        </div>

                        {/* Starred Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(p.id, p.name);
                          }}
                          className="absolute top-3 right-3 z-10 p-2 bg-black/40 backdrop-blur-xs text-white hover:scale-105 transition rounded-full hover:bg-[#B5652F] border border-white/10"
                          title={isStarred ? "Remove from Sanctuary" : "Save for Later"}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isStarred ? "fill-[#B5652F] text-[#B5652F]" : "text-white"}`} />
                        </button>

                        <img
                          src={p.images?.[0]}
                          alt={p.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter grayscale-[30%] group-hover:grayscale-0 select-none"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />

                        {p.images?.[1] && (
                          <img
                            src={p.images?.[1]}
                            alt={`${p.name} alternate view`}
                            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 group-hover:opacity-100 filter grayscale-[30%] group-hover:grayscale-0 select-none"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        )}

                        {/* Quick Add To Cart Tray */}
                        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-black/90 backdrop-blur-xs flex flex-col gap-2 z-20">
                          <span className="text-[9px] text-[#D9CBB0] font-mono uppercase tracking-[0.2em] text-center font-bold">Loomed Sizes</span>
                          <div className="flex gap-1.5 justify-center">
                            {p.sizes.map(sz => (
                              <button
                                key={sz}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(p, sz);
                                  setIsCheckoutOpen(true);
                                }}
                                className="flex-1 py-1.5 bg-white/5 hover:bg-[#B5652F] text-white hover:text-white border border-white/10 hover:border-[#B5652F] rounded-xs text-[10px] font-mono transition duration-250 text-center flex items-center justify-center cursor-pointer font-bold"
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Product Descriptions below */}
                      <div className="space-y-3 text-left">
                        <div className="flex justify-between items-start gap-2">
                          <h3 
                            onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                            className="font-serif text-lg text-white hover:text-[#D9CBB0] transition cursor-pointer font-medium leading-tight"
                          >
                            {p.name}
                          </h3>
                          <span className="font-mono text-sm text-[#D9CBB0] shrink-0 font-medium">
                            ₹{Math.round((p.price || 0) * 85).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <p className="text-xs text-[#A5A198] line-clamp-2 font-sans font-light leading-relaxed">
                          {p.description}
                        </p>

                        <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                          <span className="text-white/40 uppercase tracking-widest">{p.colors?.[0]}</span>
                          <button
                            onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                            className="text-[#D9CBB0] hover:text-white transition underline tracking-wider"
                          >
                            Details →
                          </button>
                        </div>

                        {/* Capsule Coordination Integration */}
                        <button
                          onClick={() => toggleCapsuleItem(p)}
                          className={`w-full py-2 px-3 text-center text-[10px] font-mono uppercase tracking-widest border transition-all duration-300 rounded-xs flex items-center justify-center gap-2 ${
                            isCurated 
                              ? "bg-[#B5652F] text-white border-[#B5652F] hover:bg-[#B5652F]/90" 
                              : "bg-transparent text-[#D9CBB0] border-[#D9CBB0]/30 hover:border-[#D9CBB0]/70 hover:text-white"
                          }`}
                        >
                          {isCurated ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Curated in Capsule</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-[#B5652F]" />
                              <span>Coordinate Capsule</span>
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
      </div>

      {/* MOBILE CONFIGURE OVERLAY */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden flex justify-end"
          >
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="w-full max-w-sm bg-[#181818] text-[#EFECE6] h-full p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6 text-left">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <h3 className="font-serif text-xl font-medium text-white">Apparel Blueprint</h3>
                  <button 
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1 hover:text-[#D9CBB0] transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Silhouettes */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block font-bold">Apparel Silhouette</span>
                  <div className="flex flex-wrap gap-2">
                    {availableStyles.map(style => (
                      <button
                        key={`mob-style-${style}`}
                        onClick={() => setSelectedStyle(style)}
                        className={`px-3 py-1.5 border text-xs font-mono rounded-xs transition ${
                          selectedStyle === style 
                            ? "border-[#B5652F] bg-[#B5652F] text-white" 
                            : "border-white/10 text-white/70 hover:border-white/25"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block font-bold">Organic Pigments</span>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map(color => (
                      <button
                        key={`mob-color-${color}`}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 border text-[10px] font-mono rounded-xs uppercase tracking-wider transition ${
                          selectedColor === color 
                            ? "border-[#B5652F] bg-[#B5652F]/15 text-[#D9CBB0]" 
                            : "border-white/10 text-white/70"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block font-bold">Order By</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xs py-2.5 px-3 text-xs font-mono text-white focus:outline-none"
                  >
                    <option value="featured" className="bg-[#181818]">Featured Designs</option>
                    <option value="price-low-high" className="bg-[#181818]">Price: Low to High</option>
                    <option value="price-high-low" className="bg-[#181818]">Price: High to Low</option>
                    <option value="rating" className="bg-[#181818]">Top Rated</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-[#B5652F] hover:bg-[#B5652F]/90 text-white rounded-xs text-xs font-mono uppercase tracking-widest transition mt-8 font-bold shadow-lg"
              >
                Apply Specifications
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

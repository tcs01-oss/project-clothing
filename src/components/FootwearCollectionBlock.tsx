import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Footprints, Star, ShoppingBag, Eye, Check, Sparkles, ShieldCheck } from "lucide-react";
import { Product } from "../types";

interface FootwearCollectionBlockProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
  onSelectCategory: (category: string, subCategory?: string) => void;
}

const FILTER_TABS = [
  { id: "all", label: "All Sneakers" },
  { id: "Low-Top", label: "Low-Top" },
  { id: "High-Top", label: "High-Top" },
  { id: "Runner", label: "Tech Runners" },
  { id: "Slip-On", label: "Slip-Ons & Slides" },
  { id: "Limited Edition", label: "Limited Drops" }
];

export default function FootwearCollectionBlock({
  products,
  onSelectProduct,
  onAddToCart,
  onSelectCategory
}: FootwearCollectionBlockProps) {
  const [selectedSubTab, setSelectedSubTab] = useState("all");
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const sliderRef = useRef<HTMLDivElement>(null);

  // Filter footwear products
  const footwearProducts = products.filter((p) => {
    const isFootwearCat =
      (p.category || "").toLowerCase().includes("footwear") ||
      (p.Category || "").toLowerCase().includes("footwear") ||
      (p.tags || []).some((t) => t.toLowerCase() === "footwear" || t.toLowerCase() === "sneakers");

    if (!isFootwearCat) return false;

    if (selectedSubTab === "all") return true;

    const fitStyle = (p.fitStyle || p.FitStyle || p.fitAndStyle || "").toLowerCase();
    const tags = (p.tags || []).map((t) => t.toLowerCase());
    const subTarget = selectedSubTab.toLowerCase();

    return (
      fitStyle.includes(subTarget) ||
      tags.some((t) => t.includes(subTarget)) ||
      p.name.toLowerCase().includes(subTarget)
    );
  });

  const scrollSlider = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const scrollAmount = direction === "left" ? -360 : 360;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddProductToCart = (product: Product) => {
    const chosenSize = selectedSizes[product.id] || (product.sizes?.[0] || "UK 8");
    onAddToCart(product, chosenSize);
    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <section className="w-full bg-[#111827] text-white py-16 sm:py-24 border-y border-white/10 overflow-hidden relative" id="footwear-collection-section">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-moss/20 text-sand border border-moss/40 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold mb-3">
              <Footprints className="w-3.5 h-3.5 text-moss" />
              <span>Tirupati Merchandise Footwear Lab</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Architectural Footwear Collection.
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-sans mt-2 max-w-xl">
              Precision-engineered sneakers, luxury tech runners, and organic linen slip-ons with anatomical arch support and durable Vibram-inspired soles.
            </p>
          </div>

          {/* Slider Controls & View All */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onSelectCategory("Footwear")}
              className="text-xs font-mono uppercase tracking-widest text-sand hover:text-white underline font-bold mr-2 cursor-pointer"
            >
              VIEW ALL ({footwearProducts.length})
            </button>
            <button
              type="button"
              onClick={() => scrollSlider("left")}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-moss text-white flex items-center justify-center transition border border-white/20 cursor-pointer"
              title="Previous Sneakers"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollSlider("right")}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-moss text-white flex items-center justify-center transition border border-white/20 cursor-pointer"
              title="Next Sneakers"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-white/10">
          {FILTER_TABS.map((tab) => {
            const isSelected = selectedSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSubTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-moss text-linen font-bold shadow-md"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Footwear Horizontal Slider */}
        {footwearProducts.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 p-8">
            <Footprints className="w-8 h-8 text-moss mx-auto mb-2 opacity-60" />
            <p className="font-serif text-lg font-semibold text-gray-200">No sneakers found in this sub-category.</p>
            <button
              onClick={() => setSelectedSubTab("all")}
              className="mt-3 px-4 py-2 bg-moss text-linen text-xs font-mono uppercase font-bold rounded-lg cursor-pointer"
            >
              View All Footwear
            </button>
          </div>
        ) : (
          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory transition-all"
            style={{ scrollBehavior: "smooth" }}
          >
            {footwearProducts.map((product) => {
              const mainImg = product.images?.[0] || product.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80";
              const hoverImg = product.images?.[1] || mainImg;
              const chosenSize = selectedSizes[product.id] || product.sizes?.[0] || "UK 8";
              const isAdded = addedItemIds[product.id];

              return (
                <div
                  key={product.id}
                  className="w-[280px] sm:w-[320px] shrink-0 bg-[#1F2937] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between group snap-start transition-all duration-300 hover:border-moss/50 hover:shadow-2xl"
                >
                  <div>
                    {/* Image Box */}
                    <div
                      onClick={() => onSelectProduct(product)}
                      className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/40 mb-3 cursor-pointer group/img"
                    >
                      <img
                        src={mainImg}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                      />
                      {hoverImg && hoverImg !== mainImg && (
                        <img
                          src={hoverImg}
                          alt={product.name}
                          className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover/img:opacity-100 transition-opacity duration-500"
                        />
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {product.tags?.includes("archival") || product.tags?.includes("limited edition") ? (
                          <span className="bg-amber-500 text-black text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            LIMITED DROP
                          </span>
                        ) : product.featured ? (
                          <span className="bg-moss text-linen text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            BESTSELLER
                          </span>
                        ) : null}
                      </div>

                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{product.rating || product.ratingAvg || 4.9}</span>
                      </div>

                      {/* Quick View Floating Overlay Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 text-ink hover:bg-moss hover:text-linen px-3 py-1.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider opacity-0 group-hover/img:opacity-100 transition-all duration-300 flex items-center gap-1.5 shadow-lg"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>QUICK VIEW</span>
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-1 mb-3">
                      <span className="text-[10px] font-mono text-moss uppercase tracking-wider block font-semibold">
                        {product.brand || "Tirupati Merchandise Footwear Lab"} • {product.fitStyle || "Runner"}
                      </span>
                      <h3
                        onClick={() => onSelectProduct(product)}
                        className="font-serif text-base font-semibold text-white line-clamp-1 hover:text-sand cursor-pointer transition-colors"
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="font-mono text-sm font-bold text-white">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.mrp && product.mrp > product.price && (
                          <span className="font-mono text-xs text-gray-500 line-through">
                            ₹{product.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Shoe Size Selector Pills */}
                    <div className="mb-4">
                      <span className="text-[9px] font-mono uppercase text-gray-400 block mb-1 font-bold">
                        SELECT SIZE ({chosenSize}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(product.sizes && product.sizes.length > 0
                          ? product.sizes
                          : ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]
                        ).slice(0, 5).map((sz) => {
                          const isSelected = chosenSize === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleSizeSelect(product.id, sz)}
                              className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-moss text-linen border-moss font-bold"
                                  : "bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-500"
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={() => handleAddProductToCart(product)}
                    className={`w-full py-2.5 rounded-xl font-mono text-xs uppercase font-bold tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                      isAdded
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-moss text-linen hover:bg-white hover:text-ink shadow-sm"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>ADDED TO BAG</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>ADD TO BAG</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footwear Guarantee Strip */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-moss/20 flex items-center justify-center text-moss shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white">30-Day Comfort Guarantee</h4>
              <p className="text-[11px] text-gray-400 font-sans">Wear it, test it. Easy size exchange or full refund.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-moss/20 flex items-center justify-center text-moss shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white">Italian Vegetable Leather</h4>
              <p className="text-[11px] text-gray-400 font-sans">Non-toxic, organic tanning with natural botanical oils.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-moss/20 flex items-center justify-center text-moss shrink-0">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-white">Shock-Absorbing EVA Sole</h4>
              <p className="text-[11px] text-gray-400 font-sans">Engineered for long-distance urban locomotion.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

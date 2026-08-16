import React, { useState } from "react";
import { ShoppingBag, Check, Sparkles, Plus, ArrowRight, Tag } from "lucide-react";
import { Product } from "../types";

interface ShopTheLookSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
  onAddMultipleToCart?: (items: { product: Product; size: string }[]) => void;
}

interface LookBookOutfit {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  lookImage: string;
  apparelSearchName: string;
  footwearSearchName: string;
  hotspots: {
    top: string;
    left: string;
    label: string;
    productType: "apparel" | "footwear";
  }[];
}

const CURATED_LOOKS: LookBookOutfit[] = [
  {
    id: "look-01",
    number: "LOOK 01",
    title: "The Urban Nomad Ensemble",
    subtitle: "Heavyweight Boxy Shirt + Wide Trousers + Obsidian Tech Runner",
    lookImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80",
    apparelSearchName: "Urban Graphic",
    footwearSearchName: "Obsidian",
    hotspots: [
      { top: "35%", left: "50%", label: "Urban Graphic Co-ord Shirt", productType: "apparel" },
      { top: "82%", left: "48%", label: "Obsidian Tech Runner", productType: "footwear" }
    ]
  },
  {
    id: "look-02",
    number: "LOOK 02",
    title: "Coastal Trail Explorer",
    subtitle: "Loomed Linen Resort Tunic + Terra-Suede High-Top Trainer",
    lookImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80",
    apparelSearchName: "Saharan",
    footwearSearchName: "Terra-Suede",
    hotspots: [
      { top: "30%", left: "45%", label: "Saharan Linen Tunic", productType: "apparel" },
      { top: "85%", left: "52%", label: "Terra-Suede Trail Trainer", productType: "footwear" }
    ]
  },
  {
    id: "look-03",
    number: "LOOK 03",
    title: "Minimalist Metropolitan",
    subtitle: "Organic Heavyweight Crewneck + Aero-Knit Court Sneaker",
    lookImage: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1000&auto=format&fit=crop&q=80",
    apparelSearchName: "Classic",
    footwearSearchName: "Aero-Knit",
    hotspots: [
      { top: "28%", left: "48%", label: "Heavyweight Basic Tee", productType: "apparel" },
      { top: "84%", left: "46%", label: "Aero-Knit Court Sneaker", productType: "footwear" }
    ]
  }
];

export default function ShopTheLookSection({
  products,
  onSelectProduct,
  onAddToCart,
  onAddMultipleToCart
}: ShopTheLookSectionProps) {
  const [activeLookIdx, setActiveLookIdx] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [bundleAdded, setBundleAdded] = useState(false);

  const currentLook = CURATED_LOOKS[activeLookIdx];

  // Match paired products from catalog
  const pairedApparel =
    products.find((p) => p.name.toLowerCase().includes(currentLook.apparelSearchName.toLowerCase())) ||
    products.find((p) => p.category?.toLowerCase() !== "footwear") ||
    products[0];

  const pairedFootwear =
    products.find((p) => p.name.toLowerCase().includes(currentLook.footwearSearchName.toLowerCase())) ||
    products.find((p) => (p.category || "").toLowerCase().includes("footwear")) ||
    products[products.length - 1];

  const handleSizeChange = (prodId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [prodId]: size }));
  };

  const handleBuyCompleteLook = () => {
    const apparelSize = selectedSizes[pairedApparel.id] || pairedApparel.sizes?.[0] || "M";
    const footwearSize = selectedSizes[pairedFootwear.id] || pairedFootwear.sizes?.[0] || "UK 8";

    if (onAddMultipleToCart) {
      onAddMultipleToCart([
        { product: pairedApparel, size: apparelSize },
        { product: pairedFootwear, size: footwearSize }
      ]);
    } else {
      onAddToCart(pairedApparel, apparelSize);
      onAddToCart(pairedFootwear, footwearSize);
    }

    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 3000);
  };

  const bundleTotalPrice = (pairedApparel?.price || 0) + (pairedFootwear?.price || 0);
  const bundleDiscountedPrice = Math.round(bundleTotalPrice * 0.9); // 10% bundle saving

  return (
    <section className="w-full bg-[#FAF9F5] py-16 sm:py-24 border-b border-terrain/20 text-ink overflow-hidden" id="shop-the-look-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 bg-moss/10 text-moss px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CROSS-MERCHANDISED CURATION</span>
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-ink leading-tight">
            Shop The Complete Look.
          </h2>
          <p className="text-xs sm:text-sm text-earth/80 font-sans mt-3">
            Harmonious pairings of our organic travel apparel with precision-engineered footwear. Buy the complete outfit together and save 10%.
          </p>
        </div>

        {/* Look Tabs Navigation */}
        <div className="flex justify-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-none">
          {CURATED_LOOKS.map((look, idx) => {
            const isSelected = activeLookIdx === idx;
            return (
              <button
                key={look.id}
                type="button"
                onClick={() => setActiveLookIdx(idx)}
                className={`px-5 py-2.5 rounded-full font-mono text-xs uppercase font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "bg-ink text-linen shadow-lg border border-ink"
                    : "bg-white text-earth hover:bg-sand/40 border border-terrain/30"
                }`}
              >
                <span>{look.number}</span>: <span className="font-normal">{look.title}</span>
              </button>
            );
          })}
        </div>

        {/* Main Grid: Lookbook Imagery + Product Bundle Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-terrain/20 rounded-3xl p-6 sm:p-10 shadow-xl">
          
          {/* Left: Lookbook Feature Image with Interactive Hotspots (6 Cols) */}
          <div className="lg:col-span-6 relative aspect-3/4 sm:aspect-4/5 w-full rounded-2xl overflow-hidden shadow-md group">
            <img
              src={currentLook.lookImage}
              alt={currentLook.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Look Tag Badge */}
            <div className="absolute top-4 left-4 z-10 bg-moss text-linen font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
              {currentLook.number} • OUTFIT
            </div>

            {/* Interactive Hotspot Pins */}
            {currentLook.hotspots.map((spot, idx) => (
              <div
                key={idx}
                style={{ top: spot.top, left: spot.left }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer"
              >
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-moss opacity-75" />
                  <div className="relative w-7 h-7 rounded-full bg-white text-moss font-bold font-mono text-xs flex items-center justify-center shadow-lg border border-moss">
                    <Plus className="w-4 h-4" />
                  </div>

                  {/* Tooltip on Hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover/pin:opacity-100 transition-opacity duration-200 pointer-events-none bg-ink text-white text-[11px] font-mono px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl z-30">
                    <span className="font-bold">{spot.label}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom Caption */}
            <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
              <h3 className="font-serif text-xl font-bold">{currentLook.title}</h3>
              <p className="text-xs text-sand/90 font-sans">{currentLook.subtitle}</p>
            </div>
          </div>

          {/* Right: Paired Items Detail & Bundle Purchase (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-terrain/15 mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-earth/60 font-bold">
                  CURATED OUTFIT COMPONENTS
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-moss font-bold bg-moss/10 px-2.5 py-0.5 rounded-full">
                  <Tag className="w-3 h-3" /> 10% BUNDLE SAVINGS
                </span>
              </div>

              {/* Individual Item 1: APPAREL */}
              {pairedApparel && (
                <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-terrain/20 mb-4 flex items-center gap-4 hover:border-moss/40 transition">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0 border border-terrain/10">
                    <img
                      src={pairedApparel.images?.[0] || pairedApparel.image}
                      alt={pairedApparel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase text-moss font-bold">
                        1. APPAREL
                      </span>
                      <span className="font-mono text-xs font-bold text-ink">
                        ₹{pairedApparel.price.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <h4
                      onClick={() => onSelectProduct(pairedApparel)}
                      className="font-serif text-sm font-bold text-ink hover:text-moss cursor-pointer transition line-clamp-1"
                    >
                      {pairedApparel.name}
                    </h4>

                    {/* Size Selector */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[9px] font-mono text-earth/60 font-bold">SIZE:</span>
                      <div className="flex gap-1">
                        {(pairedApparel.sizes || ["S", "M", "L", "XL"]).map((sz) => {
                          const isSel = (selectedSizes[pairedApparel.id] || pairedApparel.sizes?.[0] || "M") === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleSizeChange(pairedApparel.id, sz)}
                              className={`px-2 py-0.5 text-[9px] font-mono rounded transition cursor-pointer ${
                                isSel
                                  ? "bg-moss text-linen font-bold"
                                  : "bg-white text-earth border border-terrain/20 hover:border-moss"
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Plus Divider */}
              <div className="flex justify-center my-1 text-earth/40">
                <Plus className="w-5 h-5 animate-pulse" />
              </div>

              {/* Individual Item 2: FOOTWEAR */}
              {pairedFootwear && (
                <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-terrain/20 mb-4 flex items-center gap-4 hover:border-moss/40 transition">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0 border border-terrain/10">
                    <img
                      src={pairedFootwear.images?.[0] || pairedFootwear.image}
                      alt={pairedFootwear.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase text-moss font-bold">
                        2. FOOTWEAR
                      </span>
                      <span className="font-mono text-xs font-bold text-ink">
                        ₹{pairedFootwear.price.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <h4
                      onClick={() => onSelectProduct(pairedFootwear)}
                      className="font-serif text-sm font-bold text-ink hover:text-moss cursor-pointer transition line-clamp-1"
                    >
                      {pairedFootwear.name}
                    </h4>

                    {/* Shoe Size Selector */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[9px] font-mono text-earth/60 font-bold">SHOE SIZE:</span>
                      <div className="flex gap-1 flex-wrap">
                        {(pairedFootwear.sizes || ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"]).map((sz) => {
                          const isSel = (selectedSizes[pairedFootwear.id] || pairedFootwear.sizes?.[0] || "UK 8") === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleSizeChange(pairedFootwear.id, sz)}
                              className={`px-2 py-0.5 text-[9px] font-mono rounded transition cursor-pointer ${
                                isSel
                                  ? "bg-moss text-linen font-bold"
                                  : "bg-white text-earth border border-terrain/20 hover:border-moss"
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bundle Pricing Summary & Action Box */}
            <div className="bg-[#1C2333] text-white p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-sand/70 block">
                    BUNDLE PRICE (2 PIECES)
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-mono text-xl font-bold text-white">
                      ₹{bundleDiscountedPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="font-mono text-xs text-sand/50 line-through">
                      ₹{bundleTotalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <span className="bg-moss text-linen text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-full">
                  SAVE ₹{(bundleTotalPrice - bundleDiscountedPrice).toLocaleString("en-IN")}
                </span>
              </div>

              <button
                type="button"
                onClick={handleBuyCompleteLook}
                className={`w-full py-3.5 rounded-xl font-mono text-xs uppercase font-bold tracking-widest transition-all duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  bundleAdded
                    ? "bg-green-600 text-white"
                    : "bg-moss text-linen hover:bg-white hover:text-ink"
                }`}
              >
                {bundleAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>COMPLETE OUTFIT ADDED TO BAG!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>BUY COMPLETE LOOK (1-CLICK)</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

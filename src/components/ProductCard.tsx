import React, { useState } from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { Product } from "../types";
import { getDirectImageUrl, getDirectVideoUrl } from "../utils";

export interface ProductCardProps {
  product: Product;
  pIdx?: number;
  isStarred?: boolean;
  onToggleWishlist?: (id: string, name: string) => void;
  onSelectProduct: (product: Product, imgIdx?: number) => void;
  detectedVideos?: Record<string, boolean>;
}

export interface SwatchItem {
  id: string;
  image: string;
  label: string;
  colorHex?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  pIdx = 0,
  isStarred = false,
  onToggleWishlist,
  onSelectProduct,
  detectedVideos = {},
}) => {
  // Local state for interactive variant thumbnail swapping
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Extract variations/swatches from the product data
  const getVariantSwatches = (p: Product): SwatchItem[] => {
    const swatches: SwatchItem[] = [];
    const seenImages = new Set<string>();

    // 1. Map from variants array
    if (p.variants && p.variants.length > 0) {
      p.variants.forEach((v: any, idx: number) => {
        const img = v.images?.[0] || (idx === 0 ? p.images?.[0] : "");
        if (img && !seenImages.has(img)) {
          seenImages.add(img);
          const label = v.color
            ? v.design
              ? `${v.color} - ${v.design}`
              : v.color
            : v.name || `Variant ${idx + 1}`;
          swatches.push({
            id: `var-${idx}`,
            image: img,
            label,
            colorHex: v.colorHex,
          });
        }
      });
    }

    // 2. Map from combos array if variants are sparse
    if (swatches.length < 2 && p.combos && p.combos.length > 0) {
      p.combos.forEach((c: any, idx: number) => {
        const img = c.images?.[0];
        if (img && !seenImages.has(img)) {
          seenImages.add(img);
          swatches.push({
            id: `combo-${idx}`,
            image: img,
            label: `Bundle ${idx + 1}`,
          });
        }
      });
    }

    // 3. Fallback: if product has multiple image options
    if (swatches.length < 2 && p.images && p.images.length > 1) {
      p.images.forEach((img, idx) => {
        if (img && !seenImages.has(img)) {
          seenImages.add(img);
          swatches.push({
            id: `img-${idx}`,
            image: img,
            label: `Option ${idx + 1}`,
          });
        }
      });
    }

    return swatches;
  };

  const swatches = getVariantSwatches(product);
  const MAX_SWATCHES = 4;
  const displayedSwatches = swatches.slice(0, MAX_SWATCHES);
  const remainingCount = swatches.length - MAX_SWATCHES;

  // Active main image calculation
  const currentImage = activeImage || product.images?.[0] || product.image || "";
  const hoverSecondaryImage = !activeImage && product.images?.[1] ? product.images[1] : null;

  // Pricing calculations
  const mrpVal = product.mrp || (product.price ? Math.round(product.price * 1.25) : 0);
  const hasDiscount = mrpVal > product.price;
  const baseDiscountPct = hasDiscount ? Math.round(((mrpVal - product.price) / mrpVal) * 100) : 0;

  // Badge distribution logic
  let badgeText = "";
  let badgeStyle = "bg-zinc-900 text-white";
  if (pIdx % 3 === 0 && baseDiscountPct > 0) {
    badgeText = `${baseDiscountPct}% OFF`;
    badgeStyle = "bg-zinc-900 text-white";
  } else if (pIdx % 3 === 1) {
    badgeText = "NEW DROP";
    badgeStyle = "bg-moss text-linen";
  } else if (pIdx % 3 === 2 && baseDiscountPct > 0) {
    badgeText = baseDiscountPct > 25 ? `${baseDiscountPct - 5}% OFF` : "LIMITED";
    badgeStyle = "bg-amber-900 text-amber-50";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group flex flex-col justify-between relative h-full bg-white p-2 sm:p-3 rounded-xl border border-zinc-100 shadow-2xs hover:shadow-md transition-all duration-300"
      id={`product-card-${product.id}`}
    >
      <div>
        {/* Product Image Container */}
        <div
          onClick={() => onSelectProduct(product, 0)}
          className="relative aspect-[3/4] bg-zinc-100 border border-zinc-200/60 cursor-pointer overflow-hidden rounded-lg group-hover:-translate-y-0.5 transition-transform duration-300"
        >
          {/* Badge */}
          {badgeText && (
            <div
              className={`absolute top-2 left-2 z-10 ${badgeStyle} font-mono text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-xs tracking-wider`}
            >
              {badgeText}
            </div>
          )}

          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleWishlist) {
                onToggleWishlist(product.id, product.name);
              }
            }}
            className="absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-black/30 backdrop-blur-md text-white hover:bg-black/60 hover:scale-105 transition rounded-full flex items-center justify-center border border-white/20 shadow-2xs cursor-pointer"
            title={isStarred ? "Remove from Wishlist" : "Save for Later"}
          >
            <Heart className={`w-3.5 h-3.5 ${isStarred ? "fill-amber-500 text-amber-500" : "text-white"}`} />
          </button>

          {/* Main Displayed Image / Video */}
          {detectedVideos[currentImage] ? (
            <video
              src={getDirectVideoUrl(currentImage)}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-100 ${
                hoverSecondaryImage ? "group-hover:opacity-0" : "group-hover:opacity-100"
              } group-hover:scale-105 select-none`}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={getDirectImageUrl(currentImage) || "/placeholder.jpg"}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-100 ${
                hoverSecondaryImage ? "group-hover:opacity-0" : "group-hover:opacity-100"
              } group-hover:scale-105 select-none`}
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          )}

          {/* Secondary Hover Image (only if activeImage hasn't been set explicitly) */}
          {hoverSecondaryImage && (
            detectedVideos[hoverSecondaryImage] ? (
              <video
                src={getDirectVideoUrl(hoverSecondaryImage)}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105 select-none"
                autoPlay
                loop
                muted
                playsInline
                preload="none"
              />
            ) : (
              <img
                src={getDirectImageUrl(hoverSecondaryImage) || "/placeholder.jpg"}
                alt={`${product.name} alternate view`}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105 select-none"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            )
          )}
        </div>

        {/* Inline Variant Selector (Swatches) */}
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none min-h-[36px]">
          {displayedSwatches.length > 0 ? (
            <>
              {displayedSwatches.map((swatch) => {
                const isActive = currentImage === swatch.image;

                return (
                  <button
                    key={swatch.id}
                    type="button"
                    onMouseEnter={() => setActiveImage(swatch.image)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage(swatch.image);
                    }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md border overflow-hidden transition-all flex-shrink-0 relative cursor-pointer ${
                      isActive
                        ? "ring-2 ring-[#1C2333] border-[#1C2333] scale-105 shadow-2xs z-10"
                        : "border-zinc-200/80 opacity-75 hover:opacity-100 hover:border-zinc-400 hover:scale-102"
                    }`}
                    title={swatch.label}
                  >
                    <img
                      src={getDirectImageUrl(swatch.image)}
                      alt={swatch.label}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </button>
                );
              })}

              {remainingCount > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProduct(product, 0);
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border border-zinc-200 bg-zinc-100 hover:bg-[#1C2333] hover:text-white text-zinc-700 text-[10px] font-mono font-bold flex items-center justify-center transition flex-shrink-0 cursor-pointer"
                  title={`+${remainingCount} more variation${remainingCount > 1 ? "s" : ""}`}
                >
                  +{remainingCount}
                </button>
              )}
            </>
          ) : (
            /* Spacer to keep card heights uniform across grid */
            <div className="h-7 sm:h-8" />
          )}
        </div>

        {/* Essential Product Info Block */}
        <div className="mt-1 space-y-1 text-left px-0.5">
          {/* Title */}
          <h3
            onClick={() => onSelectProduct(product, 0)}
            className="font-sans text-xs sm:text-sm font-semibold text-zinc-900 hover:text-amber-700 transition cursor-pointer leading-snug line-clamp-2"
          >
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900">
              ₹{Math.round(product.price || 0).toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="font-mono text-[10px] sm:text-xs text-zinc-400 line-through font-normal">
                ₹{Math.round(mrpVal).toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

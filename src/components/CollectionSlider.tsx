import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "../types";
import { getDirectImageUrl } from "../utils";

interface CollectionSliderProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

/**
 * CollectionSlider component that elegantly showcases related items
 * with high-fidelity, premium horizontal scrollbars and precise image path mapping.
 */
export default function CollectionSlider({
  products,
  title = "More Graphics from this Collection",
  subtitle = "EXPLORE CO-ORDINATED DESIGNS AND COMPLEMENTARY SPECS"
}: CollectionSliderProps) {
  
  // Helper to generate strict parameterized image URLs based on catalog specifications
  const getParameterizedUrl = (product: Product): string => {
    const id = product.id || "prod-unknown";
    const name = (product.name || "Apparel").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const category = (product.category || "Loomed Shirts").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    
    // Fallback/base values for parameters
    const color = (product.colors?.[0] || product.Colour || "Default").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const price = Math.round(product.price || 200);
    
    // If Two-Piece Set, handle both Top and Bottom sizes, else standard sizes
    let sizesStr = "all";
    if (product.productType === "Two-Piece Set") {
      const topSizesJoined = (product.topSizes || ["S", "M", "L", "XL"]).join(",");
      const bottomSizesJoined = (product.sizes || ["30", "32", "34", "36"]).join(",");
      sizesStr = `${topSizesJoined}|${bottomSizesJoined}`;
    } else {
      sizesStr = (product.sizes || ["S", "M", "L", "XL"]).join("-").toLowerCase();
    }
    
    const genderPreference = (product.genderPreference || product["Gender Preference"] || "Unisex").toLowerCase();
    
    // Format: /assets/catalog/${category}/${id}_${name}_${category}_${color}_${price}_${sizes}_${genderPreference}.jpg
    const structuredName = `${id}_${name}_${category}_${color}_${price}_${sizesStr}_${genderPreference}.jpg`;
    return `/assets/catalog/${category}/${structuredName}`;
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-ink border-t border-sand/10">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center sm:text-left">
          {subtitle && (
            <p className="text-[9px] text-moss uppercase tracking-[0.2em] font-mono mb-1 font-bold">
              {subtitle}
            </p>
          )}
          <h2 className="text-xl sm:text-2xl text-linen font-sans font-medium tracking-tight">
            {title}
          </h2>
        </div>

        {/* Horizontally Scrollable Slider */}
        <div className="relative">
          {/* Main scroll container - Custom hidden scrollbars */}
          <div 
            className="flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory 
                       [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                       sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-x-visible sm:pb-0"
          >
            {products.map((product) => {
              const imagePath = getParameterizedUrl(product);
              const resolvedSrc = getDirectImageUrl(imagePath);

              return (
                <div 
                  key={product.id} 
                  className="min-w-[260px] w-[260px] sm:w-auto sm:min-w-0 snap-start group"
                >
                  <Link 
                    href={`/product/${product.id}`}
                    className="block space-y-4"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-900/40 border border-sand/10 group-hover:border-sand/25 transition duration-500 shadow-sm group-hover:shadow-lg">
                      <Image
                        src={resolvedSrc}
                        alt={product.name}
                        fill
                        className="object-cover transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-95"
                        sizes="(max-width: 640px) 260px, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={false}
                        loading="lazy"
                      />
                      
                      {/* Premium Accent Corner Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                        <span className="text-[10px] text-linen font-mono uppercase tracking-wider bg-moss/90 px-2.5 py-1 rounded-md backdrop-blur-sm shadow-md">
                          View Details
                        </span>
                      </div>

                      {/* Floating Badge for Co-ord Set */}
                      {product.productType === "Two-Piece Set" && (
                        <span className="absolute top-3 left-3 text-[8px] font-mono font-bold uppercase tracking-widest text-linen/90 bg-stone-900/80 border border-sand/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                          Set Bundle
                        </span>
                      )}
                    </div>

                    {/* Meta Details */}
                    <div className="space-y-1 px-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <h3 className="text-xs text-linen/90 font-mono tracking-tight line-clamp-1 group-hover:text-white transition duration-300">
                          {product.name}
                        </h3>
                        <span className="text-xs text-linen/80 font-mono font-bold shrink-0">
                          ₹{product.price}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-[9px] text-linen/40 font-mono uppercase tracking-wider">
                        <span>{product.category}</span>
                        <span>{product.genderPreference || "Unisex"}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

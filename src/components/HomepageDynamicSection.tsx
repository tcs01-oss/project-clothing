import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Heart, Star, ShoppingBag } from "lucide-react";
import { Product } from "../types";

interface HomepageDynamicSectionProps {
  key?: string | number;
  section: {
    id: string;
    title: string;
    subtitle?: string;
    layoutType: "grid" | "carousel";
    productIds: string[];
  };
  products: Product[];
  wishlist: string[];
  toggleWishlist: (productId: string, productName: string) => void;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>> | ((product: Product | null) => void);
  setActiveImgIdx: React.Dispatch<React.SetStateAction<number>> | ((idx: number) => void);
  addToCart: (product: Product, size: string, variant?: any) => void;
  setIsCheckoutOpen: React.Dispatch<React.SetStateAction<boolean>> | ((open: boolean) => void);
  detectedVideos: Record<string, boolean>;
  getDirectImageUrl: (src: string) => string;
  getDirectVideoUrl: (src: string) => string;
}

export default function HomepageDynamicSection({
  section,
  products,
  wishlist,
  toggleWishlist,
  setSelectedProduct,
  setActiveImgIdx,
  addToCart,
  setIsCheckoutOpen,
  detectedVideos,
  getDirectImageUrl,
  getDirectVideoUrl
}: HomepageDynamicSectionProps) {
  let sectionProducts = section.productIds
    .map(pid => products.find(p => p.id === pid))
    .filter((p): p is Product => !!p);

  if (sectionProducts.length === 0) {
    // Fallback Logic: fetch the 4 most recently added products from the database
    const getProductTimestamp = (p: Product) => {
      const match = p.id.match(/\d+/);
      if (match) {
        return parseInt(match[0], 10);
      }
      return 0; // default/fallback
    };

    const sortedByRecent = [...products].sort((a, b) => {
      const tA = getProductTimestamp(a);
      const tB = getProductTimestamp(b);
      if (tA !== tB) {
        return tB - tA; // newer timestamps first
      }
      return b.id.localeCompare(a.id);
    });

    sectionProducts = sortedByRecent.slice(0, 4);
  }

  if (sectionProducts.length === 0) return null;

  // Carousel dragging and scrolling
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    hasDragged.current = false;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeft.current = carouselRef.current.scrollLeft;
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5) {
      hasDragged.current = true;
    }
    carouselRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const scrollLeftBtn = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRightBtn = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden py-16 px-1.5 sm:px-4 md:px-6 w-full max-w-none bg-[#F5F0E8]/95 border-b border-terrain/10" id={`homepage-section-${section.id}`}>
      <div className="relative z-10 w-full max-w-none space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B5652F] block font-bold">
            Curated Showcase
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1C2333] font-light leading-tight">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-earth/70 text-xs sm:text-sm font-sans font-light max-w-md mx-auto">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Carousel Layout */}
        {(section.layoutType === "carousel" || section.id === "sec-featured") ? (
          <div className="relative">
            {/* Left arrow button */}
            <button 
              onClick={scrollLeftBtn} 
              className="absolute left-1 sm:-left-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white text-[#1C2333] hover:scale-110 p-2 sm:p-3 rounded-full shadow-lg border border-terrain/10 transition-all opacity-95 hover:opacity-100 flex items-center justify-center cursor-pointer transition-transform duration-200"
              aria-label="Slide Left"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Right arrow button */}
            <button 
              onClick={scrollRightBtn} 
              className="absolute right-1 sm:-right-4 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white text-[#1C2333] hover:scale-110 p-2 sm:p-3 rounded-full shadow-lg border border-terrain/10 transition-all opacity-95 hover:opacity-100 flex items-center justify-center cursor-pointer transition-transform duration-200"
              aria-label="Slide Right"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div 
              ref={carouselRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeaveOrUp}
              onMouseUp={handleMouseLeaveOrUp}
              onMouseMove={handleMouseMove}
              className={`flex flex-row overflow-x-auto gap-2 sm:gap-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-4 cursor-grab ${isDragging ? 'cursor-grabbing select-none' : ''}`}
            >
              {sectionProducts.map((p) => {
                const isStarred = wishlist.includes(p.id);
                return (
                  <div key={`section-carousel-${section.id}-${p.id}`} className="group flex flex-col justify-between relative animate-fade-in w-[46.5vw] xs:w-[47vw] md:w-[400px] shrink-0 snap-start" id={`section-card-${section.id}-${p.id}`}>
                    <div 
                      onClick={(e) => { 
                        if (hasDragged.current) {
                          e.preventDefault();
                          e.stopPropagation();
                          return;
                        }
                        setSelectedProduct(p); 
                        setActiveImgIdx(0); 
                      }}
                      className="relative aspect-[3/4] bg-[#F7F5F0] border border-terrain/20 cursor-pointer overflow-hidden rounded-xl shadow-[0_8px_20px_rgba(28,28,26,0.04)] group-hover:shadow-[0_20px_45px_rgba(28,28,26,0.08)] group-hover:-translate-y-1 transition-all duration-500"
                    >
                      {/* Category Tag */}
                      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 bg-[#2C3327]/90 text-white font-mono text-[8.5px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-xs select-none backdrop-blur-xs">
                        {p.category === "Loomed Shirts" ? "LINEN" : p.category === "Loomed Pants" ? "BOTANICAL FLAX" : p.category === "Artisan Robes" ? "ORGANIC COTTON" : p.category === "Shirt & Pant Combo" ? "CO-ORD COMBO" : "NATURAL OVERCOAT"}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p.id, p.name);
                        }}
                        className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-black/30 backdrop-blur-md text-white hover:bg-black/50 hover:scale-105 transition rounded-full flex items-center justify-center border border-white/20 shadow-xs cursor-pointer"
                        title={isStarred ? "Remove from Wishlist" : "Save for Later"}
                      >
                        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isStarred ? "fill-[#B5652F] text-[#B5652F]" : "text-white"}`} />
                      </button>

                      {/* Default Product Image */}
                      {detectedVideos[p.images?.[0]] ? (
                        <video
                          src={getDirectVideoUrl(p.images[0])}
                          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-100 ${p.images?.[1] ? "group-hover:opacity-0" : "group-hover:opacity-100"} group-hover:scale-110 select-none rounded-xl`}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="metadata"
                          style={{ transform: "translateZ(0)" }}
                        />
                      ) : (
                        <img
                          src={getDirectImageUrl(p.images?.[0]) || ""}
                          alt={p.name}
                          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-100 ${p.images?.[1] ? "group-hover:opacity-0" : "group-hover:opacity-100"} group-hover:scale-110 select-none rounded-xl`}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      )}

                      {/* Hover Flat Lay Image */}
                      {p.images?.[1] && (
                        detectedVideos[p.images[1]] ? (
                          <video
                            src={getDirectVideoUrl(p.images[1])}
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110 select-none rounded-xl"
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="none"
                          />
                        ) : (
                          <img
                            src={getDirectImageUrl(p.images?.[1]) || ""}
                            alt={`${p.name} flat lay`}
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110 select-none rounded-xl"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        )
                      )}
                    </div>

                    {/* Below Image Product Information */}
                    <div className="mt-3.5 space-y-1.5 text-left px-1 sm:px-0">
                      <div className="flex justify-between items-start gap-1.5">
                        <h3 
                          onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                          className="font-serif text-base sm:text-lg text-ink hover:text-terrain transition cursor-pointer leading-tight font-medium"
                        >
                          {p.name}
                        </h3>
                        <span className="font-mono text-xs sm:text-sm text-ink shrink-0 font-medium">
                          ₹{Math.round(p.price || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      
                      {/* Ratings */}
                      <div className="flex items-center gap-1.5 py-0.5">
                        <div className="flex items-center text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < Math.floor(p.rating || 4.8) ? "fill-current" : "opacity-30"}`} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-mono text-earth/60">
                          {(p.rating || 4.8).toFixed(1)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-widest text-terrain font-medium">
                          {p.category}
                        </span>
                        <button
                          onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                          className="text-[10px] sm:text-[11px] text-earth/50 hover:text-ink font-mono uppercase tracking-wider transition underline"
                        >
                          Details →
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Grid Layout */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-6">
            {sectionProducts.map((p) => {
              const isStarred = wishlist.includes(p.id);
              return (
                <div key={`section-grid-${section.id}-${p.id}`} className="group flex flex-col justify-between relative h-full animate-fade-in" id={`section-card-${section.id}-${p.id}`}>
                  <div 
                    onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                    className="relative aspect-[3/4] bg-[#F7F5F0] border border-terrain/20 cursor-pointer overflow-hidden rounded-xl shadow-[0_8px_20px_rgba(28,28,26,0.04)] group-hover:shadow-[0_20px_45px_rgba(28,28,26,0.08)] group-hover:-translate-y-1 transition-all duration-500"
                  >
                    {/* Category Tag */}
                    <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 bg-[#2C3327]/90 text-white font-mono text-[8.5px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-xs select-none backdrop-blur-xs">
                      {p.category === "Loomed Shirts" ? "LINEN" : p.category === "Loomed Pants" ? "BOTANICAL FLAX" : p.category === "Artisan Robes" ? "ORGANIC COTTON" : p.category === "Shirt & Pant Combo" ? "CO-ORD COMBO" : "NATURAL OVERCOAT"}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p.id, p.name);
                      }}
                      className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-black/30 backdrop-blur-md text-white hover:bg-black/50 hover:scale-105 transition rounded-full flex items-center justify-center border border-white/20 shadow-xs cursor-pointer"
                      title={isStarred ? "Remove from Wishlist" : "Save for Later"}
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isStarred ? "fill-[#B5652F] text-[#B5652F]" : "text-white"}`} />
                    </button>

                    {/* Default Product Image */}
                    {detectedVideos[p.images?.[0]] ? (
                      <video
                        src={getDirectVideoUrl(p.images[0])}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-100 ${p.images?.[1] ? "group-hover:opacity-0" : "group-hover:opacity-100"} group-hover:scale-110 select-none rounded-xl`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        style={{ transform: "translateZ(0)" }}
                      />
                    ) : (
                      <img
                        src={getDirectImageUrl(p.images?.[0]) || ""}
                        alt={p.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-100 ${p.images?.[1] ? "group-hover:opacity-0" : "group-hover:opacity-100"} group-hover:scale-110 select-none rounded-xl`}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    )}

                    {/* Hover Flat Lay Image */}
                    {p.images?.[1] && (
                      detectedVideos[p.images[1]] ? (
                        <video
                          src={getDirectVideoUrl(p.images[1])}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110 select-none rounded-xl"
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="none"
                        />
                      ) : (
                        <img
                          src={getDirectImageUrl(p.images?.[1]) || ""}
                          alt={`${p.name} flat lay`}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-110 select-none"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      )
                    )}
                  </div>

                  {/* Below Image Product Information */}
                  <div className="mt-4 space-y-1.5 text-left">
                    <div className="flex justify-between items-start gap-2">
                      <h3 
                        onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                        className="font-serif text-base sm:text-lg text-ink hover:text-terrain transition cursor-pointer leading-tight font-medium"
                      >
                        {p.name}
                      </h3>
                      <span className="font-mono text-xs sm:text-sm text-ink shrink-0">
                        ₹{Math.round(p.price || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Star Ratings */}
                    <div className="flex items-center gap-1.5 py-0.5">
                      <div className="flex items-center text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${i < Math.floor(p.rating || 4.8) ? "fill-current" : "opacity-30"}`} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-earth/60">
                        {(p.rating || 4.8).toFixed(1)} ({p.reviewsCount || 42} reviews)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-terrain font-medium">
                        {p.category}
                      </span>
                      <button
                        onClick={() => { setSelectedProduct(p); setActiveImgIdx(0); }}
                        className="text-[10px] text-earth/50 hover:text-ink font-mono uppercase tracking-wider transition underline"
                      >
                        Details →
                      </button>
                    </div>

                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </section>
  );
}

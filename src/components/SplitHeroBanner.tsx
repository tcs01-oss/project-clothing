import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface HeroBannerProps {
  onSelectCategory: (category: string, subCategory?: string) => void;
  onScrollToCatalog?: () => void;
  cmsConfig?: {
    heroImageUrl?: string;
    heroImageUrlMobile?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroCtaText?: string;
  };
  getDirectImageUrl?: (url: string) => string;
}

const HERO_TITLES = [
  "BEST PRICE",
  "TRENDING SNEAKERS",
  "FASTEST DELIVERY",
  "AESTHETIC DESIGNS"
];

const HERO_SLIDES = [
  {
    id: "slide-1",
    title: "BEST PRICE",
    subtitle: "Raw cotton textures, drop-shoulder silhouettes, and architectural kicks built for street culture.",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1600&auto=format&fit=crop&q=80",
    badge: "NEW DROP",
    ctaText: "SHOP NOW",
    category: "Apparel"
  },
  {
    id: "slide-2",
    title: "TRENDING SNEAKERS",
    subtitle: "High-top trainers, tech runners, and ergonomic soles engineered for all-day urban movement.",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1600&auto=format&fit=crop&q=80",
    badge: "HOT RELEASE",
    ctaText: "SHOP NOW",
    category: "Footwear"
  },
  {
    id: "slide-3",
    title: "FASTEST DELIVERY",
    subtitle: "Minimalist caps, utility cross-body bags, and hand-finished accents to complete your daily drip.",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&auto=format&fit=crop&q=80",
    badge: "ESSENTIALS",
    ctaText: "SHOP NOW",
    category: "Accessories"
  },
  {
    id: "slide-4",
    title: "AESTHETIC DESIGNS",
    subtitle: "Handcrafted silhouettes and custom bespoke footwear crafted for modern elegance.",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&auto=format&fit=crop&q=80",
    badge: "BESPOKE",
    ctaText: "SHOP NOW",
    category: "Footwear"
  }
];

const formatImageUrl = (url: string, customResolver?: (u: string) => string) => {
  if (!url) return "";
  if (customResolver) {
    const resolved = customResolver(url);
    if (resolved) return resolved;
  }
  const trimmed = url.trim();
  if (trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com")) {
    let fileId = "";
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      fileId = fileDMatch[1];
    } else {
      const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1]) fileId = idMatch[1];
    }
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }
  return trimmed;
};

export default function SplitHeroBanner({ onSelectCategory, onScrollToCatalog, cmsConfig, getDirectImageUrl }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Parse dynamic hero posters from CMS config (up to 4 or any number of comma-separated links)
  const desktopUrls = (cmsConfig?.heroImageUrl || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  const mobileUrls = (cmsConfig?.heroImageUrlMobile || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  const slides = desktopUrls.length > 0
    ? desktopUrls.map((url, idx) => {
        const mobUrl = mobileUrls[idx] || mobileUrls[0] || url;
        const fallback = HERO_SLIDES[idx % HERO_SLIDES.length];
        return {
          id: `cms-hero-slide-${idx}`,
          title: HERO_TITLES[idx % HERO_TITLES.length] || cmsConfig?.heroTitle || fallback?.title || "BEST PRICE",
          subtitle: cmsConfig?.heroSubtitle || fallback?.subtitle || "Bespoke street culture collection.",
          image: formatImageUrl(url, getDirectImageUrl),
          mobileImage: formatImageUrl(mobUrl, getDirectImageUrl),
          ctaText: cmsConfig?.heroCtaText || fallback?.ctaText || "SHOP NOW"
        };
      })
    : HERO_SLIDES.map((slide, idx) => ({
        ...slide,
        title: HERO_TITLES[idx % HERO_TITLES.length] || slide.title,
        mobileImage: slide.image
      }));

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Reset slide index if slides array shrinks
  useEffect(() => {
    if (slides.length > 0 && currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  const handleNext = () => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const activeSlideData = slides[currentSlide] || slides[0];

  const handleCtaClick = () => {
    if (onScrollToCatalog) {
      onScrollToCatalog();
    } else {
      const el = document.getElementById("products-grid") || document.getElementById("tirupati-merchandise-garments");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section 
      className="relative w-full h-[78vh] min-h-[500px] max-h-[780px] bg-[#0B0E14] text-white overflow-hidden flex flex-col justify-end border-b border-zinc-800"
      id="storefront-hero"
    >
      {/* Background Image Carousel with Smooth Crossfade */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <picture className="w-full h-full">
              {slide.mobileImage && (
                <source media="(max-width: 767px)" srcSet={slide.mobileImage} />
              )}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center filter brightness-[0.65] contrast-[1.08] transform scale-105 transition-transform duration-[8000ms] ease-out"
                referrerPolicy="no-referrer"
              />
            </picture>
            {/* Cinematic Streetwear Dark Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/50 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14]/80 via-transparent to-[#0B0E14]/40" />
          </div>
        );
      })}

      {/* Hero Content Overlay Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-16 flex flex-col items-start justify-end">
        {/* Animated Headline Text - Parallel with Hero Poster transitions */}
        <div className="relative w-full max-w-4xl min-h-[64px] sm:min-h-[110px] md:min-h-[130px] lg:min-h-[150px] mb-4 sm:mb-6 flex items-center">
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <h1
                key={`hero-title-${slide.id}`}
                className={`absolute inset-x-0 font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight uppercase leading-[1.05] drop-shadow-lg transition-all duration-1000 ease-in-out ${
                  isActive
                    ? "opacity-100 translate-y-0 scale-100 filter blur-0"
                    : "opacity-0 translate-y-6 scale-95 filter blur-[2px] pointer-events-none"
                }`}
              >
                {slide.title}
              </h1>
            );
          })}
        </div>

        {/* Bespoke High-Impact CTA Button */}
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCtaClick}
            className="w-full sm:w-auto h-12 sm:h-14 px-8 bg-white text-zinc-950 hover:bg-zinc-100 font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-lg shadow-xl flex items-center justify-center gap-3 cursor-pointer group/btn hover:scale-[1.02] active:scale-[0.98] border border-white"
          >
            <span>{activeSlideData.ctaText}</span>
            <ArrowRight className="w-4 h-4 text-zinc-950 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
          </button>
        </div>

      </div>

      {/* Bottom Carousel Controls & Indicators */}
      {slides.length > 1 && (
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 flex items-center justify-between text-white/70">
          {/* Slide Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to hero slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev / Next Minimal Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white transition-all cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white transition-all cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}


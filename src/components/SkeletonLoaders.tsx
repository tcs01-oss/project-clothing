import React from "react";

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-3 border border-[#E8E2D7]/60 shadow-xs space-y-3 animate-pulse font-sans">
      {/* Image Skeleton */}
      <div className="w-full aspect-[4/5] bg-stone-200/70 rounded-xl" />

      {/* Brand & Title */}
      <div className="space-y-1.5 px-1">
        <div className="h-3 bg-stone-200/80 rounded w-1/3" />
        <div className="h-4 bg-stone-300/80 rounded w-4/5" />
      </div>

      {/* Colors and Sizes */}
      <div className="flex items-center gap-1.5 px-1 pt-1">
        <div className="w-4 h-4 bg-stone-200 rounded-full" />
        <div className="w-4 h-4 bg-stone-200 rounded-full" />
        <div className="w-4 h-4 bg-stone-200 rounded-full" />
      </div>

      {/* Price & Add to Cart button */}
      <div className="pt-2 px-1 flex items-center justify-between border-t border-stone-100">
        <div className="h-5 bg-stone-300/80 rounded w-20" />
        <div className="h-9 w-24 bg-stone-200 rounded-lg" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export const FilterSidebarSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-4 bg-white rounded-2xl border border-[#E8E2D7]/60 animate-pulse font-sans">
      <div className="h-5 bg-stone-200 rounded w-1/2" />
      
      <div className="space-y-2">
        <div className="h-3 bg-stone-200 rounded w-1/3" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-9 bg-stone-200 rounded-md" />
          <div className="h-9 bg-stone-200 rounded-md" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-3 bg-stone-200 rounded w-1/3" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-stone-200" />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-3 bg-stone-200 rounded w-1/3" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 bg-stone-200 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse font-sans">
      {/* Gallery Skeleton */}
      <div className="space-y-4">
        <div className="w-full aspect-[4/5] bg-stone-200 rounded-2xl" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-stone-200 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Info Skeleton */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 bg-stone-200 rounded w-1/4" />
          <div className="h-8 bg-stone-300 rounded w-3/4" />
          <div className="h-6 bg-stone-200 rounded w-1/3" />
        </div>

        <div className="space-y-2">
          <div className="h-3 bg-stone-200 rounded w-1/5" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-stone-200" />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-3 bg-stone-200 rounded w-1/5" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-11 bg-stone-200 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="h-12 bg-stone-300 rounded-xl w-full" />
      </div>
    </div>
  );
};

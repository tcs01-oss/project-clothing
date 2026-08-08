import React from "react";

interface CategoryPillsBarProps {
  activeFilter: string;
  onSelectFilter: (filterId: string) => void;
}

const CATEGORY_PILLS = [
  { id: "ALL", label: "All Drops" },
  { id: "COMBO", label: "Combo" },
  { id: "SHOES", label: "Shoes" },
  { id: "ACCESSORIES", label: "Accessories" }
];

export default function CategoryPillsBar({ activeFilter, onSelectFilter }: CategoryPillsBarProps) {
  const handlePillClick = (filterId: string) => {
    onSelectFilter(filterId);
    // Smoothly scroll to the products grid if appropriate
    const gridEl = document.getElementById("products-grid") || document.getElementById("tirupati-merchandise-garments");
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-white border-b border-zinc-200 sticky top-16 z-30 shadow-xs py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none py-0.5 select-none [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-2 sm:gap-3 min-w-max mx-auto sm:mx-0">
          {CATEGORY_PILLS.map((pill) => {
            const isActive = activeFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => handlePillClick(pill.id)}
                className={`px-5 py-2.5 h-10 rounded-full text-xs sm:text-sm font-mono tracking-widest uppercase font-semibold transition-colors duration-200 cursor-pointer flex items-center justify-center whitespace-nowrap ${
                  isActive
                    ? "bg-zinc-900 text-white border border-zinc-900 shadow-xs"
                    : "bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-zinc-200/80 hover:text-zinc-900"
                }`}
              >
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { X, SlidersHorizontal, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  urlParams: URLSearchParams;
  updateUrlParam: (key: string, value: string | null) => void;
  clearAllUrlParams: () => void;
  hasActiveFilters: boolean;
  productsCount: number;
}

export default function FilterSidebar({
  isOpen,
  onClose,
  urlParams,
  updateUrlParam,
  clearAllUrlParams,
  hasActiveFilters,
  productsCount,
}: FilterSidebarProps) {
  // Temporary state for filters inside the modal
  const [tempGender, setTempGender] = useState<string | null>(urlParams.get("gender"));
  const [tempCategory, setTempCategory] = useState<string | null>(urlParams.get("category"));
  const [tempColors, setTempColors] = useState<string[]>(() => {
    const val = urlParams.get("color");
    return val ? val.split(",").filter(Boolean) : [];
  });
  const [tempSizes, setTempSizes] = useState<string[]>(() => {
    const val = urlParams.get("size");
    return val ? val.split(",").filter(Boolean) : [];
  });
  const [tempTags, setTempTags] = useState<string[]>(() => {
    const val = urlParams.get("tags");
    return val ? val.split(",").filter(Boolean) : [];
  });
  const [tempMinPrice, setTempMinPrice] = useState<number>(() => {
    const val = urlParams.get("minPrice");
    return val ? parseInt(val, 10) : 0;
  });
  const [tempMaxPrice, setTempMaxPrice] = useState<number>(() => {
    const val = urlParams.get("maxPrice");
    return val ? parseInt(val, 10) : 25000;
  });

  // Synchronize when urlParams or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setTempGender(urlParams.get("gender"));
      setTempCategory(urlParams.get("category"));
      
      const colVal = urlParams.get("color");
      setTempColors(colVal ? colVal.split(",").filter(Boolean) : []);
      
      const szVal = urlParams.get("size");
      setTempSizes(szVal ? szVal.split(",").filter(Boolean) : []);
      
      const tagVal = urlParams.get("tags");
      setTempTags(tagVal ? tagVal.split(",").filter(Boolean) : []);
      
      const minP = urlParams.get("minPrice");
      setTempMinPrice(minP ? parseInt(minP, 10) : 0);
      
      const maxP = urlParams.get("maxPrice");
      setTempMaxPrice(maxP ? parseInt(maxP, 10) : 25000);
    }
  }, [urlParams, isOpen]);

  const hasTempActiveFilters = !!(
    tempGender ||
    tempCategory ||
    tempColors.length > 0 ||
    tempSizes.length > 0 ||
    tempTags.length > 0 ||
    tempMinPrice > 0 ||
    tempMaxPrice < 25000
  );

  // Apply filters to URL
  const handleApply = () => {
    updateUrlParam("gender", tempGender);
    updateUrlParam("category", tempCategory);
    updateUrlParam("color", tempColors.length > 0 ? tempColors.join(",") : null);
    updateUrlParam("size", tempSizes.length > 0 ? tempSizes.join(",") : null);
    updateUrlParam("tags", tempTags.length > 0 ? tempTags.join(",") : null);
    updateUrlParam("minPrice", tempMinPrice > 0 ? tempMinPrice.toString() : null);
    updateUrlParam("maxPrice", tempMaxPrice < 25000 ? tempMaxPrice.toString() : null);
    onClose();
  };

  // Reset temporary selections
  const handleReset = () => {
    setTempGender(null);
    setTempCategory(null);
    setTempColors([]);
    setTempSizes([]);
    setTempTags([]);
    setTempMinPrice(0);
    setTempMaxPrice(25000);
  };

  // Hardcoded based on real product properties from active catalog
  const categories = [
    "Loomed Shirts",
    "Loomed Pants",
    "Artisan Robes",
    "Artisan Coats",
    "Men's T-Shirts",
    "Women's T-Shirts",
    "Shirt & Pant Combo",
    "LOOMED CO-ORD SETS",
    "SHIRT & TROUSER COMBO"
  ];

  const colors = [
    { name: "Beige", hex: "#E8D8C8", label: "Desert Beige" },
    { name: "White", hex: "#FDFDFD", label: "Linen White" },
    { name: "Olive", hex: "#556B2F", label: "Olive Green" },
    { name: "Charcoal", hex: "#36454F", label: "Charcoal Gray" },
    { name: "Sage", hex: "#77815C", label: "Sage" },
    { name: "Sand", hex: "#C2B280", label: "Earthy Sand" },
    { name: "Blue", hex: "#4682B4", label: "Indigo Blue" }
  ];

  const sizes = ["S", "M", "L", "XL"];

  const tagsList = ["Basics", "Short Sleeve", "organic", "handloom", "minimal", "botanical", "unstructured"];

  const genders = [
    { value: "men", label: "Men's Line" },
    { value: "women", label: "Women's Line" }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end select-none">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0B0D12]/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md h-full bg-[#FBF9F6] border-l border-terrain/15 shadow-2xl flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-terrain/10 bg-white">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-moss" />
                <h3 className="font-serif text-sm font-semibold text-ink uppercase tracking-wider">
                  Refinement Filter
                </h3>
              </div>
              <div className="flex items-center gap-4">
                {hasTempActiveFilters && (
                  <button
                    onClick={handleReset}
                    className="text-[10px] font-mono text-moss hover:text-[#B5652F] hover:underline transition duration-300 cursor-pointer uppercase tracking-wider"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-sand/30 text-earth transition duration-300 cursor-pointer"
                  title="Close Filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Filter Options */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Active Badges */}
              {hasTempActiveFilters && (
                <div className="space-y-2 pb-4 border-b border-terrain/10">
                  <h4 className="text-[9px] font-mono text-earth/50 uppercase tracking-widest font-bold">
                    Active Refinements
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {tempGender && (
                      <span className="inline-flex items-center gap-1 bg-moss/10 text-moss text-[10px] font-mono px-2 py-0.5 rounded-full">
                        {tempGender === "men" ? "Men" : "Women"}
                        <button
                          onClick={() => setTempGender(null)}
                          className="hover:text-[#B5652F] font-bold focus:outline-none cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}
                    {tempCategory && (
                      <span className="inline-flex items-center gap-1 bg-moss/10 text-moss text-[10px] font-mono px-2 py-0.5 rounded-full">
                        {tempCategory}
                        <button
                          onClick={() => setTempCategory(null)}
                          className="hover:text-[#B5652F] font-bold focus:outline-none cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}
                    {tempColors.map(col => (
                      <span key={col} className="inline-flex items-center gap-1 bg-moss/10 text-moss text-[10px] font-mono px-2 py-0.5 rounded-full">
                        {col}
                        <button
                          onClick={() => setTempColors(tempColors.filter(c => c !== col))}
                          className="hover:text-[#B5652F] font-bold focus:outline-none cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    {tempSizes.map(sz => (
                      <span key={sz} className="inline-flex items-center gap-1 bg-moss/10 text-moss text-[10px] font-mono px-2 py-0.5 rounded-full">
                        Size: {sz}
                        <button
                          onClick={() => setTempSizes(tempSizes.filter(s => s !== sz))}
                          className="hover:text-[#B5652F] font-bold focus:outline-none cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    {tempTags.map(tg => (
                      <span key={tg} className="inline-flex items-center gap-1 bg-moss/10 text-moss text-[10px] font-mono px-2 py-0.5 rounded-full">
                        Tag: {tg}
                        <button
                          onClick={() => setTempTags(tempTags.filter(t => t !== tg))}
                          className="hover:text-[#B5652F] font-bold focus:outline-none cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    {(tempMinPrice > 0 || tempMaxPrice < 25000) && (
                      <span className="inline-flex items-center gap-1 bg-moss/10 text-moss text-[10px] font-mono px-2 py-0.5 rounded-full">
                        ₹{tempMinPrice} - ₹{tempMaxPrice}
                        <button
                          onClick={() => { setTempMinPrice(0); setTempMaxPrice(25000); }}
                          className="hover:text-[#B5652F] font-bold focus:outline-none cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Section 1: Line Selection */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono text-earth/50 uppercase tracking-widest font-bold">
                  Gender Preference
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {genders.map((g) => {
                    const isSelected = tempGender === g.value;
                    return (
                      <button
                        key={g.value}
                        onClick={() => setTempGender(isSelected ? null : g.value)}
                        className={`py-2 px-3 text-center text-xs font-serif rounded-md transition cursor-pointer border ${
                          isSelected
                            ? "bg-moss text-linen border-moss font-medium shadow-sm"
                            : "bg-white text-earth border-terrain/15 hover:border-moss/30"
                        }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Product Categories */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono text-earth/50 uppercase tracking-widest font-bold">
                  Catalog Categories
                </h4>
                <div className="space-y-1.5">
                  {categories.map((cat) => {
                    const isSelected = tempCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setTempCategory(isSelected ? null : cat)}
                        className={`w-full flex items-center justify-between text-left px-4 py-2 rounded-md transition text-xs font-serif cursor-pointer ${
                          isSelected
                            ? "bg-moss/10 text-moss font-semibold border-l-2 border-moss"
                            : "text-earth hover:bg-sand/30 bg-white border border-terrain/5"
                        }`}
                      >
                        <span>{cat}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-moss" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Color Palette Swatches (Multi-select!) */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono text-earth/50 uppercase tracking-widest font-bold">
                  Palette Swatches (Multi-Select)
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((col) => {
                    const isSelected = tempColors.includes(col.name);
                    return (
                      <button
                        key={col.name}
                        onClick={() => {
                          if (isSelected) {
                            setTempColors(tempColors.filter(c => c !== col.name));
                          } else {
                            setTempColors([...tempColors, col.name]);
                          }
                        }}
                        className={`group relative w-8 h-8 rounded-full border transition cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? "border-moss scale-110 shadow-sm ring-1 ring-moss/30"
                            : "border-terrain/20 hover:border-moss/45"
                        }`}
                        title={col.label}
                      >
                        <span
                          className="w-6 h-6 rounded-full block border border-black/5"
                          style={{ backgroundColor: col.hex }}
                        />
                        {isSelected && (
                          <Check className="absolute w-3.5 h-3.5 text-white mix-blend-difference drop-shadow" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Travel Sizing (Multi-select!) */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono text-earth/50 uppercase tracking-widest font-bold">
                  Sizing (Multi-Select)
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {sizes.map((sz) => {
                    const isSelected = tempSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        onClick={() => {
                          if (isSelected) {
                            setTempSizes(tempSizes.filter(s => s !== sz));
                          } else {
                            setTempSizes([...tempSizes, sz]);
                          }
                        }}
                        className={`py-2 text-center text-xs font-mono transition cursor-pointer border rounded-md ${
                          isSelected
                            ? "bg-moss text-linen border-moss font-bold"
                            : "bg-white text-earth border-terrain/15 hover:border-moss/30"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3 pb-2">
                <h4 className="text-[10px] font-mono text-earth/50 uppercase tracking-widest font-bold">
                  Price Range (INR)
                </h4>
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <span className="text-[9px] font-mono text-earth/40 block uppercase">Min Price</span>
                      <input 
                        type="number"
                        value={tempMinPrice}
                        onChange={(e) => setTempMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white text-ink text-xs font-mono p-2 border border-terrain/15 rounded focus:outline-none focus:border-moss"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] font-mono text-earth/40 block uppercase">Max Price</span>
                      <input 
                        type="number"
                        value={tempMaxPrice}
                        onChange={(e) => setTempMaxPrice(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-white text-ink text-xs font-mono p-2 border border-terrain/15 rounded focus:outline-none focus:border-moss"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25000"
                    step="500"
                    value={tempMaxPrice}
                    onChange={(e) => setTempMaxPrice(parseInt(e.target.value))}
                    className="w-full accent-moss cursor-pointer"
                    title="Max Price Slider"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-earth/50">
                    <span>₹0</span>
                    <span>Max: ₹{tempMaxPrice.toLocaleString("en-IN")}</span>
                    <span>₹25,000</span>
                  </div>
                </div>
              </div>

              {/* Style / Type tags */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono text-earth/50 uppercase tracking-widest font-bold">
                  Style / Type tags (Multi-Select)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {tagsList.map((tg) => {
                    const isSelected = tempTags.includes(tg);
                    return (
                      <button
                        key={tg}
                        onClick={() => {
                          if (isSelected) {
                            setTempTags(tempTags.filter(t => t !== tg));
                          } else {
                            setTempTags([...tempTags, tg]);
                          }
                        }}
                        className={`py-1.5 px-3 text-center text-xs font-mono rounded-full transition cursor-pointer border uppercase text-[10px] tracking-wider ${
                          isSelected
                            ? "bg-moss text-linen border-moss font-semibold shadow-xs"
                            : "bg-white text-earth border-terrain/15 hover:border-moss/30"
                        }`}
                      >
                        {tg}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer with Apply Button */}
            <div className="p-6 border-t border-terrain/10 bg-white flex flex-col gap-3">
              <button
                onClick={handleApply}
                className="w-full bg-moss text-linen py-3.5 px-6 rounded-sm text-center font-mono text-xs uppercase tracking-widest hover:bg-moss/90 transition duration-300 shadow-md font-bold cursor-pointer"
              >
                Apply Filters
              </button>
              <div className="text-center">
                <span className="text-[10px] font-mono text-earth/50 uppercase tracking-wider">
                  {productsCount} Pieces Available in Catalog
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

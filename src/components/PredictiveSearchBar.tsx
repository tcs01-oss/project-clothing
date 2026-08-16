import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, X, Tag, Sparkles, ArrowRight, Loader2, CornerDownLeft } from "lucide-react";
import Fuse from "fuse.js";
import { Product } from "../types";

interface PredictiveSearchBarProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onSearchSubmit: (query: string) => void;
  value?: string;
  isTransparent?: boolean;
  autoFocus?: boolean;
}

export const PredictiveSearchBar: React.FC<PredictiveSearchBarProps> = ({
  products,
  onSelectProduct,
  onSearchSubmit,
  value,
  isTransparent = false,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(value || "");

  // Keep internal query synchronized when external value changes
  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      setIsFocused(true);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // Initialize Fuse.js instance for client-side fuzzy searching
  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: [
        { name: "name", weight: 0.4 },
        { name: "category", weight: 0.25 },
        { name: "tags", weight: 0.2 },
        { name: "description", weight: 0.1 },
        { name: "color", weight: 0.05 },
      ],
      threshold: 0.4, // Lower = stricter, higher = fuzzier (handles "shrit", "jeens", "hoddie")
      distance: 100,
      minMatchCharLength: 2,
      includeScore: true,
      ignoreLocation: true,
    });
  }, [products]);

  // 1. 300ms Debounce effect on input query
  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery("");
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // 2. Perform Search (API call with client Fuse.js fallback)
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setIsLoading(false);
      setSelectedIndex(-1);
      return;
    }

    let isMounted = true;

    const performSearch = async () => {
      try {
        // Try fetching backend fuzzy search API
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(debouncedQuery)}&limit=7`);
        if (response.ok) {
          const data = await response.json();
          if (isMounted && data.results && Array.isArray(data.results)) {
            setResults(data.results);
            setIsLoading(false);
            setSelectedIndex(-1);
            return;
          }
        }
      } catch (e) {
        console.warn("[PredictiveSearch] API search unavailable, using client Fuse.js fallback:", e);
      }

      // Fallback to client-side Fuse.js fuzzy search
      if (isMounted) {
        const fuseResults = fuse.search(debouncedQuery).slice(0, 7).map((r) => r.item);
        setResults(fuseResults);
        setIsLoading(false);
        setSelectedIndex(-1);
      }
    };

    performSearch();

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, fuse]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Keyboard Navigation Handling (ArrowUp, ArrowDown, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isFocused) setIsFocused(true);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (query.trim()) {
        onSearchSubmit(query.trim());
        setIsFocused(false);
      }
    } else if (e.key === "Escape") {
      setIsFocused(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (product: Product) => {
    onSelectProduct(product);
    setIsFocused(false);
    setQuery("");
    setSelectedIndex(-1);
  };

  const quickPills = [
    "Loomed Shirts",
    "Co-ord Sets",
    "Trousers",
    "Organic Linen",
    "Belgian Flax",
    "Tees",
  ];

  return (
    <div ref={containerRef} className="relative w-full font-sans">
      {/* Search Input Field */}
      <div
        className={`relative flex items-center transition-all duration-300 rounded-full border ${
          isTransparent
            ? "bg-white/10 border-white/30 text-white focus-within:border-white focus-within:bg-white/20"
            : "bg-[#FAF9F5] border-[#1C2333]/20 text-[#1C2333] focus-within:border-[#1C2333] focus-within:bg-white focus-within:shadow-md"
        }`}
      >
        <Search className={`w-4 h-4 ml-3.5 shrink-0 ${isTransparent ? "text-white/70" : "text-[#1C2333]/60"}`} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            if (val.trim() === "") {
              onSearchSubmit("");
            }
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search garments (e.g., shirt, jeans, hoodie)..."
          aria-expanded={isFocused}
          aria-autocomplete="list"
          className="w-full py-2 px-3 text-xs font-mono bg-transparent focus:outline-none placeholder:text-[#1C2333]/40"
        />

        {/* Loading Spinner or Clear Button */}
        <div className="flex items-center mr-2 shrink-0">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1C2333]/60" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                onSearchSubmit("");
                inputRef.current?.focus();
              }}
              className="p-1 text-[#1C2333]/50 hover:text-[#1C2333] rounded-full transition cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Predictive Dropdown Menu */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#FAF9F5] border border-[#1C2333]/20 rounded-xl shadow-2xl z-[150] overflow-hidden animate-fadeIn text-[#1C2333] font-sans">
          {query.trim() === "" ? (
            /* Popular Category Quick Pills */
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#1C2333]/60">
                <Sparkles className="w-3.5 h-3.5 text-[#1C2333]" />
                <span>POPULAR SEARCH CATEGORIES</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickPills.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => {
                      setQuery(pill);
                      onSearchSubmit(pill);
                      setIsFocused(false);
                    }}
                    className="py-1 px-3 bg-white border border-[#1C2333]/15 text-[10px] font-mono hover:bg-[#1C2333] hover:text-white transition duration-200 rounded-full cursor-pointer uppercase tracking-wider"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>
          ) : isLoading ? (
            /* Loading State Skeleton */
            <div className="p-4 space-y-3 animate-pulse">
              <div className="h-3 bg-[#1C2333]/10 rounded w-1/3" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-12 bg-[#1C2333]/10 rounded" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-[#1C2333]/10 rounded w-2/3" />
                  <div className="h-2.5 bg-[#1C2333]/10 rounded w-1/3" />
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            /* Rich Results List */
            <div className="p-2 space-y-1">
              <div className="px-3 py-1.5 flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-widest text-[#1C2333]/50 border-b border-[#1C2333]/10">
                <span>PREDICTIVE MATCHES ({results.length})</span>
                <span className="text-[8px] font-normal text-[#1C2333]/40">Use ↑↓ to navigate, Enter to select</span>
              </div>

              <div role="listbox" className="max-h-80 overflow-y-auto space-y-0.5">
                {results.map((product, idx) => {
                  const isSelected = idx === selectedIndex;
                  const thumbnail =
                    product.images?.[0] ||
                    product.image ||
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c";

                  return (
                    <div
                      key={product.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(product)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition group ${
                        isSelected
                          ? "bg-[#1C2333] text-white shadow-sm"
                          : "hover:bg-[#1C2333]/5 text-[#1C2333]"
                      }`}
                    >
                      {/* Product Thumbnail */}
                      <img
                        src={thumbnail}
                        alt={product.name}
                        className="w-10 h-12 object-cover rounded-md border border-[#1C2333]/10 shrink-0"
                      />

                      {/* Details */}
                      <div className="flex-1 min-w-0 text-left">
                        <h5
                          className={`font-serif text-xs font-semibold truncate ${
                            isSelected ? "text-white" : "text-[#1C2333]"
                          }`}
                        >
                          {product.name}
                        </h5>

                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`font-mono text-[11px] font-bold ${
                              isSelected ? "text-emerald-300" : "text-[#1C2333]/80"
                            }`}
                          >
                            ₹{product.price?.toLocaleString("en-IN")}
                          </span>

                          {product.category && (
                            <span
                              className={`font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-medium ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-[#1C2333]/10 text-[#1C2333]/70"
                              }`}
                            >
                              {product.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow / Enter indicator */}
                      <div className="shrink-0 pr-1">
                        {isSelected ? (
                          <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-300">
                            <CornerDownLeft className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <ArrowRight className="w-4 h-4 text-[#1C2333]/30 group-hover:text-[#1C2333] transition" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View All Button */}
              <button
                type="button"
                onClick={() => {
                  onSearchSubmit(query);
                  setIsFocused(false);
                }}
                className="w-full text-center py-2 text-[10px] font-mono uppercase tracking-widest text-[#1C2333] font-bold hover:bg-[#1C2333] hover:text-white transition rounded-lg border-t border-[#1C2333]/10 cursor-pointer mt-1"
              >
                VIEW ALL RESULTS FOR "{query}" →
              </button>
            </div>
          ) : (
            /* Empty State */
            <div className="p-6 text-center space-y-2">
              <Tag className="w-6 h-6 mx-auto text-[#1C2333]/30" />
              <p className="font-serif text-xs font-medium text-[#1C2333]">
                No garments found matching "{query}"
              </p>
              <p className="text-[11px] text-[#1C2333]/60 font-light max-w-xs mx-auto">
                Try searching for broader terms like "linen", "shirt", "pants", or "trousers".
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
                className="text-[10px] font-mono uppercase tracking-wider text-[#1C2333] underline cursor-pointer font-bold pt-1 block mx-auto"
              >
                CLEAR SEARCH
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

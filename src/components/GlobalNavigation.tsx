import React, { useState, useRef } from "react";
import { ChevronDown, ArrowRight, Sparkles, Footprints, Shirt, Watch } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../types";

interface GlobalNavigationProps {
  onSelectCategory: (category: string, subCategory?: string) => void;
  activeCategory?: string | null;
  isTransparent?: boolean;
  onSelectProduct?: (product: Product) => void;
  featuredFootwear?: Product | null;
  className?: string;
}

export const FOOTWEAR_SUBCATEGORIES = [
  {
    id: "low-top",
    name: "Low-Top Sneakers",
    description: "Sleek low-profile urban court & street silhouettes",
    tag: "POPULAR",
    count: "12 Styles"
  },
  {
    id: "high-top",
    name: "High-Top Trainers",
    description: "Structured ankle-support trail & street designs",
    tag: "NEW",
    count: "8 Styles"
  },
  {
    id: "runner",
    name: "Luxury Runners",
    description: "Ergonomic, lightweight tech runners with EVA cushioning",
    tag: "BESTSELLER",
    count: "15 Styles"
  },
  {
    id: "slip-on",
    name: "Slip-Ons & Slides",
    description: "Linen canvas slip-ons and anatomical cork recovery mules",
    tag: "SUMMER",
    count: "10 Styles"
  },
  {
    id: "limited-edition",
    name: "Limited Editions",
    description: "Hand-numbered archival collector pairs and carbon releases",
    tag: "EXCLUSIVE",
    count: "3 Drops"
  }
];

export default function GlobalNavigation({
  onSelectCategory,
  activeCategory,
  isTransparent = false,
  onSelectProduct,
  featuredFootwear,
  className = ""
}: GlobalNavigationProps) {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  const navItems: { id: string; label: string; icon: any; hasMegaMenu?: boolean }[] = [
    { id: "Combo", label: "COMBO", icon: Shirt },
    { id: "Shoes", label: "SHOES", icon: Footprints },
    { id: "Accessories", label: "ACCESSORIES", icon: Watch }
  ];

  return (
    <nav className={`relative z-40 ${className}`} aria-label="Global Navigation">
      <ul className="flex items-center gap-6 sm:gap-8 font-mono text-[11px] sm:text-[12px] font-bold uppercase tracking-widest">
        {navItems.map((item) => {
          const isSelected = activeCategory?.toLowerCase() === item.id.toLowerCase();
          const Icon = item.icon;

          if (item.hasMegaMenu) {
            return (
              <li
                key={item.id}
                className="relative py-2"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory("Shoes");
                    setIsMegaMenuOpen(false);
                  }}
                  className={`flex items-center gap-1.5 transition-all duration-200 cursor-pointer group py-1 border-b-2 ${
                    isSelected
                      ? "border-moss text-moss"
                      : isTransparent
                      ? "border-transparent text-white hover:text-sand hover:border-sand"
                      : "border-transparent text-ink hover:text-moss hover:border-moss"
                  }`}
                  aria-expanded={isMegaMenuOpen}
                >
                  <Icon className="w-3.5 h-3.5 opacity-80 group-hover:scale-110 transition-transform" />
                  <span>{item.label}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-300 ${
                      isMegaMenuOpen ? "rotate-180 text-moss" : "opacity-60"
                    }`}
                  />
                  <span className="ml-1 bg-moss text-linen text-[8px] font-mono px-1.5 py-0.2 rounded-full tracking-normal lowercase font-normal">
                    new
                  </span>
                </button>

                {/* MEGA MENU DROPDOWN */}
                <AnimatePresence>
                  {isMegaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full -left-20 sm:-left-32 w-[680px] bg-[#FAF9F5] border border-terrain/20 shadow-2xl rounded-2xl p-6 z-50 text-ink select-none overflow-hidden"
                    >
                      {/* Top Header Badge */}
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-terrain/15">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-moss/10 flex items-center justify-center text-moss">
                            <Footprints className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-mono text-xs uppercase tracking-widest font-bold text-ink">
                            Tirupati Merchandise Footwear Lab
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            onSelectCategory("Footwear");
                            setIsMegaMenuOpen(false);
                          }}
                          className="text-[10px] font-mono text-moss hover:underline flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <span>VIEW ALL FOOTWEAR</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-12 gap-6">
                        {/* Sub-categories List (7 columns) */}
                        <div className="col-span-7 space-y-1">
                          <span className="text-[9px] font-mono uppercase text-earth/50 font-bold block mb-2 tracking-widest">
                            CATEGORIES & SILHOUETTES
                          </span>
                          {FOOTWEAR_SUBCATEGORIES.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                onSelectCategory("Footwear", sub.name);
                                setIsMegaMenuOpen(false);
                              }}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-terrain/20 transition-all duration-200 group flex items-start justify-between cursor-pointer"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-serif text-sm font-semibold text-ink group-hover:text-moss transition-colors">
                                    {sub.name}
                                  </span>
                                  {sub.tag && (
                                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-sand/40 text-earth font-bold group-hover:bg-moss group-hover:text-linen transition-colors">
                                      {sub.tag}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-earth/70 font-sans mt-0.5 leading-tight">
                                  {sub.description}
                                </p>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-earth/40 group-hover:text-moss group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                            </button>
                          ))}
                        </div>

                        {/* Featured Footwear Release Card (5 columns) */}
                        <div className="col-span-5 bg-gradient-to-br from-white to-[#F3EFE6] border border-terrain/20 rounded-xl p-3.5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-moss text-linen px-2 py-0.5 rounded-full uppercase tracking-wider">
                                <Sparkles className="w-2.5 h-2.5" /> Featured Drop
                              </span>
                              <span className="text-[10px] font-mono text-earth font-bold">
                                ₹{(featuredFootwear?.price || 7990).toLocaleString("en-IN")}
                              </span>
                            </div>

                            <div className="relative aspect-4/3 w-full rounded-lg overflow-hidden bg-earth/5 mb-3 group/img">
                              <img
                                src={
                                  featuredFootwear?.images?.[0] ||
                                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"
                                }
                                alt={featuredFootwear?.name || "Tirupati Merchandise Obsidian Tech Runner"}
                                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                              />
                            </div>

                            <h4 className="font-serif text-xs font-bold text-ink leading-snug">
                              {featuredFootwear?.name || "Tirupati Merchandise Obsidian Tech Runner"}
                            </h4>
                            <p className="text-[10px] text-earth/70 line-clamp-2 mt-0.5 font-sans">
                              {featuredFootwear?.description || "Architectural luxury runner with nappa leather and shock-absorbing EVA rubber outsole."}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (featuredFootwear && onSelectProduct) {
                                onSelectProduct(featuredFootwear);
                              } else {
                                onSelectCategory("Footwear");
                              }
                              setIsMegaMenuOpen(false);
                            }}
                            className="mt-3 w-full py-2 bg-moss text-linen rounded-lg text-center font-mono text-[10px] uppercase font-bold tracking-widest hover:bg-moss/90 transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>EXPLORE SNEAKER</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          }

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelectCategory(item.id)}
                className={`transition-all duration-200 cursor-pointer py-1 border-b-2 flex items-center gap-1.5 ${
                  isSelected
                    ? "border-moss text-moss"
                    : isTransparent
                    ? "border-transparent text-white hover:text-sand hover:border-sand"
                    : "border-transparent text-ink hover:text-moss hover:border-moss"
                }`}
              >
                <Icon className="w-3.5 h-3.5 opacity-80" />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

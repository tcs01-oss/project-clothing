import React from "react";
import { Product } from "../types";
import { ArrowRight } from "lucide-react";

interface RelatedProductsProps {
  currentProduct: Product;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  currentProduct,
  allProducts,
  onSelectProduct,
}) => {
  // Find related products in same category or tags
  const relatedList = React.useMemo(() => {
    return allProducts
      .filter((p) => p.id !== currentProduct.id)
      .slice(0, 4);
  }, [currentProduct, allProducts]);

  return (
    <div className="space-y-6 text-left pt-6 border-t border-[#1C2333]/15">
      {/* RELATED PRODUCTS CAROUSEL/GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-mono text-xs font-bold text-[#1C2333] uppercase tracking-[0.15em]">
            CURATED RELATED GARMENTS
          </h4>
          <span className="text-[10px] font-mono text-[#1C2333]/60 uppercase">EXPLORE CAPSULE</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {relatedList.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className="group bg-white border border-[#1C2333]/10 hover:border-[#1C2333]/40 rounded-sm p-3 transition duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xs bg-[#FAF9F5]">
                  <img
                    src={p.images?.[0] || p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 bg-[#1C2333] text-white text-[8px] font-mono px-1.5 py-0.5 rounded-xs uppercase tracking-wider font-bold">
                    {p.category || "GARMENT"}
                  </span>
                </div>
                <h5 className="font-serif text-xs font-semibold text-[#1C2333] line-clamp-1 group-hover:text-emerald-950">
                  {p.name}
                </h5>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#1C2333]/10 mt-2">
                <span className="font-mono text-xs font-bold text-[#1C2333]">
                  ₹{p.price.toLocaleString("en-IN")}
                </span>
                <span className="text-[9px] font-mono text-[#1C2333]/60 font-bold group-hover:text-[#1C2333] flex items-center gap-0.5">
                  VIEW <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

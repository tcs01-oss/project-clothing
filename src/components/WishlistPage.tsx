import React, { useState } from "react";
import { Product } from "../types";
import { Heart, ShoppingBag, Trash2, ArrowRight, CheckCircle2 } from "lucide-react";

interface WishlistPageProps {
  wishlist: string[];
  products: Product[];
  onRemoveFromWishlist: (productId: string, productName: string) => void;
  onClearWishlist: () => void;
  onAddToCart: (product: Product, size: string) => void;
  onSelectProduct: (product: Product) => void;
  onNavigateToStore: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  wishlist,
  products,
  onRemoveFromWishlist,
  onClearWishlist,
  onAddToCart,
  onSelectProduct,
  onNavigateToStore,
}) => {
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleMoveToBag = (product: Product) => {
    const size = selectedSizes[product.id] || "M";
    onAddToCart(product, size);
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 2500);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 text-left space-y-8 text-[#1C2333]">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1C2333]/15 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 fill-[#1C2333] text-[#1C2333]" />
            <h2 className="font-serif text-2xl font-bold uppercase tracking-wider text-[#1C2333]">
              MY SAVED WISHLIST ({savedProducts.length})
            </h2>
          </div>
          <p className="text-xs font-mono text-[#1C2333]/60 uppercase mt-1">
            CURATED PERSONAL COLLECTION OF ARTISAN GARMENTS
          </p>
        </div>

        {savedProducts.length > 0 && (
          <button
            onClick={onClearWishlist}
            className="py-2 px-4 bg-white border border-[#1C2333]/20 hover:border-red-600 text-red-700 hover:bg-red-50 text-xs font-mono uppercase font-bold rounded-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR ALL ITEMS</span>
          </button>
        )}
      </div>

      {savedProducts.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 space-y-4 bg-white border border-[#1C2333]/10 rounded-sm p-8">
          <Heart className="w-12 h-12 text-[#1C2333]/30 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-[#1C2333] uppercase">YOUR WISHLIST IS EMPTY</h3>
          <p className="text-xs font-mono text-[#1C2333]/60 max-w-sm mx-auto">
            You haven't saved any garments to your wishlist yet. Explore our handcrafted linen catalog and tap the heart icon to save favorite pieces.
          </p>
          <button
            onClick={onNavigateToStore}
            className="py-3 px-8 bg-[#1C2333] hover:bg-[#1C2333]/90 text-[#FAF9F5] text-xs font-mono uppercase tracking-widest font-bold rounded-xs cursor-pointer inline-flex items-center gap-2"
          >
            <span>EXPLORE COLLECTIONS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Wishlist Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {savedProducts.map((p) => {
            const currentSize = selectedSizes[p.id] || "M";
            const isAdded = addedItems[p.id];
            return (
              <div
                key={p.id}
                className="bg-white border border-[#1C2333]/15 rounded-sm p-4 flex flex-col justify-between space-y-3 relative group hover:border-[#1C2333]/50 transition duration-300 shadow-xs"
              >
                {/* Remove button top right */}
                <button
                  onClick={() => onRemoveFromWishlist(p.id, p.name)}
                  className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur-xs text-[#1C2333]/60 hover:text-red-700 hover:bg-white rounded-full transition cursor-pointer z-10 border border-[#1C2333]/10"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Product Image & Info */}
                <div
                  onClick={() => onSelectProduct(p)}
                  className="cursor-pointer space-y-2"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-xs bg-[#FAF9F5]">
                    <img
                      src={p.images?.[0] || p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h4 className="font-serif text-sm font-semibold text-[#1C2333] line-clamp-1">{p.name}</h4>
                  <span className="font-mono text-xs font-bold text-[#1C2333] block">
                    ₹{p.price.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Size Selector & Add to Bag */}
                <div className="space-y-2 pt-2 border-t border-[#1C2333]/10">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#1C2333]/60 uppercase font-bold">SELECT SIZE:</span>
                    <div className="flex gap-1">
                      {["S", "M", "L", "XL"].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSizes({ ...selectedSizes, [p.id]: sz })}
                          className={`w-6 h-6 text-[9px] font-mono font-bold rounded-xs cursor-pointer border ${
                            currentSize === sz
                              ? "bg-[#1C2333] text-white border-[#1C2333]"
                              : "bg-white text-[#1C2333] border-[#1C2333]/20"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleMoveToBag(p)}
                    className="w-full py-2 bg-[#1C2333] hover:bg-[#1C2333]/90 text-[#FAF9F5] text-[10px] font-mono uppercase tracking-widest font-bold transition duration-300 rounded-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ADDED TO BAG!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>MOVE TO BAG</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

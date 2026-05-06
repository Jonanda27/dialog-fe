"use client";

import React from "react";
import { Product } from "@/types/product";
import { ImageIcon, Heart, Star } from "lucide-react";
import Link from "next/link";
import { useWishlistStore } from "@/store/wishlistStore";

interface ProductGridProps {
  products: Product[];
}

const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path || path === "") return null;
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  let cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!cleanPath.startsWith("/public")) cleanPath = `/public${cleanPath}`;
  return `${baseUrl}${cleanPath}`;
};

export default function ProductGrid({ products }: ProductGridProps) {
  const { toggleWishlist, isFavorite, isLoading } = useWishlistStore();

  if (!products || products.length === 0) {
    return (
      <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-zinc-900 rounded-3xl text-zinc-700">
        <ImageIcon size={48} className="mb-4 opacity-20" />
        <span className="uppercase text-[11px] font-black tracking-widest">
          Tidak ada produk yang cocok
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 animate-fade-in">
      {products.map((p) => {
        const firstMediaUrl = p.media && p.media.length > 0 ? p.media[0].media_url : null;
        const imgSrc = getImageUrl(firstMediaUrl);
        const active = isFavorite(p.id);

        const handleWishlist = async (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          try {
            await toggleWishlist(p.id);
          } catch (err) {
            console.error("Gagal update wishlist:", err);
          }
        };

        return (
          <Link href={`/produk/${p.id}`} key={p.id} className="group relative">
            <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl md:rounded-[1.5rem] overflow-hidden group hover:border-[#ef3333]/40 transition-all duration-500 h-full shadow-2xl flex flex-col">
              
              <div className="aspect-[4/5] relative overflow-hidden bg-zinc-900">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    alt={p.name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <ImageIcon size={24} className="text-zinc-600" />
                  </div>
                )}

                <div className="absolute top-2.5 left-2.5 md:top-4 md:left-4 z-10">
                  <span className="bg-[#1a1612]/90 backdrop-blur-sm text-white text-[9px] md:text-[10px] font-black px-2.5 py-1.5 rounded md:rounded-lg uppercase tracking-tight border border-white/5">
                    MINT
                  </span>
                </div>

                {/* ⚡ WISHLIST BUTTON: Warna Gradasi Sesuai Gambar */}
                <button
                  onClick={handleWishlist}
                  disabled={isLoading}
                  className={`absolute top-2.5 right-2.5 md:top-4 md:right-4 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl transition-all duration-300 z-20 shadow-xl border
                    ${active 
                      ? "bg-gradient-to-br from-[#8a3d3d] to-[#4a1a1a] border-[#ef3333]/40" 
                      : "bg-black/40 backdrop-blur-md border-white/10 hover:bg-[#ef3333]/20"}`}
                >
                  <Heart
                    size={20}
                    className={`transition-colors duration-300 ${active ? "fill-[#ef3333] text-[#ef3333]" : "text-white"}`}
                  />
                </button>
              </div>

              <div className="p-3.5 md:p-5 text-left flex-1 flex flex-col">
                <h4 className="text-white font-black text-xs md:text-[15px] uppercase mb-4 md:mb-5 group-hover:text-[#ef3333] transition-colors line-clamp-1 leading-tight tracking-tight">
                  {p.name}
                </h4>

                <p className="text-[#ef3333] font-black text-lg md:text-2xl leading-none mb-4 tracking-tighter">
                  Rp {Number(p.price).toLocaleString("id-ID")}
                </p>

                <div className="mt-auto flex items-center gap-1.5 md:gap-2.5 pt-2 border-t border-zinc-900/50">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-zinc-400 font-black text-[10px] md:text-[11px]">
                      4.9
                    </span>
                  </div>
                  <span className="text-zinc-700 font-bold text-[10px]">•</span>
                  <span className="text-zinc-500 font-black text-[9px] md:text-[10px] uppercase tracking-widest truncate">
                    {p.store?.name || "TOKO JOJOW"}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
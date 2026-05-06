"use client";

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Heart, Star } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';

interface ProductCardProps {
    product: Product & { imageUrl?: string };
}

export default function ProductCard({ product }: ProductCardProps) {
    const { toggleWishlist, isFavorite, isLoading } = useWishlistStore();
    
    // Cek status favorit dari state global
    const active = isFavorite(product.id);

    // ⚡ LOGIKA PENENTUAN GAMBAR YANG AKURAT
    const getFinalImage = () => {
        // 1. Jika ada prop imageUrl (biasanya dikirim dari halaman wishlist), gunakan itu
        if (product.imageUrl) return product.imageUrl;

        // 2. Cari di array media (Ambil foto primary atau index pertama)
        const mediaArr = product.media;
        if (Array.isArray(mediaArr) && mediaArr.length > 0) {
            const path = mediaArr.find((m) => m.is_primary)?.media_url || mediaArr[0].media_url;
            
            if (path) {
                // Tambahkan prefix backend jika path bersifat lokal (/uploads/...)
                if (path.startsWith('http')) return path;
                return `http://localhost:5000/public${path}`;
            }
        }

        return '/placeholder.jpg';
    };

    // Ambil grading dari metadata asli produk
    const conditionBadge = product.metadata?.media_grading || product.metadata?.physical_condition || 'VG+';

    const formatIDR = (price: number | string) => {
        return "Rp" + Number(price).toLocaleString("id-ID").replace(/,/g, ".");
    };

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        // Mencegah navigasi ke halaman detail produk saat tombol love diklik
        e.preventDefault();
        e.stopPropagation();
        
        try {
            await toggleWishlist(product.id);
        } catch (error) {
            console.error("Gagal memperbarui wishlist:", error);
        }
    };

    return (
        <Link href={`/produk/${product.id}`} className="group relative block h-full">
            <div className="bg-[#111114] rounded-2xl border border-zinc-800 overflow-hidden cursor-pointer hover:shadow-2xl hover:border-[#ef3333]/50 transition-all flex flex-col h-full shadow-lg">
                
                {/* Image Container */}
                <div className="aspect-square relative overflow-hidden bg-black">
                    <img
                        src={getFinalImage()}
                        alt={product.name || 'Produk'}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.jpg';
                        }}
                    />
                    
                    {/* Condition Badge */}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-white border border-white/10 uppercase tracking-widest z-10">
                        {conditionBadge}
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={handleFavoriteClick}
                        disabled={isLoading}
                        className={`absolute top-2 right-2 p-2 rounded-xl backdrop-blur-md border transition-all duration-300 z-20 
                            ${active 
                                ? 'bg-[#ef3333]/20 border-[#ef3333]/30 text-[#ef3333]' 
                                : 'bg-black/40 border-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        <Heart 
                            size={16} 
                            className={active ? "fill-[#ef3333]" : "fill-none"} 
                        />
                    </button>
                </div>

                {/* Content Info */}
                <div className="p-4 flex flex-col flex-1 text-left">
                    <h3 className="text-xs font-bold line-clamp-2 leading-snug text-zinc-100 group-hover:text-[#ef3333] transition-colors h-8">
                        {product.name}
                    </h3>
                    
                    <p className="text-[#ef3333] text-lg font-black mt-2 leading-none">
                        {formatIDR(product.price)}
                    </p>

                    <div className="mt-auto pt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold uppercase tracking-tight overflow-hidden">
                            <span className="text-zinc-300 flex items-center gap-0.5">
                                <Star size={10} className="fill-amber-500 text-amber-500" /> 
                                4.9
                            </span>
                            <span className="mx-1 opacity-50">•</span>
                            <span className="truncate max-w-[80px]">
                                {product.store?.name || 'Analog Store'}
                            </span>
                        </div>
                        
                        {Number(product.stock) <= 3 && Number(product.stock) > 0 && (
                            <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase animate-pulse">
                                Sisa {product.stock}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
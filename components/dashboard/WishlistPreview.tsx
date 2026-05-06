'use client';

import Link from 'next/link';
import { useWishlistStore } from '@/store/wishlistStore';
import { Loader2, Heart, ChevronRight } from 'lucide-react';

export default function WishlistPreview() {
    const { wishlistItems, isLoading } = useWishlistStore();

    // Helper untuk menangani URL gambar dari Backend
    const getImageUrl = (mediaUrl: string | undefined) => {
        if (!mediaUrl) return '/placeholder.jpg';
        if (mediaUrl.startsWith('http')) return mediaUrl;
        return `http://localhost:5000/public${mediaUrl}`;
    };

    const formatIDR = (price: number | string) => {
        return "Rp" + Number(price).toLocaleString("id-ID").replace(/,/g, ".");
    };

    return (
        /* Responsive: 
           - h-auto di mobile agar konten tidak terpotong
           - md:h-full di desktop agar mengikuti tinggi sidebar/col-span
           - p-5 di mobile, p-8 di desktop
        */
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 md:p-8 h-auto lg:h-full flex flex-col shadow-xl">
            
            {/* Header Area */}
            <div className="flex justify-between items-center mb-6 md:mb-8">
                <div className="flex items-center gap-2 md:gap-3">
                    <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        Wishlist
                    </h3>
                    <span className="text-[9px] md:text-[10px] bg-zinc-900 text-zinc-400 px-2.5 py-0.5 rounded-full border border-zinc-800 font-bold">
                        {wishlistItems.length}
                    </span>
                </div>
                
                <Link 
                    href="/user/wishlist" 
                    className="group text-[10px] md:text-xs text-zinc-500 hover:text-[#ef3333] font-black uppercase tracking-widest transition-all flex items-center gap-1"
                >
                    Lihat Semua <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* List Content */}
            <div className="space-y-4 md:space-y-6 flex-1">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <Loader2 className="w-6 h-6 animate-spin text-[#ef3333] mb-2" />
                    </div>
                ) : wishlistItems.length > 0 ? (
                    /* Grid responsif: 1 kolom di mobile/desktop, 2 kolom di iPad (tablet) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-5">
                        {wishlistItems.slice(0, 3).map((item) => {
                            const product = item?.product;
                            if (!product) return null;

                            const mediaUrl = product.media?.[0]?.media_url;

                            return (
                                <div key={item.id} className="flex items-center gap-4 group">
                                    {/* Product Image Container */}
                                    <Link 
                                        href={`/produk/${product.id}`}
                                        className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#111114] border border-zinc-800 shrink-0 overflow-hidden group-hover:border-[#ef3333]/50 transition-all shadow-lg"
                                    >
                                        <img 
                                            src={getImageUrl(mediaUrl)} 
                                            alt={product.name || 'Produk'}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" 
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                            }}
                                        />
                                    </Link>

                                    {/* Info Area */}
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/produk/${product.id}`}>
                                            <h4 className="text-xs md:text-sm font-black text-zinc-100 truncate hover:text-[#ef3333] transition-colors uppercase tracking-tight">
                                                {product.name || 'Tanpa Nama'}
                                            </h4>
                                        </Link>
                                        <p className="text-[10px] md:text-xs font-black text-[#ef3333] mt-1 md:mt-1.5 tracking-wider ">
                                            {formatIDR(product.price || 0)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-20 grayscale">
                        <Heart size={32} className="mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Kosong</p>
                    </div>
                )}
            </div>

            {/* Banner Promo / Note (Hanya muncul di layar iPad ke atas untuk mengisi space) */}
            {wishlistItems.length > 0 && (
                <div className="hidden md:block mt-8 pt-6 border-t border-zinc-900">
                    <p className="text-[9px] text-zinc-600 font-medium leading-relaxed uppercase tracking-widest">
                        Item ini tersimpan di koleksi pribadi Anda. Segera amankan sebelum stok habis.
                    </p>
                </div>
            )}
        </div>
    );
}
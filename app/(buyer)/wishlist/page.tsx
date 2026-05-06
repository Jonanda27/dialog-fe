"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import ProductCard from '@/components/ui/ProductCard';
import { 
    Heart, 
    Loader2, 
    Ghost,
    ChevronRight,
    ShoppingBag,
    Search,
    Trash2,
    Sparkles
} from 'lucide-react';

export default function WishlistPage() {
    const { user } = useAuthStore();
    const { wishlistItems, isLoading, fetchWishlist } = useWishlistStore();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (user) fetchWishlist();
    }, [user, fetchWishlist]);

    const getImageUrl = (item: any) => {
        const media = item?.product?.media;
        if (Array.isArray(media) && media.length > 0) {
            const path = media[0].media_url;
            if (!path) return '/placeholder.jpg';
            if (path.startsWith('http')) return path;
            return `http://localhost:5000/public${path}`;
        }
        return '/placeholder.jpg';
    };

    // Filter lokal untuk mempercantik interaksi
    const filteredItems = wishlistItems.filter(item => 
        item.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col">
            {/* 1. HERO SECTION WITH PATTERN */}
            <div className="relative bg-[#111114] border-b border-zinc-800 pt-2 pb-16 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: `radial-gradient(#ef3333 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }}></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#ef3333]/10 rounded-full blur-[120px]"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                        <Link href="/dashboard" className="hover:text-white transition-colors">Base</Link>
                        <ChevronRight size={10} />
                        <span className="text-[#ef3333]">The Vault</span>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4 text-[#ef3333]">
                                <Sparkles size={18} className="animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest">Personal Collection</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter  leading-none">
                                Your <span className="text-zinc-500 underline decoration-zinc-800 decoration-8">Vault</span>
                            </h1>
                        </div>

                        {/* Search & Stats Card */}
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative w-full sm:w-64 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#ef3333] transition-colors" size={16} />
                                <input 
                                    type="text"
                                    placeholder="Cari di brankas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-[#ef3333] transition-all"
                                />
                            </div>
                            <div className="bg-zinc-900 border border-zinc-800 px-8 py-3 rounded-2xl flex flex-col items-center min-w-[120px]">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Curated</span>
                                <span className="text-xl font-black">{wishlistItems.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <Loader2 className="w-10 h-10 animate-spin text-[#ef3333] mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Accessing Data...</p>
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                        {filteredItems.map((item) => (
                            <div key={item.id} className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                                {item.product && (
                                    <ProductCard 
                                        product={{
                                            ...item.product,
                                            image_url: getImageUrl(item) 
                                        }} 
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-[#111114]/50 border-2 border-dashed border-zinc-900 rounded-[3rem]">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-[#ef3333]/20 blur-3xl rounded-full"></div>
                            <Ghost size={80} className="text-zinc-800 relative z-10" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-3">Brankas Kosong</h3>
                        <p className="text-zinc-500 max-w-sm mx-auto text-xs font-medium leading-relaxed mb-10">
                            {searchQuery ? "Tidak menemukan item yang sesuai dengan pencarian Anda." : "Sepertinya Anda belum menemukan item langka yang layak disimpan. Jelajahi katalog kami sekarang."}
                        </p>
                        <Link 
                            href="/katalog" 
                            className="group flex items-center gap-3 px-10 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#ef3333] hover:text-white transition-all shadow-xl shadow-white/5"
                        >
                            <ShoppingBag size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                            Explore Catalog
                        </Link>
                    </div>
                )}
            </main>

            {/* 3. FOOTER SECTION */}
            <footer className="mt-auto border-t border-zinc-900 bg-[#111114] py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                        <div className="space-y-4">
                            <h4 className="text-sm font-black uppercase tracking-widest ">Analog<span className="text-[#ef3333]">.Vault</span></h4>
                            <p className="text-zinc-500 text-[10px] leading-relaxed max-w-xs">
                                Sistem manajemen wishlist cerdas untuk para kolektor rilisan fisik. Kami memantau ketersediaan barang favorit Anda secara real-time.
                            </p>
                        </div>
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Quick Navigation</span>
                            <div className="flex gap-6 text-[10px] font-bold uppercase tracking-tighter text-zinc-400">
                                <Link href="/katalog" className="hover:text-[#ef3333] transition-colors">Catalog</Link>
                                <Link href="/lelang" className="hover:text-[#ef3333] transition-colors">Auctions</Link>
                                <Link href="/stores" className="hover:text-[#ef3333] transition-colors">Stores</Link>
                            </div>
                        </div>
                        <div className="flex md:justify-end">
                            <div className="flex items-center gap-4 bg-black/50 border border-zinc-800 p-4 rounded-2xl">
                                <Heart className="text-[#ef3333] fill-[#ef3333]" size={20} />
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Secure Backup</p>
                                    <p className="text-[11px] font-bold">Data Encrypted</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-600 text-[9px] font-black uppercase tracking-widest">
                        <p>© 2026 ANALOG.ID MARKETPLACE SYSTEM</p>
                        <p>COMMAND CENTER V.2.4.0</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
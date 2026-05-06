// CatalogClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Box, Flame, Gavel, Filter, X } from 'lucide-react';

import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { Auction } from '@/types/auction';
import { useProductStore } from '@/store/productStore';

import DynamicFilterSidebar from '@/components/product/DynamicFilterSidebar';
import ProductGrid from '@/components/product/ProductGrid';
import AuctionCard from '@/components/ui/AuctionCard';

// Menggunakan API Service yang terpusat dan konsisten
import { auctionService } from '@/services/api/auction.service';

// Definisi Interface untuk Props
interface CatalogClientProps {
    initialProducts: Product[];
    categories: Category[];
    initialFilters: Record<string, string>;
}

export default function CatalogClient({
    initialProducts,
    categories,
    initialFilters
}: CatalogClientProps) {

    const { setInitialProducts } = useProductStore();

    // --- NEW STATE: Dual-Mode Catalog ---
    const [viewMode, setViewMode] = useState<'REGULAR' | 'AUCTION'>('REGULAR');
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [isLoadingAuctions, setIsLoadingAuctions] = useState(false);
    
    // State untuk Drawer Filter di Mobile
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Hydrate store Zustand saat initialProducts berubah dari server
    useEffect(() => {
        setInitialProducts(initialProducts);
    }, [initialProducts, setInitialProducts]);

    // Fetch Lelang secara asinkron ketika Tab Lelang diklik pertama kali
    useEffect(() => {
        if (viewMode === 'AUCTION' && auctions.length === 0) {
            const fetchPublicAuctions = async () => {
                setIsLoadingAuctions(true);
                try {
                    // ⚡ PERBAIKAN TS: Menggunakan :any untuk mem-bypass strict interface dari layer interceptor
                    const res: any = await auctionService.getMarketAuctions(1, 24);

                    // ⚡ ROBUST EXTRACTION: Cek semua probabilitas pembungkusan JSON
                    const auctionData = res?.data?.auctions || res?.auctions || res?.data?.data?.auctions || [];

                    setAuctions(auctionData);
                } catch (error) {
                    console.error("Gagal memuat katalog lelang:", error);
                } finally {
                    setIsLoadingAuctions(false);
                }
            };
            fetchPublicAuctions();
        }
    }, [viewMode, auctions.length]);

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 px-4 md:px-0">
            
            {/* TABS HEADER: REGULAR VS AUCTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/50 pb-4 overflow-hidden">
                <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                    <button
                        onClick={() => setViewMode('REGULAR')}
                        className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'REGULAR'
                            ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                            : 'bg-zinc-900/50 text-zinc-500 hover:text-white hover:bg-zinc-800'
                            }`}
                    >
                        <Box size={14} className="md:w-4 md:h-4" /> Katalog Reguler
                    </button>
                    <button
                        onClick={() => setViewMode('AUCTION')}
                        className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'AUCTION'
                            ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                            : 'bg-zinc-900/50 text-zinc-500 hover:text-red-500 hover:bg-zinc-800'
                            }`}
                    >
                        <Flame size={14} className="md:w-4 md:h-4" /> Exclusive Auction
                    </button>
                </div>

                {/* Tombol Filter Mobile (Hanya muncul di Mobile & Mode Reguler) */}
                {viewMode === 'REGULAR' && (
                    <button 
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="lg:hidden flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl text-white font-bold text-[10px] uppercase tracking-widest"
                    >
                        <Filter size={14} /> Filter
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
                
                {/* Kolom Kiri: Sidebar Filter (Desktop) */}
                <div className={`hidden lg:block lg:col-span-3 sticky top-24 transition-opacity duration-300 ${viewMode === 'AUCTION' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <DynamicFilterSidebar categories={categories} />
                </div>

                {/* Mobile Filter Drawer (Hanya di layar < 1024px) */}
                {isMobileFilterOpen && (
                    <div className="fixed inset-0 z-[100] lg:hidden">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
                        <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#0a0a0b] border-r border-zinc-800 p-6 overflow-y-auto animate-in slide-in-from-left duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-white font-black uppercase text-sm tracking-widest">Filters</h3>
                                <button onClick={() => setIsMobileFilterOpen(false)} className="text-zinc-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <DynamicFilterSidebar categories={categories} />
                        </div>
                    </div>
                )}

                {/* Kolom Kanan: Grid Konten Sesuai Mode */}
                <div className="lg:col-span-9 w-full">
                    {viewMode === 'REGULAR' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ProductGrid products={initialProducts} />
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {/* Banner Lelang */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between bg-red-500/10 border border-red-500/20 p-4 md:p-5 rounded-2xl gap-3">
                                <div className="max-w-xl">
                                    <h3 className="text-red-500 font-black uppercase tracking-widest text-[10px] md:text-sm flex items-center gap-2">
                                        <Gavel size={16} /> Live Bidding Arena
                                    </h3>
                                    <p className="text-[10px] md:text-xs text-zinc-400 font-medium mt-1">
                                        Koleksi langka dan eksklusif yang terpisah dari katalog reguler.
                                    </p>
                                </div>
                                <div className="animate-pulse flex items-center gap-2 self-start md:self-auto">
                                    <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-red-500"></span>
                                    </span>
                                    <span className="text-[9px] md:text-[10px] font-bold text-red-500 uppercase tracking-widest">Live Connect</span>
                                </div>
                            </div>

                            {/* Grid Lelang */}
                            {isLoadingAuctions ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                    {[1, 2, 3, 4, 5, 6].map(n => (
                                        <div key={n} className="h-64 md:h-80 bg-zinc-900/50 animate-pulse rounded-2xl md:rounded-3xl border border-zinc-800/50"></div>
                                    ))}
                                </div>
                            ) : auctions.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
                                    {auctions.map(auction => (
                                        <div key={auction.id} className="flex flex-col h-full w-full">
                                            <AuctionCard auction={auction} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 md:py-24 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl md:rounded-3xl text-center px-6">
                                    <Gavel size={40} className="text-zinc-800 mb-4 md:w-12 md:h-12" />
                                    <h4 className="text-base md:text-lg font-black text-white uppercase tracking-tighter">Arena Kosong</h4>
                                    <p className="text-zinc-500 font-medium text-[10px] md:text-sm mt-1">Belum ada barang langka yang dilelang saat ini.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
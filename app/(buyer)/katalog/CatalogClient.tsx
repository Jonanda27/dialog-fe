// CatalogClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Box, Flame, Gavel } from 'lucide-react';

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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* TABS HEADER: REGULAR VS AUCTION */}
            <div className="flex items-center gap-4 border-b border-zinc-800/50 pb-4 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setViewMode('REGULAR')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'REGULAR'
                        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                        : 'bg-zinc-900/50 text-zinc-500 hover:text-white hover:bg-zinc-800'
                        }`}
                >
                    <Box size={16} /> Katalog Reguler
                </button>
                <button
                    onClick={() => setViewMode('AUCTION')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${viewMode === 'AUCTION'
                        ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]'
                        : 'bg-zinc-900/50 text-zinc-500 hover:text-red-500 hover:bg-zinc-800'
                        }`}
                >
                    <Flame size={16} /> Exclusive Auction
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Kolom Kiri: Sidebar Filter */}
                {/* Sidebar di-dim ketika mode Lelang aktif karena filter kategori milik produk reguler */}
                <div className={`lg:col-span-3 transition-opacity duration-300 ${viewMode === 'AUCTION' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                    <DynamicFilterSidebar categories={categories} />
                </div>

                {/* Kolom Kanan: Grid Konten Sesuai Mode */}
                <div className="lg:col-span-9">
                    {viewMode === 'REGULAR' ? (
                        /* PENTING: Kita menggunakan initialProducts langsung dari props */
                        <ProductGrid products={initialProducts} />
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            {/* Banner Lelang */}
                            <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 p-5 rounded-2xl">
                                <div>
                                    <h3 className="text-red-500 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                                        <Gavel size={16} /> Live Bidding Arena
                                    </h3>
                                    <p className="text-xs text-zinc-400 font-medium mt-1">
                                        Koleksi langka dan eksklusif yang terpisah dari katalog reguler.
                                    </p>
                                </div>
                                <div className="animate-pulse items-center gap-2 hidden md:flex">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live Connect</span>
                                </div>
                            </div>

                            {/* Grid Lelang (Menggunakan komponen reaktif AuctionCard) */}
                            {isLoadingAuctions ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map(n => (
                                        <div key={n} className="h-80 bg-zinc-900/50 animate-pulse rounded-3xl border border-zinc-800/50"></div>
                                    ))}
                                </div>
                            ) : auctions.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-stretch">
                                    {auctions.map(auction => (
                                        <div key={auction.id} className="flex flex-col h-full w-full">
                                            <AuctionCard auction={auction} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/20 border border-zinc-800/50 rounded-3xl">
                                    <Gavel size={48} className="text-zinc-800 mb-4" />
                                    <h4 className="text-lg font-black text-white uppercase tracking-tighter">Arena Kosong</h4>
                                    <p className="text-zinc-500 font-medium text-sm mt-1">Belum ada barang langka yang dilelang saat ini.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
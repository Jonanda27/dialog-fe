'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, Flame, Gavel } from 'lucide-react';

import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { Auction } from '@/types/auction';
import { useProductStore } from '@/store/productStore';

import DynamicFilterSidebar from '@/components/product/DynamicFilterSidebar';
import ProductGrid from '@/components/product/ProductGrid';

import axiosClient from '@/services/api/axiosClient';
import { formatRupiah } from '@/utils/format';
import { getImageUrl } from '@/utils/image';

interface CatalogClientProps {
    initialProducts: Product[];
    categories: Category[];
    initialFilters: Record<string, string>;
}

export default function CatalogClient({ initialProducts, categories, initialFilters }: CatalogClientProps) {
    const { products, setInitialProducts } = useProductStore();

    // --- NEW STATE: Dual-Mode Catalog ---
    const [viewMode, setViewMode] = useState<'REGULAR' | 'AUCTION'>('REGULAR');
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [isLoadingAuctions, setIsLoadingAuctions] = useState(false);

    // Hydrate: Menyuntikkan data reguler dari Server ke dalam Zustand
    useEffect(() => {
        setInitialProducts(initialProducts);
    }, [initialProducts, setInitialProducts]);

    // Fetch Lelang secara asinkron ketika Tab Lelang diklik pertama kali
    useEffect(() => {
        if (viewMode === 'AUCTION' && auctions.length === 0) {
            const fetchPublicAuctions = async () => {
                setIsLoadingAuctions(true);
                try {
                    // Endpoint khusus public (Harus ditambahkan di Backend nanti)
                    const res = await axiosClient.get('/v1/auctions/public');
                    setAuctions(res.data?.data || res.data || []);
                } catch (error) {
                    console.error("Gagal memuat katalog lelang:", error);
                } finally {
                    setIsLoadingAuctions(false);
                }
            };
            fetchPublicAuctions();
        }
    }, [viewMode, auctions.length]);

    const displayProducts = products.length > 0 ? products : initialProducts;

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
                        <ProductGrid products={displayProducts} />
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
                                <div className="animate-pulse flex items-center gap-2 hidden md:flex">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live Connect</span>
                                </div>
                            </div>

                            {/* Grid Lelang (Decoupled Renderer) */}
                            {isLoadingAuctions ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4].map(n => (
                                        <div key={n} className="aspect-[3/4] bg-zinc-900/50 animate-pulse rounded-2xl border border-zinc-800/50"></div>
                                    ))}
                                </div>
                            ) : auctions.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {auctions.map(auction => {
                                        // Mengambil gambar dari tabel auction_media yang baru
                                        const primaryMedia = auction.media?.find(m => m.is_primary)?.media_url || auction.media?.[0]?.media_url;

                                        return (
                                            <Link
                                                key={auction.id}
                                                // Arahkan ke rute spesifik lelang (bukan produk reguler)
                                                href={`/produk/lelang/${auction.id}`}
                                                className="group flex flex-col bg-[#111114] border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,51,51,0.15)] transition-all duration-300"
                                            >
                                                <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                                                    <img
                                                        src={getImageUrl(primaryMedia || '/vynil.png')}
                                                        alt={auction.item_name}
                                                        className="object-cover w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
                                                    />
                                                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                                                        <Gavel size={12} />
                                                        {auction.status === 'SCHEDULED' ? 'Upcoming' : 'Live Bid'}
                                                    </div>
                                                </div>
                                                <div className="p-5 flex flex-col flex-1">
                                                    {/* Rendering item_name murni, bukan product.name */}
                                                    <h3 className="text-sm font-black text-white uppercase tracking-tighter line-clamp-2 mb-4 group-hover:text-red-500 transition-colors">
                                                        {auction.item_name}
                                                    </h3>
                                                    <div className="mt-auto border-t border-zinc-800/50 pt-4">
                                                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                                                            {auction.status === 'SCHEDULED' ? 'Harga Buka' : 'Current Highest Bid'}
                                                        </p>
                                                        <p className="text-lg font-black text-red-500">
                                                            {formatRupiah(Number(auction.current_price || auction.start_price || 0))}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
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
"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
    Heart,
    Bell,
    ShieldCheck,
    ChevronRight,
    Store as StoreIcon,
    Activity, // Ditambahkan untuk icon lelang
    Loader2
} from 'lucide-react';
import WishlistPreview from '@/components/dashboard/WishlistPreview';
import RecommendedFeed from '@/components/dashboard/RecommendedFeed';
import { StoreService } from "@/services/api/store.service";
import { auctionService } from "@/services/api/auction.service"; // Service Lelang
import AuctionCard from "@/components/ui/AuctionCard"; // Komponen Kartu Lelang
import { Auction } from "@/types/auction";
import Link from 'next/link';

/** * COMPONENT: VERIFIED STORES SECTION */
const VerifiedStores = () => {
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const res: any = await StoreService.getAllStores?.() || { data: [] };
                const verifiedOnes = (res.data || []).filter((s: any) => s.status === 'approved').slice(0, 4);
                setStores(verifiedOnes);
            } catch (error) {
                console.error("Gagal memuat toko:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    if (loading) return <div className="h-40 w-full bg-zinc-900/50 animate-pulse rounded-3xl" />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#ef3333] rounded-full" /> Verified Stores
                </h2>
                <Link href="/stores" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-all flex items-center gap-1">
                    Explore All <ChevronRight size={14} />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stores.map((store) => (
                    <Link key={store.id} href={`/store/${store.id}`} className="group">
                        <div className="bg-[#111114] border border-zinc-800 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center transition-all hover:border-[#ef3333]/50 hover:bg-zinc-900/50 shadow-xl">
                            <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden mb-4 group-hover:scale-110 transition-transform duration-500">
                                {store.logo_url ? (
                                    <img
                                        src={`http://localhost:5000/public${store.logo_url}`}
                                        alt={store.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                        <StoreIcon size={32} />
                                    </div>
                                )}
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-tight truncate w-full mb-2">{store.name}</h4>
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <ShieldCheck size={10} className="text-emerald-500" />
                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

/** * COMPONENT: LIVE AUCTION HIGHLIGHT (NEW) */
const LiveAuctionHighlight = () => {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuctions = async () => {
            try {
                // Fetch public auctions yang aktif atau dijadwalkan
                const res: any = await auctionService.getPublicAuctions({
                    limit: 4,
                    status: 'ACTIVE' // Prioritaskan yang sedang live
                });

                // Gunakan robust extraction (handling Axios Interceptor)
                const payload = res.success !== undefined ? res : res.data;
                const auctionData = Array.isArray(payload?.data) ? payload.data : [];

                setAuctions(auctionData);
            } catch (error) {
                console.error("Gagal memuat lelang publik:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAuctions();
    }, []);

    if (loading) {
        return (
            <div className="w-full py-10 flex flex-col items-center justify-center border border-zinc-800 rounded-[2.5rem] bg-zinc-900/20">
                <Loader2 className="animate-spin text-red-500 mb-3" size={32} />
                <span className="text-xs font-black uppercase text-zinc-500 tracking-widest">Memuat Arena Lelang...</span>
            </div>
        );
    }

    // Jika tidak ada lelang aktif, sembunyikan section ini atau tampilkan pesan kosong
    if (auctions.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-900 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Activity size={16} className="text-[#ef3333] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ef3333]">Live Bidding</span>
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                        Auction <span className="text-zinc-500">Arena</span>
                    </h2>
                </div>
                <Link href="/katalog/lelang" className="text-xs font-black bg-zinc-900 hover:bg-white hover:text-black text-zinc-400 uppercase tracking-widest px-6 py-3 rounded-full transition-colors flex items-center gap-2 border border-zinc-800">
                    Lihat Semua Lelang <ChevronRight size={14} />
                </Link>
            </div>

            {/* Grid Kartu Lelang (Disesuaikan tinggi agar uniform) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 auto-rows-fr">
                {auctions.map((auction) => (
                    <div key={auction.id} className="h-[450px]">
                        <AuctionCard auction={auction} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function BuyerDashboard() {
    const { user } = useAuthStore();
    const [activeCategory, setActiveCategory] = useState('SEMUA');

    const categories = ['SEMUA', 'LASERDISC', 'REEL VIDEO 8MM', 'VCD & DVD', 'VHS & BETAMAX'];

    return (
        <div className="w-full pb-20 space-y-16 mt-8">
            <div className="max-w-full px-6 lg:px-10 space-y-16">

                {/* 1. VERIFIED STORES */}
                <VerifiedStores />

                {/* 2. LIVE AUCTIONS (NEW SECTION) */}
                <LiveAuctionHighlight />

                {/* 3. MAIN CONTENT AREA (Market Highlights) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT COLUMN: PRODUCT FEED */}
                    <div className="lg:col-span-8 space-y-12">
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-8">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <span className="w-2 h-8 bg-[#ef3333] rounded-full" /> Market Highlights
                                </h2>

                                {/* Category Filters */}
                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat
                                                ? "bg-[#ef3333] border-[#ef3333] text-white shadow-lg shadow-red-900/20"
                                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Suspense fallback={
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map((n) => (
                                        <div key={n} className="h-80 w-full bg-zinc-900 animate-pulse rounded-[2.5rem] border border-zinc-800" />
                                    ))}
                                </div>
                            }>
                                <RecommendedFeed />
                            </Suspense>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PERSONAL SELECTION */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="sticky top-44 space-y-10">

                            {/* Wishlist Highlight */}
                            <div className="bg-[#111114] border border-zinc-800 rounded-[3rem] p-10 shadow-2xl overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-[#ef3333]" />
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <Heart size={24} className="text-[#ef3333]" fill="#ef3333" />
                                        <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Wishlist</h4>
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-500 bg-zinc-900 px-4 py-1.5 rounded-full border border-zinc-800">Your Picks</span>
                                </div>
                                <WishlistPreview />
                            </div>

                            {/* Alert Card */}
                            <div className="bg-zinc-900/40 border border-zinc-800 rounded-[3rem] p-10 group cursor-pointer hover:bg-zinc-900 transition-all shadow-xl">
                                <Bell size={32} className="text-blue-500 mb-6 group-hover:animate-bounce" />
                                <h4 className="text-white font-black uppercase text-sm tracking-[0.2em]">Price Alert!</h4>
                                <p className="text-zinc-500 text-xs font-medium mt-4 leading-relaxed">
                                    Aktifkan notifikasi untuk memantau koleksi langka. Jangan sampai terlewat rilisan terbatas dari toko favorit Anda.
                                </p>
                                <button className="w-full mt-10 py-5 bg-zinc-800 border border-zinc-700 hover:border-[#ef3333] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">
                                    Aktifkan Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
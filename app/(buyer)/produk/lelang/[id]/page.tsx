"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// SERVICES & TYPES
import { auctionService } from "@/services/api/auction.service";
import { Auction } from "@/types/auction";

// COMPONENTS
import ProductGallery from "@/components/product/ProductGallery";
import StoreSection from "@/components/product/StoreSection";
import AuctionBidPanel from "@/components/product/AuctionBidPanel";

// ICONS
import {
    Loader2,
    ArrowLeft,
    ChevronRight,
    Gavel,
    Clock,
    Scale,
    Box,
    AlertCircle
} from "lucide-react";

export default function AuctionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const auctionId = params.id as string;

    const [auction, setAuction] = useState<Auction | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAuctionDetail = useCallback(async () => {
        try {
            setIsLoading(true);
            const res: any = await auctionService.getPublicAuctionById(auctionId);
            // Menyesuaikan dengan standar response (res.data.data atau res.data)
            const data = res?.data?.data || res?.data;
            if (data) {
                setAuction(data);
            } else {
                throw new Error("Data kosong");
            }
        } catch (error) {
            console.error("Gagal memuat lelang:", error);
            toast.error("Data lelang tidak ditemukan atau sudah dihapus.");
            router.push("/katalog");
        } finally {
            setIsLoading(false);
        }
    }, [auctionId, router]);

    useEffect(() => {
        if (auctionId) fetchAuctionDetail();
    }, [auctionId, fetchAuctionDetail]);

    if (isLoading)
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#ef3333] w-10 h-10" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Memuat Sesi Lelang...</p>
            </div>
        );

    if (!auction) return null;

    const isEnded = ['COMPLETED', 'FAILED', 'HANDOVER_TO_RUNNER_UP', 'CANCELLED'].includes(auction.status);

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans pb-20 pt-10">
            <main className="max-w-7xl mx-auto px-6 lg:px-10">
                {/* NAVIGATION */}
                <div className="flex flex-col gap-6 mb-10">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-500">
                        <Link href="/" className="hover:text-[#ef3333] transition-colors">Analog.id</Link>
                        <ChevronRight size={12} />
                        <Link href="/katalog" className="hover:text-[#ef3333] transition-colors">Exclusive Auction</Link>
                        <ChevronRight size={12} />
                        <span className="text-zinc-200 truncate">{auction.item_name}</span>
                    </div>

                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] group w-max"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Arena
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* KOLOM KIRI: GALERI MEDIA LELANG */}
                    <div className="lg:col-span-6">
                        <ProductGallery
                            media={auction.media || []}
                            productName={auction.item_name}
                            grading={auction.condition === 'NEW' ? 'SEALED' : 'VINTAGE'}
                        />
                    </div>

                    {/* KOLOM KANAN: INFORMASI LELANG & BID PANEL */}
                    <div className="lg:col-span-6 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-red-600/10 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-red-500/20 flex items-center gap-1">
                                    <Gavel size={12} /> LIVE AUCTION
                                </span>
                                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${auction.status === 'ACTIVE' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                                    auction.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                        'bg-zinc-800 text-zinc-400 border-zinc-700'
                                    }`}>
                                    STATUS: {auction.status.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tighter uppercase mb-2">
                                {auction.item_name}
                            </h1>
                        </div>

                        {/* SPECS GRID FISIK & LOGISTIK */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-zinc-900/50 border border-zinc-800/60 p-4 rounded-2xl">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertCircle size={10} /> Kondisi</p>
                                <p className="text-xs font-bold text-zinc-200">{auction.condition === 'NEW' ? 'Brand New' : 'Used (Bekas)'}</p>
                            </div>
                            <div className="bg-zinc-900/50 border border-zinc-800/60 p-4 rounded-2xl">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1"><Scale size={10} /> Berat</p>
                                <p className="text-xs font-bold text-zinc-200">{auction.weight} Gram</p>
                            </div>
                            <div className="bg-zinc-900/50 border border-zinc-800/60 p-4 rounded-2xl col-span-2">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1"><Box size={10} /> Dimensi (P x L x T)</p>
                                <p className="text-xs font-bold text-zinc-200">{auction.length} x {auction.width} x {auction.height} cm</p>
                            </div>
                        </div>

                        {/* BID PANEL / NOTIFIKASI BERAKHIR */}
                        <div className="pt-4">
                            {isEnded ? (
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 text-center space-y-4">
                                    <Gavel size={40} className="mx-auto text-zinc-600" />
                                    <h3 className="text-xl font-black text-white uppercase tracking-widest">Lelang Telah Berakhir</h3>
                                    <p className="text-zinc-500 text-sm">Sesi *bidding* untuk barang ini sudah ditutup secara permanen.</p>
                                </div>
                            ) : (
                                <div className="bg-[#111114] border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                    <AuctionBidPanel
                                        auctionId={auction.id}
                                        initialPrice={Number(auction.current_price || auction.start_price || 0)}
                                        increment={Number(auction.increment)}
                                        endTime={auction.end_time}
                                    />
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* BOTTOM CONTENT: Keterangan & Toko */}
                <div className="grid grid-cols-1 gap-12 mt-20 max-w-4xl">
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-zinc-900 pb-4">
                            <div className="w-1.5 h-6 bg-[#ef3333] rounded-full" />
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Collector's Notes</h3>
                        </div>
                        <p className="text-zinc-400 text-sm leading-loose whitespace-pre-line font-medium italic">
                            {auction.description || "Tidak ada deskripsi tambahan yang diberikan oleh penjual untuk sesi lelang ini."}
                        </p>
                    </section>

                    {auction.store && (
                        <StoreSection store={auction.store} storeId={auction.store_id} />
                    )}
                </div>
            </main>
        </div>
    );
}
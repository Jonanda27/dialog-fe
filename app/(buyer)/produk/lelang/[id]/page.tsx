"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// SERVICES & TYPES
import { auctionService } from "@/services/api/auction.service";
import { Auction } from "@/types/auction";
import { ProductMedia } from "@/types/product"; // ⚡ IMPORT BARU: Dibutuhkan untuk Adapter Pattern

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
            const res: any = await auctionService.getPublicAuctionDetail(auctionId);

            const data = res?.data?.data || res?.data || res;

            if (data && data.id) {
                setAuction(data);
            } else {
                throw new Error("Data lelang tidak valid atau kosong");
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
        if (auctionId) {
            fetchAuctionDetail();
        }
    }, [auctionId, fetchAuctionDetail]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#ef3333] w-10 h-10" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Memuat Sesi Lelang...</p>
            </div>
        );
    }

    if (!auction) return null;

    const isEnded = ['COMPLETED', 'FAILED', 'HANDOVER_TO_RUNNER_UP', 'CANCELLED'].includes(auction.status);

    // ⚡ ADAPTER PATTERN: Mengonversi AuctionMedia menjadi wujud ProductMedia 
    // agar komponen ProductGallery yang sudah ada dapat digunakan ulang tanpa error TypeScript.
    const mappedMedia: ProductMedia[] = (auction.media || []).map((m) => ({
        id: m.id || Math.random().toString(),
        product_id: auction.id, // Bypass type-check dengan ID lelang
        media_url: m.media_url,
        is_primary: m.is_primary,
        file_type: 'image', // Asumsi file dari fitur lelang selalu berupa gambar/foto
        created_at: m.created_at || new Date().toISOString(),
        updated_at: m.updated_at || new Date().toISOString()
    }));

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans pb-20 pt-10">
            <main className="max-w-7xl mx-auto px-6 lg:px-10">
                {/* --- BREADCRUMB & NAVIGATION --- */}
                <div className="flex flex-col gap-6 mb-10">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-500">
                        <Link href="/" className="hover:text-[#ef3333] transition-colors">Analog.id</Link>
                        <ChevronRight size={12} />
                        <Link href="/katalog/lelang" className="hover:text-[#ef3333] transition-colors">Exclusive Auction</Link>
                        <ChevronRight size={12} />
                        <span className="text-zinc-200 truncate">{auction.item_name}</span>
                    </div>

                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] group w-max transition-colors"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Arena
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* --- KOLOM KIRI: GALERI VISUAL (STATIS) --- */}
                    <div className="lg:col-span-6 sticky top-24">
                        <ProductGallery
                            media={mappedMedia} // ⚡ Masukkan hasil konversi/adapter di sini
                            productName={auction.item_name}
                            grading={auction.condition === 'NEW' ? 'SEALED' : 'VINTAGE'}
                        />
                    </div>

                    {/* --- KOLOM KANAN: INFORMASI & BID PANEL (REAKTIF) --- */}
                    <div className="lg:col-span-6 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-red-600/10 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-red-500/20 flex items-center gap-1">
                                    <Gavel size={12} /> LELANG EKSKLUSIF
                                </span>
                                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${auction.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                    auction.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        'bg-zinc-800/50 text-zinc-400 border-zinc-700/50'
                                    }`}>
                                    STATUS: {auction.status.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tighter uppercase mb-2">
                                {auction.item_name}
                            </h1>
                        </div>

                        {/* SPECS GRID: FISIK & LOGISTIK */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl flex flex-col justify-center">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertCircle size={10} /> Kondisi</p>
                                <p className="text-xs font-bold text-zinc-200">{auction.condition === 'NEW' ? 'Brand New' : 'Used (Bekas)'}</p>
                            </div>
                            <div className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl flex flex-col justify-center">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1"><Scale size={10} /> Berat</p>
                                <p className="text-xs font-bold text-zinc-200">{auction.weight} Gram</p>
                            </div>
                            <div className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl col-span-2 flex flex-col justify-center">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1"><Box size={10} /> Dimensi (P x L x T)</p>
                                <p className="text-xs font-bold text-zinc-200">{auction.length} x {auction.width} x {auction.height} cm</p>
                            </div>
                        </div>

                        {/* ARENA PERTEMPURAN (Socket Component Integration) */}
                        <div className="pt-4">
                            {isEnded ? (
                                <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-10 text-center space-y-4 shadow-xl">
                                    <Gavel size={48} className="mx-auto text-zinc-700" />
                                    <h3 className="text-2xl font-black text-white uppercase tracking-widest">Lelang Telah Berakhir</h3>
                                    <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                                        Sesi <span className="italic">bidding</span> untuk barang ini sudah ditutup secara permanen oleh sistem. Pemenang akan dihubungi untuk proses pembayaran.
                                    </p>
                                </div>
                            ) : (
                                <AuctionBidPanel
                                    auctionId={auction.id}
                                    initialPrice={Number(auction.current_price || auction.start_price || 0)}
                                    increment={Number(auction.increment)}
                                    endTime={auction.end_time}
                                />
                            )}
                        </div>

                    </div>
                </div>

                {/* --- BOTTOM CONTENT: DESKRIPSI & TOKO --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-20">
                    <section className="lg:col-span-8 space-y-6">
                        <div className="flex items-center gap-4 border-b border-zinc-900 pb-4">
                            <div className="w-1.5 h-6 bg-[#ef3333] rounded-full" />
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Collector's Notes</h3>
                        </div>
                        <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-3xl p-8">
                            <p className="text-zinc-400 text-sm leading-loose whitespace-pre-line font-medium">
                                {auction.description || "Tidak ada rincian spesifik tambahan yang diberikan oleh penjual untuk arsip/barang lelang ini."}
                            </p>
                        </div>
                    </section>

                    <section className="lg:col-span-4">
                        {auction.store && (
                            <StoreSection store={auction.store} storeId={auction.store_id} />
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
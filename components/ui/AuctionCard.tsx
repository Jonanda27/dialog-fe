"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Timer, Gavel, ChevronRight, Package, TrendingUp } from "lucide-react";
import { Auction } from "@/types/auction";
import { formatRupiah } from "@/utils/format";
import { getImageUrl } from "@/utils/image";
import { useAuctionSocket } from "@/hooks/useAuctionSocket";

interface AuctionCardProps {
    auction: Auction;
}

export default function AuctionCard({ auction }: AuctionCardProps) {
    const [timeString, setTimeString] = useState<string>("Menghitung...");
    const [isPulsing, setIsPulsing] = useState<boolean>(false);

    // ⚡ TAHAP 2 PERBAIKAN: Injeksi Mini-Socket (Passive Listener)
    const {
        currentPrice: livePrice,
        isEnded: liveIsEnded,
        isFrozen: liveIsFrozen
    } = useAuctionSocket({
        auctionId: auction.id,
        initialPrice: Number(auction.current_price || auction.start_price || 0)
    });

    // Deteksi pergerakan harga untuk memberikan efek visual berkedip (Pulse)
    useEffect(() => {
        if (livePrice > Number(auction.current_price || auction.start_price || 0)) {
            setIsPulsing(true);
            const timer = setTimeout(() => setIsPulsing(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [livePrice, auction.current_price, auction.start_price]);

    const primaryMedia = auction.media?.find((m) => m.is_primary)?.media_url || auction.media?.[0]?.media_url;

    // Logika Countdown Timer
    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            let targetTime = 0;
            let prefix = "";

            if (auction.status === "SCHEDULED" && !liveIsEnded) {
                targetTime = new Date(auction.start_time).getTime();
                prefix = "Mulai dalam: ";
            } else if ((auction.status === "ACTIVE" || auction.status === "FREEZE") && !liveIsEnded) {
                targetTime = new Date(auction.end_time).getTime();
                prefix = "Sisa waktu: ";
            } else {
                setTimeString("Lelang Berakhir");
                return;
            }

            const diff = targetTime - now;

            if (diff <= 0) {
                setTimeString(auction.status === "SCHEDULED" ? "Segera Dimulai..." : "Sedang Dievaluasi...");
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            if (d > 0) {
                setTimeString(`${prefix}${d}h ${h}j ${m}m`);
            } else {
                setTimeString(`${prefix}${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
            }
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);
    }, [auction.status, auction.start_time, auction.end_time, liveIsEnded]);

    const isActuallyLive = (auction.status === "ACTIVE" || liveIsFrozen) && !liveIsEnded;

    return (
        <Link href={`/produk/lelang/${auction.id}`} className="block group h-full">
            <div className={`bg-[#0a0a0c] border rounded-3xl overflow-hidden transition-all duration-500 h-full flex flex-col shadow-2xl relative ${isPulsing ? 'border-emerald-500/50 shadow-emerald-500/20 -translate-y-2' : 'border-zinc-800 hover:border-zinc-700 hover:-translate-y-1'
                }`}>

                {/* --- AREA GAMBAR --- */}
                <div className="relative aspect-[4/3] bg-zinc-900 overflow-hidden shrink-0">
                    {primaryMedia ? (
                        <img
                            src={getImageUrl(primaryMedia)}
                            alt={auction.item_name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                            <Package size={36} className="md:w-12 md:h-12" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-90"></div>

                    {/* Badge Status Reaktif */}
                    {isActuallyLive ? (
                        <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-emerald-500/90 backdrop-blur-md text-black px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse border border-emerald-400">
                            <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-black rounded-full"></span> LIVE
                        </div>
                    ) : auction.status === "SCHEDULED" && !liveIsEnded ? (
                        <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-blue-600/90 backdrop-blur-md text-white px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-lg border border-blue-500">
                            UPCOMING
                        </div>
                    ) : (
                        <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-zinc-800/90 backdrop-blur-md text-zinc-400 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-lg border border-zinc-700">
                            ENDED
                        </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 bg-black/60 backdrop-blur-md border border-zinc-800 rounded-xl px-2 py-1.5 md:px-3 md:py-2 flex items-center justify-center gap-1.5 md:gap-2 text-zinc-200">
                        <Timer size={12} className={`md:w-3.5 md:h-3.5 ${isActuallyLive ? "text-emerald-400" : "text-zinc-500"}`} />
                        <span className="text-[9px] md:text-[10px] font-bold font-mono tracking-wider truncate">{timeString}</span>
                    </div>
                </div>

                {/* --- AREA INFORMASI (Responsive Redesign) --- */}
                <div className="p-4 md:p-6 flex flex-col flex-1">
                    <div className="mb-3 md:mb-4">
                        <h3 className="text-white font-black uppercase tracking-tight text-base md:text-lg line-clamp-2 md:line-clamp-1 group-hover:text-[#ef3333] transition-colors leading-tight">
                            {auction.item_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 md:mt-2">
                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-zinc-500"></span>
                                {auction.condition === 'NEW' ? 'BRAND NEW' : 'VINTAGE'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-auto space-y-3 md:space-y-4">
                        {/* ⚡ Komparasi Harga Awal vs Harga Live - Responsif */}
                        <div className="bg-zinc-900/50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-zinc-800/80 relative overflow-hidden">
                            {isPulsing && <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>}

                            <div className="flex flex-wrap sm:flex-nowrap justify-between items-end relative z-10 gap-y-2">
                                <div className="w-full sm:w-auto">
                                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-0.5 md:mb-1">Harga Pembukaan</p>
                                    <p className={`text-[10px] md:text-xs font-bold truncate ${livePrice > Number(auction.start_price) ? 'text-zinc-600 line-through decoration-zinc-500' : 'text-zinc-400'}`}>
                                        {formatRupiah(Number(auction.start_price || auction.current_price || 0))}
                                    </p>
                                </div>
                                <div className="w-full sm:w-auto sm:text-right">
                                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-0.5 md:mb-1 flex items-center sm:justify-end gap-1">
                                        <TrendingUp size={10} className="md:w-2.5 md:h-2.5" /> Current Bid
                                    </p>
                                    <p className={`text-lg md:text-xl lg:text-2xl font-black italic tracking-tighter truncate transition-colors duration-300 ${isPulsing ? 'text-emerald-400' : 'text-white'}`}>
                                        {formatRupiah(livePrice)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`w-full py-2.5 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 md:gap-2 transition-all ${isActuallyLive
                            ? 'bg-zinc-100 text-black group-hover:bg-[#ef3333] group-hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_rgba(239,51,51,0.3)]'
                            : 'bg-zinc-900 text-zinc-500 border border-zinc-800 group-hover:text-zinc-300'
                            }`}>
                            <Gavel size={12} className="md:w-3.5 md:h-3.5" />
                            {isActuallyLive ? "Masuk ke Arena" : "Lihat Arsip"}
                            <ChevronRight size={12} className="md:w-3.5 md:h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>

            </div>
        </Link>
    );
}
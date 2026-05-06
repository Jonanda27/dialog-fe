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

    const {
        currentPrice: livePrice,
        isEnded: liveIsEnded,
        isFrozen: liveIsFrozen
    } = useAuctionSocket({
        auctionId: auction.id,
        initialPrice: Number(auction.current_price || auction.start_price || 0)
    });

    useEffect(() => {
        if (livePrice > Number(auction.current_price || auction.start_price || 0)) {
            setIsPulsing(true);
            const timer = setTimeout(() => setIsPulsing(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [livePrice, auction.current_price, auction.start_price]);

    const primaryMedia = auction.media?.find((m) => m.is_primary)?.media_url || auction.media?.[0]?.media_url;

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            let targetTime = 0;
            let prefix = "";

            if (auction.status === "SCHEDULED" && !liveIsEnded) {
                targetTime = new Date(auction.start_time).getTime();
                prefix = "Mulai: ";
            } else if ((auction.status === "ACTIVE" || auction.status === "FREEZE") && !liveIsEnded) {
                targetTime = new Date(auction.end_time).getTime();
                prefix = "";
            } else {
                setTimeString("Lelang Berakhir");
                return;
            }

            const diff = targetTime - now;
            if (diff <= 0) {
                setTimeString(auction.status === "SCHEDULED" ? "Segera Dimulai..." : "Selesai");
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
        <Link href={`/produk/lelang/${auction.id}`} className="block group h-full w-full">
            <div className={`bg-[#0a0a0c] border rounded-[1.5rem] md:rounded-[2rem] overflow-hidden transition-all duration-500 h-full flex flex-col shadow-2xl relative ${
                isPulsing ? 'border-emerald-500/50 shadow-emerald-500/20 lg:-translate-y-2' : 'border-zinc-800 hover:border-zinc-700 lg:hover:-translate-y-1'
            }`}>

                {/* --- AREA GAMBAR --- */}
                <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square bg-zinc-900 overflow-hidden shrink-0">
                    {primaryMedia ? (
                        <img
                            src={getImageUrl(primaryMedia)}
                            alt={auction.item_name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                            <Package size={40} />
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-80"></div>

                    {/* Badge Status - Responsive Sizing */}
                    <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
                        {isActuallyLive ? (
                            <div className="bg-emerald-500/90 backdrop-blur-md text-black px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg animate-pulse border border-emerald-400">
                                <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-black rounded-full"></span> LIVE
                            </div>
                        ) : auction.status === "SCHEDULED" && !liveIsEnded ? (
                            <div className="bg-blue-600/90 backdrop-blur-md text-white px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest border border-blue-500">
                                UPCOMING
                            </div>
                        ) : (
                            <div className="bg-zinc-800/90 backdrop-blur-md text-zinc-400 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest border border-zinc-700">
                                ENDED
                            </div>
                        )}
                    </div>

                    {/* Countdown Timer Floating Badge */}
                    <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 z-20">
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 flex items-center justify-center gap-2 text-white">
                            <Timer size={14} className={isActuallyLive ? "text-emerald-400" : "text-zinc-400"} />
                            <span className="text-[10px] md:text-xs font-black font-mono tracking-tighter uppercase">{timeString}</span>
                        </div>
                    </div>
                </div>

                {/* --- AREA INFORMASI --- */}
                <div className="p-4 md:p-5 lg:p-6 flex flex-col flex-1">
                    <div className="mb-4 md:mb-5">
                        <h3 className="text-white font-black uppercase tracking-tight text-sm md:text-base lg:text-lg line-clamp-2 group-hover:text-[#ef3333] transition-colors leading-tight min-h-[2.5rem] md:min-h-0">
                            {auction.item_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.15em] text-zinc-500 px-2 py-0.5 border border-zinc-800 rounded">
                                {auction.condition === 'NEW' ? 'BRAND NEW' : 'VINTAGE'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-auto space-y-4">
                        {/* Price Container */}
                        <div className="bg-zinc-900/30 rounded-2xl p-3 md:p-4 border border-zinc-800/50 relative overflow-hidden group-hover:bg-zinc-900/50 transition-colors">
                            {isPulsing && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>}

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-500">Starting</span>
                                    <span className={`text-[9px] md:text-[10px] font-bold ${livePrice > Number(auction.start_price) ? 'text-zinc-600 line-through' : 'text-zinc-400'}`}>
                                        {formatRupiah(Number(auction.start_price || 0))}
                                    </span>
                                </div>
                                
                                <div className="flex flex-col mt-1">
                                    <div className="flex items-center gap-1 text-emerald-500 mb-0.5">
                                        <TrendingUp size={10} />
                                        <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Current Bid</span>
                                    </div>
                                    <div className={`text-base md:text-lg lg:text-xl font-black tracking-tighter transition-colors duration-300 ${isPulsing ? 'text-emerald-400' : 'text-white'}`}>
                                        {formatRupiah(livePrice)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className={`w-full py-3 md:py-3.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 border ${
                            isActuallyLive
                            ? 'bg-white text-black border-white group-hover:bg-[#ef3333] group-hover:border-[#ef3333] group-hover:text-white shadow-xl group-hover:shadow-red-500/20'
                            : 'bg-transparent text-zinc-500 border-zinc-800 group-hover:text-zinc-300 group-hover:border-zinc-600'
                        }`}>
                            <Gavel size={14} />
                            {isActuallyLive ? "Tawar Sekarang" : "Detail Lelang"}
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>

            </div>
        </Link>
    );
}
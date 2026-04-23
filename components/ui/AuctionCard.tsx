"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Timer, Gavel, ChevronRight, Package } from "lucide-react";
import { Auction } from "@/types/auction";
import { formatRupiah } from "@/utils/format";
import { getImageUrl } from "@/utils/image";

interface AuctionCardProps {
    auction: Auction;
}

export default function AuctionCard({ auction }: AuctionCardProps) {
    const [timeString, setTimeString] = useState<string>("Menghitung...");

    // Mengambil foto utama atau fallback ke ikon package
    const primaryMedia = auction.media?.find((m) => m.is_primary)?.media_url || auction.media?.[0]?.media_url;

    // Logika Countdown Timer
    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            let targetTime = 0;
            let prefix = "";

            // Tentukan target waktu berdasarkan status
            if (auction.status === "SCHEDULED") {
                targetTime = new Date(auction.start_time).getTime();
                prefix = "Mulai dalam: ";
            } else if (auction.status === "ACTIVE" || auction.status === "FREEZE") {
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

            // Kalkulasi Hari, Jam, Menit, Detik
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

        // Jalankan sekali saat mount, lalu set interval
        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);
    }, [auction.status, auction.start_time, auction.end_time]);

    // Konfigurasi Badge Status
    const getStatusBadge = () => {
        if (auction.status === "ACTIVE" || auction.status === "FREEZE") {
            return (
                <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
                </div>
            );
        }
        if (auction.status === "SCHEDULED") {
            return (
                <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    UPCOMING
                </div>
            );
        }
        return (
            <div className="absolute top-3 right-3 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                ENDED
            </div>
        );
    };

    return (
        <Link href={`/produk/lelang/${auction.id}`} className="block group h-full">
            <div className="bg-[#111114] border border-zinc-800 rounded-3xl overflow-hidden transition-all duration-300 group-hover:border-zinc-600 group-hover:-translate-y-1 h-full flex flex-col shadow-xl hover:shadow-zinc-900/50">

                {/* AREA GAMBAR */}
                <div className="relative aspect-square bg-zinc-900 overflow-hidden shrink-0">
                    {primaryMedia ? (
                        <img
                            src={getImageUrl(primaryMedia)}
                            alt={auction.item_name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                            <Package size={48} />
                        </div>
                    )}

                    {/* Overlay Gradient bawah untuk teks yang lebih jelas jika ada elemen di atas gambar */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent opacity-60"></div>

                    {getStatusBadge()}

                    {/* Timer Badge (Floating on Image) */}
                    <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md border border-zinc-700/50 rounded-xl px-3 py-2 flex items-center justify-center gap-2 text-zinc-200">
                        <Timer size={14} className={auction.status === "ACTIVE" ? "text-red-500" : "text-blue-500"} />
                        <span className="text-[10px] font-bold font-mono tracking-wider">{timeString}</span>
                    </div>
                </div>

                {/* AREA INFORMASI */}
                <div className="p-5 flex flex-col flex-1">
                    <div className="mb-4">
                        <h3 className="text-white font-black uppercase tracking-tight text-lg line-clamp-1 group-hover:text-[#ef3333] transition-colors">
                            {auction.item_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                                {auction.condition === 'NEW' ? 'BARU' : 'BEKAS'}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">
                                {auction.weight}gr
                            </span>
                        </div>
                    </div>

                    <div className="mt-auto space-y-3">
                        <div className="bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                                {auction.status === "ACTIVE" ? "Harga Saat Ini" : "Harga Awal"}
                            </p>
                            <p className="text-xl font-black text-white italic tracking-tighter">
                                {formatRupiah(Number(auction.current_price || auction.start_price))}
                            </p>
                        </div>

                        <div className="w-full bg-white text-black py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-[#ef3333] group-hover:text-white transition-colors">
                            <Gavel size={14} />
                            {auction.status === "ACTIVE" ? "Ikut Bidding" : "Lihat Detail"}
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>

            </div>
        </Link>
    );
}
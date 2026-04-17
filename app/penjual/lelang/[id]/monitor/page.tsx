"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Gavel,
    Users,
    TrendingUp,
    Timer,
    ArrowLeft,
    Trophy,
    ShieldCheck,
    Clock,
    Package,
    AlertCircle,
    Activity
} from "lucide-react";

// Utils & Hooks
import { formatRupiah } from "@/utils/format";
import { useAuctionSocket } from "@/hooks/useAuctionSocket";

// Mock Data untuk metadata lelang (nantinya di-fetch dari API)
const MOCK_AUCTION_DATA = {
    id: "auc-9921",
    productName: "Original Pressing: The Beatles - Abbey Road (1969)",
    startPrice: 2500000,
    increment: 50000,
    endTime: new Date(Date.now() + 1000 * 60 * 45).toISOString(), // 45 menit lagi
    status: "ACTIVE" as const,
};

export default function LiveAuctionMonitor() {
    const params = useParams();
    const router = useRouter();
    const auctionId = params.id as string;

    // 1. Integrasi Socket (Read-Only Mode)
    // Kita menggunakan hook yang sama, tapi tidak akan memanggil fungsi submitBid
    const {
        currentPrice,
        highestBidders,
        isFrozen,
        isConnected
    } = useAuctionSocket({
        auctionId,
        initialPrice: MOCK_AUCTION_DATA.startPrice
    });

    // 2. Countdown Logic
    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(MOCK_AUCTION_DATA.endTime).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft("BERAKHIR");
                clearInterval(timer);
            } else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // 3. Masking User ID untuk privasi
    const maskUserId = (id: string) => {
        if (id.length < 8) return id;
        return `${id.substring(0, 3)}***${id.substring(id.length - 2)}`;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-6 lg:p-10 font-sans">
            <main className="max-w-7xl mx-auto space-y-8">

                {/* HEADER & NAVIGATION */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Dashboard
                        </button>
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                            <Activity className="text-[#ef3333] animate-pulse" size={28} />
                            Live Monitoring
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 p-2 rounded-2xl">
                        <div className="flex items-center gap-2 px-4 py-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                {isConnected ? 'Server Connected' : 'Connecting...'}
                            </span>
                        </div>
                        <div className="h-8 w-px bg-zinc-800" />
                        <div className="px-4 py-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Auction ID</span>
                            <span className="text-xs font-mono font-bold text-[#ef3333]">{auctionId}</span>
                        </div>
                    </div>
                </div>

                {/* MAIN MONITORING GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT: LIVE PRICE BOARD */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-[#111114] border border-zinc-800 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden shadow-2xl">
                            {/* Background Glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#ef3333]/10 blur-[100px] -z-10" />

                            <div className="flex items-center gap-3 px-6 py-2 bg-zinc-900/80 rounded-full border border-zinc-800">
                                <TrendingUp className="text-emerald-500" size={16} />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Current Highest Offer</span>
                            </div>

                            <div key={currentPrice} className="space-y-2 animate-in fade-in zoom-in duration-500">
                                <h2 className="text-7xl lg:text-8xl font-black tracking-tighter italic">
                                    {formatRupiah(currentPrice)}
                                </h2>
                                <div className="flex items-center justify-center gap-4 text-emerald-500 font-bold uppercase tracking-widest text-sm">
                                    <span>+{formatRupiah(MOCK_AUCTION_DATA.increment)} Step</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                    <span>{highestBidders.length} Total Bids</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 w-full max-w-md gap-4 pt-6">
                                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Starting Price</p>
                                    <p className="text-sm font-bold">{formatRupiah(MOCK_AUCTION_DATA.startPrice)}</p>
                                </div>
                                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Time Remaining</p>
                                    <p className="text-sm font-bold text-red-500 font-mono tracking-wider">{timeLeft}</p>
                                </div>
                            </div>
                        </div>

                        {/* PRODUCT INFO SUMMARY */}
                        <div className="bg-[#111114] border border-zinc-800 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-xl">
                            <div className="w-24 h-24 bg-zinc-900 rounded-3xl border border-zinc-800 flex items-center justify-center text-zinc-700 shrink-0">
                                <Package size={40} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-black uppercase tracking-tighter text-white">
                                    {MOCK_AUCTION_DATA.productName}
                                </h3>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">Vinyl LP</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 italic">Seller View Only</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: LIVE BID FEED */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#111114] border border-zinc-800 rounded-[2.5rem] flex flex-col h-full shadow-2xl overflow-hidden">
                            <div className="p-6 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                    <Users size={16} className="text-[#ef3333]" /> Live Bidders
                                </h3>
                                <div className="px-2 py-0.5 bg-[#ef3333]/10 text-[#ef3333] text-[9px] font-black rounded-full border border-[#ef3333]/20">
                                    REALTIME
                                </div>
                            </div>

                            <div className="flex-1 p-6 space-y-4 max-h-125 overflow-y-auto no-scrollbar">
                                {highestBidders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                                        <Gavel size={48} className="mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Waiting for first bid...</p>
                                    </div>
                                ) : (
                                    highestBidders.map((bid, index) => (
                                        <div
                                            key={index}
                                            className={`
                          group p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between
                          ${index === 0
                                                    ? 'bg-emerald-500/5 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                                                    : 'bg-zinc-900/50 border-zinc-800'
                                                }
                        `}
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    {index === 0 && <Trophy size={14} className="text-yellow-500" />}
                                                    <span className="text-xs font-black uppercase tracking-tighter text-zinc-200">
                                                        {maskUserId(bid.userId)}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] text-zinc-500 font-medium">
                                                    {new Date(bid.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-black ${index === 0 ? 'text-emerald-500' : 'text-white'}`}>
                                                    {formatRupiah(bid.amount)}
                                                </p>
                                                {index === 0 && (
                                                    <p className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest">Highest</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Masa Tenang Indicator */}
                            {isFrozen && (
                                <div className="p-6 bg-amber-500/10 border-t border-amber-500/20">
                                    <div className="flex items-center gap-3 text-amber-500">
                                        <Clock size={18} className="animate-spin" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest">Freeze Mode Active</p>
                                            <p className="text-[9px] text-amber-500/60 font-medium uppercase italic">Finalizing bids, no new entry allowed.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* WINNER SUMMARY CARD (HANYA MUNCUL JIKA SELESAI) */}
                        {timeLeft === "BERAKHIR" && highestBidders.length > 0 && (
                            <div className="bg-emerald-500 border border-emerald-400 rounded-4xl p-6 text-white shadow-xl shadow-emerald-900/20 animate-in slide-in-from-bottom duration-700">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <Trophy size={24} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
                                        <p className="text-sm font-black italic uppercase">Lelang Terjual</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Final Winner</p>
                                        <p className="text-xl font-black">{maskUserId(highestBidders[0].userId)}</p>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Final Price</p>
                                            <p className="text-2xl font-black italic">{formatRupiah(currentPrice)}</p>
                                        </div>
                                        <button className="bg-black text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-900 transition-colors flex items-center gap-2">
                                            <ShieldCheck size={14} /> Lihat Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
}
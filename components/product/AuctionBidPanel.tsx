'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { formatRupiah } from '@/utils/format';
import { useAuctionSocket } from '@/hooks/useAuctionSocket';
import { toast } from 'sonner';
import { Gavel, Clock, AlertCircle, TrendingUp, Trophy, History, ShieldAlert } from 'lucide-react';
import { BidderHistory } from '@/types/auction';

interface AuctionBidPanelProps {
    auctionId: string;
    initialPrice: number;
    increment: number; // Secara semantik bertindak sebagai Minimum Increment
    endTime: string;
}

export default function AuctionBidPanel({
    auctionId,
    initialPrice,
    increment,
    endTime
}: AuctionBidPanelProps) {
    // 1. Integrasi Observer Murni (Single Source of Truth)
    const {
        currentPrice,
        topBidders,
        recentHistory,
        isFrozen,
        isOnCooldown,
        isSyncing,
        socketError,
        isEnded,
        submitBid
    } = useAuctionSocket({ auctionId, initialPrice });

    // 2. Local State Management untuk Interaksi Dinamis
    const [localCooldown, setLocalCooldown] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<string>('--:--:--');
    const [isAuctionEnded, setIsAuctionEnded] = useState<boolean>(false);
    const [customBid, setCustomBid] = useState<string>('');
    const [validationError, setValidationError] = useState<string | null>(null);

    // 3. Engine Hitung Mundur Presisi
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const distance = end - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft('00:00:00');
                setIsAuctionEnded(true);
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                setTimeLeft(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    // 4. Sinkronisasi Cooldown UI
    useEffect(() => {
        if (isOnCooldown) {
            setLocalCooldown(5);
        }
    }, [isOnCooldown]);

    useEffect(() => {
        if (localCooldown > 0) {
            const timer = setTimeout(() => setLocalCooldown(localCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [localCooldown]);

    // 5. Handling Notifikasi Error Server
    useEffect(() => {
        if (socketError) {
            toast.error("Validasi Server Gagal", { description: socketError });
            if (socketError.includes('naik') || socketError.includes('berubah')) {
                setLocalCooldown(0); // Buka gembok agar bisa langsung counter-bid
                setCustomBid('');
            }
        }
    }, [socketError]);

    // 6. Client-Side Validation & Execution
    const minimumValidBid = currentPrice + increment;

    const handleCustomBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numericValue = e.target.value.replace(/[^0-9]/g, '');
        setCustomBid(numericValue);

        if (numericValue) {
            const val = parseInt(numericValue, 10);
            if (val < minimumValidBid) {
                setValidationError(`Minimum bid valid: ${formatRupiah(minimumValidBid)}`);
            } else {
                setValidationError(null);
            }
        } else {
            setValidationError(null);
        }
    };

    const executeBid = useCallback((expectedPrice: number) => {
        if (localCooldown > 0 || isFrozen || isAuctionEnded || isEnded || isSyncing) return;
        if (expectedPrice < minimumValidBid) {
            toast.error("Bid Terlalu Rendah", { description: `Minimal bid saat ini adalah ${formatRupiah(minimumValidBid)}` });
            return;
        }

        submitBid(expectedPrice, increment);
        setCustomBid(''); // Reset input setelah bid terkirim

        toast.success("Tawaran Mengudara!", {
            description: `Mengajukan bid sebesar ${formatRupiah(expectedPrice)}`
        });
    }, [localCooldown, isFrozen, isAuctionEnded, isEnded, isSyncing, minimumValidBid, increment, submitBid]);

    // Variabel Bantu UI
    const isGlobalDisabled = localCooldown > 0 || isFrozen || isAuctionEnded || isEnded || isSyncing;
    const isCustomSubmitDisabled = isGlobalDisabled || !customBid || parseInt(customBid, 10) < minimumValidBid;

    // Opsi Quick Bid Dinamis (Berdasarkan kelipatan increment)
    const quickBids = [
        increment,
        increment * 2,
        increment * 4
    ];

    return (
        <div className="w-full bg-[#0a0a0c] p-6 lg:p-8 rounded-2xl border border-zinc-800/50 shadow-2xl space-y-8">
            {/* --- HEADER: Status & Timer --- */}
            <div className="flex justify-between items-start border-b border-zinc-800/50 pb-6">
                <div>
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Gavel size={12} /> Status Arena
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`relative flex h-3 w-3 ${isFrozen || isEnded || isSyncing ? 'hidden' : ''}`}>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-sm font-bold text-white uppercase tracking-wider">
                            {isEnded || isAuctionEnded ? 'Berakhir' : isSyncing ? 'Menyinkronkan...' : isFrozen ? 'Evaluasi Akhir...' : 'Live'}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-end gap-2">
                        <Clock size={12} /> Sisa Waktu
                    </h3>
                    <span className={`font-mono text-2xl font-black tracking-tighter mt-1 block ${isEnded || isAuctionEnded ? 'text-zinc-500' : 'text-red-500'}`}>
                        {timeLeft}
                    </span>
                </div>
            </div>

            {/* --- BODY: Harga & Kontrol Dinamis --- */}
            <div className="space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Highest Bid</span>
                    <span key={currentPrice} className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter animate-in zoom-in duration-300">
                        {formatRupiah(currentPrice)}
                    </span>
                    <span className="text-xs text-zinc-500 font-bold bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 mt-2 flex items-center gap-1.5">
                        <ShieldAlert size={12} /> Bare Minimum: +{formatRupiah(increment)}
                    </span>
                </div>

                {/* Kontrol Penawaran */}
                <div className="space-y-4 relative">
                    {/* Overlay Gembok jika Cooldown/Frozen */}
                    {isGlobalDisabled && (
                        <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center border border-zinc-800">
                            <span className="text-white font-black uppercase tracking-widest text-sm mb-1">
                                {localCooldown > 0 ? `Cooldown (${localCooldown}s)` : 'Arena Dikunci'}
                            </span>
                            <span className="text-xs text-zinc-400 font-bold">
                                {localCooldown > 0 ? 'Mencegah eksekusi ganda' : 'Menunggu kalkulasi node'}
                            </span>
                        </div>
                    )}

                    {/* Tombol Quick Bids */}
                    <div className="grid grid-cols-3 gap-2">
                        {quickBids.map((amount, idx) => {
                            const expected = currentPrice + amount;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => executeBid(expected)}
                                    disabled={isGlobalDisabled}
                                    className="py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-black text-white uppercase tracking-widest hover:bg-zinc-800 hover:border-zinc-700 transition-all active:scale-95"
                                >
                                    +{formatRupiah(amount).replace('Rp', '')}
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom Bid Input */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-black">Rp</span>
                            <input
                                type="text"
                                value={customBid ? new Intl.NumberFormat('id-ID').format(parseInt(customBid)) : ''}
                                onChange={handleCustomBidChange}
                                disabled={isGlobalDisabled}
                                placeholder="Nominal Bebas..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white font-bold focus:outline-none focus:border-red-500 transition-colors"
                            />
                        </div>
                        <button
                            onClick={() => executeBid(parseInt(customBid, 10))}
                            disabled={isCustomSubmitDisabled}
                            className={`px-6 rounded-lg font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isCustomSubmitDisabled
                                ? 'bg-zinc-800 text-zinc-600'
                                : 'bg-red-600 text-white hover:bg-red-500 active:scale-95 shadow-lg shadow-red-600/20'
                                }`}
                        >
                            <TrendingUp size={16} /> Bid
                        </button>
                    </div>
                    {validationError && (
                        <p className="text-xs font-bold text-red-500 pl-2 animate-in fade-in">{validationError}</p>
                    )}
                </div>
            </div>

            <p className="text-[9px] text-center font-bold text-zinc-600 uppercase tracking-widest flex items-center justify-center gap-1 pt-2">
                <AlertCircle size={10} /> Konfirmasi Mutlak. Tawaran sah tidak dapat ditarik kembali.
            </p>

            {/* --- KLASEMEN & RIWAYAT (GRID) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-800/50">

                {/* Kolom 1: Leaderboard Top 3 */}
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-3 flex items-center gap-2">
                        <Trophy size={12} /> Top 3 Klasemen
                    </h4>
                    <div className="space-y-2">
                        {topBidders.length === 0 ? (
                            <p className="text-xs text-zinc-600 font-bold italic py-3 px-4 bg-zinc-900/30 rounded-lg border border-zinc-800/50">Masih kosong.</p>
                        ) : (
                            topBidders.map((bid: BidderHistory, index: number) => {
                                const medalColors = ['bg-yellow-500', 'bg-slate-300', 'bg-amber-700'];
                                const medalText = ['text-yellow-950', 'text-slate-900', 'text-amber-100'];
                                return (
                                    <div key={`top-${bid.userId}-${index}`} className={`flex justify-between items-center p-3 rounded-lg border ${index === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-900/50 border-zinc-800/50'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-sm ${medalColors[index]} ${medalText[index]}`}>
                                                #{index + 1}
                                            </span>
                                            <span className={`text-xs font-bold uppercase tracking-widest ${index === 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                                User {bid.userId.substring(0, 5)}
                                            </span>
                                        </div>
                                        <span className={`text-sm font-black tracking-wider ${index === 0 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                            {formatRupiah(bid.amount)}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Kolom 2: Live Log History */}
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                        <History size={12} /> Radar Transaksi (Live)
                    </h4>
                    <div className="space-y-2 max-h-[170px] overflow-y-auto pr-2 custom-scrollbar">
                        {recentHistory.length === 0 ? (
                            <p className="text-xs text-zinc-600 font-bold italic py-3 px-4 bg-zinc-900/30 rounded-lg border border-zinc-800/50">Menunggu pergerakan bid...</p>
                        ) : (
                            recentHistory.map((log: BidderHistory, idx: number) => {
                                const time = new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                return (
                                    <div key={`log-${log.timestamp}-${idx}`} className="flex justify-between items-center py-2 px-3 hover:bg-zinc-800/30 rounded-md transition-colors border-b border-zinc-800/50 last:border-0">
                                        <span className="text-[10px] text-zinc-500 font-mono">{time}</span>
                                        <span className="text-xs text-zinc-400 font-bold uppercase">U-{log.userId.substring(0, 4)}</span>
                                        <span className="text-xs text-white font-black">{formatRupiah(log.amount)}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
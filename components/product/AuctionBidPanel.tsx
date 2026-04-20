'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { formatRupiah } from '@/utils/format';
import { useAuctionSocket } from '@/hooks/useAuctionSocket';
import { toast } from 'sonner'; // Konsistensi menggunakan sonner
import { Gavel, Clock, AlertCircle, TrendingUp, Trophy } from 'lucide-react';

interface BidderHistory {
    userId: string;
    amount: number;
    timestamp: string;
    isWinner?: boolean;
}

interface AuctionBidPanelProps {
    auctionId: string;
    initialPrice: number;
    increment: number;
    endTime: string;
}

export default function AuctionBidPanel({
    auctionId,
    initialPrice,
    increment,
    endTime
}: AuctionBidPanelProps) {

    // 1. Delegasi Logika Jaringan ke Custom Hook (Decoupled & High Cohesion)
    const {
        currentPrice,
        highestBidders,
        isFrozen,
        isSyncing,
        socketError,
        submitBid
    } = useAuctionSocket({ auctionId, initialPrice });

    // 2. Local State Management
    const [cooldown, setCooldown] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<string>('--:--:--');
    const [isAuctionEnded, setIsAuctionEnded] = useState<boolean>(false);
    const [isBidding, setIsBidding] = useState<boolean>(false);

    // 3. Sistem Hitung Mundur (Countdown Timer)
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

    // 4. Sistem Cooldown Timer Lokal (Mencegah Spam Klik di sisi Klien)
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    // 5. Menangkap Error dari Socket (Jebakan Harga / Race Condition)
    useEffect(() => {
        if (socketError) {
            toast.error("Gagal melakukan penawaran", { description: socketError });
            setIsBidding(false);
            if (socketError.includes('meloncat')) {
                setCooldown(0); // Buka gembok cooldown agar user bisa langsung bid harga baru
            }
        }
    }, [socketError]);

    // 6. Eksekusi Bid (Payload Independen)
    const handlePlaceBid = useCallback(() => {
        if (cooldown > 0 || isFrozen || isAuctionEnded || isSyncing) return;

        setIsBidding(true);
        const expectedPrice = currentPrice + increment;

        // Lempar payload ke Socket.io (Murni nominal dan increment, ID diurus hook)
        submitBid(expectedPrice, increment);

        toast.success("Tawaran berhasil dikirim!", {
            description: `Anda menawar di angka ${formatRupiah(expectedPrice)}`
        });

        // Optimistic Lock 5 detik
        setCooldown(5);
        setTimeout(() => setIsBidding(false), 500);
    }, [cooldown, isFrozen, isAuctionEnded, isSyncing, currentPrice, increment, submitBid]);


    const isButtonDisabled = cooldown > 0 || isFrozen || isAuctionEnded || isBidding || isSyncing;

    return (
        <div className="w-full bg-[#111114] p-8 space-y-8">
            {/* HEAD: Status dan Timer */}
            <div className="flex justify-between items-start border-b border-zinc-800 pb-6">
                <div>
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Gavel size={12} /> Status Arena
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`relative flex h-3 w-3 ${isFrozen || isAuctionEnded || isSyncing ? 'hidden' : ''}`}>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span className="text-sm font-bold text-white uppercase tracking-wider">
                            {isAuctionEnded ? 'Berakhir' : isSyncing ? 'Menyinkronkan...' : isFrozen ? 'Masa Tenang...' : 'Sedang Berlangsung'}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-end gap-2">
                        <Clock size={12} /> Sisa Waktu
                    </h3>
                    <span className="font-mono text-2xl font-black text-red-500 tracking-tighter mt-1 block">
                        {timeLeft}
                    </span>
                </div>
            </div>

            {/* BODY: Harga Saat Ini */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-2xl flex flex-col items-center justify-center space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Highest Bid</span>
                <span key={currentPrice} className="text-5xl font-black text-white italic tracking-tighter animate-in zoom-in duration-300">
                    {formatRupiah(currentPrice)}
                </span>
            </div>

            {/* ACTION: Tombol Bid */}
            <div className="flex flex-col gap-3">
                <button
                    onClick={handlePlaceBid}
                    disabled={isButtonDisabled}
                    className={`
                        w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-200 shadow-xl
                        ${isButtonDisabled
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-white text-black hover:bg-[#ef3333] hover:text-white active:scale-[0.98] shadow-white/5 hover:shadow-red-600/20'
                        }
                    `}
                >
                    {isBidding ? (
                        <span>Memproses...</span>
                    ) : isSyncing ? (
                        <span>Menunggu Node...</span>
                    ) : isFrozen ? (
                        <span>Arena Dikunci</span>
                    ) : isAuctionEnded ? (
                        <span>Lelang Ditutup</span>
                    ) : cooldown > 0 ? (
                        <span>Cooldown: {cooldown}s</span>
                    ) : (
                        <>
                            <TrendingUp size={18} /> Bid +{formatRupiah(increment)}
                        </>
                    )}
                </button>
                <p className="text-[9px] text-center font-bold text-zinc-600 uppercase tracking-widest flex items-center justify-center gap-1">
                    <AlertCircle size={10} /> Konfirmasi Mutlak. Tidak bisa dibatalkan.
                </p>
            </div>

            {/* FOOTER: Histori Bidder */}
            <div className="pt-6 border-t border-zinc-800">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                    <Trophy size={12} /> Live Leaderboard
                </h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {highestBidders.length === 0 ? (
                        <p className="text-xs text-zinc-600 font-bold italic text-center py-4 bg-zinc-900/30 rounded-xl border border-zinc-800/50">Belum ada penawaran.</p>
                    ) : (
                        highestBidders.map((bid: BidderHistory, index: number) => (
                            <div
                                key={`${bid.userId}-${bid.timestamp}`}
                                className={`flex justify-between items-center p-3 rounded-xl border ${index === 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-900/30 border-zinc-800/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {index === 0 && (
                                        <span className="text-[9px] font-black bg-emerald-500 text-black px-2 py-0.5 rounded-sm uppercase tracking-widest">
                                            1ST
                                        </span>
                                    )}
                                    <span className={`text-xs font-bold uppercase tracking-widest ${index === 0 ? 'text-emerald-500' : 'text-zinc-400'}`}>
                                        User {bid.userId.substring(0, 5)}***
                                    </span>
                                </div>
                                <span className={`text-sm font-black tracking-wider ${index === 0 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                    {formatRupiah(bid.amount)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
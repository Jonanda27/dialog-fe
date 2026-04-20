'use client';

import React, { useState, useEffect, useCallback } from 'react';
// Asumsi Anda memiliki utility formatRupiah. Jika tidak, bisa gunakan Intl.NumberFormat bawaan JS
import { formatRupiah } from '@/utils/format';
// Hook ini akan kita buat di langkah selanjutnya
import { useAuctionSocket } from '@/hooks/useAuctionSocket';
// Asumsi menggunakan react-hot-toast atau sonner untuk notifikasi (standard industri)
import toast from 'react-hot-toast';

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

    // 1. Delegasi Logika Jaringan ke Custom Hook (Low Coupling)
    const {
        currentPrice,
        highestBidders,
        isFrozen,
        isSyncing, // ⚡ FIX: Ambil state isSyncing dari hook
        socketError,
        submitBid
    } = useAuctionSocket({ auctionId, initialPrice });

    // 2. Local State Management
    const [cooldown, setCooldown] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<string>('--:--:--');
    const [isAuctionEnded, setIsAuctionEnded] = useState<boolean>(false);
    const [isBidding, setIsBidding] = useState<boolean>(false); // Indikator loading saat klik

    // 3. Sistem Hitung Mundur (Countdown Timer)
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const distance = end - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft('LELANG BERAKHIR');
                setIsAuctionEnded(true);
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                // Format HH:MM:SS
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
            toast.error(socketError);
            setIsBidding(false);
            // Jika error karena 'Harga telah meloncat', batalkan cooldown agar user bisa klik lagi
            if (socketError.includes('meloncat')) {
                setCooldown(0);
            }
        }
    }, [socketError]);

    // 6. Eksekusi Bid (Information Expert: Tombol ini tahu harga ekspektasi)
    const handlePlaceBid = useCallback(() => {
        // ⚡ FIX: Cegah bid jika sedang syncing
        if (cooldown > 0 || isFrozen || isAuctionEnded || isSyncing) return;

        setIsBidding(true);
        const expectedPrice = currentPrice + increment;

        // Lempar payload ke Socket.io
        submitBid(expectedPrice, increment);

        // Langsung pasang cooldown lokal 5 detik (Optimistic Lock)
        setCooldown(5);

        // Matikan efek loading tombol setelah 500ms untuk ilusi kecepatan
        setTimeout(() => setIsBidding(false), 500);
    }, [cooldown, isFrozen, isAuctionEnded, isSyncing, currentPrice, increment, submitBid]);

    // ================== RENDERING UI ==================

    // ⚡ FIX: Tambahkan isSyncing sebagai kondisi disable tombol
    const isButtonDisabled = cooldown > 0 || isFrozen || isAuctionEnded || isBidding || isSyncing;

    return (
        <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-6">
            {/* HEAD: Status dan Timer */}
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Status Lelang</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`relative flex h-3 w-3 ${isFrozen || isAuctionEnded || isSyncing ? 'hidden' : ''}`}>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span className="font-bold text-gray-800">
                            {/* ⚡ FIX: Tambahkan label khusus saat sedang menunggu sinkronisasi Redis */}
                            {isAuctionEnded ? 'Berakhir' : isSyncing ? 'Menunggu Lelang...' : isFrozen ? 'Masa Tenang (Sinkronisasi...)' : 'Sedang Berlangsung'}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Sisa Waktu</h3>
                    <span className="font-mono text-xl font-bold text-red-600 tracking-tight">
                        {timeLeft}
                    </span>
                </div>
            </div>

            {/* BODY: Harga Saat Ini */}
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center space-y-1">
                <span className="text-sm text-gray-500 font-medium">Harga Tertinggi Saat Ini</span>
                {/* Animasi pulse saat harga berubah */}
                <span key={currentPrice} className="text-4xl font-extrabold text-gray-900 animate-pulse transition-all">
                    {formatRupiah(currentPrice)}
                </span>
            </div>

            {/* ACTION: Tombol Bid */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={handlePlaceBid}
                    disabled={isButtonDisabled}
                    className={`
                        w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200
                        ${isButtonDisabled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-black text-white hover:bg-gray-800 active:scale-[0.98] shadow-md hover:shadow-lg'
                        }
                    `}
                >
                    {isBidding ? (
                        <span>Memproses...</span>
                    ) : isSyncing ? (
                        /* ⚡ FIX: Tampilan tombol saat Redis belum siap */
                        <span>Menunggu Server...</span>
                    ) : isFrozen ? (
                        <span>Lelang Dikunci</span>
                    ) : cooldown > 0 ? (
                        <span>Tunggu {cooldown} Detik...</span>
                    ) : (
                        <>
                            <span>Bid +{formatRupiah(increment)}</span>
                        </>
                    )}
                </button>
                <p className="text-xs text-center text-gray-400">
                    Dengan menekan tombol bid, Anda setuju untuk membeli produk ini jika menang.
                </p>
            </div>

            {/* FOOTER: Histori Bidder */}
            <div className="pt-4 border-t">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Histori Penawaran (Live)</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {highestBidders.length === 0 ? (
                        <p className="text-sm text-gray-400 italic text-center py-4">Belum ada penawaran.</p>
                    ) : (
                        highestBidders.map((bid: BidderHistory, index: number) => (
                            <div
                                key={index}
                                className={`flex justify-between items-center p-2 rounded ${index === 0 ? 'bg-green-50 border border-green-100' : 'bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-2">
                                    {index === 0 && (
                                        <span className="text-xs font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
                                            Highest
                                        </span>
                                    )}
                                    <span className="text-sm font-medium text-gray-600">
                                        User {bid.userId.substring(0, 5)}***
                                    </span>
                                </div>
                                <span className={`text-sm font-bold ${index === 0 ? 'text-green-700' : 'text-gray-800'}`}>
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
import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { AuctionRealtimeState, BidderHistory } from '@/types/auction';

interface UseAuctionSocketProps {
    auctionId: string;
    initialPrice: number;
}

export function useAuctionSocket({ auctionId, initialPrice }: UseAuctionSocketProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const [auctionState, setAuctionState] = useState<AuctionRealtimeState>({
        currentPrice: initialPrice,
        topBidders: [],
        recentHistory: [],
        isFrozen: true,
        isOnCooldown: false,
        isSyncing: true,
        socketError: null,
        isConnected: false,
        isEnded: false,
    });

    const socketRef = useRef<Socket | null>(null);

    // ⚡ TAHAP 1 PERBAIKAN: Synchronous Lock untuk mengatasi Phantom Cooldown
    // Ref ini tidak merender ulang UI dan bekerja secara sinkron seketika.
    const isEmittingRef = useRef<boolean>(false);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!isAuthenticated || !token) return;

        const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        socketRef.current = io(`${socketUrl}/auction`, {
            auth: { token },
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        const socket = socketRef.current;

        // EVENT: Koneksi Berhasil
        socket.on('connect', () => {
            setAuctionState((prev: AuctionRealtimeState) => ({ ...prev, isConnected: true }));
            socket.emit('JOIN_AUCTION', { auctionId });
        });

        socket.on('disconnect', () => {
            setAuctionState((prev: AuctionRealtimeState) => ({ ...prev, isConnected: false }));
        });

        // EVENT: Sinkronisasi Awal
        socket.on('SYNC_AUCTION_STATE', (payload: any) => {
            setAuctionState((prev: AuctionRealtimeState) => {
                const isUninitialized = payload.currentPrice === 0;
                return {
                    ...prev,
                    currentPrice: isUninitialized ? prev.currentPrice : payload.currentPrice,
                    topBidders: payload.topBidders || [],
                    recentHistory: payload.recentHistory || [],
                    isFrozen: isUninitialized ? true : payload.isFrozen,
                    // Tetap baca cooldown dari BE, tapi jangan paksa false jika frontend sedang lock
                    isOnCooldown: isEmittingRef.current || payload.isOnCooldown || false,
                    isSyncing: isUninitialized,
                    socketError: null
                };
            });
        });

        // EVENT: Update State Terkini (Broadcast)
        socket.on('AUCTION_STATE_UPDATED', (payload: {
            auctionId: string;
            newPrice: number;
            winnerId: string;
            topBidders: BidderHistory[];
            recentLog: BidderHistory;
            timestamp: string;
        }) => {
            if (payload.auctionId === auctionId) {
                setAuctionState((prev: AuctionRealtimeState) => ({
                    ...prev,
                    currentPrice: payload.newPrice,
                    topBidders: payload.topBidders,
                    recentHistory: [payload.recentLog, ...prev.recentHistory].slice(0, 50),
                    isSyncing: false,
                    isFrozen: false,
                    socketError: null
                }));
            }
        });

        // EVENT: Lelang Berakhir
        socket.on('AUCTION_ENDED', (payload: { auctionId: string, finalPrice: number, winnerId: string }) => {
            if (payload.auctionId === auctionId) {
                setAuctionState((prev: AuctionRealtimeState) => ({
                    ...prev,
                    isFrozen: true,
                    isEnded: true,
                    currentPrice: payload.finalPrice
                }));
            }
        });

        // EVENT: Error Penawaran
        socket.on('BID_ERROR', (payload: { auctionId: string, message: string }) => {
            if (payload.auctionId === auctionId) {
                setAuctionState((prev: AuctionRealtimeState) => ({
                    ...prev,
                    socketError: payload.message,
                    isOnCooldown: false
                }));
                // Buka gembok sinkron jika ditolak BE agar user bisa langsung bid ulang
                isEmittingRef.current = false;

                setTimeout(() => {
                    setAuctionState((prev: AuctionRealtimeState) => ({ ...prev, socketError: null }));
                }, 3500);
            }
        });

        return () => {
            // ⚡ TAHAP 1 PERBAIKAN: Pemusnahan "Socket Zombie"
            // Jangan gunakan kondisi if (socket.connected). 
            // Matikan semua telinga (listener) dan panggil disconnect secara mutlak.
            if (socket) {
                socket.emit('LEAVE_AUCTION', { auctionId });
                socket.removeAllListeners();
                socket.disconnect();
            }
        };
    }, [auctionId, isAuthenticated]);

    // FUNGSI: Mengirim Penawaran (Dynamic Bid)
    const submitBid = useCallback((expectedPrice: number, minimumIncrement: number) => {
        // 1. Validasi Koneksi Dasar
        if (!socketRef.current?.connected) {
            setAuctionState((prev: AuctionRealtimeState) => ({ ...prev, socketError: 'Koneksi ke server terputus.' }));
            return;
        }

        // 2. ⚡ TAHAP 1 PERBAIKAN: Validasi Synchronous Lock (Bebas dari React Render Cycle)
        if (isEmittingRef.current) {
            setAuctionState((prev: AuctionRealtimeState) => ({ ...prev, socketError: 'Anda menekan terlalu cepat. Tunggu sebentar.' }));
            return;
        }

        // 3. Validasi State Reaktif (Satu Kali Panggil, tidak ada emit di dalamnya)
        let isValid = true;
        setAuctionState((prev: AuctionRealtimeState) => {
            if (prev.isSyncing) {
                isValid = false;
                return { ...prev, socketError: 'Menunggu sinkronisasi node lelang...' };
            }
            if (prev.isEnded) {
                isValid = false;
                return { ...prev, socketError: 'Lelang telah ditutup permanen.' };
            }
            if (prev.isFrozen) {
                isValid = false;
                return { ...prev, socketError: 'Lelang memasuki masa tenang/evaluasi.' };
            }
            if (prev.isOnCooldown) {
                isValid = false;
                return { ...prev, socketError: 'Sistem sedang memproses transaksi Anda sebelumnya.' };
            }

            // Jika semua valid, kunci UI (Optimistic UI)
            return { ...prev, isOnCooldown: true };
        });

        // 4. Eksekusi Jaringan (Jika Valid)
        if (isValid) {
            // Segera kunci ref sinkron
            isEmittingRef.current = true;

            // Lontarkan payload ke server
            socketRef.current.emit('SUBMIT_BID', {
                auctionId,
                expectedPrice,
                increment: minimumIncrement
            });

            // Buka gembok setelah 5 detik (Sesuai durasi LUA script BE)
            setTimeout(() => {
                isEmittingRef.current = false;
                setAuctionState((prev: AuctionRealtimeState) => ({ ...prev, isOnCooldown: false }));
            }, 5000);
        }

    }, [auctionId]);

    return {
        ...auctionState,
        submitBid
    };
}
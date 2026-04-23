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
                    isOnCooldown: payload.isOnCooldown || false,
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

                setTimeout(() => {
                    setAuctionState((prev: AuctionRealtimeState) => ({ ...prev, socketError: null }));
                }, 3500);
            }
        });

        return () => {
            if (socket.connected) {
                socket.emit('LEAVE_AUCTION', { auctionId });
                socket.disconnect();
            }
        };
    }, [auctionId, isAuthenticated]);

    // FUNGSI: Mengirim Penawaran (Dynamic Bid)
    const submitBid = useCallback((expectedPrice: number, minimumIncrement: number) => {
        if (!socketRef.current?.connected) {
            setAuctionState((prev: AuctionRealtimeState) => ({ ...prev, socketError: 'Koneksi ke server terputus.' }));
            return;
        }

        setAuctionState((prev: AuctionRealtimeState) => {
            if (prev.isSyncing) return { ...prev, socketError: 'Menunggu sinkronisasi node lelang...' };
            if (prev.isEnded) return { ...prev, socketError: 'Lelang telah ditutup permanen.' };
            if (prev.isFrozen) return { ...prev, socketError: 'Lelang memasuki masa tenang/evaluasi.' };
            if (prev.isOnCooldown) return { ...prev, socketError: 'Anda menekan terlalu cepat. Tunggu sebentar.' };

            socketRef.current?.emit('SUBMIT_BID', {
                auctionId,
                expectedPrice,
                increment: minimumIncrement
            });

            return { ...prev, isOnCooldown: true };
        });

        setTimeout(() => {
            setAuctionState((prev: AuctionRealtimeState) => ({ ...prev, isOnCooldown: false }));
        }, 5000);

    }, [auctionId]);

    return {
        ...auctionState,
        submitBid
    };
}
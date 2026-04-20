import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

// Mendefinisikan tipe data histori penawaran
export interface BidderHistory {
    userId: string;
    amount: number;
    timestamp: string;
    isWinner?: boolean;
}

interface UseAuctionSocketProps {
    auctionId: string;
    initialPrice: number;
}

interface AuctionState {
    currentPrice: number;
    highestBidders: BidderHistory[];
    isFrozen: boolean;
    isSyncing: boolean;
    socketError: string | null;
    isConnected: boolean;
    isEnded: boolean; // ⚡ NEW: Indikator lelang selesai mutlak
}

export function useAuctionSocket({ auctionId, initialPrice }: UseAuctionSocketProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const [auctionState, setAuctionState] = useState<AuctionState>({
        currentPrice: initialPrice,
        highestBidders: [],
        isFrozen: true,
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
            setAuctionState(prev => ({ ...prev, isConnected: true }));
            socket.emit('JOIN_AUCTION', { auctionId });
        });

        socket.on('disconnect', () => {
            setAuctionState(prev => ({ ...prev, isConnected: false }));
        });

        // EVENT: Sinkronisasi awal
        socket.on('SYNC_AUCTION_STATE', (payload: { currentPrice: number, winnerId: string, isFrozen: boolean }) => {
            setAuctionState(prev => {
                const isUninitialized = payload.currentPrice === 0;
                return {
                    ...prev,
                    currentPrice: isUninitialized ? prev.currentPrice : payload.currentPrice,
                    isFrozen: isUninitialized ? true : payload.isFrozen,
                    isSyncing: isUninitialized
                };
            });
        });

        // EVENT: Penawaran Tertinggi Baru
        socket.on('NEW_HIGHEST_BID', (payload: { auctionId: string, newPrice: number, winnerId: string, timestamp: string }) => {
            if (payload.auctionId === auctionId) {
                setAuctionState(prev => {
                    const newBidder: BidderHistory = {
                        userId: payload.winnerId,
                        amount: payload.newPrice,
                        timestamp: payload.timestamp
                    };

                    const updatedBidders = [newBidder, ...prev.highestBidders].slice(0, 10);

                    return {
                        ...prev,
                        currentPrice: payload.newPrice,
                        highestBidders: updatedBidders,
                        isSyncing: false,
                        isFrozen: false,
                        socketError: null
                    };
                });
            }
        });

        // EVENT: Lelang Berakhir (Sinyal dari Worker Python / Backend Node)
        socket.on('AUCTION_ENDED', (payload: { auctionId: string, finalPrice: number, winnerId: string }) => {
            if (payload.auctionId === auctionId) {
                setAuctionState(prev => ({
                    ...prev,
                    isFrozen: true,
                    isEnded: true,
                    currentPrice: payload.finalPrice
                }));
                // Catatan: Redirect atau notifikasi pemenang bisa di-handle di komponen UI 
                // dengan memonitor state isEnded ini.
            }
        });

        // EVENT: Error / Penolakan Penawaran
        socket.on('BID_ERROR', (payload: { auctionId: string, message: string }) => {
            if (payload.auctionId === auctionId) {
                setAuctionState(prev => ({ ...prev, socketError: payload.message }));
                setTimeout(() => {
                    setAuctionState(prev => ({ ...prev, socketError: null }));
                }, 3000);
            }
        });

        return () => {
            if (socket.connected) {
                socket.emit('LEAVE_AUCTION', { auctionId });
                socket.disconnect();
            }
        };
    }, [auctionId, isAuthenticated]);

    // FUNGSI: Mengirim Penawaran
    const submitBid = useCallback((expectedPrice: number, increment: number) => {
        if (!socketRef.current?.connected) {
            setAuctionState(prev => ({ ...prev, socketError: 'Koneksi ke server terputus.' }));
            return;
        }

        setAuctionState(prev => {
            if (prev.isSyncing) return { ...prev, socketError: 'Menunggu sinkronisasi node lelang...' };
            if (prev.isEnded) return { ...prev, socketError: 'Lelang telah ditutup permanen.' };
            if (prev.isFrozen) return { ...prev, socketError: 'Lelang memasuki masa tenang/evaluasi.' };

            socketRef.current?.emit('SUBMIT_BID', {
                auctionId,
                expectedPrice,
                increment
            });

            return prev;
        });

    }, [auctionId]);

    return {
        ...auctionState,
        submitBid
    };
}
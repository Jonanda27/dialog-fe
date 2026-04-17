import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

// Mendefinisikan tipe data untuk kepastian kompilasi (Type Safety)
interface BidderHistory {
    userId: string;
    amount: number;
    timestamp: string;
    isWinner?: boolean;
}

interface UseSellerAuctionSocketProps {
    auctionId: string;
    initialPrice: number;
}

interface SellerAuctionState {
    currentPrice: number;
    highestBidders: BidderHistory[];
    isFrozen: boolean;
    socketError: string | null;
    isConnected: boolean;
}

export function useSellerAuctionSocket({ auctionId, initialPrice }: UseSellerAuctionSocketProps) {
    // Menggunakan isAuthenticated sebagai trigger reaktivitas (sesuai arsitektur auth kita)
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // 1. Local State untuk di-consume oleh UI (Dashboard Monitor)
    const [auctionState, setAuctionState] = useState<SellerAuctionState>({
        currentPrice: initialPrice,
        highestBidders: [],
        isFrozen: false,
        socketError: null,
        isConnected: false,
    });

    // 2. Instance Socket persisten selama komponen hidup
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Mengambil token otorisasi langsung dari sumber kebenaran (localStorage)
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!isAuthenticated || !token) return;

        const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        // Inisialisasi koneksi
        socketRef.current = io(`${socketUrl}/auction`, {
            auth: {
                token: token
            },
            transports: ['websocket'], // Bypass long-polling untuk real-time murni
            reconnectionAttempts: 10,  // Upaya koneksi ulang lebih agresif untuk Seller Monitor
            reconnectionDelay: 1000,
        });

        const socket = socketRef.current;

        // EVENT: Koneksi Berhasil
        socket.on('connect', () => {
            console.log(`[SELLER SOCKET] Terhubung ke monitor lelang: ${auctionId}`);
            setAuctionState(prev => ({ ...prev, isConnected: true, socketError: null }));

            // Bergabung ke room sebagai observer
            socket.emit('JOIN_AUCTION', { auctionId });
        });

        // EVENT: Koneksi Terputus
        socket.on('disconnect', () => {
            console.warn(`[SELLER SOCKET] Terputus dari monitor lelang.`);
            setAuctionState(prev => ({ ...prev, isConnected: false }));
        });

        // EVENT: Error Koneksi
        socket.on('connect_error', (err) => {
            setAuctionState(prev => ({
                ...prev,
                socketError: 'Gagal terhubung ke server live feed. Mencoba kembali...'
            }));
        });

        // EVENT: Sinkronisasi Awal (Ketika Seller baru membuka halaman monitor)
        socket.on('SYNC_AUCTION_STATE', (payload: { currentPrice: number, winnerId: string, isFrozen: boolean }) => {
            setAuctionState(prev => ({
                ...prev,
                currentPrice: payload.currentPrice > 0 ? payload.currentPrice : prev.currentPrice,
                isFrozen: payload.isFrozen
            }));
        });

        // EVENT: Live Feed Bidders (Ketika ada Buyer yang menekan bid)
        socket.on('NEW_HIGHEST_BID', (payload: { auctionId: string, newPrice: number, winnerId: string, timestamp: string }) => {
            if (payload.auctionId === auctionId) {
                setAuctionState(prev => {
                    const newBidder: BidderHistory = {
                        userId: payload.winnerId,
                        amount: payload.newPrice,
                        timestamp: payload.timestamp
                    };

                    // Menyimpan 50 histori bid terbaru di layar Seller (Lebih banyak dari Buyer yang hanya 10)
                    const updatedBidders = [newBidder, ...prev.highestBidders].slice(0, 50);

                    return {
                        ...prev,
                        currentPrice: payload.newPrice,
                        highestBidders: updatedBidders
                    };
                });
            }
        });

        // CLEANUP: Mencegah Memory Leak saat Seller menutup halaman monitor
        return () => {
            if (socket.connected) {
                socket.emit('LEAVE_AUCTION', { auctionId });
                socket.disconnect();
            }
        };
    }, [auctionId, isAuthenticated]);

    // PERHATIKAN: Hook ini secara sengaja TIDAK mengembalikan fungsi submitBid().
    // Ini mengunci komponen frontend secara arsitektural agar Seller tidak bisa melakukan aksi write.

    return {
        ...auctionState
    };
}
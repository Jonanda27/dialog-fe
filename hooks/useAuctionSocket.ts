import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
// Asumsi Anda menggunakan zustand authStore atau utility cookies untuk mengambil token
import { useAuthStore } from '@/store/authStore';

// Mendefinisikan tipe data untuk kepastian kompilasi (Type Safety)
interface BidderHistory {
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
    isSyncing: boolean; // ⚡ FIX: Flag baru untuk melacak apakah Worker sudah mengaktifkan lelang di Redis
    socketError: string | null;
    isConnected: boolean;
}

export function useAuctionSocket({ auctionId, initialPrice }: UseAuctionSocketProps) {
    // Gunakan isAuthenticated sebagai trigger agar socket tidak mencoba koneksi sebelum user divalidasi
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // 1. Local State untuk di-consume oleh UI
    const [auctionState, setAuctionState] = useState<AuctionState>({
        currentPrice: initialPrice,
        highestBidders: [],
        isFrozen: true, // ⚡ FIX: Default true, kunci interaksi sampai ada kepastian data dari Socket
        isSyncing: true, // ⚡ FIX: Default true, asumsikan sedang mengambil/menunggu data Redis
        socketError: null,
        isConnected: false,
    });

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Ambil token langsung dari persistence layer (localStorage)
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        // Jika user belum login atau token tidak ada, batalkan inisialisasi socket
        if (!isAuthenticated || !token) return;

        // Inisialisasi koneksi ke namespace /auction
        const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        socketRef.current = io(`${socketUrl}/auction`, {
            auth: {
                token: token // Token berhasil disuntikkan secara aman
            },
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        const socket = socketRef.current;

        // EVENT: Koneksi Berhasil
        socket.on('connect', () => {
            setAuctionState(prev => ({ ...prev, isConnected: true }));

            // Langsung otomatis bergabung ke room produk ini
            socket.emit('JOIN_AUCTION', { auctionId });
        });

        // EVENT: Koneksi Terputus
        socket.on('disconnect', () => {
            setAuctionState(prev => ({ ...prev, isConnected: false }));
        });

        // EVENT: Sinkronisasi awal saat baru bergabung (Mencegah user melihat harga usang)
        socket.on('SYNC_AUCTION_STATE', (payload: { currentPrice: number, winnerId: string, isFrozen: boolean }) => {

            // ⚡ TAMBAHKAN BARIS INI: Cek apa yang diterima komponen
            console.log('[FE DEBUG] Menerima event SYNC_AUCTION_STATE dari server:', payload);
            setAuctionState(prev => {
                // ⚡ FIX: Deteksi apakah state lelang di Redis sudah ada (Diinisialisasi Worker)
                const isUninitialized = payload.currentPrice === 0;

                return {
                    ...prev,
                    // Tetap pertahankan initialPrice dari DB untuk pajangan visual, tapi jangan timpa jika 0
                    currentPrice: isUninitialized ? prev.currentPrice : payload.currentPrice,
                    // Paksa Freeze jika Worker belum menyala, jika sudah menyala ikuti payload
                    isFrozen: isUninitialized ? true : payload.isFrozen,
                    // Indikator ke UI untuk mengubah tombol menjadi "Menunggu Sinkronisasi..." 
                    // atau mendisable tombol bid.
                    isSyncing: isUninitialized
                };
            });
        });

        // EVENT: Ada bid baru yang sah dari siapapun (termasuk diri sendiri)
        socket.on('NEW_HIGHEST_BID', (payload: { auctionId: string, newPrice: number, winnerId: string, timestamp: string }) => {
            if (payload.auctionId === auctionId) {
                setAuctionState(prev => {
                    const newBidder: BidderHistory = {
                        userId: payload.winnerId,
                        amount: payload.newPrice,
                        timestamp: payload.timestamp
                    };

                    // Menyimpan maksimal 10 histori bid terbaru di memori browser agar tidak membebani RAM client
                    const updatedBidders = [newBidder, ...prev.highestBidders].slice(0, 10);

                    return {
                        ...prev,
                        currentPrice: payload.newPrice,
                        highestBidders: updatedBidders,
                        isSyncing: false, // Jika sudah ada pergerakan, dipastikan sinkron
                        isFrozen: false,
                        socketError: null // Reset error jika ada update harga sukses
                    };
                });
            }
        });

        // EVENT: Error spesifik (Cooldown atau Race Condition)
        socket.on('BID_ERROR', (payload: { auctionId: string, message: string }) => {
            if (payload.auctionId === auctionId) {
                setAuctionState(prev => ({ ...prev, socketError: payload.message }));

                // Hapus pesan error setelah 3 detik agar toast/UI tidak terus-terusan merah
                setTimeout(() => {
                    setAuctionState(prev => ({ ...prev, socketError: null }));
                }, 3000);
            }
        });

        // CLEANUP FUNCTION: Menjamin tidak ada memory leak atau koneksi menggantung saat user pindah halaman
        return () => {
            if (socket.connected) {
                socket.emit('LEAVE_AUCTION', { auctionId });
                socket.disconnect();
            }
        };
    }, [auctionId, isAuthenticated]); // Re-run effect jika pindah produk lelang atau token berubah

    // 3. Fungsi Publisher (Controller Action)
    const submitBid = useCallback((expectedPrice: number, increment: number) => {
        if (!socketRef.current?.connected) {
            setAuctionState(prev => ({ ...prev, socketError: 'Gagal terhubung ke server lelang. Periksa koneksi Anda.' }));
            return;
        }

        // ⚡ FIX: Tambahkan layer proteksi di klien agar tidak mem-bypass UI state
        setAuctionState(prev => {
            if (prev.isSyncing) {
                return { ...prev, socketError: 'Mohon tunggu, sedang menunggu sinkronisasi dari server.' };
            }

            if (prev.isFrozen) {
                return { ...prev, socketError: 'Lelang sedang dalam masa tenang atau telah berakhir.' };
            }

            // Lolos pengecekan klien, tembak ke Redis
            socketRef.current?.emit('SUBMIT_BID', {
                auctionId,
                expectedPrice,
                increment
            });

            return prev;
        });

    }, [auctionId]);

    // Mengembalikan properti yang telah diekstrak (Destructured) untuk kemudahan integrasi di UI
    return {
        ...auctionState,
        submitBid
    };
}
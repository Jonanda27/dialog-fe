// types/auction.ts

// Disesuaikan dengan ENUM di backend PostgreSQL
export type AuctionStatus =
    | 'DRAFT'
    | 'SCHEDULED'
    | 'ACTIVE'
    | 'FREEZE'
    | 'EVALUATION'
    | 'COMPLETED'
    | 'HANDOVER_TO_RUNNER_UP'
    | 'FAILED'
    | 'CANCELLED';

// Interface untuk menangani relasi galeri media lelang
export interface AuctionMedia {
    id?: string;
    auction_id?: string;
    media_url: string;
    is_primary: boolean;
    created_at?: string;
    updated_at?: string;
}

// ⚡ BARU: Kontrak untuk History Transaksi Bid (List Redis) & Leaderboard (ZSET Redis)
export interface BidderHistory {
    userId: string;
    amount: number;
    timestamp: string;
    isWinner?: boolean;
}

// ⚡ BARU: Kontrak State Websocket Murni (Single Source of Truth)
// Digunakan oleh useAuctionSocket untuk menelan payload utuh dari server
export interface AuctionRealtimeState {
    currentPrice: number;
    topBidders: BidderHistory[]; // Top 3 Klasemen Tertinggi
    recentHistory: BidderHistory[]; // Running text / Log mikro-transaksi
    isFrozen: boolean;
    isOnCooldown: boolean;
    isSyncing: boolean;
    socketError: string | null;
    isConnected: boolean;
    isEnded: boolean;
}

export interface Auction {
    id: string;
    store_id: string; // Representasi kepemilikan toko
    item_name: string;
    description: string;
    condition: 'NEW' | 'USED';

    // Atribut fisik & logistik (Krusial untuk worker/order kalkulasi ongkir)
    weight: number;
    length: number;
    width: number;
    height: number;

    winner_id?: string;
    start_price?: number;
    increment: number; // ⚡ SEMANTIK BARU: Bertindak sebagai Bare Minimum Increment
    current_price: number;
    start_time: string;
    end_time: string;
    status: AuctionStatus;

    media: AuctionMedia[]; // Inject relasi galeri media

    // Opsional: Untuk eager loading data entitas Toko di halaman Publik
    store?: {
        id: string;
        store_name: string;
        city?: string;
        province?: string;
        description?: string;
    };

    created_at?: string;
    updated_at?: string;
}

/**
 * Interface mendeskripsikan state formulir pembuatan lelang di sisi Frontend.
 * Saat dikirim ke API, wajib dikonversi menjadi FormData.
 */
export interface CreateAuctionFormState {
    item_name: string;
    description: string;
    condition: 'NEW' | 'USED';
    weight: number;
    length: number;
    width: number;
    height: number;
    start_price: number;
    increment: number; // Input untuk Minimum Increment
    start_time: string;
    end_time: string;
    photos: File[];
}
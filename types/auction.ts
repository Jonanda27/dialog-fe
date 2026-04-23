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
export interface AuctionRealtimeState {
    currentPrice: number;
    topBidders: BidderHistory[];
    recentHistory: BidderHistory[];
    isFrozen: boolean;
    isOnCooldown: boolean;
    isSyncing: boolean;
    socketError: string | null;
    isConnected: boolean;
    isEnded: boolean;
}

export interface Auction {
    id: string;
    store_id: string;
    item_name: string;
    description: string;
    condition: 'NEW' | 'USED';

    // Atribut fisik & logistik
    weight: number;
    length: number;
    width: number;
    height: number;

    winner_id?: string;
    start_price?: number;
    increment: number; // ⚡ SEMANTIK BARU: Bare Minimum Increment
    current_price: number;
    start_time: string;
    end_time: string;
    status: AuctionStatus;

    media: AuctionMedia[];

    // Eager loading data Toko (Opsional untuk Buyer Dashboard)
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

export interface AuctionBid {
    id: string;
    auction_id: string;
    buyer_id: string;
    bid_amount: number;
    created_at: string;
}

export interface CreateAuctionFormState {
    item_name: string;
    description: string;
    condition: 'NEW' | 'USED';
    weight: number;
    length: number;
    width: number;
    height: number;
    start_price: number;
    increment: number;
    start_time: string;
    end_time: string;
    photos: File[];
}
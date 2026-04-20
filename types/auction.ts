// Impor Product dihapus karena entitas Lelang kini berdiri secara independen (Decoupled)

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

// Interface baru untuk menangani relasi galeri media lelang
export interface AuctionMedia {
    id?: string;
    auction_id?: string;
    media_url: string;
    is_primary: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Auction {
    id: string;
    store_id: string; // Menggantikan product_id dan merepresentasikan kepemilikan toko
    item_name: string;
    description: string;
    condition: 'NEW' | 'USED';

    // Atribut fisik & logistik (Krusial untuk worker/order kalkulasi ongkir)
    weight: number;
    length: number;
    width: number;
    height: number;

    winner_id?: string;
    start_price?: number; // Opsional di response, namun berguna untuk komputasi frontend
    increment: number;
    current_price: number;
    start_time: string;
    end_time: string;
    status: AuctionStatus;

    media: AuctionMedia[]; // Inject relasi galeri media

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

/**
 * Interface ini mendeskripsikan state formulir pembuatan lelang di sisi Frontend.
 * Catatan: Saat mengirim ke API, objek ini HARUS dikonversi menjadi FormData 
 * karena properti 'photos' mengandung berkas fisik (File[]).
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
    increment: number;
    start_time: string;
    end_time: string;
    photos: File[]; // Akan di-append ke dalam FormData
}
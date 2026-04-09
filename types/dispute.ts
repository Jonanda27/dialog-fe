// File: dialog-fe/types/dispute.ts

import { Order } from './order';
import { User } from './auth';
import { Store } from './store';

/**
 * Literal Type untuk status sengketa
 */
export type DisputeStatus = 'open' | 'resolved';

/**
 * Literal Type untuk keputusan final dari Admin (Sesuai skenario di BE)
 * - refund_full: Buyer menang, uang kembali penuh, barang diretur/dibatalkan.
 * - reject_buyer: Seller menang, uang diteruskan ke Seller.
 * - refund_partial: Win-Win solution, sebagian uang dikembalikan ke Buyer, sisanya ke Seller.
 */
export type ResolutionType = 'refund_full' | 'reject_buyer' | 'refund_partial';

/**
 * Representasi tabel DisputeMedia di Database (Bukti foto/video)
 */
export interface DisputeMedia {
    id: string;
    dispute_id: string;
    uploader_id: string;
    media_url: string;
    created_at: string;
}

/**
 * Representasi tabel Disputes di Database (Entitas Utama)
 */
export interface Dispute {
    id: string;
    order_id: string;
    buyer_id: string;
    store_id: string;
    reason: string;
    status: DisputeStatus;
    admin_decision_notes?: string | null;
    created_at: string;
    updated_at: string;

    // Relasi Opsional (Eager Loading)
    order?: Order;
    buyer?: Pick<User, 'id' | 'name' | 'email'>;
    store?: Pick<Store, 'id' | 'name'>;
    media?: DisputeMedia[];
}

/**
 * Payload yang dikirim FE (Buyer) saat mengajukan komplain/sengketa.
 * Menggunakan array of File karena akan dikonversi ke FormData (Multipart).
 */
export interface OpenDisputePayload {
    order_id: string;
    reason: string;
    evidences?: File[]; // File bukti foto/video (Opsional tergantung kebijakan)
}

/**
 * Payload yang dikirim FE (Admin) saat memberikan keputusan final.
 */
export interface ResolveDisputePayload {
    resolution_type: ResolutionType;
    admin_notes: string;
    refund_amount?: number; // Wajib diisi jika resolution_type === 'refund_partial'
}
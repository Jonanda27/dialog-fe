// File: dialog-fe/types/grading.ts

import { Product } from './product';
import { User } from './auth';

/**
 * Literal Type untuk status permintaan video detail
 * Diperbarui untuk mengakomodasi State Machine Anti-Spam dan Escrow
 */
export type GradingStatus =
    | 'requested'             // Legacy
    | 'fulfilled'             // Legacy
    | 'cancelled'             // Legacy
    | 'AWAITING_SELLER_MEDIA' // Fase 1: Menunggu penjual unggah video
    | 'MEDIA_READY'           // Fase 2: Video siap, menunggu pembeli checkout
    | 'EXPIRED'               // Fase 3: Tiket hangus (Cronjob 3x24 Jam)
    | 'SYSTEM_CANCELLED';     // Fase 3: Resolusi Race Condition (Barang Sold Out)

/**
 * Representasi tabel GradingRequests di Database
 */
export interface GradingRequest {
    id: string;
    buyer_id: string;
    product_id: string;
    status: GradingStatus;
    video_url?: string | null;
    created_at: string;
    updated_at: string;

    // Relasi (Eager Loading)
    product?: Product;
    buyer?: Pick<User, 'id' | 'full_name'>;
}

/**
 * Payload saat Buyer menekan tombol "Minta Video Fisik"
 */
export interface RequestGradingPayload {
    product_id: string;
}

/**
 * Payload State untuk form upload Video Grading oleh Penjual
 * (Akan dikonversi ke FormData di Service)
 */
export interface FulfillGradingPayload {
    video_file: File | null;
}
// File: dialog-fe/types/grading.ts

import { Product } from './product';
import { User } from './auth';

/**
 * Literal Type untuk status permintaan video detail
 */
export type GradingStatus = 'requested' | 'fulfilled';

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
    buyer?: Pick<User, 'id' | 'name'>;
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
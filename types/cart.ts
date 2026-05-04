// File: dialog-id-fe/types/cart.ts

import { Product } from './product';
import { GradingStatus } from './grading';

export interface CartItem {
    id: string;          // ID unik dari tabel 'carts' di database
    user_id: string;     // ID user pemilik keranjang
    product_id: string;  // ID produk terkait
    cart_item_id: string; // Alias ID unik (konsisten dengan logic FE Anda) 
    product: Product;    // Data produk lengkap hasil eager loading dari backend 
    quantity: number;    // Jumlah produk yang dipesan 

    // ⚡ GRADING TRACKING: Link ke GradingRequest jika ada 
    grading_request_id?: string;        // ID grading request (jika ada) 
    grading_status?: GradingStatus;     // Status terkini dari grading 
    requires_grading?: boolean;         // Flag apakah item memerlukan grading sebelum checkout 
    
    created_at?: string;
    updated_at?: string;
}

/**
 * Payload untuk menambah produk ke database
 */
export interface AddToCartPayload {
    product_id: string;
    quantity: number;
}

/**
 * Payload untuk update kuantitas di database
 */
export interface UpdateCartQtyPayload {
    quantity: number;
}
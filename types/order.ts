// File: dialog-fe/types/order.ts

import { Product } from './product';
import { User } from './auth';
import { UserBankAccount } from './userBank';

/**
 * Literal Type untuk State Machine Status Pesanan.
 * Digunakan untuk validasi alur transaksi dan rendering UI Status Badge.
 */
export type OrderStatus =
    | 'pending_payment' // Menunggu pembayaran dari buyer
    | 'paid'            // Pembayaran berhasil, menunggu konfirmasi seller
    | 'processing'      // Sedang diproses/dipacking oleh seller
    | 'shipped'         // Dalam pengiriman (Resi sudah diinput)
    | 'delivered'       // Barang sudah sampai di tujuan
    | 'completed'       // Transaksi selesai (Dana diteruskan ke seller)
    | 'cancelled'       // Pesanan dibatalkan
    | 'disputed';       // Terjadi komplain/dispute

/**
 * Representasi item di dalam pesanan (OrderItems).
 * Menggunakan string untuk price_at_purchase untuk menjaga presisi desimal dari DB.
 */
export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    qty: number;
    price_at_purchase: string | number;

    // Grading diambil secara dinamis dari metadata produk saat transaksi terjadi
    grading_at_purchase: string;

    // ⚡ INJEKSI BARU: Biaya add-on video detail (Premium Verification)
    // Diisi secara otomatis oleh Backend (Server-side calculation) saat checkout
    grading_fee: string | number;

    created_at: string;

    // Relasi opsional untuk detail item di UI
    product?: Product;
}

/**
 * Entitas Utama Pesanan (Orders).
 */
export interface Order {
    id: string;
    billing_id?: string | null;
    buyer_id: string;
    store_id: string;
    subtotal: string | number;
    shipping_fee: string | number;
    grading_fee: string | number;
    grand_total: string | number;
    status: OrderStatus;
    shipping_address: string;
    tracking_number?: string | null;

    // Field logistik sesuai migrasi database Backend
    courier_company?: string;
    service_type?: string;

    created_at: string;
    updated_at: string;

    // Relasi Eager Loading
    buyer?: Pick<User, 'id' | 'full_name' | 'email'>;
    items?: OrderItem[];

    // Relasi tambahan jika diperlukan untuk UI (opsional)
    store?: {
        id: string;
        name: string;
        location: string;
    };
}

/**
 * Interface untuk DTO (Data Transfer Object) item keranjang saat checkout.
 * Backend membutuhkan pasangan ID Produk dan Kuantitas untuk validasi stok dan harga.
 */
export interface CheckoutItemPayload {
    product_id: string;
    qty: number;
}

/**
 * Payload untuk eksekusi Checkout (POST /api/orders/checkout).
 * Disinkronkan 100% menggunakan strict snake_case agar lolos validasi Zod Backend.
 */
export interface CheckoutPayload {
    address_id: string;
    store_id: string;

    items: CheckoutItemPayload[];

    // Field MANDATORY untuk validasi internal (Server-side calc) dan integrasi resi Biteship
    shipping_fee: number;
    courier_code: string;
    service_type: string;

    payment_method?: string;
}

/**
 * Payload untuk input resi oleh Seller.
 */
export interface ShipOrderPayload {
    tracking_number: string;
}

export interface OrderAdminResponse {
    id: string;
    buyer_id: string;
    store_id: string;
    subtotal: number | string;
    shipping_fee: number | string;
    grading_fee: number | string;
    grand_total: number | string;
    status: OrderStatus;
    shipping_address: string;
    tracking_number?: string | null;
    createdAt: string;
    updated_at: string;
    // Eager Loaded Data dari Backend baru
    buyer: {
        id: string;
        full_name: string;
        email: string;
        
    };
    store: {
        id: string;
        name: string;
    };
    items: OrderItem[];
}

// Tambahkan interface baru untuk grup per toko
export interface StoreOrderPayload {
    store_id: string;
    items: CheckoutItemPayload[];
    shipping_fee: number;
    courier_code: string;
    service_type: string;
    grading_fee?: number;
}

/**
 * Payload untuk eksekusi Checkout (POST /api/orders/checkout).
 * Mendukung Single Billing untuk Multiple Stores.
 */
export interface CheckoutPayload {
    address_id: string;
    // ⚡ PERBAIKAN: Sekarang menggunakan array 'orders'
    orders: StoreOrderPayload[];
}

// Tambahkan interface untuk menangkap response Billing
export interface CheckoutResponse {
    billing_id: string;
    grand_total: number;
    order_count: number;
    orders: any[];
}

export interface OrderRefundInfo {
    id: string;
    grand_total: number;
    status: string;
    created_at: string;
    updated_at: string;
    escrow: {
        id: string;
        amount_held: number;
        status: string;
        updated_at: string;
    };
    buyer: {
        id: string;
        full_name: string;
        email: string;
        bankAccounts: UserBankAccount[];
    };
    store: {
        id: string;
        name: string;
    };
}
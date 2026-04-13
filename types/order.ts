import { Product } from './product';
import { User } from './auth'; // Pastikan interface User di auth.ts sudah memiliki atribut 'full_name'

/**
 * Literal Type untuk State Machine Status Pesanan
 */
export type OrderStatus =
    | 'pending_payment'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'completed'
    | 'cancelled';

/**
 * Representasi tabel OrderItems di Database
 */
export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    qty: number;
    price_at_purchase: string | number;

    // ⚡ PERBAIKAN: Diubah dari Enum statis menjadi string bebas, 
    // karena datanya diambil secara dinamis dari JSONB Metadata
    grading_at_purchase: string;

    created_at: string;

    // Relasi opsional jika endpoint menyertakan data produk
    product?: Product;
}

/**
 * Representasi tabel Orders di Database (Entitas Utama)
 */
export interface Order {
    id: string;
    buyer_id: string;
    store_id: string;
    subtotal: string | number;
    shipping_fee: string | number;
    grading_fee: string | number;
    grand_total: string | number;
    status: OrderStatus;
    shipping_address: string;
    tracking_number?: string | null;
    created_at: string;
    updated_at: string;

    // Relasi (Eager Loading)
    // ⚡ PERBAIKAN: Menggunakan 'full_name' sesuai dengan skema Backend
    buyer?: Pick<User, 'id' | 'full_name' | 'email'>;
    items?: OrderItem[];
}

/**
 * Item spesifik di dalam keranjang belanja saat Checkout
 */
export interface CheckoutItem {
    product_id: string;
    qty: number;
}

/**
 * Payload yang dikirim FE saat mengeksekusi Checkout (POST /api/orders/checkout)
 */
export interface CheckoutPayload {
    items: CheckoutItem[];
    shipping_address: string;

    // ⚡ BARU: Ditambahkan agar Backend tau hasil akhir kalkulasi kurir yang dipilih pembeli
    shipping_fee: number;
}

/**
 * Payload yang dikirim FE (Seller) saat menginput nomor resi (PATCH /api/orders/:id/ship)
 */
export interface ShipOrderPayload {
    tracking_number: string;
}
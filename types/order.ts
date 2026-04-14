import { Product } from './product';
import { User } from './auth';

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

    created_at: string;

    // Relasi opsional untuk detail item di UI
    product?: Product;
}

/**
 * Entitas Utama Pesanan (Orders).
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

    // Relasi Eager Loading
    // Menggunakan 'full_name' sesuai identitas user di sistem
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
 * Payload untuk eksekusi Checkout (POST /api/orders/checkout).
 */
export interface CheckoutPayload {
    address_id: string;
    store_id: string;
    cart_item_ids: string[];
    shipping_fee: number;
    // Field MANDATORY baru untuk integrasi resi Biteship di backend
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
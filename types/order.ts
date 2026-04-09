// File: dialog-fe/types/order.ts

import { Product, ProductGrading } from './product';
import { User } from './auth';

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
    grading_at_purchase: ProductGrading;
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
    buyer?: Pick<User, 'id' | 'name' | 'email'>; // Pick = hanya mengambil atribut tertentu dari interface User
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
 * Payload yang dikirim FE saat mengeksekusi Checkout
 */
export interface CheckoutPayload {
    items: CheckoutItem[];
    shipping_address: string;
}

/**
 * Payload yang dikirim FE (Seller) saat menginput nomor resi
 */
export interface ShipOrderPayload {
    tracking_number: string;
}
import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import {
    Order,
    CheckoutPayload,
    ShipOrderPayload
} from '../../types/order';

export const OrderService = {
    /**
     * [BUYER] Melakukan checkout keranjang belanja.
     * Akan memotong stok, membuat tagihan, dan menahan dana di Escrow.
     */
    checkout: async (payload: CheckoutPayload): Promise<ApiResponse<{ order_id: string, grand_total: number }>> => {
        return await axiosClient.post<any, ApiResponse<{ order_id: string, grand_total: number }>>('/orders/checkout', payload);
    },

    /**
     * [BUYER/SELLER] Mengambil detail pesanan spesifik.
     * Sangat dibutuhkan untuk halaman Pembayaran dan Invoice.
     */
    getById: async (orderId: string): Promise<ApiResponse<Order>> => {
        return await axiosClient.get<any, ApiResponse<Order>>(`/orders/${orderId}`);
    },

    /**
     * [BUYER] Mengambil riwayat pesanan milik pembeli yang sedang login.
     */
    getBuyerOrders: async (status?: string): Promise<ApiResponse<Order[]>> => {
        return await axiosClient.get<any, ApiResponse<Order[]>>('/orders/my-orders', {
            params: status ? { status } : undefined
        });
    },

    /**
     * [SELLER] Mengambil daftar pesanan yang masuk ke toko.
     */
    getStoreOrders: async (status?: string): Promise<ApiResponse<Order[]>> => {
        return await axiosClient.get<any, ApiResponse<Order[]>>('/orders/store', {
            params: status ? { status } : undefined
        });
    },

    /**
     * [SELLER] Menginput nomor resi untuk pesanan yang sudah dibayar.
     * ⚡ PERBAIKAN: Menggunakan PATCH sesuai standar RESTful dan rute Backend kita.
     */
    shipOrder: async (orderId: string, payload: ShipOrderPayload): Promise<ApiResponse<Order>> => {
        return await axiosClient.patch<any, ApiResponse<Order>>(`/orders/${orderId}/ship`, payload);
    },

    /**
     * [BUYER] Menyelesaikan pesanan setelah barang diterima.
     * ⚡ PERBAIKAN: Menggunakan POST sesuai rute Backend (karena memicu transaksi pelepasan Escrow).
     */
    completeOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
        return await axiosClient.post<any, ApiResponse<Order>>(`/orders/${orderId}/complete`);
    }
};
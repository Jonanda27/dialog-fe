import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import {
    Order,
    CheckoutPayload,
    ShipOrderPayload,
    OrderAdminResponse,
    CheckoutResponse
} from '../../types/order';

export const OrderService = {
    /**
     * [BUYER] Melakukan checkout keranjang belanja.
     * Operasi ini bersifat atomik di backend: memotong stok, membuat tagihan, dan menyiapkan Escrow.
     */
checkout: async (payload: CheckoutPayload): Promise<ApiResponse<CheckoutResponse>> => {
    return await axiosClient.post<any, ApiResponse<CheckoutResponse>>('/orders/checkout', payload);
},

    /**
     * [BUYER/SELLER] Mengambil detail pesanan spesifik.
     * Sangat dibutuhkan untuk polling status di halaman Pembayaran dan Invoice.
     */
    getById: async (orderId: string): Promise<ApiResponse<Order>> => {
        return await axiosClient.get<any, ApiResponse<Order>>(`/orders/${orderId}`);
    },

    /**
     * [BUYER] Mengambil riwayat pesanan milik pembeli yang sedang login.
     * Mendukung filter status untuk tab navigasi UI (Misal: "Belum Bayar", "Dikirim").
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
     * Menggunakan PATCH karena kita hanya memperbarui satu entitas spesifik (tracking_number) dan memicu transisi state.
     */
    shipOrder: async (orderId: string, payload: ShipOrderPayload): Promise<ApiResponse<Order>> => {
        return await axiosClient.patch<any, ApiResponse<Order>>(`/orders/${orderId}/ship`, payload);
    },

    /**
     * [BUYER] Menyelesaikan pesanan setelah barang diterima dan divalidasi pembeli.
     * Menggunakan POST karena operasi ini memicu action bisnis krusial (pelepasan dana Escrow ke saldo Seller).
     */
    completeOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
        return await axiosClient.post<any, ApiResponse<Order>>(`/orders/${orderId}/complete`);
    },

    getAllOrdersForAdmin: async (status?: string): Promise<ApiResponse<OrderAdminResponse[]>> => {
        return await axiosClient.get<any, ApiResponse<OrderAdminResponse[]>>('/orders/admin/all', {
            params: status ? { status } : undefined
        });
    }
};
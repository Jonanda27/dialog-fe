// File: dialog-fe/services/api/order.service.ts

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
     * @param payload Daftar item dan alamat pengiriman
     */
    checkout: async (payload: CheckoutPayload): Promise<ApiResponse<{ order_id: string, grand_total: number }>> => {
        return await axiosClient.post<any, ApiResponse<{ order_id: string, grand_total: number }>>('/orders/checkout', payload);
    },

    /**
     * [SELLER] Mengambil daftar pesanan yang masuk ke toko.
     * @param status Opsional: filter berdasarkan status (misal: 'paid', 'shipped', 'completed')
     */
    getStoreOrders: async (status?: string): Promise<ApiResponse<Order[]>> => {
        return await axiosClient.get<any, ApiResponse<Order[]>>('/orders/store', {
            params: status ? { status } : undefined
        });
    },

    /**
     * [SELLER] Menginput nomor resi untuk pesanan yang sudah dibayar.
     * Akan mengubah status pesanan menjadi 'shipped'.
     * @param orderId ID dari pesanan
     * @param payload Nomor resi (tracking_number)
     */
    shipOrder: async (orderId: string, payload: ShipOrderPayload): Promise<ApiResponse<Order>> => {
        // Sesuai dengan rute BE: PUT /orders/:id/ship
        return await axiosClient.put<any, ApiResponse<Order>>(`/orders/${orderId}/ship`, payload);
    },

    /**
     * [BUYER] Menyelesaikan pesanan setelah barang diterima.
     * Transaksi ini sangat krusial karena akan merilis dana Escrow ke dompet Seller.
     * @param orderId ID dari pesanan
     */
    completeOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
        // Sesuai dengan rute BE: PUT /orders/:id/complete
        return await axiosClient.put<any, ApiResponse<Order>>(`/orders/${orderId}/complete`);
    }
};
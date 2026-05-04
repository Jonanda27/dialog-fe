// File: dialog-id-fe/services/api/cart.service.ts

import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/api';
import { CartItem, AddToCartPayload, UpdateCartQtyPayload } from '@/types/cart';

export const CartService = {
    /**
     * Mengambil seluruh isi keranjang milik user yang sedang login
     * Endpoint: GET /api/v1/cart
     */
    getMyCart: async (): Promise<ApiResponse<CartItem[]>> => {
        return await axiosClient.get('/v1/cart');
    },

    /**
     * Menambahkan produk ke dalam keranjang
     * Endpoint: POST /api/v1/cart
     */
    addToCart: async (payload: AddToCartPayload): Promise<ApiResponse<CartItem>> => {
        return await axiosClient.post('/v1/cart', payload);
    },

    /**
     * Memperbarui kuantitas item tertentu di keranjang
     * @param id ID unik dari item keranjang (Cart ID)
     * Endpoint: PATCH /api/v1/cart/:id
     */
    updateQty: async (id: string, quantity: number): Promise<ApiResponse<CartItem>> => {
        const payload: UpdateCartQtyPayload = { quantity };
        return await axiosClient.patch(`/v1/cart/${id}`, payload);
    },

    /**
     * Menghapus satu item spesifik dari keranjang
     * @param id ID unik dari item keranjang (Cart ID)
     * Endpoint: DELETE /api/v1/cart/:id
     */
    removeItem: async (id: string): Promise<ApiResponse<null>> => {
        return await axiosClient.delete(`/v1/cart/${id}`);
    },

    /**
     * Mengosongkan seluruh isi keranjang belanja
     * Endpoint: DELETE /api/v1/cart
     */
    clearCart: async (): Promise<ApiResponse<null>> => {
        return await axiosClient.delete('/v1/cart');
    }
};
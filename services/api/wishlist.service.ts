// File: dialog-fe/services/api/wishlist.service.ts

import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import { WishlistItem, AddWishlistPayload } from '../../types/wishlist';

export const WishlistService = {
    /**
     * Mendapatkan daftar produk favorit user
     */
    getMyWishlist: async (): Promise<ApiResponse<WishlistItem[]>> => {
        return await axiosClient.get<any, ApiResponse<WishlistItem[]>>('/v1/wishlist');
    },

    /**
     * Menambahkan produk ke wishlist
     */
    addToWishlist: async (payload: AddWishlistPayload): Promise<ApiResponse<WishlistItem>> => {
        return await axiosClient.post<any, ApiResponse<WishlistItem>>('/v1/wishlist', payload);
    },

    /**
     * Menghapus produk dari wishlist
     * @param productId ID produk yang ingin dihapus
     */
    removeFromWishlist: async (productId: string): Promise<ApiResponse<null>> => {
        return await axiosClient.delete<any, ApiResponse<null>>(`/v1/wishlist/${productId}`);
    }
};
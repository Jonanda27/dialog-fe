import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import {
    Review,
    CreateReviewPayload,
    ReplyReviewPayload
} from '../../types/review';

export const ReviewService = {
    /**
     * [BUYER] Mengirim ulasan baru untuk pesanan yang sudah selesai (Completed).
     * Operasi ini bersifat atomik di backend: memvalidasi kepemilikan item dan menyimpan media.
     * Menggunakan FormData secara internal karena mendukung multipart/form-data untuk unggahan foto.
     */
    createReview: async (payload: CreateReviewPayload): Promise<ApiResponse<Review>> => {
        const formData = new FormData();
        
        formData.append('order_item_id', payload.order_item_id);
        formData.append('rating', payload.rating.toString());
        
        if (payload.comment) {
            formData.append('comment', payload.comment);
        }

        if (payload.photos && payload.photos.length > 0) {
            payload.photos.forEach((photo) => {
                // Key 'photos' harus sama persis dengan yang ada di upload middleware backend
                formData.append('photos', photo);
            });
        }

        return await axiosClient.post<any, ApiResponse<Review>>('/reviews', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    /**
     * [PUBLIC] Mengambil daftar ulasan untuk satu produk spesifik.
     * Digunakan untuk ditampilkan di halaman Product Detail Page (PDP).
     */
    getProductReviews: async (productId: string): Promise<ApiResponse<Review[]>> => {
        return await axiosClient.get<any, ApiResponse<Review[]>>(`/reviews/product/${productId}`);
    },

    /**
     * [PUBLIC] Mengambil daftar ulasan untuk sebuah toko.
     * Digunakan untuk ditampilkan di halaman profil/etalase toko beserta ulasannya.
     */
    getStoreReviews: async (storeId: string): Promise<ApiResponse<Review[]>> => {
        return await axiosClient.get<any, ApiResponse<Review[]>>(`/reviews/store/${storeId}`);
    },

    /**
     * [SELLER] Membalas ulasan dari pembeli.
     * Menggunakan PATCH karena kita hanya memperbarui satu entitas spesifik (seller_reply).
     */
    replyReview: async (reviewId: string, payload: ReplyReviewPayload): Promise<ApiResponse<Review>> => {
        return await axiosClient.patch<any, ApiResponse<Review>>(`/reviews/${reviewId}/reply`, payload);
    },
    
};
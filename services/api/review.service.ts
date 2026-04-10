import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import { CreateReviewPayload, Review, ProductReviewSummary } from '../../types/review';

export const ReviewService = {
    /**
     * [BUYER] Mengirimkan ulasan baru beserta bukti foto/video unboxing.
     * Menggunakan FormData karena payload mengandung file biner (File[]).
     */
    submitReview: async (payload: CreateReviewPayload): Promise<ApiResponse<Review>> => {
        const formData = new FormData();

        // 1. Append Data Teks
        formData.append('order_item_id', payload.order_item_id);
        formData.append('rating', String(payload.rating));

        if (payload.comment) {
            formData.append('comment', payload.comment);
        }

        // 2. Append Data File (Media Unboxing)
        if (payload.media && payload.media.length > 0) {
            payload.media.forEach((file) => {
                // 'media' adalah nama field yang diekspektasikan oleh middleware Multer di Backend
                formData.append('media', file);
            });
        }

        // Eksekusi POST request
        return await axiosClient.post<any, ApiResponse<Review>>('/reviews', formData);
    },

    /**
     * [PUBLIC] Mengambil daftar ulasan dan ringkasan rating untuk sebuah produk.
     * Digunakan di halaman Product Detail Page (PDP).
     */
    getProductReviews: async (
        productId: string,
        params?: Record<string, any>
    ): Promise<ApiResponse<{ reviews: Review[], summary: ProductReviewSummary }>> => {
        return await axiosClient.get<any, ApiResponse<{ reviews: Review[], summary: ProductReviewSummary }>>(
            `/products/${productId}/reviews`,
            { params }
        );
    }
};
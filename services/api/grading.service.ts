// File: dialog-fe/services/api/grading.service.ts

import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import {
    GradingRequest,
    RequestGradingPayload,
    FulfillGradingPayload
} from '../../types/grading';

export const GradingService = {
    /**
     * [BUYER] Meminta penjual untuk mengunggah video detail kondisi fisik (Grading).
     * @param payload ID Produk yang ingin di-request
     */
    requestGrading: async (payload: RequestGradingPayload): Promise<ApiResponse<GradingRequest>> => {
        return await axiosClient.post<any, ApiResponse<GradingRequest>>('/grading/request', payload);
    },

    /**
     * [SELLER] Mengambil daftar permintaan video grading yang masuk ke toko.
     */
    getStoreRequests: async (): Promise<ApiResponse<GradingRequest[]>> => {
        return await axiosClient.get<any, ApiResponse<GradingRequest[]>>('/grading/store');
    },

    /**
     * [SELLER] Mengunggah video detail kondisi produk untuk memenuhi request Buyer.
     * Fungsi ini secara otomatis mengonversi payload file menjadi FormData.
     * @param gradingId ID dari request grading
     * @param payload Objek berisi file video
     */
    fulfillGrading: async (gradingId: string, payload: FulfillGradingPayload): Promise<ApiResponse<GradingRequest>> => {
        const formData = new FormData();

        if (payload.video_file) {
            // Key 'video' HARUS sama persis dengan yang ada di upload.single('video') milik Backend Multer
            formData.append('video', payload.video_file);
        } else {
            return Promise.reject(new Error('File video tidak ditemukan dalam payload.'));
        }

        // Eksekusi HTTP Request
        // axiosClient akan mendeteksi FormData dan membiarkan browser mengatur boundary multipart
        return await axiosClient.put<any, ApiResponse<GradingRequest>>(`/grading/${gradingId}/fulfill`, formData);
    }
};
// File: services/api/grading.service.ts

import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/api';
import { GradingRequest, RequestGradingPayload, FulfillGradingPayload } from '@/types/grading';

export const gradingService = {
    // Fase 1: Buyer mengajukan request video
    requestGrading: async (payload: RequestGradingPayload): Promise<ApiResponse<GradingRequest>> => {
        const response = await axiosClient.post('/grading/request', payload);
        return response.data;
    },

    // Buyer: Mengambil daftar tiket miliknya untuk GradingHub
    getBuyerRequests: async (): Promise<ApiResponse<GradingRequest[]>> => {
        const response = await axiosClient.get('/grading/my-requests');
        return response.data;
    },

    // Seller: Mengambil daftar tiket yang masuk ke tokonya
    getStoreRequests: async (): Promise<ApiResponse<GradingRequest[]>> => {
        const response = await axiosClient.get('/grading/store-requests');
        return response.data;
    },

    // Fase 2: Seller mengunggah video
    fulfillGrading: async (gradingId: string, payload: FulfillGradingPayload): Promise<ApiResponse<GradingRequest>> => {
        const formData = new FormData();
        if (payload.video_file) {
            formData.append('video', payload.video_file);
        }
        const response = await axiosClient.patch(`/grading/${gradingId}/fulfill`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // MAC (Media Access Control): Mendapatkan URL Stream dengan Auth Token
    getAuthenticatedStreamUrl: (gradingId: string): string => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        let token = '';

        // ⚡ FIX: Ekstraksi Token dari Local Storage
        if (typeof window !== 'undefined') {
            try {
                // Skenario 1: Jika disimpan langsung dengan key 'token'
                const rawToken = localStorage.getItem('token');

                // Skenario 2: Jika disimpan via state manager seperti Zustand (auth-storage)
                const authStorage = localStorage.getItem('auth-storage');
                let parsedToken = '';

                if (authStorage) {
                    const parsed = JSON.parse(authStorage);
                    parsedToken = parsed?.state?.token; // Sesuaikan path ini dengan struktur state Anda
                }

                // Ambil mana yang tersedia
                token = rawToken || parsedToken || '';

                if (!token) {
                    console.error("Token tidak ditemukan di Local Storage.");
                }
            } catch (error) {
                console.error("Gagal mengekstrak token dari Local Storage:", error);
            }
        }

        const streamUrl = `${baseUrl}/grading/${gradingId}/stream`;
        // Injeksi token ke query parameter agar terbaca oleh tag <video>
        return token ? `${streamUrl}?token=${token}` : streamUrl;
    }
};

export default gradingService;
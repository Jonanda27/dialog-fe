import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/api';
import { GradingRequest, RequestGradingPayload, FulfillGradingPayload } from '@/types/grading';

const gradingService = {
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
        // Sesuaikan NEXT_PUBLIC_API_URL dengan env Anda (misal: http://localhost:5000/api)
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        let token = '';

        // Ekstraksi Token JWT dari Client-Side Storage
        // Asumsi: Anda menggunakan Zustand (authStore) yang di-persist ke localStorage.
        // Jika nama key localStorage Anda berbeda, ubah 'auth-storage' di bawah ini.
        if (typeof window !== 'undefined') {
            const authState = localStorage.getItem('auth-storage');
            if (authState) {
                try {
                    const parsed = JSON.parse(authState);
                    token = parsed.state?.token || '';
                } catch (e) {
                    console.error("Gagal mem-parsing token untuk video stream");
                }
            }
        }

        const streamUrl = `${baseUrl}/grading/${gradingId}/stream`;
        // Injeksi token ke query parameter agar terbaca oleh tag <video>
        return token ? `${streamUrl}?token=${token}` : streamUrl;
    }
};

export default gradingService;
import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/api';
import { Auction } from '@/types/auction';

export const auctionService = {
    // ==========================================
    // SELLER ENDPOINTS (RESTRICTED)
    // ==========================================

    /**
     * Membuat lelang baru secara independen (Decoupled dari Product).
     * @param formData Berisi teks input (item_name, dimensi, penjadwalan) dan file biner (photos).
     */
    createAuction: async (formData: FormData): Promise<ApiResponse<Auction>> => {
        const response = await axiosClient.post('/v1/auctions', formData, {
            headers: {
                // Mendeklarasikan multipart/form-data agar backend (Multer) dapat 
                // mem-parsing boundary antara field primitive dan file biner.
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Mengambil daftar lelang milik toko (Seller Dashboard).
     */
    getMyStoreAuctions: async (): Promise<ApiResponse<Auction[]>> => {
        const response = await axiosClient.get('/v1/auctions/my-store');
        return response.data;
    },

    /**
     * Membatalkan jadwal lelang (Hanya diizinkan jika status masih SCHEDULED).
     * @param id UUID dari lelang yang akan dibatalkan
     */
    cancelAuction: async (id: string): Promise<ApiResponse<null>> => {
        // Menggunakan PUT agar sinkron secara 1:1 dengan definisi endpoint: 
        // PUT /api/v1/auctions/:id/cancel
        const response = await axiosClient.put(`/v1/auctions/${id}/cancel`);
        return response.data;
    },


    // ==========================================
    // BUYER / PUBLIC ENDPOINTS (NEW)
    // ==========================================

    /**
     * Mengambil daftar lelang untuk katalog publik pembeli.
     * @param params Parameter query opsional (contoh: { status: 'ACTIVE', limit: 10 })
     */
    getPublicAuctions: async (params?: Record<string, any>): Promise<ApiResponse<Auction[]>> => {
        const response = await axiosClient.get('/v1/auctions', { params });
        return response.data;
    },

    /**
     * Mengambil detail spesifik dari sebuah lelang (digunakan pada halaman The Arena / Detail Lelang).
     * @param id UUID dari lelang
     */
    getAuctionById: async (id: string): Promise<ApiResponse<Auction>> => {
        const response = await axiosClient.get(`/v1/auctions/${id}`);
        return response.data;
    }
};
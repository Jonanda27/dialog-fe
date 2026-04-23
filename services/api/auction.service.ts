import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/api';
import { Auction } from '@/types/auction';

// Interface spesifik untuk respons paginasi dari market
export interface MarketAuctionsResponse {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    auctions: Auction[];
}

export const auctionService = {
    // ==========================================
    // SELLER ENDPOINTS (RESTRICTED TO STORE OWNER)
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
    // BUYER / PUBLIC ENDPOINTS (DECOUPLED)
    // ==========================================

    /**
     * ⚡ BARU: Mengambil daftar lelang aktif & terjadwal untuk Dashboard Buyer.
     * Menembak endpoint publik /market dengan dukungan paginasi limit/offset.
     * @param page Nomor halaman saat ini
     * @param limit Batas data per halaman
     */
    getMarketAuctions: async (page: number = 1, limit: number = 12): Promise<ApiResponse<MarketAuctionsResponse>> => {
        const response = await axiosClient.get('/v1/auctions/market', {
            params: { page, limit }
        });
        return response.data;
    },

    /**
     * ⚡ BARU: Mengambil meta-data statis spesifik dari sebuah lelang 
     * (Digunakan untuk Server-Side Rendering (SSR) pada halaman Detail Lelang).
     * @param id UUID dari lelang
     */
    getPublicAuctionDetail: async (id: string): Promise<ApiResponse<Auction>> => {
        const response = await axiosClient.get(`/v1/auctions/market/${id}`);
        return response.data;
    }
};
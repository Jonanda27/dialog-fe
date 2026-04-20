import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/api';
import { Auction } from '@/types/auction';

// Tipe CreateAuctionPayload dihapus dari import karena kita kini menggunakan tipe bawaan browser: FormData

export const auctionService = {
    /**
     * Membuat lelang baru.
     * @param formData Berisi teks input (item_name, dll) dan file biner (photos).
     */
    createAuction: async (formData: FormData): Promise<ApiResponse<Auction>> => {
        const response = await axiosClient.post('/v1/auctions', formData, {
            headers: {
                // Header ini memastikan Axios dan Backend (Multer) memahami 
                // bahwa request ini mengandung pemisahan boundary untuk file biner.
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Mengambil daftar lelang milik toko (Seller).
     */
    getMyStoreAuctions: async (): Promise<ApiResponse<Auction[]>> => {
        const response = await axiosClient.get('/v1/auctions/my-store');
        return response.data;
    },

    /**
     * Membatalkan jadwal lelang (Hanya jika belum live).
     * @param id UUID dari lelang yang akan dibatalkan
     */
    cancelAuction: async (id: string): Promise<ApiResponse<null>> => {
        // PERBAIKAN: Mengubah .delete() menjadi .put() agar presisi 1:1 
        // dengan definisi endpoint backend kita (PUT /api/v1/auctions/:id/cancel)
        const response = await axiosClient.put(`/v1/auctions/${id}/cancel`);
        return response.data;
    }
};
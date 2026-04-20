import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/api';
import { Auction } from '@/types/auction';

// Tipe CreateAuctionPayload dihapus karena pengiriman data lelang yang mencakup file 
// (photos) dienkapsulasi menggunakan objek bawaan browser: FormData.

export const auctionService = {
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
    }
};
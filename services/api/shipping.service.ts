import axiosClient from './axiosClient';
import { ShippingRatePayload, CourierOption } from '@/types/shipping';
import { BiteshipArea } from '@/types/address'; // Pastikan path import ini sesuai dengan lokasi interface Anda

export const shippingService = {
    /**
     * [PROXY] Mengambil saran hierarki wilayah geografis dari Biteship.
     * Endpoint GET ini mem-bypass CORS eksternal dengan menggunakan Backend Analog.id sebagai proxy.
     * * @param query String kata kunci pencarian wilayah (Kecamatan/Kota). Minimal 3 karakter.
     * @returns Promise berisi array area (BiteshipArea) untuk di-render pada komponen Autocomplete.
     * @throws AppError 503 jika server pihak ketiga (Biteship) sedang down.
     */
    getAreas: async (query: string): Promise<BiteshipArea[]> => {
        try {
            const response = await axiosClient.get(`/api/v1/shipping/areas`, {
                params: { input: query }
            });

            // Standarisasi mapping response berdasarkan struktur apiResponse.js di backend
            return response.data.data || [];
        } catch (error: any) {
            if (error.response?.status === 503) {
                throw new Error('Layanan pemetaan wilayah logistik sedang dalam pemeliharaan.');
            }
            throw new Error(error.response?.data?.message || 'Terjadi kesalahan saat memuat data wilayah.');
        }
    },

    /**
     * [CALCULATOR] Mengkalkulasi opsi ongkos kirim secara real-time via Aggregator (Biteship).
     * Endpoint POST ini diisolasi dari logic /orders, bertindak sebagai mesin kalkulasi standalone.
     * Backend secara mandiri akan menerjemahkan address_id dan store_id menjadi biteship_area_id.
     * * @param payload DTO berisi relasi ID Alamat (Tujuan), ID Toko (Asal), dan array rincian fisik produk.
     * @returns Promise berisi array opsi kurir (CourierOption) yang telah disaring dan dikurasi oleh Backend.
     */
    getRates: async (payload: ShippingRatePayload): Promise<CourierOption[]> => {
        try {
            const response = await axiosClient.post('/api/v1/shipping/rates', payload);

            return response.data.data || [];
        } catch (error: any) {
            // Menangkap error spesifik seperti 404 (Alamat tidak ditemukan) atau 400 (Payload cacat)
            throw new Error(error.response?.data?.message || 'Gagal menghitung tarif pengiriman ke rute ini.');
        }
    }
};
import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import { CalculateShippingPayload, CourierOption } from '../../types/shipping';

export const ShippingService = {
    /**
     * [BUYER] Mengkalkulasi opsi ongkos kirim secara real-time via Aggregator (Biteship).
     * Endpoint POST digunakan karena payload membutuhkan struktur objek yang kompleks 
     * (store_id, destination_postal_code, dan array of items) yang tidak ideal diekspos via URL parameters (GET).
     * * @param payload DTO yang berisi relasi Toko, Kode Pos Tujuan, dan rincian fisik produk (dimensi/berat).
     * @returns Promise berisi array daftar harga kurir yang sudah ditranslasi ke format standar UI.
     */
    calculateCost: async (payload: CalculateShippingPayload): Promise<ApiResponse<CourierOption[]>> => {
        // Melakukan HTTP POST ke API Gateway internal yang kemudian diteruskan ke layanan pihak ketiga
        return await axiosClient.post<any, ApiResponse<CourierOption[]>>('/orders/shipping-cost', payload);
    }
};
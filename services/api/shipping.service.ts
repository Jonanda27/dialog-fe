import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import { CalculateShippingPayload, CourierOption } from '../../types/shipping';

export const ShippingService = {
    /**
     * [BUYER] Mengkalkulasi opsi ongkos kirim secara real-time.
     * Endpoint POST digunakan karena payload pencarian bisa kompleks dan tidak ideal jika diekspos via URL parameters (GET).
     * @param payload berisi origin (Toko), destination (Pembeli), dan akumulasi weight (gram)
     */
    calculateCost: async (payload: CalculateShippingPayload): Promise<ApiResponse<CourierOption[]>> => {
        // Asumsi rute '/orders/shipping-cost' adalah jembatan (API Gateway) ke layanan logistik di Backend
        return await axiosClient.post<any, ApiResponse<CourierOption[]>>('/orders/shipping-cost', payload);
    }
};
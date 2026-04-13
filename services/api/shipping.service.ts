import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import { CalculateShippingPayload, CourierOption } from '../../types/shipping';

export const ShippingService = {
    /**
     * [BUYER] Mengkalkulasi ongkos kirim berdasarkan alamat dan berat.
     * @param payload origin, destination, dan weight
     */
    calculateCost: async (payload: CalculateShippingPayload): Promise<ApiResponse<CourierOption[]>> => {
        // Rute ini selaras dengan endpoint POST /api/orders/shipping-cost yang kita buat di BE
        return await axiosClient.post<any, ApiResponse<CourierOption[]>>('/orders/shipping-cost', payload);
    }
};
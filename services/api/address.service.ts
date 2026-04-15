import axiosClient from './axiosClient';
import { Address, AddressFormPayload, BiteshipArea } from '@/types/address';

export const shippingService = {
    getAreas: async (query: string): Promise<BiteshipArea[]> => {
        try {
            const response = await axiosClient.get(`/v1/shipping/areas`, {
                params: { input: query }
            });

            // [PERBAIKAN]: Ekstraksi data secara dinamis
            // Menutupi kemungkinan axiosClient sudah di-unwrap oleh interceptor atau belum
            const payloadData = response.data?.data || response.data || response;

            // Pastikan yang direturn murni sebuah Array untuk di-mapping oleh React
            return Array.isArray(payloadData) ? payloadData : [];

        } catch (error: any) {
            if (error.response?.status === 503) {
                throw new Error('Layanan pencarian wilayah sedang tidak tersedia.');
            }
            throw new Error('Gagal memuat data wilayah.');
        }
    }
};

export const addressService = {
    getMyAddresses: async (): Promise<Address[]> => {
        const response = await axiosClient.get('/v1/addresses');
        return response.data.data || [];
    },

    addAddress: async (data: AddressFormPayload): Promise<Address> => {
        const response = await axiosClient.post('/v1/addresses', data);
        return response.data.data;
    },

    updateAddress: async (id: string, data: AddressFormPayload): Promise<Address> => {
        const response = await axiosClient.put(`/v1/addresses/${id}`, data);
        return response.data.data;
    },

    deleteAddress: async (id: string): Promise<void> => {
        await axiosClient.delete(`/v1/addresses/${id}`);
    }
};
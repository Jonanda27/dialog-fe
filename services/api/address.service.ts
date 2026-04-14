import axiosClient from './axiosClient';
import { Address, AddressFormPayload, BiteshipArea } from '@/types/address';

export const shippingService = {
    getAreas: async (query: string): Promise<BiteshipArea[]> => {
        try {
            const response = await axiosClient.get(`/api/v1/shipping/areas`, {
                params: { input: query }
            });
            return response.data.data || [];
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
        const response = await axiosClient.get('/api/v1/addresses');
        return response.data.data;
    },

    addAddress: async (data: AddressFormPayload): Promise<Address> => {
        const response = await axiosClient.post('/api/v1/addresses', data);
        return response.data.data;
    },

    updateAddress: async (id: string, data: AddressFormPayload): Promise<Address> => {
        const response = await axiosClient.put(`/api/v1/addresses/${id}`, data);
        return response.data.data;
    },

    deleteAddress: async (id: string): Promise<void> => {
        await axiosClient.delete(`/api/v1/addresses/${id}`);
    }
};
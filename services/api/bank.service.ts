// @/services/userBankService.ts
import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/api';
import { UserBankAccount, CreateUserBankPayload } from '@/types/userBank';

export const UserBankService = {
    /**
     * Mengambil daftar rekening bank milik user (Buyer)
     */
    getMyBanks: async (): Promise<ApiResponse<UserBankAccount[]>> => {
        return await axiosClient.get('/user-banks');
    },

    /**
     * Menambahkan rekening bank baru
     */
    addBank: async (payload: CreateUserBankPayload): Promise<ApiResponse<UserBankAccount>> => {
        return await axiosClient.post('/user-banks', payload);
    },

    /**
     * Menghapus rekening bank berdasarkan ID
     */
    deleteBank: async (id: string): Promise<ApiResponse<null>> => {
        return await axiosClient.delete(`/user-banks/${id}`);
    }
};
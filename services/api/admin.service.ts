// File: dialog-fe/services/api/admin.service.ts

import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import { Store } from '../../types/store';

export const AdminService = {
    /**
     * Mengambil daftar toko yang sedang menunggu verifikasi KYC (KTP).
     */
    getPendingStores: async (): Promise<ApiResponse<Store[]>> => {
        return await axiosClient.get<any, ApiResponse<Store[]>>('/admin/stores/pending');
    },

    /**
     * Menyetujui pendaftaran toko. Toko akan aktif dan bisa mulai berjualan.
     * @param storeId ID Toko yang akan disetujui
     */
    approveStore: async (storeId: string): Promise<ApiResponse<Store>> => {
        return await axiosClient.put<any, ApiResponse<Store>>(`/admin/stores/${storeId}/approve`);
    },

    /**
     * Menolak pendaftaran toko (misal: KTP buram atau tidak valid).
     * @param storeId ID Toko yang ditolak
     * @param reason Alasan penolakan (Opsional)
     */
    rejectStore: async (storeId: string, reason?: string): Promise<ApiResponse<Store>> => {
        return await axiosClient.put<any, ApiResponse<Store>>(`/admin/stores/${storeId}/reject`, { reason });
    }
};
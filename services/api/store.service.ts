// File: dialog-fe/services/api/store.service.ts

import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import {
    Store,
    RegisterStorePayload,
    KYCUpdatePayload,
    StoreWalletResponse
} from '../../types/store';

export const StoreService = {
    /**
     * Mengambil data profil toko milik pengguna yang sedang login.
     */
    getMyStore: async (): Promise<ApiResponse<Store>> => {
        return await axiosClient.get<any, ApiResponse<Store>>('/stores/my-store');
    },

    /**
     * Mendaftarkan toko baru untuk pengguna (Role Seller).
     * @param payload Nama dan deskripsi toko
     */
    registerStore: async (payload: RegisterStorePayload): Promise<ApiResponse<Store>> => {
        return await axiosClient.post<any, ApiResponse<Store>>('/stores/register-store', payload);
    },

    /**
     * Mengunggah file KTP untuk verifikasi toko (KYC).
     * Otomatis melakukan konversi payload ke FormData.
     * @param payload Objek berisi file KTP
     */
    uploadKYC: async (payload: KYCUpdatePayload): Promise<ApiResponse<Store>> => {
        const formData = new FormData();

        if (payload.ktp_file) {
            // Key 'ktp_file' harus sama persis dengan yang ada di upload.single('ktp_file') milik Backend Multer
            formData.append('ktp_file', payload.ktp_file);
        } else {
            return Promise.reject(new Error('File KTP tidak ditemukan dalam payload.'));
        }

        // Menggunakan PATCH sesuai dengan standarisasi route Backend kita
        return await axiosClient.patch<any, ApiResponse<Store>>('/stores/upload-kyc', formData);
    },

    /**
     * Mengambil saldo toko dan riwayat mutasi finansial.
     * Membutuhkan otorisasi toko aktif.
     */
    getWallet: async (): Promise<ApiResponse<StoreWalletResponse>> => {
        return await axiosClient.get<any, ApiResponse<StoreWalletResponse>>('/stores/wallet');
    }
};
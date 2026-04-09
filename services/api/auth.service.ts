// File: dialog-fe/services/api/auth.service.ts

import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import {
    LoginPayload,
    RegisterPayload,
    AuthResponse,
    User
} from '../../types/auth';

/**
 * Kumpulan fungsi API untuk domain Autentikasi.
 * Mengekspor object AuthService agar mudah di-import (Tree Shaking friendly).
 */
export const AuthService = {
    /**
     * Melakukan proses Login pengguna.
     * @param payload Email dan Password
     * @returns Data user dan Token JWT
     */
    login: async (payload: LoginPayload): Promise<ApiResponse<AuthResponse>> => {
        // Karena kita sudah memodifikasi Response Interceptor di axiosClient,
        // kembalian dari axiosClient.post ini sudah berupa response.data (bukan response Axios utuh)
        return await axiosClient.post<any, ApiResponse<AuthResponse>>('/auth/login', payload);
    },

    /**
     * Mendaftarkan pengguna baru (Buyer/Seller).
     * @param payload Data registrasi (name, email, password, role)
     * @returns Data user yang baru terdaftar
     */
    register: async (payload: RegisterPayload): Promise<ApiResponse<User>> => {
        return await axiosClient.post<any, ApiResponse<User>>('/auth/register', payload);
    },

    /**
     * Mengambil data profil user yang sedang login (Get Me / Verify Sesi).
     * Token otomatis disisipkan oleh axiosClient interceptor.
     * @returns Data profil user saat ini
     */
    getMe: async (): Promise<ApiResponse<User>> => {
        return await axiosClient.get<any, ApiResponse<User>>('/auth/me');
    },

    /**
     * (Opsional) Melakukan logout ke backend jika menggunakan sistem blacklist token,
     * Jika stateless JWT biasa, cukup hapus cookie di FE menggunakan utilitas JS.
     */
    logout: async (): Promise<ApiResponse<null>> => {
        return await axiosClient.post<any, ApiResponse<null>>('/auth/logout');
    }
};
// File: dialog-fe/services/api/axiosClient.ts

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError, ValidationErrorField } from '../../types/api';

// Ekstraksi Base URL dari Environment Variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Helper: Mengambil cookie di sisi klien (Browser) dengan aman
 */
const getClientCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null; // Cegah error saat SSR di Next.js
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
};

// 1. Inisialisasi Master Axios Instance
const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Timeout opsional untuk mencegah request menggantung terlalu lama
    timeout: 30000,
});

// 2. Request Interceptor: Otomatis menyuntikkan Bearer Token
axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Asumsi nama cookie tempat menyimpan token adalah 'token'
        const token = getClientCookie('token');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor: Standarisasi Error Handling
axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Jika sukses (2xx), langsung kembalikan data (sudah sesuai tipe ApiResponse)
        return response.data;
    },
    (error: AxiosError<any>) => {
        // Objek ApiError bawaan yang akan dilempar ke UI
        const customError: ApiError = {
            status: error.response?.status || 500,
            message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
            errors: null,
            isAuthError: false,
        };

        if (error.response) {
            const { status, data } = error.response;

            // Map pesan error utama dari Backend (utils/apiResponse.js)
            if (data && data.message) {
                customError.message = data.message;
            }

            // Map Error 400 (Zod Validation)
            if (status === 400 && data.errors) {
                customError.errors = data.errors as ValidationErrorField[];
            }

            // Map Error 401 (Unauthorized / Token Expired)
            if (status === 401) {
                customError.isAuthError = true;
                customError.message = data.message || 'Sesi Anda telah berakhir. Silakan login kembali.';

                // PENTING: Jangan lakukan window.location.href = '/login' di sini.
                // Biarkan Zustand AuthStore yang mendengarkan flag isAuthError ini 
                // dan melakukan logout/redirect secara elegan.
            }

            // Map Error 403 (Forbidden / Akses Ditolak)
            if (status === 403) {
                customError.message = data.message || 'Anda tidak memiliki akses untuk tindakan ini.';
            }
        } else if (error.request) {
            // Kasus di mana request terkirim tapi server mati / tidak merespon
            customError.status = 0;
            customError.message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        }

        // Kembalikan customError agar di komponen UI cukup menggunakan: catch (err: ApiError)
        return Promise.reject(customError);
    }
);

export default axiosClient;
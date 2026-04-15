// File: dialog-fe/services/api/axiosClient.ts

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError, ValidationErrorField } from '../../types/api';
// Gunakan import dinamis / pemanggilan state lambat untuk mencegah Circular Dependency
import { useAuthStore } from '../../store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// 1. Inisialisasi Master Axios Instance
const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// 2. Request Interceptor: Injeksi Keamanan & Token
axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        config.headers['X-Requested-With'] = 'XMLHttpRequest';

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor: Centralized Error Parser & Gatekeeper
axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data;
    },
    (error: AxiosError<any>) => {
        const customError: ApiError = {
            status: error.response?.status || 500,
            message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
            errors: null,
            isAuthError: false,
        };

        if (error.response) {
            const { status, data } = error.response;

            if (data && data.message) customError.message = data.message;
            if (status === 400 && data.errors) customError.errors = data.errors as ValidationErrorField[];

            // ⚡ PROTOKOL GATEKEEPER 401 (Unauthorized) TERPUSAT ⚡
            if (status === 401) {
                customError.isAuthError = true;
                customError.message = data.message || 'Sesi Anda telah berakhir. Silakan login kembali.';

                if (typeof window !== 'undefined') {
                    // Panggil fungsi logout Zustand. 
                    // Menggunakan setTimeout(..., 0) untuk menghindari masalah "Cannot update a component while rendering a different component" di React.
                    setTimeout(() => {
                        useAuthStore.getState().logout();
                    }, 0);
                }
            }

            if (status === 403) {
                customError.message = data.message || 'Anda tidak memiliki otorisasi untuk tindakan ini.';
            }

            // ⚡ NEW: Specific 404 Handling for Grading Endpoints
            if (status === 404) {
                const requestUrl = error.config?.url || '';

                if (requestUrl.includes('/grading')) {
                    customError.message = 'Layanan grading sedang mengalami gangguan teknis. Coba lagi dalam beberapa saat atau hubungi support.';
                } else if (requestUrl.includes('/produk') || requestUrl.includes('/product')) {
                    customError.message = 'Produk tidak ditemukan atau telah dihapus.';
                } else if (requestUrl.includes('/address')) {
                    customError.message = 'Alamat pengiriman tidak ditemukan.';
                } else {
                    customError.message = data.message || 'Resource yang Anda cari tidak tersedia.';
                }
            }
        } else if (error.request) {
            customError.status = 0;
            customError.message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        }

        return Promise.reject(customError);
    }
);

export default axiosClient;
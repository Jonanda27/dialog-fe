import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError, ValidationErrorField } from '../../types/api';

// Ekstraksi Base URL dari Environment Variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// 1. Inisialisasi Master Axios Instance
const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Timeout presisi untuk mencegah request menggantung dan membebani server
    timeout: 30000,
});

// 2. Request Interceptor: Injeksi Keamanan & Token
axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Implementasi Protokol: Mitigasi CSRF Dasar
        config.headers['X-Requested-With'] = 'XMLHttpRequest';

        // Ambil token dari localStorage secara aman (hanya dieksekusi di sisi client)
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
        // Passthrough respons sukses (2xx) langsung ke layer Service
        return response.data;
    },
    (error: AxiosError<any>) => {
        // Blueprint ApiError standar
        const customError: ApiError = {
            status: error.response?.status || 500,
            message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
            errors: null,
            isAuthError: false,
        };

        if (error.response) {
            const { status, data } = error.response;

            // Map pesan error utama dari Backend (Standar utils/apiResponse.js)
            if (data && data.message) {
                customError.message = data.message;
            }

            // Map Error 400 (Zod Validation / Business Rule Violation)
            if (status === 400 && data.errors) {
                customError.errors = data.errors as ValidationErrorField[];
            }

            // ⚡ PROTOKOL GATEKEEPER 401 (Unauthorized) ⚡
            if (status === 401) {
                customError.isAuthError = true;
                customError.message = data.message || 'Sesi Anda telah berakhir. Silakan login kembali.';

                if (typeof window !== 'undefined') {
                    // 1. Hapus kredensial lokal
                    localStorage.removeItem('token');
                    // Hapus juga persist state Zustand (sesuaikan dengan nama key di authStore Anda)
                    localStorage.removeItem('auth-storage');

                    // 2. Cegah Infinite Loop (jangan redirect jika sudah di halaman login)
                    if (!window.location.pathname.includes('/auth/login')) {
                        // 3. Ambil rute saat ini beserta parameter URL-nya
                        const currentPath = encodeURIComponent(window.location.pathname + window.location.search);

                        // 4. Force Redirect (Membuang memori state React yang korup/kadaluarsa)
                        window.location.href = `/auth/login?redirect_to=${currentPath}`;
                    }
                }
            }

            // Map Error 403 (Forbidden / Akses Ditolak)
            if (status === 403) {
                customError.message = data.message || 'Anda tidak memiliki otorisasi untuk tindakan ini.';
            }
        } else if (error.request) {
            // Kasus Network Error: Server mati, timeout, atau koneksi terputus
            customError.status = 0;
            customError.message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        }

        // Kembalikan customError ke level Store/UI
        return Promise.reject(customError);
    }
);

export default axiosClient;
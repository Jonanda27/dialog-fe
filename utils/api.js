// File: dialog-fe/utils/api.js
import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper untuk membaca cookie di sisi klien (Browser)
const getClientCookie = (name) => {
    if (typeof window === 'undefined') return null; // Cegah error saat SSR
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// Buat instans Axios khusus
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Otomatis menyuntikkan token dari cookie ke setiap request
api.interceptors.request.use(
    (config) => {
        // Asumsi nama cookie tempat token disimpan adalah 'accessToken'
        const token = getClientCookie('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Menangani error secara global tanpa Force Logout kasar
api.interceptors.response.use(
    (response) => {
        // Loloskan response yang sukses (2xx)
        return response;
    },
    (error) => {
        const { response } = error;

        if (response) {
            // Tangkap 401 Unauthorized
            if (response.status === 401) {
                console.warn('[API] Sesi tidak valid atau kadaluwarsa (401).');
                // DI SINI: Kita melempar custom error object agar FE (Store/Komponen) bisa bereaksi
                // Misalnya: Menampilkan modal "Sesi Habis", lalu melakukan re-autentikasi / refresh token.
                // Kita TIDAK melakukan window.location.href = '/login' di sini untuk mencegah UX terputus.
                return Promise.reject({
                    isAuthError: true,
                    message: response.data?.message || 'Sesi berakhir',
                    originalError: error
                });
            }

            // Standarisasi error dari backend agar mudah dibaca komponen FE
            return Promise.reject({
                status: response.status,
                message: response.data?.message || 'Terjadi kesalahan pada server.',
                errors: response.data?.errors || null,
            });
        }

        // Tangkap Network Error (Server mati/timeout)
        return Promise.reject({
            status: 0,
            message: 'Tidak dapat terhubung ke server. Periksa koneksi Anda.',
            errors: null
        });
    }
);

export default api;
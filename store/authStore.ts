// File: dialog-fe/store/authStore.ts

import { create } from 'zustand';
import { User, LoginPayload, RegisterPayload } from '../types/auth';
import { AuthService } from '../services/api/auth.service';
import { ApiError } from '../types/api';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;

    login: (payload: LoginPayload) => Promise<User>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => void;
    fetchMe: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isInitialized: false, // Menandakan apakah proses pengecekan token awal sudah selesai

    login: async (payload: LoginPayload) => {
        set({ isLoading: true, error: null });
        try {
            const response = await AuthService.login(payload);

            if (!response || !response.data) throw new Error("Respons dari server tidak valid atau kosong.");

            const { user, token } = response.data;
            if (!token) throw new Error("Sistem gagal mengamankan token otorisasi.");

            if (typeof window !== 'undefined') {
                localStorage.setItem('token', token);
            }

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true, // Pastikan saat login, sistem dianggap sudah inisialisasi
            });

            return user;
        } catch (error: any) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Kredensial tidak valid.',
                isLoading: false
            });
            throw apiErr;
        }
    },

    register: async (payload: RegisterPayload) => {
        set({ isLoading: true, error: null });
        try {
            await AuthService.register(payload);
            set({ isLoading: false });
        } catch (error: any) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal melakukan pendaftaran akun.',
                isLoading: false
            });
            throw apiErr;
        }
    },

    logout: () => {
        // 1. Hapus kredensial dari penyimpanan lokal
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }

        // 2. Bersihkan state memori
        set({
            user: null,
            isAuthenticated: false,
            error: null,
            // isInitialized dibiarkan TRUE agar AuthGuard tidak mencoba fetchMe() lagi dan langsung melempar ke /login
            isInitialized: true,
        });

        // Catatan Arsitektur: 
        // Penghapusan window.location.href dilakukan karena komponen <AuthGuard> 
        // akan otomatis mendeteksi isAuthenticated === false dan melakukan router.replace('/auth/login')
    },

    fetchMe: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!token) {
            set({ isInitialized: true, isAuthenticated: false, user: null });
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const response = await AuthService.getMe();

            set({
                user: response.data,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
            });
        } catch (error: any) {
            // Jika error 401, axiosClient akan otomatis memanggil fungsi logout() 
            // sehingga state akan dibersihkan di sana. Kita cukup pastikan loading selesai.
            set({
                isLoading: false,
                isInitialized: true,
                error: error.message
            });
        }
    },

    clearError: () => set({ error: null }),
}));
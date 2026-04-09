// File: dialog-fe/store/authStore.ts

import { create } from 'zustand';
import Cookies from 'js-cookie';
import { User, LoginPayload, RegisterPayload } from '../types/auth';
import { AuthService } from '../services/api/auth.service';
import { ApiError } from '../types/api';

interface AuthState {
    // State
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean; // Flag untuk mengecek apakah aplikasi sudah mencoba memvalidasi sesi awal

    // Actions
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
    isInitialized: false,

    login: async (payload: LoginPayload) => {
        set({ isLoading: true, error: null });
        try {
            const response = await AuthService.login(payload);
            const { user, token } = response.data;

            // Simpan token ke dalam Cookie (Masa aktif 7 hari, aman untuk seluruh rute FE)
            Cookies.set('token', token, { expires: 7, path: '/' });

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
            return user;
        } catch (error: any) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal melakukan login.',
                isLoading: false
            });
            throw apiErr; // Lempar kembali agar UI bisa bergetar/menampilkan toast
        }
    },

    register: async (payload: RegisterPayload) => {
        set({ isLoading: true, error: null });
        try {
            await AuthService.register(payload);
            set({ isLoading: false });
            // Setelah register, kita tidak otomatis set user karena belum ada token.
            // UI akan me-redirect user ke halaman login.
        } catch (error: any) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal mendaftar.',
                isLoading: false
            });
            throw apiErr;
        }
    },

    logout: () => {
        // Hapus token dari browser dan bersihkan memori
        Cookies.remove('token', { path: '/' });

        // Opsional: Panggil AuthService.logout() jika BE butuh blacklist token
        // AuthService.logout().catch(console.error);

        set({
            user: null,
            isAuthenticated: false,
            error: null,
        });
    },

    fetchMe: async () => {
        // Jika tidak ada token, jangan buang-buang bandwidth memanggil API
        const token = Cookies.get('token');
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
            // Jika token expired/tidak valid (401), bersihkan sesi
            const apiErr = error as ApiError;
            if (apiErr.isAuthError) {
                Cookies.remove('token', { path: '/' });
                set({ user: null, isAuthenticated: false });
            }
            set({
                isLoading: false,
                isInitialized: true,
                error: apiErr.message
            });
        }
    },

    clearError: () => set({ error: null }),
}));
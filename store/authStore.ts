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

    // Return Promise<User> agar component bisa langsung menangkap datanya untuk routing dinamis
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

            // Pengamanan Lapis 1: Pastikan struktur data valid sebelum diproses
            if (!response || !response.data) {
                throw new Error("Respons dari server tidak valid atau kosong.");
            }

            const { user, token } = response.data;

            // Pengamanan Lapis 2: Cegah penulisan token 'undefined'
            if (!token) {
                throw new Error("Sistem gagal mengamankan token otorisasi.");
            }

            // MIGRASI: Simpan token ke dalam localStorage (Aman dari middleware server)
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', token);
            }

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });

            return user;
        } catch (error: any) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Kredensial tidak valid atau terjadi kegagalan sistem.',
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
            // Setelah register sukses, user tetap harus login manual untuk mendapatkan token
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
        // 1. MIGRASI: Hapus token dari localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }

        // 2. Bersihkan state memori
        set({
            user: null,
            isAuthenticated: false,
            error: null,
        });

        // 3. Hard Cleanup: Paksa peramban untuk memuat ulang ke halaman login
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
        }
    },

    fetchMe: async () => {
        // MIGRASI: Lakukan pengecekan token dari localStorage dengan aman
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
            const apiErr = error as ApiError;

            // Evaluasi presisi: Hanya hapus token jika backend memberikan vonis 401 Unauthorized
            if (apiErr.isAuthError) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
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
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
    const router = useRouter();
    const pathname = usePathname();

    // Tarik state dari Zustand
    const { isAuthenticated, isInitialized, fetchMe, user } = useAuthStore();

    // Status otorisasi final. Default selalu false agar gerbang tertutup rapat.
    const [isAuthorized, setIsAuthorized] = useState(false);

    // 1. Fase Verifikasi Sesi (Hydration & Data Fetching)
    useEffect(() => {
        let mounted = true; // Cleanup flag untuk mencegah memory leak saat unmount

        const verifySession = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

            if (!token) {
                // Jika tidak ada token, catat rute saat ini dan lempar ke login
                const currentRoute = encodeURIComponent(pathname);
                if (mounted) router.replace(`/auth/login?redirect_to=${currentRoute}`);
                return;
            }

            // Jika token ada tetapi Zustand belum mensinkronisasi data user
            if (!isInitialized) {
                try {
                    await fetchMe();
                    // Catatan: Jika fetchMe gagal (misal 401), store akan mengeset isAuthenticated = false
                } catch (error) {
                    // Fallback keamanan jika terjadi network error kritis
                    if (mounted) router.replace('/auth/login');
                }
            }
        };

        verifySession();

        return () => { mounted = false; };
    }, [isInitialized, fetchMe, router, pathname]);

    // 2. Fase Evaluasi Akses (Role-Based Access Control)
    useEffect(() => {
        // Hanya evaluasi jika Zustand sudah selesai melakukan inisialisasi (fetchMe selesai/bypass)
        if (isInitialized) {

            // Evaluasi A: Apakah token valid dan user berhasil dikenali?
            if (!isAuthenticated || !user) {
                router.replace('/auth/login');
                return;
            }

            // Evaluasi B: Apakah user memiliki hak akses (Role) yang sesuai?
            if (allowedRoles && allowedRoles.length > 0) {
                if (!allowedRoles.includes(user.role)) {
                    // Cerdas dalam melakukan redirect jika role tidak sesuai
                    const fallbackRoute = user.role === 'admin'
                        ? '/admin/dashboard'
                        : user.role === 'seller'
                            ? '/penjual/dashboard'
                            : '/dashboard';

                    router.replace(fallbackRoute);
                    return;
                }
            }

            // Jika lulus semua evaluasi, buka gerbang
            setIsAuthorized(true);
        }
    }, [isInitialized, isAuthenticated, user, allowedRoles, router]);

    // 3. Fase Rendering (Suspense / Loading State)
    // Desain dibuat clean & profesional untuk mencegah UI Leakage
    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-zinc-800 border-t-[#ef3333] rounded-full animate-spin"></div>
                <p className="text-[#ef3333] font-medium tracking-widest text-xs uppercase animate-pulse">
                    Memverifikasi Otorisasi...
                </p>
            </div>
        );
    }

    // 4. Render Konten Jika Valid
    return <>{children}</>;
}
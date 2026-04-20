"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
    const router = useRouter();
    const pathname = usePathname();

    // Tarik state dari Zustand [cite: 1464]
    const { isAuthenticated, isInitialized, fetchMe, user } = useAuthStore();

    // Status otorisasi final. [cite: 1464]
    const [isAuthorized, setIsAuthorized] = useState(false);

    // 1. Fase Verifikasi Sesi (Hydration & Data Fetching) [cite: 1464, 1465]
    useEffect(() => {
        let mounted = true;

        const verifySession = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

            if (!token) {
                const currentRoute = encodeURIComponent(pathname);
                if (mounted) router.replace(`/auth/login?redirect_to=${currentRoute}`);
                return;
            }

            if (!isInitialized) {
                try {
                    await fetchMe();
                } catch (error) {
                    if (mounted) router.replace('/auth/login');
                }
            }
        };

        verifySession();

        return () => { mounted = false; };
    }, [isInitialized, fetchMe, router, pathname]);

    // 2. Fase Evaluasi Akses, Proteksi Suspensi, & Verifikasi Toko
    useEffect(() => {
        if (isInitialized) {

            // Evaluasi A: Apakah token valid dan user berhasil dikenali? [cite: 1468]
            if (!isAuthenticated || !user) {
                router.replace('/auth/login');
                return;
            }

            /**
             * ⚡ LOGIKA PROTEKSI SUSPEND (GATEKEEPER):
             * Jika toko berstatus 'suspended', kunci pengguna hanya di halaman /penjual/suspend.
             */
            const isSuspended = user.store?.status === 'suspended';
            
            if (isSuspended) {
                if (pathname !== '/penjual/suspend') {
                    router.replace('/penjual/suspend');
                    return;
                }
                setIsAuthorized(true);
                return;
            }

            /**
             * ⚡ LOGIKA PROTEKSI PENDAFTARAN TOKO (GATEKEEPER):
             * Jika user adalah SELLER tetapi status toko belum 'approved', 
             * kunci pengguna hanya di halaman pendaftaran /penjual/toko. 
             */
            if (user.role === 'seller') {
                const isNotApproved = !user.store || user.store.status !== 'approved';
                
                if (isNotApproved) {
                    if (pathname !== '/penjual/toko') {
                        router.replace('/penjual/toko');
                        return;
                    }
                    setIsAuthorized(true);
                    return;
                }
            }

            // Evaluasi B: Apakah user memiliki hak akses (Role) yang sesuai? [cite: 1468, 1469]
            if (allowedRoles && allowedRoles.length > 0) {
                if (!allowedRoles.includes(user.role)) {
                    const fallbackRoute = user.role === 'admin'
                        ? '/admin/dashboard'
                        : user.role === 'seller'
                            ? '/penjual/dashboard'
                            : '/dashboard';

                    router.replace(fallbackRoute);
                    return;
                }
            }

            // Jika lulus semua evaluasi, buka gerbang [cite: 1470]
            setIsAuthorized(true);
        }
    }, [isInitialized, isAuthenticated, user, allowedRoles, router, pathname]);

    // 3. Fase Rendering (Loading State) [cite: 1470, 1471]
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

    // 4. Render Konten Jika Valid [cite: 1471]
    return <>{children}</>;
}
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isInitialized, fetchMe, user } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                // Tidak ada token di localStorage, tendang ke login
                router.replace('/auth/login');
                return;
            }

            // Jika token ada tapi state zustand kosong, fetch ulang
            if (!isAuthenticated && !isInitialized) {
                await fetchMe();
            }

            setIsChecking(false);
        };

        checkAuth();
    }, [isAuthenticated, isInitialized, fetchMe, router]);

    // Role-based protection (Opsional tapi penting untuk keamanan)
    useEffect(() => {
        if (!isChecking && isAuthenticated && user && allowedRoles) {
            if (!allowedRoles.includes(user.role)) {
                // Punya token tapi beda role (misal pembeli maksa masuk /admin)
                router.replace('/');
            }
        }
    }, [isChecking, isAuthenticated, user, allowedRoles, router]);

    // Selama proses pengecekan, jangan render halamannya agar tidak bocor
    if (isChecking) {
        return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-[#ef3333] font-black tracking-widest text-sm uppercase">Memuat Sesi...</div>;
    }

    // Jika aman, render konten
    return <>{children}</>;
}
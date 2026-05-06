"use client";

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/layout/AuthGuard';
import Sidebar from '@/components/layout/sidebar';
import { Toaster } from 'sonner';

/**
 * ADMIN LAYOUT
 * Layout utama untuk area Admin Command Center.
 * Dilengkapi dengan Sidebar dan perlindungan peran (RBAC).
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    
    // Anda bisa menambahkan pengecualian sidebar di sini jika ada halaman admin tertentu yang fullscreen
    const noSidebarPages: string[] = []; 
    const isNoSidebarPage = noSidebarPages.includes(pathname);

    return (
        <AuthGuard allowedRoles={['admin']}>
            <div className="min-h-screen bg-[#0a0a0b] text-white">
                {isNoSidebarPage ? (
                    // Tampilan Fullscreen (Jika diperlukan di masa depan)
                    <main className="w-full">
                        {children}
                    </main>
                ) : (
                    // Tampilan Standar Admin dengan Sidebar
                    <Sidebar>
                        <main className="animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-7xl mx-auto p-4 md:p-8">
                            {children}
                        </main>
                    </Sidebar>
                )}

                {/* Notifikasi Sistem (Sonner) */}
                <Toaster
                    theme="dark"
                    position="bottom-right"
                    toastOptions={{
                        className: 'bg-[#0a0a0b] border border-zinc-800 text-zinc-100 rounded-2xl shadow-2xl font-medium tracking-wide',
                    }}
                />
            </div>
        </AuthGuard>
    );
}
"use client";

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/layout/AuthGuard';
import Sidebar from '@/components/layout/sidebar';
import { Toaster } from 'sonner';

/**
 * SELLER LAYOUT
 * Layout ini mengatur tampilan untuk area penjual.
 * Menghilangkan sidebar pada halaman pendaftaran toko dan halaman penangguhan.
 */
export default function PenjualLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    
    // Tentukan halaman mana saja yang tidak membutuhkan Sidebar (Fullscreen mode)
    const noSidebarPages = ['/penjual/suspend', '/penjual/toko'];
    const isNoSidebarPage = noSidebarPages.includes(pathname);

    return (
        <AuthGuard allowedRoles={['seller']}>
            {isNoSidebarPage ? (
                // Tampilan Fullscreen untuk halaman Suspend dan Pendaftaran Toko
                <div className="min-h-screen bg-[#0a0a0b]">
                    {children}
                </div>
            ) : (
                // Tampilan Normal dengan Sidebar untuk Dashboard dan Manajemen Produk
                <Sidebar>
                    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto">
                        {children}
                    </div>
                </Sidebar>
            )}

            <Toaster
                theme="dark"
                position="bottom-right"
                toastOptions={{
                    className: 'bg-[#0a0a0b] border border-zinc-800 text-zinc-100 rounded-none shadow-2xl font-medium tracking-wide',
                }}
            />
        </AuthGuard>
    );
}
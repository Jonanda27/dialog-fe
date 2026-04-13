"use client";

import React, { ReactNode, useState } from 'react'; // Tambahkan useState
import AuthGuard from '@/components/layout/AuthGuard';
import Sidebar from '@/components/layout/sidebar';
import Navbar from '@/components/layout/navbar';
import { Toaster } from 'sonner';

/**
 * SELLER LAYOUT (LOCAL SESSION MODE)
 * Isolasi domain khusus penjual (seller). 
 * Akses secara ketat ditolak untuk pembeli atau admin.
 */
export default function PenjualLayout({ children }: { children: ReactNode }) {
    // Menambahkan state untuk mengontrol buka/tutup sidebar pada tampilan mobile
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <AuthGuard allowedRoles={['seller']}>
            <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans flex overflow-hidden">

                {/* 
                  * Panel Navigasi Samping 
                  * Memberikan props agar Sidebar tahu kapan harus muncul di mobile
                */}
                <Sidebar
                    isOpen={isMobileOpen}
                    onClose={() => setIsMobileOpen(false)}
                />

                <div className="flex-1 flex flex-col w-full">
                    {/* 
                      * Header Operasional 
                      * Memberikan fungsi onMenuClick agar tombol hamburger di Navbar bisa bekerja
                    */}
                    <Navbar onMenuClick={() => setIsMobileOpen(true)} />

                    {/* Area Kerja Utama */}
                    <main className="flex-1 overflow-y-auto bg-[#111114] p-4 sm:p-6 lg:p-8">
                        <div className="animate-in fade-in duration-700 max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>

                {/* Konfigurasi Toaster Minimalist */}
                <Toaster
                    theme="dark"
                    position="bottom-right"
                    toastOptions={{
                        className: 'bg-[#0a0a0b] border border-zinc-800 text-zinc-100 rounded-none shadow-2xl font-medium tracking-wide',
                    }}
                />
            </div>
        </AuthGuard>
    );
}
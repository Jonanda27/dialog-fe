"use client";

import React, { ReactNode } from 'react';
import AuthGuard from '@/components/layout/AuthGuard';
import Sidebar from '@/components/layout/sidebar';
import { Toaster } from 'sonner';

/**
 * SELLER LAYOUT (LOCAL SESSION MODE)
 * Isolasi domain khusus penjual (seller). 
 * Akses secara ketat ditolak untuk pembeli atau admin.
 */
export default function PenjualLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard allowedRoles={['seller']}>
            {/* * Panel Navigasi Samping & Header 
              * Sidebar secara internal sudah mengatur state mobile (isMobileOpen)
              * dan merender komponen <Navbar />. Kita hanya perlu meneruskan children.
            */}
            <Sidebar>
                <div className="animate-in fade-in duration-700 max-w-7xl mx-auto">
                    {children}
                </div>
            </Sidebar>

            {/* Konfigurasi Toaster Minimalist */}
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
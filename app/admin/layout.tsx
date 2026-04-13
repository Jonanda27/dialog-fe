"use client";

import React, { ReactNode, useState } from 'react'; // Tambah useState
import AuthGuard from '@/components/layout/AuthGuard';
import Sidebar from '@/components/layout/sidebar';
import Navbar from '@/components/layout/navbar';
import { Toaster } from 'sonner';

export default function AdminLayout({ children }: { children: ReactNode }) {
    // State untuk kontrol menu mobile
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <AuthGuard allowedRoles={['admin']}>
            <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans flex overflow-hidden">
                
                {/* 1. Sidebar: Berikan props isOpen dan onClose agar bisa ditutup di mobile */}
                <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

                <div className="flex-1 flex flex-col w-full">
                    
                    {/* 2. Navbar: Berikan fungsi untuk membuka sidebar mobile */}
                    <Navbar onMenuClick={() => setIsMobileOpen(true)} />

                    <main className="flex-1 overflow-y-auto bg-[#111114] p-4 sm:p-6 lg:p-8">
                        <div className="animate-in fade-in duration-700 max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>

                <Toaster
                    theme="dark"
                    position="bottom-right"
                    toastOptions={{
                        className: 'bg-[#0a0a0b] border border-[#ef3333]/50 text-zinc-100 rounded-none shadow-2xl font-medium tracking-wide',
                    }}
                />
            </div>
        </AuthGuard>
    );
}
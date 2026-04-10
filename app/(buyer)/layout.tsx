"use client";

import React, { ReactNode } from 'react';
import BuyerNavbar from '@/components/layout/BuyerNavbar';
import CartDrawer from '@/components/cart/CartDrawer';
import AuthGuard from '@/components/layout/AuthGuard'; // Import Guard Utama
import { Toaster } from 'sonner';

/**
 * BUYER LAYOUT - REVISED (LOCAL SESSION MODE)
 * Layout ini sekarang diproteksi oleh AuthGuard karena Middleware 
 * tidak lagi mengecek Cookie token untuk rute Buyer.
 */
export default function BuyerLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 selection:bg-red-500/30 font-sans">
                {/* Header Navigasi Reaktif */}
                <BuyerNavbar />

                {/* Main Content Area */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px)]">
                    <div className="animate-in fade-in duration-700">
                        {children}
                    </div>
                </main>

                {/* Global Overlays & Notifications */}
                <CartDrawer />

                {/* Konfigurasi Toaster sesuai Tema Analog Luxury */}
                <Toaster
                    theme="dark"
                    position="bottom-right"
                    toastOptions={{
                        className: 'bg-[#111114] border border-zinc-800 text-white rounded-none shadow-2xl',
                    }}
                />
            </div>
        </AuthGuard>
    );
}
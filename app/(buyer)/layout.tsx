"use client";

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script'; // ⚡ Impor komponen Script untuk loading SDK Midtrans
import BuyerNavbar from '@/components/layout/BuyerNavbar';
import CartDrawer from '@/components/cart/CartDrawer';
import AuthGuard from '@/components/layout/AuthGuard';
import { Toaster } from 'sonner';

/**
 * BUYER LAYOUT - ANALOG LUXURY EDITION
 * Layout ini mengatur kerangka dasar untuk seluruh halaman Buyer.
 * Termasuk sistem proteksi otomatis dan penyesuaian visual brand.
 */
export default function BuyerLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // Halaman Publik: Halaman yang bisa diakses tanpa login.
    const publicPaths = ['/'];
    const isPublicPage = publicPaths.includes(pathname);

    // Wrapper Utama UI (The Canvas)
    const content = (
        /* ⚡ MENTOR NOTE: Menambahkan 'flex flex-col' untuk struktur layout yang lebih solid */
        <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 selection:bg-[#ef3333]/30 selection:text-[#ef3333] font-sans antialiased flex flex-col">
            
            {/* ⚡ MIDTRANS SNAP SDK 
                Script ini wajib dimuat di awal agar window.snap tersedia di halaman pembayaran.
                Karena tidak ada ENV di FE, Client Key dimasukkan langsung di sini.
            */}
            <Script 
    src="https://app.sandbox.midtrans.com/snap/snap.js"
    data-client-key="Mid-client-1CNrIu-xdMwp3Zva"
    strategy="lazyOnload" // ⚡ Mengurangi beban awal dan mencegah inisialisasi ganda yang agresif
    onLoad={() => {
        console.log("Midtrans SDK Loaded Successfully");
    }}
/>

            {/* 1. Header Navigasi (Fixed on Top) */}
            <BuyerNavbar />

            {/* 2. Main Content Area 
                ⚡ PERBAIKAN STRATEGIS: 
                - Menambahkan pt-24 untuk tampilan mobile (Navbar lebih ringkas).
                - Menambahkan lg:pt-[180px] untuk tampilan desktop (Mengakomodasi 3-Tier Navbar).
            */}
            <main className="flex-grow pt-24 lg:pt-[190px]">
                {/* Animate-in memberikan efek muncul perlahan (fade) 
                    saat berpindah antar halaman buyer.
                */}
                <div className="animate-in fade-in duration-1000">
                    {children}
                </div>
            </main>

            {/* 3. Global Overlays (Keranjang Belanja) */}
            <CartDrawer />

            {/* 4. Notifikasi Toast (Custom Styled for Analog.id) */}
            <Toaster
                theme="dark"
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: '#111114',
                        border: '1px solid #27272a',
                        color: '#f4f4f5',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    },
                }}
            />
        </div>
    );

    /**
     * LOGIK PROTEKSI:
     * Jika halaman adalah Homepage (/), tampilkan langsung.
     * Jika halaman lain (Checkout, Profile, dsb), wajib melewati AuthGuard.
     */
    if (isPublicPage) {
        return content;
    }

    return (
        <AuthGuard>
            {content}
        </AuthGuard>
    );
}
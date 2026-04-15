"use client";

import React, { Suspense } from 'react';
import { useAuthStore } from '@/store/authStore';
import PromoHero from '@/components/dashboard/PromoHero';
import ShoppingSummary from '@/components/dashboard/ShoppingSummary';
import ActiveOrderTracker from '@/components/dashboard/ActiveOrderTracker';
import CategoryGrid from '@/components/dashboard/CategoryGrid';
import WishlistPreview from '@/components/dashboard/WishlistPreview';
import RecommendedFeed from '@/components/dashboard/RecommendedFeed';
import GradingHub from '@/components/dashboard/GradingHub';

// Catatan Arsitektur: 
// export const metadata = { ... } dihapus karena Metadata tidak bisa diekspor 
// dari komponen ber-directive "use client". Jika ingin metadata, Anda bisa 
// memindahkannya ke app/(buyer)/layout.tsx.

export default function BuyerDashboard() {
    // Menarik data user secara reaktif dari Zustand (Local Session)
    const { user } = useAuthStore();

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">

            {/* 0. Header Personal (Bukti Integrasi State Berhasil) */}
            <div className="flex flex-col gap-1 border-b border-zinc-900 pb-4">
                <h1 className="text-2xl font-black text-zinc-100 tracking-tight">
                    Selamat datang kembali, <span className="text-[#ef3333]">{user?.full_name || 'Analogers'}</span>!
                </h1>
                <p className="text-sm text-zinc-500 font-medium">
                    Pantau pesanan, katalog incaran, dan rekomendasi rilisan terbaik untukmu.
                </p>
            </div>

            {/* 1. Promo & Search */}
            <PromoHero />

            {/* 2. Shopping Summary (4 Cards) */}
            <ShoppingSummary />

            {/* 3. Main Action Layout (Left: Tracker, Right: Shortcuts & Wishlist) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Kiri: Lacak Pesanan (Mengambil 2 kolom) */}
                <div className="lg:col-span-2">
                    <ActiveOrderTracker />
                </div>

                {/* Kolom Kanan: Kategori & Wishlist */}
                <div className="space-y-6">
                    <CategoryGrid />
                    <WishlistPreview />
                </div>
            </div>

            {/* 3.5. ⚡ NEW: Grading Hub (Video Verification Requests) */}
            <Suspense fallback={
                <div className="h-48 w-full bg-zinc-950 border border-zinc-800 rounded-3xl animate-pulse flex items-center justify-center">
                    <span className="text-zinc-600 font-bold uppercase tracking-widest text-xs">Memuat Grading Hub...</span>
                </div>
            }>
                <GradingHub />
            </Suspense>

            {/* 4. Rekomendasi Produk */}
            <Suspense fallback={
                <div className="h-96 w-full bg-[#111114] border border-zinc-800 rounded-2xl animate-pulse mt-8 flex items-center justify-center">
                    <span className="text-zinc-600 font-bold uppercase tracking-widest text-xs">Memuat Rekomendasi...</span>
                </div>
            }>
                <RecommendedFeed />
            </Suspense>

        </div>
    );
}
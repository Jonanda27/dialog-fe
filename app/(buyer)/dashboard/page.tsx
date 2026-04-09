import { Suspense } from 'react';
import PromoHero from '@/components/dashboard/PromoHero';
import ShoppingSummary from '@/components/dashboard/ShoppingSummary';
import ActiveOrderTracker from '@/components/dashboard/ActiveOrderTracker';
import CategoryGrid from '@/components/dashboard/CategoryGrid';
import WishlistPreview from '@/components/dashboard/WishlistPreview';
import RecommendedFeed from '@/components/dashboard/RecommendedFeed';

export const metadata = {
    title: 'Dashboard Pembeli | Analog.id',
};

export default function BuyerDashboard() {
    return (
        <div className="max-w-7xl mx-auto space-y-8">

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

            {/* 4. Rekomendasi Produk */}
            <Suspense fallback={
                <div className="h-96 w-full bg-zinc-950 border border-zinc-800 rounded-2xl animate-pulse mt-8"></div>
            }>
                <RecommendedFeed />
            </Suspense>

        </div>
    );
}
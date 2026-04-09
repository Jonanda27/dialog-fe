import BuyerNavbar from '@/components/layout/BuyerNavbar';
import CartDrawer from '@/components/cart/CartDrawer';
import { Toaster } from 'sonner';
import { ReactNode } from 'react';

export default function BuyerLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-red-500/30">
            <BuyerNavbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Global Components */}
            <CartDrawer />
            <Toaster theme="dark" position="bottom-right" />
        </div>
    );
}
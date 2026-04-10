'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import CartItemCard from './CartItemCard';

export default function CartDrawer() {
    const router = useRouter();
    const { isOpen, closeCart, items } = useCartStore();

    // Mencegah Hydration Mismatch (Karena Zustand Persist menggunakan localStorage)
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    // Kalkulasi Subtotal Keranjang
    const subtotal = items.reduce((total, item) => {
        return total + (Number(item.product.price) * item.quantity);
    }, 0);

    const formattedSubtotal = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(subtotal);

    const handleCheckout = () => {
        closeCart();
        router.push('/checkout');
    };

    return (
        <>
            {/* Overlay Hitam Transparan */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 transition-opacity"
                    onClick={closeCart}
                />
            )}

            {/* Panel Drawer Kanan */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-100 bg-white border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header Drawer */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white">
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        Keranjang Belanja
                        {items.length > 0 && (
                            <span className="bg-black text-white text-xs py-0.5 px-2 rounded-none">
                                {items.length}
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={closeCart}
                        className="text-gray-400 hover:text-black transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body Drawer (List Item) */}
                <div className="flex-1 overflow-y-auto p-5">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <p className="text-base font-medium">Keranjang Anda masih kosong.</p>
                            <p className="text-sm mt-1">Mulai cari rilisan fisik incaran Anda!</p>
                            <button
                                onClick={closeCart}
                                className="mt-6 border border-black text-black px-6 py-2 text-sm font-bold hover:bg-black hover:text-white transition-colors"
                            >
                                Lanjut Belanja
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {items.map((item) => (
                                <CartItemCard key={item.cart_item_id} item={item} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Drawer (Total & Checkout) */}
                {items.length > 0 && (
                    <div className="border-t border-gray-200 p-5 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-gray-600">Subtotal</span>
                            <span className="text-xl font-extrabold text-gray-900">{formattedSubtotal}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-4 text-center">
                            Ongkos kirim akan dikalkulasi pada halaman checkout.
                        </p>
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-black text-white font-bold py-4 text-sm hover:bg-gray-800 transition-colors uppercase tracking-widest"
                        >
                            Checkout Sekarang
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
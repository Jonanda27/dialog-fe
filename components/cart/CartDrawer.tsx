'use client';

import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartDrawer() {
    const { items, isOpen, toggleCart, removeItem, getTotal } = useCartStore();
    const [mounted, setMounted] = useState(false);

    // Menghindari Hydration Mismatch dari Zustand Persist
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    if (!isOpen) return null;

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleCart}></div>

            {/* Sidebar */}
            <div className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl h-full flex flex-col animate-in slide-in-from-right">

                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Keranjang Belanja</h2>
                    <button onClick={toggleCart} className="text-zinc-500 hover:text-white transition">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="text-center py-10 text-zinc-500">Keranjang masih kosong.</div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                Dari Toko: <span className="text-zinc-300">{items[0].store_name}</span>
                            </p>

                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 items-center">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0">
                                        <Image src={item.mediaUrl} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-white truncate">{item.name}</h3>
                                        <p className="text-xs text-zinc-400">{item.artist}</p>
                                        <p className="text-sm font-medium text-red-400 mt-1">{formatPrice(item.price)} <span className="text-zinc-600 text-xs font-normal">x{item.qty}</span></p>
                                    </div>
                                    <button onClick={() => removeItem(item.id)} className="text-zinc-600 hover:text-red-500 transition px-2">
                                        Hapus
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-zinc-800 bg-zinc-950">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-zinc-400">Total</span>
                            <span className="text-2xl font-bold text-white">{formatPrice(getTotal())}</span>
                        </div>
                        <Link
                            href="/checkout"
                            onClick={toggleCart}
                            className="block w-full text-center bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold transition shadow-lg shadow-red-500/20"
                        >
                            Lanjutkan ke Checkout
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
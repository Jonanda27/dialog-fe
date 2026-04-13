'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { toIDR } from '@/utils/format';
import { Trash2, Plus, Minus, X, Store } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

export default function CartDrawer() {
    const { isOpen, closeCart, items, updateQuantity, removeItem } = useCartStore();

    const subtotal = items.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/40 z-100 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-101 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tighter uppercase">Keranjang Belanja</h2>
                            <button onClick={closeCart} className="p-2 hover:bg-gray-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* List Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <p>Keranjang masih kosong</p>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.cart_item_id} className="flex gap-4">
                                        <div className="relative w-20 h-20 shrink-0 bg-gray-50 border border-gray-100">
                                            <Image
                                                src={item.product.media?.[0]?.media_url || '/vynil.png'}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase font-bold mb-1">
                                                <Store size={10} />
                                                <span className="truncate">{item.product.store?.name}</span>
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 truncate uppercase">{item.product.name}</h4>
                                            <p className="text-sm font-black text-black mt-1">{toIDR(item.product.price)}</p>

                                            <div className="flex items-center justify-between mt-3">
                                                {/* Qty Controls */}
                                                <div className="flex items-center border border-gray-200">
                                                    <button
                                                        onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                                                        className="p-1 hover:bg-gray-50"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="px-3 text-xs font-bold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                                                        className="p-1 hover:bg-gray-50"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.cart_item_id)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-gray-100 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-500 uppercase">Subtotal</span>
                                    <span className="text-xl font-black">{toIDR(subtotal)}</span>
                                </div>
                                <Link
                                    href="/checkout"
                                    onClick={closeCart}
                                    className="block w-full bg-black text-white text-center py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                                >
                                    Checkout
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, User, Menu, LogOut } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function BuyerNavbar() {
    const [isMounted, setIsMounted] = useState(false);
    const { items, openCart } = useCartStore();

    // Integrasi dengan AuthStore
    const { user, isAuthenticated, logout } = useAuthStore();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className="sticky top-0 z-40 w-full bg-[#0a0a0b]/90 backdrop-blur-md border-b border-zinc-900 transition-all">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo Clean UI */}
                <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-zinc-100">
                    Analog<span className="text-[#ef3333]">.id</span>
                </Link>

                {/* Icons & Actions Area */}
                <div className="flex items-center gap-5">
                    <button className="text-zinc-400 hover:text-white transition-colors">
                        <Search size={20} />
                    </button>

                    {/* Cart Action */}
                    <button
                        onClick={openCart}
                        className="text-zinc-400 hover:text-white transition-colors relative"
                    >
                        <ShoppingCart size={20} />
                        {isMounted && cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#ef3333] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(239,51,51,0.5)]">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {/* User Area Berdasarkan Status Autentikasi */}
                    {isMounted && isAuthenticated && user ? (
                        <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-zinc-800">
                            {/* Pintu masuk ke dashboard berdasarkan Role */}
                            <Link
                                href={user.role === 'admin' ? '/admin/dashboard' : user.role === 'seller' ? '/penjual/dashboard' : '/dashboard'}
                                className="flex items-center gap-2 group"
                            >
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}&backgroundColor=ef3333`}
                                    className="w-7 h-7 rounded-full border border-zinc-700 group-hover:border-[#ef3333] transition-colors"
                                    alt="Avatar"
                                />
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white">
                                    {user.full_name.split(' ')[0]} {/* Tampilkan nama depan saja */}
                                </span>
                            </Link>

                            <button onClick={() => logout()} className="text-zinc-500 hover:text-[#ef3333] transition-colors" title="Keluar">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        // Jika belum login
                        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-zinc-800">
                            <Link href="/auth/login" className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors">
                                Masuk
                            </Link>
                            <Link href="/auth/register" className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-4 py-2 hover:bg-zinc-200 transition-colors">
                                Daftar
                            </Link>
                        </div>
                    )}

                    <button className="md:hidden text-zinc-400 hover:text-white transition-colors">
                        <Menu size={22} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
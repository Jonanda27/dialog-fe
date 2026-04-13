'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, LogOut, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

/**
 * BUYER NAVBAR - ANALOG LUXURY EDITION
 * Navigasi utama dengan efek glassmorphism saat di-scroll.
 */
export default function BuyerNavbar() {
    const [isMounted, setIsMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { items, openCart } = useCartStore();
    const { user, isAuthenticated, logout } = useAuthStore();

    useEffect(() => {
        setIsMounted(true);
        const handleScroll = () => {
            // Memberikan threshold scroll untuk memicu perubahan warna navbar
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav
            className={`fixed top-0 w-full z-[100] transition-all duration-500 px-6 
            ${scrolled
                    ? "bg-[#111114]/90 backdrop-blur-md py-3 border-b border-zinc-800 shadow-2xl"
                    : "bg-[#0a0a0b] py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                {/* LOGO: Menggunakan Black Typography agar terlihat prestisius */}
                <Link
                    href="/"
                    className="text-2xl font-black text-[#ef3333] tracking-tighter uppercase shrink-0 hover:opacity-80 transition-opacity"
                >
                    Analog<span className="text-white">.id</span>
                </Link>

                {/* SEARCH BAR: Desain minimalis dengan focus-ring merah */}
                <div className="hidden md:flex flex-1 max-w-xl mx-12 relative group">
                    <input
                        type="text"
                        placeholder="Cari piringan hitam, kaset, atau audio gear..."
                        className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-xl px-5 py-2.5 text-xs text-zinc-200 
                                 placeholder:text-zinc-600 focus:outline-none focus:border-[#ef3333]/50 
                                 focus:ring-1 focus:ring-[#ef3333]/20 transition-all duration-300"
                    />
                    <div className="absolute right-4 top-2.5 text-zinc-600 group-focus-within:text-[#ef3333] transition-colors">
                        <Search size={16} strokeWidth={2.5} />
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-6 shrink-0">

                    {/* CART: Dengan badge notifikasi yang menyala */}
                    <button
                        onClick={openCart}
                        className="relative text-zinc-400 hover:text-[#ef3333] transition-all duration-300 active:scale-90"
                    >
                        <ShoppingBag size={22} strokeWidth={2.2} />
                        {isMounted && cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-[#ef3333] text-white text-[9px] font-black w-4 h-4 
                                           flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(239,51,51,0.5)] 
                                           animate-in zoom-in duration-300">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {/* DIVIDER */}
                    <div className="h-5 w-px bg-zinc-800 mx-1"></div>

                    {/* AUTH AREA */}
                    {isMounted && isAuthenticated && user ? (
                        <div className="flex items-center gap-5">
                            {/* PROFILE LINK */}
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 group"
                            >
                                <div className="relative">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                        className="w-8 h-8 rounded-full border border-zinc-800 group-hover:border-[#ef3333] transition-all duration-300 object-cover"
                                        alt="User Avatar"
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#111114] rounded-full"></div>
                                </div>
                                <div className="hidden lg:flex flex-col text-left leading-none">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Kolektor</span>
                                    <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">
                                        {user.full_name.split(' ')[0]}
                                    </span>
                                </div>
                            </Link>

                            {/* LOGOUT */}
                            <button
                                onClick={() => logout()}
                                className="text-zinc-600 hover:text-[#ef3333] transition-all p-1"
                                title="Keluar dari Akun"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        // GUEST AREA
                        <div className="flex items-center gap-6">
                            <Link
                                href="/auth/login"
                                className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-[#ef3333] transition-colors"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/auth/register"
                                className="bg-[#ef3333] text-white px-7 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest 
                                         hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 active:scale-95"
                            >
                                Daftar
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
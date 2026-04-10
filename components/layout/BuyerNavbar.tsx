'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, User, Menu } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function BuyerNavbar() {
    const [isMounted, setIsMounted] = useState(false);
    const { items, openCart } = useCartStore();

    // Menangani Hydration Persistence
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl font-black tracking-tighter italic">
                    ANALOG<span className="text-gray-400">.ID</span>
                </Link>

                {/* Icons Area */}
                <div className="flex items-center gap-5">
                    <button className="text-gray-600 hover:text-black transition-colors">
                        <Search size={22} />
                    </button>

                    {/* Cart Badge with Safe Client Rendering */}
                    <button
                        onClick={openCart}
                        className="text-gray-600 hover:text-black transition-colors relative"
                    >
                        <ShoppingCart size={22} />
                        {isMounted && cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-none border-2 border-white">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <Link href="/dashboard" className="text-gray-600 hover:text-black transition-colors">
                        <User size={22} />
                    </Link>

                    <button className="md:hidden text-gray-600">
                        <Menu size={22} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
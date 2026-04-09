import Link from 'next/link';
import { getMe } from '@/utils/serverAuth';

export default async function BuyerNavbar() {
    // Fetch data user secara asinkron di Server Component
    const user = await getMe();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tighter text-white">
                            ANALOG<span className="text-red-500">.ID</span>
                        </span>
                    </Link>

                    {/* Search Bar (Tengah) */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Cari kaset, vinyl, atau artist..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-4 pr-10 text-sm text-zinc-100 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                            />
                            <svg className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* Right Menu */}
                    <div className="flex items-center gap-6">
                        {/* Cart Icon */}
                        <Link href="/cart" className="relative text-zinc-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                2
                            </span>
                        </Link>

                        {/* Profile Menu */}
                        <div className="flex items-center gap-3 border-l border-zinc-800 pl-6">
                            <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold border border-zinc-700">
                                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="hidden sm:block text-sm">
                                <p className="text-zinc-200 font-medium leading-none">{user?.full_name || 'Guest'}</p>
                                <p className="text-zinc-500 text-xs mt-1 capitalize">{user?.role || 'Buyer'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
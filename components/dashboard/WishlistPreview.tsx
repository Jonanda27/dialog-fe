'use client';
import Image from 'next/image';

export default function WishlistPreview() {
    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Wishlist Anda</h3>
                <button className="text-sm text-red-500 hover:text-red-400 font-medium">Lihat Semua</button>
            </div>

            <div className="space-y-4">
                {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded bg-zinc-900 border border-zinc-800 shrink-0">
                            <Image src="/vynil.png" alt="Wishlist" fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">Abbey Road - The Beatles</h4>
                            <p className="text-xs font-bold text-red-400 mt-0.5">Rp 450.000</p>
                        </div>
                        <button className="p-2 bg-zinc-800 hover:bg-red-600 text-zinc-300 hover:text-white rounded-lg transition-colors" title="Tambah ke Keranjang">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
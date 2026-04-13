'use client';

import Image from 'next/image';

export default function WishlistPreview() {
    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight">Wishlist Anda</h3>
                <button className="text-xs text-[#ef3333] hover:text-red-400 font-bold uppercase tracking-wider transition-colors">Lihat Semua</button>
            </div>

            <div className="space-y-4 flex-1">
                {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 group">
                        <div className="relative w-14 h-14 rounded-lg bg-[#111114] border border-zinc-800 shrink-0 overflow-hidden group-hover:border-zinc-600 transition-colors">
                            <Image src="/vynil.png" alt="Wishlist" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-zinc-100 truncate">Abbey Road - The Beatles</h4>
                            <p className="text-xs font-bold text-zinc-500 mt-1">Rp 450.000</p>
                        </div>
                        <button className="p-2.5 bg-[#111114] border border-zinc-800 hover:bg-[#ef3333] hover:border-[#ef3333] text-zinc-400 hover:text-white rounded-xl transition-all" title="Tambah ke Keranjang">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
'use client';

export default function PromoHero() {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800">
            {/* Background Graphic */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-transparent z-0"></div>
            <div className="absolute right-0 top-0 w-1/2 h-full bg-[url('/vynil.png')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>

            <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="w-full md:w-1/2">
                    <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 font-bold text-xs uppercase tracking-wider rounded-md mb-3 border border-emerald-500/20">
                        Promo Spesial
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                        Gratis Ongkir Vinyl Hari Ini!
                    </h2>
                    <p className="text-zinc-400 text-sm mb-6">
                        Gunakan kode <span className="text-white font-bold bg-zinc-800 px-2 py-0.5 rounded">ANALOGFREE</span> saat checkout.
                    </p>

                    {/* Search Bar Utama */}
                    <div className="relative flex items-center w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Cari album, artis, atau genre..."
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-3 pl-12 pr-4 text-sm text-zinc-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                        />
                        <svg className="absolute left-4 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <button className="absolute right-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded-md transition-colors">
                            Cari
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
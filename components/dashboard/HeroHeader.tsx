'use client';

import Link from 'next/link';

/**
 * HERO HEADER - ANALOG LUXURY EDITION
 * Menampilkan kampanye utama dengan gaya poster koleksi terbatas.
 */
export default function HeroHeader() {
    return (
        <section className="w-full h-[450px] bg-[#1a1a1a] rounded-2xl overflow-hidden mb-12 border border-zinc-800/50 relative group cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

            {/* 1. GRADIENT OVERLAY: Membuat teks menonjol di atas gambar */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10 flex flex-col justify-center px-10 md:px-16 text-left">

                {/* SUB-HEADLINE: Gaya Label Eksklusif */}
                <div className="flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-left-4 duration-700">
                    <span className="w-8 h-px bg-[#ef3333]"></span>
                    <h2 className="text-[#ef3333] font-black text-[10px] md:text-xs uppercase tracking-[0.4em]">
                        Exclusively Drops
                    </h2>
                </div>

                {/* MAIN HEADLINE: Tipografi Bold & Masif */}
                <h1 className="text-white text-5xl md:text-6xl font-black uppercase leading-[0.9] tracking-tighter animate-in fade-in slide-in-from-left-6 duration-1000">
                    VINTAGE <br />
                    <span className="text-zinc-400 group-hover:text-white transition-colors duration-500">COLLECTION</span>
                    <span className="text-[#ef3333]"> 2026</span>
                </h1>

                {/* DESCRIPTION */}
                <p className="text-zinc-400 mt-6 max-w-sm text-xs md:text-sm font-medium leading-relaxed opacity-80 animate-in fade-in slide-in-from-left-8 duration-1000">
                    Kurasi piringan hitam dan kaset pita klasik dengan grading fisik terpercaya untuk koleksi autentik Anda.
                </p>

                {/* CTA BUTTON: Desain Minimalis & Tajam */}
                <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                    <Link
                        href="/katalog"
                        className="group/btn relative inline-flex items-center justify-center px-10 py-3.5 overflow-hidden font-black text-white bg-[#ef3333] rounded-lg transition-all duration-300 hover:bg-red-700 shadow-lg shadow-red-900/20 active:scale-95"
                    >
                        <span className="relative text-[10px] uppercase tracking-[0.2em]">Mulai Eksplorasi</span>
                    </Link>
                </div>
            </div>

            {/* 2. BACKGROUND IMAGE: Dengan efek Ken Burns (slow zoom) */}
            <div
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=1200')] 
                           bg-cover bg-center opacity-60 scale-100 group-hover:scale-110 transition-transform duration-[3000ms] ease-out"
            ></div>

            {/* 3. DECORATIVE ELEMENT: Cahaya tipis di tepi (Glow) */}
            <div className="absolute inset-0 border border-white/5 rounded-2xl z-20 pointer-events-none"></div>
        </section>
    );
}
'use client';

import { motion } from 'framer-motion';

export default function HeroHeader({ user }: { user: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-red-950/20 border border-zinc-800 p-8 md:p-10 col-span-full"
        >
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-amber-700/20 text-amber-400 text-xs font-bold uppercase tracking-widest rounded-full border border-amber-500/30">
                            ✦ Analog Purist
                        </span>
                        <span className="text-zinc-500 text-sm font-medium">Level 4 Collector</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight">
                        Selamat Datang Kembali, <span className="text-zinc-300 italic">{user?.full_name?.split(' ')[0] || 'Kolektor'}</span>.
                    </h1>
                    <p className="text-zinc-400 mt-4 max-w-xl text-sm leading-relaxed">
                        Ruang dengar eksklusif Anda. Pantau pergerakan rilisan fisik, periksa hasil grading, dan temukan kurasi musik yang sefrekuensi dengan koleksi Anda.
                    </p>
                </div>

                <div className="hidden lg:flex items-center justify-center h-24 w-24 rounded-full border border-zinc-800 bg-zinc-900/50 shadow-[0_0_40px_rgba(225,29,72,0.1)]">
                    <span className="text-3xl text-red-500">🎧</span>
                </div>
            </div>

            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-900/20 blur-[100px] rounded-full pointer-events-none"></div>
        </motion.div>
    );
}
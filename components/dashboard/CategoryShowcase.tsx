'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CategoryShowcase() {
    const categories = [
        { name: 'Vinyl (Piringan Hitam)', icon: '💿', color: 'from-zinc-800 to-zinc-900', link: '/katalog?format=Vinyl' },
        { name: 'Kaset Pita', icon: '📼', color: 'from-amber-900/40 to-zinc-900', link: '/katalog?format=Cassette' },
        { name: 'Compact Disc', icon: '💽', color: 'from-indigo-900/40 to-zinc-900', link: '/katalog?format=CD' },
        { name: 'Audio Gear & Player', icon: '📻', color: 'from-red-900/40 to-zinc-900', link: '/katalog?format=Gear' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between"
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-serif text-white">Eksplorasi Format</h2>
                <Link href="/katalog" className="text-xs text-red-500 hover:text-red-400 font-bold uppercase tracking-widest transition-colors">
                    Katalog ⭢
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {categories.map((cat, idx) => (
                    <Link
                        key={idx}
                        href={cat.link}
                        className={`flex flex-col items-start p-4 rounded-2xl bg-gradient-to-br ${cat.color} border border-zinc-800/50 hover:border-zinc-600 transition-all group`}
                    >
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                        <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">{cat.name}</span>
                    </Link>
                ))}
            </div>
        </motion.div>
    );
}
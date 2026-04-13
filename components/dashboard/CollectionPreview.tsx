'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function CollectionPreview() {
    // Simulasi cover album yang dibanggakan user
    const showcaseCovers = [
        '/vynil.png', // Fallback image kita
        '/vynil.png',
        '/vynil.png'
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group"
        >
            <div className="relative z-10 flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-serif text-white mb-1">Koleksi Publik</h2>
                    <p className="text-xs text-zinc-500">Pamerkan holy grail Anda.</p>
                </div>
                <button className="text-zinc-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </button>
            </div>

            {/* Overlapping Album Art Effect */}
            <div className="relative h-24 w-full flex items-center justify-center mt-auto">
                {showcaseCovers.map((cover, idx) => (
                    <div
                        key={idx}
                        className={`absolute w-20 h-20 rounded-md border border-zinc-700 shadow-2xl overflow-hidden bg-zinc-900 transition-transform duration-500 group-hover:-translate-y-2`}
                        style={{
                            zIndex: showcaseCovers.length - idx,
                            transform: `translateX(${(idx - 1) * 30}px) rotate(${(idx - 1) * 10}deg) scale(${1 - (idx * 0.05)})`,
                        }}
                    >
                        <Image src={cover} alt="Koleksi" fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>

            <div className="absolute inset-0 bg-linear-to-t from-red-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </motion.div>
    );
}
'use client';

import { motion } from 'framer-motion';

export default function GradingHub() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8"
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-serif text-white">Grading Hub</h2>
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 hover:border-red-900/50 transition-colors cursor-pointer group">
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                        <span className="text-xl">📼</span>
                    </div>
                    <div>
                        <p className="text-xs text-amber-400 font-bold tracking-wider uppercase mb-1">Video Ready</p>
                        <p className="text-sm text-zinc-200 font-medium group-hover:text-red-400 transition-colors">Nevermind - Nirvana (Cassette)</p>
                        <p className="text-xs text-zinc-500 mt-1">Seller telah mengunggah video grading.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
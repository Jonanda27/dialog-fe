'use client';

import { motion } from 'framer-motion';

export default function FinancialWidget() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 relative overflow-hidden group"
        >
            <div className="relative z-10">
                <h2 className="text-lg font-serif text-white mb-6">Financial Integrity</h2>

                <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Dana Escrow</p>
                            <p className="text-2xl font-bold text-white">Rp 1.250.000</p>
                        </div>
                        <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Aman Tertahan</span>
                    </div>

                    <div className="flex justify-between items-end pt-2">
                        <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Saldo Refund</p>
                            <p className="text-lg font-bold text-zinc-300">Rp 0</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Luxury Gradient Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        </motion.div>
    );
}
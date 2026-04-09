'use client';

import { motion } from 'framer-motion';

export default function OrderPulse() {
    const steps = [
        { label: 'Dibayar', active: true, done: true },
        { label: 'Dikirim', active: true, done: false, pulse: true },
        { label: 'Tiba', active: false, done: false },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between"
        >
            <div>
                <h2 className="text-lg font-serif text-white mb-1">Order Pulse</h2>
                <p className="text-xs text-zinc-500 mb-6">INV/202604/ANLG/001</p>
            </div>

            <div className="relative flex items-center justify-between w-full mt-auto">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-800 z-0"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-0.5 bg-red-800 z-0"></div>

                {steps.map((step, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${step.done ? 'bg-red-500 border-red-500' : step.pulse ? 'bg-zinc-950 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse' : 'bg-zinc-950 border-zinc-700'}`}></div>
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${step.active ? 'text-zinc-300' : 'text-zinc-600'}`}>{step.label}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
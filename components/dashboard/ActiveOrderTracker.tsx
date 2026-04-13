'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

// Mendefinisikan tipe lokal jika belum ter-export sempurna dari types/order
type TrackerStatus = 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed';

const STEPS = [
    { label: 'Paid', status: ['paid', 'processing', 'shipped', 'delivered', 'completed'] },
    { label: 'Process', status: ['processing', 'shipped', 'delivered', 'completed'] },
    { label: 'Shipped', status: ['shipped', 'delivered', 'completed'] },
    { label: 'Complete', status: ['completed'] },
];

export default function ActiveOrderTracker() {
    // State lokal untuk simulasi/integrasi API. Default 'processing'
    const [currentStatus, setCurrentStatus] = useState<TrackerStatus>('processing');

    // Nanti Anda bisa gunakan useEffect ini untuk fetch status pesanan terbaru dari API
    // useEffect(() => { OrderService.getLatestActiveOrder().then(res => setCurrentStatus(res.status)) }, []);

    return (
        <div className="w-full h-full py-8 px-4 border border-zinc-800 bg-zinc-950 rounded-2xl flex flex-col justify-center relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-8 px-4">Status Pesanan Terakhir</h3>

            <div className="flex justify-between items-center relative w-full px-4">
                {STEPS.map((step, idx) => {
                    const isActive = step.status.includes(currentStatus);

                    return (
                        <div key={idx} className="flex flex-col items-center z-10 flex-1">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 mb-3 transition-all duration-500 shadow-xl ${isActive
                                ? 'bg-[#ef3333] border-[#ef3333] text-white shadow-[#ef3333]/20'
                                : 'bg-[#111114] border-zinc-800 text-zinc-600'
                                }`}>
                                {isActive ? <Check size={18} strokeWidth={3} /> : <span className="text-[12px] font-black">{idx + 1}</span>}
                            </div>
                            <span className={`text-[10px] uppercase font-black tracking-widest ${isActive ? 'text-zinc-100' : 'text-zinc-600'
                                }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}

                {/* Background Line (Progress Bar Base) */}
                <div className="absolute top-5 left-[15%] right-[15%] h-0.5 bg-zinc-800 z-0" />
            </div>
        </div>
    );
}
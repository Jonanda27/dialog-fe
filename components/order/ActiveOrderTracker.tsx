'use client';

import { OrderStatus } from '@/types/order';
import { Check } from 'lucide-react';

interface TrackerProps {
    status: OrderStatus;
}

const STEPS = [
    { label: 'Paid', status: ['paid', 'processing', 'shipped', 'delivered', 'completed'] },
    { label: 'Process', status: ['processing', 'shipped', 'delivered', 'completed'] },
    { label: 'Shipped', status: ['shipped', 'delivered', 'completed'] },
    { label: 'Complete', status: ['completed'] },
];

export default function ActiveOrderTracker({ status }: TrackerProps) {
    return (
        <div className="w-full py-8 px-4 border border-gray-100 bg-gray-50 flex justify-between items-center relative overflow-hidden">
            {STEPS.map((step, idx) => {
                const isActive = step.status.includes(status);

                return (
                    <div key={idx} className="flex flex-col items-center z-10 flex-1">
                        <div className={`w-8 h-8 flex items-center justify-center border-2 mb-2 transition-all duration-500 ${isActive ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-gray-200'
                            }`}>
                            {isActive ? <Check size={14} /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                        </div>
                        <span className={`text-[10px] uppercase font-black tracking-widest ${isActive ? 'text-black' : 'text-gray-300'
                            }`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}

            {/* Background Line */}
            <div className="absolute top-12 left-[12%] right-[12%] h-0.5 bg-gray-200 z-0" />
        </div>
    );
}
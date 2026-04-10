'use client';

import { OrderStatus } from '@/types/order';

interface ActiveOrderTrackerProps {
    status: OrderStatus;
    trackingNumber?: string | null;
}

export default function ActiveOrderTracker({ status, trackingNumber }: ActiveOrderTrackerProps) {
    const orderStatuses: OrderStatus[] = ['pending_payment', 'paid', 'processing', 'shipped', 'completed'];

    // Normalisasi status 'delivered' agar sejajar dengan 'shipped' di UI tracker dasar
    const normalizedStatus = status === 'delivered' ? 'shipped' : status;
    const currentStatusIndex = orderStatuses.indexOf(normalizedStatus);

    const steps = [
        { label: 'Belum Dibayar' },
        { label: 'Dibayar' },
        { label: 'Diproses' },
        { label: 'Dikirim' },
        { label: 'Selesai' },
    ];

    return (
        <div className="mb-10">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Status Pengiriman</h3>

            <div className="relative">
                {/* Garis Background Tracker */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0 hidden sm:block" />

                <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
                    {steps.map((step, idx) => {
                        const isActive = currentStatusIndex >= idx;
                        const isCurrent = currentStatusIndex === idx;

                        return (
                            <div key={idx} className="flex sm:flex-col items-center gap-4 sm:gap-2 bg-white px-2">
                                <div className={`w-8 h-8 border-2 flex items-center justify-center font-bold text-sm transition-colors ${isActive
                                    ? 'bg-black border-black text-white'
                                    : 'bg-white border-gray-300 text-gray-400'
                                    }`}>
                                    {isActive ? '✓' : idx + 1}
                                </div>
                                <span className={`text-sm font-semibold ${isCurrent ? 'text-black' : isActive ? 'text-gray-700' : 'text-gray-400'
                                    }`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Info Resi */}
            {trackingNumber && (
                <div className="mt-8 bg-gray-50 border border-gray-200 p-4">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Nomor Resi Pengiriman</span>
                    <p className="text-lg font-mono font-bold text-gray-900 mt-1">{trackingNumber}</p>
                </div>
            )}
        </div>
    );
}
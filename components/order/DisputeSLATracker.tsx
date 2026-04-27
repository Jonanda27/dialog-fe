// components/order/DisputeSLATracker.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Timer, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Dispute } from '@/types/dispute';

interface DisputeSLATrackerProps {
    dispute: Dispute;
}

export default function DisputeSLATracker({ dispute }: DisputeSLATrackerProps) {
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
    const [isExpired, setIsExpired] = useState(false);

    // Menentukan Deadline berdasarkan status saat ini
    const slaConfig = useMemo(() => {
        // CASE 1: Pembeli harus input resi (3x24 jam dari accepted_at)
        if (dispute.status === 'returning' && !dispute.return_tracking_number && dispute.accepted_at) {
            return {
                title: 'Batas Waktu Input Resi',
                startTime: new Date(dispute.accepted_at).getTime(),
                durationHours: 72, // 3 Hari
                description: 'Segera kirim barang dan masukkan nomor resi sebelum waktu habis, atau komplain akan dibatalkan otomatis.',
                color: 'text-orange-500',
                bgColor: 'bg-orange-500/10',
                borderColor: 'border-orange-500/20'
            };
        }

        // CASE 2: Penjual/Admin harus konfirmasi penerimaan (2x24 jam dari arrived_at)
        if (dispute.status === 'arrived_at_seller' && dispute.arrived_at) {
            return {
                title: 'Batas Konfirmasi Penerimaan',
                startTime: new Date(dispute.arrived_at).getTime(),
                durationHours: 48, // 2 Hari
                description: 'Sistem akan melakukan refund otomatis jika penjual tidak melakukan konfirmasi dalam batas waktu ini.',
                color: 'text-blue-500',
                bgColor: 'bg-blue-500/10',
                borderColor: 'border-blue-500/20'
            };
        }

        return null;
    }, [dispute]);

    useEffect(() => {
        if (!slaConfig) return;

        const calculateTimeLeft = () => {
            const deadline = slaConfig.startTime + slaConfig.durationHours * 60 * 60 * 1000;
            const now = new Date().getTime();
            const difference = deadline - now;

            if (difference <= 0) {
                setIsExpired(true);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setTimeLeft({
                hours: Math.floor(difference / (1000 * 60 * 60)),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [slaConfig]);

    if (!slaConfig) return null;

    // Hitung persentase progress bar
    const progress = timeLeft ? Math.max(0, Math.min(100,
        ((timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds) / (slaConfig.durationHours * 3600)) * 100
    )) : 0;

    return (
        <div className={`p-5 rounded-2xl border ${slaConfig.borderColor} ${slaConfig.bgColor} animate-in fade-in slide-in-from-top-2 duration-500`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full bg-zinc-900/50 ${slaConfig.color}`}>
                        {isExpired ? <AlertCircle size={20} /> : <Timer size={20} className="animate-pulse" />}
                    </div>
                    <div>
                        <h4 className={`text-sm font-black uppercase tracking-widest ${slaConfig.color}`}>
                            {slaConfig.title}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 max-w-md leading-relaxed font-medium">
                            {slaConfig.description}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    {timeLeft && (
                        <div className="flex items-center gap-2 font-mono text-xl font-black text-white tracking-tighter">
                            <div className="bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                                {String(timeLeft.hours).padStart(2, '0')}h
                            </div>
                            <span className="text-zinc-600">:</span>
                            <div className="bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                                {String(timeLeft.minutes).padStart(2, '0')}m
                            </div>
                            <span className="text-zinc-600">:</span>
                            <div className="bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                                {String(timeLeft.seconds).padStart(2, '0')}s
                            </div>
                        </div>
                    )}
                    <span className="text-[10px] uppercase font-bold text-zinc-500 mt-2 tracking-widest">Waktu Tersisa</span>
                </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-4 h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                <div
                    className={`h-full transition-all duration-1000 ease-linear ${progress < 20 ? 'bg-red-500' : progress < 50 ? 'bg-orange-500' : 'bg-zinc-100'
                        }`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {progress < 20 && !isExpired && (
                <div className="mt-3 flex items-center gap-2 text-red-500 animate-bounce">
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Waktu hampir habis! Segera selesaikan aksi Anda.</span>
                </div>
            )}
        </div>
    );
}
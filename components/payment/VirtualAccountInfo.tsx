'use client';

import { Copy, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toIDR } from '@/utils/format';
import { toast } from 'sonner';

interface VAProps {
    vaNumber: string;
    bankName: string;
    totalAmount: number | string; // Mengakomodasi string jika nilai dari DB belum di-parse
    expiryTime: string; // ⚡ BARU: Waktu kadaluarsa dalam format ISO String dari Backend
}

export default function VirtualAccountInfo({ vaNumber, bankName, totalAmount, expiryTime }: VAProps) {
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>('Menghitung...');
    const [isExpired, setIsExpired] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(vaNumber);
        setCopied(true);
        toast.success('Nomor Virtual Account berhasil disalin!');
        setTimeout(() => setCopied(false), 2000);
    };

    // ⚡ LOGIKA BISNIS: Countdown Timer
    useEffect(() => {
        if (!expiryTime) return;

        const targetDate = new Date(expiryTime).getTime();

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance <= 0) {
                clearInterval(timer);
                setTimeLeft('00:00:00');
                setIsExpired(true);
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(timer);
    }, [expiryTime]);

    return (
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            {/* Header / Timer Section */}
            <div className={`p-4 flex items-center justify-center gap-2 border-b ${isExpired ? 'bg-red-50 border-red-100 text-red-600' : 'bg-orange-50 border-orange-100 text-orange-700'
                }`}>
                {isExpired ? <AlertCircle size={18} /> : <Clock size={18} />}
                <p className="text-sm font-bold uppercase tracking-widest">
                    {isExpired ? 'WAKTU PEMBAYARAN HABIS' : `SISA WAKTU: ${timeLeft}`}
                </p>
            </div>

            <div className="p-8 space-y-6">
                <div className="text-center pb-6 border-b border-gray-100">
                    <p className="text-sm text-gray-500 uppercase font-bold tracking-widest mb-2">Total Pembayaran</p>
                    <h2 className={`text-4xl font-black ${isExpired ? 'text-gray-400 line-through' : 'text-black'}`}>
                        {toIDR(Number(totalAmount))}
                    </h2>
                </div>

                <div className="space-y-4 relative">
                    {/* Overlay jika waktu habis (Mencegah interaksi lebih lanjut) */}
                    {isExpired && (
                        <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-red-600 text-white px-4 py-1 text-xs font-bold uppercase tracking-widest">Kadaluarsa</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 font-bold uppercase">Bank</span>
                        <span className="font-black text-gray-900 uppercase tracking-wider">{bankName}</span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-gray-500 font-bold uppercase tracking-wide">Nomor Virtual Account</label>
                        <div className="flex items-center justify-between bg-gray-50 p-4 border border-gray-200 rounded-sm">
                            <span className="text-xl font-mono font-bold tracking-widest text-gray-900">
                                {vaNumber}
                            </span>
                            <button
                                onClick={copyToClipboard}
                                disabled={isExpired}
                                className="flex items-center gap-2 text-xs font-bold uppercase text-gray-600 hover:text-black transition-colors disabled:opacity-50"
                            >
                                {copied ? <CheckCircle2 size={16} className="text-green-600" /> : <Copy size={16} />}
                                {copied ? <span className="text-green-600">Tersalin</span> : 'Salin'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-6">
                    <p className="text-xs text-gray-500 leading-relaxed text-center">
                        Sistem memverifikasi pembayaran secara otomatis. Simpan struk/bukti transfer sebagai referensi yang sah.
                    </p>
                </div>
            </div>
        </div>
    );
}
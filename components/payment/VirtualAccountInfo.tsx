'use client';

import { Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toIDR } from '@/utils/format';
import { toast } from 'sonner';

interface VAProps {
    vaNumber: string;
    bankName: string;
    totalAmount: number;
}

export default function VirtualAccountInfo({ vaNumber, bankName, totalAmount }: VAProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(vaNumber);
        setCopied(true);
        toast.success('Nomor VA disalin!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white border border-gray-200 p-8 space-y-6">
            <div className="text-center pb-6 border-b border-gray-100">
                <p className="text-sm text-gray-500 uppercase font-bold tracking-widest mb-2">Total Pembayaran</p>
                <h2 className="text-4xl font-black text-black">{toIDR(totalAmount)}</h2>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-bold uppercase">Bank</span>
                    <span className="font-black text-gray-900 uppercase">{bankName}</span>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-bold uppercase">Nomor Virtual Account</label>
                    <div className="flex items-center justify-between bg-gray-50 p-4 border border-gray-100">
                        <span className="text-xl font-mono font-bold tracking-widest">{vaNumber}</span>
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 text-xs font-bold uppercase hover:text-blue-600 transition-colors"
                        >
                            {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                            {copied ? 'Tersalin' : 'Salin'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-4 p-4 bg-blue-50 border border-blue-100">
                <p className="text-[10px] text-blue-700 leading-relaxed">
                    * Mohon lakukan pembayaran sebelum 24 jam. Pesanan akan otomatis dibatalkan jika melewati batas waktu.
                </p>
            </div>
        </div>
    );
}
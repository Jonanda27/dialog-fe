// components/order/SubmitResiModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Truck, Loader2, Info } from 'lucide-react';
import { useDisputeStore } from '@/store/disputeStore';
import { toast } from 'sonner';

interface SubmitResiModalProps {
    isOpen: boolean;
    onClose: () => void;
    disputeId: string;
    onSuccess?: () => void;
}

const SUPPORTED_COURIERS = [
    { id: 'jne', name: 'JNE Express' },
    { id: 'jnt', name: 'J&T Express' },
    { id: 'sicepat', name: 'SiCepat' },
    { id: 'tiki', name: 'TIKI' },
    { id: 'pos', name: 'Pos Indonesia' },
    { id: 'anteraja', name: 'Anteraja' },
];

export default function SubmitResiModal({ isOpen, onClose, disputeId, onSuccess }: SubmitResiModalProps) {
    const { submitReturnResi } = useDisputeStore();

    // State deklarasi
    const [trackingNumber, setTrackingNumber] = useState('');
    const [courier, setCourier] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!trackingNumber.trim() || !courier) {
            return toast.error('Nomor resi dan kurir wajib diisi');
        }

        setIsSubmitting(true);
        try {
            await submitReturnResi(disputeId, {
                tracking_number: trackingNumber.trim(),
                courier: courier
            });

            toast.success('Resi retur berhasil dikirim. Menunggu verifikasi penjual.');
            if (onSuccess) onSuccess();

            // Reset form
            setTrackingNumber('');
            setCourier('');
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengirim nomor resi');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        // ⚡ PERBAIKAN: Mengganti z-[100] menjadi z-50 untuk memenuhi standar Tailwind
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#111114] border border-zinc-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                            <Truck className="text-blue-500" />
                            Input Resi Retur
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-blue-400">
                            <Info size={18} className="shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed font-medium">
                                Pastikan kurir dan resi akurat. Kesalahan input akan membuat sistem gagal melacak paket Anda.
                            </p>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                                Jasa Pengiriman
                            </label>
                            <select
                                value={courier}
                                onChange={(e) => setCourier(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                                required
                            >
                                <option value="" disabled>Pilih Kurir...</option>
                                {SUPPORTED_COURIERS.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                                Nomor Resi Pengembalian
                            </label>
                            <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Contoh: JNE123456789"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            // ⚡ PERBAIKAN: Memanggil trackingNumber, bukan returnResi
                            disabled={isSubmitting || !trackingNumber || !courier}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                'Kirim Nomor Resi'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
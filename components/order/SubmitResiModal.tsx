// components/order/SubmitResiModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Package, Truck, Info, Loader2 } from 'lucide-react';
import { useDisputeStore } from '@/store/disputeStore';
import { toast } from 'react-hot-toast';

interface SubmitResiModalProps {
    isOpen: boolean;
    onClose: () => void;
    disputeId: string;
}

// Daftar kurir yang didukung oleh API BinderByte / RajaOngkir di Backend
const SUPPORTED_COURIERS = [
    { id: 'jne', name: 'JNE Express' },
    { id: 'jnt', name: 'J&T Express' },
    { id: 'sicepat', name: 'SiCepat' },
    { id: 'tiki', name: 'TIKI' },
    { id: 'pos', name: 'Pos Indonesia' },
    { id: 'anteraja', name: 'Anteraja' },
    { id: 'wahana', name: 'Wahana' },
    { id: 'ninja', name: 'Ninja Xpress' },
];

export default function SubmitResiModal({ isOpen, onClose, disputeId }: SubmitResiModalProps) {
    const { submitReturnResi, isLoading } = useDisputeStore();
    const [trackingNumber, setTrackingNumber] = useState('');
    const [courier, setCourier] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!trackingNumber.trim()) {
            return toast.error('Nomor resi wajib diisi');
        }
        if (!courier) {
            return toast.error('Silakan pilih kurir pengiriman');
        }

        try {
            await submitReturnResi(disputeId, {
                tracking_number: trackingNumber.trim(),
                courier: courier
            });

            toast.success('Nomor resi berhasil dikirim. Sistem akan mulai melacak paket Anda.');
            onClose();
            // Reset form
            setTrackingNumber('');
            setCourier('');
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengirim nomor resi');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="relative p-6 border-b border-zinc-900 bg-zinc-900/30">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/5 rounded-2xl text-white">
                            <Package size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Kirim Resi Retur</h3>
                            <p className="text-xs text-zinc-500 font-medium">Input bukti pengiriman barang ke Penjual</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Info Box */}
                    <div className="flex gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-blue-400">
                        <Info size={18} className="shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed font-medium">
                            Pastikan nomor resi dan kurir sudah benar. Kesalahan input akan menghambat proses otomatisasi pengembalian dana oleh sistem.
                        </p>
                    </div>

                    {/* Select Courier */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-1">
                            Pilih Kurir
                        </label>
                        <div className="relative group">
                            <Truck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" />
                            <select
                                value={courier}
                                onChange={(e) => setCourier(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-white/10 focus:border-zinc-700 outline-none transition-all appearance-none cursor-pointer"
                                required
                            >
                                <option value="" disabled>Pilih Jasa Pengiriman</option>
                                {SUPPORTED_COURIERS.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Input Resi */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest ml-1">
                            Nomor Resi (AWB)
                        </label>
                        <div className="relative group">
                            <Package size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Contoh: JNE123456789"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-white/10 focus:border-zinc-700 outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Footer / Action */}
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl bg-zinc-900 text-zinc-400 font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !trackingNumber || !courier}
                            className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
                        >
                            {isLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                'Konfirmasi Pengiriman'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
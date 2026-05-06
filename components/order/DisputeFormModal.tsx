'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Landmark, ChevronRight, Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDisputeStore } from '@/store/disputeStore';
import { useUserBankStore } from '@/store/bankStore';
import { INDONESIAN_BANKS } from '@/utils/bankName';

interface DisputeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    onSuccess: (reason: string) => void;
    
}

export default function DisputeFormModal({ isOpen, onClose, orderId, onSuccess }: DisputeFormModalProps) {
    const { openDispute } = useDisputeStore();
    const { banks, addBank } = useUserBankStore();

    const [disputeReason, setDisputeReason] = useState('');
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Rekening
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');

    if (!isOpen) return null;

    const removeFile = (index: number) => {
        setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!disputeReason.trim()) {
            return toast.error('Mohon isi alasan komplain.');
        }
        if (evidenceFiles.length === 0) {
            return toast.error('Mohon unggah setidaknya satu bukti foto/video.');
        }

        setIsSubmitting(true);
        try {
            // Skenario: User belum punya rekening terdaftar
            if (banks.length === 0) {
                if (!bankName || !accountNumber || !accountName) {
                    toast.error('Mohon lengkapi data rekening bank untuk pengembalian dana.');
                    setIsSubmitting(false);
                    return;
                }
                await addBank({
                    bank_name: bankName,
                    bank_account_number: accountNumber,
                    bank_account_name: accountName
                });
            }

            // Hit ke API via Zustand Store
            await openDispute({
                order_id: orderId,
                reason: disputeReason,
                evidences: evidenceFiles
            });

            toast.success('Dispute berhasil diajukan. Dana Escrow telah dibekukan sementara.');
           onSuccess(disputeReason);
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengajukan dispute.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <div className="bg-[#111114] border border-zinc-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                            <AlertTriangle className="text-[#ef3333]" />
                            Ajukan Dispute
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* SECTION: REKENING BANK (Jika Kosong) */}
                        {banks.length === 0 ? (
                            <div className="bg-[#ef3333]/5 border border-[#ef3333]/20 rounded-3xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Landmark size={18} className="text-[#ef3333]" />
                                    <h3 className="text-sm font-black text-white uppercase tracking-tighter">Data Rekening Pengembalian</h3>
                                </div>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-4 leading-relaxed">
                                    Anda belum mendaftarkan rekening. Mohon isi data bank untuk proses refund jika pengajuan disetujui.
                                </p>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <select
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#ef3333] outline-none transition-all appearance-none"
                                        >
                                            <option value="" disabled className="bg-zinc-950 text-zinc-600">Pilih Bank...</option>
                                            {INDONESIAN_BANKS.map((bank) => (
                                                <option key={bank.code} value={bank.name} className="bg-zinc-950">
                                                    {bank.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Nomor Rekening"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#ef3333] outline-none transition-all"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Nama Pemilik Rekening"
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#ef3333] outline-none transition-all"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                                <CheckCircle2 size={16} className="text-green-500" />
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Dana akan di-refund ke:</p>
                                    <p className="text-xs font-bold text-white truncate uppercase">{banks[0].bank_name} - {banks[0].bank_account_number}</p>
                                </div>
                            </div>
                        )}

                        {/* SECTION: ALASAN & BUKTI */}
                        <div>
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                                Alasan Pengajuan
                            </label>
                            <textarea
                                value={disputeReason}
                                onChange={(e) => setDisputeReason(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-[#ef3333] transition-colors min-h-30"
                                placeholder="Jelaskan detail masalah pada pesanan Anda..."
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                                Bukti Foto/Video (Maks 5 File)
                            </label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            const newFiles = Array.from(e.target.files);
                                            setEvidenceFiles(prev => [...prev, ...newFiles].slice(0, 5));
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={evidenceFiles.length >= 5}
                                />
                                <div className={`bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center transition-colors ${evidenceFiles.length >= 5 ? 'opacity-50' : 'group-hover:border-[#ef3333]/50'}`}>
                                    <Upload className="text-zinc-600 mb-2" size={24} />
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-tight text-center">
                                        {evidenceFiles.length >= 5 ? 'Batas file tercapai' : 'Klik atau seret file ke sini'}
                                        <br />
                                        <span className="text-[9px] text-zinc-600 font-medium">PNG, JPG, MP4 (Max 5MB)</span>
                                    </p>
                                </div>
                            </div>

                            {/* Daftar File */}
                            {evidenceFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {evidenceFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <FileText size={14} className="text-[#ef3333] shrink-0" />
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight truncate">
                                                    {file.name}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="p-1 hover:bg-zinc-800 rounded-lg text-[#ef3333] transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* INFO & SUBMIT */}
                        <div className="pt-2">
                            <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl mb-6">
                                <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                                <p className="text-[9px] text-yellow-500/80 font-bold uppercase leading-relaxed">
                                    Dana akan dibekukan oleh sistem hingga Admin memberikan resolusi. Mohon sertakan bukti yang jelas.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !disputeReason || evidenceFiles.length === 0 || (banks.length === 0 && (!bankName || !accountNumber || !accountName))}
                                className="w-full bg-[#ef3333] hover:bg-[#d42d2d] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_10px_20px_rgba(239,51,51,0.2)] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    banks.length === 0 ? 'Simpan Bank & Kirim Dispute' : 'Kirim Pengajuan Dispute'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    X,
    Gavel,
    Package,
    DollarSign,
    Clock,
    AlertCircle,
    ChevronRight,
    Info
} from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/utils/format";

interface CreateAuctionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// MOCK DATA: Nantinya diganti dengan fetching ke endpoint /api/products?seller_id=xxx&is_locked=false
const ELIGIBLE_PRODUCTS = [
    { id: "prod-1", name: "The Beatles - Abbey Road (Vinyl LP)", price: 2500000, stock: 1 },
    { id: "prod-2", name: "Daft Punk - Discovery (2xLP)", price: 1800000, stock: 2 },
    { id: "prod-3", name: "Pink Floyd - Dark Side of The Moon", price: 3200000, stock: 1 },
];

const INCREMENT_OPTIONS = [10000, 25000, 50000, 100000];

export default function CreateAuctionModal({ isOpen, onClose, onSuccess }: CreateAuctionModalProps) {
    // --- FORM STATE ---
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [startPrice, setStartPrice] = useState<number>(0);
    const [increment, setIncrement] = useState<number>(25000);
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Mengambil detail produk terpilih untuk context UI
    const selectedProduct = useMemo(() => {
        return ELIGIBLE_PRODUCTS.find(p => p.id === selectedProductId) || null;
    }, [selectedProductId]);

    // Set default start price ketika produk dipilih
    useEffect(() => {
        if (selectedProduct) {
            setStartPrice(selectedProduct.price);
        } else {
            setStartPrice(0);
        }
    }, [selectedProduct]);

    // Set default Start Time (Current Time + 15 Mins) saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            now.setMinutes(now.getMinutes() + 15);

            // Format to YYYY-MM-DDThh:mm (Format standar input datetime-local)
            const tzOffset = now.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);

            setStartTime(localISOTime);

            // Default end time = start time + 24 hours
            const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const endLocalISOTime = (new Date(nextDay.getTime() - tzOffset)).toISOString().slice(0, 16);
            setEndTime(endLocalISOTime);

            // Reset state
            setSelectedProductId("");
            setValidationError(null);
        }
    }, [isOpen]);

    // --- DYNAMIC VALIDATOR (Information Expert) ---
    useEffect(() => {
        if (!startTime || !endTime) return;

        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        const now = new Date().getTime();

        // Validasi 1: Start Time tidak boleh di masa lalu (dengan buffer 5 menit dari sekarang)
        if (start < now + 5 * 60000) {
            setValidationError("Waktu mulai minimal 5 menit dari sekarang.");
            return;
        }

        // Validasi 2: Durasi Lelang (1 Jam - 24 Jam)
        const durationHours = (end - start) / (1000 * 60 * 60);

        if (durationHours < 1) {
            setValidationError("Durasi lelang minimal 1 Jam.");
        } else if (durationHours > 24) {
            setValidationError("Durasi lelang maksimal 24 Jam.");
        } else {
            setValidationError(null); // Lolos validasi
        }
    }, [startTime, endTime]);

    // --- SUBMIT HANDLER ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validationError || !selectedProductId) {
            toast.error("Mohon periksa kembali form Anda.");
            return;
        }

        setIsSubmitting(true);

        try {
            // MOCK: Proses pengiriman ke Backend
            // const payload = { product_id: selectedProductId, start_price: startPrice, increment, start_time: new Date(startTime).toISOString(), end_time: new Date(endTime).toISOString() };
            // await auctionService.createAuction(payload);

            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulasi network delay

            toast.success("Jadwal Lelang berhasil dibuat!", {
                description: "Produk telah dikunci dan tidak bisa di-checkout reguler."
            });
            onSuccess();
        } catch (error: any) {
            // Menangkap Conflict 409 (Race Condition) dari Backend
            if (error.response?.status === 409) {
                toast.error("Konflik Transaksi!", {
                    description: "Produk ini baru saja dibeli secara reguler atau sudah dikunci."
                });
            } else {
                toast.error(error.message || "Gagal membuat jadwal lelang.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0a0a0b] border border-zinc-800 w-full max-w-2xl rounded-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                {/* HEADER */}
                <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ef3333]/10 text-[#ef3333] flex items-center justify-center">
                            <Gavel size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Konfigurasi Lelang</h2>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Setup Parameter & Waktu</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* BODY FORM */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">

                    {/* 1. Pemilihan Produk */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                            <Package size={16} className="text-zinc-500" /> Pilih Produk
                        </label>
                        <select
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="w-full bg-[#111114] border border-zinc-800 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#ef3333] transition-colors appearance-none"
                            required
                        >
                            <option value="" disabled>-- Pilih dari Katalog Tersedia --</option>
                            {ELIGIBLE_PRODUCTS.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} (Stok: {product.stock})
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <Info size={12} /> Hanya produk dengan stok {'>'} 0 dan tidak terkunci yang ditampilkan.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 2. Harga Buka */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                                <DollarSign size={16} className="text-zinc-500" /> Harga Buka (Rp)
                            </label>
                            <input
                                type="number"
                                min="10000"
                                step="1000"
                                value={startPrice}
                                onChange={(e) => setStartPrice(Number(e.target.value))}
                                className="w-full bg-[#111114] border border-zinc-800 text-white font-bold rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#ef3333] transition-colors"
                                required
                            />
                            {selectedProduct && (
                                <p className="text-[10px] font-bold text-zinc-500">
                                    Harga Reguler: <span className="line-through">{formatRupiah(selectedProduct.price)}</span>
                                </p>
                            )}
                        </div>

                        {/* 3. Bid Increment */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                                <TrendingUpIcon size={16} className="text-zinc-500" /> Kelipatan Bid (Rp)
                            </label>
                            <select
                                value={increment}
                                onChange={(e) => setIncrement(Number(e.target.value))}
                                className="w-full bg-[#111114] border border-zinc-800 text-white font-bold rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#ef3333] transition-colors appearance-none"
                            >
                                {INCREMENT_OPTIONS.map(val => (
                                    <option key={val} value={val}>+{formatRupiah(val)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                        {/* 4. Waktu Mulai */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                                <Clock size={16} className="text-zinc-500" /> Waktu Mulai
                            </label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full bg-black border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ef3333] scheme-dark"
                                required
                            />
                        </div>

                        {/* 5. Waktu Selesai */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                                <Clock size={16} className="text-zinc-500" /> Waktu Berakhir
                            </label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full bg-black border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ef3333] scheme-dark"
                                required
                            />
                        </div>
                    </div>

                    {/* Validation Error Banner */}
                    {validationError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p className="text-xs font-bold leading-relaxed">{validationError}</p>
                        </div>
                    )}

                </form>

                {/* FOOTER ACTIONS */}
                <div className="px-8 py-6 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !!validationError || !selectedProductId}
                        className="bg-white text-black hover:bg-[#ef3333] hover:text-white transition-all font-black text-xs uppercase tracking-[0.2em] px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black active:scale-95"
                    >
                        {isSubmitting ? "Memproses..." : "Buat Sesi Lelang"} <ChevronRight size={16} />
                    </button>
                </div>

            </div>

            {/* Internal Component Helper Icon (Karena tidak di-import di atas untuk ringkasnya) */}
            <style jsx global>{`
        /* Menghilangkan calendar icon bawaan browser jika diperlukan, meski [color-scheme:dark] cukup membantu */
        ::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
        </div>
    );
}

// Helper kecil pengganti import TrendingUp yang terlewat di blok import utama
function TrendingUpIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
        </svg>
    );
}
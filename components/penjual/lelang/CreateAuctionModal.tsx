"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    X,
    Gavel,
    Package,
    DollarSign,
    Clock,
    AlertCircle,
    ChevronRight,
    Image as ImageIcon,
    Trash2,
    Scale,
    Ruler
} from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "@/utils/format";
import { auctionService } from "@/services/api/auction.service";

interface CreateAuctionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const INCREMENT_OPTIONS = [10000, 25000, 50000, 100000, 250000, 500000];

export default function CreateAuctionModal({ isOpen, onClose, onSuccess }: CreateAuctionModalProps) {
    // --- FORM STATE (Decoupled dari Product) ---
    const [itemName, setItemName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [condition, setCondition] = useState<'NEW' | 'USED'>('USED');

    // Logistik
    const [weight, setWeight] = useState<number | "">("");
    const [length, setLength] = useState<number | "">("");
    const [width, setWidth] = useState<number | "">("");
    const [height, setHeight] = useState<number | "">("");

    // Harga & Waktu
    const [startPrice, setStartPrice] = useState<number | "">("");
    const [increment, setIncrement] = useState<number>(25000);
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");

    // Berkas Media
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // --- INISIALISASI WAKTU ---
    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            now.setMinutes(now.getMinutes() + 15);
            const tzOffset = now.getTimezoneOffset() * 60000;
            const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
            setStartTime(localISOTime);

            const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const endLocalISOTime = (new Date(nextDay.getTime() - tzOffset)).toISOString().slice(0, 16);
            setEndTime(endLocalISOTime);

            // Reset Form
            setItemName("");
            setDescription("");
            setCondition('USED');
            setWeight("");
            setLength("");
            setWidth("");
            setHeight("");
            setStartPrice("");
            setIncrement(25000);
            setPhotos([]);
            setPhotoPreviews([]);
            setValidationError(null);
        }
    }, [isOpen]);

    // --- PHOTO HANDLERS ---
    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            if (photos.length + newFiles.length > 5) {
                toast.error("Maksimal 5 foto per lelang.");
                return;
            }

            const updatedPhotos = [...photos, ...newFiles];
            setPhotos(updatedPhotos);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPhotoPreviews([...photoPreviews, ...newPreviews]);
        }
    };

    const removePhoto = (index: number) => {
        const updatedPhotos = photos.filter((_, i) => i !== index);
        const updatedPreviews = photoPreviews.filter((_, i) => i !== index);

        // Revoke URL memory untuk menghindari memory leak
        URL.revokeObjectURL(photoPreviews[index]);

        setPhotos(updatedPhotos);
        setPhotoPreviews(updatedPreviews);
    };

    // --- DYNAMIC VALIDATOR ---
    useEffect(() => {
        if (!startTime || !endTime) return;

        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        const now = new Date().getTime();

        if (start < now + 5 * 60000) {
            setValidationError("Waktu mulai minimal 5 menit dari sekarang.");
            return;
        }

        const durationHours = (end - start) / (1000 * 60 * 60);

        if (durationHours < 1) {
            setValidationError("Durasi lelang minimal 1 Jam.");
        } else if (durationHours > 24) {
            setValidationError("Durasi lelang maksimal 24 Jam.");
        } else {
            setValidationError(null);
        }
    }, [startTime, endTime]);

    // --- SUBMIT HANDLER ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validationError) {
            toast.error("Mohon periksa kembali peringatan jadwal lelang Anda.");
            return;
        }

        if (photos.length === 0) {
            toast.error("Minimal 1 foto wajib diunggah.");
            return;
        }

        if (!itemName || !weight || !startPrice) {
            toast.error("Kolom ber-asterisk (*) wajib diisi.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Merakit FormData (Information Expert)
            const formData = new FormData();
            formData.append('item_name', itemName);
            formData.append('description', description);
            formData.append('condition', condition);
            formData.append('weight', String(weight));
            formData.append('length', String(length || 0));
            formData.append('width', String(width || 0));
            formData.append('height', String(height || 0));
            formData.append('start_price', String(startPrice));
            formData.append('increment', String(increment));
            formData.append('start_time', new Date(startTime).toISOString());
            formData.append('end_time', new Date(endTime).toISOString());

            photos.forEach(file => {
                formData.append('photos', file);
            });

            await auctionService.createAuction(formData);

            toast.success("Jadwal Lelang berhasil dibuat!", {
                description: "Barang lelang siap dipublikasikan sesuai jadwal."
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal membuat jadwal lelang. Silakan coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0a0a0b] border border-zinc-800 w-full max-w-3xl rounded-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">

                {/* HEADER */}
                <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ef3333]/10 text-[#ef3333] flex items-center justify-center">
                            <Gavel size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Pendaftaran Lelang</h2>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Registrasi Barang Khusus Lelang</p>
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
                <form id="auction-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">

                    {/* SEKSI 1: UPLOAD FOTO */}
                    <div className="space-y-4">
                        <label className="flex items-center text-xs font-black uppercase tracking-widest text-zinc-400">
                            <ImageIcon size={16} className="text-zinc-500 mr-2" /> Foto Barang *
                        </label>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {photoPreviews.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-700 group">
                                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    {index === 0 && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-[#ef3333] text-white text-[9px] font-black uppercase tracking-widest text-center py-1">
                                            Thumbnail
                                        </div>
                                    )}
                                </div>
                            ))}

                            {photos.length < 5 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-xl border-2 border-dashed border-zinc-800 hover:border-[#ef3333] hover:bg-[#ef3333]/5 transition-colors flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-[#ef3333]"
                                >
                                    <ImageIcon size={24} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Tambah</span>
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoSelect}
                            accept="image/jpeg, image/png, image/webp"
                            multiple
                            className="hidden"
                        />
                        <p className="text-[10px] text-zinc-500">Maksimal 5 foto. Ekstensi: JPG, PNG, WEBP.</p>
                    </div>

                    {/* SEKSI 2: INFORMASI DASAR */}
                    <div className="space-y-6 bg-zinc-900/20 p-6 rounded-2xl border border-zinc-800/50">
                        <div className="space-y-3">
                            <label className="flex items-center text-xs font-black uppercase tracking-widest text-zinc-400">
                                <Package size={16} className="text-zinc-500 mr-2" /> Nama Barang Lelang *
                            </label>
                            <input
                                type="text"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                placeholder="Contoh: Vinyl The Beatles First Pressing 1969"
                                className="w-full bg-[#111114] border border-zinc-800 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#ef3333] transition-colors"
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                                Deskripsi Detail
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Jelaskan kondisi spesifik, sejarah barang, atau detail lainnya..."
                                rows={4}
                                className="w-full bg-[#111114] border border-zinc-800 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#ef3333] transition-colors custom-scrollbar resize-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">
                                Kondisi *
                            </label>
                            <select
                                value={condition}
                                onChange={(e) => setCondition(e.target.value as 'NEW' | 'USED')}
                                className="w-full bg-[#111114] border border-zinc-800 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#ef3333] transition-colors appearance-none"
                            >
                                <option value="USED">Pernah Dipakai (Used / Second)</option>
                                <option value="NEW">Baru (Brand New / Sealed)</option>
                            </select>
                        </div>
                    </div>

                    {/* SEKSI 3: LOGISTIK & FISIK */}
                    <div className="space-y-4">
                        <label className="flex items-center text-xs font-black uppercase tracking-widest text-zinc-400">
                            <Scale size={16} className="text-zinc-500 mr-2" /> Logistik & Pengiriman
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Berat (Gram) *</label>
                                <input type="number" min="1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} required className="w-full bg-[#111114] border border-zinc-800 text-white rounded-xl px-3 py-3 text-sm focus:border-[#ef3333] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Panjang (cm)</label>
                                <input type="number" min="0" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full bg-[#111114] border border-zinc-800 text-white rounded-xl px-3 py-3 text-sm focus:border-[#ef3333] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Lebar (cm)</label>
                                <input type="number" min="0" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full bg-[#111114] border border-zinc-800 text-white rounded-xl px-3 py-3 text-sm focus:border-[#ef3333] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tinggi (cm)</label>
                                <input type="number" min="0" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full bg-[#111114] border border-zinc-800 text-white rounded-xl px-3 py-3 text-sm focus:border-[#ef3333] outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* SEKSI 4: HARGA & JADWAL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                                <DollarSign size={16} className="text-zinc-500" /> Harga Buka (Rp) *
                            </label>
                            <input
                                type="number"
                                min="10000"
                                step="1000"
                                value={startPrice}
                                onChange={(e) => setStartPrice(Number(e.target.value))}
                                placeholder="0"
                                className="w-full bg-[#111114] border border-zinc-800 text-white font-bold rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#ef3333] transition-colors"
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                                <TrendingUpIcon size={16} className="text-zinc-500" /> Kelipatan Bid (Rp) *
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
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                                <Clock size={16} className="text-zinc-500" /> Waktu Mulai *
                            </label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full bg-black border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ef3333] scheme-dark"
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                                <Clock size={16} className="text-zinc-500" /> Waktu Berakhir *
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

                    {validationError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p className="text-xs font-bold leading-relaxed">{validationError}</p>
                        </div>
                    )}

                </form>

                {/* FOOTER ACTIONS */}
                <div className="px-8 py-6 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-end gap-4 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="auction-form"
                        disabled={isSubmitting || !!validationError || !itemName || !startPrice || photos.length === 0}
                        className="bg-white text-black hover:bg-[#ef3333] hover:text-white transition-all font-black text-xs uppercase tracking-[0.2em] px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black active:scale-95"
                    >
                        {isSubmitting ? "Memproses..." : "Daftarkan Lelang"} <ChevronRight size={16} />
                    </button>
                </div>

            </div>

            <style jsx global>{`
                ::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}

// Helper SVG Icon
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
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    X, Gavel, Package, DollarSign, Clock, AlertCircle, ChevronRight, Image as ImageIcon, Trash2, Scale
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
    const [itemName, setItemName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [condition, setCondition] = useState<'NEW' | 'USED'>('USED');

    // Metrik Logistik
    const [weight, setWeight] = useState<number | "">("");
    const [length, setLength] = useState<number | "">("");
    const [width, setWidth] = useState<number | "">("");
    const [height, setHeight] = useState<number | "">("");

    // Aturan Lelang
    const [startPrice, setStartPrice] = useState<number | "">("");
    const [increment, setIncrement] = useState<number>(25000);
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");

    // Media
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Inisialisasi State Saat Modal Dibuka
    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            now.setMinutes(now.getMinutes() + 15);
            const tzOffset = now.getTimezoneOffset() * 60000;
            setStartTime((new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16));

            const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            setEndTime((new Date(nextDay.getTime() - tzOffset)).toISOString().slice(0, 16));

            setItemName(""); setDescription(""); setCondition('USED');
            setWeight(""); setLength(""); setWidth(""); setHeight("");
            setStartPrice(""); setIncrement(25000);
            setPhotos([]); setPhotoPreviews([]); setValidationError(null);
        }
    }, [isOpen]);

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            if (photos.length + newFiles.length > 5) {
                toast.error("Maksimal 5 foto per lelang.");
                return;
            }
            setPhotos([...photos, ...newFiles]);
            setPhotoPreviews([...photoPreviews, ...newFiles.map(f => URL.createObjectURL(f))]);
        }
    };

    const removePhoto = (index: number) => {
        URL.revokeObjectURL(photoPreviews[index]);
        setPhotos(photos.filter((_, i) => i !== index));
        setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
    };

    // Validasi Rentang Waktu Lelang
    useEffect(() => {
        if (!startTime || !endTime) return;
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        const now = new Date().getTime();

        if (start < now + 5 * 60000) return setValidationError("Waktu mulai minimal 5 menit dari sekarang.");
        const durationHours = (end - start) / (1000 * 60 * 60);
        if (durationHours < 1) setValidationError("Durasi lelang minimal 1 Jam.");
        else if (durationHours > 24) setValidationError("Durasi lelang maksimal 24 Jam.");
        else setValidationError(null);
    }, [startTime, endTime]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validationError) return toast.error("Periksa jadwal lelang Anda.");
        if (photos.length === 0) return toast.error("Minimal 1 foto wajib diunggah.");
        if (!itemName || !weight || !startPrice) return toast.error("Kolom ber-asterisk (*) wajib diisi.");

        setIsSubmitting(true);
        try {
            // Append payload ke FormData untuk mengakomodasi file biner
            const formData = new FormData();
            formData.append('item_name', itemName);
            formData.append('description', description);
            formData.append('condition', condition);

            // Logistik & Dimensi (Penting untuk kalkulasi shipping Worker)
            formData.append('weight', String(weight));
            formData.append('length', String(length || 0));
            formData.append('width', String(width || 0));
            formData.append('height', String(height || 0));

            formData.append('start_price', String(startPrice));
            formData.append('increment', String(increment));
            formData.append('start_time', new Date(startTime).toISOString());
            formData.append('end_time', new Date(endTime).toISOString());

            photos.forEach(file => formData.append('photos', file));

            await auctionService.createAuction(formData);
            toast.success("Lelang berhasil didaftarkan!");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal membuat jadwal lelang.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0a0a0b] border border-zinc-800 w-full max-w-3xl rounded-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
                <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ef3333]/10 text-[#ef3333] flex items-center justify-center"><Gavel size={20} /></div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Pendaftaran Lelang</h2>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Registrasi Barang Baru</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white"><X size={20} /></button>
                </div>

                <form id="auction-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">

                    {/* SECTION: Media & Foto */}
                    <div className="space-y-4">
                        <label className="text-xs font-black uppercase text-zinc-400 flex items-center"><ImageIcon size={16} className="mr-2" /> Foto Barang *</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {photoPreviews.map((url, i) => (
                                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-700 group">
                                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removePhoto(i)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 text-red-500"><Trash2 size={24} /></button>
                                </div>
                            ))}
                            {photos.length < 5 && (
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-zinc-800 hover:border-[#ef3333] flex flex-col items-center justify-center text-zinc-500">
                                    <ImageIcon size={24} /> <span className="text-[10px] mt-1 uppercase font-bold">Tambah</span>
                                </button>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handlePhotoSelect} accept="image/*" multiple className="hidden" />
                    </div>

                    {/* SECTION: Informasi Barang & Dimensi Fisik */}
                    <div className="space-y-4 bg-zinc-900/20 p-6 rounded-2xl border border-zinc-800/50">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-zinc-400">Nama Barang *</label>
                            <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full bg-[#111114] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ef3333] outline-none" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-zinc-400">Kondisi *</label>
                                <select value={condition} onChange={(e) => setCondition(e.target.value as any)} className="w-full bg-[#111114] border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none appearance-none">
                                    <option value="USED">Pernah Dipakai (Used)</option>
                                    <option value="NEW">Baru (New)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-zinc-400">Berat (Gram) *</label>
                                <input type="number" min="1" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full bg-[#111114] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ef3333] outline-none" required />
                            </div>
                        </div>

                        {/* TAMBAHAN: Input Dimensi Logistik */}
                        <div className="grid grid-cols-3 gap-4 pt-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500">Panjang (cm)</label>
                                <input type="number" min="0" value={length} onChange={(e) => setLength(Number(e.target.value))} placeholder="0" className="w-full bg-[#111114] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ef3333] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500">Lebar (cm)</label>
                                <input type="number" min="0" value={width} onChange={(e) => setWidth(Number(e.target.value))} placeholder="0" className="w-full bg-[#111114] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ef3333] outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500">Tinggi (cm)</label>
                                <input type="number" min="0" value={height} onChange={(e) => setHeight(Number(e.target.value))} placeholder="0" className="w-full bg-[#111114] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ef3333] outline-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-zinc-400">Deskripsi (Opsional)</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-[#111114] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ef3333] outline-none resize-none" />
                        </div>
                    </div>

                    {/* SECTION: Harga & Penjadwalan */}
                    <div className="grid grid-cols-2 gap-6 p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-zinc-400">Harga Buka (Rp) *</label>
                            <input type="number" min="0" value={startPrice} onChange={(e) => setStartPrice(Number(e.target.value))} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ef3333] outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-zinc-400">Kelipatan Bid *</label>
                            <select value={increment} onChange={(e) => setIncrement(Number(e.target.value))} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white appearance-none outline-none">
                                {INCREMENT_OPTIONS.map(v => <option key={v} value={v}>+{formatRupiah(v)}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-zinc-400 flex items-center"><Clock size={14} className="mr-1" /> Mulai</label>
                            <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none scheme-dark" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-zinc-400 flex items-center"><Clock size={14} className="mr-1" /> Berakhir</label>
                            <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none scheme-dark" required />
                        </div>
                    </div>
                </form>

                <div className="px-8 py-6 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-end gap-4 shrink-0">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-xs font-black uppercase text-zinc-400 hover:text-white transition-colors">Batal</button>
                    <button type="submit" form="auction-form" disabled={isSubmitting || photos.length === 0} className="bg-white text-black hover:bg-[#ef3333] hover:text-white font-black text-xs uppercase px-8 py-3.5 rounded-xl disabled:opacity-50 flex items-center gap-2 transition-colors">
                        {isSubmitting ? "Memproses..." : "Daftarkan Lelang"} <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
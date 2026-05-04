'use client';

import React, { useState, useEffect } from "react";
import { 
    Plus, MapPin, Trash2, Edit3, Loader2, 
    X, Search, CheckCircle2 
} from "lucide-react";
import { addressService, shippingService } from "@/services/api/address.service";
import { Address, AddressFormPayload, BiteshipArea } from "@/types/address";
import { toast } from "sonner";

export default function AlamatPage() {
    // --- STATE DATA ---
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // --- STATE MODAL & FORM ---
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<AddressFormPayload>({
        label: "",
        recipient_name: "",
        phone_number: "",
        address_detail: "",
        province: "",
        city: "",
        district: "",
        postal_code: "",
        biteship_area_id: "",
        is_primary: false
    });

    // --- STATE PENCARIAN WILAYAH (BITESHIP) ---
    const [areaQuery, setAreaQuery] = useState("");
    const [areaResults, setAreaResults] = useState<BiteshipArea[]>([]);
    const [isSearchingArea, setIsSearchingArea] = useState(false);
    const [showAreaResults, setShowAreaResults] = useState(false);

    // 1. Ambil daftar alamat saat mount
    const fetchAddresses = async () => {
        try {
            setIsFetching(true);
            const data = await addressService.getMyAddresses();
            setAddresses(data);
        } catch (error: any) {
            toast.error(error.message || "Gagal memuat alamat");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    // 2. Logika Pencarian Wilayah (Debounced effect)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (areaQuery.length >= 3) {
                try {
                    setIsSearchingArea(true);
                    const results = await shippingService.getAreas(areaQuery);
                    setAreaResults(results);
                    setShowAreaResults(true);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsSearchingArea(false);
                }
            } else {
                setAreaResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [areaQuery]);

    // 3. Handler Pilih Wilayah
    const handleSelectArea = (area: BiteshipArea) => {
        setFormData({
            ...formData,
            province: area.province,
            city: area.city,
            district: area.district,
            postal_code: area.postal_code,
            biteship_area_id: area.biteship_area_id
        });
        setAreaQuery(`${area.district}, ${area.city}`);
        setShowAreaResults(false);
    };

    // 4. Handler Simpan (Create / Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.biteship_area_id) {
            return toast.error("Silakan pilih wilayah dari hasil pencarian");
        }

        try {
            setIsSubmitting(true);
            if (editingId) {
                await addressService.updateAddress(editingId, formData);
                toast.success("Alamat berhasil diperbarui");
            } else {
                await addressService.addAddress(formData);
                toast.success("Alamat baru ditambahkan");
            }
            handleCloseModal();
            fetchAddresses();
        } catch (error: any) {
            toast.error(error.message || "Gagal menyimpan alamat");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 5. Handler Hapus
    const handleDelete = async (id: string | undefined) => {
        if (!id) return; // Proteksi jika id undefined
        if (!confirm("Hapus alamat ini?")) return;
        try {
            await addressService.deleteAddress(id);
            toast.success("Alamat dihapus");
            setAddresses(addresses.filter(a => a.id !== id));
        } catch (error: any) {
            toast.error(error.message || "Gagal menghapus alamat");
        }
    };

    // 6. Reset & Close Modal
    const handleOpenModal = (addr?: Address) => {
        if (addr && addr.id) {
            // FIX ERROR 1: Memberikan fallback null jika id undefined
            setEditingId(addr.id || null);
            setFormData({
                label: addr.label,
                recipient_name: addr.recipient_name,
                phone_number: addr.phone_number,
                address_detail: addr.address_detail,
                province: addr.province,
                city: addr.city,
                district: addr.district,
                postal_code: addr.postal_code,
                biteship_area_id: addr.biteship_area_id,
                is_primary: addr.is_primary
            });
            setAreaQuery(`${addr.district}, ${addr.city}`);
        } else {
            setEditingId(null);
            setFormData({
                label: "", recipient_name: "", phone_number: "", address_detail: "",
                province: "", city: "", district: "", postal_code: "", biteship_area_id: "",
                is_primary: addresses.length === 0 
            });
            setAreaQuery("");
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setAreaResults([]);
    };

    return (
        <>
            {/* HEADER SECTION */}
            <div className="mb-10 border-b border-zinc-900 pb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Daftar Alamat</h2>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Atur alamat pengiriman untuk mempermudah checkout</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="px-6 py-3 bg-[#ef3333] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-red-900/20"
                >
                    <Plus size={14} /> Tambah Alamat
                </button>
            </div>

            {/* ADDRESS LIST */}
            {isFetching ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-[#ef3333]" size={32} />
                </div>
            ) : addresses.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {addresses.map((addr) => (
                        <div key={addr.id} className={`group relative bg-[#0a0a0b] border ${addr.is_primary ? 'border-[#ef3333]/50 bg-[#ef3333]/5' : 'border-zinc-800'} p-6 rounded-[1.5rem] transition-all hover:border-[#ef3333]/30`}>
                            <div className="flex justify-between items-start">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
                                            {addr.label}
                                        </span>
                                        {addr.is_primary && (
                                            <span className="text-[9px] font-black text-[#ef3333] uppercase tracking-[0.2em] flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Utama
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase">{addr.recipient_name}</h4>
                                        <p className="text-xs text-zinc-400 font-bold">{addr.phone_number}</p>
                                    </div>

                                    <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
                                        {addr.address_detail}, {addr.district}, {addr.city}, {addr.province}, {addr.postal_code}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => handleOpenModal(addr)}
                                        className="p-3 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
                                        title="Edit Alamat"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    {!addr.is_primary && (
                                        <button 
                                            // FIX ERROR 2: addr.id dipastikan diproses sebagai string | undefined
                                            onClick={() => handleDelete(addr.id)}
                                            className="p-3 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                            title="Hapus Alamat"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 border-2 border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center text-zinc-600">
                    <MapPin size={48} className="mb-4 opacity-20" />
                    <p className="text-[11px] font-black uppercase tracking-widest italic text-zinc-500">Belum ada alamat tersimpan</p>
                </div>
            )}

            {/* MODAL FORM ALAMAT */}
            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    
                    <div className="relative w-full max-w-2xl bg-[#111114] border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                    {editingId ? "Edit Alamat" : "Tambah Alamat Baru"}
                                </h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1 tracking-widest">Gunakan data wilayah resmi untuk akurasi pengiriman</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 text-zinc-500 hover:text-white bg-zinc-900 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Label Alamat</label>
                                <input 
                                    type="text" required placeholder="Contoh: Rumah, Kantor, Kosan"
                                    value={formData.label}
                                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-5 py-3.5 text-sm text-white focus:border-[#ef3333] outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nama Penerima</label>
                                <input 
                                    type="text" required placeholder="Masukkan Nama Lengkap"
                                    value={formData.recipient_name}
                                    onChange={(e) => setFormData({...formData, recipient_name: e.target.value})}
                                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-5 py-3.5 text-sm text-white focus:border-[#ef3333] outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nomor HP</label>
                                <input 
                                    type="tel" required placeholder="08xxxxxxxx"
                                    value={formData.phone_number}
                                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-5 py-3.5 text-sm text-white focus:border-[#ef3333] outline-none"
                                />
                            </div>
                            
                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Kecamatan / Kota</label>
                                <div className="relative">
                                    <input 
                                        type="text" placeholder="Cari minimal 3 karakter..."
                                        value={areaQuery}
                                        onChange={(e) => {
                                            setAreaQuery(e.target.value);
                                            if (e.target.value === "") setFormData({...formData, biteship_area_id: ""});
                                        }}
                                        className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-5 py-3.5 pl-11 text-sm text-white focus:border-[#ef3333] outline-none"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                    {isSearchingArea && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#ef3333]" size={16} />}
                                </div>

                                {showAreaResults && areaResults.length > 0 && (
                                    <div className="absolute z-[210] top-full mt-2 w-full bg-[#1a1a1e] border border-zinc-800 rounded-2xl shadow-2xl max-h-60 overflow-y-auto no-scrollbar">
                                        {areaResults.map((area) => (
                                            <button
                                                key={area.biteship_area_id}
                                                type="button"
                                                onClick={() => handleSelectArea(area)}
                                                className="w-full text-left px-5 py-4 border-b border-zinc-800/50 hover:bg-[#ef3333]/10 transition-colors group"
                                            >
                                                <p className="text-xs font-black text-white group-hover:text-[#ef3333] uppercase">
                                                    {area.district}, {area.city}
                                                </p>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">
                                                    {area.province} • {area.postal_code}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="col-span-full space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Detail Alamat</label>
                                <textarea 
                                    required rows={3}
                                    placeholder="Nama jalan, nomor rumah, blok, patokan..."
                                    value={formData.address_detail}
                                    onChange={(e) => setFormData({...formData, address_detail: e.target.value})}
                                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#ef3333] outline-none resize-none transition-all"
                                ></textarea>
                            </div>

                            {formData.biteship_area_id && (
                                <div className="col-span-full flex items-center gap-3 px-5 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Wilayah Teridentifikasi oleh Kurir</p>
                                </div>
                            )}

                            <div className="col-span-full flex items-center gap-3 py-2">
                                <input 
                                    type="checkbox" id="is_primary"
                                    checked={formData.is_primary}
                                    onChange={(e) => setFormData({...formData, is_primary: e.target.checked})}
                                    className="w-4 h-4 accent-[#ef3333] rounded"
                                    // FIX ERROR 3: Coerce hasil logika menjadi boolean murni dengan !!
                                    disabled={!!(editingId && editingId === addresses.find(a => a.is_primary)?.id)}
                                />
                                <label htmlFor="is_primary" className="text-[10px] font-black text-zinc-400 uppercase tracking-widest cursor-pointer">Jadikan Alamat Utama</label>
                            </div>

                            <div className="col-span-full pt-4">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-[#ef3333] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    {editingId ? "Simpan Perubahan" : "Konfirmasi Alamat"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
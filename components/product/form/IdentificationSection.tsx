import React from "react";
import { Hash, Layers, Package } from "lucide-react";

interface Props {
    formData: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onGradeSelect: (grade: string) => void;
}

export default function IdentificationSection({ formData, onChange, onGradeSelect }: Props) {
    const GRADES = ["Mint", "NM", "VG+", "VG", "Good", "Fair"];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- SEKSI 1: IDENTIFIKASI --- */}
                <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Hash size={20} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-white">Identifikasi</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Label Rekaman</label>
                            <input
                                name="label"
                                value={formData.label || ""}
                                onChange={onChange}
                                type="text"
                                placeholder="Penerbit Rekaman"
                                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Matrix / Catalog Number</label>
                            <input
                                name="catalog_number"
                                value={formData.catalog_number || ""}
                                onChange={onChange}
                                type="text"
                                placeholder="Nomor identifikasi"
                                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* --- SEKSI 2: KONDISI --- */}
                <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Layers size={20} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-white">Kondisi (Grading) *</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {GRADES.map((grade) => (
                            <button
                                key={grade}
                                type="button"
                                onClick={() => onGradeSelect(grade)}
                                className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.grading === grade
                                    ? "bg-[#ef3333] border-[#ef3333] text-white shadow-lg shadow-red-900/20"
                                    : "bg-[#0a0a0b] border-zinc-800 text-zinc-500 hover:border-zinc-700"
                                    }`}
                            >
                                {grade}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- SEKSI 3: LOGISTIK & DIMENSI (MANDATORY BITESHIP) --- */}
            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Package size={20} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">Logistik & Dimensi *</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Berat Aktual */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Berat Aktual *</label>
                        <div className="relative">
                            <input
                                name="product_weight"
                                value={formData.product_weight || ""}
                                onChange={onChange}
                                type="number"
                                min="1"
                                placeholder="500"
                                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white"
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">GRAM</span>
                        </div>
                    </div>

                    {/* Dimensi Volumetrik */}
                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Panjang (Cm) *</label>
                            <input
                                name="product_length"
                                value={formData.product_length || ""}
                                onChange={onChange}
                                type="number"
                                min="1"
                                placeholder="30"
                                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Lebar (Cm) *</label>
                            <input
                                name="product_width"
                                value={formData.product_width || ""}
                                onChange={onChange}
                                type="number"
                                min="1"
                                placeholder="30"
                                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Tinggi (Cm) *</label>
                            <input
                                name="product_height"
                                value={formData.product_height || ""}
                                onChange={onChange}
                                type="number"
                                min="1"
                                placeholder="5"
                                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white"
                            />
                        </div>
                    </div>
                </div>

                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-600 mt-8 ml-1">
                    * Dimensi wajib diisi akurat. Kesalahan pengisian dapat menyebabkan selisih ongkos kirim (Volumetrik) dari kurir yang akan ditagihkan ke saldo toko Anda.
                </p>
            </div>
        </div>
    );
}
import React from "react";
import { Hash, Layers } from "lucide-react";

interface Props {
    formData: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onGradeSelect: (grade: string) => void;
}

export default function IdentificationSection({ formData, onChange, onGradeSelect }: Props) {
    const GRADES = ["Mint", "NM", "VG+", "VG", "Good", "Fair"];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                        <input name="label" value={formData.label} onChange={onChange} type="text" placeholder="Penerbit Rekaman" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Matrix / Catalog Number</label>
                        <input name="catalog_number" value={formData.catalog_number} onChange={onChange} type="text" placeholder="Nomor identifikasi" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white" />
                    </div>
                </div>
            </div>

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
                            className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.grading === grade ? "bg-[#ef3333] border-[#ef3333] text-white shadow-lg shadow-red-900/20" : "bg-[#0a0a0b] border-zinc-800 text-zinc-500 hover:border-zinc-700"}`}>
                            {grade}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
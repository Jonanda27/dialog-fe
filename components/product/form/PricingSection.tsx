import React from "react";
import { DollarSign } from "lucide-react";

interface Props {
    formData: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function PricingSection({ formData, onChange }: Props) {
    return (
        <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <DollarSign size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Harga & Detail</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Harga (Rp) *</label>
                    <input name="price" value={formData.price} onChange={onChange} type="number" placeholder="0" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all font-black text-white" required />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Jumlah Stok *</label>
                    <input name="stock" value={formData.stock} onChange={onChange} type="number" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all font-black text-white" required />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Catatan Kondisi</label>
                <textarea name="condition_notes" value={formData.condition_notes} onChange={onChange} placeholder="Jelaskan detail minus atau kelebihan produk..." className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white min-h-25" />
            </div>
        </div>
    );
}
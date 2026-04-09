import React from "react";
import { Music } from "lucide-react";

interface Props {
    formData: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function AlbumInfoSection({ formData, onChange }: Props) {
    return (
        <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#ef3333]/10 flex items-center justify-center text-[#ef3333]">
                    <Music size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Informasi Album</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Nama Album *</label>
                    <input name="name" value={formData.name} onChange={onChange} type="text" placeholder="Contoh: Abbey Road" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white" required />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Artist *</label>
                    <input name="artist" value={formData.artist} onChange={onChange} type="text" placeholder="Contoh: The Beatles" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white" required />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Tahun Rilis *</label>
                    <input name="release_year" value={formData.release_year} onChange={onChange} type="number" placeholder="YYYY" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white" required />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Format *</label>
                    <select name="format" value={formData.format} onChange={onChange} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-zinc-400" required>
                        <option value="">Pilih Format</option>
                        <option value="Vinyl">Vinyl (LP/EP)</option>
                        <option value="Cassette">Kaset Pita</option>
                        <option value="CD">Compact Disc (CD)</option>
                        <option value="Gear">Audio Gear Analog</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
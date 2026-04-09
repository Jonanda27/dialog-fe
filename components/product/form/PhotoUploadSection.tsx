import React from "react";
import { Disc, Upload, PlusCircle } from "lucide-react";

interface Props {
    previews: { [key: string]: string };
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, key: string) => void;
}

export default function PhotoUploadSection({ previews, onFileChange }: Props) {
    const MANDATORY_PHOTOS = [
        { id: "front", label: "Sampul Depan", desc: "Sampul depan" },
        { id: "back", label: "Sampul Belakang", desc: "Tracklist" },
        { id: "physical", label: "Kondisi Fisik", desc: "Media & Cover" },
    ];

    return (
        <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Disc size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Foto Produk *</h3>
            </div>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-8">Upload minimal 3 foto wajib untuk verifikasi</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {MANDATORY_PHOTOS.map((item) => (
                    <div key={item.id} className="space-y-3">
                        <label className="group relative border-2 border-dashed border-zinc-800 rounded-4xl h-48 flex flex-col items-center justify-center gap-3 bg-[#0a0a0b] hover:border-[#ef3333]/50 transition-all cursor-pointer overflow-hidden">
                            {previews[item.id] ? (
                                <img src={previews[item.id]} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                            ) : (
                                <>
                                    <Upload size={24} className="text-zinc-700 group-hover:text-[#ef3333]" />
                                    <div className="text-center px-4">
                                        <p className="text-[10px] font-black text-white uppercase">Upload {item.label}</p>
                                    </div>
                                </>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileChange(e, item.id)} />
                        </label>
                        <p className="text-[9px] text-zinc-600 font-medium uppercase text-center">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-900">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Foto Tambahan (Opsional)</h4>
                <div className="flex flex-wrap gap-4">
                    {["extra1", "extra2"].map((id) => (
                        <label key={id} className="w-32 h-32 border-2 border-dashed border-zinc-800 rounded-3xl flex items-center justify-center bg-[#0a0a0b] cursor-pointer overflow-hidden relative">
                            {previews[id] ? (
                                <img src={previews[id]} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                            ) : (
                                <PlusCircle size={16} className="text-zinc-700" />
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileChange(e, id)} />
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
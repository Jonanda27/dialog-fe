import React from "react";
import { Video, CheckCircle, Clock, ChevronRight } from "lucide-react";

interface GradingRequest {
    id: string;
    status: string;
    created_at: string;
    buyer: { name: string };
    product: {
        name: string;
        format: string;
        media: { media_url: string }[];
    };
}

interface Props {
    requests: GradingRequest[];
    onUploadClick: (gradingId: string) => void;
}

export default function GradingRequestTable({ requests, onUploadClick }: Props) {
    // Helper untuk menangani URL gambar yang benar ke backend port 5000
    const getImageUrl = (path: string) => {
        if (!path) return "";
        // Jika path sudah full URL (misal dari storage eksternal)
        if (path.startsWith('http')) return path;
        
        // Membersihkan double slash dan memastikan ke port 5000
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `http://localhost:5000/public${cleanPath}`;
    };

    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-[#0a0a0b] border border-zinc-900 rounded-[3rem] shadow-inner">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                    <Video size={32} className="text-zinc-700" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-widest">Kosong</h3>
                <p className="text-sm text-zinc-500 mt-2 font-medium">Belum ada permintaan grading masuk saat ini.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#0a0a0b] border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="text-[10px] uppercase font-black text-zinc-500 bg-zinc-900/30 border-b border-zinc-900">
                        <tr>
                            <th className="px-8 py-6 tracking-[0.2em]">Info Produk</th>
                            <th className="px-8 py-6 tracking-[0.2em]">Peminta</th>
                            <th className="px-8 py-6 tracking-[0.2em]">Status</th>
                            <th className="px-8 py-6 tracking-[0.2em] text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/50">
                        {requests.map((req) => (
                            <tr key={req.id} className="group hover:bg-zinc-900/30 transition-all duration-300">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-zinc-900 rounded-2xl overflow-hidden shrink-0 border border-zinc-800 group-hover:border-zinc-600 transition-colors">
                                            {req.product.media?.[0]?.media_url ? (
                                                <img
                                                    src={getImageUrl(req.product.media[0].media_url)}
                                                    alt={req.product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/111/333?text=No+Image';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                                    <Video size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-base leading-none mb-1.5">{req.product.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                                                    {req.product.format}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-white font-semibold text-sm">{req.buyer.name}</p>
                                    <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-tighter">Verified Buyer</p>
                                </td>

                                <td className="px-8 py-6">
                                    {(req.status === 'fulfilled' || req.status === 'MEDIA_READY') ? (
                                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]">
                                            <CheckCircle size={12} strokeWidth={3} /> Selesai
                                        </span>
                                    ) : (req.status === 'AWAITING_SELLER_MEDIA' || req.status === 'requested') ? (
                                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/5 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]">
                                            <Clock size={12} strokeWidth={3} /> Perlu Video
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-400 border border-zinc-700">
                                            {req.status}
                                        </span>
                                    )}
                                </td>

                                <td className="px-8 py-6 text-right">
                                    {(req.status === 'AWAITING_SELLER_MEDIA' || req.status === 'requested') ? (
                                        <button
                                            onClick={() => onUploadClick(req.id)}
                                            className="inline-flex items-center gap-2 bg-[#ef3333] hover:bg-white hover:text-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-900/10 group/btn"
                                        >
                                            <Video size={14} className="group-hover/btn:scale-110 transition-transform" /> 
                                            Upload Detail
                                        </button>
                                    ) : (
                                        <button disabled className="inline-flex items-center gap-2 bg-zinc-900 text-zinc-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed opacity-50">
                                            Completed
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
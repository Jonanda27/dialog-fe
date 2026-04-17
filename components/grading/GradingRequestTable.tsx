import React from "react";
import { Video, CheckCircle, Clock } from "lucide-react";

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
    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-[#111114] border border-zinc-900 rounded-[2.5rem]">
                <Video size={48} className="text-zinc-700 mb-4" />
                <h3 className="text-lg font-black text-white uppercase tracking-widest">Belum Ada Permintaan</h3>
                <p className="text-sm text-zinc-500 mt-2">Permintaan grading video dari pembeli akan muncul di sini.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-left text-sm text-zinc-400">
                <thead className="text-[10px] uppercase font-black text-zinc-500 bg-[#0a0a0b] border-b border-zinc-900">
                    <tr>
                        <th className="px-6 py-5">Produk</th>
                        <th className="px-6 py-5">Peminta (Buyer)</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                    {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-[#1a1a1f] transition-colors">
                            <td className="px-6 py-5 flex items-center gap-4">
                                <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                                    {req.product.media?.[0]?.media_url ? (
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${req.product.media[0].media_url}`}
                                            alt={req.product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-600"><Video size={16} /></div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-bold">{req.product.name}</p>
                                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">{req.product.format}</p>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-white font-medium">{req.buyer.name}</td>

                            {/* Pembaruan Logika Status Render */}
                            <td className="px-6 py-5">
                                {(req.status === 'fulfilled' || req.status === 'MEDIA_READY') ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                        <CheckCircle size={12} /> Selesai
                                    </span>
                                ) : (req.status === 'AWAITING_SELLER_MEDIA' || req.status === 'requested') ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                        <Clock size={12} /> Menunggu Video
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                                        {req.status}
                                    </span>
                                )}
                            </td>

                            {/* Pembaruan Logika Action Button */}
                            <td className="px-6 py-5 text-right">
                                {(req.status === 'AWAITING_SELLER_MEDIA' || req.status === 'requested') && (
                                    <button
                                        onClick={() => onUploadClick(req.id)}
                                        className="inline-flex items-center gap-2 bg-[#ef3333] hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-900/20"
                                    >
                                        <Video size={14} /> Upload Detail
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
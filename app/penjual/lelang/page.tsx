'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Timer, Calendar, CheckCircle2, XCircle, Search, ExternalLink, Loader2, AlertCircle, Disc, ArrowUpRight, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatRupiah } from "@/utils/format";
import { getImageUrl } from "@/utils/image";
import { auctionService } from "@/services/api/auction.service";
import { Auction, AuctionStatus } from "@/types/auction";
import CreateAuctionModal from "@/components/penjual/lelang/CreateAuctionModal";

export default function SellerAuctionDashboard() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    const fetchAuctions = useCallback(async () => {
        try {
            setIsLoading(true);
            const res: any = await auctionService.getMyStoreAuctions();

            // 🔥 ROBUST EXTRACTION: Handle kasus di mana res adalah array langsung atau object
            const auctionList = Array.isArray(res) ? res : (res?.data || []);
            setAuctions(auctionList);

        } catch (error: any) {
            toast.error(error.message || "Gagal memuat lelang.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchAuctions(); }, [fetchAuctions]);

    const handleCancelAuction = async (id: string) => {
        if (!window.confirm("Batalkan lelang ini permanen?")) return;
        try {
            await auctionService.cancelAuction(id);
            toast.success("Lelang dibatalkan.");
            fetchAuctions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal membatalkan.");
        }
    };

    const filteredAuctions = useMemo(() => {
        if (filterStatus === "ALL") return auctions;
        if (filterStatus === "ENDED") return auctions.filter(a => ['COMPLETED', 'FAILED', 'CANCELLED'].includes(a.status));
        return auctions.filter(a => a.status === filterStatus);
    }, [auctions, filterStatus]);

    const getStatusBadge = (status: AuctionStatus) => {
        const styles: Record<string, string> = {
            ACTIVE: "bg-red-500 text-white", SCHEDULED: "bg-blue-600 text-white",
            FREEZE: "bg-amber-500 text-black", COMPLETED: "bg-emerald-600 text-white",
            FAILED: "bg-zinc-700 text-zinc-300", CANCELLED: "bg-zinc-700 text-zinc-300",
        };
        return <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${styles[status] || 'bg-zinc-800'}`}>{status.replace(/_/g, ' ')}</span>;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    const filterTabs = [
        { label: "Semua", value: "ALL" },
        { label: "Dijadwalkan", value: "SCHEDULED" },
        { label: "Sedang Live", value: "ACTIVE" },
        { label: "Selesai/Batal", value: "ENDED" }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 p-4 md:p-10 selection:bg-red-500/30">
            <div className="max-w-7xl mx-auto space-y-10">
                <header className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-[0.3em] text-xs"><span className="w-8 h-px bg-red-500"></span> Control Center</div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">Auction <span className="text-zinc-500">Arena</span></h1>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors">
                        <Plus size={18} /> Launch New Auction
                    </button>
                </header>

                <div className="space-y-6">
                    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setFilterStatus(tab.value)}
                                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterStatus === tab.value
                                    ? "bg-red-600 text-white shadow-[0_0_15px_rgba(239,51,51,0.3)]"
                                    : "bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="animate-spin text-red-500" size={40} /></div>
                        ) : filteredAuctions.length === 0 ? (
                            <div className="bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-[3rem] py-24 text-center"><AlertCircle size={48} className="mx-auto text-zinc-800 mb-4" /> <h3 className="text-xl font-black uppercase text-zinc-500">No records found</h3></div>
                        ) : (
                            <div className="bg-zinc-900/20 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-zinc-900/50 border-b border-zinc-800">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase">Collection</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase">Schedule</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase text-center">Live Price</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-900">
                                        {filteredAuctions.map((a) => {
                                            const primaryMedia = a.media?.find(m => m.is_primary)?.media_url || a.media?.[0]?.media_url;
                                            return (
                                                <tr key={a.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
                                                                <img src={getImageUrl(primaryMedia || '/vynil.png')} alt={a.item_name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-white uppercase line-clamp-1">{a.item_name}</p>
                                                                <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">ID: {a.id.split('-')[0]}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center text-[11px] font-bold text-zinc-300">
                                                                <Clock size={12} className="mr-2 text-blue-500" />
                                                                {formatDate(a.start_time)}
                                                            </div>
                                                            <div className="flex items-center text-[11px] font-bold text-zinc-500">
                                                                <Timer size={12} className="mr-2 text-red-500" />
                                                                {formatDate(a.end_time)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <p className="text-sm font-black text-white">{formatRupiah(Number(a.current_price))}</p>
                                                        <p className="text-[9px] font-bold text-red-500 mt-1 uppercase">+{formatRupiah(Number(a.increment))}</p>
                                                    </td>
                                                    <td className="px-8 py-6">{getStatusBadge(a.status)}</td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {(a.status === 'ACTIVE' || a.status === 'FREEZE') && (
                                                                <Link href={`/penjual/lelang/${a.id}/monitor`} className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors" title="Monitor Live Bid">
                                                                    <ArrowUpRight size={18} />
                                                                </Link>
                                                            )}
                                                            {a.status === 'SCHEDULED' && (
                                                                <button onClick={() => handleCancelAuction(a.id)} className="p-3 bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-xl transition-colors" title="Batalkan Lelang">
                                                                    <XCircle size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <CreateAuctionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); fetchAuctions(); }} />
            </div>
        </div>
    );
}
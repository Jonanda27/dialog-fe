'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
    Plus, Gavel, Timer, Calendar, CheckCircle2, XCircle, Search,
    MoreVertical, ExternalLink, Loader2, AlertCircle, Disc, ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';

// Utils & Services
import { formatRupiah } from "@/utils/format";
import { getImageUrl } from "@/utils/image";
import { auctionService } from "@/services/api/auction.service";

// Types
import { Auction, AuctionStatus } from "@/types/auction";

// Components
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
            const finalData = res?.data || (Array.isArray(res) ? res : []);
            setAuctions(finalData);
        } catch (error: any) {
            console.error("Fetch auctions error:", error);
            toast.error(error.message || "Gagal memuat daftar lelang.");
            setAuctions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchAuctions(); }, [fetchAuctions]);

    const handleCancelAuction = async (id: string) => {
        // PERBAIKAN TEKS: Sesuai logika baru (tidak ada produk reguler yang di-unlock)
        if (!window.confirm("Apakah Anda yakin ingin membatalkan jadwal lelang ini secara permanen?")) return;
        try {
            await auctionService.cancelAuction(id);
            toast.success("Lelang berhasil dibatalkan.");
            fetchAuctions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal membatalkan lelang.");
        }
    };

    const filteredAuctions = useMemo(() => {
        if (filterStatus === "ALL") return auctions;
        if (filterStatus === "ENDED") return auctions.filter(a => ['COMPLETED', 'FAILED', 'CANCELLED'].includes(a.status));
        return auctions.filter(a => a.status === filterStatus);
    }, [auctions, filterStatus]);

    const getStatusBadge = (status: AuctionStatus) => {
        const styles: Record<string, string> = {
            ACTIVE: "bg-red-500 text-white shadow-[0_0_10px_rgba(239,51,51,0.4)]",
            SCHEDULED: "bg-blue-600 text-white",
            FREEZE: "bg-amber-500 text-black",
            COMPLETED: "bg-emerald-600 text-white",
            FAILED: "bg-zinc-700 text-zinc-300",
            CANCELLED: "bg-zinc-700 text-zinc-300",
            EVALUATION: "bg-purple-600 text-white",
        };
        return (
            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${styles[status] || styles['DRAFT']}`}>
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 p-4 md:p-10 selection:bg-red-500/30">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* TOP BAR: HEADER & ACTION */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-[0.3em] text-xs">
                            <span className="w-8 h-px bg-red-500"></span> Control Center
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
                            Auction <span className="text-zinc-500">Arena</span>
                        </h1>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group relative flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all hover:bg-red-600 hover:text-white active:scale-95 shadow-2xl shadow-white/5"
                    >
                        <Plus size={18} className="transition-transform group-hover:rotate-90" />
                        Launch New Auction
                    </button>
                </header>

                {/* BENTO STATS */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Live Now", val: auctions.filter(a => a.status === 'ACTIVE').length, icon: Timer, color: "text-red-500" },
                        { label: "Upcoming", val: auctions.filter(a => a.status === 'SCHEDULED').length, icon: Calendar, color: "text-blue-500" },
                        { label: "Completed", val: auctions.filter(a => a.status === 'COMPLETED').length, icon: CheckCircle2, color: "text-emerald-500" },
                        { label: "Total Asset", val: auctions.length, icon: Disc, color: "text-zinc-500" }
                    ].map((s, i) => (
                        <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-colors">
                            <s.icon size={20} className={`${s.color} mb-4`} />
                            <p className="text-2xl font-black text-white leading-none">{s.val}</p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">{s.label}</p>
                        </div>
                    ))}
                </section>

                {/* FILTER & SEARCH BAR */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/30 p-2 rounded-2xl border border-zinc-800/50 backdrop-blur-md">
                    <div className="flex p-1 bg-black rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
                        {['ALL', 'ACTIVE', 'SCHEDULED', 'ENDED'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilterStatus(tab)}
                                className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${filterStatus === tab ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-80 px-2">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                        <input
                            type="text"
                            placeholder="Search by collection name..."
                            className="w-full bg-black border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:border-red-500 transition-all placeholder:text-zinc-700"
                        />
                    </div>
                </div>

                {/* CONTENT AREA: TABLE (DESKTOP) / CARDS (MOBILE) */}
                <div className="relative">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-red-500" size={40} />
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Syncing with High-Speed Node...</p>
                        </div>
                    ) : filteredAuctions.length === 0 ? (
                        <div className="bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-[3rem] py-24 text-center">
                            <AlertCircle size={48} className="mx-auto text-zinc-800 mb-4" />
                            <h3 className="text-xl font-black uppercase">No records found</h3>
                            <p className="text-zinc-600 text-sm mt-2">Start by launching your first auction session.</p>
                        </div>
                    ) : (
                        <>
                            {/* DESKTOP TABLE */}
                            <div className="hidden md:block bg-zinc-900/20 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-zinc-900/50 border-b border-zinc-800">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Collection</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Live Price</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Schedule</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-900">
                                        {filteredAuctions.map((a) => (
                                            <tr key={a.id} className="hover:bg-white/2 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 relative">
                                                            {/* PERBAIKAN: Gunakan a.media bukan a.product?.media */}
                                                            <img
                                                                src={getImageUrl(a.media?.find((m: any) => m.is_primary)?.media_url || '/vynil.png')}
                                                                className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
                                                                alt={a.item_name}
                                                            />
                                                        </div>
                                                        <div>
                                                            {/* PERBAIKAN: Gunakan a.item_name bukan a.product?.name */}
                                                            <p className="text-sm font-black text-white uppercase leading-tight">{a.item_name}</p>
                                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mt-1 italic">ID: {a.id.split('-')[0]}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <p className="text-sm font-black text-white">{formatRupiah(Number(a.current_price))}</p>
                                                    <p className="text-[9px] font-bold text-red-500 mt-1 uppercase tracking-widest">+{formatRupiah(Number(a.increment))}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                                                        <Calendar size={12} className="text-zinc-600" />
                                                        {new Date(a.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-tighter">
                                                        <Timer size={10} /> {new Date(a.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">{getStatusBadge(a.status)}</td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {(a.status === 'ACTIVE' || a.status === 'FREEZE') && (
                                                            <Link href={`/penjual/lelang/${a.id}/monitor`} className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 transition-all">
                                                                <ArrowUpRight size={18} />
                                                            </Link>
                                                        )}
                                                        {a.status === 'SCHEDULED' && (
                                                            <button onClick={() => handleCancelAuction(a.id)} className="p-3 bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-xl transition-colors">
                                                                <XCircle size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE CARDS */}
                            <div className="md:hidden space-y-4">
                                {filteredAuctions.map((a) => (
                                    <div key={a.id} className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-3xl space-y-4">
                                        <div className="flex gap-4">
                                            <div className="w-20 h-20 bg-zinc-800 rounded-2xl overflow-hidden shrink-0">
                                                {/* PERBAIKAN: Gunakan a.media */}
                                                <img src={getImageUrl(a.media?.find((m: any) => m.is_primary)?.media_url || '/vynil.png')} className="w-full h-full object-cover" alt={a.item_name} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    {getStatusBadge(a.status)}
                                                </div>
                                                {/* PERBAIKAN: Gunakan a.item_name */}
                                                <h4 className="text-sm font-black text-white uppercase truncate">{a.item_name}</h4>
                                                <p className="text-lg font-black text-red-500 mt-2">{formatRupiah(Number(a.current_price))}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-zinc-800/50">
                                            {(a.status === 'ACTIVE' || a.status === 'FREEZE') && (
                                                <Link href={`/penjual/lelang/${a.id}/monitor`} className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                                    Monitor <ExternalLink size={14} />
                                                </Link>
                                            )}
                                            {a.status === 'SCHEDULED' && (
                                                <button onClick={() => handleCancelAuction(a.id)} className="flex items-center justify-center gap-2 bg-zinc-800 text-zinc-300 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                                    Cancel
                                                </button>
                                            )}
                                            <button className="flex items-center justify-center gap-2 bg-zinc-900 text-zinc-500 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* MODAL */}
                <CreateAuctionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchAuctions();
                    }}
                />
            </div>
        </div>
    );
}
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Plus,
    Gavel,
    Timer,
    Calendar,
    CheckCircle2,
    XCircle,
    Search,
    MoreVertical,
    ExternalLink,
    Loader2,
    AlertCircle,
    Disc
} from "lucide-react";
import { toast } from "sonner";

// Utils & Services
import { formatRupiah } from "@/utils/format";
import { getImageUrl } from "@/utils/image";
// Asumsi Anda akan membuat auctionService untuk handle hit API
// import { auctionService } from "@/services/api/auction.service"; 

// Components
import CreateAuctionModal from "@/components/penjual/lelang/CreateAuctionModal";

type AuctionStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'FREEZE' | 'EVALUATION' | 'COMPLETED' | 'HANDOVER_TO_RUNNER_UP' | 'FAILED';

interface AuctionItem {
    id: string;
    product_id: string;
    start_time: string;
    end_time: string;
    increment: number;
    current_price: number;
    status: AuctionStatus;
    product: {
        name: string;
        media: any[];
        metadata: any;
    };
}

export default function SellerAuctionDashboard() {
    const [auctions, setAuctions] = useState<AuctionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");

    // Fetch Data dari Backend
    const fetchAuctions = useCallback(async () => {
        try {
            setIsLoading(true);
            // Skenario Mock: Ganti dengan auctionService.getStoreAuctions() nantinya
            // const res = await auctionService.getStoreAuctions();
            // if (res.success) setAuctions(res.data);

            // Simulasi delay fetch
            await new Promise(resolve => setTimeout(resolve, 800));
            setAuctions([]); // Sementara kosong
        } catch (error) {
            toast.error("Gagal memuat daftar lelang.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAuctions();
    }, [fetchAuctions]);

    // Handler Pembatalan
    const handleCancelAuction = async (id: string) => {
        const confirm = window.confirm("Apakah Anda yakin ingin membatalkan jadwal lelang ini? Produk akan otomatis di-unlock.");
        if (!confirm) return;

        try {
            // await auctionService.cancelAuction(id);
            toast.success("Lelang berhasil dibatalkan.");
            fetchAuctions(); // Refresh data
        } catch (error: any) {
            toast.error(error.message || "Gagal membatalkan lelang.");
        }
    };

    // Helper UI: Badge Status
    const getStatusBadge = (status: AuctionStatus) => {
        const styles: Record<string, string> = {
            ACTIVE: "bg-red-500/10 text-red-500 border-red-500/20",
            SCHEDULED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
            FREEZE: "bg-amber-500/10 text-amber-500 border-amber-500/20",
            COMPLETED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
            FAILED: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
            EVALUATION: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        };

        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.FAILED}`}>
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <div className="p-8 space-y-10 bg-[#0a0a0b] min-h-screen text-white">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                        <Gavel className="text-[#ef3333]" size={36} />
                        Auction Management
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium mt-1">
                        Kelola sesi lelang produk Anda dan pantau pergerakan harga secara real-time.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-white text-black hover:bg-[#ef3333] hover:text-white transition-all font-black text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-95"
                >
                    <Plus size={18} /> Buat Sesi Lelang
                </button>
            </div>

            {/* STATS SUMMARY (Mini) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Active Auctions", value: auctions.filter(a => a.status === 'ACTIVE').length, icon: Timer, color: "text-red-500" },
                    { label: "Scheduled", value: auctions.filter(a => a.status === 'SCHEDULED').length, icon: Calendar, color: "text-blue-500" },
                    { label: "Success Handover", value: auctions.filter(a => a.status === 'COMPLETED').length, icon: CheckCircle2, color: "text-emerald-500" },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#111114] border border-zinc-800 p-6 rounded-4xl flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* FILTER & SEARCH */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111114] p-4 rounded-3xl border border-zinc-800">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {['ALL', 'ACTIVE', 'SCHEDULED', 'ENDED'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilterStatus(tab)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === tab ? 'bg-[#ef3333] text-white shadow-lg' : 'text-zinc-500 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <input
                        type="text"
                        placeholder="Cari Produk..."
                        className="bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#ef3333] transition-colors w-full md:w-64"
                    />
                </div>
            </div>

            {/* TABLE SECTION */}
            <div className="bg-[#111114] border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/50">
                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Product Info</th>
                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Current Bid</th>
                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Timing</th>
                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center">
                                    <Loader2 className="animate-spin text-[#ef3333] mx-auto mb-4" size={32} />
                                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Menganalisa Data Lelang...</p>
                                </td>
                            </tr>
                        ) : auctions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center">
                                    <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-700">
                                        <AlertCircle size={32} />
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-tighter mb-2">Belum Ada Sesi Lelang</h3>
                                    <p className="text-zinc-500 text-xs font-medium max-w-xs mx-auto">
                                        Mulai lelang pertama Anda untuk mendapatkan penawaran terbaik dari para kolektor.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            auctions.map((auction) => (
                                <tr key={auction.id} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700 group-hover:border-[#ef3333] transition-colors">
                                                {/* Placeholder Image */}
                                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                                    <Disc size={24} />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-tight">{auction.product.name}</p>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase italic">ID: {auction.id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-black text-white">{formatRupiah(auction.current_price)}</p>
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Inc: +{formatRupiah(auction.increment)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                                                <Calendar size={12} /> {new Date(auction.start_time).toLocaleDateString('id-ID')}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                                                <Timer size={12} /> {new Date(auction.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {getStatusBadge(auction.status)}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Tombol MONITOR (Hanya muncul jika lelang ACTIVE/FREEZE) */}
                                            {(auction.status === 'ACTIVE' || auction.status === 'FREEZE') && (
                                                <Link
                                                    href={`/penjual/lelang/${auction.id}/monitor`}
                                                    className="p-2.5 bg-[#ef3333]/10 text-[#ef3333] hover:bg-[#ef3333] hover:text-white rounded-xl transition-all shadow-lg"
                                                    title="Monitor Real-time"
                                                >
                                                    <ExternalLink size={18} />
                                                </Link>
                                            )}

                                            {/* Tombol CANCEL (Hanya jika SCHEDULED) */}
                                            {auction.status === 'SCHEDULED' && (
                                                <button
                                                    onClick={() => handleCancelAuction(auction.id)}
                                                    className="p-2.5 bg-zinc-800 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
                                                    title="Batalkan Jadwal"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            )}

                                            <button className="p-2.5 bg-zinc-900 text-zinc-600 hover:text-white rounded-xl transition-all">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL CREATION */}
            <CreateAuctionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    fetchAuctions();
                }}
            />
        </div>
    );
}
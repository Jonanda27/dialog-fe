'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AlertCircle, PlayCircle, Clock, FileSearch, 
    ChevronDown, Maximize2, Music2, Loader2,
    ShieldCheck
} from 'lucide-react';
import GradingService from '@/services/api/grading.service';
import { GradingRequest } from '@/types/grading';
import { useAuthStore } from "@/store/authStore";
import { toast } from 'sonner';

export default function GradingPage() {
    const { isInitialized } = useAuthStore();
    const [tickets, setTickets] = useState<GradingRequest[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
    
    // FIX: Menambahkan state isFetching dan isLoading yang sebelumnya menyebabkan error
    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // 1. FETCH DATA TIKET GRADING
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setIsFetching(true);
                setIsLoading(true);
                const response = await GradingService.getBuyerRequests();
                
                // Normalisasi Response Data
                const safeResponse = response as any;
                let rawData: GradingRequest[] = [];

                if (Array.isArray(safeResponse)) {
                    rawData = safeResponse;
                } else if (safeResponse?.data && Array.isArray(safeResponse.data)) {
                    rawData = safeResponse.data;
                } else if (safeResponse?.data?.data && Array.isArray(safeResponse.data.data)) {
                    rawData = safeResponse.data.data;
                }

                // Filter hanya tiket yang aktif/relevan bagi buyer [cite: 676, 677]
                const activeStates = ['requested', 'awaiting_seller_media', 'media_ready', 'fulfilled', 'completed'];
                const activeTickets = rawData.filter((t: any) => {
                    const status = t.status?.toLowerCase() || '';
                    return activeStates.includes(status);
                });

                setTickets(activeTickets);
            } catch (err: any) {
                setError(err.message || 'Gagal memuat data verifikasi.');
            } finally {
                // Sekarang fungsi ini sudah terdefinisi dan tidak akan menyebabkan error
                setIsFetching(false);
                setIsLoading(false);
            }
        };

        if (isInitialized) fetchTickets();
    }, [isInitialized]);

    // 2. TOGGLE VIDEO PLAYER (INSPECT)
    const toggleVideo = (ticketId: string, status: string) => {
        const s = status.toLowerCase();
        // Video hanya bisa dilihat jika status sudah Media Ready, Fulfilled, atau Completed [cite: 677]
        const viewableStates = ['media_ready', 'fulfilled', 'completed'];
        
        if (!viewableStates.includes(s)) {
            toast.info('Video verifikasi sedang disiapkan oleh penjual.', {
                style: { background: '#0a0a0b', color: '#fff', border: '1px solid #27272a' }
            });
            return;
        }
        setExpandedTicketId(expandedTicketId === ticketId ? null : ticketId);
    };

    // 3. RENDER LOADING STATE
    if (!isInitialized || isFetching) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-[#ef3333]" size={32} />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Menyinkronkan Tiket...</p>
        </div>
    );

    return (
        <div className="w-full">
            {/* HEADER SECTION */}
            <div className="mb-10 border-b border-zinc-900 pb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Verifikasi Premium</h2>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Layanan inspeksi video detail sebelum Anda melakukan checkout</p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Buyer Protection Active</span>
                </div>
            </div>

            {/* ERROR STATE */}
            {error ? (
                <div className="p-10 text-center bg-red-950/10 border border-red-900/20 rounded-[2rem] text-red-500">
                    <AlertCircle className="mx-auto mb-2" size={24} />
                    <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
            ) : tickets.length === 0 ? (
                /* EMPTY STATE */
                <div className="flex flex-col items-center justify-center py-40 bg-[#0a0a0b] border border-zinc-900 border-dashed rounded-[3rem]">
                    <FileSearch size={32} className="text-zinc-800 mb-4" />
                    <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] font-black italic">No Active Requests</p>
                </div>
            ) : (
                /* TICKETS GRID */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {tickets.map((ticket) => {
                        const s = ticket.status?.toLowerCase();
                        const isReady = s === 'media_ready' || s === 'fulfilled' || s === 'completed';
                        const isExpanded = expandedTicketId === ticket.id;

                        return (
                            <div 
                                key={ticket.id}
                                className={`flex flex-col rounded-[2.5rem] border transition-all duration-700 overflow-hidden ${
                                    isExpanded 
                                    ? 'bg-zinc-900 border-[#ef3333] shadow-[0_0_60px_rgba(239,51,51,0.1)]' 
                                    : 'bg-[#0a0a0b] border-zinc-800 hover:border-zinc-700 shadow-xl'
                                }`}
                            >
                                {/* Card Content */}
                                <div className="p-8 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                            isExpanded ? 'bg-[#ef3333] text-white shadow-lg' : 'bg-zinc-900 text-zinc-700 border border-zinc-800'
                                        }`}>
                                            {isReady ? <PlayCircle size={28} /> : <Clock size={28} />}
                                        </div>
                                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                                            isReady 
                                            ? (s === 'completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20')
                                            : 'bg-zinc-800 text-zinc-600 border-zinc-800'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-current animate-pulse' : 'bg-zinc-700'}`} />
                                            {s === 'completed' ? 'Verified' : (isReady ? 'Ready' : 'Wait for Media')}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-10">
                                        <h4 className="text-xl font-black text-white uppercase tracking-tighter leading-none italic truncate">
                                            {ticket.product?.name || 'Analog Item'}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <Music2 size={12} className="text-[#ef3333]" />
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate">
                                                {ticket.product?.metadata?.artist || 'Unknown Artist'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between border-t border-zinc-800/50 pt-6">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Grading Note</span>
                                            <span className="text-[11px] font-black text-white uppercase italic">
                                                {ticket.product?.metadata?.media_grading ? `Grade: ${ticket.product.metadata.media_grading}` : 'N/A'}
                                            </span>
                                        </div>

                                        <button 
                                            onClick={() => toggleVideo(ticket.id, ticket.status)}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                isReady 
                                                ? 'bg-white text-black hover:bg-[#ef3333] hover:text-white active:scale-95' 
                                                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
                                            }`}
                                        >
                                            {isExpanded ? 'Close' : 'Inspect Detail'} 
                                            <ChevronDown size={14} className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Video Card Expansion (Private Proxy Stream) [cite: 106-118] */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                            className="bg-black border-t border-zinc-800"
                                        >
                                            <div className="relative aspect-video group">
                                                <video
                                                    src={GradingService.getAuthenticatedStreamUrl(ticket.id)}
                                                    controls
                                                    autoPlay
                                                    crossOrigin="anonymous"
                                                    controlsList="nodownload"
                                                    className="w-full h-full object-contain"
                                                />
                                                <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center gap-2">
                                                        <Maximize2 size={10} className="text-white" />
                                                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Secure Stream</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6 bg-zinc-900/50">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle size={14} className="text-[#ef3333] shrink-0 mt-0.5" />
                                                    <p className="text-[9px] text-zinc-500 leading-relaxed uppercase font-bold">
                                                        Video ini adalah bukti verifikasi fisik produk. Pastikan kondisi barang sesuai dengan video saat diterima untuk keperluan klaim jika terjadi sengketa.
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
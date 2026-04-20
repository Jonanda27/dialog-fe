'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, PlayCircle, Clock, FileSearch, ChevronDown, Maximize2, Music2 } from 'lucide-react';
import GradingService from '@/services/api/grading.service';
import { GradingRequest } from '@/types/grading';
import { toast } from 'sonner';

export default function GradingHub() {
    const [tickets, setTickets] = useState<GradingRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setIsLoading(true);
                const response = await GradingService.getBuyerRequests();
                const safeResponse = response as any;
                let rawData: GradingRequest[] = [];

                if (Array.isArray(safeResponse)) rawData = safeResponse;
                else if (safeResponse?.data && Array.isArray(safeResponse.data)) rawData = safeResponse.data;
                else if (safeResponse?.data?.data && Array.isArray(safeResponse.data.data)) rawData = safeResponse.data.data;

                const activeStates = ['requested', 'awaiting_seller_media', 'media_ready', 'fulfilled'];
                const activeTickets = rawData.filter((t: any) => {
                    const status = t.status?.toLowerCase() || '';
                    return activeStates.includes(status);
                });

                setTickets(activeTickets);
            } catch (err: any) {
                setError(err.message || 'Gagal memuat data.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const toggleVideo = (ticketId: string, status: string) => {
        const s = status.toLowerCase();
        if (s !== 'media_ready' && s !== 'fulfilled') {
            toast.info('Video verifikasi sedang diproses.', {
                style: { background: '#0a0a0b', color: '#fff', border: '1px solid #27272a' }
            });
            return;
        }
        setExpandedTicketId(expandedTicketId === ticketId ? null : ticketId);
    };

    return (
        <div className="w-full">
            {error ? (
                <div className="p-10 text-center bg-red-950/10 border border-red-900/20 rounded-[2rem] text-red-500">
                    <AlertCircle className="mx-auto mb-2" size={24} />
                    <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
            ) : isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-96 w-full bg-zinc-900/20 border border-zinc-900 rounded-[2.5rem] animate-pulse" />
                    ))}
                </div>
            ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 bg-[#111114] border border-zinc-900 rounded-[3rem]">
                    <FileSearch size={32} className="text-zinc-800 mb-4" />
                    <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] font-black italic">Empty Requests</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tickets.map((ticket) => {
                        const s = ticket.status?.toLowerCase();
                        const isReady = s === 'media_ready' || s === 'fulfilled';
                        const isExpanded = expandedTicketId === ticket.id;

                        return (
                            <div 
                                key={ticket.id}
                                className={`flex flex-col rounded-[2.5rem] border transition-all duration-700 overflow-hidden ${
                                    isExpanded 
                                    ? 'bg-zinc-900 border-[#ef3333] shadow-[0_0_60px_rgba(239,51,51,0.1)]' 
                                    : 'bg-[#111114] border-zinc-800/50 hover:border-zinc-700 shadow-xl'
                                }`}
                            >
                                {/* Card Body */}
                                <div className="p-8 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                            isExpanded ? 'bg-[#ef3333] text-white shadow-lg' : 'bg-zinc-900 text-zinc-700 border border-zinc-800'
                                        }`}>
                                            {isReady ? <PlayCircle size={28} /> : <Clock size={28} />}
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                                            isReady ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-800 text-zinc-600 border-zinc-800'
                                        }`}>
                                            {isReady ? 'Ready' : 'In Progress'}
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

                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Authentication</span>
                                            <span className="text-[11px] font-black text-white uppercase italic">Grade: {ticket.product?.metadata?.media_grading || 'N/A'}</span>
                                        </div>

                                        <button 
                                            onClick={() => toggleVideo(ticket.id, ticket.status)}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                isReady 
                                                ? 'bg-white text-black hover:bg-[#ef3333] hover:text-white' 
                                                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                            }`}
                                        >
                                            {isExpanded ? 'Close' : 'Inspect'} 
                                            <ChevronDown size={14} className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Video Card Expansion */}
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
                                                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Fullscreen</span>
                                                    </div>
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
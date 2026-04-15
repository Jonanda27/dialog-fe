'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import GradingService from '@/services/api/grading.service';
import { GradingRequest } from '@/types/grading';
import { toast } from 'sonner';

export default function GradingHub() {
    const [tickets, setTickets] = useState<GradingRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

    // Fetch data tiket aktif saat komponen di-mount
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setError(null);
                // Call endpoint: GET /api/grading/my-requests (Endpoint Buyer)
                const response = await GradingService.getBuyerRequests();

                // Filter hanya tiket yang butuh perhatian (Menunggu video atau Video sudah siap)
                const activeTickets = response.data?.filter((t: GradingRequest) =>
                    t.status === 'AWAITING_SELLER_MEDIA' || t.status === 'MEDIA_READY'
                ) || [];

                setTickets(activeTickets);
            } catch (error: any) {
                console.error("Failed to fetch grading requests:", error);

                // ⚡ Specific error handling untuk 404 endpoint
                if (error.status === 404) {
                    setError('Layanan grading sedang mengalami gangguan teknis. Hubungi support jika masalah berlanjut.');
                } else if (error.message?.includes('not valid JSON')) {
                    setError('Response dari server tidak valid. Coba refresh halaman.');
                } else {
                    setError(error.message || 'Gagal memuat data grading. Coba lagi nanti.');
                }

                // Reset tickets jika error
                setTickets([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTickets();
    }, []);

    // Fungsi untuk memutar video dengan otorisasi JWT
    const handlePlayVideo = (ticketId: string, status: string) => {
        if (status !== 'MEDIA_READY') {
            toast.info('Video belum diunggah oleh penjual.');
            return;
        }

        // Memanfaatkan metode helper untuk mendapatkan URL streaming terautentikasi
        // (Ini akan kita buat di grading.service.ts setelah ini)
        const streamUrl = GradingService.getAuthenticatedStreamUrl(ticketId);
        setSelectedVideoUrl(streamUrl);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-serif text-white">Grading Hub</h2>
                    <p className="text-xs text-zinc-500 mt-1">Video verifikasi premium fisik Anda</p>
                </div>
                {/* Indikator PING menyala jika ada video yang belum ditonton/di-checkout */}
                {tickets.some(t => t.status === 'MEDIA_READY') && (
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                )}
            </div>

            {/* Modal Pemutar Video Sederhana */}
            <AnimatePresence>
                {selectedVideoUrl && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 overflow-hidden rounded-2xl bg-black border border-zinc-800 relative"
                    >
                        {/* Tombol Tutup Video */}
                        <button
                            onClick={() => setSelectedVideoUrl(null)}
                            className="absolute top-2 right-2 z-10 bg-zinc-900/80 text-white p-2 rounded-full hover:bg-red-600 transition"
                        >
                            ✕
                        </button>

                        {/* Video Player dengan kontrol Native */}
                        <video
                            src={selectedVideoUrl}
                            controls
                            autoPlay
                            className="w-full aspect-video object-contain"
                            controlsList="nodownload" // Mencegah download langsung via UI
                        >
                            Browser Anda tidak mendukung pemutar video HTML5.
                        </video>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Daftar Tiket Aktif */}
            <div className="space-y-3 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                {/* ⚡ NEW: Error State */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl border border-red-900/50 bg-red-900/20 flex gap-3 items-start"
                    >
                        <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-red-400 font-medium">{error}</p>
                            <p className="text-[10px] text-red-500/70 mt-1">
                                Endpoint: <code className="bg-red-950/50 px-1.5 py-0.5 rounded text-xs">/api/grading/my-requests</code>
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Loading State */}
                {isLoading && !error ? (
                    <div className="animate-pulse flex gap-4 p-4 border border-zinc-800/50 rounded-2xl">
                        <div className="w-12 h-12 bg-zinc-800 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                            <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                        </div>
                    </div>
                ) : tickets.length === 0 && !error ? (
                    <div className="text-center py-8 border border-dashed border-zinc-800 rounded-2xl">
                        <p className="text-sm text-zinc-500">Belum ada tiket verifikasi aktif.</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            onClick={() => handlePlayVideo(ticket.id, ticket.status)}
                            className={`p-4 rounded-2xl border transition-all ${ticket.status === 'MEDIA_READY'
                                ? 'bg-zinc-900/50 border-red-900/30 hover:border-red-500/50 cursor-pointer group'
                                : 'bg-zinc-900/20 border-zinc-800/50 opacity-70 cursor-not-allowed'
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-zinc-800 rounded-lg shrink-0 relative overflow-hidden flex items-center justify-center">
                                    {ticket.status === 'MEDIA_READY' ? (
                                        <span className="text-xl group-hover:scale-110 transition-transform">▶️</span>
                                    ) : (
                                        <span className="text-xl">⏳</span>
                                    )}
                                </div>
                                <div>
                                    <p className={`text-xs font-bold tracking-wider uppercase mb-1 ${ticket.status === 'MEDIA_READY' ? 'text-amber-400' : 'text-zinc-500'
                                        }`}>
                                        {ticket.status === 'MEDIA_READY' ? 'Video Ready' : 'Menunggu Seller'}
                                    </p>
                                    <p className={`text-sm font-medium transition-colors ${ticket.status === 'MEDIA_READY' ? 'text-zinc-200 group-hover:text-red-400' : 'text-zinc-400'
                                        }`}>
                                        {ticket.product?.name || 'Produk Analog'}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 mt-1">
                                        {ticket.status === 'MEDIA_READY'
                                            ? 'Video siap ditonton. Segera checkout sebelum tiket kedaluwarsa (3x24 Jam).'
                                            : 'Penjual sedang mempersiapkan rekaman fisik barang.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
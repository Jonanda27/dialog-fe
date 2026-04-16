'use client';

import { motion } from 'framer-motion';

export default function GradingHub() {
    const [tickets, setTickets] = useState<GradingRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await GradingService.getBuyerRequests();

                // ⚡ FIX TypeScript TS2339: Bypass static type checking dengan assertion 
                // untuk melakukan inspeksi struktur runtime secara aman.
                const safeResponse = response as any;
                let rawData: GradingRequest[] = [];

                if (Array.isArray(safeResponse)) {
                    rawData = safeResponse;
                } else if (safeResponse?.data && Array.isArray(safeResponse.data)) {
                    rawData = safeResponse.data;
                } else if (safeResponse?.data?.data && Array.isArray(safeResponse.data.data)) {
                    rawData = safeResponse.data.data;
                }

                // ⚡ SAFE FILTER: Mengakomodasi State Baru (Blueprint) & State Legacy
                const activeStates = ['requested', 'awaiting_seller_media', 'media_ready', 'fulfilled'];
                const activeTickets = rawData.filter((t: any) => {
                    const status = t.status?.toLowerCase() || '';
                    return activeStates.includes(status);
                });

                setTickets(activeTickets);
            } catch (err: any) {
                console.error("Failed to fetch grading requests:", err);
                setError(err.message || 'Gagal memuat data grading.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTickets();
    }, []);

    const handlePlayVideo = (ticketId: string, status: string) => {
        const s = status.toLowerCase();

        // Validasi state pemutaran untuk data baru maupun lama
        if (s !== 'media_ready' && s !== 'fulfilled') {
            toast.info('Penjual sedang menyiapkan rekaman fisik barang. Mohon tunggu.');
            return;
        }

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
                    <h2 className="text-lg font-serif text-white uppercase tracking-tighter flex items-center gap-2">
                        <FileSearch size={20} className="text-red-500" />
                        Grading Hub
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">Verifikasi kondisi fisik koleksi Anda</p>
                </div>
                {tickets.some(t => {
                    const s = t.status?.toLowerCase();
                    return s === 'media_ready' || s === 'fulfilled';
                }) && (
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
            </div>

            {/* Video Player Modal */}
            <AnimatePresence>
                {selectedVideoUrl && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 overflow-hidden rounded-2xl bg-black border border-zinc-800 relative shadow-2xl"
                    >
                        <button
                            onClick={() => setSelectedVideoUrl(null)}
                            className="absolute top-4 right-4 z-10 bg-zinc-900/80 text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-600 transition"
                        >
                            ✕
                        </button>
                        <video src={selectedVideoUrl} controls autoPlay controlsList="nodownload" className="w-full aspect-video object-contain" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List Data */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {error ? (
                    <div className="p-4 rounded-2xl border border-red-900/30 bg-red-900/10 flex gap-3 text-red-400 items-center">
                        <AlertCircle size={18} />
                        <p className="text-xs font-medium">{error}</p>
                    </div>
                ) : isLoading ? (
                    <div className="animate-pulse space-y-3">
                        {[1, 2].map(i => <div key={i} className="h-20 bg-zinc-900 rounded-2xl border border-zinc-800" />)}
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-zinc-800 rounded-2xl">
                        <p className="text-xs text-zinc-600 uppercase tracking-widest font-bold">Belum ada permintaan aktif</p>
                    </div>
                ) : (
                    tickets.map((ticket) => {
                        const s = ticket.status?.toLowerCase();
                        const isReady = s === 'media_ready' || s === 'fulfilled';

                        return (
                            <div
                                key={ticket.id}
                                onClick={() => handlePlayVideo(ticket.id, ticket.status)}
                                className={`p-4 rounded-2xl border transition-all ${isReady
                                    ? 'bg-zinc-900/50 border-zinc-700 hover:border-red-500/50 cursor-pointer group shadow-lg shadow-red-900/5'
                                    : 'bg-zinc-900/20 border-zinc-800/50 opacity-60 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden">
                                        {isReady ? (
                                            <PlayCircle className="text-red-500 group-hover:scale-110 transition-transform" size={24} />
                                        ) : (
                                            <Clock className="text-zinc-600" size={24} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="text-sm font-bold text-zinc-200 group-hover:text-red-400 transition-colors uppercase truncate">
                                                {ticket.product?.name || 'Produk Analog'}
                                            </p>
                                            <span className={`text-[9px] shrink-0 font-black px-2 py-0.5 rounded border ${isReady
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                {isReady ? 'VIDEO READY' : 'WAITING'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
                                            {/* ⚡ FIX Tailwind: Mengganti max-w-[120px] menjadi max-w-30 */}
                                            <p className="text-[10px] text-zinc-500 font-medium truncate max-w-30">
                                                {ticket.product?.metadata?.artist || 'Unknown Artist'}
                                            </p>
                                            <span className="text-[10px] text-zinc-700">•</span>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase">
                                                Grade: {ticket.product?.metadata?.media_grading || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}
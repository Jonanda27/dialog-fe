'use client';

import { useEffect, useState } from 'react';
import { Dispute, DisputeStatus } from '@/types/dispute';
import { 
    AlertTriangle, 
    Package, 
    Calendar, 
    User as UserIcon, 
    ExternalLink, 
    Eye, 
    MessageSquare,
    CheckCircle2,
    Clock,
    Loader2,
    PlayCircle,
    ArrowRight,
    RefreshCcw,
    CheckSquare // Icon tambahan untuk konfirmasi
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import Link from 'next/link';
import { DisputeService } from '@/services/api/dispute.service';
import { useAuthStore } from "@/store/authStore";
import { toast } from 'sonner';

export default function SellerDisputePage() {
    const { user } = useAuthStore();
    
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null); // State untuk loading per item
    const [filter, setFilter] = useState<DisputeStatus | 'all'>('all');

    const fetchDisputes = async () => {
        if (!user?.id) return;

        setIsLoading(true);
        try {
            const response = await DisputeService.getMyDisputes();
            setDisputes(response.data);
        } catch (error) {
            console.error("Gagal mengambil data sengketa:", error);
            toast.error("Gagal memuat data sengketa");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchDisputes();
        }
    }, [user?.id]);

    const filteredDisputes = disputes.filter(d => 
        filter === 'all' ? true : d.status === filter
    );

    const isVideoUrl = (url: string) => {
        if (!url) return false;
        return /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
    };

    /**
     * HANDLER: Memanggil Service acceptReturn
     * Digunakan saat status masih 'open'
     */
    const handleLanjutkanProses = async (disputeId: string) => {
        setProcessingId(disputeId);
        try {
            const response = await DisputeService.acceptReturn(disputeId);
            
            if (response.success) {
                toast.success("Permintaan retur disetujui. Menunggu pembeli mengirim barang.");
                await fetchDisputes(); // Refresh data dari server
            }
        } catch (error: any) {
            console.error("Gagal menyetujui retur:", error);
            toast.error(error.response?.data?.message || "Gagal memproses permintaan");
        } finally {
            setProcessingId(null);
        }
    };

    /**
     * ⚡ HANDLER BARU: Memanggil Service confirmReturnReceived
     * Digunakan saat status 'returning' dan resi sudah ada
     */
    const handleKonfirmasiPenerimaan = async (disputeId: string) => {
        const confirmed = window.confirm(
            "Apakah Anda yakin sudah menerima barang retur dengan baik? \n\nAksi ini akan memicu pengembalian dana (Refund) otomatis ke pembeli."
        );

        if (!confirmed) return;

        setProcessingId(disputeId);
        try {
            const response = await DisputeService.confirmReturnReceived(disputeId);
            
            if (response.success) {
                toast.success("Barang diterima. Dana telah dikembalikan ke pembeli dan pesanan dibatalkan.");
                await fetchDisputes(); // Refresh data
            }
        } catch (error: any) {
            console.error("Gagal konfirmasi penerimaan:", error);
            toast.error(error.response?.data?.message || "Gagal memproses konfirmasi refund");
        } finally {
            setProcessingId(null);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <Loader2 className="text-[#ef3333] animate-spin" size={40} />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#0a0a0b] pb-20 pt-10">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header Section */}
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <AlertTriangle className="text-[#ef3333]" size={32} />
                        Pusat Resolusi Sengketa
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">
                        Halo, <span className="text-white">{user.full_name || user.username}</span>. Kelola dan pantau detail komplain pembeli di sini.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-8 border-b border-zinc-800 pb-4 overflow-x-auto no-scrollbar">
                    {(['all', 'open', 'returning', 'resolved'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                                filter === s
                                    ? 'bg-[#ef3333] text-white shadow-[0_0_15px_rgba(239,51,51,0.3)]'
                                    : 'bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-800'
                            }`}
                        >
                            {s === 'all' ? 'Semua' : s === 'open' ? 'Berjalan' : s === 'returning' ? 'Proses Retur' : 'Selesai'}
                        </button>
                    ))}
                </div>

                {/* List Section */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-44 bg-zinc-900/50 rounded-[2rem] animate-pulse border border-zinc-800" />
                        ))}
                    </div>
                ) : filteredDisputes.length > 0 ? (
                    <div className="grid gap-6">
                        {filteredDisputes.map((item) => (
                            <div 
                                key={item.id} 
                                className="bg-[#111114] border border-zinc-800 rounded-[2.5rem] p-8 hover:border-zinc-700 transition-all group"
                            >
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${
                                            item.status === 'open' ? 'bg-orange-500/10 text-orange-500' : 
                                            item.status === 'returning' ? 'bg-blue-500/10 text-blue-500' :
                                            'bg-green-500/10 text-green-500'
                                        }`}>
                                            {item.status === 'open' ? <Clock size={24} /> : <CheckCircle2 size={24} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">ID Sengketa</span>
                                                <span className="text-xs font-mono text-zinc-300">#{item.id.substring(0, 8).toUpperCase()}</span>
                                            </div>
                                            <h3 className="text-lg font-black text-white uppercase tracking-tight mt-0.5">
                                                {item.status === 'open' ? 'Investigasi Berlangsung' : 
                                                 item.status === 'returning' ? 'Menunggu Pengembalian Barang' :
                                                 'Sengketa Selesai'}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                                        item.status === 'open' 
                                        ? 'border-orange-500/30 text-orange-500 bg-orange-500/5' 
                                        : item.status === 'returning'
                                        ? 'border-blue-500/30 text-blue-500 bg-blue-500/5'
                                        : 'border-green-500/30 text-green-500 bg-green-500/5'
                                    }`}>
                                        {item.status}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-zinc-400">
                                            <Package size={16} className="text-[#ef3333]" />
                                            <div className="text-sm">
                                                <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-tighter">Order ID</p>
                                                <Link href={`/penjual/orders/${item.order_id}`} className="hover:text-white transition-colors flex items-center gap-1">
                                                    #{item.order_id.substring(0, 8).toUpperCase()} <ExternalLink size={12} />
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-zinc-400">
                                            <UserIcon size={16} className="text-[#ef3333]" />
                                            <div className="text-sm">
                                                <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-tighter">Pembeli</p>
                                                <p className="text-white font-bold">{item.buyer?.full_name || 'Buyer'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 bg-zinc-900/50 rounded-3xl p-6 border border-zinc-800/50">
                                        <div className="flex items-start gap-3">
                                            <MessageSquare size={18} className="text-zinc-500 mt-1 shrink-0" />
                                            <div className="w-full">
                                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Alasan Komplain:</p>
                                                <p className="text-zinc-300 text-sm italic leading-relaxed">
                                                    "{item.reason}"
                                                </p>
                                                
                                                {item.media && item.media.length > 0 && (
                                                    <div className="mt-6 flex flex-wrap gap-3">
                                                        {item.media.map((m) => {
                                                            const isVideo = isVideoUrl(m.media_url);
                                                            return (
                                                                <div 
                                                                    key={m.id} 
                                                                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-700 bg-black group/img flex items-center justify-center shrink-0"
                                                                >
                                                                    {isVideo ? (
                                                                        <video 
                                                                            src={m.media_url} 
                                                                            className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                                                                            preload="metadata"
                                                                            onClick={() => window.open(m.media_url, '_blank')}
                                                                        />
                                                                    ) : (
                                                                        <img 
                                                                            src={m.media_url} 
                                                                            alt="Bukti Sengketa" 
                                                                            className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                                                                            onClick={() => window.open(m.media_url, '_blank')}
                                                                        />
                                                                    )}
                                                                    
                                                                    {isVideo && (
                                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                            <PlayCircle size={24} className="text-white/80 group-hover/img:scale-110 transition-transform" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                        <div className="w-20 h-20 rounded-xl border border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-600 shrink-0">
                                                            <Eye size={16} className="mb-1" />
                                                            <span className="text-[8px] font-bold uppercase tracking-widest">Detail</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-wrap justify-between items-center gap-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                            <Calendar size={14} />
                                            Diajukan pada: {isValid(new Date(item.createdAt)) ? format(new Date(item.createdAt), 'dd MMMM yyyy', { locale: localeId }) : '-'}
                                        </div>
                                        
                                        {item.status === 'resolved' && item.admin_decision_notes && (
                                            <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                                                Catatan Admin: <span className="normal-case font-medium">{item.admin_decision_notes}</span>
                                            </div>
                                        )}

                                        {/* Menampilkan Resi Retur jika sudah ada */}
                                        {item.return_tracking_number && (
                                            <div className="bg-blue-500/10 text-blue-500 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-blue-500/20 flex items-center gap-2">
                                                <RefreshCcw size={12} />
                                                Resi Retur: <span className="normal-case font-mono">{item.return_tracking_number}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* AREA TOMBOL AKSI */}
                                    <div className="flex gap-3">
                                        {/* TOMBOL 1: Setujui Retur (Hanya muncul jika status OPEN) */}
                                        {item.status === 'open' && (
                                            <button 
                                                onClick={() => handleLanjutkanProses(item.id)}
                                                disabled={processingId === item.id}
                                                className="bg-[#ef3333] hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/20 flex items-center gap-2 active:scale-95"
                                            >
                                                {processingId === item.id ? (
                                                    <>
                                                        Memproses... <RefreshCcw size={14} className="animate-spin" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Setujui Retur & Lanjutkan <ArrowRight size={14} />
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {/* TOMBOL 2: Konfirmasi Terima Barang (Muncul jika status RETURNING & Resi sudah ada) */}
                                        {item.status === 'returning' && item.return_tracking_number && (
                                            <button 
                                                onClick={() => handleKonfirmasiPenerimaan(item.id)}
                                                disabled={processingId === item.id}
                                                className="bg-green-600 hover:bg-green-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-green-900/20 flex items-center gap-2 active:scale-95"
                                            >
                                                {processingId === item.id ? (
                                                    <>
                                                        Sedang Refund... <RefreshCcw size={14} className="animate-spin" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Konfirmasi Barang Diterima & Refund <CheckSquare size={14} />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center bg-[#111114] border border-zinc-800 rounded-[3rem]">
                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} className="text-zinc-700" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Toko Aman Terkendali</h3>
                        <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto">
                            Tidak ada sengketa atau komplain aktif yang melibatkan toko Anda saat ini.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
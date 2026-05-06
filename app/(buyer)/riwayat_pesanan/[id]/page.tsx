// app/(buyer)/riwayat_pesanan/[id]/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderService } from '@/services/api/order.service';
import { Order } from '@/types/order';
import { getStatusColor, formatStatus } from '@/utils/order-helper';
import { 
    ArrowLeft, Package, MapPin, Truck, 
    CreditCard, ExternalLink, Info, Hash, 
    Calendar, Box, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';

// ⚡ IMPORT KOMPONEN INTEGRASI FASE 2
import DisputeSLATracker from '@/components/order/DisputeSLATracker';
import SubmitResiModal from '@/components/order/SubmitResiModal';

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ⚡ STATE UNTUK MODAL RESI
    const [showResiModal, setShowResiModal] = useState(false);

    // ⚡ EKSTRAKSI FUNGSI FETCH AGAR BISA DIPANGGIL ULANG SETELAH INPUT RESI
    const fetchDetail = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        try {
            const response = await OrderService.getById(id as string);
            setOrder(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#ef3333] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) return null;

    // ⚡ CEK STATUS SENGKETA
    const activeDispute = (order as any).dispute;
    const isReturning = order.status === 'disputed' && activeDispute?.status === 'returning';

    return (
        <main className="min-h-screen bg-[#0a0a0b] text-zinc-300 pb-20 selection:bg-[#ef3333] selection:text-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 md:pt-10">
                
                {/* Navigation */}
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-6 md:mb-10 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]"
                >
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    Kembali <span className="hidden sm:inline">ke Pesanan</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                    
                    {/* KIRI: INFO PRODUK & STATUS */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Header Detail Card */}
                        <section className="bg-[#111114] border border-zinc-800/50 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef3333]/5 blur-[60px] rounded-full -mr-16 -mt-16" />

                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                                        <Hash size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{order.id.substring(0, 12).toUpperCase()}</span>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none ">
                                        Detail <span className="text-[#ef3333]">Pesanan</span>
                                    </h2>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full border text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg self-start sm:self-auto ${getStatusColor(order.status)}`}>
                                    {formatStatus(order.status)}
                                </div>
                            </div>

                            {/* ⚡ DISPUTE SECTION */}
                            {isReturning && activeDispute && (
                                <div className="mb-8 space-y-4">
                                    <DisputeSLATracker dispute={activeDispute} />
                                    {!activeDispute.return_tracking_number && (
                                        <button
                                            onClick={() => setShowResiModal(true)}
                                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)] active:scale-[0.98]"
                                        >
                                            <Truck size={16} />
                                            Input Resi Pengembalian
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Item List */}
                            <div className="space-y-4">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:items-center p-4 md:p-5 bg-zinc-900/40 rounded-2xl md:rounded-3xl border border-zinc-800/50 hover:border-zinc-700 transition-colors group">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-800 rounded-xl md:rounded-2xl border border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <Box className="text-zinc-600" size={28} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-black text-sm md:text-base leading-tight truncate uppercase ">{item.product?.name}</p>
                                                <p className="text-zinc-500 text-[10px] md:text-xs mt-1 font-bold uppercase tracking-wide">
                                                    {item.qty} item <span className="mx-1 text-zinc-700">•</span> Rp {Number(item.price_at_purchase).toLocaleString('id-ID')}
                                                </p>
                                                {item.grading_at_purchase !== 'Raw' && (
                                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#ef3333]/10 border border-[#ef3333]/20 text-[#ef3333] text-[9px] font-black rounded-md uppercase">
                                                        Grading: {item.grading_at_purchase}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800/50">
                                            <p className="text-white font-black text-base tracking-tight ">
                                                Rp {(Number(item.price_at_purchase) * item.qty).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Pengiriman Info Card */}
                        <section className="bg-[#111114] border border-zinc-800/50 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8">
                            <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mb-6 md:mb-8 flex items-center gap-3">
                                <div className="p-2 bg-[#ef3333]/10 rounded-lg">
                                    <Truck size={18} className="text-[#ef3333]" />
                                </div>
                                Informasi Pengiriman
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="mt-1 p-2 bg-zinc-900 rounded-xl h-fit shrink-0">
                                        <MapPin size={16} className="text-zinc-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">Alamat Tujuan</p>
                                        <p className="text-zinc-200 text-xs md:text-sm leading-relaxed font-medium">{order.shipping_address}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-zinc-800/50">
                                    <div className="flex gap-4">
                                        <div className="mt-1 p-2 bg-zinc-900 rounded-xl h-fit shrink-0">
                                            <Package size={16} className="text-zinc-500" />
                                        </div>
                                        <div>
                                            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">Kurir & Layanan</p>
                                            <p className="text-white text-xs md:text-sm font-black uppercase tracking-tight">
                                                {order.courier_company} <span className="text-zinc-600 mx-1">—</span> {order.service_type}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="mt-1 p-2 bg-zinc-900 rounded-xl h-fit shrink-0">
                                            <Info size={16} className="text-zinc-500" />
                                        </div>
                                        <div>
                                            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">No. Resi Pesanan</p>
                                            <p className="text-white text-xs md:text-sm font-mono font-bold break-all">
                                                {order.tracking_number || <span className="text-zinc-600 font-normal">Belum tersedia</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Resi Retur Info */}
                                {activeDispute?.return_tracking_number && (
                                    <div className="pt-6 border-t border-zinc-800/50">
                                        <div className="flex gap-4">
                                            <div className="mt-1 p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl h-fit shrink-0">
                                                <Truck size={16} className="text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">No. Resi Pengembalian (Retur)</p>
                                                <p className="text-blue-400 text-xs md:text-sm font-mono font-bold break-all">
                                                    {activeDispute.return_tracking_number}
                                                    <span className="text-zinc-500 font-sans text-[10px] ml-2 ">({activeDispute.return_courier?.toUpperCase()})</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* KANAN: RINGKASAN BIAYA (Sticky di Desktop) */}
                    <div className="lg:col-span-4 space-y-6">
                        <section className="bg-[#111114] border border-zinc-800 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 lg:sticky lg:top-10 shadow-2xl shadow-black/50">
                            <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mb-6 md:mb-8 flex items-center gap-3">
                                <div className="p-2 bg-[#ef3333]/10 rounded-lg">
                                    <CreditCard size={18} className="text-[#ef3333]" />
                                </div>
                                Ringkasan Biaya
                            </h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-xs md:text-sm uppercase font-bold tracking-tight">
                                    <span className="text-zinc-500">Subtotal</span>
                                    <span className="text-white font-mono">Rp {Number(order.subtotal).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-xs md:text-sm uppercase font-bold tracking-tight">
                                    <span className="text-zinc-500">Ongkos Kirim</span>
                                    <span className="text-white font-mono">Rp {Number(order.shipping_fee).toLocaleString('id-ID')}</span>
                                </div>
                                {Number(order.grading_fee) > 0 && (
                                    <div className="flex justify-between text-xs md:text-sm uppercase font-bold tracking-tight">
                                        <span className="text-zinc-500">Biaya Grading</span>
                                        <span className="text-white font-mono">Rp {Number(order.grading_fee).toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                <div className="pt-6 mt-6 border-t border-zinc-800 flex flex-col items-end gap-1">
                                    <span className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em]">Total Tagihan</span>
                                    <span className="text-2xl md:text-3xl font-black text-[#ef3333] tracking-tighter ">
                                        Rp {Number(order.grand_total).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            {order.status === 'pending_payment' && (
                                <Link
                                    href={`/pembayaran/${order.billing_id}`}
                                    className="group relative block w-full bg-[#ef3333] text-white text-center py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(239,51,51,0.2)]"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Bayar Sekarang <ExternalLink size={14} />
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                </Link>
                            )}

                            <div className="mt-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50 text-center">
                                <p className="text-[8px] md:text-[9px] text-zinc-500 leading-relaxed uppercase font-black tracking-widest">
                                    🛒 Pesanan ini dilindungi oleh Analog.id Secure System.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* ⚡ DELEGASI MODAL INPUT RESI */}
            {activeDispute && (
                <SubmitResiModal
                    isOpen={showResiModal}
                    onClose={() => setShowResiModal(false)}
                    disputeId={activeDispute.id}
                    onSuccess={() => fetchDetail(false)}
                />
            )}
        </main>
    );
}
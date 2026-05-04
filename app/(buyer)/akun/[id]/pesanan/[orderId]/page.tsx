'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderService } from '@/services/api/order.service';
import { Order } from '@/types/order';
import { 
    ArrowLeft, Package, MapPin, Truck, CreditCard, 
    ExternalLink, Info, Hash, Box, Loader2, 
    CheckCircle2, Clock, AlertCircle, XCircle, MessageCircle 
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Helper untuk format URL gambar dari backend
const formatImageUrl = (path: string | undefined) => {
    if (!path) return "https://placehold.co/400x400?text=No+Image";
    if (path.startsWith("http")) return path;
    return `http://localhost:5000/${path.replace(/^\/+/, "")}`;
};

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const orderId = params.orderId as string;

    // 1. FETCH DETAIL PESANAN
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setIsFetching(true);
                const response = await OrderService.getById(orderId);
                if (response.success && response.data) {
                    setOrder(response.data);
                }
            } catch (error: any) {
                toast.error("Gagal memuat detail transaksi");
                console.error(error);
            } finally {
                setIsFetching(false);
            }
        };

        if (orderId) fetchDetail();
    }, [orderId]);

    // 2. LOGIKA PESANAN SELESAI (ESCROW RELEASE)
    const handleCompleteOrder = async () => {
        if (!confirm("Konfirmasi bahwa barang telah diterima dengan baik? Dana akan diteruskan ke penjual.")) return;

        try {
            setIsActionLoading(true);
            const response = await OrderService.completeOrder(orderId);
            if (response.success) {
                toast.success("Pesanan diselesaikan. Terima kasih telah berbelanja!");
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Terjadi kesalahan sistem");
        } finally {
            setIsActionLoading(false);
        }
    };

    // Helper untuk Warna Status
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending_payment': return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
            case 'paid': return "text-blue-500 bg-blue-500/10 border-blue-500/20";
            case 'processing': return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            case 'shipped': return "text-purple-500 bg-purple-500/10 border-purple-500/20";
            case 'delivered': return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
            case 'completed': return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
            case 'cancelled': return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
            case 'disputed': return "text-[#ef3333] bg-[#ef3333]/10 border-[#ef3333]/20";
            default: return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace('_', ' ').toUpperCase();
    };

    if (isFetching) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-[#ef3333] animate-spin" />
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Menyinkronkan Data...</p>
            </div>
        );
    }

    if (!order) return null;

    return (
        <main className="text-zinc-300 pb-10 selection:bg-[#ef3333] selection:text-white">
            {/* Navigation */}
            <button 
                onClick={() => router.back()} 
                className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-8 text-xs font-bold uppercase tracking-[0.2em]"
            >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> 
                Kembali ke Pesanan
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Kiri: Info Produk & Status */}
                <div className="lg:col-span-8 space-y-6">
                    <section className="bg-[#111114] border border-zinc-800/50 rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef3333]/5 blur-[60px] rounded-full -mr-16 -mt-16" />
                        
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10 relative">
                            <div>
                                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                                    <Hash size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{order.id.split('-')[0].toUpperCase()}</span>
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                                    Detail <span className="text-[#ef3333]">Pesanan</span>
                                </h2>
                            </div>
                            <div className={`px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-lg ${getStatusStyle(order.status)}`}>
                                {getStatusLabel(order.status)}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex gap-5 items-center p-5 bg-zinc-900/40 rounded-3xl border border-zinc-800/50 hover:border-zinc-700 transition-colors group">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-zinc-700 shrink-0 group-hover:scale-105 transition-transform">
                                        <img 
                                            src={formatImageUrl(item.product?.media?.[0]?.media_url)} 
                                            alt={item.product?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-bold text-base leading-tight">{item.product?.name}</p>
                                        <p className="text-zinc-500 text-xs mt-1.5 font-medium">
                                            {item.qty} item <span className="mx-1.5 text-zinc-700">•</span> Rp {Number(item.price_at_purchase).toLocaleString('id-ID')}
                                        </p>
                                        {Number(item.grading_fee) > 0 && (
                                            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ef3333]/10 border border-[#ef3333]/20 text-[#ef3333] text-[10px] font-black rounded-lg uppercase tracking-tighter">
                                                <span className="w-1 h-1 bg-[#ef3333] rounded-full animate-pulse" />
                                                Layanan Grading Aktif
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-black text-base tracking-tight">
                                            Rp {(Number(item.price_at_purchase) * item.qty).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-[#111114] border border-zinc-800/50 rounded-[2.5rem] p-8">
                        <h3 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8 flex items-center gap-3">
                            <div className="p-2 bg-[#ef3333]/10 rounded-lg">
                                <Truck size={18} className="text-[#ef3333]" />
                            </div>
                            Logistik & Pengiriman
                        </h3>
                        <div className="grid gap-8">
                            <div className="flex gap-4">
                                <div className="mt-1 p-2 bg-zinc-900 rounded-xl h-fit">
                                    <MapPin size={16} className="text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Alamat Penerima</p>
                                    <p className="text-zinc-200 text-sm leading-relaxed font-medium">{order.shipping_address}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-zinc-800/50">
                                <div className="flex gap-4">
                                    <div className="mt-1 p-2 bg-zinc-900 rounded-xl h-fit">
                                        <Package size={16} className="text-zinc-500" />
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Ekspedisi</p>
                                        <p className="text-white text-sm font-bold uppercase tracking-tight">
                                            {order.courier_company || 'Standard'} <span className="text-zinc-600 mx-1">—</span> {order.service_type || 'Regular'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 p-2 bg-zinc-900 rounded-xl h-fit">
                                        <Info size={16} className="text-zinc-500" />
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Nomor Tracking</p>
                                        <p className="text-white text-sm font-mono font-bold">
                                            {order.tracking_number || <span className="text-zinc-600 font-normal">Menunggu Input Penjual</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Kanan: Ringkasan Biaya & Aksi */}
                <div className="lg:col-span-4 space-y-6">
                    <section className="bg-[#111114] border border-zinc-800 rounded-[2.5rem] p-8 sticky top-8 shadow-2xl shadow-black/50">
                        <h3 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8 flex items-center gap-3">
                            <div className="p-2 bg-[#ef3333]/10 rounded-lg">
                                <CreditCard size={18} className="text-[#ef3333]" />
                            </div>
                            Ringkasan Transaksi
                        </h3>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500 font-medium">Subtotal</span>
                                <span className="text-white font-bold font-mono">Rp {Number(order.subtotal).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500 font-medium">Ongkir</span>
                                <span className="text-white font-bold font-mono">Rp {Number(order.shipping_fee).toLocaleString('id-ID')}</span>
                            </div>
                            {Number(order.grading_fee) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500 font-medium">Fee Verifikasi</span>
                                    <span className="text-white font-bold font-mono">Rp {Number(order.grading_fee).toLocaleString('id-ID')}</span>
                                </div>
                            )}
                            <div className="pt-6 mt-6 border-t border-zinc-800 flex flex-col items-end gap-1">
                                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Grand Total</span>
                                <span className="text-3xl font-black text-[#ef3333] tracking-tighter">
                                    Rp {Number(order.grand_total).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        {/* Button Group */}
                        <div className="space-y-3">
                            {/* Bayar Jika Status Pending */}
                            {order.status === 'pending_payment' && (
                                <Link 
                                    href={`/pembayaran/${order.billing_id}`}
                                    className="group relative block w-full bg-[#ef3333] text-white text-center py-5 rounded-2xl font-black uppercase tracking-widest text-xs overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(239,51,51,0.2)]"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Selesaikan Pembayaran <ExternalLink size={14} />
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                </Link>
                            )}

                            {/* Konfirmasi Terima Jika Status Shipped/Delivered */}
                            {(order.status === 'shipped' || order.status === 'delivered') && (
                                <button 
                                    onClick={handleCompleteOrder}
                                    disabled={isActionLoading}
                                    className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50"
                                >
                                    {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    Pesanan Diterima
                                </button>
                            )}

                            <button className="w-full bg-zinc-800 text-zinc-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-zinc-700 hover:text-white transition-all">
                                <MessageCircle size={14} /> Hubungi Penjual
                            </button>
                        </div>
                        
                        <div className="mt-8 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                            <p className="text-[9px] text-zinc-500 leading-relaxed text-center uppercase font-bold tracking-wider">
                                Dana Anda tersimpan aman di sistem Escrow AnalogID hingga Anda mengonfirmasi pesanan diterima.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
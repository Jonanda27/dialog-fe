// app/(buyer)/dashboard/orders/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderService } from '@/services/api/order.service';
import { Order } from '@/types/order';
import { getStatusColor, formatStatus } from '@/utils/order-helper';
import { ArrowLeft, Package, MapPin, Truck, CreditCard, ExternalLink, Info, Hash, Calendar, Box } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await OrderService.getById(id as string);
                setOrder(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#ef3333] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) return null;

    return (
        <main className="min-h-screen bg-[#0a0a0b] text-zinc-300 pb-20 selection:bg-[#ef3333] selection:text-white">
            <div className="max-w-5xl mx-auto px-4 pt-8">
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
                        <section className="bg-[#111114] border border-zinc-800/50 rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
                            {/* Decorative Background Accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ef3333]/5 blur-[60px] rounded-full -mr-16 -mt-16" />
                            
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10 relative">
                                <div>
                                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                                        <Hash size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{order.id.toUpperCase()}</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                                        Detail <span className="text-[#ef3333]">Pesanan</span>
                                    </h2>
                                </div>
                                <div className={`px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-lg ${getStatusColor(order.status)}`}>
                                    {formatStatus(order.status)}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex gap-5 items-center p-5 bg-zinc-900/40 rounded-3xl border border-zinc-800/50 hover:border-zinc-700 transition-colors group">
                                        <div className="w-20 h-20 bg-zinc-800 rounded-2xl border border-zinc-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <Box className="text-zinc-600" size={32} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-bold text-base leading-tight">{item.product?.name}</p>
                                            <p className="text-zinc-500 text-xs mt-1.5 font-medium">
                                                {item.qty} item <span className="mx-1.5 text-zinc-700">•</span> Rp {Number(item.price_at_purchase).toLocaleString('id-ID')}
                                            </p>
                                            {item.grading_at_purchase !== 'Raw' && (
                                                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ef3333]/10 border border-[#ef3333]/20 text-[#ef3333] text-[10px] font-black rounded-lg uppercase tracking-tighter">
                                                    <span className="w-1 h-1 bg-[#ef3333] rounded-full animate-pulse" />
                                                    Grading: {item.grading_at_purchase}
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

                        <section className="bg-[#111114] border border-zinc-800/50 rounded-[2rem] p-8">
                            <h3 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8 flex items-center gap-3">
                                <div className="p-2 bg-[#ef3333]/10 rounded-lg">
                                    <Truck size={18} className="text-[#ef3333]" />
                                </div>
                                Informasi Pengiriman
                            </h3>
                            <div className="grid gap-8">
                                <div className="flex gap-4">
                                    <div className="mt-1 p-2 bg-zinc-900 rounded-xl h-fit">
                                        <MapPin size={16} className="text-zinc-500" />
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Alamat Tujuan</p>
                                        <p className="text-zinc-200 text-sm leading-relaxed font-medium">{order.shipping_address}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-zinc-800/50">
                                    <div className="flex gap-4">
                                        <div className="mt-1 p-2 bg-zinc-900 rounded-xl h-fit">
                                            <Package size={16} className="text-zinc-500" />
                                        </div>
                                        <div>
                                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Kurir & Layanan</p>
                                            <p className="text-white text-sm font-bold uppercase tracking-tight">
                                                {order.courier_company} <span className="text-zinc-600 mx-1">—</span> {order.service_type}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="mt-1 p-2 bg-zinc-900 rounded-xl h-fit">
                                            <Info size={16} className="text-zinc-500" />
                                        </div>
                                        <div>
                                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">No. Resi</p>
                                            <p className="text-white text-sm font-mono font-bold">
                                                {order.tracking_number || <span className="text-zinc-600 font-normal">Belum tersedia</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Kanan: Ringkasan Biaya */}
                    <div className="lg:col-span-4 space-y-6">
                        <section className="bg-[#111114] border border-zinc-800 rounded-[2.5rem] p-8 sticky top-8 shadow-2xl shadow-black/50">
                            <h3 className="text-white font-black uppercase tracking-[0.2em] text-xs mb-8 flex items-center gap-3">
                                <div className="p-2 bg-[#ef3333]/10 rounded-lg">
                                    <CreditCard size={18} className="text-[#ef3333]" />
                                </div>
                                Ringkasan Biaya
                            </h3>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500 font-medium">Subtotal Produk</span>
                                    <span className="text-white font-bold font-mono">Rp {Number(order.subtotal).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500 font-medium">Ongkos Kirim</span>
                                    <span className="text-white font-bold font-mono">Rp {Number(order.shipping_fee).toLocaleString('id-ID')}</span>
                                </div>
                                {Number(order.grading_fee) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500 font-medium">Biaya Grading</span>
                                        <span className="text-white font-bold font-mono">Rp {Number(order.grading_fee).toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                <div className="pt-6 mt-6 border-t border-zinc-800 flex flex-col items-end gap-1">
                                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Total Pembayaran</span>
                                    <span className="text-3xl font-black text-[#ef3333] tracking-tighter">
                                        Rp {Number(order.grand_total).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            {/* ⚡ PERBAIKAN LOGIKA REDIRECT: Menggunakan billing_id untuk redirect ke halaman pembayaran yang sudah ada */}
                            {order.status === 'pending_payment' && (
                                <Link 
                                    href={`/pembayaran/${order.billing_id}`}
                                    className="group relative block w-full bg-[#ef3333] text-white text-center py-5 rounded-2xl font-black uppercase tracking-widest text-xs overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(239,51,51,0.2)]"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Bayar Sekarang <ExternalLink size={14} />
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                </Link>
                            )}
                            
                            <div className="mt-6 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                                <p className="text-[9px] text-zinc-500 leading-relaxed text-center uppercase font-bold tracking-wider">
                                    Pesanan ini dilindungi oleh sistem keamanan kami. Simpan bukti pembayaran untuk keperluan klaim.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
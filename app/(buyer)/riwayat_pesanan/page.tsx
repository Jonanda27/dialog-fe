// app/(buyer)/dashboard/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { OrderService } from '@/services/api/order.service';
import { Order, OrderStatus } from '@/types/order';
import { getStatusColor, formatStatus } from '@/utils/order-helper';
import { Package, ChevronRight, Store, CheckCircle2, Calendar } from 'lucide-react';
import { format, isValid } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

const STATUS_FILTERS: (OrderStatus | 'all')[] = [
    'all', 'pending_payment', 'paid', 'processing', 'shipped', 'completed', 'cancelled'
];

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
    const [isCompleting, setIsCompleting] = useState<string | null>(null);

    const fetchOrders = async (status?: string) => {
        setIsLoading(true);
        try {
            const filterStatus = status === 'all' ? undefined : status;
            const response = await OrderService.getBuyerOrders(filterStatus);
            setOrders(response.data);
        } catch (error) {
            console.error("Gagal mengambil pesanan:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi untuk menyelesaikan pesanan (Konfirmasi Terima Barang)
    const handleCompleteOrder = async (e: React.MouseEvent, orderId: string) => {
        e.preventDefault(); // Mencegah Link terbuka saat tombol diklik
        e.stopPropagation();

        if (!confirm('Apakah Anda yakin sudah menerima barang dengan baik?')) return;

        setIsCompleting(orderId);
        try {
            await OrderService.completeOrder(orderId);
            toast.success('Pesanan berhasil diselesaikan. Terima kasih!');
            // Refresh data setelah berhasil
            fetchOrders(activeFilter);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menyelesaikan pesanan.');
        } finally {
            setIsCompleting(null);
        }
    };

    useEffect(() => {
        fetchOrders(activeFilter);
    }, [activeFilter]);

    return (
        <main className="min-h-screen bg-[#0a0a0b] pb-20">
            <div className="w-full">
                {/* Header */}
                <div className="mb-10 px-6 text-center">

                </div>

                {/* Status Filter Tabs - ⚡ POSISI TENGAH (justify-center) */}
                <div className="flex justify-center overflow-x-auto gap-2 pb-4 mb-8 no-scrollbar border-b border-zinc-800 px-6">
                    {STATUS_FILTERS.map((status) => (
                        <button
                            key={status}
                            onClick={() => setActiveFilter(status)}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                                activeFilter === status
                                    ? 'bg-[#ef3333] border-[#ef3333] text-white shadow-[0_0_15px_rgba(239,51,51,0.3)]'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                        >
                            {status === 'all' ? 'Semua' : formatStatus(status)}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div className="px-0 sm:px-6">
                    {isLoading ? (
                        <div className="space-y-4 px-6 max-w-5xl mx-auto">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-40 bg-zinc-900/50 rounded-3xl animate-pulse border border-zinc-800" />
                            ))}
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="space-y-4 max-w-5xl mx-auto">
                            {orders.map((order) => {
                                const rawDate = order.created_at || (order as any).createdAt;
                                const orderDate = rawDate ? new Date(rawDate) : null;
                                const displayDate = (orderDate && isValid(orderDate)) 
                                    ? format(orderDate, 'dd MMM yyyy, HH:mm') 
                                    : 'Tanggal tidak tersedia';

                                return (
                                    <div key={order.id} className="relative group">
                                        <Link 
                                            href={`/riwayat_pesanan/${order.id}`} 
                                            className="block bg-[#111114] border-y sm:border border-zinc-800 sm:rounded-[2rem] p-6 hover:border-[#ef3333]/50 transition-all shadow-xl"
                                        >
                                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 group-hover:bg-[#ef3333]/10 transition-colors">
                                                        <Store size={18} className="text-[#ef3333]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Toko</p>
                                                        <p className="text-sm font-black text-white uppercase">{order.store?.name || 'Toko Kolektor'}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                                                    {formatStatus(order.status)}
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shrink-0">
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                                            <Package size={24} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm line-clamp-1 italic uppercase tracking-tighter">
                                                            Order #{order.id.substring(0, 8).toUpperCase()}
                                                        </p>
                                                        {/* ⚡ MENAMPILKAN CREATED AT PADA CARD */}
                                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 mt-1">
                                                            <Calendar size={12} className="text-[#ef3333]" />
                                                            {displayDate}
                                                        </p>
                                                        <p className="text-zinc-400 text-xs mt-1 font-medium">
                                                            {order.items?.length || 0} Produk dipesan
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-zinc-800 pt-4 md:pt-0">
                                                    <div className="text-left md:text-right">
                                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Belanja</p>
                                                        <p className="text-lg font-black text-white ">
                                                            Rp {Number(order.grand_total).toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                    
                                                    {/* ⚡ TOMBOL TERIMA BARANG (Hanya muncul saat Shipped) */}
                                                    {order.status === 'shipped' && (
                                                        <button
                                                            onClick={(e) => handleCompleteOrder(e, order.id)}
                                                            disabled={isCompleting === order.id}
                                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_5px_15px_rgba(22,163,74,0.3)] disabled:opacity-50"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                            {isCompleting === order.id ? 'Memproses...' : 'Terima Barang'}
                                                        </button>
                                                    )}

                                                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:translate-x-1 transition-transform">
                                                        <ChevronRight size={20} className="text-zinc-500" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 mx-6 text-center bg-[#111114] border border-zinc-800 rounded-[3rem] max-w-5xl md:mx-auto">
                            <Package size={48} className="text-zinc-800 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Belum Ada Pesanan</h3>
                            <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto">
                                Sepertinya Anda belum melakukan transaksi apa pun.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
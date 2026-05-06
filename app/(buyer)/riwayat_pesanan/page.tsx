// app/(buyer)/riwayat_pesanan/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrderService } from '@/services/api/order.service';
import { Order, OrderStatus } from '@/types/order';
import { getStatusColor, formatStatus } from '@/utils/order-helper';
import {
    Package, ChevronRight, Store, CheckCircle2, Calendar,
    AlertTriangle, Truck, Loader2
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from 'sonner';

// Import Store & Komponen
import { useUserBankStore } from '@/store/bankStore'; 
import DisputeFormModal from '@/components/order/DisputeFormModal';
import SubmitResiModal from '@/components/order/SubmitResiModal';

const STATUS_FILTERS: (OrderStatus | 'all')[] = [
    'all', 'pending_payment', 'paid', 'processing', 'shipped', 'completed', 'cancelled'
];

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');

    // State untuk Aksi Menyelesaikan Pesanan
    const [isCompleting, setIsCompleting] = useState<string | null>(null);

    // State Pemicu Modal
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const [showResiModal, setShowResiModal] = useState(false);
    const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

    // Integrasi User Bank Store
    const { fetchBanks } = useUserBankStore();
    const router = useRouter();

    const fetchOrders = async (status?: string) => {
        setIsLoading(true);
        try {
            const filterStatus = status === 'all' ? undefined : status;
            const response = await OrderService.getBuyerOrders(filterStatus);
            setOrders(response.data);
        } catch (error) {
            console.error("Gagal mengambil pesanan:", error);
            toast.error("Gagal mengambil daftar pesanan");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(activeFilter);
    }, [activeFilter]);

    const handleCompleteOrder = async (e: React.MouseEvent, orderId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Apakah Anda yakin sudah menerima barang dengan baik?')) return;

        setIsCompleting(orderId);
        try {
            await OrderService.completeOrder(orderId);
            toast.success('Pesanan berhasil diselesaikan. Terima kasih!');
            fetchOrders(activeFilter); 
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menyelesaikan pesanan.');
        } finally {
            setIsCompleting(null);
        }
    };

    const openDisputeModal = async (e: React.MouseEvent, orderId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            await fetchBanks();
        } catch (err) {
            console.error("Gagal mengambil data bank", err);
        }

        setSelectedOrderId(orderId);
        setShowDisputeModal(true);
    };

    const openResiModal = (e: React.MouseEvent, disputeId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedDisputeId(disputeId);
        setShowResiModal(true);
    };

    const handleDisputeSuccess = (orderId: string, reason: string) => {
        const targetOrder = orders.find(o => o.id === orderId);
        const storeId = targetOrder?.store_id || targetOrder?.store?.id;

        const autoMessage = encodeURIComponent(
            `[SISTEM DISPUTE]\nSaya mengajukan komplain untuk pesanan #${orderId.substring(0, 8)}.\n\nAlasan: ${reason}\n\nMohon segera ditinjau bukti foto yang telah saya unggah di menu Pesanan.`
        );

        fetchOrders(activeFilter);
        
        if (storeId) {
            router.push(`/chat?storeId=${storeId}&prefillMsg=${autoMessage}`);
        } else {
            router.push('/chat');
        }
    };

    return (
        <main className="min-h-screen bg-[#0a0a0b] pb-20 pt-4">
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
                
                {/* HEADER SECTION */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Riwayat Pesanan</h1>
                    <p className="text-zinc-500 text-xs md:text-sm uppercase tracking-widest font-bold mt-1">Pantau status koleksi analog Anda</p>
                </div>

                {/* FILTER STATUS - Responsif dengan scroll horizontal di mobile */}
                <div className="flex overflow-x-auto gap-2 pb-4 mb-8 no-scrollbar border-b border-zinc-900 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {STATUS_FILTERS.map((status) => (
                        <button
                            key={status}
                            onClick={() => setActiveFilter(status)}
                            className={`px-5 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${activeFilter === status
                                ? 'bg-[#ef3333] border-[#ef3333] text-white shadow-[0_0_15px_rgba(239,51,51,0.3)]'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                }`}
                        >
                            {status === 'all' ? 'Semua' : formatStatus(status)}
                        </button>
                    ))}
                </div>

                {/* LIST PESANAN */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-44 bg-zinc-900/50 rounded-2xl md:rounded-[2.5rem] animate-pulse border border-zinc-800" />
                            ))}
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const rawDate = order.created_at || (order as any).createdAt;
                                const orderDate = rawDate ? new Date(rawDate) : null;
                                const displayDate = (orderDate && isValid(orderDate))
                                    ? format(orderDate, 'dd MMM yyyy, HH:mm', { locale: localeId })
                                    : 'Tanggal tidak tersedia';

                                const activeDispute = (order as any).dispute;
                                const isReturning = order.status === 'disputed' && activeDispute?.status === 'returning';

                                return (
                                    <div key={order.id} className="relative group">
                                        <Link
                                            href={`/riwayat_pesanan/${order.id}`}
                                            className="block bg-[#111114] border border-zinc-900 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-7 hover:border-[#ef3333]/50 transition-all shadow-xl group-hover:bg-[#141417]"
                                        >
                                            {/* Top Row: Store & Status */}
                                            <div className="flex justify-between items-start gap-4 mb-5 pb-5 border-b border-zinc-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 shrink-0">
                                                        <Store size={18} className="text-[#ef3333]" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Toko</p>
                                                        <p className="text-sm font-black text-white uppercase truncate">{order.store?.name || 'Toko Kolektor'}</p>
                                                    </div>
                                                </div>
                                                <div className={`shrink-0 px-3 py-1.5 rounded-lg border text-[9px] md:text-[10px] font-black uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                                                    {formatStatus(order.status)}
                                                </div>
                                            </div>

                                            {/* Mid Row: Info Produk */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-14 h-14 md:w-16 md:h-16 bg-zinc-900 rounded-xl md:rounded-2xl border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center text-zinc-700">
                                                        <Package size={24} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-white font-black text-sm uppercase tracking-tighter truncate">
                                                            Order #{order.id.substring(0, 8).toUpperCase()}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5">
                                                                <Calendar size={12} className="text-[#ef3333]" />
                                                                {displayDate}
                                                            </p>
                                                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wide">
                                                                • {order.items?.length || 0} Produk
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bottom Row: Total & Buttons */}
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end gap-4 md:gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-900">
                                                    <div className="md:text-right">
                                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Total Transaksi</p>
                                                        <p className="text-base md:text-lg font-black text-white italic">
                                                            Rp {Number(order.grand_total).toLocaleString('id-ID')}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center w-full sm:w-auto gap-2">
                                                        {/* Actions Button */}
                                                        <div className="flex gap-2 flex-1 sm:flex-none">
                                                            {(order.status === 'shipped' || order.status === 'delivered') && (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => openDisputeModal(e, order.id)}
                                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-zinc-800"
                                                                    >
                                                                        <AlertTriangle size={14} /> Komplain
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => handleCompleteOrder(e, order.id)}
                                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50"
                                                                        disabled={isCompleting === order.id}
                                                                    >
                                                                        {isCompleting === order.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                                                        {isCompleting === order.id ? '...' : 'Terima'}
                                                                    </button>
                                                                </>
                                                            )}

                                                            {isReturning && (
                                                                <button
                                                                    onClick={(e) => openResiModal(e, activeDispute.id)}
                                                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                                                                >
                                                                    <Truck size={14} /> Input Resi Retur
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="hidden md:flex w-10 h-10 rounded-full bg-zinc-900 items-center justify-center border border-zinc-800 group-hover:bg-[#ef3333] group-hover:text-white transition-all">
                                                            <ChevronRight size={18} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-[#111114] border border-zinc-900 rounded-[2rem] md:rounded-[3rem]">
                            <Package size={48} className="text-zinc-800 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Belum Ada Pesanan</h3>
                            <p className="text-zinc-500 text-xs mt-2 max-w-[250px] mx-auto leading-relaxed">
                                Sepertinya Anda belum melakukan transaksi apa pun di Analog.id.
                            </p>
                            <Link 
                                href="/search" 
                                className="inline-block mt-6 px-8 py-3 bg-[#ef3333] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-red-700 transition-all"
                            >
                                Mulai Belanja
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DISPUTE */}
            {selectedOrderId && (
                <DisputeFormModal
                    isOpen={showDisputeModal}
                    onClose={() => {
                        setShowDisputeModal(false);
                        setSelectedOrderId(null);
                    }}
                    orderId={selectedOrderId}
                    onSuccess={(reason) => handleDisputeSuccess(selectedOrderId, reason)}
                />
            )}

            {/* MODAL RESI RETUR */}
            {selectedDisputeId && (
                <SubmitResiModal
                    isOpen={showResiModal}
                    onClose={() => {
                        setShowResiModal(false);
                        setSelectedDisputeId(null);
                    }}
                    disputeId={selectedDisputeId}
                    onSuccess={() => fetchOrders(activeFilter)}
                />
            )}

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </main>
    );
}
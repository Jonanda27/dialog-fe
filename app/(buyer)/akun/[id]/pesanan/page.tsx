'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderService } from '@/services/api/order.service';
import { Order, OrderStatus } from '@/types/order';
import { getStatusColor, formatStatus } from '@/utils/order-helper';
import { 
    Package, ChevronRight, Store, CheckCircle2, Calendar, 
    AlertTriangle, X, Upload, FileText, Truck, Loader2,
    Landmark, Box
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import { DisputeService } from '@/services/api/dispute.service';
import { useUserBankStore } from '@/store/bankStore'; 
import { INDONESIAN_BANKS } from '@/utils/bankName';

const STATUS_FILTERS: (OrderStatus | 'all')[] = [
    'all', 'pending_payment', 'paid', 'processing', 'shipped', 'completed', 'cancelled'
];

export default function MyOrdersPage() {
    const params = useParams();
    const userId = params.id as string;
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
    
    // State untuk Aksi
    const [isCompleting, setIsCompleting] = useState<string | null>(null);
    const [isDisputing, setIsDisputing] = useState(false);
    const [isSubmittingResi, setIsSubmittingResi] = useState(false);
    
    // State untuk Modal Dispute
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [disputeReason, setDisputeReason] = useState('');
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

    // State untuk Form Bank Baru
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');

    // State untuk Modal Resi Retur
    const [showResiModal, setShowResiModal] = useState(false);
    const [returnResi, setReturnResi] = useState('');
    const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

    const { banks, fetchBanks, addBank } = useUserBankStore();

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

    const handleCompleteOrder = async (e: React.MouseEvent, orderId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Apakah Anda yakin sudah menerima barang dengan baik? Dana akan diteruskan ke penjual.')) return;
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
        setSelectedOrderId(orderId);
        await fetchBanks();
        setShowDisputeModal(true);
    };

    const openResiModal = (e: React.MouseEvent, disputeId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedDisputeId(disputeId);
        setShowResiModal(true);
    };

    const removeFile = (index: number) => {
        setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitDispute = async () => {
        if (!selectedOrderId || !disputeReason) {
            toast.error('Mohon isi alasan dispute.');
            return;
        }
        if (evidenceFiles.length === 0) {
            toast.error('Mohon unggah setidaknya satu bukti foto/video.');
            return;
        }
        setIsDisputing(true);
        try {
            if (banks.length === 0) {
                if (!bankName || !accountNumber || !accountName) {
                    toast.error('Mohon lengkapi data rekening bank untuk pengembalian dana.');
                    setIsDisputing(false);
                    return;
                }
                await addBank({
                    bank_name: bankName,
                    bank_account_number: accountNumber,
                    bank_account_name: accountName
                });
            }
            await DisputeService.openDispute({
                order_id: selectedOrderId,
                reason: disputeReason,
                evidences: evidenceFiles
            });
            toast.success('Dispute diajukan. Dana Escrow telah dibekukan sementara.');
            setShowDisputeModal(false);
            setDisputeReason('');
            setEvidenceFiles([]);
            fetchOrders(activeFilter);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengajukan dispute.');
        } finally {
            setIsDisputing(false);
        }
    };

    const handleSubmitReturnResi = async () => {
        if (!selectedDisputeId || !returnResi) {
            toast.error('Mohon masukkan nomor resi.');
            return;
        }
        setIsSubmittingResi(true);
        try {
            await DisputeService.submitReturnResi(selectedDisputeId, {
                tracking_number: returnResi
            });
            toast.success('Resi retur berhasil dikirim. Menunggu verifikasi penjual.');
            setShowResiModal(false);
            setReturnResi('');
            fetchOrders(activeFilter);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengirim resi retur.');
        } finally {
            setIsSubmittingResi(false);
        }
    };

    useEffect(() => {
        fetchOrders(activeFilter);
    }, [activeFilter]);

    return (
        <main className="min-h-screen bg-[#0a0a0b] pb-20 selection:bg-[#ef3333] selection:text-white">
            <div className="w-full">
                {/* TABS HEADER */}
                <div className="flex justify-center overflow-x-auto gap-2 pb-6 pt-4 no-scrollbar px-6">
                    {STATUS_FILTERS.map((status) => (
                        <button
                            key={status}
                            onClick={() => setActiveFilter(status)}
                            className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                                activeFilter === status
                                    ? 'bg-[#ef3333] border-[#ef3333] text-white shadow-[0_0_25px_rgba(239,51,51,0.4)]'
                                    : 'bg-[#1a1a1e] border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                        >
                            {status === 'all' ? 'SEMUA' : formatStatus(status)}
                        </button>
                    ))}
                </div>

                <div className="px-6 max-w-5xl mx-auto space-y-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-44 bg-[#111114] rounded-[2.5rem] animate-pulse border border-zinc-900" />
                            ))}
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="space-y-6">
                            {orders.map((order) => {
                                const rawDate = order.created_at;
                                const orderDate = rawDate ? new Date(rawDate) : null;
                                const displayDate = (orderDate && isValid(orderDate)) 
                                    ? format(orderDate, 'dd MMM yyyy, HH:mm') 
                                    : 'TANGGAL TIDAK TERSEDIA';

                                const activeDispute = (order as any).dispute;
                                const isReturning = order.status === 'disputed' && activeDispute?.status === 'returning';

                                return (
                                    <div key={order.id} className="relative">
                                        <div className="block bg-[#111114] border border-zinc-800/80 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group hover:border-[#ef3333]/30 transition-all">
                                            {/* Top Row: Store Info & Status */}
                                            <div className="flex justify-between items-center mb-8">
                                                <div className="flex items-center gap-4">
                                                    {/* Background kontainer ikon dibuat transparan */}
                                                    <div className="w-10 h-10 bg-transparent rounded-2xl flex items-center justify-center border border-zinc-800">
                                                        <Store size={18} className="text-[#ef3333]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">TOKO</p>
                                                        <p className="text-sm font-black text-white uppercase tracking-tight">{order.store?.name || 'TOKO KOLEKTOR'}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-[0.15em] shadow-lg ${getStatusColor(order.status)}`}>
                                                    {formatStatus(order.status)}
                                                </div>
                                            </div>

                                            {/* Middle Row: Order Info & Price */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                                <div className="flex gap-6 items-center">
                                                    {/* Background kontainer ikon paket dibuat transparan */}
                                                    <div className="w-16 h-16 bg-transparent rounded-2xl border border-zinc-800 flex items-center justify-center shrink-0">
                                                        <Box size={24} className="text-zinc-700" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-black text-base uppercase tracking-tighter">
                                                            ORDER #{order.id.substring(0, 8).toUpperCase()}
                                                        </p>
                                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-1.5">
                                                            <Calendar size={12} className="text-[#ef3333]" />
                                                            {displayDate}
                                                        </p>
                                                        <p className="text-zinc-400 text-[11px] font-black uppercase tracking-tight mt-1">
                                                            {order.items?.length || 0} Item Rilisan Fisik
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 border-zinc-800 pt-6 md:pt-0">
                                                    <div className="text-left md:text-right">
                                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">TOTAL BELANJA</p>
                                                        <p className="text-2xl font-black text-white tracking-tighter italic">
                                                            Rp {Number(order.grand_total).toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                    
                                                    {/* Background tombol detail dibuat transparan */}
                                                    <Link 
                                                        href={`/akun/${userId}/pesanan/${order.id}`}
                                                        className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center border border-zinc-800 hover:bg-[#ef3333] hover:text-white transition-all group/btn shadow-xl active:scale-90"
                                                    >
                                                        <ChevronRight size={20} className="text-zinc-500 group-hover/btn:text-white" />
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Action Layer */}
                                            {(order.status === 'shipped' || order.status === 'delivered' || isReturning) && (
                                                <div className="mt-8 pt-6 border-t border-zinc-800/50 flex gap-3">
                                                    {order.status !== 'disputed' && (
                                                        <>
                                                            <button
                                                                onClick={(e) => openDisputeModal(e, order.id)}
                                                                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                            >
                                                                <AlertTriangle size={14} className="text-[#ef3333]" />
                                                                Ajukan Dispute
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleCompleteOrder(e, order.id)}
                                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(22,163,74,0.2)] disabled:opacity-50"
                                                                disabled={isCompleting === order.id}
                                                            >
                                                                {isCompleting === order.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                                                Konfirmasi Terima
                                                            </button>
                                                        </>
                                                    )}
                                                    {isReturning && (
                                                        <button
                                                            onClick={(e) => openResiModal(e, activeDispute.id)}
                                                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)]"
                                                        >
                                                            <Truck size={14} />
                                                            Kirim Resi Retur
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-24 text-center bg-[#111114] border border-zinc-800 rounded-[3.5rem] shadow-inner">
                            <Package size={60} className="text-zinc-800 mx-auto mb-6 opacity-20" />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Riwayat Kosong</h3>
                            <p className="text-zinc-500 text-xs mt-3 max-w-xs mx-auto font-bold uppercase tracking-widest leading-relaxed">
                                Anda belum memiliki transaksi apapun di platform ini.
                            </p>
                            <Link href="/katalog" className="mt-8 inline-block px-10 py-4 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#ef3333] hover:text-white transition-all">Mulai Belanja</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DISPUTE */}
            {showDisputeModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                    <div className="bg-[#111114] border border-zinc-800 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl">
                        <div className="p-10 max-h-[90vh] overflow-y-auto no-scrollbar">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                    <AlertTriangle className="text-[#ef3333]" />
                                    Ajukan Komplain
                                </h2>
                                <button onClick={() => setShowDisputeModal(false)} className="p-3 hover:bg-zinc-900 rounded-full text-zinc-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                {banks.length === 0 ? (
                                    <div className="bg-[#ef3333]/5 border border-[#ef3333]/20 rounded-[2rem] p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Landmark size={20} className="text-[#ef3333]" />
                                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Rekening Pengembalian</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <select 
                                                value={bankName}
                                                onChange={(e) => setBankName(e.target.value)}
                                                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-[#ef3333] outline-none"
                                            >
                                                <option value="">PILIH BANK...</option>
                                                {INDONESIAN_BANKS.map((bank) => <option key={bank.code} value={bank.name}>{bank.name}</option>)}
                                            </select>
                                            <input type="text" placeholder="NOMOR REKENING" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl p-4 text-sm text-white outline-none focus:border-[#ef3333]" />
                                            <input type="text" placeholder="NAMA SESUAI BUKU TABUNGAN" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl p-4 text-sm text-white outline-none focus:border-[#ef3333]" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 p-5 bg-[#ef3333]/5 border border-[#ef3333]/10 rounded-2xl">
                                        <CheckCircle2 size={20} className="text-green-500" />
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">DANA REFUND KE:</p>
                                            <p className="text-xs font-bold text-white uppercase">{banks[0].bank_name} - {banks[0].bank_account_number}</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3 block ml-1">ALASAN DETAIL</label>
                                    <textarea 
                                        value={disputeReason}
                                        onChange={(e) => setDisputeReason(e.target.value)}
                                        className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl p-5 text-white text-sm focus:border-[#ef3333] transition-colors min-h-[140px] outline-none"
                                        placeholder="Jelaskan masalah barang..."
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3 block ml-1">UNGGAH BUKTI (MAKS 5)</label>
                                    <div className="relative group">
                                        <input 
                                            type="file" multiple accept="image/*,video/*"
                                            onChange={(e) => e.target.files && setEvidenceFiles(Array.from(e.target.files).slice(0, 5))}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="bg-[#0a0a0b] border-2 border-dashed border-zinc-800 rounded-3xl p-10 flex flex-col items-center justify-center group-hover:border-[#ef3333]/50 transition-all">
                                            <Upload className="text-zinc-700 mb-3" size={32} />
                                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Klik atau seret video unboxing</p>
                                        </div>
                                    </div>
                                    {evidenceFiles.length > 0 && (
                                        <div className="mt-5 grid grid-cols-2 gap-2">
                                            {evidenceFiles.map((file, idx) => (
                                                <div key={idx} className="flex items-center justify-between px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <FileText size={14} className="text-[#ef3333] shrink-0" />
                                                        <span className="text-[9px] text-zinc-400 font-bold truncate">{file.name}</span>
                                                    </div>
                                                    <button onClick={() => removeFile(idx)} className="text-zinc-600 hover:text-white"><X size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleSubmitDispute}
                                    disabled={isDisputing || !disputeReason || evidenceFiles.length === 0}
                                    className="w-full bg-[#ef3333] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-red-900/20 disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
                                >
                                    {isDisputing ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Kirim Pengajuan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL INPUT RESI RETUR */}
            {showResiModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                    <div className="bg-[#111114] border border-zinc-800 w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl p-10">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                <Truck className="text-blue-500" /> RESI PENGEMBALIAN
                            </h2>
                            <button onClick={() => setShowResiModal(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Pastikan nomor resi valid agar dana dapat diproses kembali.</p>
                        <input 
                            type="text" placeholder="MASUKKAN NOMOR RESI..." 
                            value={returnResi} onChange={(e) => setReturnResi(e.target.value)}
                            className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl p-5 text-white text-sm focus:border-blue-500 outline-none uppercase font-mono tracking-widest"
                        />
                        <button
                            onClick={handleSubmitReturnResi}
                            disabled={isSubmittingResi || !returnResi}
                            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] mt-8 shadow-2xl shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-30"
                        >
                            {isSubmittingResi ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'KONFIRMASI PENGIRIMAN'}
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </main>
    );
}
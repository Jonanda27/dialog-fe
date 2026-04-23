'use client';

import { useEffect, useState } from 'react';
import { OrderService } from '@/services/api/order.service';
import { Order, OrderStatus } from '@/types/order';
import { getStatusColor, formatStatus } from '@/utils/order-helper';
import { 
    Package, ChevronRight, Store, CheckCircle2, Calendar, 
    AlertTriangle, X, Upload, FileText, Truck, Loader2,
    Banknote, Landmark 
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import { DisputeService } from '@/services/api/dispute.service';
import { useUserBankStore } from '@/store/bankStore'; 
import { INDONESIAN_BANKS } from '@/utils/bankName'; // Import daftar bank

const STATUS_FILTERS: (OrderStatus | 'all')[] = [
    'all', 'pending_payment', 'paid', 'processing', 'shipped', 'completed', 'cancelled'
];

export default function MyOrdersPage() {
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

    // Integrasi User Bank Store
    const { banks, fetchBanks, addBank, isLoading: isBankLoading } = useUserBankStore();

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
            
            toast.success('Dispute berhasil diajukan. Dana Escrow telah dibekukan sementara.');
            setShowDisputeModal(false);
            setDisputeReason('');
            setEvidenceFiles([]);
            setBankName('');
            setAccountNumber('');
            setAccountName('');
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
        <main className="min-h-screen bg-[#0a0a0b] pb-20">
            <div className="w-full">
                <div className="mb-10 px-6 text-center"></div>

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

                                const activeDispute = (order as any).dispute;
                                const isReturning = order.status === 'disputed' && activeDispute?.status === 'returning';

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
                                                        <p className="text-white font-bold text-sm line-clamp-1 uppercase tracking-tighter">
                                                            Order #{order.id.substring(0, 8).toUpperCase()}
                                                        </p>
                                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 mt-1">
                                                            <Calendar size={12} className="text-[#ef3333]" />
                                                            {displayDate}
                                                        </p>
                                                        <p className="text-zinc-400 text-xs mt-1 font-medium">
                                                            {order.items?.length || 0} Produk dipesan
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-zinc-800 pt-4 md:pt-0">
                                                    <div className="text-left md:text-right mr-4">
                                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Belanja</p>
                                                        <p className="text-lg font-black text-white">
                                                            Rp {Number(order.grand_total).toLocaleString('id-ID')}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex gap-2">
                                                        {(order.status === 'shipped' || order.status === 'delivered') && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => openDisputeModal(e, order.id)}
                                                                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                                >
                                                                    <AlertTriangle size={14} />
                                                                    Dispute
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleCompleteOrder(e, order.id)}
                                                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_5px_15px_rgba(22,163,74,0.3)] disabled:opacity-50"
                                                                    disabled={isCompleting === order.id}
                                                                >
                                                                    <CheckCircle2 size={14} />
                                                                    {isCompleting === order.id ? '...' : 'Terima'}
                                                                </button>
                                                            </>
                                                        )}

                                                        {isReturning && (
                                                            <button
                                                                onClick={(e) => openResiModal(e, activeDispute.id)}
                                                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_5px_15px_rgba(37,99,235,0.3)]"
                                                            >
                                                                <Truck size={14} />
                                                                Input Resi Retur
                                                            </button>
                                                        )}
                                                    </div>

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

            {/* MODAL DISPUTE */}
            {showDisputeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="bg-[#111114] border border-zinc-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                    <AlertTriangle className="text-[#ef3333]" />
                                    Ajukan Dispute
                                </h2>
                                <button 
                                    onClick={() => setShowDisputeModal(false)}
                                    className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* SECTION: REKENING BANK (DROPDOWN) */}
                                {banks.length === 0 ? (
                                    <div className="bg-[#ef3333]/5 border border-[#ef3333]/20 rounded-3xl p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Landmark size={18} className="text-[#ef3333]" />
                                            <h3 className="text-sm font-black text-white uppercase tracking-tighter">Data Rekening Pengembalian</h3>
                                        </div>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase mb-4 leading-relaxed">
                                            Anda belum mendaftarkan rekening. Mohon isi data bank untuk proses refund jika pengajuan disetujui.
                                        </p>
                                        <div className="space-y-4">
                                            {/* DROPDOWN NAMA BANK */}
                                            <div className="relative">
                                                <select 
                                                    value={bankName}
                                                    onChange={(e) => setBankName(e.target.value)}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#ef3333] outline-none transition-all appearance-none"
                                                >
                                                    <option value="" disabled className="bg-zinc-950 text-zinc-600">Pilih Bank...</option>
                                                    {INDONESIAN_BANKS.map((bank) => (
                                                        <option key={bank.code} value={bank.name} className="bg-zinc-950">
                                                            {bank.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
                                            </div>

                                            <input 
                                                type="text" 
                                                placeholder="Nomor Rekening"
                                                value={accountNumber}
                                                onChange={(e) => setAccountNumber(e.target.value)}
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#ef3333] outline-none transition-all"
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Nama Pemilik Rekening"
                                                value={accountName}
                                                onChange={(e) => setAccountName(e.target.value)}
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-[#ef3333] outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                                        <CheckCircle2 size={16} className="text-green-500" />
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Dana akan di-refund ke:</p>
                                            <p className="text-xs font-bold text-white truncate uppercase">{banks[0].bank_name} - {banks[0].bank_account_number}</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                                        Alasan Pengajuan
                                    </label>
                                    <textarea 
                                        value={disputeReason}
                                        onChange={(e) => setDisputeReason(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-[#ef3333] transition-colors min-h-[120px]"
                                        placeholder="Jelaskan detail masalah pada pesanan Anda..."
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                                        Bukti Foto/Video (Maks 5 File)
                                    </label>
                                    <div className="relative group">
                                        <input 
                                            type="file" 
                                            multiple
                                            accept="image/*,video/*"
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    const newFiles = Array.from(e.target.files);
                                                    setEvidenceFiles(prev => [...prev, ...newFiles].slice(0, 5));
                                                }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            disabled={evidenceFiles.length >= 5}
                                        />
                                        <div className={`bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center transition-colors ${evidenceFiles.length >= 5 ? 'opacity-50' : 'group-hover:border-[#ef3333]/50'}`}>
                                            <Upload className="text-zinc-600 mb-2" size={24} />
                                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-tight text-center">
                                                {evidenceFiles.length >= 5 ? 'Batas file tercapai' : 'Klik atau seret file ke sini'}
                                                <br />
                                                <span className="text-[9px] text-zinc-600 font-medium">PNG, JPG, MP4 (Max 5MB/file)</span>
                                            </p>
                                        </div>
                                    </div>

                                    {evidenceFiles.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {evidenceFiles.map((file, idx) => (
                                                <div key={idx} className="flex items-center justify-between px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <FileText size={14} className="text-[#ef3333] shrink-0" />
                                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight truncate">
                                                            {file.name}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeFile(idx)}
                                                        className="p-1 hover:bg-zinc-800 rounded-lg text-[#ef3333] transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl mb-6">
                                        <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                                        <p className="text-[9px] text-yellow-500/80 font-bold uppercase leading-relaxed">
                                            Dana akan dibekukan oleh sistem hingga Admin memberikan resolusi. Mohon sertakan bukti yang jelas.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleSubmitDispute}
                                        disabled={isDisputing || !disputeReason || evidenceFiles.length === 0 || (banks.length === 0 && (!bankName || !accountNumber || !accountName))}
                                        className="w-full bg-[#ef3333] hover:bg-[#d42d2d] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_10px_20px_rgba(239,51,51,0.2)] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                                    >
                                        {isDisputing ? (
                                             <div className="flex items-center justify-center gap-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                Memproses...
                                            </div>
                                        ) : (
                                            banks.length === 0 ? 'Simpan Bank & Kirim Dispute' : 'Kirim Pengajuan Dispute'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL INPUT RESI RETUR */}
            {showResiModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="bg-[#111114] border border-zinc-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                    <Truck className="text-blue-500" />
                                    Input Resi Retur
                                </h2>
                                <button 
                                    onClick={() => setShowResiModal(false)}
                                    className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">
                                        Nomor Resi Pengembalian
                                    </label>
                                    <input 
                                        type="text"
                                        value={returnResi}
                                        onChange={(e) => setReturnResi(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="Masukkan nomor resi kurir..."
                                    />
                                    <p className="text-[9px] text-zinc-500 mt-2 italic">
                                        *Pastikan nomor resi benar agar penjual dapat melacak barang.
                                    </p>
                                </div>

                                <button
                                    onClick={handleSubmitReturnResi}
                                    disabled={isSubmittingResi || !returnResi}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)] disabled:opacity-50"
                                >
                                    {isSubmittingResi ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 size={16} className="animate-spin" />
                                            Mengirim...
                                        </div>
                                    ) : 'Kirim Nomor Resi'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
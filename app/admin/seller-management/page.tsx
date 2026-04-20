"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  Search, 
  Store as StoreIcon, 
  MoreVertical, 
  Eye, 
  ShieldOff, 
  X,
  TrendingUp,
  Package,
  Star,
  Activity,
  Box,
  MessageSquare,
  Plus,
  Loader2,
  AlertCircle,
  Clock,
  ShieldCheck
} from "lucide-react";

// INTEGRASI SERVICES & TYPES
import { StoreService } from "@/services/api/store.service";
import { OrderService } from "@/services/api/order.service";
import { Store, StoreWalletResponse } from "@/types/store";
import { Order } from "@/types/order";
import { toast } from "react-hot-toast";
import { useAdminStore } from "@/store/adminStore";

export default function SellerManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sellers, setSellers] = useState<Store[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Suspend Modal
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendSellerId, setSuspendSellerId] = useState<string | null>(null);
  const [suspendForm, setSuspendForm] = useState({
    duration: 1,
    unit: 'days' as 'hours' | 'days' | 'permanent',
    reason: ''
  });

  const { suspendStore, unsuspendStore, isLoading: isAdminActionLoading } = useAdminStore();

  // State untuk Data Preview (Wallet & Orders per Seller)
  const [previewWallet, setPreviewWallet] = useState<StoreWalletResponse | null>(null);
  const [previewOrders, setPreviewOrders] = useState<Order[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // 1. FETCH SEMUA TOKO (PERBAIKAN: Mengirim string kosong agar filter status di backend terabaikan)
  const fetchSellers = async () => {
    try {
      setIsLoading(true);
      // Mengirim status: "" agar backend mengembalikan semua status, bukan cuma 'approved'
      const response = await StoreService.getAllStores({ status: "" }); 
      if (response.success) {
        setSellers(response.data);
      }
    } catch (error) {
      toast.error("Gagal mengambil daftar penjual");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  // 2. FETCH DETAIL PREVIEW
  const handleOpenPreview = async (seller: Store) => {
    setSelectedSeller(seller);
    setIsLoadingPreview(true);
    try {
      const [orderRes] = await Promise.all([
        OrderService.getStoreOrders() 
      ]);

      if (orderRes.success) {
        setPreviewOrders(orderRes.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Gagal memuat data preview");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // 3. HANDLER SUSPEND & UNSUSPEND
  const handleSuspendSubmit = async () => {
    if (!suspendSellerId) return;
    try {
      await suspendStore(
        suspendSellerId, 
        suspendForm.duration, 
        suspendForm.unit, 
        suspendForm.reason
      );
      toast.success("Toko berhasil disuspensi");
      setIsSuspendModalOpen(false);
      fetchSellers(); 
    } catch (error: any) {
      toast.error(error.message || "Gagal mensuspensi toko");
    }
  };

  const handleUnsuspend = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin mengaktifkan kembali toko ini?")) return;
    try {
      await unsuspendStore(id);
      toast.success("Suspensi telah dicabut");
      fetchSellers();
    } catch (error: any) {
      toast.error(error.message || "Gagal mencabut suspensi");
    }
  };

  // Filter pencarian lokal
  const filteredSellers = sellers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500 px-4">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <StoreIcon className="text-[#ef3333]" size={28} />
              Seller Management
            </h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Kelola, pantau, dan awasi aktivitas seluruh penjual di Analog.id.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="text" 
              placeholder="Cari Nama Toko..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#111114] border border-zinc-800 rounded-2xl py-3 pl-12 pr-6 text-xs text-white focus:border-[#ef3333] outline-none transition-all w-full"
            />
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1a1e]/50 border-b border-zinc-900 text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">
                  <th className="py-6 px-8">Informasi Toko</th>
                  <th className="py-6 px-4">Status</th>
                  <th className="py-6 px-4">Terdaftar</th>
                  <th className="py-6 px-4">Saldo Terakhir</th>
                  <th className="py-6 px-8 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="animate-spin text-[#ef3333] mx-auto" size={32} />
                    </td>
                  </tr>
                ) : filteredSellers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <AlertCircle className="text-zinc-700 mx-auto mb-2" size={32} />
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tidak ada penjual ditemukan</p>
                    </td>
                  </tr>
                ) : filteredSellers.map((seller) => {
                  const status = seller.status as string;

                  return (
                    <tr key={seller.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#0a0a0b] border border-zinc-800 flex items-center justify-center text-lg overflow-hidden group-hover:border-[#ef3333] transition-colors">
                            {seller.logo_url ? (
                              <img src={`${process.env.NEXT_PUBLIC_API_URL}${seller.logo_url}`} className="w-full h-full object-cover" alt="" />
                            ) : "🏪"}
                          </div>
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-tight group-hover:text-[#ef3333] transition-colors">{seller.name}</p>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">ID: {seller.id.split('-')[0]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          (status === 'approved' || status === 'active')
                          ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' 
                          : status === 'suspended'
                          ? 'bg-red-500/5 text-red-500 border-red-500/10'
                          : status === 'pending'
                          ? 'bg-amber-500/5 text-amber-500 border-amber-500/10'
                          : 'bg-zinc-500/5 text-zinc-500 border-zinc-500/10'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-xs font-bold text-zinc-400">
                        {new Date(seller.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-5 px-4 text-xs font-black text-white tracking-tight">
                        Rp {parseFloat(seller.balance?.toString() || "0").toLocaleString('id-ID')}
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenPreview(seller)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1e] text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all text-[9px] font-black uppercase tracking-widest"
                          >
                            <Eye size={14} /> Preview
                          </button>
                          
                          {status === 'suspended' ? (
                            <button 
                              onClick={() => handleUnsuspend(seller.id)}
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all"
                              title="Unsuspend Store"
                            >
                              <ShieldCheck size={14} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                setSuspendSellerId(seller.id);
                                setIsSuspendModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-[#1a1a1e] text-zinc-600 hover:text-red-500 border border-zinc-800 transition-all"
                              title="Suspend Store"
                            >
                              <ShieldOff size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL PREVIEW DASHBOARD SELLER */}
        {selectedSeller && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedSeller(null)} />
            
            <div className="relative w-full max-w-[1200px] h-[90vh] overflow-y-auto custom-scrollbar bg-[#0a0a0b] border border-zinc-800 rounded-[2rem] sm:rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300">
              
              <div className="sticky top-0 z-50 bg-[#0a0a0b]/90 backdrop-blur-xl px-8 py-6 border-b border-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl border border-zinc-800 bg-zinc-900 flex items-center justify-center text-2xl">
                    {selectedSeller.logo_url ? <img src={`${process.env.NEXT_PUBLIC_API_URL}${selectedSeller.logo_url}`} className="w-full h-full object-cover" alt="" /> : "🏪"}
                   </div>
                   <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                      {selectedSeller.name}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Status: {selectedSeller.status}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedSeller(null)} className="p-2 bg-[#1a1a1e] rounded-full text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                {isLoadingPreview ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-[#ef3333]" size={40} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-6">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Pendapatan</p>
                          <h2 className="text-3xl font-black text-white tracking-tighter mb-4">
                            Rp {parseFloat(selectedSeller.balance?.toString() || "0").toLocaleString('id-ID')}
                          </h2>
                          <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                             <div className="w-2/3 h-full bg-[#ef3333]"></div>
                          </div>
                        </div>

                        <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-6">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Produk Dilihat</p>
                          <h2 className="text-3xl font-black text-white tracking-tighter mb-1">1,429</h2>
                          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Aktivitas 30 Hari Terakhir</p>
                        </div>
                      </div>

                      <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Activity size={18} className="text-[#ef3333]" /> Aktivitas Penjualan
                          </h3>
                        </div>
                        <div className="w-full h-48 border-b border-l border-zinc-800 relative mb-8">
                           <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                             <path d="M0,50 Q20,20 40,60 T80,30 L100,80" fill="none" stroke="#ef3333" strokeWidth="2" />
                           </svg>
                        </div>
                      </div>
                    </div>

                    <div className="xl:col-span-1 space-y-6">
                      <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-6">
                          <Box size={16} className="text-amber-500" /> Transaksi Terakhir
                        </h3>
                        <div className="space-y-4">
                          {previewOrders.length > 0 ? previewOrders.map((order) => (
                            <div key={order.id} className="flex justify-between items-center p-3 hover:bg-[#1a1a1e] rounded-xl transition-colors">
                              <div>
                                <p className="text-xs font-black text-white uppercase tracking-tight">Order #{order.id.split('-')[0]}</p>
                                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Rp {parseFloat(order.grand_total.toString()).toLocaleString('id-ID')}</p>
                              </div>
                              <span className="text-[8px] font-black uppercase text-emerald-500">{order.status}</span>
                            </div>
                          )) : (
                            <p className="text-[10px] text-zinc-600 uppercase font-black text-center py-4">Belum ada transaksi</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL SUSPEND FORM */}
        {isSuspendModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSuspendModalOpen(false)} />
            <div className="relative bg-[#111114] border border-zinc-800 w-full max-w-md rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-red-500/10 rounded-2xl">
                    <ShieldOff className="text-red-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Suspend Toko</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Batasi aktivitas toko sementara</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block">Durasi & Unit</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="number" 
                        disabled={suspendForm.unit === 'permanent'}
                        value={suspendForm.duration}
                        onChange={(e) => setSuspendForm({...suspendForm, duration: parseInt(e.target.value)})}
                        className="bg-[#0a0a0b] border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-red-500 transition-all"
                        placeholder="Angka"
                      />
                      <select 
                        value={suspendForm.unit}
                        onChange={(e) => setSuspendForm({...suspendForm, unit: e.target.value as any})}
                        className="bg-[#0a0a0b] border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-red-500 transition-all appearance-none"
                      >
                        <option value="hours">Jam</option>
                        <option value="days">Hari</option>
                        <option value="permanent">Selamanya</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block">Alasan Penangguhan</label>
                    <textarea 
                      value={suspendForm.reason}
                      onChange={(e) => setSuspendForm({...suspendForm, reason: e.target.value})}
                      className="bg-[#0a0a0b] border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-red-500 transition-all w-full h-24 resize-none"
                      placeholder="Contoh: Melanggar aturan produk digital..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setIsSuspendModalOpen(false)}
                      className="flex-1 py-4 bg-zinc-900 text-zinc-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleSuspendSubmit}
                      disabled={isAdminActionLoading}
                      className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isAdminActionLoading ? <Loader2 size={14} className="animate-spin" /> : "Terapkan Suspend"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
    </Sidebar>
  );
}
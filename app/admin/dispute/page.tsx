"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  Search, 
  ShieldAlert, 
  Eye, 
  AlertOctagon,
  User,
  Store,
  Scale,
  FileWarning,
  MessageSquare,
  X,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Clock,
  Loader2,
  Banknote,
  Landmark,
  AlertTriangle
} from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import { OrderRefundInfo } from "@/types/order";
import { format, isValid } from "date-fns"; // Tambahkan isValid
import { id } from "date-fns/locale";

export default function DisputeAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRefund, setSelectedRefund] = useState<OrderRefundInfo | null>(null);
  
  // Integrasi Admin Store
  const { refundOrders, fetchRefundOrders, isLoading, error } = useAdminStore();

  useEffect(() => {
    fetchRefundOrders();
  }, [fetchRefundOrders]);

  // Filter pencarian berdasarkan ID Order atau Nama Buyer
  const filteredRefunds = refundOrders.filter((refund) =>
    refund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    refund.buyer.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEscrowStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "refunded": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "held": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  // Helper untuk memformat tanggal dengan aman
  const formatDateSafe = (dateStr: string | undefined | null) => {
    if (!dateStr) return "Tanggal tidak tersedia";
    const dateObj = new Date(dateStr);
    return isValid(dateObj) 
      ? format(dateObj, "dd MMM yyyy", { locale: id }) 
      : "Format tanggal salah";
  };

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <Scale className="text-purple-500" size={28} />
              Refund Management
            </h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Daftar pesanan dibatalkan yang memerlukan pengembalian dana manual ke Buyer.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="text" 
              placeholder="Cari ID Pesanan / Nama Buyer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#111114] border border-zinc-800 rounded-2xl py-3 pl-12 pr-6 text-xs text-white focus:border-purple-500 outline-none transition-all w-full"
            />
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5">
            <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-1 flex items-center gap-2">
              <AlertOctagon size={12} /> Total Perlu Refund
            </p>
            <p className="text-2xl font-black text-white tracking-tight">{refundOrders.length}</p>
          </div>
          <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1 text-red-500">Total Nominal Refund</p>
            <p className="text-xl font-black text-white tracking-tight">
              Rp {refundOrders.reduce((acc, curr) => acc + Number(curr.grand_total), 0).toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Status Sistem</p>
            <p className="text-xl font-black text-emerald-500 tracking-tight flex items-center gap-2 text-sm uppercase">
              <CheckCircle2 size={16} /> Terhubung ke Escrow
            </p>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1a1e]/50 border-b border-zinc-900 text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">
                  <th className="py-6 px-8">ID Pesanan</th>
                  <th className="py-6 px-4">Informasi Pihak</th>
                  <th className="py-6 px-4">Rekening Buyer</th>
                  <th className="py-6 px-4">Nominal & Escrow</th>
                  <th className="py-6 px-8 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="animate-spin text-purple-500 mx-auto mb-4" size={32} />
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Memuat Data Refund...</p>
                    </td>
                  </tr>
                ) : filteredRefunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="py-5 px-8">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-white uppercase tracking-tight group-hover:text-purple-500 transition-colors">
                          #{refund.id.substring(0, 8).toUpperCase()}
                        </p>
                        <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">
                          Batal: {formatDateSafe(refund.updated_at)}
                        </p>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          <User size={12} className="text-blue-500" /> {refund.buyer.full_name}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          <Store size={12} className="text-emerald-500" /> {refund.store.name}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      {refund.buyer.bankAccounts && refund.buyer.bankAccounts.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-xs font-black text-white uppercase tracking-tight">
                            {refund.buyer.bankAccounts[0].bank_name}
                          </p>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            {refund.buyer.bankAccounts[0].bank_account_number}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest italic">Bank Belum Diisi</p>
                      )}
                    </td>
                    <td className="py-5 px-4">
                      <div className="space-y-2">
                        <p className="text-xs font-black text-white">
                          Rp {Number(refund.grand_total).toLocaleString("id-ID")}
                        </p>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block ${getEscrowStatusColor(refund.escrow.status)}`}>
                          Escrow: {refund.escrow.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedRefund(refund)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all text-[9px] font-black uppercase tracking-widest"
                        >
                          <Banknote size={14} /> Detail Transfer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {!isLoading && filteredRefunds.length === 0 && (
               <div className="p-20 text-center flex flex-col items-center gap-4">
                 <div className="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center text-zinc-700">
                   <ShieldAlert size={32} />
                 </div>
                 <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Tidak ada antrean refund saat ini.</p>
               </div>
            )}
          </div>
        </div>

        {/* MODAL DETAIL REFUND */}
        {selectedRefund && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedRefund(null)} />
            
            <div className="relative w-full max-w-[600px] bg-[#0a0a0b] border border-zinc-800 rounded-[2rem] sm:rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
              
              {/* Header Modal */}
              <div className="bg-[#111114] px-8 py-6 border-b border-zinc-900 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                    <Banknote size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                      Instruksi Refund
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Order ID: {selectedRefund.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedRefund(null)} className="p-2 bg-[#1a1a1e] rounded-full text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-8 space-y-6">
                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 text-center">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Nominal Yang Harus Ditransfer</p>
                  <p className="text-4xl font-black text-white tracking-tighter">
                    Rp {Number(selectedRefund.grand_total).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4 border-b border-zinc-900 pb-4">
                      <Landmark className="text-purple-500" size={20} />
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Data Rekening Tujuan</h4>
                    </div>
                    {selectedRefund.buyer.bankAccounts && selectedRefund.buyer.bankAccounts.length > 0 ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Bank</p>
                          <p className="text-sm font-black text-white uppercase">{selectedRefund.buyer.bankAccounts[0].bank_name}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Nomor Rekening</p>
                          <p className="text-lg font-black text-white tracking-widest">{selectedRefund.buyer.bankAccounts[0].bank_account_number}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Atas Nama</p>
                          <p className="text-sm font-black text-white uppercase">{selectedRefund.buyer.bankAccounts[0].bank_account_name}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-red-500 font-bold italic">User belum mengisi data bank.</p>
                    )}
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex gap-3">
                  <AlertTriangle size={20} className="text-amber-500 shrink-0" />
                  <p className="text-[9px] text-amber-500/80 font-bold uppercase leading-relaxed">
                    Pastikan Anda telah melakukan transfer manual melalui internet banking / ATM sebelum menandai refund ini selesai di buku kas.
                  </p>
                </div>

                <button 
                  onClick={() => setSelectedRefund(null)}
                  className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-zinc-200 transition-all shadow-xl"
                >
                  Tutup & Tandai Proses
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
    </Sidebar>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  Search, 
  Download, 
  Filter, 
  Eye, 
  Receipt,
  Store,
  User,
  Package,
  CreditCard,
  Truck,
  ShieldCheck,
  X,
  AlertOctagon,
  Loader2,
  Disc
} from "lucide-react";

// INTEGRASI SERVICE & STORE SESUAI STANDAR ANDA
import { useOrderStore } from "@/store/orderStore";
import { OrderAdminResponse } from "@/types/order";
import { toIDR } from "@/utils/format";

export default function AllTransaksiAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrx, setSelectedTrx] = useState<OrderAdminResponse | null>(null);

  // 1. Injeksi State & Action dari useOrderStore
  const { adminOrders, fetchAllOrdersForAdmin, isLoading, error } = useOrderStore();

  // 2. Fetch data saat komponen dimuat
  useEffect(() => {
    fetchAllOrdersForAdmin();
  }, [fetchAllOrdersForAdmin]);

  // Helper untuk warna status sesuai database enum
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "paid":
      case "processing": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "shipped": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "disputed": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  const getEscrowColor = (status: string) => {
    if (status === "disputed") return "text-purple-500";
    if (status === "completed") return "text-emerald-500";
    if (status === "cancelled") return "text-red-500";
    return "text-amber-500";
  };

  // 3. Logika Filter Pencarian
  const filteredTransactions = adminOrders.filter((trx) => 
    trx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trx.buyer?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trx.store?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
        
        {/* HEADER & ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <Receipt className="text-[#ef3333]" size={28} />
              Semua Transaksi
            </h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Pantau seluruh aliran dana dan pesanan di platform Analog.id.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="text" 
                placeholder="Cari ID TRX, Pembeli, atau Toko..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#111114] border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-6 text-xs text-white focus:border-[#ef3333] outline-none transition-all w-full"
              />
            </div>
            <button className="flex items-center justify-center gap-2 bg-[#1a1a1e] border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center justify-center gap-2 bg-[#ef3333] hover:bg-red-700 text-white shadow-lg shadow-red-900/20 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>

        {/* METRIK MINI (STATIS/DINAMIS DARI TOTAL DATA) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Volume</p>
            <p className="text-xl font-black text-white tracking-tight">
                {toIDR(adminOrders.reduce((acc, curr) => acc + Number(curr.grand_total), 0))}
            </p>
          </div>
          <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Transaksi Aktif</p>
            <p className="text-xl font-black text-amber-500 tracking-tight">{adminOrders.length}</p>
          </div>
          <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Status Sistem</p>
            <p className="text-xl font-black text-blue-500 tracking-tight uppercase text-xs">Synchronized</p>
          </div>
          <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5 border-l-2 border-l-purple-500">
            <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-1">Dispute Aktif</p>
            <p className="text-xl font-black text-white tracking-tight">
                {adminOrders.filter(o => o.status === 'disputed').length} <span className="text-xs text-zinc-600">Kasus</span>
            </p>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                    <Loader2 className="animate-spin text-[#ef3333] mb-4" size={40} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Sinkronisasi Database Platform...</p>
                </div>
            ) : error ? (
                <div className="p-20 text-center text-red-500 uppercase text-xs font-black tracking-widest">{error}</div>
            ) : (
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[#1a1a1e]/50 border-b border-zinc-900 text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">
                    <th className="py-6 px-8">ID Transaksi</th>
                    <th className="py-6 px-4">Pembeli & Penjual</th>
                    <th className="py-6 px-4">Total</th>
                    <th className="py-6 px-4">Status Transaksi</th>
                    <th className="py-6 px-8 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                    {filteredTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="py-5 px-8">
                        <div className="space-y-1">
                            <p className="text-xs font-black text-white uppercase tracking-tight group-hover:text-[#ef3333] transition-colors">#{trx.id.slice(0,8)}</p>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                {new Date(trx.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        </td>
                        <td className="py-5 px-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            <User size={12} className="text-blue-500" /> {trx.buyer?.full_name || 'Buyer'}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            <Store size={12} className="text-emerald-500" /> {trx.store?.name || 'Store'}
                            </div>
                        </div>
                        </td>
                        <td className="py-5 px-4">
                        <span className="text-xs font-black text-white tracking-tight">{toIDR(trx.grand_total)}</span>
                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Sistem Escrow</p>
                        </td>
                        <td className="py-5 px-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block ${getStatusColor(trx.status)}`}>
                            {trx.status.replace('_', ' ')}
                        </span>
                        </td>
                        <td className="py-5 px-8">
                        <div className="flex items-center justify-end gap-2">
                            <button 
                            onClick={() => setSelectedTrx(trx)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1e] text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all text-[9px] font-black uppercase tracking-widest"
                            title="Lihat Detail Transaksi"
                            >
                            <Eye size={14} /> Detail
                            </button>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
          </div>
          
          <div className="p-6 border-t border-zinc-900 bg-[#0d0d0f] flex items-center justify-between">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Showing {filteredTransactions.length} platform-wide transactions</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-[#1a1a1e] text-zinc-600 text-[9px] font-black uppercase tracking-widest border border-zinc-900 cursor-not-allowed">Prev</button>
              <button className="px-4 py-2 rounded-lg bg-[#1a1a1e] text-zinc-400 hover:text-white text-[9px] font-black uppercase tracking-widest border border-zinc-900 transition-all">Next</button>
            </div>
          </div>
        </div>

        {/* MODAL DETAIL TRANSAKSI */}
        {selectedTrx && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedTrx(null)} />
            
            <div className="relative w-full max-w-[800px] bg-[#111114] border border-zinc-800 rounded-[2rem] sm:rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
              
              {/* Modal Header */}
              <div className="bg-[#1a1a1e] px-8 py-6 border-b border-zinc-900 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Receipt size={18} className="text-[#ef3333]" /> Detail Transaksi Platform
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">ID: {selectedTrx.id}</p>
                </div>
                <button onClick={() => setSelectedTrx(null)} className="text-zinc-500 hover:text-white transition-colors bg-zinc-900 p-2 rounded-full">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar text-left">
                
                {/* Status & Escrow Banner */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className={`flex-1 p-5 rounded-2xl border ${getStatusColor(selectedTrx.status).replace('bg-', 'bg-').replace('/10', '/5')}`}>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">Status Pesanan</p>
                    <p className="text-lg font-black uppercase tracking-tight">{selectedTrx.status.replace('_', ' ')}</p>
                  </div>
                  <div className="flex-1 p-5 rounded-2xl bg-[#0a0a0b] border border-zinc-800">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-zinc-500" /> Status Dana (Escrow)
                    </p>
                    <p className={`text-sm font-black uppercase tracking-tight ${getEscrowColor(selectedTrx.status)}`}>
                        {selectedTrx.status === 'completed' ? 'RELEASED TO SELLER' : selectedTrx.status === 'disputed' ? 'FROZEN / LOCKED' : 'HELD BY PLATFORM'}
                    </p>
                  </div>
                </div>

                {/* Info Entitas (Pembeli & Penjual) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-900 pb-2">Informasi Pembeli</h4>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-tight">{selectedTrx.buyer?.full_name}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">{selectedTrx.buyer?.email}</p>
                        <p className="text-[9px] text-zinc-600 mt-2 line-clamp-2">{selectedTrx.shipping_address}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-900 pb-2">Informasi Penjual</h4>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Store size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-tight">{selectedTrx.store?.name}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">Toko Terverifikasi ✓</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail Produk & Pembayaran */}
                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-900 pb-2 mb-4">Rincian Barang & Pembayaran</h4>
                <div className="bg-[#0a0a0b] border border-zinc-900 rounded-2xl p-5 space-y-4">
                  {selectedTrx.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center pb-3 border-b border-zinc-900 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                        <Package size={16} className="text-zinc-500" />
                        <span className="text-xs font-bold text-zinc-300 uppercase">{item.product?.name} ({item.qty}x)</span>
                        </div>
                        <span className="text-xs font-black text-white">{toIDR(item.price_at_purchase)}</span>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-3">
                      <Truck size={16} className="text-zinc-500" />
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ongkos Kirim</span>
                    </div>
                    <span className="text-xs font-bold text-zinc-400">{toIDR(selectedTrx.shipping_fee)}</span>
                  </div>

                  <div className="border-t border-zinc-800 pt-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-[#ef3333]" />
                      <span className="text-[10px] font-black text-[#ef3333] uppercase tracking-widest">Total Transaksi</span>
                    </div>
                    <span className="text-xl font-black text-[#ef3333]">
                      {toIDR(selectedTrx.grand_total)}
                    </span>
                  </div>
                </div>

                {/* Admin Actions */}
                {selectedTrx.status === "disputed" && (
                  <div className="mt-8 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertOctagon className="text-purple-500" size={24} />
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-tight">Transaksi dalam Dispute</p>
                        <p className="text-[10px] text-zinc-400 font-medium">Investigasi diperlukan sebelum pelepasan dana.</p>
                      </div>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-colors">
                      Pusat Resolusi
                    </button>
                  </div>
                )}
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
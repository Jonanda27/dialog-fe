"use client";

import React, { useState } from "react";
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
  AlertOctagon
} from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  buyer: string;
  seller: string;
  product: string;
  amount: string;
  status: string;
  payment: string;
  escrowStatus: string;
}

export default function AllTransaksiAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

  // Data Dummy Platform-Wide Transactions
  const transactions: Transaction[] = [
    { id: "TRX-2026-001", date: "09 Apr 2026, 09:15", buyer: "Rizky Ramadhan", seller: "Vinylnesia Store", product: "The Dark Side of The Moon", amount: "Rp 965.000", status: "Diproses", payment: "BCA Virtual Account", escrowStatus: "Ditahan (Escrow)" },
    { id: "TRX-2026-002", date: "08 Apr 2026, 14:20", buyer: "Siska Amelia", seller: "Analog Audio", product: "Daft Punk - Discovery", amount: "Rp 1.100.000", status: "Dikirim", payment: "GoPay", escrowStatus: "Ditahan (Escrow)" },
    { id: "TRX-2026-003", date: "07 Apr 2026, 10:00", buyer: "Budi Pratama", seller: "Kasetjogja", product: "The Beatles - Abbey Road", amount: "Rp 850.000", status: "Selesai", payment: "Mandiri VA", escrowStatus: "Diteruskan ke Penjual" },
    { id: "TRX-2026-004", date: "07 Apr 2026, 08:30", buyer: "Diana Putri", seller: "Memorabilia", product: "Nirvana - Nevermind", amount: "Rp 750.000", status: "Dibatalkan", payment: "QRIS", escrowStatus: "Refund ke Pembeli" },
    { id: "TRX-2026-005", date: "06 Apr 2026, 16:45", buyer: "Eko Prasetyo", seller: "Vinylnesia Store", product: "Radiohead - OK Computer", amount: "Rp 1.250.000", status: "Dispute", payment: "BCA Virtual Account", escrowStatus: "Dibekukan (Investigasi)" },
  ];

  // Helper untuk warna status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Selesai": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Diproses": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Dikirim": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Dibatalkan": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "Dispute": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  const getEscrowColor = (status: string) => {
    if (status.includes("Ditahan")) return "text-amber-500";
    if (status.includes("Diteruskan")) return "text-emerald-500";
    if (status.includes("Refund")) return "text-red-500";
    if (status.includes("Dibekukan")) return "text-purple-500";
    return "text-zinc-500";
  };

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

        {/* METRIK MINI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Volume Hari Ini</p>
            <p className="text-xl font-black text-white tracking-tight">Rp 34.5M</p>
          </div>
          <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Transaksi Aktif</p>
            <p className="text-xl font-black text-amber-500 tracking-tight">142</p>
          </div>
          <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Dana Mengendap (Escrow)</p>
            <p className="text-xl font-black text-blue-500 tracking-tight">Rp 128.2M</p>
          </div>
          <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5 border-l-2 border-l-purple-500">
            <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-1">Dispute Aktif</p>
            <p className="text-xl font-black text-white tracking-tight">3 <span className="text-xs text-zinc-600">Kasus</span></p>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
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
                {transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="py-5 px-8">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-white uppercase tracking-tight group-hover:text-[#ef3333] transition-colors">{trx.id}</p>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{trx.date}</p>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          <User size={12} className="text-blue-500" /> {trx.buyer}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          <Store size={12} className="text-emerald-500" /> {trx.seller}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-xs font-black text-white tracking-tight">{trx.amount}</span>
                      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{trx.payment}</p>
                    </td>
                    <td className="py-5 px-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block ${getStatusColor(trx.status)}`}>
                        {trx.status}
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
          </div>
          
          {/* Pagination Dummy */}
          <div className="p-6 border-t border-zinc-900 bg-[#0d0d0f] flex items-center justify-between">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Showing 1-5 of 142 Transactions</p>
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
                    <Receipt size={18} className="text-[#ef3333]" /> Detail Transaksi
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">ID: {selectedTrx.id}</p>
                </div>
                <button onClick={() => setSelectedTrx(null)} className="text-zinc-500 hover:text-white transition-colors bg-zinc-900 p-2 rounded-full">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                
                {/* Status & Escrow Banner */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className={`flex-1 p-5 rounded-2xl border ${getStatusColor(selectedTrx.status).replace('bg-', 'bg-').replace('/10', '/5')}`}>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">Status Pesanan</p>
                    <p className="text-lg font-black uppercase tracking-tight">{selectedTrx.status}</p>
                  </div>
                  <div className="flex-1 p-5 rounded-2xl bg-[#0a0a0b] border border-zinc-800">
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-zinc-500" /> Status Dana (Escrow)
                    </p>
                    <p className={`text-sm font-black uppercase tracking-tight ${getEscrowColor(selectedTrx.escrowStatus)}`}>
                      {selectedTrx.escrowStatus}
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
                        <p className="text-xs font-black text-white uppercase tracking-tight">{selectedTrx.buyer}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">Jl. Merdeka No. 12, Jakarta</p>
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
                        <p className="text-xs font-black text-white uppercase tracking-tight">{selectedTrx.seller}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">Toko Terverifikasi ✓</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail Produk & Pembayaran */}
                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest border-b border-zinc-900 pb-2 mb-4">Rincian Pembayaran</h4>
                <div className="bg-[#0a0a0b] border border-zinc-900 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Package size={16} className="text-zinc-500" />
                      <span className="text-xs font-bold text-zinc-300 uppercase">{selectedTrx.product} (1x)</span>
                    </div>
                    <span className="text-xs font-black text-white">{selectedTrx.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Truck size={16} className="text-zinc-500" />
                      <span className="text-xs font-bold text-zinc-300 uppercase">Ongkos Kirim (Reguler)</span>
                    </div>
                    <span className="text-xs font-black text-white">Rp 25.000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={16} className="text-zinc-500" />
                      <span className="text-xs font-bold text-zinc-300 uppercase">Biaya Layanan Escrow</span>
                    </div>
                    <span className="text-xs font-black text-white">Rp 2.500</span>
                  </div>
                  <div className="border-t border-zinc-800 pt-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-[#ef3333]" />
                      <span className="text-[10px] font-black text-[#ef3333] uppercase tracking-widest">Total Dibayar ({selectedTrx.payment})</span>
                    </div>
                    <span className="text-xl font-black text-[#ef3333]">
                      Rp {(parseInt(selectedTrx.amount.replace(/\D/g, "")) + 27500).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Admin Actions untuk Transaksi */}
                {selectedTrx.status === "Dispute" && (
                  <div className="mt-8 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertOctagon className="text-purple-500" size={24} />
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-tight">Transaksi dalam Dispute</p>
                        <p className="text-[10px] text-zinc-400 font-medium">Buka menu Dispute Center untuk memediasi pembeli dan penjual.</p>
                      </div>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-colors">
                      Tinjau Kasus
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
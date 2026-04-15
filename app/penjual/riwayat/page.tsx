"use client";

import React, { useState } from "react";
import { 
  Search, 
  Calendar, 
  Download, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  FileText,
  Filter,
  ArrowUpRight
} from "lucide-react";

export default function RiwayatPesanan() {
  const [searchTerm, setSearchTerm] = useState("");

  // Data Dummy Riwayat Pesanan
  const historyData = [
    {
      id: "ORD-2026-003",
      date: "06 Apr 2026",
      customer: "Budi Pratama",
      product: "The Beatles - Abbey Road",
      amount: "Rp 850.000",
      status: "Selesai",
      shipping: "Grab Express",
      color: "emerald"
    },
    {
      id: "ORD-2026-004",
      date: "04 Apr 2026",
      customer: "Diana Putri",
      product: "Nirvana - Nevermind (Remastered)",
      amount: "Rp 750.000",
      status: "Dibatalkan",
      shipping: "JNE Reguler",
      color: "red"
    },
    {
      id: "ORD-2026-005",
      date: "02 Apr 2026",
      customer: "Eko Prasetyo",
      product: "Radiohead - OK Computer",
      amount: "Rp 1.100.000",
      status: "Retur",
      shipping: "SiCepat Best",
      color: "amber"
    },
    {
      id: "ORD-2026-006",
      date: "30 Mar 2026",
      customer: "Siska Saraswati",
      product: "Daft Punk - Discovery",
      amount: "Rp 1.200.000",
      status: "Selesai",
      shipping: "J&T Express",
      color: "emerald"
    }
  ];

  return (
      <div className="max-w-6xl mx-auto pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">Riwayat Pesanan</h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Data seluruh transaksi yang telah diproses oleh toko Anda.
            </p>
          </div>
          
          <button className="flex items-center justify-center gap-3 bg-[#111114] border border-zinc-800 hover:border-zinc-700 text-white font-black px-6 py-3.5 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl">
            <Download size={16} className="text-[#ef3333]" />
            Ekspor Laporan (.CSV)
          </button>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-[#111114] border border-zinc-900 rounded-[2rem] p-4 mb-8 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
            <input 
              type="text" 
              placeholder="Cari No. Pesanan atau Nama Pelanggan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0a0b] border border-zinc-900 rounded-xl py-3.5 pl-12 pr-4 text-xs font-medium text-white focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-800"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-[#1a1a1e] border border-zinc-900 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
              <Calendar size={14} />
              Pilih Tanggal
            </button>
            <button className="flex items-center gap-2 bg-[#1a1a1e] border border-zinc-900 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
              <Filter size={14} />
              Filter
            </button>
          </div>
        </div>

        {/* TABLE HISTORY */}
        <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1a1e]/30 border-b border-zinc-900 text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">
                  <th className="py-6 px-8">Info Pesanan</th>
                  <th className="py-6 px-4">Produk Vinyl</th>
                  <th className="py-6 px-4">Total Bayar</th>
                  <th className="py-6 px-4">Status</th>
                  <th className="py-6 px-8 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {historyData.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="py-6 px-8">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-white uppercase tracking-tight">{order.id}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{order.date}</p>
                        <div className="flex items-center gap-1.5 pt-1 text-[9px] font-bold text-zinc-600 uppercase">
                           <span>{order.customer}</span>
                           <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
                           <span>{order.shipping}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg bg-[#0a0a0b] border border-zinc-800 flex items-center justify-center text-lg grayscale group-hover:grayscale-0 transition-all">
                           📀
                         </div>
                         <p className="text-xs font-black text-zinc-400 group-hover:text-white transition-colors max-w-[180px] truncate uppercase tracking-tighter leading-tight">
                            {order.product}
                         </p>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <p className="text-xs font-black text-white">{order.amount}</p>
                    </td>
                    <td className="py-6 px-4">
                      <div className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                        order.status === 'Selesai' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 
                        order.status === 'Dibatalkan' ? 'bg-red-500/5 text-red-500 border-red-500/10' : 
                        'bg-amber-500/5 text-amber-500 border-amber-500/10'
                      }`}>
                        {order.status === 'Selesai' && <CheckCircle2 size={10} />}
                        {order.status === 'Dibatalkan' && <XCircle size={10} />}
                        {order.status === 'Retur' && <RotateCcw size={10} />}
                        {order.status}
                      </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                       <button className="inline-flex items-center justify-center p-3 rounded-xl bg-[#1a1a1e] border border-zinc-800 text-zinc-500 hover:text-[#ef3333] hover:border-[#ef3333]/50 transition-all">
                         <FileText size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="p-8 border-t border-zinc-900 bg-[#0d0d0f] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-4 items-center">
               <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Selesai: 102</p>
               </div>
               <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Gagal: 4</p>
               </div>
            </div>
            
            <div className="flex gap-2">
              <button className="px-5 py-2.5 rounded-xl bg-[#1a1a1e] text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] border border-zinc-900">Prev</button>
              <button className="px-5 py-2.5 rounded-xl bg-[#1a1a1e] text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] border border-zinc-900 transition-all">Next</button>
            </div>
          </div>
        </div>
      </div>
  );
}
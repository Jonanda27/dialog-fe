"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  BarChart3, 
  Download, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  ArrowUpRight,
  PieChart,
  Filter,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function LaporanExportPage() {
  const [dateRange, setDateRange] = useState("Bulan Ini");

  // Data Dummy untuk Laporan
  const reportCategories = [
    { id: "sales", name: "Laporan Penjualan", desc: "Data transaksi, pendapatan, dan pajak.", icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "seller", name: "Performa Seller", desc: "Statistik toko, rating, dan volume produk.", icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "user", name: "Pertumbuhan User", desc: "Registrasi baru dan aktivitas pembeli.", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "finance", name: "Arus Kas & Escrow", desc: "Dana mengendap, refund, dan penarikan.", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const recentExports = [
    { id: "EXP-882", name: "Sales_Report_April_2026.csv", date: "09 Apr 2026", size: "2.4 MB", status: "Ready" },
    { id: "EXP-881", name: "Seller_Performance_Q1.xlsx", date: "07 Apr 2026", size: "1.8 MB", status: "Ready" },
    { id: "EXP-880", name: "User_Audit_Log.csv", date: "05 Apr 2026", size: "850 KB", status: "Expired" },
  ];

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <BarChart3 className="text-[#ef3333]" size={28} />
              Laporan & Export
            </h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Analisis performa platform dan ekspor data mentah untuk kebutuhan bisnis.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#111114] border border-zinc-900 p-2 rounded-2xl">
            {["Minggu Ini", "Bulan Ini", "Tahun Ini"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  dateRange === range 
                  ? "bg-[#ef3333] text-white shadow-lg shadow-red-900/20" 
                  : "text-zinc-500 hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* SUMMARY STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 flex flex-col justify-between group hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <TrendingUp size={24} />
              </div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-lg">+18.2%</span>
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total GMV (Gross Merchandise Value)</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">Rp 1.42M</h3>
            </div>
          </div>

          <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 flex flex-col justify-between group hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <ShoppingBag size={24} />
              </div>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-lg">1,240 Trx</span>
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Volume Penjualan Terverifikasi</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">842 <span className="text-lg font-bold text-zinc-700">Item</span></h3>
            </div>
          </div>

          <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 flex flex-col justify-between group hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Users size={24} />
              </div>
              <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-lg">+42 User</span>
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Pertumbuhan Pengguna Baru</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">15.2%</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* EXPORT OPTIONS */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Download size={16} className="text-[#ef3333]" /> Pilih Kategori Ekspor
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportCategories.map((cat) => (
                <div key={cat.id} className="bg-[#111114] border border-zinc-900 rounded-[2rem] p-6 hover:border-[#ef3333]/30 transition-all group cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <cat.icon size={22} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-tight">{cat.name}</h4>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{cat.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                    <div className="flex gap-2">
                      <span className="text-[8px] font-black text-zinc-500 border border-zinc-800 px-2 py-1 rounded">.CSV</span>
                      <span className="text-[8px] font-black text-zinc-500 border border-zinc-800 px-2 py-1 rounded">.XLSX</span>
                    </div>
                    <button className="text-[9px] font-black text-[#ef3333] hover:underline uppercase tracking-widest flex items-center gap-1">
                      Generate <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ANALYTICS PREVIEW (MINI CHART PLACEHOLDER) */}
            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <PieChart size={16} className="text-blue-500" /> Distribusi Kategori Produk
                  </h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  <div className="md:col-span-1 aspect-square rounded-full border-[15px] border-zinc-900 relative flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[15px] border-emerald-500 border-t-transparent border-l-transparent rotate-45"></div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-white">62%</p>
                      <p className="text-[8px] font-black text-zinc-600 uppercase">Vinyl (LP)</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    {[
                      { label: "Vinyl 12\"", val: "62%", color: "bg-emerald-500" },
                      { label: "Kaset Pita", val: "28%", color: "bg-blue-500" },
                      { label: "Compact Disc", val: "10%", color: "bg-purple-500" },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                          <span className="text-zinc-400">{item.label}</span>
                          <span className="text-white">{item.val}</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: item.val }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* RECENT DOWNLOADS */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Clock size={16} className="text-zinc-500" /> Riwayat Unduhan
            </h3>
            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 space-y-6">
              {recentExports.map((file) => (
                <div key={file.id} className="group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 ${file.status === 'Ready' ? 'text-emerald-500' : 'text-zinc-700'}`}>
                      <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-white truncate uppercase tracking-tight group-hover:text-[#ef3333] transition-colors">{file.name}</p>
                      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{file.date} • {file.size}</p>
                    </div>
                    {file.status === 'Ready' ? (
                      <button className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20">
                        <Download size={14} />
                      </button>
                    ) : (
                      <span className="text-[8px] font-black text-zinc-800 uppercase border border-zinc-900 px-2 py-1 rounded-lg">Expired</span>
                    )}
                  </div>
                </div>
              ))}
              <button className="w-full py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest border border-zinc-900 rounded-xl hover:bg-[#1a1a1e] hover:text-white transition-all">
                Bersihkan Riwayat
              </button>
            </div>

            {/* INFO BOX */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-6 flex gap-4">
              <Calendar size={20} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Penjadwalan Otomatis</p>
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase tracking-tight">
                  Laporan bulanan akan otomatis dikirimkan ke email manajemen setiap tanggal 1 pukul 00:00 WIB.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Sidebar>
  );
}
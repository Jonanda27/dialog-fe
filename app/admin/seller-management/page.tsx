"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  Search, 
  Store, 
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
  Plus
} from "lucide-react";

interface Seller {
  id: string;
  name: string;
  owner: string;
  status: string;
  joinDate: string;
  totalSales: string;
}

export default function SellerManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  // Data Dummy Penjual
  const sellers: Seller[] = [
    { id: "SLR-001", name: "Vinylnesia Store", owner: "Budi Santoso", status: "Active", joinDate: "12 Jan 2026", totalSales: "Rp 45.2M" },
    { id: "SLR-002", name: "Kasetjogja", owner: "Siska Amelia", status: "Active", joinDate: "05 Feb 2026", totalSales: "Rp 12.5M" },
    { id: "SLR-003", name: "Analog Audio", owner: "Rizky Ramadhan", status: "Suspended", joinDate: "20 Mar 2026", totalSales: "Rp 2.1M" },
    { id: "SLR-004", name: "Memorabilia", owner: "Diana Putri", status: "Active", joinDate: "01 Apr 2026", totalSales: "Rp 8.9M" },
  ];

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <Store className="text-[#ef3333]" size={28} />
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
              placeholder="Cari Nama Toko atau ID..." 
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
                  <th className="py-6 px-4">Bergabung</th>
                  <th className="py-6 px-4">Total Penjualan</th>
                  <th className="py-6 px-8 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {sellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#0a0a0b] border border-zinc-800 flex items-center justify-center text-lg shadow-inner group-hover:border-[#ef3333] transition-colors">
                          🏪
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-tight group-hover:text-[#ef3333] transition-colors">{seller.name}</p>
                          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{seller.id} • {seller.owner}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        seller.status === 'Active' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-red-500/5 text-red-500 border-red-500/10'
                      }`}>
                        {seller.status}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-xs font-bold text-zinc-400">{seller.joinDate}</td>
                    <td className="py-5 px-4 text-xs font-black text-white tracking-tight">{seller.totalSales}</td>
                    <td className="py-5 px-8">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedSeller(seller)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1e] text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all text-[9px] font-black uppercase tracking-widest"
                          title="Lihat Preview Dashboard Toko"
                        >
                          <Eye size={14} /> Preview
                        </button>
                        <button className="p-2 rounded-lg bg-[#1a1a1e] text-zinc-600 hover:text-red-500 border border-zinc-800 transition-all" title="Suspend Toko">
                          <ShieldOff size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL PREVIEW DASHBOARD SELLER (DIADAPTASI DARI GAMBAR) */}
        {selectedSeller && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedSeller(null)} />
            
            <div className="relative w-full max-w-[1200px] h-[90vh] overflow-y-auto custom-scrollbar bg-[#0a0a0b] border border-zinc-800 rounded-[2rem] sm:rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300">
              
              {/* Modal Header */}
              <div className="sticky top-0 z-50 bg-[#0a0a0b]/90 backdrop-blur-xl px-8 py-6 border-b border-zinc-900 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Store size={20} className="text-[#ef3333]" /> Preview Dashboard: {selectedSeller.name}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Tampilan Sisi Penjual (Read-Only Mode)</p>
                </div>
                <button onClick={() => setSelectedSeller(null)} className="p-2 bg-[#1a1a1e] rounded-full text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body - Sesuai Layout Referensi Gambar */}
              <div className="p-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* LEFT COLUMN (Width: 2/3) */}
                  <div className="xl:col-span-2 space-y-6">
                    
                    {/* 4 Grid Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Card 1: Saldo */}
                      <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-6 relative group">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Saldo Tersedia</p>
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-4">Rp12.500.000</h2>
                        <button className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1 transition-colors">
                          Tarik Saldo <TrendingUp size={12} className="rotate-45" />
                        </button>
                      </div>

                      {/* Card 2: Produk */}
                      <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-6">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Produk</p>
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-1">24</h2>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">8 Vinyl • 12 Kaset • 4 CD</p>
                      </div>

                      {/* Card 3: Pesanan */}
                      <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-6">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Pesanan Bulan Ini</p>
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-1">18</h2>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                          <TrendingUp size={12} /> +23%
                        </p>
                      </div>

                      {/* Card 4: Rating */}
                      <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-6">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Rating Toko</p>
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-1">4.8</h2>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Dari 32 ulasan</p>
                      </div>
                    </div>

                    {/* Grafik Penjualan */}
                    <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-6 md:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <Activity size={18} className="text-[#ef3333]" /> Grafik Penjualan
                        </h3>
                        <div className="flex gap-2">
                          <span className="bg-[#ef3333] text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Bulan Ini</span>
                          <span className="bg-[#1a1a1e] text-zinc-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-zinc-800">3 Bulan</span>
                          <span className="bg-[#1a1a1e] text-zinc-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-zinc-800">Tahun Ini</span>
                        </div>
                      </div>

                      {/* Area Chart Placeholder */}
                      <div className="w-full h-48 border-b border-l border-zinc-800 relative mb-8">
                         {/* Garis Horizontal */}
                         <div className="absolute w-full h-full flex flex-col justify-between">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="w-full h-[1px] bg-zinc-800/50"></div>
                            ))}
                         </div>
                         {/* Mock SVG Wave */}
                         <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                           <path d="M0,20 Q20,60 40,30 T80,80 L100,100 L0,100 Z" fill="rgba(239, 51, 51, 0.1)" />
                           <path d="M0,20 Q20,60 40,30 T80,80" fill="none" stroke="#ef3333" strokeWidth="2" />
                         </svg>
                         {/* X-Axis labels */}
                         <div className="absolute -bottom-6 w-full flex justify-between text-[8px] font-bold text-zinc-600 uppercase">
                           <span>1 Apr</span><span>2 Apr</span><span>3 Apr</span><span>4 Apr</span><span>5 Apr</span><span>6 Apr</span><span>7 Apr</span>
                         </div>
                      </div>

                      {/* 3 Sub Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
                        <div className="bg-[#1a1a1e] border border-zinc-800/50 rounded-2xl p-4 text-center">
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Penjualan</p>
                          <p className="text-xl font-black text-white tracking-tighter">Rp8.2jt</p>
                        </div>
                        <div className="bg-[#1a1a1e] border border-zinc-800/50 rounded-2xl p-4 text-center">
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Rata-rata per hari</p>
                          <p className="text-xl font-black text-white tracking-tighter">Rp273rb</p>
                        </div>
                        <div className="bg-[#1a1a1e] border border-zinc-800/50 rounded-2xl p-4 text-center">
                          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Produk Terlaris</p>
                          <p className="text-base font-black text-white tracking-tight mt-1">Nevermind (12x)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN (Width: 1/3) */}
                  <div className="xl:col-span-1 space-y-6">
                    
                    {/* Pesanan Baru */}
                    <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-6">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-6">
                        <Box size={16} className="text-amber-500" /> Pesanan Baru
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 hover:bg-[#1a1a1e] rounded-xl transition-colors">
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-tight">Nevermind (VG+)</p>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">#INV-101 • Rp450.000</p>
                          </div>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black uppercase px-4 py-2 rounded-lg transition-colors">Proses</button>
                        </div>
                        <div className="flex justify-between items-center p-3 hover:bg-[#1a1a1e] rounded-xl transition-colors">
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-tight">Unknown Pleasures (Mint)</p>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">#INV-102 • Rp275.000</p>
                          </div>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black uppercase px-4 py-2 rounded-lg transition-colors">Proses</button>
                        </div>
                      </div>
                    </div>

                    {/* Rating Terbaru */}
                    <div className="bg-[#111114] border border-zinc-800 rounded-3xl p-6">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-6">
                        <Star size={16} className="text-amber-500" /> Rating Terbaru
                      </h3>
                      <div className="space-y-6">
                        <div className="border-b border-zinc-900 pb-4">
                          <div className="flex text-amber-500 gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={10} fill="currentColor" />)}
                          </div>
                          <p className="text-xs text-zinc-300 font-medium italic mb-2">"Packing aman banget!"</p>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Budi C. • 2 hari lalu</p>
                        </div>
                        <div>
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4].map((s) => <Star key={s} size={10} className="text-amber-500" fill="currentColor" />)}
                            <Star size={10} className="text-zinc-700" />
                          </div>
                          <p className="text-xs text-zinc-300 font-medium italic mb-2">"Grading sesuai, recommended"</p>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Rina A. • 1 minggu lalu</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-blue-600/10 border border-blue-600/20 rounded-3xl p-6">
                      <h3 className="text-sm font-black text-blue-500 uppercase tracking-wider flex items-center gap-2 mb-4">
                        ⚡ Quick Actions
                      </h3>
                      <div className="flex gap-3">
                        <button className="flex-1 bg-white text-black font-black text-[10px] uppercase py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-zinc-200 transition-colors">
                          <Plus size={14} /> Tambah Produk
                        </button>
                        <button className="flex-1 bg-transparent border border-blue-600/50 text-blue-500 font-black text-[10px] uppercase py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-600/20 transition-colors">
                          <Store size={14} /> Kelola Toko
                        </button>
                      </div>
                    </div>

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
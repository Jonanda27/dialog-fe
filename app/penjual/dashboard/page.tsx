"use client";

import React from "react";
import Sidebar from "@/components/layout/sidebar";
import { TrendingUp, MoreVertical, Star, Calendar } from "lucide-react";

// Komponen StatCard
const StatCard = ({ title, value, trend, isPositive }: { title: string, value: string, trend: string, isPositive: boolean }) => (
  <div className="bg-[#111114] p-6 rounded-[2rem] border border-zinc-800 hover:border-zinc-700 transition-colors shadow-sm relative overflow-hidden group">
    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 relative z-10">{title}</h3>
    <div className="flex items-end justify-between relative z-10">
      <p className="text-3xl font-black text-white">{value}</p>
      <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-[#ef3333]'}`}>
        <TrendingUp size={14} className={isPositive ? "" : "rotate-180"} />
        {trend}
      </div>
    </div>
  </div>
);

export default function SellerDashboard() {
  const recentOrders = [
    { id: "ORD-092", product: "The Beatles - Abbey Road (Vinyl)", customer: "Budi Santoso", date: "Hari ini", status: "Diproses", price: "Rp 850.000" },
    { id: "ORD-091", product: "Daft Punk - Random Access Memories", customer: "Siska Saraswati", date: "Kemarin", status: "Dikirim", price: "Rp 1.200.000" },
    { id: "ORD-090", product: "Pink Floyd - The Dark Side of The Moon", customer: "Andi Rahmat", date: "05 Apr 2026", status: "Selesai", price: "Rp 950.000" },
    { id: "ORD-089", product: "Nirvana - Nevermind (Remastered)", customer: "Diana Putri", date: "04 Apr 2026", status: "Selesai", price: "Rp 750.000" },
  ];

  return (
    <Sidebar>
      {/* BANNER COMPACT & ESTETIK */}
      <div className="relative w-full mb-10 overflow-hidden rounded-3xl h-32 lg:h-36 group border border-zinc-800/50">
        {/* Gambar Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
          style={{ backgroundImage: "url('/vynil.png')" }} 
        />
        
        {/* Overlay Linear */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-black/80" />

        {/* Konten Banner (Flex Row) */}
        <div className="relative z-10 h-full flex items-center justify-between px-8 lg:px-12">
          {/* Sisi Kiri: Greeting */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter">
              Halo, <span className="text-[#ef3333]">Vinylnesia!</span> 👋
            </h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">
              Kelola toko rekaman analog kamu di satu tempat
            </p>
          </div>

          {/* Sisi Kanan: Stats Mini */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/5 px-4 py-2 rounded-2xl">
              <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <span className="text-xs font-black text-white tracking-tighter">4.8</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-[#ef3333]" />
                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest leading-none">
                  Nov 2024
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Pendapatan (Bulan Ini)" value="Rp 15.4M" trend="+12.5%" isPositive={true} />
        <StatCard title="Total Pesanan" value="142" trend="+5.2%" isPositive={true} />
        <StatCard title="Pesanan Aktif" value="18" trend="-2.1%" isPositive={false} />
        <StatCard title="Produk Dilihat" value="3,421" trend="+24.8%" isPositive={true} />
      </div>

      {/* Tabel & Top Produk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabel Pesanan */}
        <div className="lg:col-span-2 bg-[#111114] border border-zinc-800 rounded-[2rem] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Pesanan Terbaru</h3>
            <button className="text-[10px] font-bold text-[#ef3333] hover:underline uppercase tracking-widest">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-600 font-black">
                  <th className="pb-4 pr-4">ID Pesanan</th>
                  <th className="pb-4 px-4">Vinyl / Kaset</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4 hidden sm:table-cell">Total</th>
                  <th className="pb-4 pl-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => (
                  <tr key={idx} className="border-b border-zinc-800/50 hover:bg-[#1a1a1e] transition-colors group">
                    <td className="py-4 pr-4 text-xs font-bold text-zinc-300">{order.id}</td>
                    <td className="py-4 px-4">
                      <p className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-[200px]">{order.product}</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase">{order.customer} • {order.date}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        order.status === 'Selesai' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                        order.status === 'Diproses' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                        'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-zinc-400 hidden sm:table-cell">{order.price}</td>
                    <td className="py-4 pl-4 text-right">
                      <button className="text-zinc-500 hover:text-[#ef3333] transition-colors"><MoreVertical size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Produk */}
        <div className="bg-[#111114] border border-zinc-800 rounded-[2rem] p-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-white mb-6">Vinyl Terlaris</h3>
          <div className="space-y-4">
            {[
              { title: "Abbey Road", artist: "The Beatles", sales: 45, img: "📀" },
              { title: "Currents", artist: "Tame Impala", sales: 38, img: "🎧" },
              { title: "Rumours", artist: "Fleetwood Mac", sales: 32, img: "📼" },
              { title: "AM", artist: "Arctic Monkeys", sales: 28, img: "💿" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1a1a1e] border border-transparent hover:border-zinc-800 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#0a0a0b] border border-zinc-800 flex items-center justify-center text-xl">{item.img}</div>
                  <div>
                    <p className="text-xs font-bold text-white">{item.title}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase">{item.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-[#ef3333]">{item.sales}</p>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase">Terjual</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 bg-[#1a1a1e] hover:bg-[#ef3333] hover:text-white text-zinc-400 font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest transition-colors border border-zinc-800 hover:border-[#ef3333]">
            Kelola Katalog
          </button>
        </div>
      </div>
    </Sidebar>
  );
}
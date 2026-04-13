"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  TrendingUp, 
  Users, 
  Store, 
  AlertTriangle, 
  Activity, 
  DollarSign, 
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";

// Komponen StatCard Reusable
const StatCard = ({ title, value, trend, isPositive, icon: Icon, colorClass }: any) => (
  <div className="bg-[#111114] p-6 rounded-4xl border border-zinc-800 hover:border-zinc-700 transition-colors shadow-sm relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass}`}>
        <Icon size={18} />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${isPositive ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20'}`}>
        <TrendingUp size={12} className={isPositive ? "" : "rotate-180"} />
        {trend}
      </div>
    </div>
    <div className="relative z-10 mt-2">
      <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{title}</h3>
    </div>
  </div>
);

export default function AdminDashboardPage() {
  // Data Dummy untuk Slicing
  const recentActivities = [
    { id: 1, type: "store_verification", title: "Registrasi Toko Baru", desc: "Vinylnesia Store menunggu verifikasi dokumen KYC.", time: "10 menit yang lalu", icon: Store, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { id: 2, type: "dispute", title: "Dispute Transaksi", desc: "Komplain pesanan ORD-2026-003 (Barang Rusak).", time: "32 menit yang lalu", icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { id: 3, type: "user_report", title: "Laporan Pengguna", desc: "Toko 'Kasetjogja' dilaporkan terkait grading tidak sesuai.", time: "1 jam yang lalu", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
    { id: 4, type: "transaction", title: "Transaksi High-Value", desc: "Pembelian sukses senilai Rp 12.500.000.", time: "2 jam yang lalu", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* BANNER HEADER */}
        <div className="relative w-full mb-10 overflow-hidden rounded-[2.5rem] p-8 lg:p-10 bg-[#111114] border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ef3333]/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#ef3333] animate-pulse"></span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ef3333]">System Status: Online</p>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter">
              Admin <span className="text-[#ef3333]">Command Center</span>
            </h1>
            <p className="text-xs text-zinc-400 font-medium mt-2 max-w-xl leading-relaxed">
              Pantau seluruh aktivitas platform Analog.id, kelola verifikasi toko, dan tangani resolusi konflik secara real-time.
            </p>
          </div>

          <div className="relative z-10 flex gap-3">
            <Link href="/admin/verifikasi" className="bg-[#1a1a1e] hover:bg-zinc-800 text-white border border-zinc-800 px-6 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all">
              <Store size={16} className="text-blue-500" />
              Verifikasi Antrean
              <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-[10px]">12</span>
            </Link>
          </div>
        </div>

        {/* STATISTIK UTAMA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Total GMV (Bulan Ini)" 
            value="Rp 1.2B" 
            trend="+24.5%" 
            isPositive={true} 
            icon={DollarSign}
            colorClass="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
          />
          <StatCard 
            title="Total Pengguna Aktif" 
            value="45,210" 
            trend="+12.2%" 
            isPositive={true} 
            icon={Users}
            colorClass="text-blue-500 bg-blue-500/10 border-blue-500/20"
          />
          <StatCard 
            title="Total Toko Terdaftar" 
            value="1,842" 
            trend="+5.4%" 
            isPositive={true} 
            icon={Store}
            colorClass="text-purple-500 bg-purple-500/10 border-purple-500/20"
          />
          <StatCard 
            title="Dispute & Resolusi" 
            value="24" 
            trend="-2.1%" 
            isPositive={false} 
            icon={ShieldAlert}
            colorClass="text-amber-500 bg-amber-500/10 border-amber-500/20"
          />
        </div>

        {/* KONTEN UTAMA: SPLIT COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: GRAFIK & LAPORAN (Slicing Placeholder) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Platform Analytics</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Volume Transaksi 7 Hari Terakhir</p>
                </div>
                <button className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                  Lihat Detail <ArrowRight size={14} />
                </button>
              </div>
              
              {/* Dummy Chart Area */}
              <div className="h-64 w-full border border-zinc-800 border-dashed rounded-3xl flex items-center justify-center bg-[#0a0a0b] relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-t from-[#ef3333]/10 to-transparent opacity-50"></div>
                <Activity size={48} className="text-zinc-800 group-hover:text-[#ef3333] transition-colors duration-500" />
                <span className="absolute bottom-4 text-[10px] font-black text-zinc-700 uppercase tracking-widest">Chart Area (Integrasi Recharts/Chart.js)</span>
              </div>
            </div>

            {/* Quick Actions Admin */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Kelola User", icon: Users, color: "text-blue-500" },
                { label: "Katalog Global", icon: Activity, color: "text-purple-500" },
                { label: "Dispute Center", icon: ShieldAlert, color: "text-amber-500" },
                { label: "Pengaturan", icon: AlertTriangle, color: "text-zinc-400" },
              ].map((action, idx) => (
                <button key={idx} className="bg-[#111114] border border-zinc-900 hover:border-zinc-700 p-6 rounded-4xl flex flex-col items-center justify-center gap-3 transition-all group">
                  <action.icon size={24} className={`${action.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[10px] font-black text-zinc-400 group-hover:text-white uppercase tracking-widest text-center leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* KOLOM KANAN: AKTIVITAS TERBARU */}
          <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-900">
              <Clock size={18} className="text-[#ef3333]" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Log Aktivitas</h3>
            </div>

            <div className="space-y-6">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-4 group cursor-pointer">
                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${activity.bg} ${activity.border} ${activity.color} group-hover:scale-110 transition-transform`}>
                    <activity.icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase tracking-tight mb-1 group-hover:text-[#ef3333] transition-colors">{activity.title}</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-medium mb-1.5 line-clamp-2">{activity.desc}</p>
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-8 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-900 rounded-xl hover:bg-[#1a1a1e] hover:text-white transition-all">
              Lihat Semua Log
            </button>
          </div>

        </div>
      </div>
    </Sidebar>
  );
}
"use client";

import React, { useEffect } from "react";
import { 
  TrendingUp, 
  Users, 
  Store, 
  AlertTriangle, 
  Activity, 
  DollarSign, 
  ArrowRight,
  ShieldAlert,
  Clock,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useAdminStore } from "@/store/adminStore";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { AdminActivityLog } from "@/types/admin";

// Komponen StatCard Reusable
const StatCard = ({ title, value, trend, isPositive, icon: Icon, colorClass, customClass = "" }: {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: any;
  colorClass: string;
  customClass?: string;
}) => (
  <div className={`bg-[#111114] p-5 md:p-6 rounded-3xl md:rounded-4xl border border-zinc-800 hover:border-zinc-700 transition-colors shadow-sm relative overflow-hidden group flex-shrink-0 ${customClass}`}>
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
      <p className="text-2xl md:text-3xl font-black text-white tracking-tighter truncate">{value}</p>
      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 truncate">{title}</h3>
    </div>
  </div>
);

// Helper untuk Icon Log Aktivitas
const getActivityConfig = (type: AdminActivityLog['type']) => {
  switch (type) {
    case "STORE_REGISTRATION":
      return { icon: Store, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", title: "Registrasi Toko Baru" };
    case "DISPUTE_TRANSACTION":
      return { icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", title: "Dispute Transaksi" };
    case "USER_REPORT":
      return { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", title: "Laporan Pengguna" };
    case "HIGH_VALUE_TRANSACTION":
      return { icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", title: "Transaksi High-Value" };
    default:
      return { icon: Activity, color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20", title: "Aktivitas Sistem" };
  }
};

export default function AdminDashboardPage() {
  const { dashboardData, fetchDashboardData, isLoading, error } = useAdminStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format Rupiah
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const summary = dashboardData?.summary;
  const chartData = dashboardData?.chart_data || [];
  const activities = dashboardData?.recent_activities || [];

  return (
      <div className="max-w-7xl mx-auto lg:px-8  pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* BANNER HEADER */}
        <div className="relative w-full mb-8 md:mb-10 overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 lg:p-10 bg-[#111114] border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ef3333]/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter">
              Admin <span className="text-[#ef3333]">Command Center</span>
            </h1>
            <p className="text-xs text-zinc-400 font-medium mt-3 max-w-xl leading-relaxed mx-auto md:mx-0">
              Pantau seluruh aktivitas platform Analog.id, kelola verifikasi toko, dan tangani resolusi konflik secara real-time.
            </p>
          </div>

          <div className="relative z-10 flex w-full md:w-auto mt-2 md:mt-0">
            <Link href="/admin/verifikasi" className="w-full md:w-auto justify-center bg-[#1a1a1e] hover:bg-zinc-800 text-white border border-zinc-800 px-6 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all">
              <Store size={16} className="text-blue-500" />
              Verifikasi Antrean
              <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-[10px]">
                {summary?.pending_verification || 0}
              </span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
            Error: {error}
          </div>
        )}

        {/* STATISTIK UTAMA - Horizontal Scroll di Mobile, Grid di Tablet/Desktop */}
        <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10 pb-4 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <StatCard 
            title="Total GMV (Bulan Ini)" 
            value={formatCurrency(Number(summary?.total_gmv || 0))} 
            trend="+24.5%" 
            isPositive={true} 
            icon={DollarSign}
            colorClass="text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            customClass="w-[85vw] sm:w-[45vw] md:w-full snap-center"
          />
          <StatCard 
            title="Total Pengguna Aktif" 
            value={(summary?.total_users || 0).toLocaleString()} 
            trend="+12.2%" 
            isPositive={true} 
            icon={Users}
            colorClass="text-blue-500 bg-blue-500/10 border-blue-500/20"
            customClass="w-[85vw] sm:w-[45vw] md:w-full snap-center"
          />
          <StatCard 
            title="Total Toko Terdaftar" 
            value={(summary?.total_stores || 0).toLocaleString()} 
            trend="+5.4%" 
            isPositive={true} 
            icon={Store}
            colorClass="text-purple-500 bg-purple-500/10 border-purple-500/20"
            customClass="w-[85vw] sm:w-[45vw] md:w-full snap-center"
          />
          <StatCard 
            title="Dispute & Resolusi" 
            value={(summary?.active_disputes || 0).toString()} 
            trend="-2.1%" 
            isPositive={false} 
            icon={ShieldAlert}
            colorClass="text-amber-500 bg-amber-500/10 border-amber-500/20"
            customClass="w-[85vw] sm:w-[45vw] md:w-full snap-center"
          />
        </div>

        {/* KONTEN UTAMA: SPLIT COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* KOLOM KIRI: GRAFIK & LAPORAN */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8 flex flex-col">
            
            {/* Grafik */}
            <div className="bg-[#111114] border border-zinc-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Platform Analytics</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Volume Transaksi 7 Hari Terakhir</p>
                </div>
                <button className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                  Lihat Detail <ArrowRight size={14} />
                </button>
              </div>
              
              <div className="h-56 md:h-72 lg:h-80 w-full rounded-2xl md:rounded-3xl bg-[#0a0a0b] p-4 relative overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef3333" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef3333" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1e" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#3f3f46" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val: string) => new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111114', border: '1px solid #27272a', borderRadius: '12px', fontSize: '10px' }}
                      itemStyle={{ color: '#ef3333', fontWeight: 'bold' }}
                      formatter={(value: any) => [formatCurrency(Number(value || 0)), "Total"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#ef3333" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions Admin - Horizontal Scroll di Mobile */}
            <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none md:grid-cols-4 gap-3 md:gap-4 pb-4 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {[
                { label: "Kelola User", icon: Users, color: "text-blue-500", path: "/admin/users" },
                { label: "Katalog Global", icon: Activity, color: "text-purple-500", path: "/admin/catalog" },
                { label: "Dispute Center", icon: ShieldAlert, color: "text-amber-500", path: "/admin/disputes" },
                { label: "Pengaturan", icon: AlertTriangle, color: "text-zinc-400", path: "/admin/settings" },
              ].map((action, idx) => (
                <Link key={idx} href={action.path} className="bg-[#111114] border border-zinc-900 hover:border-zinc-700 p-5 md:p-6 rounded-3xl md:rounded-4xl flex flex-col items-center justify-center gap-3 transition-all group min-w-[140px] md:min-w-0 snap-center shrink-0">
                  <action.icon size={24} className={`${action.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[10px] font-black text-zinc-400 group-hover:text-white uppercase tracking-widest text-center leading-tight">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* KOLOM KANAN: AKTIVITAS TERBARU */}
          <div className="bg-[#111114] border border-zinc-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 overflow-hidden h-fit flex flex-col">
            <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-zinc-900 shrink-0">
              <Clock size={18} className="text-[#ef3333]" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Log Aktivitas</h3>
            </div>

            <div className="space-y-6 max-h-[350px] md:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {activities.length > 0 ? activities.map((activity, idx) => {
                const config = getActivityConfig(activity.type);
                return (
                  <div key={idx} className="flex gap-4 group cursor-pointer">
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${config.bg} ${config.border} ${config.color} group-hover:scale-110 transition-transform`}>
                      <config.icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-white uppercase tracking-tight mb-1 group-hover:text-[#ef3333] transition-colors">
                        {config.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-medium mb-1.5 line-clamp-2">
                        {activity.message}
                      </p>
                      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                        {new Date(activity.time).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })} • Berhasil
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-10 opacity-20">
                   <Activity size={40} className="mx-auto mb-2" />
                   <p className="text-[10px] font-bold uppercase tracking-widest">Belum ada aktivitas</p>
                </div>
              )}
            </div>

            <button className="w-full mt-6 md:mt-8 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-900 rounded-xl hover:bg-[#1a1a1e] hover:text-white transition-all shrink-0">
              Lihat Semua Log
            </button>
          </div>
        </div>
      </div>
  );
}
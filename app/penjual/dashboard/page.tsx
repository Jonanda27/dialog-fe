"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, MoreVertical, Star, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";

// Import API Services
import { StoreService } from "@/services/api/store.service";
import { OrderService } from "@/services/api/order.service";
import { Order } from "@/types/order";

// Komponen StatCard (Dumb Component)
const StatCard = ({ title, value, trend, isPositive, isLoading }: { title: string, value: string, trend: string, isPositive: boolean, isLoading?: boolean }) => (
  <div className="bg-[#111114] p-6 rounded-4xl border border-zinc-800 hover:border-zinc-700 transition-colors shadow-sm relative overflow-hidden group">
    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 relative z-10">{title}</h3>
    <div className="flex items-end justify-between relative z-10">
      {isLoading ? (
        <Loader2 className="animate-spin text-zinc-600" size={24} />
      ) : (
        <p className="text-3xl font-black text-white">{value}</p>
      )}
      <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-[#ef3333]'}`}>
        <TrendingUp size={14} className={isPositive ? "" : "rotate-180"} />
        {trend}
      </div>
    </div>
  </div>
);

// Helper Fungsi Format Status
const formatStatus = (status: string) => {
  const maps: Record<string, { label: string, color: string }> = {
    'pending_payment': { label: 'Belum Bayar', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
    'paid': { label: 'Diproses', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    'processing': { label: 'Diproses', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    'shipped': { label: 'Dikirim', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    'delivered': { label: 'Tiba di Tujuan', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    'completed': { label: 'Selesai', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    'cancelled': { label: 'Dibatalkan', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  };
  return maps[status] || { label: status, color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };
};

export default function SellerDashboard() {
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState("Penjual");
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    activeOrders: 0,
    views: 3421 // Dummy fallback: Menunggu API Google Analytics / Tracker internal
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Concurrent API Fetching
        const [storeRes, walletRes, ordersRes] = await Promise.all([
          StoreService.getMyStore(),
          StoreService.getWallet(),
          OrderService.getStoreOrders()
        ]);

        // 1. Set Nama Toko
        if (storeRes.data) setStoreName(storeRes.data.name);

        const orders = ordersRes.data || [];
        const walletData = walletRes.data;

        // 2. Kalkulasi Pesanan Aktif (Paid, Processing, Shipped)
        const activeCount = orders.filter(o =>
          ['paid', 'processing', 'shipped'].includes(o.status)
        ).length;

        // 3. Update State Stats
        setStats(prev => ({
          ...prev,
          // Konversi string "2000000.00" menjadi number
          revenue: walletData?.balance ? parseFloat(walletData.balance.toString()) : 0,
          totalOrders: orders.length,
          activeOrders: activeCount
        }));

        // 4. Ambil 5 pesanan teratas
        setRecentOrders(orders.slice(0, 5));

      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="pb-8">
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
            <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              Halo, <span className="text-[#ef3333]">{loading ? "..." : storeName}!</span> 👋
            </h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">
              Kelola toko rekaman analog kamu di satu tempat
            </p>
          </div>

          {/* Sisi Kanan: Stats Mini */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/5 px-4 py-2 rounded-2xl">
              <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <span className="text-xs font-black text-white tracking-tighter">4.8</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-[#ef3333]" />
                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest leading-none">
                  {new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Pendapatan (Aktif)"
          value={`Rp ${(Number(stats.revenue) / 1000000).toFixed(1)}M`}
          trend="+12.5%"
          isPositive={true}
          isLoading={loading}
        />
        <StatCard
          title="Total Pesanan"
          value={stats.totalOrders.toString()}
          trend="+5.2%"
          isPositive={true}
          isLoading={loading}
        />
        <StatCard
          title="Pesanan Aktif"
          value={stats.activeOrders.toString()}
          trend="-2.1%"
          isPositive={false}
          isLoading={loading}
        />
        <StatCard
          title="Produk Dilihat"
          value={stats.views.toLocaleString('id-ID')}
          trend="+24.8%"
          isPositive={true}
          isLoading={loading}
        />
      </div>

      {/* Tabel & Top Produk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabel Pesanan */}
        <div className="lg:col-span-2 bg-[#111114] border border-zinc-800 rounded-4xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Pesanan Terbaru</h3>
            <Link href="/penjual/transaksi" className="text-[10px] font-bold text-[#ef3333] hover:underline uppercase tracking-widest">
              Lihat Semua
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-600 font-black">
                  <th className="pb-4 pr-4">ID Pesanan</th>
                  <th className="pb-4 px-4">Detail Produk</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4 hidden sm:table-cell">Total Harga</th>
                  <th className="pb-4 pl-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <Loader2 className="animate-spin text-zinc-600 mx-auto" size={24} />
                    </td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-zinc-500 font-bold uppercase tracking-widest">
                      Belum ada pesanan masuk
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const statusObj = formatStatus(order.status);
                    const mainItem = order.items?.[0];
                    const extraItemsCount = (order.items?.length || 1) - 1;

                    return (
                      <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-[#1a1a1e] transition-colors group">
                        <td className="py-4 pr-4 text-xs font-bold text-zinc-300 font-mono">
                          #{order.id.split('-')[0]}
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-[200px]">
                            {mainItem?.product?.name || 'Produk Tidak Diketahui'}
                            {extraItemsCount > 0 && <span className="text-zinc-500 font-medium ml-1">(+{extraItemsCount} lainnya)</span>}
                          </p>
                          {/* PERBAIKAN: Menggunakan order.buyer?.full_name sesuai kontrak Interface User */}
                          <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">
                            {order.buyer?.full_name || 'Guest'} • {new Date(order.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusObj.color}`}>
                            {statusObj.label}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-emerald-400 hidden sm:table-cell">
                          Rp {Number(order.grand_total).toLocaleString('id-ID')}
                        </td>
                        <td className="py-4 pl-4 text-right">
                          <Link href={`/penjual/transaksi/${order.id}`} className="text-zinc-500 hover:text-[#ef3333] transition-colors inline-block p-2">
                            <MoreVertical size={16} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Produk (Dummy Fallback Sementara API Analytics Belum Tersedia) */}
        <div className="bg-[#111114] border border-zinc-800 rounded-4xl p-6">
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
          <Link href="/penjual/produk/kelola_produk" className="w-full mt-6 bg-[#1a1a1e] hover:bg-[#ef3333] hover:text-white text-zinc-400 font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest transition-colors border border-zinc-800 hover:border-[#ef3333] flex justify-center items-center">
            Kelola Katalog
          </Link>
        </div>
      </div>
    </div>
  );
}
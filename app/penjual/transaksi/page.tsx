"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  Search, 
  Filter, 
  Truck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  ChevronRight,
  MessageSquare,
  PackageCheck
} from "lucide-react";

export default function TransaksiMasuk() {
  const [activeTab, setActiveTab] = useState("perlu-diproses");

  // Data Dummy Transaksi
  const transactions = [
    {
      id: "ORD-2026-001",
      customer: "Rizky Ramadhan",
      date: "08 Apr 2026, 09:15",
      product: "Pink Floyd - The Dark Side of The Moon",
      total: "Rp 965.000",
      payment: "VA BCA",
      shipping: "JNE Reguler",
      status: "perlu-diproses",
      note: "Tolong packing kayu & bubble wrap tebal ya gan."
    },
    {
      id: "ORD-2026-002",
      customer: "Siska Amelia",
      date: "07 Apr 2026, 14:20",
      product: "Daft Punk - Discovery (2LP)",
      total: "Rp 1.100.000",
      payment: "GoPay",
      shipping: "SiCepat Best",
      status: "dikirim",
      noResi: "JP982133441"
    },
    {
      id: "ORD-2026-003",
      customer: "Budi Pratama",
      date: "06 Apr 2026, 10:00",
      product: "The Beatles - Abbey Road",
      total: "Rp 850.000",
      payment: "Transfer Bank",
      shipping: "Grab Express",
      status: "selesai"
    }
  ];

  const tabs = [
    { id: "perlu-diproses", label: "Perlu Diproses", icon: Clock },
    { id: "dikirim", label: "Dalam Pengiriman", icon: Truck },
    { id: "selesai", label: "Selesai", icon: CheckCircle2 },
    { id: "dibatalkan", label: "Dibatalkan", icon: XCircle },
  ];

  return (
    <Sidebar>
      <div className="pb-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">Transaksi Masuk</h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Pantau dan kelola pesanan koleksi analog dari pembeli Anda.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-[#1a1a1e] border border-zinc-900 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all">
              <Search size={14} />
              Cari No. Pesanan
            </button>
          </div>
        </div>

        {/* TABS FILTER */}
        <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                  activeTab === tab.id 
                  ? "bg-[#ef3333] border-[#ef3333] text-white shadow-lg shadow-red-900/20" 
                  : "bg-[#111114] border-zinc-900 text-zinc-500 hover:border-zinc-700"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* LIST TRANSAKSI */}
        <div className="space-y-6">
          {transactions
            .filter(t => t.status === activeTab || activeTab === "all")
            .map((trx) => (
            <div key={trx.id} className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] overflow-hidden group hover:border-zinc-700 transition-all">
              {/* Card Header */}
              <div className="p-6 lg:px-8 border-b border-zinc-900 flex flex-wrap items-center justify-between gap-4 bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[#0a0a0b] border border-zinc-800">
                    <PackageCheck size={20} className="text-[#ef3333]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{trx.date}</p>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">{trx.id}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1e] text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-white transition-colors">
                      <MessageSquare size={14} />
                      Chat Pembeli
                   </button>
                   <button className="p-2 rounded-xl bg-[#1a1a1e] text-zinc-500 hover:text-white transition-colors">
                      <ExternalLink size={16} />
                   </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Produk Info */}
                <div className="lg:col-span-2 flex gap-6">
                  <div className="w-20 h-20 bg-[#0a0a0b] rounded-2xl border border-zinc-800 flex items-center justify-center text-3xl shadow-inner">
                    📀
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-[#ef3333] uppercase tracking-widest mb-1">{trx.customer}</p>
                    <h4 className="text-base font-black text-white uppercase tracking-tight mb-2 leading-tight">
                      {trx.product}
                    </h4>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <Truck size={14} />
                        {trx.shipping}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                        {trx.payment}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Harga & Action */}
                <div className="flex flex-col justify-center items-start lg:items-end border-t lg:border-t-0 lg:border-l border-zinc-900 pt-6 lg:pt-0 lg:pl-8">
                   <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Transaksi</p>
                   <p className="text-xl font-black text-white tracking-tight mb-4">{trx.total}</p>
                   
                   {trx.status === "perlu-diproses" && (
                     <button className="w-full lg:w-auto bg-white text-black hover:bg-[#ef3333] hover:text-white font-black px-8 py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg">
                        Proses Sekarang
                     </button>
                   )}
                   {trx.status === "dikirim" && (
                     <div className="text-right">
                       <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Nomor Resi</p>
                       <p className="text-xs font-black text-zinc-300">{trx.noResi}</p>
                     </div>
                   )}
                </div>
              </div>

              {/* Catatan Pembeli (Hanya Muncul Jika Ada) */}
              {trx.note && (
                <div className="px-8 pb-6">
                  <div className="flex items-start gap-3 bg-[#0a0a0b] border border-zinc-900 p-4 rounded-2xl">
                    <div className="text-amber-500 shrink-0 mt-0.5 italic font-black text-xs">!</div>
                    <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">
                      " {trx.note} "
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* EMPTY STATE (Contoh Jika Tidak Ada Data) */}
          {transactions.filter(t => t.status === activeTab).length === 0 && (
            <div className="py-20 text-center bg-[#111114] border border-zinc-900 border-dashed rounded-[3rem]">
              <div className="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-700">
                <PackageCheck size={32} />
              </div>
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Tidak ada pesanan</h3>
              <p className="text-[10px] text-zinc-600 font-bold uppercase mt-2">Semua transaksi di tab ini telah selesai diproses.</p>
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
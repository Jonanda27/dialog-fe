"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  Search, 
  ShieldAlert, 
  Filter, 
  Eye, 
  AlertOctagon,
  User,
  Store,
  Scale,
  FileWarning,
  MessageSquare,
  X,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Clock
} from "lucide-react";

interface Dispute {
  id: string;
  transactionId: string;
  date: string;
  buyer: string;
  seller: string;
  issue: string;
  amount: string;
  status: string;
  escrowStatus: string;
  description: string;
}

export default function DisputeAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [activeTab, setActiveTab] = useState("Investigasi");

  // Data Dummy Dispute
  const disputes: Dispute[] = [
    { 
      id: "DSP-0991", 
      transactionId: "TRX-2026-005", 
      date: "09 Apr 2026, 14:30", 
      buyer: "Eko Prasetyo", 
      seller: "Vinylnesia Store", 
      issue: "Barang Rusak / Pecah", 
      amount: "Rp 1.250.000", 
      status: "Investigasi", 
      escrowStatus: "Dibekukan",
      description: "Piringan hitam Radiohead - OK Computer yang saya terima patah menjadi dua bagian. Padahal packing luar terlihat aman. Tolong bantu refund."
    },
    { 
      id: "DSP-0990", 
      transactionId: "TRX-2026-012", 
      date: "08 Apr 2026, 09:15", 
      buyer: "Andi Wijaya", 
      seller: "Kasetjogja", 
      issue: "Tidak Sesuai Deskripsi", 
      amount: "Rp 450.000", 
      status: "Menunggu Bukti", 
      escrowStatus: "Dibekukan",
      description: "Penjual bilang kondisi pita kaset masih bagus (VG+), tapi saat diputar suaranya mendem dan pitanya keriting di side B."
    },
    { 
      id: "DSP-0989", 
      transactionId: "TRX-2026-044", 
      date: "05 Apr 2026, 16:00", 
      buyer: "Rizky Ramadhan", 
      seller: "Analog Audio", 
      issue: "Pesanan Tidak Sampai", 
      amount: "Rp 850.000", 
      status: "Selesai (Refund)", 
      escrowStatus: "Dikembalikan ke Pembeli",
      description: "Status di kurir sudah delivered sejak 3 hari lalu, tapi saya tidak pernah menerima paketnya. Kurir juga tidak bisa dihubungi."
    },
  ];

  const tabs = ["Investigasi", "Menunggu Bukti", "Selesai (Refund)", "Selesai (Diteruskan)"];

  const getStatusColor = (status: string) => {
    if (status.includes("Investigasi")) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    if (status.includes("Menunggu")) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    if (status.includes("Refund")) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (status.includes("Diteruskan")) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
  };

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <Scale className="text-purple-500" size={28} />
              Dispute & Escrow
            </h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Pusat resolusi konflik. Tangani keluhan dan ambil keputusan penahanan dana.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="text" 
              placeholder="Cari ID Dispute / Transaksi..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#111114] border border-zinc-800 rounded-2xl py-3 pl-12 pr-6 text-xs text-white focus:border-purple-500 outline-none transition-all w-full"
            />
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5">
            <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-1 flex items-center gap-2">
              <AlertOctagon size={12} /> Kasus Aktif
            </p>
            <p className="text-2xl font-black text-white tracking-tight">12</p>
          </div>
          <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Dana Dibekukan</p>
            <p className="text-xl font-black text-amber-500 tracking-tight">Rp 14.2M</p>
          </div>
          <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Selesai (Bulan Ini)</p>
            <p className="text-xl font-black text-emerald-500 tracking-tight">34</p>
          </div>
          <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-5">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Rata-rata Resolusi</p>
            <p className="text-xl font-black text-white tracking-tight">2.4 <span className="text-xs text-zinc-600">Hari</span></p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                activeTab === tab 
                ? "bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-900/20" 
                : "bg-[#111114] border-zinc-900 text-zinc-500 hover:border-zinc-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TABLE CONTENT */}
        <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1a1e]/50 border-b border-zinc-900 text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">
                  <th className="py-6 px-8">Info Dispute</th>
                  <th className="py-6 px-4">Pihak Terlibat</th>
                  <th className="py-6 px-4">Alasan / Kendala</th>
                  <th className="py-6 px-4">Status & Escrow</th>
                  <th className="py-6 px-8 text-right">Aksi Mediasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {disputes.filter(d => d.status === activeTab || activeTab === "Semua").map((dispute) => (
                  <tr key={dispute.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="py-5 px-8">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-white uppercase tracking-tight group-hover:text-purple-500 transition-colors">{dispute.id}</p>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">TRX: {dispute.transactionId}</p>
                        <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">{dispute.date}</p>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          <User size={12} className="text-blue-500" /> {dispute.buyer}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          <Store size={12} className="text-emerald-500" /> {dispute.seller}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-xs font-black text-white uppercase tracking-tight">{dispute.issue}</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Nilai: {dispute.amount}</p>
                    </td>
                    <td className="py-5 px-4">
                      <div className="space-y-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border inline-block ${getStatusColor(dispute.status)}`}>
                          {dispute.status}
                        </span>
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                          <ShieldAlert size={10} /> {dispute.escrowStatus}
                        </p>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedDispute(dispute)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white border border-purple-500/20 transition-all text-[9px] font-black uppercase tracking-widest"
                          title="Tinjau Kasus"
                        >
                          <Scale size={14} /> Tinjau
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {disputes.filter(d => d.status === activeTab).length === 0 && (
               <div className="p-20 text-center flex flex-col items-center gap-4">
                 <div className="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center text-zinc-700">
                   <ShieldAlert size={32} />
                 </div>
                 <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Tidak ada kasus di kategori ini.</p>
               </div>
            )}
          </div>
        </div>

        {/* MODAL TINJAUAN DISPUTE */}
        {selectedDispute && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedDispute(null)} />
            
            <div className="relative w-full max-w-[1000px] h-[90vh] bg-[#0a0a0b] border border-zinc-800 rounded-[2rem] sm:rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
              
              {/* Header Modal */}
              <div className="bg-[#111114] px-8 py-6 border-b border-zinc-900 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
                    <Scale size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                      Resolusi Kasus: {selectedDispute.id}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">TRX: {selectedDispute.transactionId} • {selectedDispute.date}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedDispute(null)} className="p-2 bg-[#1a1a1e] rounded-full text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Body Modal */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* Kiri: Detail Laporan */}
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-4">Detail Keluhan Pembeli</h4>
                    <div className="bg-[#111114] border border-zinc-900 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4 border-b border-zinc-900 pb-4">
                        <FileWarning className="text-amber-500" size={20} />
                        <div>
                          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Kategori Masalah</p>
                          <p className="text-sm font-black text-white uppercase tracking-tight">{selectedDispute.issue}</p>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed italic font-medium">
                        "{selectedDispute.description}"
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <ImageIcon size={14} /> Bukti Terlampir
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="aspect-square bg-[#111114] border border-zinc-800 border-dashed rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors group">
                        <ImageIcon className="text-zinc-700 group-hover:text-purple-500 transition-colors" size={32} />
                      </div>
                      <div className="aspect-square bg-[#111114] border border-zinc-800 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors group">
                         <span className="text-2xl mb-1 text-zinc-700 group-hover:text-purple-500">+</span>
                         <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-purple-500">Minta Bukti</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                      <MessageSquare size={14} /> Ruang Mediasi (Chat)
                    </p>
                    <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-tighter font-medium">
                      Admin dapat melihat riwayat percakapan antara {selectedDispute.buyer} dan {selectedDispute.seller} untuk investigasi lebih lanjut.
                    </p>
                    <button className="mt-4 w-full py-3 bg-blue-500/10 text-blue-500 font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-blue-500 hover:text-white transition-colors border border-blue-500/20">
                      Buka Log Chat
                    </button>
                  </div>
                </div>

                {/* Kanan: Panel Keputusan Admin */}
                <div className="flex flex-col">
                  <div className="bg-[#111114] border border-zinc-800 rounded-[2rem] p-6 lg:p-8 flex-1 flex flex-col">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2 pb-4 border-b border-zinc-900">
                      <AlertOctagon size={18} className="text-[#ef3333]" /> Keputusan Final Admin
                    </h4>

                    <div className="mb-8">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Nilai Dana Terkunci (Escrow)</p>
                      <p className="text-4xl font-black text-white tracking-tighter">{selectedDispute.amount}</p>
                    </div>

                    <div className="space-y-4 mt-auto">
                      <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase tracking-tight text-center mb-2">
                        Perhatian: Keputusan ini bersifat final dan akan langsung mengeksekusi dana escrow ke dompet pihak terkait.
                      </p>
                      
                      {/* Action 1: Menangkan Pembeli */}
                      <button className="w-full flex items-center justify-between bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 px-6 py-5 rounded-2xl transition-all group">
                        <div className="text-left">
                          <p className="text-xs font-black uppercase tracking-wider">Kabulkan Komplain</p>
                          <p className="text-[9px] font-bold mt-1 opacity-80 uppercase tracking-widest">Refund Dana ke Pembeli</p>
                        </div>
                        <CheckCircle2 size={24} className="opacity-50 group-hover:opacity-100" />
                      </button>

                      {/* Action 2: Menangkan Penjual */}
                      <button className="w-full flex items-center justify-between bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 px-6 py-5 rounded-2xl transition-all group">
                        <div className="text-left">
                          <p className="text-xs font-black uppercase tracking-wider">Tolak Komplain</p>
                          <p className="text-[9px] font-bold mt-1 opacity-80 uppercase tracking-widest">Teruskan Dana ke Penjual</p>
                        </div>
                        <XCircle size={24} className="opacity-50 group-hover:opacity-100" />
                      </button>

                      {/* Action 3: Netral / Info Tambahan */}
                      <button className="w-full bg-[#1a1a1e] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 px-6 py-4 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-2 mt-4">
                        <Clock size={16} /> Minta Tambahan Waktu / Bukti
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
    </Sidebar>
  );
}
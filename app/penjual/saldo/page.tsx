"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  Wallet, 
  ArrowUpRight, 
  History, 
  Banknote, 
  Info, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight
} from "lucide-react";

export default function PenarikanSaldo() {
  const [amount, setAmount] = useState("");

  // Data Dummy Riwayat Penarikan
  const withdrawalHistory = [
    { id: "WD-88210", date: "08 Apr 2026", amount: "Rp 2.500.000", bank: "BCA - 882019xxxx", status: "Selesai" },
    { id: "WD-88195", date: "02 Apr 2026", amount: "Rp 1.200.000", bank: "BCA - 882019xxxx", status: "Diproses" },
    { id: "WD-88012", date: "28 Mar 2026", amount: "Rp 5.000.000", bank: "BCA - 882019xxxx", status: "Selesai" },
  ];

  return (
    <Sidebar>
      <div className="max-w-6xl mx-auto pb-20">
        {/* HEADER */}
        <div className="mb-10">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Penarikan Saldo</h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Kelola pendapatan dari hasil penjualan vinyl dan kaset Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: SALDO & FORM */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* SALDO CARD (GLASSMORPHISM) */}
            <div className="relative overflow-hidden rounded-[2.5rem] p-10 bg-gradient-to-br from-[#ef3333] to-[#991b1b] shadow-2xl shadow-red-900/20">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 opacity-80">
                  <Wallet size={20} className="text-white" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Total Saldo Tersedia</span>
                </div>
                <h3 className="text-5xl font-black text-white tracking-tighter mb-8">
                  Rp 12.450.000
                </h3>
                <div className="flex gap-4">
                  <div className="px-4 py-2 rounded-xl bg-black/20 backdrop-blur-md border border-white/10">
                    <p className="text-[10px] font-black uppercase text-white/60 tracking-wider">Pendapatan Hari Ini</p>
                    <p className="text-sm font-black text-white">+ Rp 850.000</p>
                  </div>
                </div>
              </div>
            </div>

            {/* WITHDRAWAL FORM */}
            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Banknote size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Formulir Penarikan</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Nominal Penarikan (Rp) *</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-zinc-700 text-lg">Rp</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0" 
                      className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl pl-14 pr-5 py-5 text-xl font-black text-white focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-900" 
                    />
                  </div>
                  <div className="flex justify-between px-1">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter italic">Minimal penarikan Rp 50.000</p>
                    <button 
                      onClick={() => setAmount("12450000")}
                      className="text-[10px] font-black text-[#ef3333] uppercase tracking-tighter hover:underline"
                    >
                      Tarik Semua
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0a0a0b] border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#111114] flex items-center justify-center text-white font-black text-xs border border-zinc-800">
                      BCA
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Rekening Tujuan</p>
                      <p className="text-xs font-black text-white tracking-tight uppercase">John Doe • 882019xxxx</p>
                    </div>
                  </div>
                  <button className="text-[9px] font-black text-[#ef3333] uppercase border border-[#ef3333]/30 px-3 py-1.5 rounded-lg hover:bg-[#ef3333] hover:text-white transition-all">Ubah</button>
                </div>

                <button className="w-full bg-white hover:bg-[#ef3333] text-black hover:text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-white/5 active:scale-95 flex items-center justify-center gap-3 group">
                  Konfirmasi Penarikan
                  <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: HISTORY */}
          <div className="space-y-6">
            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <History size={18} className="text-zinc-500" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Riwayat Terakhir</h3>
                </div>
              </div>

              <div className="space-y-6">
                {withdrawalHistory.map((item) => (
                  <div key={item.id} className="relative pl-6 border-l border-zinc-900 group">
                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-zinc-800 group-hover:bg-[#ef3333] transition-colors border-2 border-[#111114]"></div>
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{item.date}</p>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        item.status === 'Selesai' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm font-black text-white mb-1">{item.amount}</p>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase">{item.bank}</p>
                  </div>
                ))}
              </div>

              <button className="w-full mt-8 py-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-900 rounded-xl hover:bg-[#1a1a1e] hover:text-white transition-all">
                Lihat Semua Riwayat
              </button>
            </div>

            {/* INFO BOX */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-6 flex gap-4">
              <Info size={20} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Informasi Penting</p>
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase tracking-tight">
                  Proses penarikan membutuhkan waktu maksimal 1x24 jam pada hari kerja. Pastikan nomor rekening sudah benar.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Sidebar>
  );
}
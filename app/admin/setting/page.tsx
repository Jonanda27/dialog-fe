"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  ShieldCheck, 
  Settings, 
  Lock, 
  Bell, 
  Database, 
  Server, 
  Save, 
  RefreshCcw,
  Activity,
  AlertCircle,
  ToggleLeft as Toggle,
  Terminal
} from "lucide-react";

export default function PlatformSettingPage() {
  const [isSaving, setIsSaving] = useState(false);

  // Data Dummy untuk Log Sistem
  const systemLogs = [
    { id: 1, event: "Database Backup", status: "Success", time: "10 Apr 2026, 04:00", type: "system" },
    { id: 2, event: "Failed Login Attempt (Admin)", status: "Warning", time: "09 Apr 2026, 23:45", type: "security" },
    { id: 3, event: "API Rate Limit Exceeded", status: "Alert", time: "09 Apr 2026, 21:10", type: "system" },
    { id: 4, event: "New Admin Added", status: "Info", time: "08 Apr 2026, 14:00", type: "security" },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Pengaturan platform berhasil diperbarui!");
    }, 1500);
  };

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="text-[#ef3333]" size={28} />
              Platform Setting
            </h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Konfigurasi parameter sistem, kebijakan keamanan, dan monitor log backend.
            </p>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-[#ef3333] hover:bg-red-700 text-white shadow-lg shadow-red-900/20 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: CONFIGURATION FORM */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Keamanan & Akses */}
            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Lock size={16} className="text-[#ef3333]" /> Kebijakan Keamanan
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#0a0a0b] border border-zinc-800 rounded-2xl">
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tight">Two-Factor Authentication (2FA)</p>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Wajibkan 2FA untuk seluruh akun admin.</p>
                  </div>
                  <div className="w-12 h-6 bg-[#ef3333] rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0a0a0b] border border-zinc-800 rounded-2xl">
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tight">Maintenance Mode</p>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Nonaktifkan akses publik untuk pembeli/penjual.</p>
                  </div>
                  <div className="w-12 h-6 bg-zinc-800 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-zinc-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Parameter Marketplace */}
            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Settings size={16} className="text-blue-500" /> Parameter Transaksi
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Biaya Layanan Escrow (IDR)</label>
                  <input type="text" defaultValue="2500" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Batas Waktu Otomatis Selesai (Hari)</label>
                  <input type="text" defaultValue="3" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Limit Penarikan Saldo Harian</label>
                  <input type="text" defaultValue="Rp 50.000.000" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Min. Verifikasi Seller (Foto)</label>
                  <input type="text" defaultValue="3" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SYSTEM LOGS & HEALTH */}
          <div className="space-y-6">
            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Server size={16} className="text-emerald-500" /> System Health
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-zinc-600">Server Latency</span>
                  <span className="text-emerald-500">24ms</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[15%]"></div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mt-4">
                  <span className="text-zinc-600">Storage Usage (S3)</span>
                  <span className="text-white">62.4 GB / 100 GB</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ef3333] w-[62%]"></div>
                </div>
              </div>
            </div>

            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Terminal size={16} className="text-zinc-500" /> Recent System Logs
              </h3>

              <div className="space-y-6">
                {systemLogs.map((log) => (
                  <div key={log.id} className="relative pl-6 border-l border-zinc-800 group">
                    <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full border-2 border-[#111114] ${
                      log.status === 'Success' ? 'bg-emerald-500' : 
                      log.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'
                    }`}></div>
                    <p className="text-[10px] font-black text-white uppercase tracking-tight">{log.event}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{log.time}</p>
                      <span className={`text-[8px] font-black uppercase tracking-tighter ${
                        log.status === 'Success' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>{log.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-8 py-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest border border-zinc-900 rounded-xl hover:bg-[#1a1a1e] hover:text-white transition-all">
                View All Logs
              </button>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-[2rem] p-6 flex gap-4">
              <Bell size={20} className="text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Backup harian</p>
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase tracking-tight">
                  Seluruh data dienkripsi dan di-backup otomatis setiap pukul 04:00 WIB ke server redundan.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Sidebar>
  );
}
"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  Store, MapPin, CreditCard, Camera, 
  Save, ShieldCheck, Globe, Phone, 
  Clock, Edit3, X, Map 
} from "lucide-react";

export default function PengaturanToko() {
  const [activeTab, setActiveTab] = useState("profil");
  const [isEditing, setIsEditing] = useState(false);

  const tabs = [
    { id: "profil", label: "Profil Toko", icon: Store },
    { id: "lokasi", label: "Lokasi & Alamat", icon: MapPin },
    { id: "rekening", label: "Rekening Bank", icon: CreditCard },
  ];

  return (
    <Sidebar>
      <div className="max-w-5xl mx-auto pb-20">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">Pengaturan Toko</h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Kelola identitas dan preferensi toko fisik maupun digital Anda.
            </p>
          </div>
          
          {/* TOGGLE EDIT BUTTON */}
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center gap-3 bg-[#1a1a1e] border border-zinc-800 hover:border-[#ef3333] text-white font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl"
            >
              <Edit3 size={16} className="text-[#ef3333]" />
              Edit Profil
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(false)}
              className="flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95"
            >
              <X size={16} />
              Batalkan
            </button>
          )}
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsEditing(false); }}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            
            {/* TAB 1: PROFIL */}
            {activeTab === "profil" && (
              <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10 space-y-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-zinc-900">
                  <div className="relative group">
                    <div className={`w-32 h-32 rounded-[2rem] bg-[#0a0a0b] border-2 flex items-center justify-center overflow-hidden transition-all ${isEditing ? "border-[#ef3333] cursor-pointer" : "border-zinc-800"}`}>
                      <img src="https://api.dicebear.com/7.x/initials/svg?seed=Vinylnesia&backgroundColor=ef3333" alt="Logo" className="w-full h-full object-cover opacity-80" />
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Camera size={24} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Branding Toko</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Identitas utama toko Anda di Analog.id</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Nama Toko</label>
                    <input disabled={!isEditing} type="text" defaultValue="Vinylnesia Store" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none disabled:opacity-50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">WhatsApp Bisnis</label>
                    <input disabled={!isEditing} type="text" defaultValue="081234567890" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none disabled:opacity-50 transition-all" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Deskripsi Toko</label>
                    <textarea disabled={!isEditing} rows={3} defaultValue="Pusat piringan hitam original berkualitas." className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-300 focus:border-[#ef3333] outline-none disabled:opacity-50 transition-all resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LOKASI & ALAMAT */}
            {activeTab === "lokasi" && (
              <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10 space-y-8 animate-fade-in">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <Map size={20} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white italic">Alamat Pengiriman & Toko Fisik</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Provinsi</label>
                    <input disabled={!isEditing} type="text" defaultValue="DKI Jakarta" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none disabled:opacity-50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Kota / Kabupaten</label>
                    <input disabled={!isEditing} type="text" defaultValue="Jakarta Selatan" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none disabled:opacity-50 transition-all" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Alamat Lengkap</label>
                    <input disabled={!isEditing} type="text" defaultValue="Jl. Melawai Raya No. 123, Blok M" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none disabled:opacity-50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Kode Pos</label>
                    <input disabled={!isEditing} type="text" defaultValue="12160" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none disabled:opacity-50 transition-all" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: REKENING */}
            {activeTab === "rekening" && (
              <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10 space-y-8 animate-fade-in">
                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#1a1a1e] to-[#0a0a0b] border border-zinc-800 relative overflow-hidden">
                   <p className="text-[9px] font-black text-[#ef3333] uppercase tracking-[0.3em] mb-4">Rekening Utama Terdaftar</p>
                   <h4 className="text-2xl font-black text-white tracking-widest mb-2">BCA • 8820 1928 33</h4>
                   <p className="text-sm font-bold text-zinc-500 uppercase">AN. VINYLNESIA RECORDS</p>
                </div>
                <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
                  <ShieldCheck size={20} className="text-blue-500 shrink-0" />
                  <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed">Pencairan saldo hanya dapat dilakukan ke rekening yang telah diverifikasi oleh tim Analog.id.</p>
                </div>
              </div>
            )}

            {/* ACTION BUTTON: HANYA MUNCUL JIKA SEDANG EDIT */}
            {isEditing && (
              <div className="flex justify-end animate-fade-in">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-3 bg-[#ef3333] hover:bg-red-700 text-white font-black px-12 py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-red-900/40"
                >
                  <Save size={18} />
                  Simpan Perubahan
                </button>
              </div>
            )}
          </div>

          {/* SIDEBAR INFO */}
          <div className="space-y-6">
            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6 border-l-4 border-[#ef3333] pl-4">Status Toko</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0a0a0b] border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Toko Buka</span>
                  </div>
                  <div className="w-10 h-5 bg-emerald-500/20 rounded-full relative border border-emerald-500/30">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0a0a0b] border border-zinc-800">
                  <div className="flex items-center gap-3 text-zinc-600">
                    <Clock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Mode Libur</span>
                  </div>
                  <div className="w-10 h-5 bg-zinc-900 rounded-full relative border border-zinc-800">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-zinc-700 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Sidebar>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore"; // Impor store Anda

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  // Ambil user langsung dari Zustand Store
  const { user: storeUser } = useAuthStore();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Sinkronisasi data dari store ke local state Navbar
    if (storeUser) {
      // Normalisasi jika storeUser masih memiliki properti .data
      const data = (storeUser as any).data ? (storeUser as any).data : storeUser;
      setUser(data);
    } else {
      // Jika di Store kosong, coba intip localStorage (untuk jaga-jaga saat refresh)
      const saved = localStorage.getItem("user");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Zustand biasanya menyimpan dalam format { state: { user: ... } } 
          // atau jika Anda simpan manual, cek bungkus .data
          const localData = parsed.state?.user || parsed.data || parsed;
          setUser(localData);
        } catch (e) {
          setUser(null);
        }
      }
    }
  }, [storeUser]); // Akan running setiap storeUser berubah

  return (
    <header className="h-20 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-zinc-400 hover:text-white transition-colors" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Search & Notif (Tetap sama) */}
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Cari sesuatu..." 
            className="bg-[#111114] border border-zinc-800 rounded-full pl-10 pr-4 py-2 text-xs font-medium text-white focus:border-[#ef3333] outline-none w-64"
          />
        </div>

        <button className="relative text-zinc-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ef3333] rounded-full border-2 border-[#0a0a0b]"></span>
        </button>

        {/* Profile Section */}
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-800 group">
          <div className="relative">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'Guest'}&backgroundColor=ef3333`} 
              alt="Profile" 
              className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 group-hover:border-[#ef3333] transition-colors"
            />
            {user && <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-[#0a0a0b]"></span>}
          </div>
          
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-white uppercase tracking-tight">
              {user?.full_name || "Guest User"}
            </p>
            <div className="text-[9px] font-bold uppercase tracking-widest flex flex-col">
              <span className={user?.role === 'admin' ? 'text-amber-500' : 'text-[#ef3333]'}>
                {user?.role || "Visitor"}
              </span>
              <span className="text-[8px] normal-case tracking-normal text-zinc-500 opacity-60">
                {user?.email || "Not signed in"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
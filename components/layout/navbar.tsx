"use client";

import React from "react";
import { Search, Bell, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  // Ambil data user secara reaktif langsung dari store. Tidak perlu useState ganda.
  const { user, isInitialized } = useAuthStore();

  return (
    <header className="h-20 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-zinc-400 hover:text-white transition-colors" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari transaksi, produk..."
            className="bg-[#111114] border border-zinc-800 rounded-full pl-10 pr-4 py-2 text-xs font-medium text-white focus:border-[#ef3333] outline-none w-64 transition-colors"
          />
        </div>

        <button className="relative text-zinc-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ef3333] rounded-full border-2 border-[#0a0a0b]"></span>
        </button>

        {/* Profile Section */}
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-800 group cursor-pointer">
          <div className="relative">
            {isInitialized && user ? (
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name}&backgroundColor=ef3333`}
                alt="Profile"
                className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 group-hover:border-[#ef3333] transition-colors"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 animate-pulse"></div>
            )}
            {user && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0a0a0b]"></span>}
          </div>

          <div className="hidden sm:block text-left">
            {isInitialized && user ? (
              <>
                <p className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-30">
                  {user.full_name}
                </p>
                <div className="text-[9px] font-bold uppercase tracking-widest flex flex-col">
                  <span className={user.role === 'admin' ? 'text-amber-500' : 'text-[#ef3333]'}>
                    {user.role}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-1 mt-1">
                <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse"></div>
                <div className="h-2 w-12 bg-zinc-800 rounded animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
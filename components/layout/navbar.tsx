"use client";

import React, { useEffect, useState } from "react";
import { Bell, Menu, Wallet, Loader2, Plus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { StoreService } from "@/services/api/store.service";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  // 1. Ambil user dari Zustand Store
  const { user: storeUser } = useAuthStore();
  const [user, setUser] = useState<any>(null);
  
  // 2. State untuk Wallet
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);

  // Sync User Data
  useEffect(() => {
    if (storeUser) {
      const data = (storeUser as any).data ? (storeUser as any).data : storeUser;
      setUser(data);
    } else {
      const saved = localStorage.getItem("user");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const localData = parsed.state?.user || parsed.data || parsed;
          setUser(localData);
        } catch (e) {
          setUser(null);
        }
      }
    }
  }, [storeUser]);

  // Fetch Wallet Data
  useEffect(() => {
    const fetchWallet = async () => {
      // Hanya fetch jika role adalah seller atau admin
      if (user?.role === 'seller' || user?.role === 'admin') {
        try {
          setIsLoadingWallet(true);
          const res = await StoreService.getWallet();
          
          if (res.data && res.data.balance) {
            // FIX: Pastikan dikonversi ke Number secara eksplisit
            const numericBalance = typeof res.data.balance === 'string' 
              ? parseFloat(res.data.balance) 
              : res.data.balance;
              
            setWalletBalance(numericBalance || 0);
          }
        } catch (error) {
          console.error("Gagal mengambil saldo dompet:", error);
        } finally {
          setIsLoadingWallet(false);
        }
      }
    };

    if (user) fetchWallet();
  }, [user]);

  return (
    <header className="h-20 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* KIRI: Mobile Menu */}
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-zinc-400 hover:text-white transition-colors" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
      </div>

      {/* KANAN: Wallet, Notif, Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* WALLET SECTION (Pengganti Search) */}
        {(user?.role === 'seller' || user?.role === 'admin') && (
          <div className="hidden md:flex items-center gap-3 bg-[#111114] border border-zinc-800 rounded-2xl px-4 py-2 group hover:border-zinc-700 transition-all">
            <div className="w-8 h-8 rounded-xl bg-[#ef3333]/10 flex items-center justify-center text-[#ef3333]">
              <Wallet size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Saldo Toko</span>
              <div className="flex items-center gap-2">
                {isLoadingWallet ? (
                  <Loader2 size={12} className="animate-spin text-zinc-600" />
                ) : (
                  <span className="text-xs font-black text-white tracking-tight">
                    {/* toLocaleString() memerlukan tipe number */}
                    Rp {walletBalance.toLocaleString('id-ID')}
                  </span>
                )}
                <button className="text-zinc-600 hover:text-[#ef3333] transition-colors">
                  <Plus size={12} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFIKASI */}
        <button className="relative text-zinc-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ef3333] rounded-full border-2 border-[#0a0a0b]"></span>
        </button>

        {/* PROFILE SECTION */}
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
            <div className="text-[9px] font-bold uppercase tracking-widest flex flex-col leading-tight">
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
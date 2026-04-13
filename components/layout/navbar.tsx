"use client";

import React, { useEffect, useState } from "react";
import { Search, Bell, Menu, Wallet, Loader2, Plus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { StoreService } from "@/services/api/store.service";
import Link from "next/link";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  // 1. Ambil data user secara reaktif langsung dari store (Logika Bersih dari HEAD)
  const { user, isInitialized } = useAuthStore();

  // 2. State untuk Wallet (Dari Cabang Incoming)
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);

  // Fetch Wallet Data dengan dependency yang aman
  useEffect(() => {
    const fetchWallet = async () => {
      // Pastikan store sudah inisialisasi dan user memiliki hak akses
      if (isInitialized && (user?.role === 'seller' || user?.role === 'admin')) {
        try {
          setIsLoadingWallet(true);
          const res = await StoreService.getWallet();

          if (res.data && res.data.balance) {
            // Konversi aman ke Number
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

    fetchWallet();
  }, [user, isInitialized]);

  return (
    <header className="h-20 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* KIRI: Mobile Menu */}
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-zinc-400 hover:text-white transition-colors" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
      </div>

      {/* KANAN: Search, Wallet, Notif, Profile */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* WALLET SECTION (Fitur dari Incoming) */}
        {(user?.role === 'seller' || user?.role === 'admin') ? (
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
                    Rp {walletBalance.toLocaleString('id-ID')}
                  </span>
                )}
                <button className="text-zinc-600 hover:text-[#ef3333] transition-colors ml-1">
                  <Plus size={12} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* SEARCH SECTION (Fallback untuk role selain seller/admin dari HEAD) */
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari transaksi, produk..."
              className="bg-[#111114] border border-zinc-800 rounded-full pl-10 pr-4 py-2 text-xs font-medium text-white focus:border-[#ef3333] outline-none w-64 transition-colors"
            />
          </div>
        )}

        {/* NOTIFIKASI */}
        <button className="relative text-zinc-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ef3333] rounded-full border-2 border-[#0a0a0b]"></span>
        </button>

        {/* PROFILE SECTION (Kombinasi Skeleton dari HEAD & Detail dari Incoming) */}
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
                <p className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[120px]">
                  {user.full_name}
                </p>
                <div className="text-[9px] font-bold uppercase tracking-widest flex flex-col leading-tight">
                  <span className={user.role === 'admin' ? 'text-amber-500' : 'text-[#ef3333]'}>
                    {user.role}
                  </span>
                  <span className="text-[8px] normal-case tracking-normal text-zinc-500 opacity-60 truncate max-w-[120px] mt-0.5">
                    {user.email}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-1 mt-1">
                <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse"></div>
                <div className="h-2 w-16 bg-zinc-800 rounded animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import { Bell, Menu, Wallet, Loader2, Plus, AlertTriangle, ChevronRight, ShoppingBag } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { StoreService } from "@/services/api/store.service";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface NavbarProps {
  onMenuClick: () => void;
}

// Interface untuk item notifikasi
interface NotificationItem {
  id: string;
  orderId: string;
  buyerName: string;
  reason?: string; // Optional karena NEW_ORDER tidak punya reason
  grandTotal?: number; // Khusus untuk NEW_ORDER
  timestamp: Date;
  type: 'DISPUTE' | 'ORDER'; // Untuk membedakan jenis notifikasi
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, isInitialized } = useAuthStore();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  
  // State untuk manajemen notifikasi
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // 1. Fetch Wallet
  useEffect(() => {
    const fetchWallet = async () => {
      if (isInitialized && user?.role === 'seller') {
        try {
          setIsLoadingWallet(true);
          const res = await StoreService.getWallet();
          if (res.data && res.data.balance) {
            const numericBalance = typeof res.data.balance === 'string'
              ? parseFloat(res.data.balance) : res.data.balance;
            setWalletBalance(numericBalance || 0);
          }
        } catch (error) {
          console.error("Gagal mengambil saldo:", error);
        } finally {
          setIsLoadingWallet(false);
        }
      }
    };
    fetchWallet();
  }, [user, isInitialized]);

  // 2. Real-time Socket Notification
  useEffect(() => {
    if (isInitialized && user?.role === 'seller') {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      // Hubungkan ke namespace /chat sesuai standar Backend
      const newSocket = io(`${baseUrl}/chat`, {
        auth: { token },
        transports: ['websocket']
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        // Bergabung ke room toko sendiri
        const sId = (user as any).store_id || (user as any).store?.id;
        if (sId) newSocket.emit("JOIN_STORE", sId);
      });

      // A. LISTENER UNTUK DISPUTE BARU
      newSocket.on("NEW_DISPUTE", (data: any) => {
        setHasNewNotification(true);
        const newNotif: NotificationItem = {
          id: data.disputeId || Math.random().toString(),
          orderId: data.orderId,
          buyerName: data.buyerName || "Pembeli",
          reason: data.reason,
          timestamp: new Date(),
          type: 'DISPUTE'
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 10));

        toast.error(`DISPUTE BARU!`, {
          description: `Pesanan #${data.orderId.substring(0, 8)} oleh ${data.buyerName}`,
          duration: 6000,
        });
      });

      // B. LISTENER UNTUK PESANAN BARU (NEW_ORDER)
      newSocket.on("NEW_ORDER", (data: any) => {
        setHasNewNotification(true);
        const newNotif: NotificationItem = {
          id: Math.random().toString(),
          orderId: data.orderId,
          buyerName: data.buyerName,
          grandTotal: data.grandTotal,
          timestamp: new Date(),
          type: 'ORDER'
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 10));

        toast.success(`PESANAN MASUK!`, {
          description: `Pesanan #${data.orderId.substring(0, 8)} dari ${data.buyerName}`,
          duration: 6000,
        });
        
        // Refresh saldo otomatis saat ada pesanan masuk
        // fetchWallet(); 
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, isInitialized]);

  return (
    <header className="h-20 bg-[#0a0a0b]/80 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-zinc-400 hover:text-white transition-colors" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {isInitialized && user?.role === 'seller' ? (
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
          <div className="hidden md:block w-64"></div>
        )}

        {/* NOTIFIKASI SECTION DENGAN DROPDOWN */}
        <div className="relative group py-2">
          <button 
            className="relative text-zinc-400 hover:text-white transition-colors p-2"
            onClick={() => setHasNewNotification(false)}
          >
            <Bell size={20} />
            {hasNewNotification && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ef3333] rounded-full border-2 border-[#0a0a0b] animate-pulse"></span>
            )}
          </button>

          {/* DROPDOWN NOTIFIKASI */}
          <div className="absolute top-full right-0 w-80 bg-[#111114] border border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl p-2 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-[150]">
            <div className="p-3 border-b border-zinc-900 mb-2 flex justify-between items-center">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Notifikasi Terkini</span>
              {notifications.length > 0 && (
                <button onClick={() => setNotifications([])} className="text-[8px] text-zinc-600 hover:text-[#ef3333] uppercase">Hapus Semua</button>
              )}
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <Link 
                    key={notif.id}
                    href={notif.type === 'DISPUTE' ? "/penjual/dispute" : "/penjual/transaksi"} 
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-900/50 group/item transition-colors border border-transparent hover:border-zinc-800"
                    onClick={() => setHasNewNotification(false)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${notif.type === 'DISPUTE' ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                      {notif.type === 'DISPUTE' ? (
                        <AlertTriangle size={14} className="text-[#ef3333]" />
                      ) : (
                        <ShoppingBag size={14} className="text-emerald-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-zinc-100 font-bold leading-tight">
                        {notif.type === 'DISPUTE' ? (
                          <>Anda mendapatkan <span className="text-[#ef3333]">Dispute</span> dari {notif.buyerName}</>
                        ) : (
                          <>Ada <span className="text-emerald-500">Pesanan Baru</span> dari {notif.buyerName}</>
                        )}
                      </p>
                      <p className="text-[9px] text-zinc-500 mt-1 truncate">
                        Order: #{notif.orderId.substring(0, 8).toUpperCase()}
                        {notif.grandTotal && ` • Rp ${notif.grandTotal.toLocaleString('id-ID')}`}
                      </p>
                      <p className="text-[8px] text-zinc-600 mt-1 uppercase font-black">
                        {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <ChevronRight size={12} className="text-zinc-700 mt-1 group-hover/item:text-white transition-colors" />
                  </Link>
                ))
              ) : (
                <div className="py-8 text-center">
                  <Bell size={24} className="mx-auto text-zinc-800 mb-2 opacity-20" />
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">Tidak ada notifikasi baru</p>
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <Link 
                href="/penjual/dashboard"
                className="block text-center py-2 mt-2 border-t border-zinc-900 text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
              >
                Lihat Dashboard
              </Link>
            )}
          </div>
        </div>

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
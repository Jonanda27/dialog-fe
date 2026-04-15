"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AuthService } from "@/services/api/auth.service"; // Pastikan path import service benar
import {
  LayoutDashboard, Package, PlusCircle, UploadCloud,
  Inbox, History, Wallet, Star, Settings, LogOut, X,
  Disc, FileBarChart, Gavel, Receipt, UserCog, ClipboardCheck,
  Loader2
} from "lucide-react";
import Navbar from "./navbar";

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 1. Integrasi Terpusat: Ambil user dan fungsi logout dari Zustand Store
  const { user, logout: clearLocalAuth, isInitialized } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // 2. Handler Logout Terintegrasi
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Langkah 1: Panggil API Logout ke Backend (untuk blacklist token/clear cookie di server)
      await AuthService.logout();
    } catch (error) {
      console.error("Gagal logout dari server:", error);
      // Tetap lanjutkan pembersihan lokal meskipun API gagal (demi keamanan sisi klien)
    } finally {
      // Langkah 2: Bersihkan state di Zustand & LocalStorage
      clearLocalAuth();
      
      // Langkah 3: Redirect ke halaman login
      router.push("/auth/login");
      setIsLoggingOut(false);
    }
  };

  // 3. Definisi Menu Berdasarkan Role
  const sellerMenu = [
    {
      title: "Ringkasan",
      items: [
        { name: "Dashboard Toko", icon: LayoutDashboard, href: "/penjual/dashboard" },
        { name: "Transaksi Masuk", icon: Inbox, href: "/penjual/transaksi" },
      ]
    },
    {
      title: "Manajemen Produk",
      items: [
        { name: "Kelola Produk", icon: Package, href: "/penjual/produk/kelola_produk" },
        { name: "Tambah Produk", icon: PlusCircle, href: "/penjual/produk/tambah_produk" },
        { name: "Bulk Upload", icon: UploadCloud, href: "/penjual/produk/bulk-upload" },
      ]
    },
    {
      title: "Laporan & Keuangan",
      items: [
        { name: "Riwayat Pesanan", icon: History, href: "/penjual/riwayat" },
        { name: "Penarikan Saldo", icon: Wallet, href: "/penjual/saldo" },
        { name: "Ulasan Toko", icon: Star, href: "/penjual/ulasan" },
      ]
    },
    {
      title: "Preferensi",
      items: [
        { name: "Pengaturan Toko", icon: Settings, href: "/penjual/pengaturan" },
      ]
    }
  ];

  const adminMenu = [
    {
      title: "MAIN MENU",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
        { name: "Seller Management", icon: UserCog, href: "/admin/seller-management" },
        { name: "Verifikasi Toko", icon: ClipboardCheck, href: "/admin/verifikasi" },
        { name: "Semua Transaksi", icon: Receipt, href: "/admin/all-transaksi" },
        { name: "Dispute & Escrow", icon: Gavel, href: "/admin/dispute" },
        { name: "Katalog Rilisan", icon: Disc, href: "/admin/katalog" },
        { name: "Laporan & Export", icon: FileBarChart, href: "/admin/laporan" },
      ]
    },
    {
      title: "SETTINGS",
      items: [
        { name: "Platform Setting", icon: Settings, href: "/admin/setting" },
      ]
    }
  ];

  const menuGroups = user?.role === "admin" ? adminMenu : sellerMenu;

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-zinc-500 font-bold tracking-widest text-xs uppercase">
        <Loader2 className="animate-spin mr-2" size={16} />
        Menyiapkan Antarmuka...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Overlay Mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Aside / Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0a0a0b] border-r border-zinc-900 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-900 shrink-0">
          <Link href="/" className="text-2xl font-black text-[#ef3333] tracking-tighter uppercase">
            Analog<span className="text-white">.id</span>
          </Link>
          <button className="lg:hidden text-zinc-400 hover:text-white" onClick={() => setIsMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Menu Render */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-black uppercase text-zinc-600 tracking-[0.2em] mb-3">{group.title}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-wider border ${isActive
                      ? "bg-[#ef3333]/10 text-[#ef3333] border-[#ef3333]/20 shadow-[0_0_15px_rgba(239,51,51,0.05)]"
                      : "text-zinc-500 border-transparent hover:bg-[#1a1a1e] hover:text-zinc-300"
                      }`}
                  >
                    <Icon size={18} className={isActive ? "text-[#ef3333]" : "text-zinc-500"} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Sidebar / Logout */}
        <div className="p-4 border-t border-zinc-900">
          <button 
            onClick={handleLogout} 
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-3 py-3 w-full rounded-xl transition-all font-bold text-xs uppercase tracking-wider text-zinc-500 hover:bg-red-900/20 hover:text-red-500 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <Loader2 size={18} className="animate-spin text-red-500" />
            ) : (
              <LogOut size={18} className="group-hover:text-red-500" />
            )}
            {isLoggingOut ? "Keluar..." : "Keluar Akun"}
          </button>
        </div>
      </aside>

      {/* Kontainer Utama */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Navbar onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
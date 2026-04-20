"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { ShieldOff, Clock, MessageCircle, LogOut } from "lucide-react";
import Link from "next/link";

export default function SuspendPage() {
  const router = useRouter();
  // Ambil user dan isInitialized untuk memastikan data sudah dimuat dari server
  const { user, logout, isInitialized } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState<string>("");
  
  // Ambil data suspensi aktif dari store
  const suspension = user?.store?.suspensions?.[0];

  useEffect(() => {
    // ⚡ LOGIKA AUTO-REFRESH SEKALI:
    // Saat pertama kali masuk dari login, terkadang state belum ter-update sempurna.
    // Kita paksa refresh sekali saja menggunakan sessionStorage sebagai flag.
    const hasRefreshed = sessionStorage.getItem("suspend_page_refreshed");
    if (!hasRefreshed) {
      sessionStorage.setItem("suspend_page_refreshed", "true");
      window.location.reload();
      return;
    }

    // Reset flag saat user keluar dari halaman ini (opsional)
    return () => {
      // sessionStorage.removeItem("suspend_page_refreshed");
    };
  }, []);

  useEffect(() => {
    // ⚡ PERBAIKAN 1: Hanya jalankan logic jika auth sudah selesai inisialisasi
    if (!isInitialized) return;

    // ⚡ FITUR AUTO-REDIRECT: Jika saat refresh status toko ternyata sudah 'approved'
    // maka pengguna tidak seharusnya di halaman ini, pindahkan ke dashboard.
    if (user?.store?.status === 'approved') {
      sessionStorage.removeItem("suspend_page_refreshed"); // Bersihkan flag
      router.push("/penjual/dashboard");
      return;
    }

    // ⚡ PERBAIKAN 2: Fokus pada timer jika data tersedia.
    if (!suspension) return;

    const timer = setInterval(() => {
      const target = new Date(suspension.suspended_until).getTime();
      const now = new Date().getTime();
      const distance = target - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft("Masa penangguhan telah berakhir.");
        // Otomatis refresh jika waktu habis agar middleware checkAndRestoreSuspension berjalan
        window.location.reload();
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}h ${hours}j ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [suspension, user, router, isInitialized]);

  const handleLogout = async () => {
    sessionStorage.removeItem("suspend_page_refreshed"); // Bersihkan flag saat logout
    await logout();
    router.push("/auth/login");
  };

  // ⚡ PERBAIKAN 3: Tampilkan loading sederhana jika data belum siap
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-[#ef3333] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center p-6 selection:bg-[#ef3333]">
      <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in zoom-in duration-700">
        
        {/* Icon & Status */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_50px_rgba(239,51,51,0.15)] animate-pulse">
            <ShieldOff size={48} className="text-[#ef3333]" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Toko Ditangguhkan</h1>
          <div className="h-1 w-20 bg-[#ef3333] mt-4 rounded-full"></div>
        </div>

        {/* Content Card */}
        <div className="bg-[#111114] border border-zinc-800 rounded-[3rem] p-8 md:p-12 shadow-2xl space-y-10">
          
          {/* Countdown Section */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center justify-center gap-2">
              <Clock size={14} /> Sisa Waktu Penangguhan
            </p>
            <div className="text-4xl md:text-5xl font-mono font-black text-white tracking-tighter">
              {timeLeft || "Menghitung..."}
            </div>
          </div>

          {/* Reason Section */}
          <div className="bg-[#1a1a1e] border border-zinc-800/50 rounded-[2rem] p-6 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ef3333] mb-3 flex items-center gap-2">
              <MessageCircle size={14} /> Alasan Penangguhan:
            </p>
            <p className="text-sm text-zinc-400 font-medium leading-relaxed italic">
              "{suspension?.reason || "Pelanggaran syarat dan ketentuan platform."}"
            </p>
          </div>

          {/* Bagian teks instruksi sudah dihapus sesuai permintaan */}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/"
            onClick={() => sessionStorage.removeItem("suspend_page_refreshed")}
            className="w-full sm:w-auto px-10 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white"
          >
            Kembali ke Beranda
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full sm:w-auto px-10 py-4 bg-red-600/10 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#ef3333] hover:bg-[#ef3333] hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={14} /> Keluar Akun
          </button>
        </div>

        <footer className="pt-10">
          <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.4em]">
            © 2026 PT Analog Indonesia • Analog Care
          </p>
        </footer>
      </div>
    </div>
  );
}
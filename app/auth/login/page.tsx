"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [role, setRole] = useState("buyer"); // Default ke buyer untuk UX yang lebih umum
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      // 1. Eksekusi Login via Zustand Store
      const userData = await login({ email, password });

      if (!userData) {
        throw new Error("Gagal mendapatkan respons data dari server.");
      }

      toast.success("Login Berhasil!");

      // 2. LOGIKA REDIRECT BERDASARKAN ROLE (Integration Protocol)
      const userRole = userData.role;

      if (userRole === "admin") {
        router.push("/admin/dashboard");
      }
      else if (userRole === "seller") {
        const store = (userData as any).store;

        // Pengecekan status toko: Jika sudah disetujui masuk dashboard, jika belum masuk pendaftaran
        if (store && store.status === "approved") {
          router.push("/penjual/dashboard");
        } else {
          router.push("/penjual/toko");
        }
      }
      else if (userRole === "buyer") {
        // ⚡ SESUAI DISKUSI: Buyer diarahkan ke Pusat Dashboard (/dashboard)
        // Halaman ini mengorkestrasi ActiveOrderTracker & ShoppingSummary
        router.push("/dashboard");
      }
      else {
        // Fallback jika role tidak terdefinisi
        router.push("/");
      }

    } catch (error: any) {
      // 3. Error Handling (Strict: No Silent Error)
      const errMsg = error.message || "Email atau password salah.";
      setErrorMsg(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#ef3333] flex flex-col">
      {/* Navigation Header */}
      <nav className="w-full py-8 flex justify-center border-b border-zinc-900 bg-[#0a0a0b] shrink-0">
        <Link href="/" className="text-3xl font-black text-[#ef3333] tracking-tighter uppercase transition-transform hover:scale-105">
          Analog<span className="text-white">.id</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center max-w-7xl mx-auto w-full px-6 py-12 gap-10 lg:gap-24">

        {/* Login Card Container */}
        <div className="w-full max-w-md animate-fade-in order-2 lg:order-1">
          <div className="bg-[#111114] border border-zinc-800 p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="text-left mb-10">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Selamat Datang</h3>
              <p className="text-xs text-zinc-500 mt-2 font-medium uppercase tracking-wider">
                Belum punya akun? <Link href="/auth/register" className="text-[#ef3333] font-bold hover:underline">Daftar</Link>
              </p>
            </div>

            <form className="space-y-5 text-left" onSubmit={handleLogin}>
              {/* Error Alert Box */}
              {errorMsg && (
                <div className="bg-red-900/30 border border-red-500/50 text-[#ef3333] px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                  {errorMsg}
                </div>
              )}

              {/* Role Selection Tabs */}
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1 mb-2 block">Masuk Sebagai</label>
                <div className="grid grid-cols-3 gap-2">
                  {["admin", "seller", "buyer"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2.5 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all ${role === r
                        ? "bg-[#ef3333] border-[#ef3333] text-white shadow-[0_0_15px_rgba(239,51,51,0.3)]"
                        : "bg-[#1a1a1e] border-zinc-800 text-zinc-500 hover:border-zinc-700"
                        }`}
                    >
                      {r === 'seller' ? 'penjual' : r === 'buyer' ? 'pembeli' : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1 mb-1 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-800 font-medium text-white"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center ml-1 mb-1">
                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Password</label>
                  <a href="#" className="text-[9px] font-bold text-zinc-500 hover:text-[#ef3333] uppercase tracking-tighter">Lupa Password?</a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-xl px-5 py-4 pr-14 text-sm focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-800 font-medium text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-[#ef3333] transition-colors font-bold text-[10px] uppercase tracking-tighter"
                  >
                    {showPassword ? "Sembunyi" : "Lihat"}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-black py-5 rounded-2xl text-xs uppercase tracking-[0.25em] shadow-lg transition-all mt-6 active:scale-95 ${isLoading
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-[#ef3333] hover:bg-red-700 text-white shadow-red-900/30"
                  }`}
              >
                {isLoading ? "Memproses..." : "Masuk Sekarang"}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-[10px] text-zinc-600 leading-relaxed uppercase font-bold tracking-tighter">
                Butuh bantuan? Hubungi <span className="text-[#ef3333] cursor-pointer hover:underline">Analog Care</span>
              </p>
            </div>
          </div>
        </div>

        {/* Visual Decoration Section */}
        <div className="hidden lg:flex flex-1 flex-col items-center text-center order-1 lg:order-2 animate-fade-in">
          <div className="relative w-100 h-87.5 mb-8 flex items-center justify-center">
            <div className="absolute w-72 h-72 rounded-full border-[25px] border-zinc-800 opacity-30"></div>
            <div className="text-[140px] z-10 filter drop-shadow-[0_0_30px_rgba(239,51,51,0.3)]">📀</div>
            <div className="absolute top-0 left-4 text-7xl opacity-40">📼</div>
            <div className="absolute bottom-4 right-4 text-5xl opacity-20">🎧</div>
          </div>

          <h2 className="text-4xl font-black uppercase tracking-tight mb-6 text-white leading-tight">
            Putar Kembali <br /> Memorimu di <br />
            <span className="text-[#ef3333]">Analog.id</span>
          </h2>
          <p className="text-zinc-500 max-w-sm leading-relaxed font-medium text-lg text-center mx-auto">
            Masuk untuk melanjutkan kurasi musik analog terbaik dan kelola koleksi fisikmu dengan mudah.
          </p>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full py-10 border-t border-zinc-900 bg-[#0a0a0b] text-center shrink-0">
        <p className="text-zinc-800 text-[11px] font-bold uppercase tracking-[0.4em]">
          © 2009-2026, PT Analog Indonesia • <span className="text-zinc-600 hover:text-[#ef3333] transition-colors cursor-pointer">Analog Care</span>
        </p>
      </footer>

      {/* Local Styles for Animation */}
      <style jsx>{`
        @keyframes fadeIn { 
            from { opacity: 0; transform: translateY(10px); } 
            to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
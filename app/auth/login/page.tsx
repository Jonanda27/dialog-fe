"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/utils/api";

export default function LoginPage() {
  const router = useRouter();

  // State Bawaan
  const [role, setRole] = useState("pembeli");
  const [showPassword, setShowPassword] = useState(false);

  // State untuk Form Integrasi
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // 1. Melakukan request login ke backend
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json(); 

      if (!response.ok) {
        throw new Error(result.message || "Terjadi kesalahan saat login");
      }

      // 2. Ambil data dari result.data yang dikirim oleh backend
      const userData = result.data.user;
      const token = result.data.token;

      // 3. Simpan kredensial ke localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // 4. Logika Redirect Berdasarkan Role & Status Store (SESUAI DATA BACKEND KAMU)
      const userRole = userData.role;

      if (userRole === "admin") {
        router.push("/admin/dashboard");
      } 
      else if (userRole === "seller" || userRole === "penjual") {
        /** * PERBAIKAN LOGIKA:
         * Menggunakan userData.store sesuai struktur JSON backend
         */
        const store = userData.store;
        
        if (store && store.status === "approved") {
          // Jika toko ada dan sudah disetujui
          router.push("/penjual/dashboard");
        } else {
          // Jika toko belum ada atau masih pending
          router.push("/penjual/Toko");
        }
      } 
      else if (userRole === "buyer" || userRole === "pembeli") {
        router.push("/pembeli/dashboard");
      } 
      else {
        router.push("/");
      }
      
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#ef3333] flex flex-col">
      
      {/* 1. NAVBAR (LOGO CENTERED) */}
      <nav className="w-full py-8 flex justify-center border-b border-zinc-900 bg-[#0a0a0b] shrink-0">
        <Link href="/" className="text-3xl font-black text-[#ef3333] tracking-tighter uppercase transition-transform hover:scale-105">
          Analog<span className="text-white">.id</span>
        </Link>
      </nav>

      {/* 2. MAIN CONTENT (TWO COLUMNS - FORM ON LEFT) */}
      <main className="flex-1 flex items-center justify-center max-w-7xl mx-auto w-full px-6 py-12 gap-10 lg:gap-24">
        
        {/* LEFT COLUMN: LOGIN CARD */}
        <div className="w-full max-w-[450px] animate-fade-in order-2 lg:order-1">
          <div className="bg-[#111114] border border-zinc-800 p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="text-left mb-10">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Selamat Datang</h3>
              <p className="text-xs text-zinc-500 mt-2 font-medium uppercase tracking-wider">
                Belum punya akun? <Link href="/auth/register" className="text-[#ef3333] font-bold hover:underline">Daftar</Link>
              </p>
            </div>

            <form className="space-y-5 text-left" onSubmit={handleLogin}>
              
              {/* Alert Error Message */}
              {errorMsg && (
                <div className="bg-red-900/30 border border-red-500/50 text-[#ef3333] px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                  {errorMsg}
                </div>
              )}

              {/* Role Selection (Hanya Visual UI) */}
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1 mb-2 block font-bold">Masuk Sebagai</label>
                <div className="grid grid-cols-3 gap-2">
                  {["admin", "penjual", "pembeli"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2.5 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all ${
                        role === r 
                        ? "bg-[#ef3333] border-[#ef3333] text-white shadow-[0_0_15px_rgba(239,51,51,0.3)]" 
                        : "bg-[#1a1a1e] border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1 mb-1 block font-bold">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda" 
                  className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-800 font-medium text-white" 
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center ml-1 mb-1">
                    <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest font-bold">Password</label>
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

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full font-black py-5 rounded-2xl text-xs uppercase tracking-[0.25em] shadow-lg transition-all mt-6 active:scale-95 ${
                  loading 
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                    : "bg-[#ef3333] hover:bg-red-700 text-white shadow-red-900/30"
                }`}
              >
                {loading ? "Memproses..." : "Masuk Sekarang"}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-[10px] text-zinc-600 leading-relaxed uppercase font-bold tracking-tighter">
                Butuh bantuan? Hubungi <span className="text-[#ef3333] cursor-pointer hover:underline">Analog Care</span>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: VISUAL CONTENT */}
        <div className="hidden lg:flex flex-1 flex-col items-center text-center order-1 lg:order-2 animate-fade-in">
          <div className="relative w-[400px] h-[350px] mb-8 flex items-center justify-center">
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

      {/* 3. FOOTER */}
      <footer className="w-full py-10 border-t border-zinc-900 bg-[#0a0a0b] text-center shrink-0">
        <p className="text-zinc-800 text-[11px] font-bold uppercase tracking-[0.4em]">
          © 2009-2026, PT Analog Indonesia • <span className="text-zinc-600 hover:text-[#ef3333] transition-colors cursor-pointer">Analog Care</span>
        </p>
      </footer>

      <style>{`
        @keyframes fadeIn { 
            from { opacity: 0; transform: translateY(10px); } 
            to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
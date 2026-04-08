"use client";

import React, { useState } from "react";
import Link from "next/link";
// --- IMPORT BASE URL SAJA ---
import { API_BASE_URL } from "@/utils/api"; 

export default function RegisterPage() {
  const [role, setRole] = useState("pembeli");
  const [showPassword, setShowPassword] = useState(false);

  // --- STATE UNTUK INTEGRASI ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // --- FUNGSI REGISTER ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // MENGGABUNGKAN BASE URL DENGAN ENDPOINT SECARA MANUAL
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Registrasi berhasil! Silakan login." });
        setName("");
        setEmail("");
        setPassword("");
      } else {
        setMessage({ type: "error", text: data.message || "Gagal melakukan registrasi." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Gagal terhubung ke server. Pastikan backend menyala." });
    } finally {
      setIsLoading(false);
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

      {/* 2. MAIN CONTENT (TWO COLUMNS) */}
      <main className="flex-1 flex items-center justify-center max-w-7xl mx-auto w-full px-6 py-12 gap-10 lg:gap-24">
        
        {/* LEFT COLUMN: VISUAL CONTENT (STATIC) */}
        <div className="hidden lg:flex flex-1 flex-col items-center text-center animate-fade-in">
          <div className="relative w-[400px] h-[350px] mb-8 flex items-center justify-center">
            <div className="absolute w-72 h-72 rounded-full border-[25px] border-zinc-800 opacity-30"></div>
            <div className="text-[140px] z-10 filter drop-shadow-[0_0_30px_rgba(239,51,51,0.3)]">📀</div>
            <div className="absolute top-0 right-4 text-7xl opacity-40">📼</div>
            <div className="absolute bottom-4 left-4 text-5xl opacity-20">🎧</div>
          </div>

          <h2 className="text-4xl font-black uppercase tracking-tight mb-6 text-white leading-tight">
            Jual Beli Analog <br /> Mudah Hanya di <br />
            <span className="text-[#ef3333]">Analog.id</span>
          </h2>
          <p className="text-zinc-500 max-w-sm leading-relaxed font-medium text-lg">
            Gabung sekarang dan temukan kemudahan bertransaksi rilisan fisik langka di komunitas analog terbesar.
          </p>
        </div>

        {/* RIGHT COLUMN: REGISTER CARD */}
        <div className="w-full max-w-[450px] animate-fade-in">
          <div className="bg-[#111114] border border-zinc-800 p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Daftar Sekarang</h3>
              <p className="text-xs text-zinc-500 mt-2 font-medium uppercase tracking-wider">
                Sudah punya akun? <Link href="/auth/login" className="text-[#ef3333] font-bold hover:underline">Masuk</Link>
              </p>
            </div>

            {/* NOTIFICATION MESSAGE */}
            {message.text && (
              <div className={`mb-5 p-4 rounded-xl text-xs font-bold uppercase tracking-wider text-center ${
                message.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-[#ef3333] border border-red-500/20"
              }`}>
                {message.text}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleRegister}>
              {/* Role Selection */}
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1 mb-2 block">Daftar Sebagai</label>
                <div className="grid grid-cols-2 gap-3">
                  {["penjual", "pembeli"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all ${
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

              {/* Nama Lengkap */}
              <div>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap" 
                  className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-700" 
                />
              </div>

              {/* Email */}
              <div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email" 
                  className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-700" 
                />
              </div>

              {/* Password */}
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" 
                  className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-xl px-5 py-4 pr-14 text-sm focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-700" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ef3333] hover:bg-red-700 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-900/20 transition-all mt-4 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Memproses..." : "Daftar"}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-[10px] text-zinc-600 leading-relaxed max-w-[280px] mx-auto uppercase font-bold tracking-tighter">
                Dengan mendaftar, saya menyetujui <br />
                <span className="text-[#ef3333] cursor-pointer hover:underline">Syarat & Ketentuan</span> serta <span className="text-[#ef3333] cursor-pointer hover:underline">Kebijakan Privasi</span> Analog.id.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="w-full py-10 border-t border-zinc-900 bg-[#0a0a0b] text-center shrink-0">
        <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-widest">
          © 2009-2026, PT Analog Indonesia • <span className="text-[#ef3333] hover:underline cursor-pointer">Analog Care</span>
        </p>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
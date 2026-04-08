"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/utils/api"; 

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("buyer"); 
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // --- VALIDASI CLIENT-SIDE ---
    if (password.length < 8) {
      setMessage({ 
        type: "error", 
        text: "Password minimal harus 8 karakter!" 
      });
      return; // Berhenti di sini, tidak lanjut ke fetch
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          password: password,
          role: role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: data.message || "Registrasi berhasil! Mengalihkan ke halaman login..." 
        });
        
        setFullName("");
        setEmail("");
        setPassword("");

        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);

      } else {
        const errorMsg = Array.isArray(data.message) 
          ? data.message.join(", ") 
          : data.message;
          
        setMessage({ 
          type: "error", 
          text: errorMsg || "Gagal melakukan registrasi." 
        });
      }
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "Gagal terhubung ke server. Pastikan backend menyala." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#ef3333] flex flex-col">
      <nav className="w-full py-8 flex justify-center border-b border-zinc-900 bg-[#0a0a0b] shrink-0">
        <Link href="/" className="text-3xl font-black text-[#ef3333] tracking-tighter uppercase transition-transform hover:scale-105">
          Analog<span className="text-white">.id</span>
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center max-w-7xl mx-auto w-full px-6 py-12 gap-10 lg:gap-24">
        <div className="hidden lg:flex flex-1 flex-col items-center text-center animate-fade-in">
          <div className="relative w-[400px] h-[350px] mb-8 flex items-center justify-center">
            <div className="absolute w-72 h-72 rounded-full border-[25px] border-zinc-800 opacity-30"></div>
            <div className="text-[140px] z-10 filter drop-shadow-[0_0_30px_rgba(239,51,51,0.3)]">📀</div>
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tight mb-6 text-white leading-tight">
            Jual Beli Analog <br /> Mudah Hanya di <br />
            <span className="text-[#ef3333]">Analog.id</span>
          </h2>
        </div>

        <div className="w-full max-w-[450px] animate-fade-in">
          <div className="bg-[#111114] border border-zinc-800 p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Daftar Sekarang</h3>
              <p className="text-xs text-zinc-500 mt-2 font-medium uppercase tracking-wider">
                Sudah punya akun? <Link href="/auth/login" className="text-[#ef3333] font-bold hover:underline">Masuk</Link>
              </p>
            </div>

            {message.text && (
              <div className={`mb-5 p-4 rounded-xl text-xs font-bold uppercase tracking-wider text-center ${
                message.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-[#ef3333] border border-red-500/20"
              }`}>
                {message.text}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleRegister}>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1 mb-2 block">Daftar Sebagai</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "PENJUAL", value: "seller" },
                    { label: "PEMBELI", value: "buyer" }
                  ].map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all ${
                        role === r.value 
                        ? "bg-[#ef3333] border-[#ef3333] text-white shadow-[0_0_15px_rgba(239,51,51,0.3)]" 
                        : "bg-[#1a1a1e] border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Lengkap" 
                  className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-700 text-white" 
                />
              </div>

              <div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email" 
                  className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-700 text-white" 
                />
              </div>

              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (Min. 8 Karakter)" 
                  className={`w-full bg-[#1a1a1e] border rounded-xl px-5 py-4 pr-14 text-sm outline-none transition-all placeholder:text-zinc-700 text-white ${
                    password.length > 0 && password.length < 8 ? "border-red-500" : "border-zinc-800 focus:border-[#ef3333]"
                  }`} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
                {password.length > 0 && password.length < 8 && (
                   <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold uppercase tracking-tight">Terlalu pendek!</p>
                )}
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ef3333] hover:bg-red-700 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-900/20 transition-all mt-4 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Memproses..." : "Daftar"}
              </button>
            </form>
          </div>
        </div>
      </main>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import TransactionTable from "@/components/wallet/TransactionTable";
import { API_BASE_URL } from "@/utils/api"; 
import { 
  Loader2, 
  Wallet, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  AlertCircle, 
  X, 
  CheckCircle2,
  ArrowDownCircle
} from "lucide-react";

export default function SaldoToko() {
  const [walletData, setWalletData] = useState<{ balance: number, transactions: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  // --- STATE WITHDRAW ---
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const adminFee = 2500; // Contoh biaya admin standar e-commerce

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  };

  const fetchWalletFromProfile = async () => {
    try {
      const token = localStorage.getItem("token") || getCookie("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const result = await res.json();
      if (result.success) {
        const storeInfo = result.data?.store;
        setWalletData({
          balance: parseFloat(storeInfo?.balance || "0"),
          transactions: storeInfo?.transactions || [] 
        });
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletFromProfile();
  }, []);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(withdrawAmount) > (walletData?.balance || 0)) {
        alert("Saldo tidak mencukupi!");
        return;
    }
    setIsProcessing(true);
    
    // Simulasi Proses API
    setTimeout(() => {
        alert(`Permintaan penarikan sebesar Rp ${Number(withdrawAmount).toLocaleString('id-ID')} berhasil diajukan!`);
        setIsProcessing(false);
        setIsWithdrawOpen(false);
        setWithdrawAmount("");
    }, 2000);
  };

  return (
    <Sidebar>
      <div className="max-w-5xl mx-auto pb-20">
        <div className="mb-10">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Dompet & Saldo</h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Pantau pendapatan hasil penjualan dan tarik dana ke rekening pribadi Anda.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#ef3333]" size={32} /></div>
        ) : !walletData ? (
          <div className="text-center py-20 bg-[#111114] rounded-[2.5rem] border border-zinc-900 text-zinc-500 uppercase text-[10px] font-black">Gagal memuat data</div>
        ) : (
          <div className="space-y-8">

            {/* WIDGET SALDO AKTIF */}
            <div className="bg-gradient-to-br from-[#ef3333] to-[#801010] border border-red-900/50 rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden shadow-2xl shadow-red-900/20">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Wallet size={160} />
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                  <div className="flex items-center gap-2 text-red-200 mb-4">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Saldo Tersedia</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xl font-bold text-red-200 mt-2">Rp</span>
                    <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter">
                      {walletData.balance.toLocaleString('id-ID')}
                    </h1>
                  </div>
                </div>

                <button
                  onClick={() => setIsWithdrawOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-white text-red-950 px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-zinc-200 active:scale-95 shadow-xl shadow-black/20"
                >
                  Tarik Dana <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* TABEL MUTASI TRANSAKSI */}
            <TransactionTable transactions={walletData.transactions} />
          </div>
        )}
      </div>

      {/* --- MODAL WITHDRAW (E-COMMERCE STYLE) --- */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsWithdrawOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-[#111114] border border-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-zinc-900 flex items-center justify-between">
                <h3 className="text-lg font-black uppercase tracking-tight text-white">Penarikan Dana</h3>
                <button onClick={() => setIsWithdrawOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="p-8 space-y-6">
                {/* Info Rekening */}
                <div className="bg-[#0a0a0b] border border-zinc-800 rounded-3xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#ef3333]">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Rekening Tujuan</p>
                        <p className="text-xs font-black text-white uppercase">Bank Central Asia (BCA)</p>
                        <p className="text-[10px] font-medium text-zinc-500">8820 **** 1234 — A/N JONANDA</p>
                    </div>
                </div>

                {/* Input Nominal */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Nominal Penarikan</label>
                        <button 
                            type="button"
                            onClick={() => setWithdrawAmount(walletData?.balance.toString() || "0")}
                            className="text-[10px] font-black text-[#ef3333] uppercase"
                        > Tarik Semua </button>
                    </div>
                    <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-zinc-500 text-sm">Rp</span>
                        <input 
                            type="number"
                            required
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl py-5 pl-12 pr-6 text-xl font-black text-white focus:border-[#ef3333] outline-none transition-all"
                        />
                    </div>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase px-1">
                        Saldo Tersedia: <span className="text-zinc-400">Rp {walletData?.balance.toLocaleString('id-ID')}</span>
                    </p>
                </div>

                {/* Ringkasan */}
                <div className="bg-zinc-900/30 rounded-3xl p-6 space-y-3">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
                        <span>Potongan Admin</span>
                        <span>Rp {adminFee.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Total Diterima</span>
                        <span className="text-lg font-black text-emerald-500">
                            Rp {Math.max(0, (Number(withdrawAmount) - adminFee)).toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>

                {/* Warning */}
                <div className="flex gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                    <AlertCircle size={14} className="text-blue-500 shrink-0" />
                    <p className="text-[9px] text-zinc-500 font-medium leading-relaxed uppercase">
                        Proses penarikan membutuhkan waktu <span className="text-blue-400">1-3 hari kerja</span> tergantung bank tujuan.
                    </p>
                </div>

                {/* Submit */}
                <button 
                    type="submit"
                    disabled={isProcessing || !withdrawAmount || Number(withdrawAmount) < 10000}
                    className="w-full bg-[#ef3333] hover:bg-red-700 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-red-900/30 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none flex items-center justify-center gap-3"
                >
                    {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <ArrowDownCircle size={16} />}
                    {isProcessing ? "Memproses..." : "Konfirmasi Penarikan"}
                </button>
            </form>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
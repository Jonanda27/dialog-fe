"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import TransactionTable from "@/components/wallet/TransactionTable";
import { Loader2, Wallet, ArrowRight, ShieldCheck } from "lucide-react";

export default function SaldoToko() {
  const [walletData, setWalletData] = useState<{ balance: number, transactions: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
  };

  const fetchWallet = async () => {
    try {
      const token = getCookie("token");
      // Asumsi rute endpoint: GET /stores/wallet
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setWalletData(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Gagal memuat saldo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  return (
    <Sidebar>
      <div className="max-w-5xl mx-auto pb-20">
        <div className="mb-10">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Dompet & Saldo</h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Pantau pendapatan hasil penjualan, biaya grading, dan penarikan dana.
          </p>
        </div>

        {loading || !walletData ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#ef3333]" size={32} /></div>
        ) : (
          <div className="space-y-8">

            {/* WIDGET SALDO AKTIF */}
            <div className="bg-linear-to-br from-[#ef3333] to-[#801010] border border-red-900/50 rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden shadow-2xl shadow-red-900/20">
              {/* Ornamen Grafis */}
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Wallet size={160} />
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                  <div className="flex items-center gap-2 text-red-200 mb-4">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Saldo Aktif (Escrow Released)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xl font-bold text-red-200 mt-2">Rp</span>
                    <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter">
                      {Number(walletData.balance).toLocaleString('id-ID')}
                    </h1>
                  </div>
                </div>

                <button
                  onClick={() => alert("Fitur Penarikan (Withdraw) sedang dalam tahap pengembangan.")}
                  className="inline-flex items-center justify-center gap-2 bg-white text-red-950 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-zinc-200 active:scale-95 whitespace-nowrap"
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
    </Sidebar>
  );
}
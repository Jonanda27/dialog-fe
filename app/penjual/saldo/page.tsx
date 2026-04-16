"use client";

import React, { useState, useEffect } from "react";
import TransactionTable from "@/components/wallet/TransactionTable";
import { StoreService } from "@/services/api/store.service";
import { StoreWalletResponse, Store, BankAccountPayload } from "@/types/store";
import { INDONESIAN_BANKS } from "@/utils/bankName"; // <-- IMPORT DAFTAR BANK DI SINI
import { 
  Loader2, 
  Wallet, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  AlertCircle, 
  X,
  ArrowDownCircle,
  Landmark,
  Save
} from "lucide-react";

export default function SaldoToko() {
  const [walletData, setWalletData] = useState<StoreWalletResponse | null>(null);
  const [storeData, setStoreData] = useState<Store | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // --- STATE WITHDRAW ---
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const adminFee = 2500; 

  // --- STATE BANK SETUP ---
  const [isBankSetupOpen, setIsBankSetupOpen] = useState<boolean>(false);
  const [isBankProcessing, setIsBankProcessing] = useState<boolean>(false);
  const [bankForm, setBankForm] = useState<BankAccountPayload>({
    bank_name: "",
    bank_account_number: "",
    bank_account_name: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, storeRes] = await Promise.all([
        StoreService.getWallet(),
        StoreService.getMyStore()
      ]);
      
      if (walletRes.success && walletRes.data) {
        setWalletData(walletRes.data);
      }
      if (storeRes.success && storeRes.data) {
        setStoreData(storeRes.data);
      }
    } catch (error) {
      console.error("Gagal memuat data dompet/toko:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenWithdraw = () => {
    if (!storeData?.bank_account_number) {
      setIsBankSetupOpen(true);
    } else {
      setIsWithdrawOpen(true);
    }
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBankProcessing(true);
    try {
      const res = await StoreService.createBankAccount(bankForm);
      if (res.success) {
        alert("Rekening berhasil disimpan!");
        setIsBankSetupOpen(false);
        await fetchData(); 
        setIsWithdrawOpen(true); 
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || "Terjadi kesalahan saat menyimpan rekening.");
    } finally {
      setIsBankProcessing(false);
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountToWithdraw = Number(withdrawAmount);

    if (amountToWithdraw > Number(walletData?.balance || 0)) {
        alert("Saldo tidak mencukupi!");
        return;
    }

    setIsProcessing(true);
    
    setTimeout(() => {
        alert(`Permintaan penarikan sebesar Rp ${amountToWithdraw.toLocaleString('id-ID')} ke rekening ${storeData?.bank_name} berhasil diajukan!`);
        setIsProcessing(false);
        setIsWithdrawOpen(false);
        setWithdrawAmount("");
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 pb-20">
      <div className="mb-10">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">Dompet & Saldo</h2>
        <p className="text-sm text-zinc-500 font-medium mt-1">
          Pantau pendapatan hasil penjualan dan tarik dana ke rekening pribadi Anda.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#ef3333]" size={32} />
        </div>
      ) : !walletData ? (
        <div className="text-center py-20 bg-[#111114] rounded-[2.5rem] border border-zinc-900 text-zinc-500 uppercase text-[10px] font-black">
          Gagal memuat data
        </div>
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
                    {Number(walletData.balance).toLocaleString('id-ID')}
                  </h1>
                </div>
              </div>

              <button
                onClick={handleOpenWithdraw}
                className="inline-flex items-center justify-center gap-2 bg-white text-red-950 px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-zinc-200 active:scale-95 shadow-xl shadow-black/20"
              >
                Tarik Dana <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <TransactionTable transactions={walletData.transactions} />
        </div>
      )}

      {/* --- MODAL SETUP REKENING BANK --- */}
      {isBankSetupOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsBankSetupOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-[#111114] border border-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-zinc-900 flex items-center justify-between">
                <h3 className="text-lg font-black uppercase tracking-tight text-white">Atur Rekening</h3>
                <button onClick={() => setIsBankSetupOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleBankSubmit} className="p-8 space-y-6">
                <div className="flex gap-3 p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl mb-6">
                    <AlertCircle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-zinc-400 font-medium leading-relaxed uppercase tracking-wide">
                        <strong className="text-yellow-500 block mb-1">Rekening Pencairan Belum Diatur</strong>
                        Anda harus mengatur rekening bank tujuan terlebih dahulu sebelum dapat melakukan penarikan dana.
                    </p>
                </div>

                <div className="space-y-4">
                  
                  {/* === PERUBAHAN ADA DI SINI: INPUT DIUBAH MENJADI SELECT === */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1 mb-2 block">Nama Bank</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"><Landmark size={18} /></span>
                      <select 
                        required
                        value={bankForm.bank_name}
                        onChange={(e) => setBankForm({...bankForm, bank_name: e.target.value})}
                        className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>-- Pilih Bank Tujuan --</option>
                        {INDONESIAN_BANKS.map((bank) => (
                          <option key={bank.code} value={bank.name}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                      {/* Panah Dropdown Custom */}
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  {/* ========================================================== */}

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1 mb-2 block">Nomor Rekening</label>
                    <input 
                      type="number"
                      required
                      value={bankForm.bank_account_number}
                      onChange={(e) => setBankForm({...bankForm, bank_account_number: e.target.value})}
                      placeholder="Masukkan nomor rekening valid"
                      className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl py-4 px-5 text-sm font-bold text-white focus:border-[#ef3333] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1 mb-2 block">Nama Pemilik Rekening</label>
                    <input 
                      type="text"
                      required
                      value={bankForm.bank_account_name}
                      onChange={(e) => setBankForm({...bankForm, bank_account_name: e.target.value})}
                      placeholder="Sesuai buku tabungan"
                      className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl py-4 px-5 text-sm font-bold text-white focus:border-[#ef3333] outline-none transition-all uppercase"
                    />
                  </div>
                </div>

                <button 
                    type="submit"
                    disabled={isBankProcessing || !bankForm.bank_name || !bankForm.bank_account_number || !bankForm.bank_account_name}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-3 mt-4"
                >
                    {isBankProcessing ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {isBankProcessing ? "Menyimpan..." : "Simpan Rekening & Lanjut"}
                </button>
            </form>
          </div>
        </div>
      )}

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
                <div className="bg-[#0a0a0b] border border-zinc-800 rounded-3xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#ef3333]">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Rekening Tujuan</p>
                        <p className="text-xs font-black text-white uppercase mt-1">{storeData?.bank_name}</p>
                        <p className="text-[10px] font-medium text-zinc-500 mt-0.5">
                            {storeData?.bank_account_number} — A/N {storeData?.bank_account_name}
                        </p>
                    </div>
                </div>

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
                    <div className="flex justify-between items-center px-1">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase">
                            Saldo Tersedia: <span className="text-zinc-400">Rp {Number(walletData?.balance || 0).toLocaleString('id-ID')}</span>
                        </p>
                    </div>
                </div>

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

                <div className="flex gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                    <AlertCircle size={14} className="text-blue-500 shrink-0" />
                    <p className="text-[9px] text-zinc-500 font-medium leading-relaxed uppercase">
                       Proses penarikan membutuhkan waktu <span className="text-blue-400">1-3 hari kerja</span> tergantung bank tujuan.
                    </p>
                </div>

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
    </div>
  );
}
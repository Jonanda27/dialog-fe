'use client';

import React, { useState, useEffect } from "react";
import { Plus, CreditCard, Loader2, X, Landmark, Edit3, ShieldCheck } from "lucide-react";
import { UserBankService } from "@/services/api/bank.service"; 
import { UserBankAccount, CreateUserBankPayload } from "@/types/userBank";
import { toast } from "sonner";

export default function BankKartuPage() {
    const [banks, setBanks] = useState<UserBankAccount[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // State untuk form tambah bank [cite: 1575]
    const [formData, setFormData] = useState<CreateUserBankPayload>({
        bank_name: "",
        bank_account_number: "",
        bank_account_name: ""
    });

    // 1. Ambil data rekening [cite: 223, 1576]
    const fetchBanks = async () => {
        try {
            setIsFetching(true);
            const response = await UserBankService.getMyBanks();
            if (response.success && response.data) {
                setBanks(response.data);
            }
        } catch (error) {
            console.error("Gagal memuat daftar bank:", error);
            toast.error("Gagal mengambil data rekening");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, []);

    // 2. Fungsi Tambah Rekening (Hanya jika belum ada) [cite: 222, 1575]
    const handleAddBank = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.bank_name || !formData.bank_account_number || !formData.bank_account_name) {
            return toast.error("Semua field wajib diisi");
        }

        try {
            setIsSubmitting(true);
            const response = await UserBankService.addBank(formData);
            
            if (response.success) {
                toast.success("Rekening berhasil ditambahkan");
                setFormData({ bank_name: "", bank_account_number: "", bank_account_name: "" });
                setShowAddModal(false);
                fetchBanks(); 
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menambah rekening");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* HEADER SECTION */}
            <div className="mb-10 border-b border-zinc-900 pb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Bank & Kartu</h2>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Kelola satu rekening utama untuk pencairan dana</p>
                </div>

                {/* LOGIKA BUTTON: Tampilkan Tambah jika kosong, tampilkan Ubah jika sudah ada data */}
                {!isFetching && (
                    banks.length === 0 ? (
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#ef3333] hover:text-white transition-all flex items-center gap-2 active:scale-95"
                        >
                            <Plus size={14} /> Tambah Rekening
                        </button>
                    ) : (
                        <button 
                            onClick={() => toast.info("Fitur ubah akan segera hadir")}
                            className="px-6 py-3 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-700 hover:text-white transition-all flex items-center gap-2 active:scale-95"
                        >
                            <Edit3 size={14} /> Ubah Rekening
                        </button>
                    )
                )}
            </div>

            {/* CONTENT AREA */}
            {isFetching ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-[#ef3333]" size={32} />
                </div>
            ) : banks.length > 0 ? (
                <div className="max-w-md">
                    {/* UI DETAIL KARTU REKENING */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1e] to-[#0a0a0b] border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl transition-all hover:border-[#ef3333]/30">
                        {/* Chip & Logo Section */}
                        <div className="flex justify-between items-start mb-12">
                            <div className="w-12 h-9 bg-gradient-to-br from-yellow-500/20 to-yellow-600/40 rounded-md border border-yellow-500/20 flex items-center justify-center">
                                <div className="grid grid-cols-2 gap-1 px-1">
                                    <div className="w-2 h-1.5 bg-yellow-500/30 rounded-sm"></div>
                                    <div className="w-2 h-1.5 bg-yellow-500/30 rounded-sm"></div>
                                    <div className="w-2 h-1.5 bg-yellow-500/30 rounded-sm"></div>
                                    <div className="w-2 h-1.5 bg-yellow-500/30 rounded-sm"></div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-[#ef3333] uppercase tracking-[0.2em] ">AnalogID Wallet</p>
                                <p className="text-[14px] font-black text-white uppercase mt-1">{banks[0].bank_name}</p>
                            </div>
                        </div>

                        {/* Card Number (Account Number) */}
                        <div className="mb-10">
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Account Number</p>
                            <p className="text-2xl font-black text-white tracking-[0.15em]">
                                {banks[0].bank_account_number.replace(/(\d{4})/g, '$1 ').trim()}
                            </p>
                        </div>

                        {/* Card Holder Name */}
                        <div className="flex justify-between items-end">
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Account Holder</p>
                                <p className="text-sm font-black text-white uppercase tracking-tight truncate pr-4">{banks[0].bank_account_name}</p>
                            </div>
                            <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500 border border-emerald-500/20">
                                <ShieldCheck size={20} />
                            </div>
                        </div>

                        {/* Decorative Background Elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ef3333]/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#ef3333]/5 rounded-full blur-3xl pointer-events-none"></div>
                    </div>
                    
        
                </div>
            ) : (
                /* Empty State */
                <div className="grid grid-cols-1 gap-6">
                    <div className="col-span-full py-20 border-2 border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center text-zinc-600">
                        <CreditCard size={48} className="mb-4 opacity-20" />
                        <p className="text-[11px] font-black uppercase tracking-widest  text-zinc-500">Belum ada rekening terdaftar</p>
                    </div>
                </div>
            )}

            {/* MODAL TAMBAH BANK */}
            {showAddModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    
                    <div className="relative w-full max-w-md bg-[#111114] border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Tambah Rekening</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddBank} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nama Bank</label>
                                <input 
                                    type="text"
                                    placeholder="Contoh: BCA, Mandiri, BNI"
                                    value={formData.bank_name}
                                    onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nomor Rekening</label>
                                <input 
                                    type="text"
                                    placeholder="Masukkan digit nomor rekening"
                                    value={formData.bank_account_number}
                                    onChange={(e) => setFormData({...formData, bank_account_number: e.target.value})}
                                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nama Pemilik Rekening</label>
                                <input 
                                    type="text"
                                    placeholder="Nama sesuai buku tabungan"
                                    value={formData.bank_account_name}
                                    onChange={(e) => setFormData({...formData, bank_account_name: e.target.value})}
                                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-700"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full py-5 bg-[#ef3333] hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-red-900/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                Simpan Rekening
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
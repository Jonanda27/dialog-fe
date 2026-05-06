'use client';

import React, { useState, useEffect } from "react";
import { Plus, CreditCard, Loader2, X, Edit3, ShieldCheck } from "lucide-react";
import { UserBankService } from "@/services/api/bank.service"; 
import { UserBankAccount, CreateUserBankPayload } from "@/types/userBank";
import { toast } from "sonner";

export default function BankKartuPage() {
    const [banks, setBanks] = useState<UserBankAccount[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const [formData, setFormData] = useState<CreateUserBankPayload>({
        bank_name: "",
        bank_account_number: "",
        bank_account_name: ""
    });

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
        <div className="max-w-6xl mx-auto px-1">
            {/* HEADER SECTION */}
            <div className="mb-8 md:mb-10 border-b border-zinc-900 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Bank & Kartu</h2>
                    <p className="text-[10px] md:text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold leading-relaxed">
                        Kelola satu rekening utama untuk pencairan dana
                    </p>
                </div>

                {!isFetching && (
                    banks.length === 0 ? (
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="w-full sm:w-auto px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#ef3333] hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg"
                        >
                            <Plus size={14} /> Tambah Rekening
                        </button>
                    ) : (
                        <button 
                            onClick={() => toast.info("Fitur ubah akan segera hadir")}
                            className="w-full sm:w-auto px-6 py-3 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-700 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Edit3 size={14} /> Ubah Rekening
                        </button>
                    )
                )}
            </div>

            {/* CONTENT AREA */}
            <div className="w-full">
                {isFetching ? (
                    <div className="flex justify-center items-center py-20 min-h-[300px]">
                        <Loader2 className="animate-spin text-[#ef3333]" size={32} />
                    </div>
                ) : banks.length > 0 ? (
                    <div className="w-full max-w-md mx-auto lg:mx-0">
                        {/* UI DETAIL KARTU REKENING */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1e] to-[#0a0a0b] border border-zinc-800 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl transition-all hover:border-[#ef3333]/30">
                            
                            {/* Chip & Logo Section */}
                            <div className="flex justify-between items-start mb-10 md:mb-12">
                                <div className="w-10 h-7 md:w-12 md:h-9 bg-gradient-to-br from-yellow-500/20 to-yellow-600/40 rounded-md border border-yellow-500/20 flex items-center justify-center shrink-0">
                                    <div className="grid grid-cols-2 gap-1 px-1 opacity-50">
                                        <div className="w-1.5 h-1 md:w-2 md:h-1.5 bg-yellow-500 rounded-sm"></div>
                                        <div className="w-1.5 h-1 md:w-2 md:h-1.5 bg-yellow-500 rounded-sm"></div>
                                        <div className="w-1.5 h-1 md:w-2 md:h-1.5 bg-yellow-500 rounded-sm"></div>
                                        <div className="w-1.5 h-1 md:w-2 md:h-1.5 bg-yellow-500 rounded-sm"></div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] md:text-[10px] font-black text-[#ef3333] uppercase tracking-[0.2em]">AnalogID Wallet</p>
                                    <p className="text-[12px] md:text-[14px] font-black text-white uppercase mt-0.5 truncate max-w-[150px]">{banks[0].bank_name}</p>
                                </div>
                            </div>

                            {/* Card Number (Account Number) */}
                            <div className="mb-8 md:mb-10">
                                <p className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Account Number</p>
                                <p className="text-lg md:text-2xl font-black text-white tracking-[0.1em] md:tracking-[0.15em] break-all">
                                    {banks[0].bank_account_number.replace(/(\d{4})/g, '$1 ').trim()}
                                </p>
                            </div>

                            {/* Card Holder Name */}
                            <div className="flex justify-between items-end gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Account Holder</p>
                                    <p className="text-xs md:text-sm font-black text-white uppercase tracking-tight truncate">{banks[0].bank_account_name}</p>
                                </div>
                                <div className="p-1.5 md:p-2 bg-emerald-500/10 rounded-full text-emerald-500 border border-emerald-500/20 shrink-0">
                                    <ShieldCheck size={18} className="md:w-[20px] md:h-[20px]" />
                                </div>
                            </div>

                            {/* Decorative Background Elements */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 md:w-40 md:h-40 bg-[#ef3333]/5 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute -bottom-20 -left-20 w-48 h-48 md:w-60 md:h-60 bg-[#ef3333]/5 rounded-full blur-3xl pointer-events-none"></div>
                        </div>
                    </div>
                ) : (
                    /* Empty State */
                    <div className="w-full py-16 md:py-24 border-2 border-dashed border-zinc-800 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col items-center justify-center text-zinc-600 px-4 text-center">
                        <CreditCard size={48} className="mb-4 opacity-20" />
                        <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-zinc-500">Belum ada rekening terdaftar</p>
                    </div>
                )}
            </div>

            {/* MODAL TAMBAH BANK */}
            {showAddModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)}></div>
                    
                    <div className="relative w-full max-w-md bg-[#111114] border border-zinc-800 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 md:mb-8">
                            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">Tambah Rekening</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white p-1">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddBank} className="space-y-5 md:space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nama Bank</label>
                                <input 
                                    type="text"
                                    placeholder="Contoh: BCA, Mandiri, BNI"
                                    value={formData.bank_name}
                                    onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-5 py-3.5 md:py-4 text-sm text-white focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nomor Rekening</label>
                                <input 
                                    type="text"
                                    placeholder="Masukkan digit nomor rekening"
                                    value={formData.bank_account_number}
                                    onChange={(e) => setFormData({...formData, bank_account_number: e.target.value})}
                                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-5 py-3.5 md:py-4 text-sm text-white focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nama Pemilik Rekening</label>
                                <input 
                                    type="text"
                                    placeholder="Nama sesuai buku tabungan"
                                    value={formData.bank_account_name}
                                    onChange={(e) => setFormData({...formData, bank_account_name: e.target.value})}
                                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-5 py-3.5 md:py-4 text-sm text-white focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-700"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full py-4 md:py-5 bg-[#ef3333] hover:bg-red-700 text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-red-900/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                Simpan Rekening
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
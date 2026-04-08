"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  Store, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Loader2, 
  Search, 
  Clock, 
  User,
  ShieldCheck,
  FileText
} from "lucide-react";
import { API_BASE_URL } from "@/utils/api";

interface PendingStore {
  id: string;
  name: string;
  description: string;
  ktp_url: string;
  status: string;
  created_at: string;
  owner: {
    id: string;
    full_name: string;
    email: string;
  };
}

export default function AdminVerificationPage() {
  const [stores, setStores] = useState<PendingStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<PendingStore | null>(null); // Untuk Modal Detail

  // 1. Fetch Daftar Toko Pending
  const fetchPendingStores = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stores/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok) {
        setStores(result.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStores();
  }, []);

  // 2. Handle Moderasi Status (Approve, Reject, Suspend)
  const handleModerate = async (id: string, status: string) => {
    const confirmAction = confirm(`Apakah Anda yakin ingin mengubah status toko menjadi ${status}?`);
    if (!confirmAction) return;

    setProcessingId(id);
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stores/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          status,
          reject_reason: status === "rejected" ? "Dokumen tidak valid atau melanggar ketentuan." : null 
        })
      });

      if (response.ok) {
        // Refresh data setelah berhasil
        setStores(stores.filter(s => s.id !== id));
        setSelectedStore(null);
        alert(`Berhasil: Toko telah di-${status}`);
      } else {
        const res = await response.json();
        alert(res.message || "Gagal mengubah status toko");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto pb-20">
        {/* HEADER */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="text-[#ef3333]" size={28} />
              Verifikasi Toko
            </h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Terdapat <span className="text-white font-bold">{stores.length}</span> toko yang menunggu moderasi.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="text" 
              placeholder="Cari Nama Toko atau Pemilik..." 
              className="bg-[#111114] border border-zinc-800 rounded-2xl py-3 pl-12 pr-6 text-xs text-white focus:border-[#ef3333] outline-none transition-all w-full md:w-80"
            />
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4 text-zinc-500">
              <Loader2 className="animate-spin text-[#ef3333]" size={40} />
              <p className="text-xs font-black uppercase tracking-widest">Memuat Data Toko...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center text-zinc-700">
                <Store size={40} />
              </div>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Tidak ada antrean verifikasi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1a1a1e]/50 border-b border-zinc-900 text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">
                    <th className="py-6 px-8">Informasi Toko</th>
                    <th className="py-6 px-4">Pemilik</th>
                    <th className="py-6 px-4">Tanggal Daftar</th>
                    <th className="py-6 px-8 text-right">Aksi Moderasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {stores.map((store) => (
                    <tr key={store.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#0a0a0b] border border-zinc-800 flex items-center justify-center text-xl shadow-inner group-hover:border-[#ef3333] transition-colors">
                            📀
                          </div>
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-tight">{store.name}</p>
                            <p className="text-[10px] text-zinc-500 line-clamp-1 max-w-[200px] mt-1 italic">"{store.description}"</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-300">{store.owner.full_name}</span>
                          <span className="text-[10px] text-zinc-600 font-medium">{store.owner.email}</span>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-2 text-zinc-500">
                          <Clock size={14} />
                          <span className="text-[10px] font-bold uppercase">{new Date(store.created_at).toLocaleDateString('id-ID')}</span>
                        </div>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedStore(store)}
                            className="p-2 rounded-lg bg-[#1a1a1e] text-zinc-400 hover:text-white border border-zinc-800 transition-all shadow-sm"
                            title="Lihat Detail KTP"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleModerate(store.id, "approved")}
                            disabled={processingId === store.id}
                            className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white p-2 rounded-lg border border-emerald-500/20 transition-all"
                            title="Approve Toko"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleModerate(store.id, "rejected")}
                            disabled={processingId === store.id}
                            className="bg-red-500/10 text-[#ef3333] hover:bg-[#ef3333] hover:text-white p-2 rounded-lg border border-red-500/20 transition-all"
                            title="Reject Toko"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL DETAIL KTP & VERIFIKASI */}
        {selectedStore && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedStore(null)} />
            <div className="relative w-full max-w-4xl bg-[#111114] border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              
              <div className="bg-[#1a1a1e] px-8 py-6 border-b border-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ef3333]/10 flex items-center justify-center text-[#ef3333] border border-[#ef3333]/20">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Detail Dokumen KYC</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">ID TOKO: {selectedStore.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedStore(null)} className="text-zinc-500 hover:text-white transition-colors">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex flex-col lg:flex-row p-8 gap-10">
                {/* Bagian Foto KTP */}
                <div className="lg:w-1/2">
                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-3 block">Foto KTP Pendaftar</label>
                  <div className="aspect-[3/2] rounded-3xl overflow-hidden bg-black border border-zinc-800 group relative">
                    <img 
                      src={`${selectedStore.ktp_url}`} 
                      alt="KTP Preview" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a href={selectedStore.ktp_url} target="_blank" className="bg-white text-black text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest">Lihat Ukuran Penuh</a>
                    </div>
                  </div>
                </div>

                {/* Bagian Detail Text */}
                <div className="lg:w-1/2 space-y-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Nama Toko</h4>
                      <p className="text-xl font-black text-white uppercase tracking-tighter">{selectedStore.name}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Pemilik (Full Name)</h4>
                      <div className="flex items-center gap-3 bg-[#0a0a0b] p-4 rounded-2xl border border-zinc-900">
                        <User size={18} className="text-[#ef3333]" />
                        <p className="text-sm font-bold text-white">{selectedStore.owner.full_name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-3xl flex gap-4 items-start">
                    <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                    <p className="text-[10px] text-amber-200/70 font-medium leading-relaxed uppercase tracking-wider">
                      Pastikan Nama Pemilik sesuai dengan nama yang tertera di KTP fisik. Jika data mencurigakan, gunakan opsi <b>REJECT</b> atau <b>SUSPEND</b>.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleModerate(selectedStore.id, "approved")}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
                    >
                      Approve Toko
                    </button>
                    <button 
                      onClick={() => handleModerate(selectedStore.id, "rejected")}
                      className="bg-[#1a1a1e] text-zinc-400 hover:text-[#ef3333] border border-zinc-800 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all"
                    >
                      Reject Toko
                    </button>
                    <button 
                      onClick={() => handleModerate(selectedStore.id, "suspended")}
                      className="col-span-2 border border-red-500/30 text-red-500/50 hover:bg-red-500 hover:text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all"
                    >
                      Suspend (Pelanggaran Berat)
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
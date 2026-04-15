"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  Search, 
  Plus, 
  Filter, 
  Edit3, 
  Trash2, 
  Disc, 
  Music, 
  Globe, 
  Layers,
  MoreVertical,
  CheckCircle2,
  X,
  Save,
  ChevronRight,
  Loader2,
  AlertCircle
} from "lucide-react";

// INTEGRASI SERVICE & STORE
import { useProductStore } from "@/store/productStore";
import { toIDR } from "@/utils/format";

export default function KatalogRilisanPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Injeksi State & Action dari useProductStore
  const { 
    adminProducts, 
    fetchAllProductsAdmin, 
    isLoading, 
    deleteProduct 
  } = useProductStore();

  // 2. Fetch data saat komponen dimuat
  useEffect(() => {
    fetchAllProductsAdmin();
  }, [fetchAllProductsAdmin]);

  /** * HELPER URL GAMBAR (FIXED)
   * Menghasilkan: http://localhost:5000/public/uploads/products/...
   */
  const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    
    // Mengambil base URL backend (http://localhost:5000) 
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000";
    
    // Bersihkan path agar tidak double slash atau mengandung kata public berlebih
    let cleanPath = path.startsWith("/") ? path : `/${path}`;
    
    // Jika path dari DB belum menyertakan /public, tambahkan secara manual [cite: 519]
    if (!cleanPath.startsWith("/public")) {
        cleanPath = `/public${cleanPath}`;
    }
    
    return `${baseUrl}${cleanPath}`;
  };

  // 3. Logika Filter Pencarian Lokal
  const filteredProducts = adminProducts.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.metadata?.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini dari katalog global?")) {
      try {
        await deleteProduct(id);
        fetchAllProductsAdmin();
      } catch (err) {
        alert("Gagal menghapus produk.");
      }
    }
  };

  return (
    <Sidebar>
      <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <Disc className="text-[#ef3333]" size={28} />
              Katalog Rilisan Global
            </h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              Database Master: Memantau seluruh listing produk dari semua penjual di platform.
            </p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#ef3333] hover:bg-red-700 text-white shadow-lg shadow-red-900/20 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
          >
            <Plus size={16} /> Tambah Master Data
          </button>
        </div>

        {/* SEARCH & FILTER */}
        <div className="bg-[#111114] border border-zinc-900 rounded-[2rem] p-4 mb-8 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="text" 
              placeholder="Cari Judul Album, Artis, atau Label..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0a0a0b] border border-zinc-900 rounded-xl py-3.5 pl-12 pr-6 text-xs text-white focus:border-[#ef3333] outline-none transition-all w-full"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-[#1a1a1e] border border-zinc-900 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
              <Filter size={14} /> Filter Genre
            </button>
            <button className="flex items-center gap-2 bg-[#1a1a1e] border border-zinc-900 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
              <Globe size={14} /> Regional
            </button>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <Loader2 className="animate-spin text-[#ef3333] mb-4" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest">Sinkronisasi Katalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <Disc size={48} className="text-zinc-800 animate-spin-slow" />
                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Katalog Kosong atau Tidak Ditemukan</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1a1a1e]/50 border-b border-zinc-900 text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">
                    <th className="py-6 px-8">Album & Artist</th>
                    <th className="py-6 px-4">Harga / Stok</th>
                    <th className="py-6 px-4">Toko Penjual</th>
                    <th className="py-6 px-4 text-center">Format</th>
                    <th className="py-6 px-8 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#0a0a0b] border border-zinc-800 flex items-center justify-center text-xl shadow-inner group-hover:border-[#ef3333] transition-colors overflow-hidden">
                            {/* PERBAIKAN: Menggunakan getImageUrl helper agar URL absolut ke backend */}
                            {item.media?.[0]?.media_url ? (
                              <img 
                                src={getImageUrl(item.media[0].media_url)!} 
                                className="w-full h-full object-cover" 
                                alt={item.name} 
                              />
                            ) : (
                              <Disc className="text-zinc-700 group-hover:text-[#ef3333] transition-colors" size={24} />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-black text-white uppercase tracking-tight group-hover:text-[#ef3333] transition-colors">{item.name}</p>
                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                              <Music size={10} /> {item.metadata?.artist || "Unknown Artist"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <p className="text-xs font-black text-white">{toIDR(item.price)}</p>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">Stok: {item.stock}</p>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                            {item.store?.name || "No Store"}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-center">
                        <p className="text-xs font-black text-[#ef3333] uppercase">{item.metadata?.format || "N/A"}</p>
                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">{item.metadata?.media_grading || "No Grade"}</p>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2.5 rounded-xl bg-[#1a1a1e] text-zinc-600 hover:text-white border border-zinc-800 transition-all">
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2.5 rounded-xl bg-[#1a1a1e] text-zinc-600 hover:text-[#ef3333] border border-zinc-800 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="p-8 border-t border-zinc-900 bg-[#0d0d0f] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">
              Analog.id Master Database • Total {filteredProducts.length} Rilisan Global
            </p>
            <div className="flex gap-2">
              <button className="px-5 py-2.5 rounded-xl bg-[#1a1a1e] text-zinc-700 text-[10px] font-black uppercase tracking-widest border border-zinc-900">Prev</button>
              <button className="px-5 py-2.5 rounded-xl bg-[#1a1a1e] text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest border border-zinc-900 transition-all">Next</button>
            </div>
          </div>
        </div>

        {/* MODAL ADD/EDIT MASTER DATA */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            
            <div className="relative w-full max-w-2xl bg-[#111114] border border-zinc-800 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
              <div className="px-8 py-6 border-b border-zinc-900 flex justify-between items-center bg-[#1a1a1e]/50">
                <div className="flex items-center gap-3">
                  <Plus className="text-[#ef3333]" size={20} />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Master Metadata Baru</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-600 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Nama Album</label>
                    <input type="text" placeholder="Contoh: Abbey Road" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Nama Artist</label>
                    <input type="text" placeholder="Contoh: The Beatles" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Tahun Rilis</label>
                    <input type="number" placeholder="YYYY" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Label Rekaman</label>
                    <input type="text" placeholder="Contoh: Apple Records" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Genre Utama</label>
                  <select className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-[#ef3333] outline-none transition-all appearance-none">
                    <option>Rock</option>
                    <option>Jazz</option>
                    <option>Hip Hop</option>
                    <option>City Pop</option>
                    <option>Electronic</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="submit" className="flex-1 bg-[#ef3333] hover:bg-red-700 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-red-900/20 flex items-center justify-center gap-2">
                    <Save size={16} /> Simpan Katalog
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 bg-zinc-900 text-zinc-500 font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] border border-zinc-800 transition-all hover:text-white">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Sidebar>
  );
}
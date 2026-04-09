"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/layout/sidebar";
import { API_BASE_URL } from "@/utils/api"; 
import axios from "axios"; 
import { 
  Search, 
  Plus, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye,
  ArrowUpDown,
  Loader2,
  X, 
  Save,
  Camera,
  Image as ImageIcon,
  Disc
} from "lucide-react";

// --- 1. INTERFACES ---
interface ProductMedia {
  id: string;
  media_url: string;
  is_primary: boolean;
}

interface Product {
  id: string;
  name: string;
  artist: string;
  format: string;
  grading: string;
  price: string | number;
  stock: number;
  release_year: number;
  label: string;
  matrix_number: string;
  media?: ProductMedia[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export default function KelolaProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- STATE MODAL & FORM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  
  // --- STATE UNTUK MEDIA (UPLOAD BARU) ---
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({
    front: null,
    back: null,
    physical: null,
  });
  const [previews, setPreviews] = useState<{ [key: string]: string | null }>({
    front: null,
    back: null,
    physical: null,
  });

  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
    physical: useRef<HTMLInputElement>(null),
  };

  const IMAGE_ROOT = API_BASE_URL.replace('/api', '');

  // --- 2. FETCH DATA PRODUK TOKO ---
  const fetchMyStoreProducts = async (filters: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse<Product[]>>(`${API_BASE_URL}/products/my-products`, {
        params: filters,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
        },
      });
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat katalog toko Anda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyStoreProducts();
  }, []);

  // --- 3. LOGIKA MODAL EDIT & UPDATE ---
  const openEditModal = (product: Product) => {
    setEditForm({ ...product });
    // Reset file selection & previews setiap kali buka modal baru
    setSelectedFiles({ front: null, back: null, physical: null });
    setPreviews({ front: null, back: null, physical: null });
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [key]: file }));
      setPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // DEBUG: Pastikan ID tidak undefined di console browser
    console.log("Updating Product ID:", editForm.id); 

    if (!editForm.id) {
        alert("ID Produk tidak ditemukan!");
        return;
    }

    setIsUpdating(true);
    try {
      const data = new FormData();
      
      // Masukkan data teks
      Object.entries(editForm).forEach(([key, value]) => {
        // Jangan masukkan object media atau tanggal ke form data teks
        if (value !== null && key !== 'media' && key !== 'createdAt' && key !== 'updatedAt') {
          data.append(key, String(value));
        }
      });

      // Masukkan file gambar baru jika ada
      if (selectedFiles.front) data.append("photos", selectedFiles.front);
      if (selectedFiles.back) data.append("photos", selectedFiles.back);
      if (selectedFiles.physical) data.append("photos", selectedFiles.physical);

      const response = await axios.put(`${API_BASE_URL}/products/${editForm.id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        alert("Berhasil diperbarui!");
        setIsModalOpen(false);
        fetchMyStoreProducts();
      }
    } catch (err: any) {
      // Jika error 401/403, biasanya req.store di backend jadi undefined
      alert(err.response?.data?.message || "Gagal simpan.");
    } finally {
      setIsUpdating(false);
    }
};

  // --- 4. LOGIKA DELETE & VIEW DETAIL ---
  const handleViewDetail = async (id: string) => {
    try {
      const response = await axios.get<ApiResponse<Product>>(`${API_BASE_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        const p = response.data.data;
        alert(`DETAIL PRODUK\n----------\nNama: ${p.name}\nArtis: ${p.artist}\nStok: ${p.stock}\nLabel: ${p.label}\nTahun: ${p.release_year}`);
      }
    } catch (err) {
      alert("Gagal mengambil detail produk.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus produk ini dari katalog?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Produk berhasil dihapus.");
      fetchMyStoreProducts();
    } catch (err) {
      alert("Gagal menghapus produk.");
    }
  };

  // --- HELPERS ---
  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat("id-ID", { 
        style: "currency", 
        currency: "IDR", 
        minimumFractionDigits: 0 
    }).format(Number(price));
  };

  const getStatusLabel = (stock: number) => {
    if (stock <= 0) return "Habis";
    if (stock < 10) return "Terbatas";
    return "Ready Stock";
  };

  return (
    <Sidebar>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Kelola Produk Toko</h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Menampilkan <span className="text-[#ef3333]">{products.length}</span> rilisan dalam katalog Anda.
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/penjual/produk/tambah_produk'}
          className="flex items-center justify-center gap-2 bg-[#ef3333] hover:bg-red-700 text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-900/20"
        >
          <Plus size={16} /> Tambah Produk Baru
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-[#111114] border border-zinc-900 rounded-[2rem] p-4 mb-8 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input 
            type="text" 
            placeholder="Cari vinyl atau artis..." 
            className="w-full bg-[#0a0a0b] border border-zinc-900 rounded-xl py-3 pl-12 pr-4 text-xs font-medium text-white focus:border-[#ef3333] outline-none placeholder:text-zinc-800" 
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-[#1a1a1e] border border-zinc-900 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
            <Filter size={14} /> Filter
          </button>
          <button className="flex items-center gap-2 bg-[#1a1a1e] border border-zinc-900 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
            <ArrowUpDown size={14} /> Urutkan
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-[#111114] border border-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Loader2 className="animate-spin mb-2" size={32} /> Memuat Katalog...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1a1e]/50 border-b border-zinc-900 text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">
                  <th className="py-6 px-8">Info Rilisan</th>
                  <th className="py-6 px-4">Format</th>
                  <th className="py-6 px-4">Harga</th>
                  <th className="py-6 px-4">Stok</th>
                  <th className="py-6 px-4">Status</th>
                  <th className="py-6 px-8 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {products.length > 0 ? products.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0a0a0b] border border-zinc-800 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-[#ef3333] transition-colors">
                          {product.media && product.media.length > 0 ? (
                            <img 
                              src={`${IMAGE_ROOT}${product.media[0].media_url}`} 
                              alt={product.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <Disc className="text-zinc-800" size={24} />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase group-hover:text-[#ef3333] transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                            {product.artist}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">{product.format}</span>
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-xs font-black text-white">{formatPrice(product.price)}</span>
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-xs font-bold text-zinc-400">{product.stock} Unit</span>
                    </td>
                    <td className="py-5 px-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                        getStatusLabel(product.stock) === 'Ready Stock' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 
                        getStatusLabel(product.stock) === 'Terbatas' ? 'bg-amber-500/5 text-amber-500 border-amber-500/10' : 
                        'bg-red-500/5 text-[#ef3333] border-red-500/10'
                      }`}>
                        {getStatusLabel(product.stock)}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleViewDetail(product.id)} className="p-2 rounded-lg bg-[#1a1a1e] text-zinc-600 hover:text-white transition-all">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => openEditModal(product)} className="p-2 rounded-lg bg-[#1a1a1e] text-zinc-600 hover:text-white transition-all">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg bg-[#1a1a1e] text-zinc-600 hover:text-[#ef3333] transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-zinc-700 text-[10px] uppercase font-black tracking-[0.2em]">
                      Belum ada rilisan di katalog Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- MODAL EDIT LENGKAP --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-5xl bg-[#111114] border border-zinc-900 rounded-[3rem] shadow-2xl overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#111114] p-8 border-b border-zinc-900 flex items-center justify-between z-10">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white">Edit Informasi Produk</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">ID: {editForm.id}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* KOLOM KIRI & TENGAH (FORM DATA) */}
                <div className="md:col-span-2 grid grid-cols-2 gap-6">
                  <div className="col-span-2 flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-[#ef3333]" />
                    <h4 className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Informasi Utama</h4>
                  </div>
                  
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Nama Album</label>
                    <input type="text" value={editForm.name || ""} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#ef3333] outline-none" required />
                  </div>
                  
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Artist</label>
                    <input type="text" value={editForm.artist || ""} onChange={(e) => setEditForm({...editForm, artist: e.target.value})} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#ef3333] outline-none" required />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Label</label>
                    <input type="text" value={editForm.label || ""} onChange={(e) => setEditForm({...editForm, label: e.target.value})} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#ef3333] outline-none" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Matrix Number</label>
                    <input type="text" value={editForm.matrix_number || ""} onChange={(e) => setEditForm({...editForm, matrix_number: e.target.value})} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#ef3333] outline-none" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Format</label>
                    <select value={editForm.format} onChange={(e) => setEditForm({...editForm, format: e.target.value})} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#ef3333] outline-none">
                      <option value="Vinyl">Vinyl</option>
                      <option value="CD">CD</option>
                      <option value="Cassette">Cassette</option>
                      <option value="Gear">Gear</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Grading</label>
                    <select value={editForm.grading} onChange={(e) => setEditForm({...editForm, grading: e.target.value})} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-[#ef3333] outline-none">
                      <option value="Mint">Mint</option>
                      <option value="Near Mint">Near Mint</option>
                      <option value="VG+">VG+</option>
                      <option value="VG">VG</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Harga (Tanpa Rp)</label>
                    <input type="number" value={editForm.price || 0} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white font-black" required />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Stok</label>
                    <input type="number" value={editForm.stock || 0} onChange={(e) => setEditForm({...editForm, stock: Number(e.target.value)})} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white font-black" required />
                  </div>
                </div>

                {/* KOLOM KANAN (MEDIA UPDATE) */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-[#ef3333]" />
                    <h4 className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Update Foto</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { id: "front", label: "Sampul Depan", idx: 0 },
                      { id: "back", label: "Sampul Belakang", idx: 1 },
                      { id: "physical", label: "Kondisi Fisik", idx: 2 }
                    ].map((item) => (
                      <div key={item.id} className="relative">
                        <div 
                          onClick={() => fileInputRefs[item.id as keyof typeof fileInputRefs].current?.click()}
                          className="w-full h-32 bg-[#0a0a0b] border-2 border-dashed border-zinc-800 rounded-3xl flex items-center justify-center cursor-pointer hover:border-[#ef3333]/50 transition-all overflow-hidden"
                        >
                          {/* Prioritas: Preview Baru > Gambar Lama > Icon */}
                          {previews[item.id] ? (
                            <img src={previews[item.id]!} className="w-full h-full object-cover" alt="New" />
                          ) : editForm.media?.[item.idx] ? (
                            <img src={`${IMAGE_ROOT}${editForm.media[item.idx].media_url}`} className="w-full h-full object-cover" alt="Old" />
                          ) : (
                            <div className="text-center">
                              <Camera size={20} className="text-zinc-800 mx-auto mb-1" />
                              <span className="text-[8px] font-black text-zinc-700 uppercase">{item.label}</span>
                            </div>
                          )}
                        </div>
                        <input type="file" ref={fileInputRefs[item.id as keyof typeof fileInputRefs]} onChange={(e) => handleFileChange(e, item.id)} className="hidden" accept="image/*" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-zinc-600 uppercase leading-relaxed font-medium">
                    * Klik kotak di atas untuk mengganti foto lama dengan foto baru.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-10 border-t border-zinc-900">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] hover:text-white transition-colors">
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="flex items-center gap-3 bg-[#ef3333] text-white px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-900/40 disabled:bg-zinc-800 transition-all active:scale-95"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {isUpdating ? "Memproses..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
"use client";

import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/utils/api"; 
import { 
  Search, Plus, Filter, Edit3, Trash2, Eye, ArrowUpDown, 
  Loader2, X, Save, Camera, Disc, Info, Tag, Package, Hash
} from "lucide-react";

// --- IMPORT TYPES & SERVICES ---
import { Product, UpdateProductPayload } from "@/types/product";
import { useProductStore } from "@/store/productStore";
import { ProductService } from "@/services/api/product.service";

export default function KelolaProdukPage() {
  const { myProducts: products, isLoading: loading, fetchMyProducts, updateProduct, deleteProduct } = useProductStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // State untuk form edit menggunakan struktur Product
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // State untuk Media Upload
  const [selectedFiles, setSelectedFiles] = useState<{
    front: File | null;
    back: File | null;
    physical: File | null;
  }>({ front: null, back: null, physical: null });

  const [previews, setPreviews] = useState<{ [key: string]: string | null }>({
    front: null, back: null, physical: null,
  });

  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
    physical: useRef<HTMLInputElement>(null),
  };

  /** * PERBAIKAN: Menyesuaikan IMAGE_ROOT agar menyertakan /public 
   * Jika media_url dari DB adalah "/uploads/products/...", 
   * maka hasilnya menjadi http://localhost:5000/public/uploads/products/...
   */
  const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace('/api', '');
  const IMAGE_ROOT = `${BASE_URL}/public`;

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts]);

  const openEditModal = (product: Product) => {
    setEditForm({ ...product });
    setSelectedFiles({ front: null, back: null, physical: null });
    setPreviews({ front: null, back: null, physical: null });
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof selectedFiles) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [key]: file }));
      setPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id) return;

    setIsUpdating(true);
    try {
      // Pastikan payload sesuai dengan kontrak UpdateProductPayload dan metadata JSONB
      const payload: UpdateProductPayload = {
        name: editForm.name,
        price: editForm.price,
        stock: editForm.stock,
        sub_category_id: editForm.sub_category_id,
        metadata: {
          ...editForm.metadata,
          artist: editForm.metadata?.artist,
          release_year: editForm.metadata?.release_year,
          format: editForm.metadata?.format,
          record_label: editForm.metadata?.record_label,
          matrix_number: editForm.metadata?.matrix_number,
          media_grading: editForm.metadata?.media_grading,
          sleeve_grading: editForm.metadata?.sleeve_grading,
          description: editForm.metadata?.description,
        },
        photos: {
          // Gunakan null coalescing untuk memastikan tidak ada 'undefined'
          front: selectedFiles.front ?? null,
          back: selectedFiles.back ?? null,
          physical: selectedFiles.physical ?? null,
        }
      };

      // Casting ke 'any' jika store masih memiliki validasi interface yang sangat ketat
      await updateProduct(editForm.id, payload as any);
      
      alert("Berhasil diperbarui!");
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Gagal simpan perubahan.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      await deleteProduct(id);
    } catch (err) {
      alert("Gagal menghapus.");
    }
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat("id-ID", { 
      style: "currency", 
      currency: "IDR", 
      minimumFractionDigits: 0 
    }).format(Number(price));
  };

  return (
    <div className="p-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Kelola Produk Toko</h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Menampilkan <span className="text-[#ef3333]">{products.length}</span> rilisan dalam katalog Anda.
          </p>
        </div>
        <button onClick={() => window.location.href = '/penjual/produk/tambah_produk'} className="flex items-center gap-2 bg-[#ef3333] hover:bg-red-700 text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-red-900/20">
          <Plus size={16} /> Tambah Produk Baru
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-[#111114] border border-zinc-900 rounded-[2rem] p-4 mb-8 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input type="text" placeholder="Cari vinyl atau artis..." className="w-full bg-[#0a0a0b] border border-zinc-900 rounded-xl py-3 pl-12 pr-4 text-xs font-medium text-white focus:border-[#ef3333] outline-none" />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-[#1a1a1e] border border-zinc-900 px-5 py-3 rounded-xl text-[10px] font-black uppercase text-zinc-500">
            <Filter size={14} /> Filter
          </button>
          <button className="flex items-center gap-2 bg-[#1a1a1e] border border-zinc-900 px-5 py-3 rounded-xl text-[10px] font-black uppercase text-zinc-500">
            <ArrowUpDown size={14} /> Urutkan
          </button>
        </div>
      </div>

      <div className="bg-[#111114] border border-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center py-20 text-zinc-500"><Loader2 className="animate-spin mb-2" size={32} /> Memuat...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1a1e]/50 border-b border-zinc-900 text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">
                  <th className="py-6 px-8">Info Rilisan</th>
                  <th className="py-6 px-4">Format</th>
                  <th className="py-6 px-4">Harga</th>
                  <th className="py-6 px-4">Stok</th>
                  <th className="py-6 px-8 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0a0a0b] border border-zinc-800 flex items-center justify-center overflow-hidden">
                          {product.media?.[0] ? (
                            <img src={`${IMAGE_ROOT}${product.media[0].media_url}`} className="w-full h-full object-cover" alt="" />
                          ) : <Disc className="text-zinc-800" size={24} />}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase">{product.name}</p>
                          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{product.metadata?.artist || 'Unknown Artist'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4"><span className="text-[10px] font-bold text-zinc-500 uppercase">{product.metadata?.format || '-'}</span></td>
                    <td className="py-5 px-4"><span className="text-xs font-black text-white">{formatPrice(product.price)}</span></td>
                    <td className="py-5 px-4"><span className="text-xs font-bold text-zinc-400">{product.stock} Unit</span></td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedProduct(product); setIsDetailOpen(true); }} className="p-2 rounded-lg bg-[#1a1a1e] text-zinc-600 hover:text-white"><Eye size={14} /></button>
                        <button onClick={() => openEditModal(product)} className="p-2 rounded-lg bg-[#1a1a1e] text-zinc-600 hover:text-white"><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg bg-[#1a1a1e] text-zinc-600 hover:text-[#ef3333]"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- MODAL DETAIL --- */}
      {isDetailOpen && selectedProduct && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsDetailOpen(false)} />
          <div className="relative w-full max-w-4xl bg-[#111114] border border-zinc-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">
            <div className="md:w-2/5 bg-[#0a0a0b] p-8 border-r border-zinc-900 overflow-y-auto">
                <div className="space-y-4">
                    {selectedProduct.media?.map((m, i) => (
                        <img key={i} src={`${IMAGE_ROOT}${m.media_url}`} className="w-full rounded-3xl border border-zinc-800" alt="" />
                    ))}
                </div>
            </div>
            <div className="md:w-3/5 p-10 overflow-y-auto text-left">
              <h2 className="text-3xl font-black text-white uppercase">{selectedProduct.name}</h2>
              <p className="text-xl font-bold text-zinc-500 uppercase mb-6">{selectedProduct.metadata?.artist}</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#0a0a0b] p-5 rounded-3xl border border-zinc-900">
                    <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Harga</p>
                    <p className="text-xl font-black text-[#ef3333]">{formatPrice(selectedProduct.price)}</p>
                </div>
                <div className="bg-[#0a0a0b] p-5 rounded-3xl border border-zinc-900">
                    <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Stok</p>
                    <p className="text-xl font-black text-white">{selectedProduct.stock} Unit</p>
                </div>
              </div>
              <div className="space-y-4 text-zinc-400 text-sm">
                 <p><span className="text-zinc-600 uppercase font-black text-[10px]">Format:</span> {selectedProduct.metadata?.format || '-'}</p>
                 <p><span className="text-zinc-600 uppercase font-black text-[10px]">Grading:</span> {selectedProduct.metadata?.media_grading || 'N/A'} / {selectedProduct.metadata?.sleeve_grading || 'N/A'}</p>
                 <p><span className="text-zinc-600 uppercase font-black text-[10px]">Deskripsi:</span> {selectedProduct.metadata?.description || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT --- */}
      {isModalOpen && editForm.metadata && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-5xl bg-[#111114] border border-zinc-900 rounded-[3rem] shadow-2xl overflow-y-auto max-h-[90vh] p-8">
            <h3 className="text-xl font-black uppercase text-white mb-8 text-left">Edit Informasi Produk</h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-8 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Nama Produk</label>
                  <input type="text" value={editForm.name || ""} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-[#ef3333]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Artist</label>
                  <input type="text" value={editForm.metadata?.artist || ""} onChange={(e) => setEditForm({...editForm, metadata: {...editForm.metadata!, artist: e.target.value}})} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-[#ef3333]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Harga</label>
                  <input type="number" value={editForm.price || ""} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Stok</label>
                  <input type="number" value={editForm.stock || ""} onChange={(e) => setEditForm({...editForm, stock: Number(e.target.value)})} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {(['front', 'back', 'physical'] as const).map((key, i) => (
                  <div key={key} onClick={() => fileInputRefs[key].current?.click()} className="h-32 bg-[#0a0a0b] border-2 border-dashed border-zinc-800 rounded-3xl flex items-center justify-center cursor-pointer overflow-hidden">
                    {previews[key] ? (
                      <img src={previews[key]!} className="w-full h-full object-cover" alt="" />
                    ) : editForm.media?.[i] ? (
                      <img src={`${IMAGE_ROOT}${editForm.media[i].media_url}`} className="w-full h-full object-cover" alt="" />
                    ) : <Camera className="text-zinc-800" />}
                    <input type="file" ref={fileInputRefs[key]} onChange={(e) => handleFileChange(e, key)} className="hidden" accept="image/*" />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[10px] font-black uppercase text-zinc-500">Batal</button>
                <button type="submit" disabled={isUpdating} className="bg-[#ef3333] text-white px-12 py-4 rounded-2xl text-[10px] font-black uppercase shadow-xl disabled:bg-zinc-800 flex items-center gap-2">
                  {isUpdating ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
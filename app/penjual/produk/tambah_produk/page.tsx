"use client";

import React, { useState, useRef } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Upload, Info, Music, Disc, Hash, DollarSign, Layers, Save, PlusCircle, Loader2 } from "lucide-react";
import axios from "axios";

export default function TambahProduk() {
  // 1. State untuk data text (Keys harus sesuai dengan Schema Backend)
  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    release_year: "",
    format: "", 
    label: "",
    matrix_number: "",
    grading: "", 
    price: "",
    stock: "1",
  });

  // 2. State untuk file gambar & preview
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    front: null,
    back: null,
    physical: null,
  });

  const [previews, setPreviews] = useState<{ [key: string]: string | null }>({
    front: null,
    back: null,
    physical: null,
  });

  const [loading, setLoading] = useState(false);
  
  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
    physical: useRef<HTMLInputElement>(null),
  };

  // Handle perubahan input text & select
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle upload file & preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [key]: file }));
      setPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  // 3. Handle Submit ke Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      // Append files ke key 'photos' (Sesuai backend: uploadProductPhotos.array('photos', 5))
      if (files.front) data.append("photos", files.front);
      if (files.back) data.append("photos", files.back);
      if (files.physical) data.append("photos", files.physical);

      const response = await axios.post("http://localhost:5000/api/products", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Pastikan token ada
        },
      });

      alert("Produk berhasil dipublikasikan!");
      window.location.reload(); 
    } catch (error: any) {
      console.error("Submission Error:", error.response?.data);
      
      // Mengambil pesan error spesifik dari array 'errors' backend jika ada
      const backendErrors = error.response?.data?.errors;
      const errorMessage = Array.isArray(backendErrors) 
        ? backendErrors.join("\n") 
        : (error.response?.data?.message || "Terjadi kesalahan sistem");

      alert(`Gagal: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sidebar>
      <div className="max-w-5xl mx-auto pb-20">
        {/* HEADER */}
        <div className="mb-10">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Tambah Koleksi Baru</h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Lengkapi detail produk dengan akurat untuk memudahkan kurasi <span className="text-[#ef3333]">Analog.id</span>
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* SECTION 1: INFORMASI UMUM */}
          <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#ef3333]/10 flex items-center justify-center text-[#ef3333]">
                <Music size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Informasi Album</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Nama Album *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Abbey Road" 
                  className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-800 text-white" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Artist *</label>
                <input 
                  type="text" 
                  name="artist"
                  value={formData.artist}
                  onChange={handleChange}
                  placeholder="Contoh: The Beatles" 
                  className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-800 text-white" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Tahun Rilis *</label>
                <input 
                  type="number" 
                  name="release_year"
                  value={formData.release_year}
                  onChange={handleChange}
                  placeholder="YYYY" 
                  className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-800 text-white" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Format *</label>
                <select 
                  name="format"
                  className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white"
                  value={formData.format}
                  onChange={handleChange}
                  required
                >
                  <option value="" className="text-zinc-500">Pilih Format</option>
                  <option value="Vinyl">Vinyl (LP/EP)</option>
                  <option value="Cassette">Kaset Pita</option>
                  <option value="CD">Compact Disc (CD)</option>
                  <option value="Gear">Audio Gear Analog</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: SPESIFIKASI & GRADING */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Hash size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Identifikasi</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Label Rekaman</label>
                  <input type="text" name="label" value={formData.label} onChange={handleChange} placeholder="Penerbit Rekaman" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Matrix / Catalog Number</label>
                  <input type="text" name="matrix_number" value={formData.matrix_number} onChange={handleChange} placeholder="Nomor identifikasi" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white" />
                </div>
              </div>
            </div>

            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Layers size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Kondisi (Grading) *</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["Mint", "NM", "VG+", "VG", "Good", "Fair"].map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setFormData({...formData, grading: grade})}
                    className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      formData.grading === grade 
                      ? "bg-[#ef3333] border-[#ef3333] text-white shadow-lg shadow-red-900/20" 
                      : "bg-[#0a0a0b] border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {grade === "NM" ? "Near Mint" : grade}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-start gap-3 bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase tracking-tight">
                  Pastikan grading sesuai standar internasional (Goldmine).
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: HARGA & STOK */}
          <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <DollarSign size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Harga & Ketersediaan</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Harga (Rp) *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all font-black text-white" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Jumlah Stok *</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="1" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all font-black text-white" required />
              </div>
            </div>
          </div>

          {/* SECTION 4: FOTO PRODUK */}
          <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Disc size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Foto Produk *</h3>
            </div>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-8 ml-13">Upload minimal 3 foto wajib untuk verifikasi</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { id: "front", label: "Sampul Depan", desc: "Sampul depan album" },
                { id: "back", label: "Sampul Belakang", desc: "Sampul belakang (tracklist)" },
                { id: "physical", label: "Kondisi Fisik", desc: "Vinyl/kaset & cover" }
              ].map((item) => (
                <div key={item.id} className="space-y-3">
                  <div 
                    onClick={() => fileInputRefs[item.id as keyof typeof fileInputRefs].current?.click()}
                    className="group relative border-2 border-dashed border-zinc-800 rounded-[2rem] h-48 flex flex-col items-center justify-center gap-3 bg-[#0a0a0b] hover:border-[#ef3333]/50 transition-all cursor-pointer overflow-hidden"
                  >
                    {previews[item.id] ? (
                      <img src={previews[item.id]!} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload size={24} className="text-zinc-700 group-hover:text-[#ef3333] transition-colors" />
                        <div className="text-center px-4">
                          <p className="text-[10px] font-black text-white uppercase tracking-tighter">Upload {item.label}</p>
                          <p className="text-[9px] text-zinc-600 font-bold mt-1 uppercase tracking-tighter">JPG, PNG (MAX 5MB)</p>
                        </div>
                      </>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRefs[item.id as keyof typeof fileInputRefs]}
                      onChange={(e) => handleFileChange(e, item.id)}
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                  <div className="px-2">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter leading-tight">{item.label}</p>
                    <p className="text-[9px] text-zinc-600 font-medium uppercase tracking-tighter">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* FOTO TAMBAHAN */}
            <div className="mt-12 pt-8 border-t border-zinc-900">
               <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Foto Tambahan (Opsional)</h4>
               <div className="flex flex-wrap gap-4">
                  {["Kondisi Sleeve", "Kondisi Vinyl"].map((opt) => (
                    <div key={opt} className="w-32 h-32 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center bg-[#0a0a0b] hover:border-zinc-700 transition-all cursor-pointer">
                      <PlusCircle size={16} className="text-zinc-700" />
                      <span className="text-[8px] font-black text-zinc-600 uppercase mt-2 text-center px-2">{opt}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* BUTTON ACTIONS */}
          <div className="flex items-center justify-end gap-4 pt-6">
             <button 
               type="button" 
               onClick={() => window.history.back()}
               className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all disabled:opacity-50"
               disabled={loading}
             >
               Batalkan
             </button>
             <button 
               type="submit" 
               disabled={loading}
               className="flex items-center gap-3 bg-[#ef3333] hover:bg-red-700 text-white font-black px-10 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-red-900/40 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none"
             >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {loading ? "Memproses..." : "Publikasikan Produk"}
             </button>
          </div>
        </form>
      </div>
    </Sidebar>
  );
}
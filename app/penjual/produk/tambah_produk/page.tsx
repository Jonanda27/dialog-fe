"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Upload, Info, Music, Disc, Hash, DollarSign, Layers, Save, PlusCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TambahProduk() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State data teks (sesuaikan dengan createProductSchema backend)
  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    release_year: "",
    format: "", // Backend: [Vinyl, Cassette, CD, Gear]
    label: "",
    catalog_number: "",
    grading: "", // Backend: [Mint, NM, VG+, VG, Good, Fair]
    price: "",
    stock: "1",
    condition_notes: "",
  });

  // State file gambar
  const [photos, setPhotos] = useState<{ [key: string]: File | null }>({
    front: null,
    back: null,
    physical: null,
    extra1: null,
    extra2: null,
  });

  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotos((prev) => ({ ...prev, [key]: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [key]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi Foto Wajib
    if (!photos.front || !photos.back || !photos.physical) {
      alert("Harap unggah minimal 3 foto wajib (Depan, Belakang, Fisik)!");
      return;
    }

    setLoading(true);

    try {
      // 2. Ambil Token dengan pengecekan lebih teliti
      const getCookie = (name: string) => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
        return null;
      };

      // Pastikan nama cookie ini 'token' (cek di Inspect -> Application -> Cookies)
      const token = getCookie("token");

      if (!token) {
        setLoading(false);
        alert("Sesi Anda berakhir. Silakan login kembali.");
        router.push("/login");
        return;
      }

      // 3. Siapkan FormData
      const data = new FormData();
      data.append("name", formData.name);
      data.append("artist", formData.artist);
      data.append("release_year", formData.release_year);
      data.append("format", formData.format);
      data.append("grading", formData.grading);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("label", formData.label);
      data.append("catalog_number", formData.catalog_number);
      data.append("condition_notes", formData.condition_notes);

      // Append semua file ke key 'photos' sesuai backend: .array('photos', 5)
      const fileKeys = ["front", "back", "physical", "extra1", "extra2"];
      fileKeys.forEach((key) => {
        if (photos[key]) {
          data.append("photos", photos[key] as File);
        }
      });

      // 4. Kirim ke Backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        alert("Produk berhasil ditambahkan ke katalog!");
        router.push("/penjual/produk");
      } else {
        throw new Error(result.message || "Gagal menambahkan produk");
      }
    } catch (error: any) {
      console.error("Upload Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sidebar>
      <div className="max-w-5xl mx-auto pb-20">
        <div className="mb-10">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Tambah Koleksi Baru</h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Lengkapi detail produk dengan akurat untuk memudahkan kurasi <span className="text-[#ef3333]">Analog.id</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: INFORMASI ALBUM */}
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
                <input name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="Contoh: Abbey Road" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Artist *</label>
                <input name="artist" value={formData.artist} onChange={handleInputChange} type="text" placeholder="Contoh: The Beatles" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Tahun Rilis *</label>
                <input name="release_year" value={formData.release_year} onChange={handleInputChange} type="number" placeholder="YYYY" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Format *</label>
                <select name="format" value={formData.format} onChange={handleInputChange} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-zinc-400" required>
                  <option value="">Pilih Format</option>
                  <option value="Vinyl">Vinyl (LP/EP)</option>
                  <option value="Cassette">Kaset Pita</option>
                  <option value="CD">Compact Disc (CD)</option>
                  <option value="Gear">Audio Gear Analog</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: IDENTIFIKASI & GRADING */}
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
                  <input name="label" value={formData.label} onChange={handleInputChange} type="text" placeholder="Penerbit Rekaman" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Matrix / Catalog Number</label>
                  <input name="catalog_number" value={formData.catalog_number} onChange={handleInputChange} type="text" placeholder="Nomor identifikasi" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white" />
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
                  <button key={grade} type="button" onClick={() => setFormData({ ...formData, grading: grade })} className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.grading === grade ? "bg-[#ef3333] border-[#ef3333] text-white shadow-lg shadow-red-900/20" : "bg-[#0a0a0b] border-zinc-800 text-zinc-500 hover:border-zinc-700"}`}>
                    {grade}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: HARGA & DESKRIPSI */}
          <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <DollarSign size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Harga & Detail</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Harga (Rp) *</label>
                <input name="price" value={formData.price} onChange={handleInputChange} type="number" placeholder="0" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all font-black text-white" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Jumlah Stok *</label>
                <input name="stock" value={formData.stock} onChange={handleInputChange} type="number" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all font-black text-white" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Catatan Kondisi</label>
              <textarea name="condition_notes" value={formData.condition_notes} onChange={handleInputChange} placeholder="Jelaskan detail minus atau kelebihan produk..." className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:border-[#ef3333] outline-none transition-all text-white min-h-[100px]" />
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
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-8">Upload minimal 3 foto wajib untuk verifikasi</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { id: "front", label: "Sampul Depan", desc: "Sampul depan" },
                { id: "back", label: "Sampul Belakang", desc: "Tracklist" },
                { id: "physical", label: "Kondisi Fisik", desc: "Media & Cover" },
              ].map((item) => (
                <div key={item.id} className="space-y-3">
                  <label className="group relative border-2 border-dashed border-zinc-800 rounded-[2rem] h-48 flex flex-col items-center justify-center gap-3 bg-[#0a0a0b] hover:border-[#ef3333]/50 transition-all cursor-pointer overflow-hidden">
                    {previews[item.id] ? (
                      <img src={previews[item.id]} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <>
                        <Upload size={24} className="text-zinc-700 group-hover:text-[#ef3333]" />
                        <div className="text-center px-4">
                          <p className="text-[10px] font-black text-white uppercase">Upload {item.label}</p>
                        </div>
                      </>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, item.id)} />
                  </label>
                  <p className="text-[9px] text-zinc-600 font-medium uppercase text-center">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* FOTO TAMBAHAN */}
            <div className="mt-12 pt-8 border-t border-zinc-900">
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Foto Tambahan (Opsional)</h4>
              <div className="flex flex-wrap gap-4">
                {["extra1", "extra2"].map((id) => (
                  <label key={id} className="w-32 h-32 border-2 border-dashed border-zinc-800 rounded-3xl flex items-center justify-center bg-[#0a0a0b] cursor-pointer overflow-hidden relative">
                    {previews[id] ? <img src={previews[id]} className="absolute inset-0 w-full h-full object-cover" alt="Preview" /> : <PlusCircle size={16} className="text-zinc-700" />}
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, id)} />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <button type="button" onClick={() => router.back()} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all">
              Batalkan
            </button>
            <button type="submit" disabled={loading} className="flex items-center gap-3 bg-[#ef3333] hover:bg-red-700 text-white font-black px-10 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-red-900/40 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {loading ? "Memproses..." : "Publikasikan Produk"}
            </button>
          </div>
        </form>
      </div>
    </Sidebar>
  );
}
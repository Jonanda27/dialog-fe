"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, AlertCircle, ChevronDown, Check, Disc, FileText, Hash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// Import Presentational Components
import AlbumInfoSection from "@/components/product/form/AlbumInfoSection";
import PricingSection from "@/components/product/form/PricingSection";
import PhotoUploadSection from "@/components/product/form/PhotoUploadSection";

// Import Services & Stores
import { useProductStore } from "@/store/productStore";
import { CategoryService } from "@/services/api/category.service";

// Opsi Grading Disederhanakan
const GRADING_OPTIONS = [
  { value: "Mint", label: "Mint (Segel)" },
  { value: "NM", label: "Near Mint (NM)" },
  { value: "VG+", label: "Very Good Plus (VG+)" },
  { value: "VG", label: "Very Good (VG)" },
  { value: "G/F", label: "Good/Fair" },
];

export default function TambahProduk() {
  const router = useRouter();
  const { createProduct, isSubmitting, error: apiError, clearError } = useProductStore();

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // State Form Utama
  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    release_year: "",
    label: "",
    catalog_number: "",
    format: "",         // Diambil dari field Format di AlbumInfoSection
    media_grading: "",  
    sleeve_grading: "", 
    price: "",
    stock: "1",
    condition_notes: "",
    sub_category_id: "", 
  });

  // State Foto - Sesuai dengan key yang di-loop di ProductService
  const [photos, setPhotos] = useState<{
    front: File | null;
    back: File | null;
    physical: File | null;
    extra1: File | null;
    extra2: File | null;
  }>({
    front: null,
    back: null,
    physical: null,
    extra1: null,
    extra2: null,
  });

  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleFetchCategories = async () => {
    if (hasFetched || isLoadingCategories) return;
    setIsLoadingCategories(true);
    try {
      const res: any = await CategoryService.getAllCategories();
      const finalData = Array.isArray(res) ? res : (res.data || []);
      setCategories(finalData);
      setHasFetched(true);
    } catch (err) {
      toast.error("Gagal mengambil kategori");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (apiError) clearError();
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * FIX UNTUK GAMBAR: 
   * Pastikan PhotoUploadSection memanggil handleFileChange dengan key yang benar 
   * Contoh: onFileChange(e, 'front')
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Simpan file ke state agar bisa dikirim ke service
      setPhotos((prev) => ({ ...prev, [key]: file }));
      
      // Preview untuk UI
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [key]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Foto Utama (Frontend Guard)
    if (!photos.front || !photos.back || !photos.physical) {
      toast.error("Foto Depan, Belakang, dan Fisik wajib diunggah!");
      return;
    }

    if (!formData.media_grading || !formData.sleeve_grading) {
      toast.error("Mohon tentukan kondisi Media dan Sleeve!");
      return;
    }

    try {
      const rawPrice = formData.price.toString().replace(/[^0-9]/g, "");
      const priceNum = parseFloat(rawPrice) || 0;
      const stockNum = parseInt(formData.stock.toString(), 10) || 0;

      // EKSEKUSI PAYLOAD
      await createProduct({
        name: formData.name.trim(),
        price: priceNum,
        stock: stockNum,
        sub_category_id: formData.sub_category_id,
        metadata: {
          artist: formData.artist || "Unknown Artist",
          status: "active",
          description: formData.condition_notes || "Koleksi analog original.",
          record_label: formData.label || "-",
          release_year: formData.release_year ? parseInt(formData.release_year, 10) : 0,
          matrix_number: formData.catalog_number || "-",
          media_grading: formData.media_grading,
          sleeve_grading: formData.sleeve_grading,
          // DIAMBIL DARI FIELD FORMAT DI CARD INFORMASI ALBUM
          format: formData.format || "Physical Media" 
        },
        // MENGIRIM OBJEK PHOTOS BERISI FILE ASLI
        photos: photos 
      });

      toast.success("Produk berhasil diterbitkan!");
      router.push("/penjual/produk/kelola_produk");
    } catch (err: any) {
      console.error("Gagal menyimpan:", err);
      toast.error(err.message || "Terjadi kesalahan saat menyimpan produk.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 text-left">
      <header className="mb-10">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">Tambah Koleksi Baru</h2>
        <p className="text-sm text-zinc-500 font-medium mt-1">Lengkapi data untuk katalog etalase Anda.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* SECTION 1: KATEGORI */}
        <section className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-6 bg-[#ef3333] rounded-full" />
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Kategori Media</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative">
              <select
                name="sub_category_id"
                required
                value={formData.sub_category_id}
                onFocus={handleFetchCategories}
                onChange={handleInputChange}
                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-[#ef3333] outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat: any) => (
                  <optgroup key={cat.id} label={cat.name.toUpperCase()} className="bg-[#111114] text-[#ef3333]">
                    {cat.subCategories?.map((sub: any) => (
                      <option key={sub.id} value={sub.id} className="text-white bg-[#0a0a0b]">{sub.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={18} />
            </div>
          </div>
        </section>

        {/* SECTION 2: INFO ALBUM (Berisi field Format) */}
        <AlbumInfoSection formData={formData} onChange={handleInputChange} />

        {/* SECTION 3: IDENTIFIKASI & KONDISI */}
        <section className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10 shadow-xl space-y-10">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-6 bg-[#ef3333] rounded-full" />
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Identifikasi & Kondisi</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             {/* Media Grading */}
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Disc className="text-[#ef3333]" size={16} />
                  <label className="text-[11px] font-black uppercase text-white tracking-widest">Media Grading</label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {GRADING_OPTIONS.map((g) => (
                    <button
                      key={g.value} type="button"
                      onClick={() => setFormData(prev => ({ ...prev, media_grading: g.value }))}
                      className={`py-3.5 rounded-xl text-[10px] font-black transition-all border ${formData.media_grading === g.value ? "bg-[#ef3333] border-[#ef3333] text-white shadow-lg shadow-red-900/20" : "bg-[#0a0a0b] border-zinc-800 text-zinc-600 hover:border-zinc-500"}`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
             </div>

             {/* Sleeve Grading */}
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="text-[#ef3333]" size={16} />
                  <label className="text-[11px] font-black uppercase text-white tracking-widest">Sleeve Grading</label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {GRADING_OPTIONS.map((g) => (
                    <button
                      key={g.value} type="button"
                      onClick={() => setFormData(prev => ({ ...prev, sleeve_grading: g.value }))}
                      className={`py-3.5 rounded-xl text-[10px] font-black transition-all border ${formData.sleeve_grading === g.value ? "bg-[#ef3333] border-[#ef3333] text-white shadow-lg shadow-red-900/20" : "bg-[#0a0a0b] border-zinc-800 text-zinc-600 hover:border-zinc-500"}`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
             </div>
          </div>

          <div className="w-full h-px bg-zinc-800/50 my-2" />

          {/* METADATA INPUTS */}
          <div className="bg-[#0a0a0b]/50 border border-zinc-800/50 p-8 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <Hash className="text-[#ef3333]" size={18} />
                <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest">Metadata Rilisan</label>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1 mb-1.5 block tracking-widest">Label Rekaman</label>
                  <input
                    type="text" name="label"
                    value={formData.label} onChange={handleInputChange}
                    placeholder="Contoh: Warner Bros"
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-800"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1 mb-1.5 block tracking-widest">Matrix / Catalog Number</label>
                  <input
                    type="text" name="catalog_number"
                    value={formData.catalog_number} onChange={handleInputChange}
                    placeholder="Contoh: SKI-1234"
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-5 py-4 text-sm text-white focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-800"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#ef3333]/5 border border-[#ef3333]/10 p-6 rounded-2xl flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="text-[#ef3333]" size={20} />
                <h4 className="text-white font-black text-xs uppercase tracking-widest">Validasi Fisik</h4>
              </div>
              <p className="text-zinc-500 text-[10px] leading-relaxed font-medium italic">
                Pastikan foto dan grading sesuai. Format media diambil dari detail informasi album yang Anda isi.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: HARGA & STOK */}
        <PricingSection formData={formData} onChange={handleInputChange} />

        {/* SECTION 5: UPLOAD FOTO (Key Sinkron dengan Service) */}
        <PhotoUploadSection previews={previews} onFileChange={handleFileChange} />

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-6 pt-10 border-t border-zinc-900">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all"
          >
            Batalkan
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="bg-[#ef3333] text-white font-black px-12 py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-red-900/30 disabled:opacity-50 transition-all active:scale-95 flex items-center gap-3"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSubmitting ? "Menerbitkan..." : "Terbitkan Koleksi"}
          </button>
        </div>
      </form>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Save, Loader2, AlertCircle, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// Import Presentational Components
import AlbumInfoSection from "@/components/product/form/AlbumInfoSection";
import IdentificationSection from "@/components/product/form/IdentificationSection";
import PricingSection from "@/components/product/form/PricingSection";
import PhotoUploadSection from "@/components/product/form/PhotoUploadSection";

// Import Services & Stores
import { useProductStore } from "@/store/productStore";
import { CategoryService } from "@/services/api/category.service";

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
    grading: "", 
    price: "",
    stock: "1",
    condition_notes: "",
    sub_category_id: "", 
  });

  const [photos, setPhotos] = useState<{ [key: string]: File | null }>({
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

  const handleGradeSelect = (grade: string) => {
    setFormData((prev) => ({ ...prev, grading: grade }));
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
    
    // 1. Validasi Foto Wajib (Minimal 3 foto sesuai aturan bisnis)
    if (!photos.front || !photos.back || !photos.physical) {
      toast.error("Foto Depan, Belakang, dan Fisik wajib diunggah!");
      return;
    }

    // 2. Validasi Kategori
    if (!formData.sub_category_id) {
      toast.error("Silakan pilih kategori media!");
      return;
    }

    try {
      // 3. Normalisasi Angka dan Tipe Data (SOLUSI UNTUK NaN & Undefined) [cite: 781, 782]
      // Pastikan harga dan stok adalah angka murni
      const rawPrice = formData.price.toString().replace(/[^0-9]/g, "");
      const priceNum = parseFloat(rawPrice) || 0;
      const stockNum = parseInt(formData.stock.toString(), 10) || 0;

      if (priceNum <= 0) {
        toast.error("Harga harus lebih dari 0");
        return;
      }

      // 4. Susun Payload dengan Metadata sebagai Objek JS [cite: 1801, 2798]
      // Note: Di level ProductService, metadata ini akan di-JSON.stringify
      // agar melewati preprocess validation di Backend [cite: 784, 2538]
   await createProduct({
        name: formData.name.trim(),
        price: priceNum,
        stock: stockNum,
        sub_category_id: formData.sub_category_id,
        // INI BENTUK OBJECT MURNI DI REACT
        metadata: {
          artist: formData.artist || "Pink Floyd", // Ambil dari form, atau kasih default
          status: "active",
          description: formData.condition_notes || "Plat original rilisan pertama. Sangat langka.",
          record_label: formData.label || "Harvest",
          release_year: formData.release_year ? parseInt(formData.release_year, 10) : 1973,
          matrix_number: formData.catalog_number || "SHVL 804",
          media_grading: formData.grading || "NM",
          sleeve_grading: "VG+" // Tambahkan manual jika tidak ada di form input
        },
        photos: {
          front: photos.front,
          back: photos.back,
          physical: photos.physical,
          extra1: photos.extra1,
          extra2: photos.extra2,
        }
      });

      toast.success("Koleksi berhasil diterbitkan!");
      router.push("/penjual/produk/kelola_produk");
    } catch (err: any) {
      console.error("Submission failed:", err);
      // Parsing pesan error Zod yang dikirim dari Backend via interceptor [cite: 116, 2468]
      if (err.errors && err.errors.length > 0) {
        toast.error(`Gagal: ${err.errors[0].message}`);
      } else {
        toast.error(err.message || "Terjadi kesalahan sistem saat menyimpan.");
      }
    }
  };

  return (
    <Sidebar>
      <div className="max-w-5xl mx-auto pb-20">
        <header className="mb-10">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Tambah Koleksi Baru</h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Produk akan tampil di etalase <span className="text-[#ef3333]">Analog.id</span> setelah disimpan.
          </p>
        </header>

        {apiError && (
          <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-red-500 font-medium">
              <p className="font-bold uppercase text-[10px] tracking-widest mb-1">Gagal Menyimpan:</p>
              {apiError}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* SEKSI KATEGORI */}
          <section className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 lg:p-10 shadow-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1.5 h-6 bg-[#ef3333] rounded-full" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Pilih Jenis Media</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative group">
                <select
                  name="sub_category_id"
                  required
                  value={formData.sub_category_id}
                  onFocus={handleFetchCategories}
                  onChange={handleInputChange}
                  className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-[#ef3333] outline-none appearance-none cursor-pointer transition-all"
                >
                  <option value="" className="text-zinc-500">
                    {isLoadingCategories ? "Memuat Kategori..." : "-- Pilih Kategori --"}
                  </option>
                  
                  {categories.map((cat: any) => (
                    <optgroup 
                      key={cat.id} 
                      label={`${cat.icon || "📦"} ${cat.name.toUpperCase()}`} 
                      className="bg-[#111114] text-[#ef3333] font-black"
                    >
                      {cat.subCategories?.map((sub: any) => (
                        <option key={sub.id} value={sub.id} className="text-white bg-[#0a0a0b] py-2">
                          {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={18} />
              </div>

              {formData.sub_category_id && (
                <div className="flex items-center gap-4 bg-green-500/5 border border-green-500/20 p-4 rounded-2xl animate-in zoom-in-95">
                  <Check className="text-green-500" size={20} />
                  <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Kategori Terverifikasi</span>
                </div>
              )}
            </div>
          </section>

          {/* Form Sections */}
          <AlbumInfoSection formData={formData} onChange={handleInputChange} />
          <IdentificationSection formData={formData} onChange={handleInputChange} onGradeSelect={handleGradeSelect} />
          <PricingSection formData={formData} onChange={handleInputChange} />
          <PhotoUploadSection previews={previews} onFileChange={handleFileChange} />

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
              {isSubmitting ? "Menyimpan..." : "Publikasikan Koleksi"}
            </button>
          </div>
        </form>
      </div>
    </Sidebar>
  );
}
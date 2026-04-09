"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Save, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// Import Presentational Components
import AlbumInfoSection from "@/components/product/form/AlbumInfoSection";
import IdentificationSection from "@/components/product/form/IdentificationSection";
import PricingSection from "@/components/product/form/PricingSection";
import PhotoUploadSection from "@/components/product/form/PhotoUploadSection";

// Import Zustand Store & Types (KABEL UTAMA)
import { useProductStore } from "@/store/productStore";
import { ProductFormat, ProductGrading } from "@/types/product";

export default function TambahProduk() {
  const router = useRouter();

  // 1. Ekstraksi fungsi dan state dari Zustand Store
  const { createProduct, isLoading, error: apiError, clearError } = useProductStore();

  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    release_year: "",
    format: "" as ProductFormat | "",
    label: "",
    catalog_number: "",
    grading: "" as ProductGrading | "",
    price: "",
    stock: "1",
    condition_notes: "",
  });

  const [photos, setPhotos] = useState<{ [key: string]: File | null }>({
    front: null,
    back: null,
    physical: null,
    extra1: null,
    extra2: null,
  });

  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    clearError(); // Bersihkan error API jika user mulai mengetik ulang untuk memperbaiki data
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGradeSelect = (grade: string) => {
    setFormData((prev) => ({ ...prev, grading: grade as ProductGrading }));
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

  // 2. Proses Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photos.front || !photos.back || !photos.physical) {
      alert("Harap unggah minimal 3 foto wajib (Depan, Belakang, Fisik)!");
      return;
    }

    try {
      // 3. Delegasikan ke Zustand (Hanya mengirim Object mentah sesuai Aturan Mutlak)
      await createProduct({
        ...formData,
        photos: {
          front: photos.front,
          back: photos.back,
          physical: photos.physical,
          extra1: photos.extra1,
          extra2: photos.extra2,
        }
      });

      alert("Produk berhasil ditambahkan ke katalog!");
      router.push("/penjual/kelola_produk");

    } catch (err: unknown) {
      // PERBAIKAN: Menggunakan unknown dan mengecek instance Error
      if (err instanceof Error) {
        console.error("Gagal menyimpan produk:", err.message);
      } else {
        console.error("Gagal menyimpan produk:", err);
      }
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

        {/* Global Error Alert dari Zustand (Jika Backend menolak data) */}
        {apiError && (
          <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-fade-in">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-sm text-red-500 font-medium">{apiError}</p>
          </div>
        )}

        {/* Tambahkan encType="multipart/form-data" sebagai best practice HTML Form */}
        <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">

          <AlbumInfoSection formData={formData} onChange={handleInputChange} />

          <IdentificationSection formData={formData} onChange={handleInputChange} onGradeSelect={handleGradeSelect} />

          <PricingSection formData={formData} onChange={handleInputChange} />

          <PhotoUploadSection previews={previews} onFileChange={handleFileChange} />

          <div className="flex items-center justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-3 bg-[#ef3333] hover:bg-red-700 text-white font-black px-10 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-red-900/40 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {isLoading ? "Memproses..." : "Publikasikan Produk"}
            </button>
          </div>
        </form>
      </div>
    </Sidebar>
  );
}
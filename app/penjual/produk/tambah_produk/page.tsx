"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Import Presentational Components
import AlbumInfoSection from "@/components/product/form/AlbumInfoSection";
import IdentificationSection from "@/components/product/form/IdentificationSection";
import PricingSection from "@/components/product/form/PricingSection";
import PhotoUploadSection from "@/components/product/form/PhotoUploadSection";

export default function TambahProduk() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    release_year: "",
    format: "",
    label: "",
    catalog_number: "",
    grading: "",
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

    if (!photos.front || !photos.back || !photos.physical) {
      alert("Harap unggah minimal 3 foto wajib (Depan, Belakang, Fisik)!");
      return;
    }

    setLoading(true);

    try {
      const getCookie = (name: string) => {
        if (typeof document === "undefined") return null;
        const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
        return match ? match[2] : null;
      };

      const token = getCookie("token");

      if (!token) {
        setLoading(false);
        alert("Sesi Anda berakhir. Silakan login kembali.");
        router.push("/login");
        return;
      }

      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value as string);
      });

      const fileKeys = ["front", "back", "physical", "extra1", "extra2"];
      fileKeys.forEach((key) => {
        if (photos[key]) {
          data.append("photos", photos[key] as File);
        }
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Sesuai kesepakatan Fase B: TIDAK ADA Content-Type agar browser mengatur boundary multipart
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

          <AlbumInfoSection formData={formData} onChange={handleInputChange} />

          <IdentificationSection formData={formData} onChange={handleInputChange} onGradeSelect={handleGradeSelect} />

          <PricingSection formData={formData} onChange={handleInputChange} />

          <PhotoUploadSection previews={previews} onFileChange={handleFileChange} />

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
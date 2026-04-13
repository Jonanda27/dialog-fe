"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  Store, 
  UploadCloud, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { API_BASE_URL } from "@/utils/api";
import { useRouter } from "next/navigation";

export default function RegisterStorePage() {
  const router = useRouter();
  
  // State Kendali Step
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form Step 1
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");

  // State Form Step 2
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 1. Cek Status Toko Saat Ini (Jika user refresh halaman)
  useEffect(() => {
    const checkStoreStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok) {
          const user = result.data;
          
          /** * PERBAIKAN LOGIKA STEP:
           * Berdasarkan JSON Anda, data toko ada di 'user.store'
           */
          if (!user.store) {
            // Jika objek store tidak ada sama sekali
            setCurrentStep(1);
          } else if (!user.store.ktp_url) {
            // Jika sudah daftar nama tapi belum upload KTP
            setCurrentStep(2);
          } else if (user.store.status === "pending") {
            // Jika sudah upload dan menunggu moderasi
            setCurrentStep(3);
          } else if (user.store.status === "approved") {
            // Jika sudah diapprove, langsung lempar ke dashboard
            router.push("/penjual/dashboard"); 
          }
        }
      } catch (error) {
        console.error("Gagal memuat status toko", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStoreStatus();
  }, [router]);

  // 2. Handle Submit Step 1 (Register Store)
  const handleRegisterStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/stores/register-store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: storeName, description: storeDesc })
      });

      const result = await response.json();
      if (response.ok) {
        setCurrentStep(2); // Pindah ke step upload KTP
      } else {
        alert(result.message || "Gagal mendaftarkan nama toko.");
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Submit Step 2 (Upload KYC)
  const handleUploadKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ktpFile) return;

    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("ktp_file", ktpFile); // Key 'ktp_file' sesuai route backend

    try {
      const response = await fetch(`${API_BASE_URL}/stores/upload-kyc`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setCurrentStep(3); // Pindah ke step final (menunggu admin)
      } else {
        const result = await response.json();
        alert(result.message || "Gagal mengunggah KTP.");
      }
    } catch (error) {
      alert("Gagal menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKtpFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#ef3333]" size={40} />
      </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto py-10 px-6">
        
        {/* PROGRESS STEPPER VISUAL */}
        <div className="flex items-center justify-center mb-16 relative">
          <div className="flex items-center w-full max-w-md justify-between relative z-10">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all border-2 ${
                  currentStep >= step 
                  ? "bg-[#ef3333] border-[#ef3333] text-white shadow-[0_0_15px_rgba(239,51,51,0.4)]" 
                  : "bg-[#1a1a1e] border-zinc-800 text-zinc-600"
                }`}>
                  {currentStep > step ? <CheckCircle2 size={20} /> : step}
                </div>
                <span className={`text-[9px] font-black uppercase mt-3 tracking-widest ${
                  currentStep >= step ? "text-white" : "text-zinc-600"
                }`}>
                  {step === 1 ? "Identitas" : step === 2 ? "Verifikasi" : "Selesai"}
                </span>
              </div>
            ))}
          </div>
          {/* Garis Penghubung Stepper */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-full max-w-[300px] h-[2px] bg-zinc-900 z-0">
            <div className={`h-full bg-[#ef3333] transition-all duration-500`} style={{ width: `${(currentStep - 1) * 50}%` }} />
          </div>
        </div>

        {/* STEP 1: FORM PENDAFTARAN TOKO */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Buka Toko Baru</h1>
              <p className="text-zinc-500 mt-2 font-medium">Berikan identitas unik untuk toko piringan hitam kamu.</p>
            </div>

            <form onSubmit={handleRegisterStore} className="bg-[#111114] border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Nama Toko Rekaman</label>
                <div className="relative">
                  <Store className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    type="text" required value={storeName} onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Contoh: Analog Vintage Records"
                    className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-2xl pl-14 pr-6 py-5 text-sm focus:border-[#ef3333] outline-none transition-all text-white font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Deskripsi & Bio Toko</label>
                <textarea 
                  rows={4} value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)}
                  placeholder="Ceritakan koleksi apa yang Anda tawarkan (Vinyl, Kaset, CD, atau Gear)..."
                  className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-2xl px-6 py-5 text-sm focus:border-[#ef3333] outline-none transition-all text-white resize-none font-medium"
                />
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-[#ef3333] hover:bg-red-700 text-white font-black py-6 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Simpan & Lanjutkan"}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: UPLOAD KTP (KYC) */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Verifikasi Identitas</h1>
              <p className="text-zinc-500 mt-2 font-medium">Unggah foto KTP Anda untuk menjamin keamanan transaksi di Analog.id.</p>
            </div>

            <form onSubmit={handleUploadKyc} className="bg-[#111114] border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl space-y-8">
              <div 
                className={`border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${
                  previewUrl ? "border-emerald-500/50 bg-emerald-500/5" : "border-zinc-800 hover:border-[#ef3333] bg-zinc-900/20"
                }`}
              >
                <input 
                  type="file" accept="image/*" onChange={handleFileChange} required
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />
                
                {previewUrl ? (
                  <div className="text-center space-y-4">
                    <img src={previewUrl} alt="Preview KTP" className="max-h-48 rounded-xl shadow-lg border border-zinc-800 mx-auto" />
                    <p className="text-emerald-500 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> File Terpilih
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
                      <UploadCloud size={30} />
                    </div>
                    <p className="text-white font-bold text-sm">Klik atau Seret Foto KTP</p>
                    <p className="text-zinc-600 text-[10px] uppercase font-black tracking-tighter mt-2">JPG, JPEG, PNG (Maks 2MB)</p>
                  </div>
                )}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-4 items-start">
                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                <p className="text-[10px] text-amber-200/70 font-medium leading-relaxed uppercase tracking-wider">
                  Pastikan foto KTP terlihat jelas, tidak blur, dan tidak terpotong. Data Anda dijamin kerahasiaannya oleh sistem enkripsi kami.
                </p>
              </div>

              <button 
                type="submit" disabled={isSubmitting || !ktpFile}
                className="w-full bg-white hover:bg-zinc-200 text-black font-black py-6 rounded-2xl text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Unggah & Selesaikan"}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: MENUNGGU MODERASI ADMIN */}
        {currentStep === 3 && (
          <div className="animate-in zoom-in-95 duration-500 text-center py-10">
            <div className="w-32 h-32 bg-[#ef3333]/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-[#ef3333]/20 relative">
              <Clock className="text-[#ef3333] animate-pulse" size={50} />
              <div className="absolute -top-1 -right-1 bg-amber-500 text-black p-2 rounded-full border-4 border-[#0a0a0b]">
                <Loader2 className="animate-spin" size={16} />
              </div>
            </div>
            
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">Dalam Peninjauan</h1>
            <p className="text-zinc-500 max-w-md mx-auto font-medium leading-relaxed">
              Tim Admin Analog.id sedang memverifikasi identitas dan data toko kamu. Proses ini biasanya memakan waktu <span className="text-white font-bold">1 x 24 jam</span>.
            </p>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
              <div className="bg-[#111114] border border-zinc-800 p-5 rounded-2xl">
                <FileText className="text-[#ef3333] mb-3" size={20} />
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Dokumen</h4>
                <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">KTP Telah Diterima</p>
              </div>
              <div className="bg-[#111114] border border-zinc-800 p-5 rounded-2xl">
                <ImageIcon className="text-[#ef3333] mb-3" size={20} />
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Status</h4>
                <p className="text-[10px] text-amber-500 font-bold mt-1 uppercase tracking-tighter">Sedang Diverifikasi</p>
              </div>
            </div>

            <p className="mt-12 text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">
              Kami akan mengirimkan notifikasi setelah toko kamu aktif.
            </p>
            
            <button 
              onClick={() => router.push("/")}
              className="mt-10 px-10 py-4 bg-[#1a1a1e] text-zinc-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-zinc-800 hover:border-zinc-700"
            >
              Kembali ke Beranda
            </button>
          </div>
        )}

      </div>
  );
}
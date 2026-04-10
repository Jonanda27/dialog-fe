"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/layout/sidebar";
import { StoreService } from "@/services/api/store.service";
import { ProductService } from "@/services/api/product.service";
import { Store as StoreType, UpdateStorePayload } from "@/types/store";
import { Product } from "@/types/product";
import { 
  Store, Camera, Save, ShieldCheck, 
  Clock, Edit3, X, Monitor, 
  Image as ImageIcon, Link as LinkIcon, 
  Loader2, Upload, Globe, MapPin, Calendar,
  Star
} from "lucide-react";
import { toast } from "react-hot-toast";

/** * HELPER URL GAMBAR */
const getImageUrl = (path: string | null | undefined): string | null => {
  if (!path || path === "") return null;
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  let cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!cleanPath.startsWith("/public")) {
    cleanPath = `/public${cleanPath}`;
  }
  return `${baseUrl}${cleanPath}`;
};

/** * HELPER FORMAT TANGGAL */
const formatJoinDate = (dateString: string | null | undefined) => {
  if (!dateString) return "April 2026";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};

const CustomIcons = {
  Instagram: ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
  ),
  Facebook: ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
  ),
  Youtube: ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 0 0 1.94 2c1.71.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.42-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
  )
};

const LIST_HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function PengaturanToko() {
  const [activeTab, setActiveTab] = useState<string>("tampilan");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [storeData, setStoreData] = useState<any>({
    startDay: "Senin",
    endDay: "Sabtu",
    startTime: "09:00",
    endTime: "17:00",
    instagram: "",
    facebook: "",
    youtube: "",
    website: "",
    banner_preview: null,
    logo_preview: null,
    createdAt: "2026-04-10T02:50:16.149Z"
  });

  const initData = async () => {
    try {
      const [storeRes, productRes] = await Promise.all([
        StoreService.getMyStore(),
        ProductService.getMyProducts()
      ]);
      
      if (storeRes.success) {
          const data = storeRes.data as StoreType;
          const hoursPart = data.working_hours?.split(" - ") || ["09:00", "17:00"];
          const daysPart = data.working_days?.split(" - ") || ["Senin", "Sabtu"];

          setStoreData({
              ...data,
              banner_preview: getImageUrl(data.banner_url),
              logo_preview: getImageUrl(data.logo_url),
              banner_file: null,
              logo_file: null,
              startDay: daysPart[0],
              endDay: daysPart[1] || daysPart[0],
              startTime: hoursPart[0],
              endTime: hoursPart[1],
              instagram: data.social_links?.instagram || "",
              facebook: data.social_links?.facebook || "",
              youtube: data.social_links?.youtube || "",
              website: data.social_links?.website || "",
              createdAt: data.createdAt || "2026-04-10T02:50:16.149Z"
          });
      }
      if (productRes.success) setProducts(productRes.data);
    } catch (error: any) {
      toast.error("Gagal sinkronisasi data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStoreData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      if (name === "banner_file") {
          setStoreData((prev: any) => ({ ...prev, banner_preview: previewUrl, banner_file: file }));
      } else if (name === "logo_file") {
          setStoreData((prev: any) => ({ ...prev, logo_preview: previewUrl, logo_file: file }));
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: UpdateStorePayload = {
        name: storeData.name || undefined,
        description: storeData.description || undefined,
        working_days: `${storeData.startDay} - ${storeData.endDay}`,
        working_hours: `${storeData.startTime} - ${storeData.endTime}`,
        instagram: storeData.instagram || undefined,
        facebook: storeData.facebook || undefined,
        youtube: storeData.youtube || undefined,
        website: storeData.website || undefined,
        banner_url: storeData.banner_file || undefined, 
        logo_url: storeData.logo_file || undefined,
      };

      const response = await StoreService.updateStore(payload);
      if (response.success) {
        toast.success("Profil berhasil diperbarui");
        setIsEditing(false);
        await initData();
      }
    } catch (error: any) {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <Sidebar>
      <div className="flex h-screen items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#ef3333] mr-3" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sinkronisasi Data Toko...</span>
      </div>
    </Sidebar>
  );

  return (
    <Sidebar>
      <div className="max-w-[1400px] mx-auto pb-20 px-4">
        <input type="file" name="banner_file" ref={bannerInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        <input type="file" name="logo_file" ref={logoInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">Pengaturan Toko</h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">Kelola branding dan identitas digital toko Anda.</p>
          </div>
          {activeTab === "profil" && (
             <button onClick={() => setIsEditing(!isEditing)} className="flex items-center justify-center gap-3 bg-[#1a1a1e] border border-zinc-800 hover:border-[#ef3333] text-white font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all">
                {isEditing ? <><X size={16}/> Batal</> : <><Edit3 size={16} className="text-[#ef3333]"/> Edit Profil</>}
             </button>
          )}
        </div>

        <div className="flex gap-4 mb-10 overflow-x-auto no-scrollbar pb-2">
            <button
                onClick={() => { setActiveTab("tampilan"); setIsEditing(false); }}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeTab === "tampilan" ? "bg-[#ef3333] border-[#ef3333] text-white shadow-lg shadow-red-900/20" : "bg-[#111114] border-zinc-900 text-zinc-500 hover:border-zinc-700"}`}>
                <Monitor size={16} /> Tampilan Toko
            </button>
            <button
                onClick={() => setActiveTab("profil")}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeTab === "profil" ? "bg-[#ef3333] border-[#ef3333] text-white shadow-lg shadow-red-900/20" : "bg-[#111114] border-zinc-900 text-zinc-500 hover:border-zinc-700"}`}>
                <Store size={16} /> Profil Toko
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-12 space-y-12">
            
            {activeTab === "tampilan" && (
              <div className="animate-fade-in space-y-12">
                <div className="relative w-full min-h-[580px] rounded-[3rem] overflow-hidden border border-zinc-900 bg-[#0a0a0b] group shadow-2xl">
                    <img 
                      src={storeData.banner_preview || "https://images.unsplash.com/photo-1535992165812-68d1863aa354?q=80&w=1600&auto=format&fit=crop"} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                      alt="Store Banner" 
                    />
                    
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.4)_30%,transparent_60%)] z-[1]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-[2]" />
                    
                    <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.4)_25%,transparent_50%)] z-[3] pointer-events-none" />

                    <div className="absolute inset-0 z-10 p-10 lg:p-14 flex flex-col justify-between">
                        {/* TOP SECTION */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                          <div className="relative">
                            {/* UBAH BORDER PROFIL MENJADI HIJAU (EMERALD) */}
                            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-[#0a0a0b] border-4 border-emerald-500 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                {storeData.logo_preview ? 
                                  <img src={storeData.logo_preview} className="w-full h-full object-cover" alt="Logo" /> : 
                                  <span className="text-emerald-500 font-black text-xl uppercase ">{storeData.name?.substring(0, 2)}</span>
                                }
                            </div>
                            {/* IKON VERIFIED HIJAU */}
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-[#0a0a0b] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                              <ShieldCheck size={14} className="text-white" />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">
                              {storeData.name || "Nama Toko"}
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                {storeData.instagram && (
                                 <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                                    <CustomIcons.Instagram className="text-pink-500" />
                                    <span className="text-[10px] text-zinc-200 font-bold uppercase tracking-wider">{storeData.instagram}</span>
                                 </div>
                               )}
                               {storeData.website && (
                                 <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                                    <LinkIcon size={12} className="text-blue-400" />
                                    <span className="text-[10px] text-zinc-200 font-bold uppercase tracking-wider">{storeData.website.replace("https://", "")}</span>
                                 </div>
                               )}
                            </div>

                            <div className="max-w-[320px] md:max-w-[450px]">
                                <p className="text-zinc-100 text-sm lg:text-base font-semibold leading-relaxed drop-shadow-lg break-words">
                                    {storeData.description || "Selamat datang di toko resmi kami. Kami menyediakan produk berkualitas dengan layanan terbaik."}
                                </p>
                            </div>

                            <div className="flex items-center gap-6 pt-1">
                                <div className="flex items-center gap-2 text-white/80">
                                    <MapPin size={14} className="text-[#ef3333]" />
                                    <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest">Bandung, Indonesia</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/80">
                                    <Calendar size={14} className="text-[#ef3333]" />
                                    <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest">Bergabung {formatJoinDate(storeData.createdAt)}</span>
                                </div>
                            </div>
                          </div>
                        </div>

                        {/* BOTTOM SECTION - STATS & OPERATIONAL */}
                        <div className="flex flex-col md:flex-row justify-between items-end w-full gap-6 relative z-10">
                           
                           <div className="flex items-center gap-6 lg:gap-10 py-4 px-2">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-white font-black text-lg lg:text-xl drop-shadow-md">4.9</span>
                                        <Star size={14} className="text-orange-500 fill-orange-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] drop-shadow-md">Rating</span>
                                </div>
                                <div className="w-[1px] h-8 bg-white/10"></div>
                                <div className="flex flex-col">
                                    <span className="text-white font-black text-lg lg:text-xl drop-shadow-md">1.2K</span>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] drop-shadow-md">Pengikut</span>
                                </div>
                                <div className="w-[1px] h-8 bg-white/10"></div>
                                <div className="flex flex-col">
                                    <span className="text-white font-black text-lg lg:text-xl drop-shadow-md">3.8K</span>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] drop-shadow-md">Terjual</span>
                                </div>
                                <div className="w-[1px] h-8 bg-white/10"></div>
                                <div className="flex flex-col">
                                    <span className="text-white font-black text-lg lg:text-xl drop-shadow-md">98%</span>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] drop-shadow-md">Responsif</span>
                                </div>
                           </div>

                           <div className="bg-black/20 backdrop-blur-xl p-6 rounded-[2.5rem] w-full md:max-w-[280px] border border-white/10 shadow-2xl">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-xl bg-[#ef3333]/20 text-[#ef3333]">
                                  <Clock size={16} />
                                </div>
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Jam Operasional</span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-white font-black text-base">{storeData.startDay} - {storeData.endDay}</p>
                                <p className="text-[#ef3333] font-bold text-xs uppercase">{storeData.startTime} — {storeData.endTime} WIB</p>
                              </div>
                           </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-8 bg-[#ef3333] rounded-full" />
                      <h3 className="text-xl font-black text-white uppercase tracking-tight ">Katalog Produk</h3>
                    </div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-900 px-4 py-2 rounded-full">
                      {products.length} Items
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {products.length > 0 ? products.map((p, i) => {
                      const firstMediaUrl = p.media && p.media.length > 0 ? p.media[0].media_url : null;
                      const imgSrc = getImageUrl(firstMediaUrl);

                      return (
                        <div key={i} className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] overflow-hidden group hover:border-[#ef3333]/50 transition-all duration-500">
                          <div className="aspect-[4/5] relative overflow-hidden bg-zinc-900">
                             {imgSrc ? (
                               <img 
                                 src={imgSrc} 
                                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                 alt={p.name} 
                               />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                 <ImageIcon size={24} className="text-zinc-600" />
                               </div>
                             )}
                          </div>
                          <div className="p-6">
                            <h4 className="text-zinc-400 font-black text-[10px] uppercase tracking-widest mb-1">{p.artist || "Unknown Artist"}</h4>
                            <h4 className="text-white font-black text-sm uppercase truncate mb-2">{p.name}</h4>
                            <p className="text-[#ef3333] font-black text-base ">Rp {Number(p.price).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-900 rounded-[3rem] text-zinc-700">
                        <ImageIcon size={48} className="mb-4 opacity-20" />
                        <span className="uppercase text-[11px] font-black tracking-widest">Belum ada produk</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profil" && (
              <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 relative h-[280px] rounded-[2.5rem] overflow-hidden border border-zinc-900 group">
                        <img src={storeData.banner_preview || "https://images.unsplash.com/photo-1535992165812-68d1863aa354?q=80&w=1600&auto=format&fit=crop"} className="w-full h-full object-cover opacity-40" alt="Banner Preview" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <button disabled={!isEditing} onClick={() => bannerInputRef.current?.click()} className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#ef3333] transition-all disabled:opacity-30">
                                <Camera size={18}/> Ganti Banner
                            </button>
                        </div>
                    </div>
                    <div className="relative h-[280px] bg-[#111114] border border-zinc-900 rounded-[2.5rem] flex flex-col items-center justify-center gap-6">
                        {/* PREVIEW LOGO DENGAN OUTLINE HIJAU */}
                        <div className="w-24 h-24 rounded-full border-4 border-emerald-500/50 overflow-hidden bg-zinc-900 relative">
                            {storeData.logo_preview && <img src={storeData.logo_preview} className="w-full h-full object-cover" alt="Logo Preview" />}
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#111114] flex items-center justify-center">
                              <ShieldCheck size={12} className="text-white" />
                            </div>
                        </div>
                        <button disabled={!isEditing} onClick={() => logoInputRef.current?.click()} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all disabled:opacity-30">
                            <Upload size={16}/> Upload Logo
                        </button>
                    </div>
                </div>

                <div className="bg-[#111114] border border-zinc-900 rounded-[3rem] p-8 lg:p-12 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Nama Toko</label>
                      <input name="name" value={storeData.name || ""} onChange={handleChange} disabled={!isEditing} type="text" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-6 py-5 text-sm font-bold text-white focus:border-[#ef3333] outline-none disabled:opacity-50" />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Hari Operasional (Rentang)</label>
                      <div className="flex items-center gap-3">
                        <select name="startDay" value={storeData.startDay} disabled={!isEditing} onChange={handleChange} className="flex-1 bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-4 py-5 text-sm font-bold text-white focus:border-[#ef3333] outline-none disabled:opacity-50 appearance-none text-center">
                            {LIST_HARI.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <span className="text-zinc-600 font-black">-</span>
                        <select name="endDay" value={storeData.endDay} disabled={!isEditing} onChange={handleChange} className="flex-1 bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-4 py-5 text-sm font-bold text-white focus:border-[#ef3333] outline-none disabled:opacity-50 appearance-none text-center">
                            {LIST_HARI.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Jam Operasional</label>
                      <div className="flex items-center gap-3">
                        <input type="time" name="startTime" value={storeData.startTime} disabled={!isEditing} onChange={handleChange} className="flex-1 bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-4 py-5 text-sm font-bold text-white focus:border-[#ef3333] outline-none disabled:opacity-50 text-center" />
                        <span className="text-zinc-600 font-black">—</span>
                        <input type="time" name="endTime" value={storeData.endTime} disabled={!isEditing} onChange={handleChange} className="flex-1 bg-[#0a0a0b] border border-zinc-800 rounded-2xl px-4 py-5 text-sm font-bold text-white focus:border-[#ef3333] outline-none disabled:opacity-50 text-center" />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Deskripsi Toko</label>
                      <textarea name="description" value={storeData.description || ""} onChange={handleChange} disabled={!isEditing} rows={4} className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-3xl px-6 py-5 text-sm font-medium text-zinc-300 focus:border-[#ef3333] outline-none disabled:opacity-50 transition-all resize-none" />
                    </div>

                    <div className="md:col-span-2 mt-4">
                      <h4 className="text-[11px] font-black uppercase text-white tracking-[0.2em] mb-8 flex items-center gap-3">
                        <div className="w-8 h-[1px] bg-zinc-800"></div>
                        Link Media Sosial & Website
                        <div className="w-8 h-[1px] bg-zinc-800"></div>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Website Resmi</label>
                          <div className="relative">
                            <Globe size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input name="website" value={storeData.website || ""} onChange={handleChange} disabled={!isEditing} placeholder="https://..." className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl pl-16 pr-6 py-5 text-sm font-bold text-white focus:border-[#ef3333] outline-none disabled:opacity-50" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Instagram Username</label>
                          <div className="relative">
                            <CustomIcons.Instagram className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input name="instagram" value={storeData.instagram || ""} onChange={handleChange} disabled={!isEditing} placeholder="username_toko" className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl pl-16 pr-6 py-5 text-sm font-bold text-white focus:border-[#ef3333] outline-none disabled:opacity-50" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end animate-fade-in pb-10">
                    <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-4 bg-[#ef3333] hover:bg-red-700 text-white font-black px-14 py-6 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl shadow-red-900/40 disabled:opacity-70">
                      {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
                      Simpan Perubahan
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          input[type="time"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
          }
        `}</style>
      </div>
    </Sidebar>
  );
}
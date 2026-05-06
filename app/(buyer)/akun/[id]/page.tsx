'use client';

import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { Camera, Save, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { UserProfileService } from "@/services/api/profile.service";
import { UpdateProfilePayload } from "@/types/userProfile";

export default function ProfilePage() {
    const { user, isInitialized } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        username: "",
        phone_number: "",
        gender: "" as 'Laki-laki' | 'Perempuan' | '',
        birth_date: { tanggal: "", bulan: "", tahun: "" },
        profile_picture: undefined as File | undefined
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await UserProfileService.getMyProfile();
                if (response.success && response.data) {
                    const profile = response.data;
                    
                    let birthParts = { tanggal: "", bulan: "", tahun: "" };
                    if (profile.birth_date) {
                        const [year, month, day] = profile.birth_date.split('-');
                        birthParts = { 
                            tanggal: parseInt(day).toString(), 
                            bulan: parseInt(month).toString(), 
                            tahun: year 
                        };
                    }

                    setFormData({
                        username: profile.username || "",
                        phone_number: profile.phone_number || "",
                        gender: (profile.gender as any) || "",
                        birth_date: birthParts,
                        profile_picture: undefined
                    });
                    
                    if (profile.profile_picture_url) {
                        setPreviewUrl(profile.profile_picture_url);
                    }
                }
            } catch (error) {
                console.error("Gagal mengambil profil:", error);
            } finally {
                setIsFetching(false);
            }
        };

        if (isInitialized) fetchProfileData();
    }, [isInitialized]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                return toast.error("Ukuran gambar maksimal 1MB");
            }
            setFormData(prev => ({ ...prev, profile_picture: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload: UpdateProfilePayload = {
                username: formData.username,
                phone_number: formData.phone_number,
                gender: formData.gender as 'Laki-laki' | 'Perempuan',
                birth_date: formData.birth_date.tahun && formData.birth_date.bulan && formData.birth_date.tanggal 
                    ? `${formData.birth_date.tahun}-${formData.birth_date.bulan.padStart(2, '0')}-${formData.birth_date.tanggal.padStart(2, '0')}`
                    : undefined,
                profile_picture: formData.profile_picture 
            };

            const response = await UserProfileService.updateProfile(payload);
            
            if (response.success) {
                toast.success("Profil berhasil diperbarui");
                window.location.reload();
            } else {
                toast.error(response.message || "Gagal memperbarui profil");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Terjadi kesalahan sistem");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return (
        <div className="flex justify-center items-center py-20 min-h-[400px]">
            <Loader2 className="animate-spin text-[#ef3333]" size={32} />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* HEADER SECTION */}
            <div className="mb-8 md:mb-10 border-b border-zinc-900 pb-6">
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Profil Saya</h2>
                <p className="text-[10px] md:text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">
                    Kelola informasi profil Anda untuk mengontrol dan mengamankan akun
                </p>
            </div>

            <form onSubmit={handleSave} className="flex flex-col lg:flex-row gap-10 lg:gap-16">
                
                {/* PHOTO UPLOAD (ATAS PADA MOBILE, KANAN PADA DESKTOP) */}
                <div className="order-1 lg:order-2 lg:w-72 flex flex-col items-center gap-6 lg:border-l lg:border-zinc-900 lg:pl-16 pb-10 lg:pb-0 border-b border-zinc-900 lg:border-b-0">
                    <div className="relative">
                        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-zinc-800 overflow-hidden bg-zinc-900 shadow-2xl transition-all">
                            <img 
                                src={previewUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name}&backgroundColor=ef3333`} 
                                className="w-full h-full object-cover" 
                                alt="Profile Big" 
                            />
                        </div>
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-1 right-1 p-2 md:p-2.5 bg-zinc-800 border border-zinc-700 rounded-full text-[#ef3333] hover:bg-[#ef3333] hover:text-white transition-all shadow-xl active:scale-90"
                        >
                            <Camera size={18} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileChange}
                        />
                    </div>
                    
                    <div className="text-center space-y-3">
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-zinc-700 transition-all active:scale-95"
                        >
                            Pilih Gambar
                        </button>
                        <div className="text-[9px] md:text-[10px] text-zinc-600 font-bold uppercase tracking-tight leading-tight">
                            <p>Ukuran gambar: maks. 1 MB</p>
                            <p>Format gambar: .JPEG, .PNG</p>
                        </div>
                    </div>
                </div>

                {/* INPUT FIELDS */}
                <div className="order-2 lg:order-1 flex-1 space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 gap-5 md:gap-6">
                        
                        {/* Username */}
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-10">
                            <label className="md:w-32 text-[10px] font-black text-zinc-500 uppercase tracking-widest md:text-right shrink-0">Username</label>
                            <div className="flex-1">
                                <input 
                                    type="text" 
                                    value={formData.username} 
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className="w-full bg-transparent border-b border-zinc-800 focus:border-[#ef3333] text-white text-sm font-bold py-2 outline-none transition-all placeholder:text-zinc-700" 
                                    placeholder="Masukkan username"
                                />
                            </div>
                        </div>

                        {/* Nama (Read Only) */}
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-10">
                            <label className="md:w-32 text-[10px] font-black text-zinc-500 uppercase tracking-widest md:text-right shrink-0">Nama</label>
                            <div className="flex-1">
                                <input 
                                    type="text" 
                                    value={user?.full_name || ""} 
                                    disabled
                                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-400 opacity-60 cursor-not-allowed font-medium" 
                                />
                            </div>
                        </div>

                        {/* Email (Read Only Visual) */}
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-10">
                            <label className="md:w-32 text-[10px] font-black text-zinc-500 uppercase tracking-widest md:text-right shrink-0">Email</label>
                            <div className="flex-1 flex items-center gap-3">
                                <span className="text-sm text-white font-medium">
                                    {user?.email ? user.email.replace(/(.{2})(.*)(?=@)/, "$1********") : ""}
                                </span>
                                <button type="button" className="text-[10px] font-black text-blue-500 uppercase hover:underline">Ubah</button>
                            </div>
                        </div>

                        {/* Nomor Telepon */}
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-10">
                            <label className="md:w-32 text-[10px] font-black text-zinc-500 uppercase tracking-widest md:text-right shrink-0">Nomor HP</label>
                            <div className="flex-1">
                                <input 
                                    type="text" 
                                    value={formData.phone_number}
                                    placeholder="Contoh: 08123456789"
                                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-700 font-medium" 
                                />
                            </div>
                        </div>

                        {/* Jenis Kelamin */}
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-10">
                            <label className="md:w-32 text-[10px] font-black text-zinc-500 uppercase tracking-widest md:text-right shrink-0">Jenis Kelamin</label>
                            <div className="flex flex-wrap gap-5 md:gap-6">
                                {['Laki-laki', 'Perempuan'].map((gender) => (
                                    <label key={gender} className="flex items-center gap-2.5 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input 
                                                type="radio" 
                                                name="gender" 
                                                value={gender}
                                                checked={formData.gender === gender}
                                                onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                                                className="w-4 h-4 accent-[#ef3333] bg-[#0a0a0b] border-zinc-800" 
                                            />
                                        </div>
                                        <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">{gender}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Tanggal Lahir */}
                        <div className="flex flex-col md:flex-row md:items-start md:items-center gap-2 md:gap-10">
                            <label className="md:w-32 text-[10px] font-black text-zinc-500 uppercase tracking-widest md:text-right shrink-0">Tgl Lahir</label>
                            <div className="flex-1 grid grid-cols-3 gap-2 md:gap-3">
                                {/* TANGGAL */}
                                <div className="relative">
                                    <select 
                                        value={formData.birth_date.tanggal}
                                        onChange={(e) => setFormData({...formData, birth_date: {...formData.birth_date, tanggal: e.target.value}})}
                                        className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-3 py-3 text-xs text-white focus:border-[#ef3333] outline-none appearance-none transition-all cursor-pointer"
                                    >
                                        <option value="">Tgl</option>
                                        {Array.from({length: 31}, (_, i) => (
                                            <option key={i+1} value={i+1}>{i+1}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                                </div>
                                
                                {/* BULAN */}
                                <div className="relative">
                                    <select 
                                        value={formData.birth_date.bulan}
                                        onChange={(e) => setFormData({...formData, birth_date: {...formData.birth_date, bulan: e.target.value}})}
                                        className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-3 py-3 text-xs text-white focus:border-[#ef3333] outline-none appearance-none transition-all cursor-pointer"
                                    >
                                        <option value="">Bulan</option>
                                        {["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"].map((m, i) => (
                                            <option key={i+1} value={i+1}>{m}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                                </div>

                                {/* TAHUN */}
                                <div className="relative">
                                    <select 
                                        value={formData.birth_date.tahun}
                                        onChange={(e) => setFormData({...formData, birth_date: {...formData.birth_date, tahun: e.target.value}})}
                                        className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-3 py-3 text-xs text-white focus:border-[#ef3333] outline-none appearance-none transition-all cursor-pointer"
                                    >
                                        <option value="">Tahun</option>
                                        {Array.from({length: 80}, (_, i) => {
                                            const year = new Date().getFullYear() - i;
                                            return <option key={year} value={year}>{year}</option>
                                        })}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:pl-[10.5rem] pt-6 pb-10">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full md:w-auto px-12 py-4 bg-[#ef3333] hover:bg-red-700 text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-red-900/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Simpan Profil
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
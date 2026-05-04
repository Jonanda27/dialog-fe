'use client';

import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { Camera, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UserProfileService } from "@/services/api/profile.service";
import { UpdateProfilePayload } from "@/types/userProfile";

export default function ProfilePage() {
    const { user, isInitialized } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // State form sesuai dengan UpdateProfilePayload dan tampilan UI
    const [formData, setFormData] = useState({
        username: "",
        phone_number: "",
        gender: "" as 'Laki-laki' | 'Perempuan' | '',
        birth_date: { tanggal: "", bulan: "", tahun: "" },
        profile_picture: undefined as File | undefined
    });

    // 1. FETCH DATA PROFIL SAAT COMPONENT MOUNT
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await UserProfileService.getMyProfile();
                if (response.success && response.data) {
                    const profile = response.data;
                    
                    // Pecah string tanggal (YYYY-MM-DD) ke objek select
                    let birthParts = { tanggal: "", bulan: "", tahun: "" };
                    if (profile.birth_date) {
                        const [year, month, day] = profile.birth_date.split('-');
                        // Hilangkan leading zero untuk value select
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

    // 2. HANDLE IMAGE SELECTION (Kirim File Object)
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

    // 3. HANDLE SAVE (Mengirim Object ke Service)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload: UpdateProfilePayload = {
                username: formData.username,
                phone_number: formData.phone_number,
                gender: formData.gender as 'Laki-laki' | 'Perempuan',
                // Gabungkan kembali tanggal untuk format database YYYY-MM-DD
                birth_date: formData.birth_date.tahun && formData.birth_date.bulan && formData.birth_date.tanggal 
                    ? `${formData.birth_date.tahun}-${formData.birth_date.bulan.padStart(2, '0')}-${formData.birth_date.tanggal.padStart(2, '0')}`
                    : undefined,
                profile_picture: formData.profile_picture 
            };

            const response = await UserProfileService.updateProfile(payload);
            
            if (response.success) {
                toast.success("Profil berhasil diperbarui");
                // Reload untuk sinkronisasi data di Sidebar (layout.tsx)
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
        <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#ef3333]" size={32} />
        </div>
    );

    return (
        <>
            {/* HEADER SECTION */}
            <div className="mb-10 border-b border-zinc-900 pb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Profil Saya</h2>
                <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Kelola informasi profil Anda untuk mengontrol dan mengamankan akun</p>
            </div>

            <form onSubmit={handleSave} className="flex flex-col lg:flex-row gap-16">
                {/* INPUT FIELDS */}
                <div className="flex-1 space-y-8">
                    <div className="grid grid-cols-1 gap-6">
                        
                        {/* Username */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
                            <label className="md:w-32 text-[10px] font-black text-zinc-500 uppercase tracking-widest md:text-right">Username</label>
                            <div className="flex-1">
                                <input 
                                    type="text" 
                                    value={formData.username} 
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className="w-full bg-transparent border-b border-zinc-800 focus:border-[#ef3333] text-white text-sm font-bold py-2 outline-none transition-all" 
                                />
                            </div>
                        </div>

                        {/* Nama (TETAP DITAMPILKAN - Sesuai Request) */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
                            <label className="md:w-32 text-[10px] font-black text-zinc-500 uppercase tracking-widest md:text-right">Nama</label>
                            <input 
                                type="text" 
                                value={user?.full_name || ""} 
                                disabled
                                className="flex-1 bg-[#0a0a0b] border border-zinc-800 rounded-xl px-5 py-3 text-sm text-white opacity-50 cursor-not-allowed" 
                            />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
                            <label className="md:w-32 text-[10px] font-black text-zinc-500 uppercase tracking-widest md:text-right">Email</label>
                            <div className="flex-1 flex items-center gap-3">
                                <span className="text-sm text-white font-medium">
                                    {user?.email ? user.email.replace(/(.{2})(.*)(?=@)/, "$1********") : ""}
                                </span>
                                <button type="button" className="text-[10px] font-black text-blue-500 uppercase hover:underline">Ubah</button>
                            </div>
                        </div>

                        {/* Nomor Telepon */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
                            <label className="md:w-32 text-[10px] font-black text-zinc-500 uppercase tracking-widest md:text-right">Nomor HP</label>
                            <input 
                                type="text" 
                                value={formData.phone_number}
                                placeholder="Contoh: 08123456789"
                                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                                className="flex-1 bg-[#0a0a0b] border border-zinc-800 rounded-xl px-5 py-3 text-sm text-white focus:border-[#ef3333] outline-none transition-all" 
                            />
                        </div>

                        {/* Jenis Kelamin */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
                            <label className="md:w-32 text-[10px] font-black text-zinc-500 uppercase tracking-widest md:text-right">Jenis Kelamin</label>
                            <div className="flex gap-6">
                                {['Laki-laki', 'Perempuan'].map((gender) => (
                                    <label key={gender} className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="radio" 
                                            name="gender" 
                                            value={gender}
                                            checked={formData.gender === gender}
                                            onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                                            className="w-4 h-4 accent-[#ef3333] bg-[#0a0a0b] border-zinc-800" 
                                        />
                                        <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">{gender}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Tanggal Lahir */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
                            <label className="md:w-32 text-[10px] font-black text-zinc-500 uppercase tracking-widest md:text-right">Tgl Lahir</label>
                            <div className="flex-1 grid grid-cols-3 gap-3">
                                <select 
                                    value={formData.birth_date.tanggal}
                                    onChange={(e) => setFormData({...formData, birth_date: {...formData.birth_date, tanggal: e.target.value}})}
                                    className="bg-[#0a0a0b] border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-[#ef3333] outline-none appearance-none"
                                >
                                    <option value="">Tanggal</option>
                                    {Array.from({length: 31}, (_, i) => (
                                        <option key={i+1} value={i+1}>{i+1}</option>
                                    ))}
                                </select>
                                <select 
                                    value={formData.birth_date.bulan}
                                    onChange={(e) => setFormData({...formData, birth_date: {...formData.birth_date, bulan: e.target.value}})}
                                    className="bg-[#0a0a0b] border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-[#ef3333] outline-none appearance-none"
                                >
                                    <option value="">Bulan</option>
                                    {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, i) => (
                                        <option key={i+1} value={i+1}>{m}</option>
                                    ))}
                                </select>
                                <select 
                                    value={formData.birth_date.tahun}
                                    onChange={(e) => setFormData({...formData, birth_date: {...formData.birth_date, tahun: e.target.value}})}
                                    className="bg-[#0a0a0b] border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-[#ef3333] outline-none appearance-none"
                                >
                                    <option value="">Tahun</option>
                                    {Array.from({length: 80}, (_, i) => {
                                        const year = new Date().getFullYear() - i;
                                        return <option key={year} value={year}>{year}</option>
                                    })}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="md:ml-42 pt-6">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="px-12 py-4 bg-[#ef3333] hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-red-900/20 active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Simpan
                        </button>
                    </div>
                </div>

                {/* PHOTO UPLOAD (KANAN) */}
                <div className="lg:w-72 flex flex-col items-center gap-6 border-l border-zinc-900 lg:pl-16">
                    <div className="relative">
                        <div className="w-36 h-36 rounded-full border-4 border-zinc-800 overflow-hidden bg-zinc-900 shadow-2xl">
                            <img 
                                src={previewUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name}&backgroundColor=ef3333`} 
                                className="w-full h-full object-cover" 
                                alt="Profile Big" 
                            />
                        </div>
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-1 right-1 p-2.5 bg-zinc-800 border border-zinc-700 rounded-full text-[#ef3333] hover:bg-[#ef3333] hover:text-white transition-all shadow-xl"
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
                    
                    <div className="text-center space-y-2">
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-zinc-700 transition-all"
                        >
                            Pilih Gambar
                        </button>
                        <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter leading-tight">
                            <p>Ukuran gambar: maks. 1 MB</p>
                            <p>Format gambar: .JPEG, .PNG</p>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
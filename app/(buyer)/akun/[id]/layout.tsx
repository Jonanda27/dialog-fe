'use client';

import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { 
    User, Banknote, MapPin, Lock, Bell, ShieldCheck, 
    Camera, Loader2, ChevronDown, ChevronRight, 
    Package, Star, UserCircle, Menu, X 
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { UserProfileService } from "@/services/api/profile.service";
import { UserProfile } from "@/types/userProfile";
import { toast } from "sonner";

export default function AkunLayout({ children }: { children: React.ReactNode }) {
    const { user, isInitialized } = useAuthStore();
    const params = useParams();
    const pathname = usePathname();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    // State untuk kontrol accordion "Akun Saya"
    const [isAccountOpen, setIsAccountOpen] = useState(true);
    // State untuk mobile sidebar toggle
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const userId = params.id as string;

    useEffect(() => {
        const fetchSidebarData = async () => {
            try {
                const response = await UserProfileService.getMyProfile();
                if (response.success && response.data) {
                    setProfile(response.data);
                    if (response.data.profile_picture_url) {
                        setPreviewUrl(response.data.profile_picture_url);
                    }
                }
            } catch (error) {
                console.error("Gagal memuat profil sidebar:", error);
            } finally {
                setIsFetching(false);
            }
        };

        if (isInitialized) fetchSidebarData();
    }, [isInitialized]);

    // Tutup sidebar mobile otomatis saat pindah halaman
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    const handleQuickFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) return toast.error("Maksimal 1MB");
            
            try {
                const response = await UserProfileService.updateProfile({ profile_picture: file });
                if (response.success) {
                    setPreviewUrl(URL.createObjectURL(file));
                    toast.success("Foto profil diperbarui");
                }
            } catch (error) {
                toast.error("Gagal mengupdate foto");
            }
        }
    };

    if (!isInitialized || isFetching) return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#ef3333]" size={32} />
        </div>
    );

    const accountSubItems = [
        { name: 'Profil', icon: User, path: `/akun/${userId}` },
        { name: 'Bank & Kartu', icon: Banknote, path: `/akun/${userId}/bank-kartu` },
        { name: 'Alamat', icon: MapPin, path: `/akun/${userId}/alamat` },
        { name: 'Ubah Password', icon: Lock, path: `/akun/${userId}/password` },
        { name: 'Notifikasi', icon: Bell, path: `/akun/${userId}/notifications` },
        { name: 'Privasi', icon: ShieldCheck, path: `/akun/${userId}/privacy` },
    ];

    const otherMenus = [
        { name: 'Pesanan', icon: Package, path: `/akun/${userId}/pesanan` },
        { name: 'Grading', icon: Star, path: `/akun/${userId}/grading` },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0b]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:py-10 py-6">
                
                {/* MOBILE HEADER TOGGLE */}
                <div className="lg:hidden flex items-center justify-between mb-6 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                    <div className="flex items-center gap-3">
                        <img 
                            src={previewUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name}&backgroundColor=ef3333`} 
                            className="w-10 h-10 rounded-full border border-zinc-700 object-cover" 
                            alt="Avatar" 
                        />
                        <span className="text-white font-bold text-xs uppercase tracking-wider truncate max-w-[150px]">
                            {profile?.username || user?.full_name}
                        </span>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 bg-zinc-800 rounded-lg text-white"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                    
                    {/* SIDEBAR NAVIGATION */}
                    <aside className={`
                        ${isSidebarOpen ? "block" : "hidden"} 
                        lg:block w-full lg:w-72 space-y-6 transition-all duration-300
                    `}>
                        {/* INFO USER & AVATAR (Desktop) */}
                        <div className="hidden lg:flex items-center gap-4 px-2">
                            <div className="relative group">
                                <img 
                                    src={previewUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name}&backgroundColor=ef3333`} 
                                    className="w-14 h-14 rounded-full border-2 border-zinc-800 object-cover" 
                                    alt="Avatar" 
                                />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-black text-white uppercase truncate">
                                    {profile?.username || user?.full_name}
                                </p>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1 hover:text-white transition-colors"
                                >
                                    <Camera size={10} /> Ubah Profil
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleQuickFileChange} 
                                />
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {/* PARENT MENU: AKUN SAYA */}
                            <div className="space-y-1">
                                <button 
                                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest bg-zinc-900/50 text-white border border-zinc-800 hover:border-zinc-700`}
                                >
                                    <div className="flex items-center gap-3">
                                        <UserCircle size={18} className="text-[#ef3333]" />
                                        <span>Akun Saya</span>
                                    </div>
                                    {isAccountOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>

                                {/* SUB-MENU ITEMS */}
                                {isAccountOpen && (
                                    <div className="pl-4 space-y-1 mt-1 border-l border-zinc-800 ml-6">
                                        {accountSubItems.map((item) => {
                                            const isActive = pathname === item.path;
                                            return (
                                                <Link 
                                                    key={item.path} 
                                                    href={item.path}
                                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest ${
                                                        isActive 
                                                        ? "text-[#ef3333] bg-[#ef3333]/5" 
                                                        : "text-zinc-500 hover:text-white hover:bg-zinc-900"
                                                    }`}
                                                >
                                                    <item.icon size={14} /> {item.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* MENU UTAMA LAINNYA */}
                            <div className="pt-2 space-y-1">
                                {otherMenus.map((item) => {
                                    const isActive = pathname === item.path;
                                    return (
                                        <Link 
                                            key={item.path} 
                                            href={item.path}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest ${
                                                isActive 
                                                ? "bg-[#ef3333]/10 text-[#ef3333] border border-[#ef3333]/20" 
                                                : "text-zinc-500 hover:bg-zinc-900 hover:text-white border border-transparent"
                                            }`}
                                        >
                                            <item.icon size={18} /> {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>
                    </aside>

                    {/* CONTENT AREA */}
                    <main className="flex-1 bg-[#111114] border border-zinc-800 rounded-3xl lg:rounded-[2.5rem] p-5 md:p-8 lg:p-12 shadow-2xl min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
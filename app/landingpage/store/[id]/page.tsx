"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// INTEGRASI SERVICES
import { StoreService } from "@/services/api/store.service";
import { ProductService } from "@/services/api/product.service";

// INTEGRASI TYPES
import { Product } from "@/types/product";
import { Store as StoreType } from "@/types/store";
import { 
    Loader2, ShieldCheck, MapPin, Calendar, Clock, 
    Disc, ArrowLeft, Star, X, Info
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

const CustomIcons = {
    Instagram: ({ className }: { className?: string }) => (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
    )
};

export default function StoreDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [store, setStore] = useState<StoreType | null>(null);
    const [storeProducts, setStoreProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
     const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchStoreData();
        }
    }, [params.id]);

    /**
     * LOGIKA INTI: Mengambil data toko dan produk spesifik toko tersebut
     */
    const fetchStoreData = async () => {
        try {
            setIsLoading(true);
            
            // Mengambil detail toko dan produk secara paralel
            // Menambahkan query param { store_id: params.id } untuk filter backend
            const [storeRes, productRes] = await Promise.all([
                StoreService.getStoreById(params.id as string),
                ProductService.getAll({ store_id: params.id as string })
            ]);
            
            if (storeRes.success) {
                setStore(storeRes.data);
            } else {
                toast.error("Toko tidak ditemukan");
            }

            if (productRes.success) {
                /**
                 * PERBAIKAN: Client-side filtering as safety measure
                 * Memastikan data yang masuk ke state benar-benar hanya milik store ini
                 */
                const filteredProducts = productRes.data.filter(
                    (p: Product) => p.store_id === params.id || p.store?.id === params.id
                );
                setStoreProducts(filteredProducts);
            }
        } catch (error: any) {
            console.error("Gagal memuat data toko:", error?.message || error);
            toast.error("Terjadi kesalahan saat memuat data");
        } finally {
            setIsLoading(false);
        }
    };

    const formatIDR = (num: number | string) => {
        const value = typeof num === 'string' ? parseFloat(num) : num;
        return "Rp" + (value || 0).toLocaleString("id-ID").replace(/,/g, ".");
    };

    const formatJoinDate = (dateString: string | null | undefined) => {
        if (!dateString) return "April 2026";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#ef3333]" size={40} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Menyinkronkan Storefront...</p>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-6">
                <Disc className="text-zinc-800" size={64} />
                <p className="text-white font-black uppercase tracking-widest">Toko Tidak Ditemukan</p>
                <button onClick={() => router.push('/')} className="bg-[#ef3333] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest">Kembali ke Beranda</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans flex flex-col">

             {/* NAVBAR */}
            <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 px-6 ${scrolled ? "bg-[#111114] shadow-xl py-2 border-b border-zinc-800" : "bg-[#0a0a0b] py-4"}`}>
                <div className="w-full flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black text-[#ef3333] tracking-tighter cursor-pointer uppercase shrink-0">
                        Analog<span className="text-white">.id</span>
                    </Link>

                    <div className="hidden md:flex flex-1 max-w-xl mx-10 relative">
                        <input type="text" placeholder="Cari piringan hitam atau kaset..." className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#ef3333] transition-all" />
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                        <Link href="/auth/login" className="text-sm font-bold hover:text-[#ef3333] transition-colors">Masuk</Link>
                        <Link href="/auth/register" className="bg-[#ef3333] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">Daftar</Link>
                    </div>
                </div>
            </nav>
            
            {/* --- HEADER SECTION --- */}
            <div className="relative h-[300px] md:h-[400px] shrink-0">
                <img 
                    src={getImageUrl(store.banner_url) || "https://images.unsplash.com/photo-1535992165812-68d1863aa354?q=80&w=1600"} 
                    className="w-full h-full object-cover" 
                    alt="Store Banner" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/40 to-transparent" />
                
                {/* Back Button */}
                <button 
                    onClick={() => router.push('/')}
                    className="absolute top-8 left-8 p-3 bg-black/40 hover:bg-[#ef3333] text-white rounded-full backdrop-blur-md transition-all z-20 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>

                <div className="absolute bottom-0 left-0 w-full p-8 lg:p-12 flex flex-col md:flex-row items-end gap-6 text-left">
                    <div className="relative shrink-0">
                        <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-[#0a0a0b] border-4 border-emerald-500 flex items-center justify-center overflow-hidden shadow-2xl">
                            {getImageUrl(store.logo_url) ? 
                                <img src={getImageUrl(store.logo_url)!} className="w-full h-full object-cover" alt="Logo" /> : 
                                <span className="text-emerald-500 font-black text-3xl uppercase">{store.name?.substring(0,2)}</span>
                            }
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-[#0a0a0b] flex items-center justify-center shadow-lg">
                            <ShieldCheck size={14} className="text-white" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-2xl">{store.name}</h1>
                            {store.status === 'approved' && <span className="hidden md:block bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Verified</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-5 text-zinc-400 font-bold">
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest"><MapPin size={14} className="text-[#ef3333]" /> Bandung, ID</div>
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest"><Calendar size={14} className="text-[#ef3333]" /> Bergabung {formatJoinDate(store.created_at)}</div>
                            {store.social_links?.instagram && (
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest"><CustomIcons.Instagram className="text-pink-500" /> @{store.social_links.instagram}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTENT SECTION --- */}
            <div className="flex-1 p-8 lg:p-12">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* Sidebar Info */}
                        <div className="lg:col-span-3 space-y-8 text-left">
                            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#ef3333]/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-[#ef3333]/10 transition-all duration-700"></div>
                                
                                <div className="flex items-center gap-3 border-b border-zinc-800 pb-5 mb-2 relative z-10">
                                    <div className="w-10 h-10 rounded-2xl bg-[#ef3333]/10 flex items-center justify-center text-[#ef3333] border border-[#ef3333]/20">
                                        <Clock size={20} />
                                    </div>
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Operasional</h4>
                                </div>
                                
                                <div className="space-y-5 relative z-10">
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Hari Kerja</p>
                                        <p className="text-zinc-200 text-sm font-black tracking-tight">{store.working_days || "Senin - Sabtu"}</p>
                                    </div>
                                    <div className="h-px w-full bg-gradient-to-r from-zinc-900 via-zinc-800/50 to-zinc-900"></div>
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Jam Layanan</p>
                                        <p className="text-[#ef3333] text-lg font-black tracking-tighter italic">
                                            {store.working_hours || "09:00 - 17:00"} 
                                            <span className="text-[10px] text-zinc-500 ml-2 font-bold not-italic tracking-widest">WIB</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 space-y-4 text-left shadow-xl">
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Info size={14} className="text-[#ef3333]" /> Tentang Toko
                                </h4>
                                <p className="text-xs text-zinc-400 font-medium leading-relaxed italic border-l-2 border-[#ef3333]/30 pl-4">
                                    "{store.description || "Kami menyediakan koleksi audio analog terbaik untuk para kolektor sejati."}"
                                </p>
                            </div>

                            {/* Statistik Ringkas */}
                            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 shadow-xl">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="text-center md:text-left">
                                        <div className="flex items-center gap-1.5 justify-center md:justify-start">
                                            <span className="text-xl font-black text-white">4.9</span>
                                            <Star size={14} className="text-orange-500 fill-orange-500" />
                                        </div>
                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Rating Toko</p>
                                    </div>
                                    <div className="text-center md:text-left border-l border-zinc-800 pl-6">
                                        <span className="text-xl font-black text-white">1.2K</span>
                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Followers</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content (Products) */}
                        <div className="lg:col-span-9 space-y-10">
                            <div className="flex items-center justify-between border-b border-zinc-900 pb-6">
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-1.5 h-8 bg-[#ef3333] rounded-full shadow-[0_0_15px_rgba(239,51,51,0.5)]" />
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight ">Katalog Rilisan</h3>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Menampilkan koleksi orisinal dari {store.name}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-zinc-400 uppercase bg-zinc-900 border border-zinc-800 px-5 py-2.5 rounded-full tracking-widest">
                                    {storeProducts.length} Items
                                </span>
                            </div>

                            {/* Products Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 text-left">
                                {storeProducts.length > 0 ? (
                                    storeProducts.map((p) => (
                                        <Link 
                                            href={`/landingpage/product/${p.id}`} 
                                            key={p.id} 
                                            className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] overflow-hidden group hover:border-[#ef3333]/50 transition-all duration-500 shadow-lg hover:shadow-[#ef3333]/5 flex flex-col h-full"
                                        >
                                            <div className="aspect-[4/5] bg-zinc-900 relative overflow-hidden">
                                                {getImageUrl(p.media?.[0]?.media_url) ? (
                                                    <img 
                                                        src={getImageUrl(p.media?.[0]?.media_url)!} 
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 group-hover:opacity-100" 
                                                        alt={p.name} 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-800 bg-[#0a0a0b]">
                                                        <Disc size={48} className="animate-pulse" />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 right-4 bg-[#ef3333] px-2.5 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest shadow-xl">
                                                    {p.metadata?.media_grading || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="p-6 flex flex-col flex-1">
                                                <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1.5 truncate">{p.metadata?.artist || 'Unknown Artist'}</h4>
                                                <h4 className="text-white font-black text-[13px] uppercase truncate group-hover:text-[#ef3333] transition-colors leading-tight mb-3">{p.name}</h4>
                                                <div className="mt-auto pt-4 border-t border-zinc-900/50">
                                                    <p className="text-[#ef3333] font-black text-base">{formatIDR(p.price)}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full py-32 text-center flex flex-col items-center justify-center bg-[#111114]/50 border-2 border-dashed border-zinc-900 rounded-[3rem]">
                                        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
                                            <Disc className="text-zinc-800" size={40} />
                                        </div>
                                        <span className="uppercase text-[11px] font-black tracking-[0.3em] text-zinc-600">Belum ada koleksi yang dipajang</span>
                                        <p className="text-[10px] text-zinc-700 font-bold uppercase mt-2">Silakan kembali lagi nanti</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FOOTER --- */}
            <footer className="bg-[#121212] border-t border-zinc-900 py-16 text-center mt-auto">
                <div className="text-2xl font-black text-[#ef3333] mb-4 uppercase tracking-tighter">
                    Analog<span className="text-white">.id</span>
                </div>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Official Store Catalog • {store.name}</p>
                <div className="mt-8 flex justify-center gap-6">
                    <div className="w-10 h-[1px] bg-zinc-800 self-center"></div>
                    <Star className="text-zinc-800" size={12} />
                    <div className="w-10 h-[1px] bg-zinc-800 self-center"></div>
                </div>
            </footer>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
            `}</style>
        </div>
    );
}
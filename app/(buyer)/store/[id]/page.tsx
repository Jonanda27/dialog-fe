"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// INTEGRASI SERVICES
import { StoreService } from "@/services/api/store.service";
import { productService } from "@/services/api/product.service";
import { CategoryService } from "@/services/api/category.service";

// INTEGRASI TYPES
import { Product } from "@/types/product";
import { Store as StoreType } from "@/types/store";
import { 
    Loader2, ShieldCheck, MapPin, Calendar, Clock, 
    Disc, ArrowLeft, LayoutGrid, ChevronDown, Tag, Circle, Image as ImageIcon,
    ChevronRight, Menu, X, Filter
} from "lucide-react";
import { toast } from "react-hot-toast";

/** * HELPER URL GAMBAR DISESUAIKAN */
const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path || path === "") return null;
    if (path.startsWith("http")) return path;
    const baseUrl = "http://localhost:5000";
    const cleanPath = path.replace(/^\/+/, "");
    if (cleanPath.startsWith("public/")) {
        return `${baseUrl}/${cleanPath}`;
    }
    return `${baseUrl}/public/${cleanPath}`;
};

const formatJoinDate = (dateString: string | null | undefined) => {
    if (!dateString) return "April 2026";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};

export default function StoreDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [store, setStore] = useState<StoreType | null>(null);
    const [storeProducts, setStoreProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // STATE KATEGORI (Sidebar Accordion)
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (params.id) {
            fetchStoreData();
            handleFetchCategories();
        }
    }, [params.id]);

    const handleFetchCategories = async () => {
        setIsLoadingCategories(true);
        try {
            const res: any = await CategoryService.getAllCategories();
            const finalData = Array.isArray(res) ? res : (res.data || []);
            setCategories(finalData);
            if(finalData.length > 0) {
                setOpenCategories({ [finalData[0].id]: true });
            }
        } catch (err) {
            console.error("Gagal mengambil kategori", err);
        } finally {
            setIsLoadingCategories(false);
        }
    };

    const toggleCategory = (catId: string) => {
        setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

    const fetchStoreData = async () => {
        try {
            setIsLoading(true);
            const [storeRes, productRes] = await Promise.all([
                StoreService.getStoreById(params.id as string),
                productService.getAll({ store_id: params.id as string })
            ]);
            
            if (storeRes.success) {
                setStore(storeRes.data);
            } else {
                toast.error("Toko tidak ditemukan");
            }

            if (productRes.success) {
                const filteredProducts = productRes.data.filter(
                    (p: Product) => p.store_id === params.id || p.store?.id === params.id
                );
                setStoreProducts(filteredProducts);
            }
        } catch (error: any) {
            console.error("Gagal memuat data toko:", error);
            toast.error("Terjadi kesalahan saat memuat data");
        } finally {
            setIsLoading(false);
        }
    };

    const formatIDR = (num: number | string) => {
        const value = typeof num === 'string' ? parseFloat(num) : num;
        return "Rp " + (value || 0).toLocaleString("id-ID");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-4 px-6">
                <Loader2 className="animate-spin text-[#ef3333]" size={40} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Menyinkronkan Storefront...</p>
            </div>
        );
    }

    if (!store) return null;

    // Sidebar Content (Reusable)
    const SidebarContent = () => (
        <div className="space-y-6">
            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-7 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#ef3333]/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#ef3333]/10 flex items-center justify-center text-[#ef3333] border border-[#ef3333]/20"><Clock size={18} /></div>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-[0.15em]">Operasional</h4>
                    </div>
                </div>
                <div className="space-y-4 relative z-10">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Hari Kerja</span>
                        <p className="text-zinc-200 text-sm font-black tracking-tight">{store.working_days || "Senin - Sabtu"}</p>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Jam Layanan</span>
                        <p className="text-[#ef3333] text-lg font-black tracking-tighter ">{store.working_hours || "09:00 - 17:00"}</p>
                    </div>
                </div>
            </div>

            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-6 lg:p-8 overflow-hidden shadow-lg">
                <div className="flex items-center gap-3 mb-8">
                    <LayoutGrid size={18} className="text-[#ef3333]" />
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Koleksi Media</h4>
                </div>
                <div className="space-y-4">
                    <button 
                        onClick={() => { setSelectedSubCategoryId(null); setIsMobileMenuOpen(false); }} 
                        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedSubCategoryId === null ? "bg-[#ef3333] text-white shadow-lg" : "text-zinc-500 hover:bg-white/5 hover:text-white"}`}
                    >
                        Semua Produk <ChevronRight size={14} className={selectedSubCategoryId === null ? "opacity-100" : "opacity-0"} />
                    </button>
                    {categories.map((cat: any) => (
                        <div key={cat.id} className="space-y-2 text-left">
                            <button onClick={() => toggleCategory(cat.id)} className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 rounded-xl transition-all group">
                                <div className="flex items-center gap-3">
                                    <span className="text-base">{cat.icon}</span>
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{cat.name}</span>
                                </div>
                                <ChevronDown size={14} className={`text-zinc-600 transition-transform ${openCategories[cat.id] ? 'rotate-180' : ''}`} />
                            </button>
                            <div className={`space-y-1.5 overflow-hidden transition-all ${openCategories[cat.id] ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                <div className="border-l border-zinc-900 ml-5 pl-4 space-y-1">
                                    {cat.subCategories?.map((sub: any) => (
                                        <button 
                                            key={sub.id} 
                                            onClick={() => { setSelectedSubCategoryId(sub.id); setIsMobileMenuOpen(false); }} 
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-left ${selectedSubCategoryId === sub.id ? "text-[#ef3333] bg-[#ef3333]/5" : "text-zinc-500 hover:text-zinc-300"}`}
                                        >
                                            {sub.name} <Tag size={10} className={selectedSubCategoryId === sub.id ? "opacity-100" : "opacity-0"} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans flex flex-col overflow-x-hidden">
            
            {/* MOBILE FILTER DRAWER */}
            <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isMobileMenuOpen ? "visible" : "invisible"}`}>
                <div className={`absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-500 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setIsMobileMenuOpen(false)} />
                <div className={`absolute right-0 top-0 h-full w-[85%] max-w-[320px] bg-[#0a0a0b] p-6 border-l border-zinc-900 overflow-y-auto transition-transform duration-500 transform ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white ">Filter <span className="text-[#ef3333]">Store</span></h2>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
                    </div>
                    <SidebarContent />
                </div>
            </div>

            {/* HEADER SECTION */}
            <div className="relative h-[45vh] md:h-[55vh] min-h-[400px] shrink-0">
                <img 
                    src={getImageUrl(store.banner_url) || "https://images.unsplash.com/photo-1535992165812-68d1863aa354?q=80&w=1600"} 
                    className="w-full h-full object-cover" 
                    alt="Store Banner" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/40 to-transparent" />
                
                <div className="absolute top-8 left-6 right-6 flex justify-between items-center z-20 lg:left-12 lg:right-12">
                    <button onClick={() => router.back()} className="p-3 bg-black/40 hover:bg-[#ef3333] text-white rounded-full backdrop-blur-md transition-all group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    
                    {/* Tombol Filter di Mobile */}
                    <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#ef3333] text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#ef3333]/20">
                        <Filter size={14} /> Filter
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 lg:p-12 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                    <div className="relative shrink-0">
                        <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[2rem] bg-[#0a0a0b] border-4 border-emerald-500 flex items-center justify-center overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            {store.logo_url ? 
                                <img src={getImageUrl(store.logo_url)!} className="w-full h-full object-cover" alt="Logo" /> : 
                                <span className="text-emerald-500 font-black text-3xl uppercase">{store.name?.substring(0,2)}</span>
                            }
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-[#0a0a0b] flex items-center justify-center shadow-lg">
                            <ShieldCheck size={18} className="text-white" />
                        </div>
                    </div>
                    <div className="space-y-4 pb-2">
                        <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none  drop-shadow-2xl">{store.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-zinc-400 font-bold">
                            <div className="flex items-center gap-2 text-[8px] md:text-[9px] uppercase tracking-[0.2em] bg-zinc-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-zinc-800"><MapPin size={12} className="text-[#ef3333]" /> {store.location || 'Bandung, ID'}</div>
                            <div className="flex items-center gap-2 text-[8px] md:text-[9px] uppercase tracking-[0.2em] bg-zinc-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-zinc-800"><Calendar size={12} className="text-[#ef3333]" /> Bergabung {formatJoinDate(store.created_at)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT SECTION */}
            <div className="flex-1 p-5 md:p-8 lg:p-12">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        
                        {/* SIDEBAR (DESKTOP) */}
                        <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-28">
                            <SidebarContent />
                        </div>

                        {/* PRODUCT LIST (RIGHT) */}
                        <div className="lg:col-span-9 space-y-8 md:space-y-12">
                            <div className="flex items-center justify-between border-b border-zinc-900 pb-8">
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-1.5 h-8 md:w-2 md:h-10 bg-[#ef3333] rounded-full shadow-[0_0_20px_rgba(239,51,51,0.4)]" />
                                    <div>
                                        <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter ">Katalog Rilisan</h3>
                                        <p className="text-[8px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                            {selectedSubCategoryId ? "Kategori Terpilih" : `Menampilkan ${storeProducts.length} Koleksi`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* GRID PRODUK: 2 Kolom di Mobile, 3-4 di Desktop */}
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 text-left">
                                {storeProducts
                                    .filter(p => !selectedSubCategoryId || p.sub_category_id === selectedSubCategoryId)
                                    .length > 0 ? (
                                    storeProducts
                                        .filter(p => !selectedSubCategoryId || p.sub_category_id === selectedSubCategoryId)
                                        .map((p) => (
                                        <Link href={`/landingpage/product/${p.id}`} key={p.id} className="bg-[#111114] border border-zinc-900 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden group hover:border-[#ef3333]/50 transition-all duration-500 shadow-lg flex flex-col h-full">
                                            <div className="aspect-square sm:aspect-[4/5] bg-zinc-900 relative overflow-hidden">
                                                {p.media?.[0]?.media_url ? (
                                                    <img src={getImageUrl(p.media[0].media_url)!} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.name} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-800"><Disc size={32} className="animate-spin-slow opacity-20" /></div>
                                                )}
                                                <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-[#ef3333] px-2 md:px-3 py-1 rounded-full text-[7px] md:text-[9px] font-black text-white uppercase tracking-widest shadow-2xl">{p.metadata?.media_grading || 'RAW'}</div>
                                            </div>
                                            <div className="p-3 md:p-6 flex flex-col flex-1">
                                                <div className="mb-2 md:mb-3">
                                                    <h4 className="text-[7px] md:text-[9px] font-black text-[#ef3333] uppercase tracking-[0.1em] md:tracking-[0.2em] mb-0.5 truncate">{p.metadata?.artist || 'VARIOUS ARTIST'}</h4>
                                                    <h4 className="text-white font-black text-[10px] md:text-sm uppercase line-clamp-2 group-hover:text-[#ef3333] transition-colors leading-tight">{p.name}</h4>
                                                </div>
                                                <div className="mt-auto pt-2 md:pt-4 border-t border-zinc-900">
                                                    <p className="text-white font-black text-xs md:text-lg tracking-tighter ">{formatIDR(p.price)}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-[#111114]/30 border-2 border-dashed border-zinc-900 rounded-[2rem]">
                                        <ImageIcon className="text-zinc-800 mb-6 opacity-20" size={50} />
                                        <span className="uppercase text-[10px] font-black tracking-[0.4em] text-zinc-600">Produk Kosong</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="bg-[#0a0a0b] border-t border-zinc-900 py-12 md:py-20 text-center mt-auto px-6">
                <div className="text-2xl md:text-3xl font-black text-[#ef3333] mb-4 uppercase tracking-tighter ">Analog<span className="text-white">.id</span></div>
                <p className="text-zinc-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em]">Official Store &copy; 2026 • {store.name}</p>
            </footer>
        </div>
    );
}
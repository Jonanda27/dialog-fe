"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// INTEGRASI SERVICES
import { StoreService } from "@/services/api/store.service";
import { productService } from "@/services/api/product.service";
import { CategoryService } from "@/services/api/category.service"; // Pastikan path import ini sesuai

// INTEGRASI TYPES
import { Product } from "@/types/product";
import { Store as StoreType } from "@/types/store";
import { Loader2, Disc } from "lucide-react";

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

export default function AnalogLandingPage() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [activeFilter, setActiveFilter] = useState("Semua");
    
    const [products, setProducts] = useState<Product[]>([]);
    const [featuredStores, setFeaturedStores] = useState<StoreType[]>([]);
    
    // STATE UNTUK SUB-KATEGORI DINAMIS & MAPPING ID
    const [subCategoriesList, setSubCategoriesList] = useState<string[]>(["Semua"]);
    const [subCategoryMap, setSubCategoryMap] = useState<Record<string, string>>({});
    
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        fetchInitialData();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            
            // Fetch Stores, Products, dan Categories secara paralel
            // Gunakan catch pada CategoryService agar jika gagal tidak memblokir render produk
            const [storeRes, productRes, categoryRes] = await Promise.all([
                StoreService.getAllStores({ status: 'approved' }),
                productService.getAll(),
                CategoryService.getAllCategories().catch(() => null) 
            ]);

            if (storeRes.success) setFeaturedStores(storeRes.data.slice(0, 4));
            if (productRes.success) setProducts(productRes.data);
            
            // Ekstrak data sub-kategori secara robust sesuai format JSON terbaru
            if (categoryRes) {
                // Handle struktur { success, data: [...] } atau array langsung [...]
                let rawCategories: any[] = [];
                if (Array.isArray(categoryRes.data)) {
                    rawCategories = categoryRes.data;
                } else if (Array.isArray(categoryRes)) {
                    rawCategories = categoryRes;
                }
                
                const extractedNames = new Set<string>();
                const mapIdToName: Record<string, string> = {};
                
                rawCategories.forEach((cat: any) => {
                    // Cek properti subCategories (camelCase sesuai response)
                    const subs = cat.subCategories || cat.sub_categories;
                    
                    if (subs && Array.isArray(subs) && subs.length > 0) {
                        subs.forEach((sub: any) => {
                            if (sub.name) {
                                extractedNames.add(sub.name);
                                // Simpan mapping ID ke Nama untuk proses filtering produk
                                if (sub.id) mapIdToName[sub.id] = sub.name; 
                            }
                        });
                    } else if (cat.name) {
                        // Fallback jika tidak ada subCategories
                        extractedNames.add(cat.name);
                        if (cat.id) mapIdToName[cat.id] = cat.name;
                    }
                });
                
                setSubCategoriesList(["Semua", ...Array.from(extractedNames)]);
                setSubCategoryMap(mapIdToName);
            }

        } catch (error: any) {
            console.error("Gagal memuat data landing page:", error?.message || error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatIDR = (num: number | string) => {
        const value = typeof num === 'string' ? parseFloat(num) : num;
        return "Rp" + (value || 0).toLocaleString("id-ID").replace(/,/g, ".");
    };

    // Filter produk berdasarkan sub-kategori yang aktif
    const displayedProducts = activeFilter === "Semua" 
        ? products 
        : products.filter(product => {
            // Jika backend mem-populate relasi sub_category langsung
            const nestedSubName = (product as any).sub_category?.name || (product as any).subCategory?.name;
            if (nestedSubName) return nestedSubName === activeFilter;

            // Jika backend HANYA mereturn sub_category_id (seperti data contoh sebelumnya)
            // Maka kita cari nama kategorinya menggunakan subCategoryMap yang sudah dibuat
            if (product.sub_category_id) {
                const mappedName = subCategoryMap[product.sub_category_id];
                return mappedName === activeFilter;
            }
            
            return false;
        });

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#ef3333]">
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

            <main className="pt-28 pb-20 max-w-[1200px] mx-auto px-4">
                {/* HERO */}
                <section className="w-full h-[300px] bg-[#1a1a1a] rounded-xl overflow-hidden mb-12 border border-zinc-800 relative group cursor-pointer shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10 flex flex-col justify-center px-12 text-left">
                        <h2 className="text-[#ef3333] font-black text-sm uppercase tracking-widest mb-2">Exclusively Drops</h2>
                        <h1 className="text-white text-5xl font-black uppercase leading-none">VINTAGE <br /> COLLECTION 2026</h1>
                    </div>
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=1200')] bg-cover bg-center opacity-50"></div>
                </section>

                {/* STOREFRONT SECTION */}
                <section className="mb-12 text-left">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter"><span className="bg-[#ef3333] p-1 rounded text-white text-xs">🏪</span> Featured Storefront</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-zinc-900/50 rounded-xl animate-pulse"></div>)
                        ) : (
                            featuredStores.map((store) => (
                                <Link href={`landingpage/store/${store.id}`} key={store.id} className="bg-[#111114] border border-zinc-800 p-6 rounded-xl flex flex-col items-center text-center hover:border-[#ef3333]/50 transition-all cursor-pointer group shadow-md">
                                    <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden mb-3">
                                        {getImageUrl(store.logo_url) ? <img src={getImageUrl(store.logo_url)!} className="w-full h-full object-cover" alt="" /> : "🏪"}
                                    </div>
                                    <h3 className="text-sm font-bold mb-1 line-clamp-1">{store.name}</h3>
                                    <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">✓ Verified</span>
                                </Link>
                            ))
                        )}
                    </div>
                </section>

                {/* PRODUCTS SECTION */}
                <section className="text-left">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-xl font-black uppercase tracking-tighter shrink-0 text-white">Terpopuler Untukmu</h2>
                        <div className="h-px flex-1 bg-zinc-900"></div>
                    </div>

                    {/* SUB-CATEGORY FILTERS DENGAN SCROLLBAR DISEMBUNYIKAN */}
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {subCategoriesList.map((cat) => (
                            <button 
                                key={cat} 
                                onClick={() => setActiveFilter(cat)} 
                                className={`shrink-0 px-5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeFilter === cat ? "bg-[#ef3333] border-[#ef3333] text-white shadow-[0_0_15px_rgba(239,51,51,0.3)]" : "bg-[#1a1a1e] border-zinc-800 text-zinc-500 hover:border-zinc-600"}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] bg-zinc-900/50 rounded-2xl animate-pulse"></div>)
                        ) : displayedProducts.length > 0 ? (
                            displayedProducts.map((product) => (
                                <Link href={`landingpage/product/${product.id}`} key={product.id} className="bg-[#111114] rounded-2xl border border-zinc-800 overflow-hidden cursor-pointer hover:shadow-2xl hover:border-[#ef3333]/50 transition-all flex flex-col h-full group shadow-lg">
                                    <div className="aspect-square relative overflow-hidden bg-black">
                                        <img 
                                            src={getImageUrl(product.media?.[0]?.media_url) ?? "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=600"} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" 
                                        />
                                        <div className="absolute top-2 right-2 bg-[#ef3333] px-2 py-1 rounded text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                                            {product.metadata?.media_grading || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="text-sm font-bold line-clamp-2 leading-snug text-zinc-100 group-hover:text-[#ef3333] transition-colors h-10">
                                            {product.metadata?.artist || 'Unknown'} - {product.name}
                                        </h3>
                                        <p className="text-[#ef3333] text-xl font-black mt-3 leading-none">{formatIDR(product.price)}</p>
                                        <div className="mt-auto pt-4 flex items-center gap-1 text-[11px] text-zinc-500 font-bold uppercase tracking-tight">
                                            <span className="text-yellow-500 text-xs">★</span>
                                            <span className="text-zinc-300">4.9</span>
                                            <span className="mx-1">•</span>
                                            <span className="line-clamp-1">{product.store?.name || 'Store'}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-500 bg-[#111114] rounded-2xl border border-zinc-800/50 border-dashed">
                                <Disc size={48} className="mb-4 opacity-30" />
                                <p className="font-medium text-sm">Tidak ada produk untuk kategori "{activeFilter}".</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// INTEGRASI SERVICES
import { StoreService } from "@/services/api/store.service";
import { productService } from "@/services/api/product.service";
import { CategoryService } from "@/services/api/category.service";

// INTEGRASI TYPES
import { Product } from "@/types/product";
import { Store as StoreType } from "@/types/store";
import { 
    Loader2, 
    Disc, 
    ChevronLeft, 
    ChevronRight, 
    Search, 
    ShoppingBag, 
    Store as StoreIcon, 
    Star, 
    ArrowRight,
    Flame
} from "lucide-react";

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
    
    // STATE KATEGORI
    const [subCategoriesList, setSubCategoriesList] = useState<string[]>(["Semua"]);
    const [subCategoryMap, setSubCategoryMap] = useState<Record<string, string>>({});
    
    const [isLoading, setIsLoading] = useState(true);

    // REF & STATE UNTUK SCROLL SUB-KATEGORI
    const categoryScrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    // STATE UNTUK FALLBACK LOGO (Jika logo.png tidak ditemukan)
    const [logoError, setLogoError] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        fetchInitialData();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        checkArrowsVisibility();
        window.addEventListener('resize', checkArrowsVisibility);
        return () => window.removeEventListener('resize', checkArrowsVisibility);
    }, [subCategoriesList]);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            const [storeRes, productRes, categoryRes] = await Promise.all([
                StoreService.getAllStores({ status: 'approved' }),
                productService.getAll(),
                CategoryService.getAllCategories().catch(() => null) 
            ]);

            if (storeRes.success) setFeaturedStores(storeRes.data.slice(0, 5));
            if (productRes.success) setProducts(productRes.data);
            
            if (categoryRes) {
                let rawCategories: any[] = categoryRes.data || categoryRes;
                const extractedNames = new Set<string>();
                const mapIdToName: Record<string, string> = {};
                
                rawCategories.forEach((cat: any) => {
                    const subs = cat.subCategories || cat.sub_categories;
                    if (subs && Array.isArray(subs) && subs.length > 0) {
                        subs.forEach((sub: any) => {
                            if (sub.name) {
                                extractedNames.add(sub.name);
                                if (sub.id) mapIdToName[sub.id] = sub.name; 
                            }
                        });
                    } else if (cat.name) {
                        extractedNames.add(cat.name);
                        if (cat.id) mapIdToName[cat.id] = cat.name;
                    }
                });
                setSubCategoriesList(["Semua", ...Array.from(extractedNames)]);
                setSubCategoryMap(mapIdToName);
            }
        } catch (error: any) {
            console.error("Gagal memuat data:", error?.message || error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatIDR = (num: number | string) => {
        const value = typeof num === 'string' ? parseFloat(num) : num;
        return "Rp" + (value || 0).toLocaleString("id-ID").replace(/,/g, ".");
    };

    const checkArrowsVisibility = () => {
        if (!categoryScrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 10);
    };

    const scrollCategory = (direction: 'left' | 'right') => {
        if (categoryScrollRef.current) {
            const scrollAmount = 400;
            categoryScrollRef.current.scrollBy({ 
                left: direction === 'left' ? -scrollAmount : scrollAmount, 
                behavior: 'smooth' 
            });
        }
    };

    const displayedProducts = activeFilter === "Semua" 
        ? products 
        : products.filter(product => {
            const nestedSubName = (product as any).sub_category?.name || (product as any).subCategory?.name;
            if (nestedSubName) return nestedSubName === activeFilter;
            if (product.sub_category_id) return subCategoryMap[product.sub_category_id] === activeFilter;
            return false;
        });

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#ef3333] selection:text-white overflow-x-hidden">
            
            {/* NAVBAR */}
            <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 px-6 ${scrolled ? "bg-[#111114] shadow-xl py-2 border-b border-zinc-800" : "bg-[#0a0a0b] py-4"}`}>
                <div className="w-full flex items-center justify-between">
                    <Link href="/" className="cursor-pointer shrink-0">
                        {!logoError ? (
                            <img 
                                src="/logo.png" 
                                alt="Analog.id Logo" 
                                className="h-8 md:h-10 w-auto object-contain"
                                onError={() => setLogoError(true)} 
                            />
                        ) : (
                            <div className="text-2xl font-black text-[#ef3333] tracking-tighter uppercase">
                                Analog<span className="text-white">.id</span>
                            </div>
                        )}
                    </Link>

                    <div className="hidden md:flex flex-1 max-w-xl mx-10 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input type="text" placeholder="Cari piringan hitam atau kaset..." className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#ef3333] transition-all text-white" />
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                        <Link href="/auth/login" className="text-sm font-bold hover:text-[#ef3333] transition-colors">Masuk</Link>
                        <Link href="/auth/register" className="bg-[#ef3333] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">Daftar</Link>
                    </div>
                </div>
            </nav>

            <main className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-8">
                
                {/* HERO BANNER SECTION */}
                <section className="flex flex-col md:flex-row gap-3 mb-12">
                    <div className="w-full md:w-2/3 h-[200px] sm:h-[250px] md:h-[300px] rounded-xl overflow-hidden border border-white/5 shadow-xl bg-[#121214]">
                        <img 
                            src="/banner.png" 
                            className="w-full h-full object-cover" 
                            style={{ objectPosition: 'center top' }}
                            alt="Main Banner"
                        />
                    </div>

                    <div className="w-full md:w-1/3 flex flex-col gap-3 h-[200px] sm:h-[250px] md:h-[300px]">
                        <div className="flex-1 rounded-xl overflow-hidden border border-white/5 shadow-xl bg-[#121214]">
                            <img 
                                src="/banner_side_1.png" 
                                className="w-full h-full object-cover" 
                                alt="Side Banner 1"
                                onError={(e) => { e.currentTarget.src = "/banner.png" }}
                            />
                        </div>
                        <div className="flex-1 rounded-xl overflow-hidden border border-white/5 shadow-xl bg-[#121214]">
                            <img 
                                src="/banner_side_2.png" 
                                className="w-full h-full object-cover" 
                                alt="Side Banner 2"
                                onError={(e) => { e.currentTarget.src = "/banner.png" }}
                            />
                        </div>
                    </div>
                </section>

                {/* FEATURED STORES SECTION */}
                <section className="mb-16">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Verified <span className="text-[#ef3333]">Stores</span></h2>
                            <div className="h-1 w-16 bg-[#ef3333] rounded-full mt-1" />
                        </div>
                        <Link href="/stores" className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-500 hover:text-[#ef3333] transition-colors tracking-widest group">
                            Explore All <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-36 bg-zinc-900/50 rounded-2xl animate-pulse" />)
                        ) : (
                            featuredStores.map((store) => (
                                <Link 
                                    href={`landingpage/store/${store.id}`} 
                                    key={store.id} 
                                    className="group relative overflow-hidden bg-zinc-900/20 border border-white/5 p-5 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:bg-zinc-900/40 hover:border-[#ef3333]/20 shadow-lg"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/10 p-1 transition-all duration-300 group-hover:scale-105 mb-3 overflow-hidden">
                                        {getImageUrl(store.logo_url) ? (
                                            <img src={getImageUrl(store.logo_url)!} className="w-full h-full object-cover rounded-xl" alt={store.name} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                                                <StoreIcon size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-black text-white group-hover:text-[#ef3333] transition-colors leading-tight line-clamp-1">{store.name}</h3>
                                    <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        <span className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">Verified</span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </section>

                {/* PRODUCTS GALLERY SECTION */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#ef3333] w-2 h-8 rounded-full" />
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Market <span className="text-[#ef3333]">Highlights</span></h2>
                        </div>

                        {/* SUB-CATEGORY FILTERS */}
                        <div className="relative group max-w-full md:max-w-[50%]">
                            {showLeftArrow && (
                                <button 
                                    onClick={() => scrollCategory('left')} 
                                    className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-white shadow-2xl hover:bg-[#ef3333] transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                            )}
                            <div 
                                ref={categoryScrollRef}
                                onScroll={checkArrowsVisibility}
                                className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth py-1 px-1"
                            >
                                {subCategoriesList.map((cat) => (
                                    <button 
                                        key={cat} 
                                        onClick={() => setActiveFilter(cat)} 
                                        className={`shrink-0 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 border ${
                                            activeFilter === cat 
                                            ? "bg-[#ef3333] border-[#ef3333] text-white shadow-lg shadow-red-900/20" 
                                            : "bg-zinc-900/50 border-white/10 text-zinc-500 hover:text-white"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            {showRightArrow && (
                                <button 
                                    onClick={() => scrollCategory('right')} 
                                    className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-white shadow-2xl hover:bg-[#ef3333] transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* PRODUCT GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="aspect-[3/4] bg-zinc-900/50 rounded-2xl animate-pulse border border-white/5" />
                            ))
                        ) : displayedProducts.length > 0 ? (
                            displayedProducts.map((product) => (
                                <Link 
                                    href={`landingpage/product/${product.id}`} 
                                    key={product.id} 
                                    className="group relative bg-[#121214] rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-lg flex flex-col h-full"
                                >
                                    <div className="aspect-square relative overflow-hidden bg-zinc-950 m-1.5 rounded-xl">
                                        <img 
                                            src={getImageUrl(product.media?.[0]?.media_url) ?? "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=600"} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                                        />
                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md text-[7px] font-black text-white uppercase tracking-widest">
                                            {product.metadata?.media_grading || 'STD'}
                                        </div>
                                    </div>
                                    
                                    <div className="px-4 pb-5 pt-1 flex flex-col flex-1">
                                        <div className="flex items-center gap-1 text-[#ef3333] text-[8px] font-black uppercase mb-1.5">
                                            <Disc size={8} />
                                            <span>{product.metadata?.format || 'Analog'}</span>
                                        </div>
                                        <h3 className="text-xs font-black text-white group-hover:text-[#ef3333] transition-colors line-clamp-2 leading-tight uppercase tracking-tight mb-2 h-7">
                                            {product.metadata?.artist || 'Unknown'} — {product.name}
                                        </h3>
                                        
                                        <div className="mt-auto">
                                            <p className="text-[#ef3333] text-base font-black tracking-tighter mb-3">{formatIDR(product.price)}</p>
                                            
                                            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <StoreIcon size={10} className="text-zinc-500" />
                                                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest truncate max-w-[60px]">{product.store?.name || 'Owner'}</span>
                                                </div>
                                                <div className="flex items-center gap-1 bg-yellow-500/5 px-1.5 py-0.5 rounded-md">
                                                    <Star size={8} className="text-yellow-500 fill-yellow-500" />
                                                    <span className="text-[8px] font-black text-yellow-500">4.9</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-700 bg-zinc-900/10 rounded-[3rem] border border-white/5 border-dashed">
                                <Disc size={48} className="mb-4 opacity-10 animate-spin-slow" />
                                <p className="text-sm font-black uppercase tracking-[0.2em] italic">No Items Found</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* MINI FOOTER */}
            <footer className="py-12 border-t border-white/5 bg-zinc-950/50">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        {/* Menggunakan logo yang sama di footer */}
                        {!logoError ? (
                            <img src="/logo.png" alt="Analog.id" className="h-6 w-auto grayscale opacity-80 hover:grayscale-0 transition-all" />
                        ) : (
                            <>
                                <Disc className="text-[#ef3333]" size={16} />
                                <span className="text-xs font-black uppercase tracking-tighter">Analog<span className="text-[#ef3333]">.id</span></span>
                            </>
                        )}
                    </div>
                    <p className="text-zinc-600 text-[8px] font-black uppercase tracking-[0.4em] text-center">
                        &copy; 2026 Analog.id — Authenticated Audio Artifacts.
                    </p>
                    <div className="flex gap-4 text-zinc-500 text-[8px] font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-white transition-colors">Instagram</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin-slow { animation: spin-slow 12s linear infinite; }
            `}</style>
        </div>
    );
}
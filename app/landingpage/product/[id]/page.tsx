"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// INTEGRASI
import { ProductService } from "@/services/api/product.service";
import { Product } from "@/types/product";
import { Loader2, Disc, ArrowLeft, ClipboardCheck, Star, MessageSquare, Store as StoreIcon, ThumbsUp, MoreVertical, Video, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";

/** * HELPER URL GAMBAR */
const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path || path === "") return null;
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    let cleanPath = path.startsWith("/") ? path : `/${path}`;
    if (!cleanPath.startsWith("/public")) cleanPath = `/public${cleanPath}`;
    return `${baseUrl}${cleanPath}`;
};

// TIPE DATA UNTUK DUMMY REVIEW AGAR TS TIDAK ERROR
type ReviewMedia = {
    type: "video" | "image";
    url: string;
    duration?: string; // Menjadikan duration opsional
};

type DummyReview = {
    id: number;
    user: string;
    avatar: string;
    rating: number;
    date: string;
    variation: string;
    attributes: Record<string, string> | null;
    comment: string;
    media: ReviewMedia[];
    helpful: number;
};

// DATA DUMMY ULASAN
const DUMMY_REVIEWS: DummyReview[] = [
    {
        id: 1,
        user: "amanahstoref4u2",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amanah",
        rating: 5,
        date: "2026-02-28 13:29",
        variation: "Vinyl Standard Black",
        attributes: {
            Desain: "baik",
            Kualitas: "baik",
            Kompatibilitas: "baik"
        },
        comment: "Ya awalnya saya cukup biasa-biasa aja ekspektasinya karena juga harganya yang relatif murah namun setelah memasangnya di turntable ternyata cukup baik dan menarik",
        media: [
            { type: "video", url: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=150&auto=format&fit=crop", duration: "0:04" },
            { type: "image", url: "https://images.unsplash.com/photo-1538688423619-a81d3f23454b?q=80&w=150&auto=format&fit=crop" },
            { type: "image", url: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=150&auto=format&fit=crop" }
        ],
        helpful: 2
    },
    {
        id: 2,
        user: "taufik_pul",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taufik",
        rating: 5,
        date: "2026-03-24 16:11",
        variation: "Cassette Edition",
        attributes: null,
        comment: "Bagus",
        media: [],
        helpful: 0
    },
    {
        id: 3,
        user: "budi_santoso99",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi",
        rating: 4,
        date: "2026-04-10 09:45",
        variation: "Vinyl Color Edition",
        attributes: {
            Kualitas: "sangat baik",
            Pengiriman: "standar"
        },
        comment: "Sleeve-nya mulus, suaranya juga masih renyah no kresek-kresek berlebih. Recommended seller pokoknya. Cuma pengiriman agak lama.",
        media: [
            { type: "image", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=150&auto=format&fit=crop" }
        ],
        helpful: 5
    }
];

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    
    // State untuk mengontrol gambar utama yang sedang aktif
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        if (params.id) fetchProductDetail();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [params.id]);

    const fetchProductDetail = async () => {
        try {
            setIsLoading(true);
            const res = await ProductService.getById(params.id as string);
            if (res.success) setProduct(res.data);
            // Reset index gambar ke 0 setiap kali data baru diload
            setActiveImageIndex(0);
        } catch (error) {
            console.error("Gagal memuat detail produk:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthRedirect = () => {
        router.push("/auth/login");
    };

    // Fungsi navigasi gambar prev/next (Menambahkan Optional Chaining & Fallback untuk TypeScript)
    const handlePrevImage = () => {
        const mediaLength = product?.media?.length || 0;
        if (mediaLength <= 1) return;
        setActiveImageIndex((prev) => (prev === 0 ? mediaLength - 1 : prev - 1));
    };

    const handleNextImage = () => {
        const mediaLength = product?.media?.length || 0;
        if (mediaLength <= 1) return;
        setActiveImageIndex((prev) => (prev === mediaLength - 1 ? 0 : prev + 1));
    };

    if (isLoading) return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#ef3333] w-10 h-10" />
        </div>
    );

    if (!product) return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-zinc-400 font-medium">
            <div className="text-center">
                <Disc className="mx-auto mb-4 opacity-50" size={48} />
                <p className="text-lg">Produk tidak ditemukan</p>
                <button onClick={() => router.push('/')} className="mt-4 text-[#ef3333] hover:underline text-sm">Kembali ke Beranda</button>
            </div>
        </div>
    );

    const formatIDR = (num: number | string) => 
        "Rp" + (Number(num) || 0).toLocaleString("id-ID").replace(/,/g, ".");

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#ef3333] selection:text-white">
            
            {/* NAVBAR */}
            <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 px-6 border-b ${scrolled ? "bg-[#0a0a0b]/80 backdrop-blur-md border-zinc-800/80 shadow-lg py-3" : "bg-transparent border-transparent py-5"}`}>
                <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black text-[#ef3333] tracking-tighter cursor-pointer uppercase shrink-0">
                        Analog<span className="text-white">.id</span>
                    </Link>

                    <div className="hidden md:flex flex-1 max-w-xl mx-10 relative group">
                        <input type="text" placeholder="Cari piringan hitam atau kaset..." className="w-full bg-zinc-900/50 border border-zinc-800 group-hover:border-zinc-700 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-[#ef3333] focus:bg-zinc-900 transition-all text-zinc-200 placeholder-zinc-500" />
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                        <Link href="/auth/login" className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors">Masuk</Link>
                        <Link href="/auth/register" className="bg-[#ef3333] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-red-600 hover:shadow-[0_0_15px_rgba(239,51,51,0.3)] transition-all">Daftar</Link>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="pt-32 pb-24 px-4 md:px-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    
                    {/* BREADCRUMB NAVIGATION (SHOPEE STYLE) */}
                    <div className="flex items-center gap-2 text-[13px] text-zinc-400 overflow-x-auto whitespace-nowrap scrollbar-hide w-full mb-2">
                        <Link href="/" className="text-zinc-400 hover:text-[#ef3333] transition-colors">
                            Analog.id
                        </Link>
                        <ChevronRight size={14} className="text-zinc-600 shrink-0" />
                        <Link href="/katalog" className="text-zinc-400 hover:text-[#ef3333] transition-colors">
                            Katalog
                        </Link>
                        <ChevronRight size={14} className="text-zinc-600 shrink-0" />
                        {/* Menampilkan kategori menggunakan sub_category_id */}
                        <Link href={`/category/${product.sub_category_id}`} className="text-zinc-400 hover:text-[#ef3333] transition-colors">
                            {/* Jika API mereturn sub_category.name gunakan itu, jika tidak tampilkan text fallback */}
                            {(product as any).sub_category?.name || "Kategori Produk"}
                        </Link>
                        <ChevronRight size={14} className="text-zinc-600 shrink-0" />
                        <span className="text-zinc-100 truncate max-w-[200px] sm:max-w-[300px]">
                            {product.name}
                        </span>
                    </div>

                    {/* Back Button */}
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium w-fit group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Halaman Sebelumnya
                    </button>

                    {/* PRODUCT DETAIL CARD */}
                    <div className="bg-[#12141a] rounded-[2rem] border border-zinc-800/60 overflow-hidden flex flex-col lg:flex-row shadow-2xl">
                        {/* Image Gallery Section */}
                        <div className="lg:w-[45%] bg-[#181a20] p-6 md:p-8 flex flex-col items-center relative border-b lg:border-b-0 lg:border-r border-zinc-800/60">
                            {/* Main Active Image */}
                            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-black/50 shadow-inner group relative mb-4">
                                {product?.media && product.media.length > 0 ? (
                                    <img 
                                        src={getImageUrl(product.media[activeImageIndex]?.media_url)!} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                        alt={product.name} 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                        <Disc size={80} className="animate-spin-slow opacity-50" />
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail List with Navigation Arrows */}
                            {product?.media && product.media.length > 1 && (
                                <div className="relative w-full flex items-center px-6">
                                    {/* Prev Button */}
                                    <button 
                                        onClick={handlePrevImage}
                                        className="absolute left-0 z-10 w-8 h-8 flex items-center justify-center bg-zinc-800/80 hover:bg-[#ef3333] text-white rounded-sm shadow-md transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    {/* Thumbnails Container */}
                                    <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-hide snap-x scroll-smooth">
                                        {product.media.map((media, index) => (
                                            <button
                                                key={media.id || index}
                                                onClick={() => setActiveImageIndex(index)}
                                                className={`snap-center shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                                    activeImageIndex === index 
                                                    ? 'border-[#ef3333] opacity-100' 
                                                    : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                <img 
                                                    src={getImageUrl(media.media_url)!} 
                                                    className="w-full h-full object-cover" 
                                                    alt={`Thumbnail ${index + 1}`} 
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Next Button */}
                                    <button 
                                        onClick={handleNextImage}
                                        className="absolute right-0 z-10 w-8 h-8 flex items-center justify-center bg-zinc-800/80 hover:bg-[#ef3333] text-white rounded-sm shadow-md transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Info Section */}
                        <div className="lg:w-[55%] p-6 md:p-10 flex flex-col h-full">
                            <div className="mb-6">
                                <Link href={`/landingpage/store/${product.store_id}`} className="flex items-center gap-2 text-[#ef3333] hover:text-red-400 text-sm font-semibold mb-3 w-fit transition-colors">
                                    <StoreIcon size={16} /> {product.store?.name || 'Unknown Store'}
                                    <span className="text-zinc-600">•</span>
                                    <span className="text-yellow-500 flex items-center gap-1"><Star size={14} className="fill-yellow-500" /> 4.9</span>
                                </Link>
                                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">{product.name}</h1>
                                <p className="text-lg md:text-xl text-zinc-400 font-medium">{product.metadata?.artist || 'Unknown Artist'}</p>
                            </div>
                            
                            {/* Attributes Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 flex flex-col">
                                    <span className="text-xs text-zinc-500 font-medium mb-1">Tahun Rilis</span>
                                    <span className="text-sm font-semibold text-zinc-200">{product.metadata?.release_year || '-'}</span>
                                </div>
                                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 flex flex-col">
                                    <span className="text-xs text-zinc-500 font-medium mb-1">Format</span>
                                    <span className="text-sm font-semibold text-zinc-200">{product.metadata?.format || '-'}</span>
                                </div>
                                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 flex flex-col">
                                    <span className="text-xs text-zinc-500 font-medium mb-1">Stok Tersedia</span>
                                    <span className="text-sm font-semibold text-zinc-200">{product.stock} unit</span>
                                </div>
                                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 flex flex-col">
                                    <span className="text-xs text-zinc-500 font-medium mb-1">Grading Media</span>
                                    <span className="text-sm font-bold text-[#ef3333]">{product.metadata?.media_grading || '-'}</span>
                                </div>
                                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 flex flex-col">
                                    <span className="text-xs text-zinc-500 font-medium mb-1">Grading Sleeve</span>
                                    <span className="text-sm font-semibold text-zinc-200">{product.metadata?.sleeve_grading || '-'}</span>
                                </div>
                                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 flex flex-col">
                                    <span className="text-xs text-zinc-500 font-medium mb-1">Label</span>
                                    <span className="text-sm font-semibold text-zinc-200 line-clamp-1" title={product.metadata?.record_label}>{product.metadata?.record_label || '-'}</span>
                                </div>
                            </div>

                            {/* Deskripsi Section */}
                            <div className="mb-8">
                                <h4 className="text-sm font-semibold text-zinc-300 mb-2 border-b border-zinc-800 pb-2">Deskripsi Produk</h4>
                                <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
                                    {product.metadata?.description || 'Tidak ada deskripsi tambahan untuk produk ini.'}
                                </p>
                            </div>

                            {/* CARD: REQUEST GRADING CHECK */}
                            <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <div className="flex gap-3">
                                    <div className="mt-0.5 text-amber-500 shrink-0">
                                        <ClipboardCheck size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-amber-500 font-medium text-sm">Meragukan grading penjual?</h4>
                                        <p className="text-amber-500/70 text-xs mt-0.5">Admin akan memverifikasi fisik produk (+Rp25.000).</p>
                                    </div>
                                </div>
                                <button onClick={handleAuthRedirect} className="w-full sm:w-auto bg-amber-900/30 text-amber-400 hover:bg-amber-900/50 hover:text-amber-300 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0">
                                    Request Grading
                                </button>
                            </div>

                            {/* Spacer to push pricing to bottom if content is short */}
                            <div className="flex-1"></div>

                            {/* Price and Action Section */}
                            <div className="pt-6 border-t border-zinc-800/60 mt-auto">
                                <div className="mb-4">
                                    <span className="text-xs font-medium text-zinc-500 block mb-1">Harga Penawaran</span>
                                    <span className="text-4xl font-bold text-white tracking-tight">{formatIDR(product.price)}</span>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button 
                                        onClick={handleAuthRedirect} 
                                        className="flex-1 bg-[#ef3333] hover:bg-red-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all hover:shadow-[0_4px_20px_rgba(239,51,51,0.3)] hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2"
                                    >
                                        Beli Sekarang
                                    </button>
                                    <button 
                                        onClick={handleAuthRedirect}
                                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-white font-semibold py-3.5 px-6 rounded-xl transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                                    >
                                        <ShoppingCart size={18} /> Tambah Keranjang
                                    </button>
                                </div>
                                <p className="mt-4 text-xs text-zinc-500 flex items-center justify-center lg:justify-start gap-2 font-medium">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Transaksi dilindungi oleh sistem Rekber Analog.id
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* STORE INFORMATION SECTION */}
                    <div className="bg-[#12141a] rounded-[2rem] border border-zinc-800/60 p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
                        {/* Left: Store Profile & Buttons */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 md:w-1/3 md:border-r border-zinc-800/60 pr-0 md:pr-6">
                            <div className="relative shrink-0 group cursor-pointer" onClick={() => router.push(`/landingpage/store/${product.store_id}`)}>
                                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center overflow-hidden border-2 border-zinc-700 group-hover:border-[#ef3333] transition-colors">
                                    <StoreIcon className="text-zinc-500 group-hover:text-[#ef3333] transition-colors" size={32} />
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-[#ef3333] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap border border-red-400/20">
                                    Star+
                                </div>
                            </div>
                            <div className="text-center sm:text-left flex flex-col justify-center">
                                <h3 className="text-lg font-bold text-white hover:text-[#ef3333] cursor-pointer transition-colors" onClick={() => router.push(`/landingpage/store/${product.store_id}`)}>
                                    {product.store?.name || 'PODCASE INDONESIA'}
                                </h3>
                                <p className="text-xs text-zinc-400 mb-3 mt-0.5">Aktif 9 Menit Lalu</p>
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                    <button 
                                        onClick={handleAuthRedirect}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-[#ef3333]/10 hover:bg-[#ef3333]/20 border border-[#ef3333]/50 text-[#ef3333] rounded-lg text-xs font-semibold transition-colors"
                                    >
                                        <MessageSquare size={14} /> Chat
                                    </button>
                                    <Link 
                                        href={`/landingpage/store/${product.store_id}`} 
                                        className="flex items-center gap-1.5 px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                                    >
                                        <StoreIcon size={14} /> Kunjungi Toko
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right: Store Stats Grid */}
                        <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 text-sm pt-4 md:pt-0 border-t md:border-t-0 border-zinc-800/60">
                            <div className="flex flex-col gap-1"><span className="text-zinc-500 text-xs">Penilaian</span><span className="text-white font-medium">6,3k <span className="text-[#ef3333] text-xs ml-1">(Bagus)</span></span></div>
                            <div className="flex flex-col gap-1"><span className="text-zinc-500 text-xs">Persentase Chat</span><span className="text-white font-medium">99% <span className="text-[#ef3333] text-xs ml-1">(Cepat)</span></span></div>
                            <div className="flex flex-col gap-1"><span className="text-zinc-500 text-xs">Bergabung</span><span className="text-white font-medium">14 Bulan Lalu</span></div>
                            <div className="flex flex-col gap-1"><span className="text-zinc-500 text-xs">Produk</span><span className="text-[#ef3333] font-semibold">17</span></div>
                            <div className="flex flex-col gap-1"><span className="text-zinc-500 text-xs">Waktu Proses</span><span className="text-white font-medium">&lt; 12 Jam</span></div>
                            <div className="flex flex-col gap-1"><span className="text-zinc-500 text-xs">Pengikut</span><span className="text-white font-medium">2,4k</span></div>
                        </div>
                    </div>

                    {/* PRODUCT RATINGS SECTION */}
                    <div className="bg-[#12141a] rounded-[2rem] border border-zinc-800/60 p-6 md:p-10 shadow-xl">
                        <h3 className="text-2xl font-bold text-white mb-6">Ulasan Pembeli</h3>

                        {/* Rating Header & Filters */}
                        <div className="bg-[#181a20] border border-zinc-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex flex-col items-center justify-center shrink-0 min-w-[150px]">
                                <div className="text-5xl font-bold text-[#ef3333] mb-2 flex items-baseline gap-1">
                                    5.0 <span className="text-base text-zinc-400 font-medium">/ 5</span>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={20} className="text-[#ef3333] fill-[#ef3333]" />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-2.5">
                                <button className="px-5 py-2 bg-[#ef3333] text-white border border-[#ef3333] rounded-full text-sm font-medium transition-colors">Semua</button>
                                <button className="px-5 py-2 bg-transparent border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white rounded-full text-sm font-medium transition-colors">5 Bintang (71)</button>
                                <button className="px-5 py-2 bg-transparent border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white rounded-full text-sm font-medium transition-colors">4 Bintang (3)</button>
                                <button className="px-5 py-2 bg-transparent border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white rounded-full text-sm font-medium transition-colors">3 Bintang (0)</button>
                                <button className="px-5 py-2 bg-transparent border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white rounded-full text-sm font-medium transition-colors">2 Bintang (0)</button>
                                <button className="px-5 py-2 bg-transparent border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white rounded-full text-sm font-medium transition-colors">1 Bintang (0)</button>
                                <button className="px-5 py-2 bg-transparent border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white rounded-full text-sm font-medium transition-colors">Dengan Komentar (13)</button>
                                <button className="px-5 py-2 bg-transparent border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white rounded-full text-sm font-medium transition-colors">Dengan Media (5)</button>
                            </div>
                        </div>

                        {/* Review List */}
                        <div className="flex flex-col">
                            {DUMMY_REVIEWS.map((review, index) => (
                                <div key={review.id} className={`flex gap-4 py-8 ${index !== DUMMY_REVIEWS.length - 1 ? 'border-b border-zinc-800/60' : ''}`}>
                                    {/* Avatar */}
                                    <div className="shrink-0">
                                        <img 
                                            src={review.avatar} 
                                            alt={review.user} 
                                            className="w-12 h-12 rounded-full bg-zinc-800 object-cover border border-zinc-700" 
                                        />
                                    </div>
                                    
                                    {/* Review Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <h5 className="font-semibold text-zinc-100 text-sm">{review.user}</h5>
                                                <div className="flex gap-0.5 mt-1.5 mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            size={14} 
                                                            className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-700"} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <button className="text-zinc-600 hover:text-zinc-400 p-1">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                        
                                        <div className="text-xs text-zinc-500 mb-3 flex items-center gap-2">
                                            <span>{review.date}</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                                            <span>Variasi: {review.variation}</span>
                                        </div>

                                        {/* Attributes */}
                                        {review.attributes && (
                                            <div className="flex flex-col gap-1 mb-4 text-sm">
                                                {Object.entries(review.attributes).map(([key, value]) => (
                                                    <div key={key} className="flex">
                                                        <span className="text-zinc-500 min-w-[120px]">{key}</span>
                                                        <span className="text-zinc-300">: {value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Comment */}
                                        <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                                            {review.comment}
                                        </p>

                                        {/* Media (Images/Videos) */}
                                        {review.media && review.media.length > 0 && (
                                            <div className="flex flex-wrap gap-3 mb-5">
                                                {review.media.map((item, i) => (
                                                    <div key={i} className="relative w-24 h-24 rounded-lg bg-zinc-900 overflow-hidden cursor-pointer border border-zinc-800 hover:border-[#ef3333] transition-colors group">
                                                        <img src={item.url} alt="Review media" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                        {item.type === 'video' && item.duration && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                                <div className="bg-black/60 text-white rounded-full p-1.5 backdrop-blur-sm">
                                                                    <Video size={16} />
                                                                </div>
                                                                <span className="absolute bottom-1.5 right-1.5 text-white bg-black/60 px-1.5 rounded text-[10px] font-medium backdrop-blur-sm">
                                                                    {item.duration}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Helpful Button */}
                                        <button className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${review.helpful > 0 ? "text-[#ef3333]" : "text-zinc-500 hover:text-[#ef3333]"}`}>
                                            <ThumbsUp size={16} className={review.helpful > 0 ? "fill-[#ef3333]" : ""} /> 
                                            {review.helpful > 0 ? `Membantu (${review.helpful})` : "Membantu?"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
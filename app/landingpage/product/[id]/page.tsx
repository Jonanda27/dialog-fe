"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// INTEGRASI
import { ProductService } from "@/services/api/product.service";
import { ReviewService } from "@/services/api/review.service"; // Import Service Review [cite: 2713]
import { Product } from "@/types/product";
import { Review } from "@/types/review"; // Import Type Review [cite: 2820]
import { 
    Loader2, Disc, ArrowLeft, ClipboardCheck, Star, 
    MessageSquare, Store as StoreIcon, ThumbsUp, 
    MoreVertical, Video, ShoppingCart, ChevronLeft, 
    ChevronRight, ImageIcon, Store,
    User
} from "lucide-react";

/** * HELPER URL GAMBAR */
const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path || path === "") return null;
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    let cleanPath = path.startsWith("/") ? path : `/${path}`;
    // Memastikan prefix /public/ agar match dengan static server backend
    if (!cleanPath.startsWith("/public")) cleanPath = `/public${cleanPath}`;
    return `${baseUrl}${cleanPath}`;
};

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    
    // --- STATE ULASAN ASLI ---
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedFilter, setSelectedFilter] = useState("semua");

    const productId = params.id as string;

    // --- FETCH DATA PRODUK & ULASAN ---
    const fetchProductDetail = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await ProductService.getById(productId);
            if (res.success) setProduct(res.data);
            setActiveImageIndex(0);
        } catch (error) {
            console.error("Gagal memuat detail produk:", error);
        } finally {
            setIsLoading(false);
        }
    }, [productId]);

    const fetchProductReviews = useCallback(async () => {
        try {
            setIsLoadingReviews(true);
            // Memanggil service getProductReviews sesuai permintaan 
            const res = await ReviewService.getProductReviews(productId);
            if (res.success) {
                setReviews(res.data);
            }
        } catch (error) {
            console.error("Gagal memuat ulasan produk:", error);
        } finally {
            setIsLoadingReviews(false);
        }
    }, [productId]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        
        if (productId) {
            fetchProductDetail();
            fetchProductReviews();
        }
        
        return () => window.removeEventListener("scroll", handleScroll);
    }, [productId, fetchProductDetail, fetchProductReviews]);

    // --- LOGIKA FILTER & STATISTIK ULASAN ---
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) 
        : "0.0";

    const filteredReviews = reviews.filter((r) => {
        if (selectedFilter === "5 bintang") return r.rating === 5;
        if (selectedFilter === "4 bintang") return r.rating === 4;
        if (selectedFilter === "dengan media") return (r.media?.length ?? 0) > 0;
        return true;
    });

    const handleAuthRedirect = () => {
        router.push("/auth/login");
    };

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
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
                    
                    {/* BREADCRUMB */}
                    <div className="flex items-center gap-2 text-[13px] text-zinc-400 overflow-x-auto whitespace-nowrap scrollbar-hide w-full mb-2">
                        <Link href="/" className="text-zinc-400 hover:text-[#ef3333] transition-colors">Analog.id</Link>
                        <ChevronRight size={14} className="text-zinc-600 shrink-0" />
                        <Link href="/katalog" className="text-zinc-400 hover:text-[#ef3333] transition-colors">Katalog</Link>
                        <ChevronRight size={14} className="text-zinc-600 shrink-0" />
                        <Link href={`/category/${product.sub_category_id}`} className="text-zinc-400 hover:text-[#ef3333] transition-colors">
                            {(product as any).sub_category?.name || "Kategori Produk"}
                        </Link>
                        <ChevronRight size={14} className="text-zinc-600 shrink-0" />
                        <span className="text-zinc-100 truncate max-w-[200px] sm:max-w-[300px]">{product.name}</span>
                    </div>

                    <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-medium w-fit group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Halaman Sebelumnya
                    </button>

                    {/* PRODUCT CARD */}
                    <div className="bg-[#12141a] rounded-[2rem] border border-zinc-800/60 overflow-hidden flex flex-col lg:flex-row shadow-2xl">
                        <div className="lg:w-[45%] bg-[#181a20] p-6 md:p-8 flex flex-col items-center relative border-b lg:border-b-0 lg:border-r border-zinc-800/60">
                            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-black/50 shadow-inner group relative mb-4">
                                {product?.media && product.media.length > 0 ? (
                                    <img src={getImageUrl(product.media[activeImageIndex]?.media_url)!} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={product.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                        <Disc size={80} className="animate-spin-slow opacity-50" />
                                    </div>
                                )}
                            </div>

                            {product?.media && product.media.length > 1 && (
                                <div className="relative w-full flex items-center px-6">
                                    <button onClick={handlePrevImage} className="absolute left-0 z-10 w-8 h-8 flex items-center justify-center bg-zinc-800/80 hover:bg-[#ef3333] text-white rounded-sm shadow-md transition-colors"><ChevronLeft size={20} /></button>
                                    <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-hide snap-x scroll-smooth">
                                        {product.media.map((media, index) => (
                                            <button key={media.id || index} onClick={() => setActiveImageIndex(index)} className={`snap-center shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === index ? 'border-[#ef3333] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                                <img src={getImageUrl(media.media_url)!} className="w-full h-full object-cover" alt={`Thumbnail ${index + 1}`} />
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={handleNextImage} className="absolute right-0 z-10 w-8 h-8 flex items-center justify-center bg-zinc-800/80 hover:bg-[#ef3333] text-white rounded-sm shadow-md transition-colors"><ChevronRight size={20} /></button>
                                </div>
                            )}
                        </div>

                        <div className="lg:w-[55%] p-6 md:p-10 flex flex-col h-full">
                            <div className="mb-6">
                                <Link href={`/landingpage/store/${product.store_id}`} className="flex items-center gap-2 text-[#ef3333] hover:text-red-400 text-sm font-semibold mb-3 w-fit transition-colors">
                                    <StoreIcon size={16} /> {product.store?.name || 'Unknown Store'}
                                    <span className="text-zinc-600">•</span>
                                    <span className="text-yellow-500 flex items-center gap-1"><Star size={14} className="fill-yellow-500" /> {averageRating}</span>
                                </Link>
                                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">{product.name}</h1>
                                <p className="text-lg md:text-xl text-zinc-400 font-medium">{product.metadata?.artist || 'Unknown Artist'}</p>
                            </div>
                            
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
                            </div>

                            <div className="mb-8">
                                <h4 className="text-sm font-semibold text-zinc-300 mb-2 border-b border-zinc-800 pb-2">Deskripsi Produk</h4>
                                <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
                                    {product.metadata?.description || 'Tidak ada deskripsi tambahan untuk produk ini.'}
                                </p>
                            </div>

                            <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <div className="flex gap-3">
                                    <div className="mt-0.5 text-amber-500 shrink-0"><ClipboardCheck size={20} /></div>
                                    <div>
                                        <h4 className="text-amber-500 font-medium text-sm">Meragukan grading penjual?</h4>
                                        <p className="text-amber-500/70 text-xs mt-0.5">Admin akan memverifikasi fisik produk (+Rp25.000).</p>
                                    </div>
                                </div>
                                <button onClick={handleAuthRedirect} className="w-full sm:w-auto bg-amber-900/30 text-amber-400 hover:bg-amber-900/50 hover:text-amber-300 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0">Request Grading</button>
                            </div>

                            <div className="pt-6 border-t border-zinc-800/60 mt-auto">
                                <div className="mb-4">
                                    <span className="text-xs font-medium text-zinc-500 block mb-1">Harga Penawaran</span>
                                    <span className="text-4xl font-bold text-white tracking-tight">{formatIDR(product.price)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button onClick={handleAuthRedirect} className="flex-1 bg-[#ef3333] hover:bg-red-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all hover:shadow-[0_4px_20px_rgba(239,51,51,0.3)] flex justify-center items-center gap-2">Beli Sekarang</button>
                                    <button onClick={handleAuthRedirect} className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-white font-semibold py-3.5 px-6 rounded-xl transition-all flex justify-center items-center gap-2"><ShoppingCart size={18} /> Tambah Keranjang</button>
                                </div>
                                <p className="mt-4 text-xs text-zinc-500 flex items-center justify-center lg:justify-start gap-2 font-medium">
                                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                                    Transaksi dilindungi oleh sistem Rekber Analog.id
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* STORE INFO SECTION (DIPERCEPAT) */}
                    <div className="bg-[#12141a] rounded-[2rem] border border-zinc-800/60 p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 md:w-1/3 md:border-r border-zinc-800/60 pr-0 md:pr-6">
                            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center overflow-hidden border-2 border-zinc-700">
                                {getImageUrl(product.store?.logo_url) ? <img src={getImageUrl(product.store?.logo_url)!} className="w-full h-full object-cover" /> : <StoreIcon className="text-zinc-500" size={32} />}
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="text-lg font-bold text-white uppercase">{product.store?.name || 'Store Name'}</h3>
                                <div className="flex gap-2 mt-3">
                                    <button onClick={handleAuthRedirect} className="flex items-center gap-1.5 px-4 py-2 bg-[#ef3333]/10 text-[#ef3333] rounded-lg text-xs font-semibold"><MessageSquare size={14} /> Chat</button>
                                    <Link href={`/landingpage/store/${product.store_id}`} className="flex items-center gap-1.5 px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold">Kunjungi Toko</Link>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-3 gap-6 text-sm text-zinc-400 uppercase font-bold tracking-widest">
                            <div className="flex flex-col"><span className="text-[10px] text-zinc-600 mb-1">Rating</span><span className="text-white">4.9 / 5.0</span></div>
                            <div className="flex flex-col"><span className="text-[10px] text-zinc-600 mb-1">Produk</span><span className="text-white">124 Items</span></div>
                            <div className="flex flex-col"><span className="text-[10px] text-zinc-600 mb-1">Respon Chat</span><span className="text-white">99%</span></div>
                        </div>
                    </div>

                    {/* PRODUCT RATINGS SECTION - INTEGRATED WITH REAL SERVICE  */}
                    <div className="bg-[#12141a] rounded-[2rem] border border-zinc-800/60 p-6 md:p-10 shadow-xl">
                        <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">Ulasan Pembeli ({totalReviews})</h3>

                        {/* Rating Summary */}
                        <div className="bg-[#181a20] border border-zinc-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex flex-col items-center justify-center shrink-0 min-w-[150px]">
                                <div className="text-5xl font-bold text-[#ef3333] mb-2 flex items-baseline gap-1">
                                    {averageRating} <span className="text-base text-zinc-400 font-medium">/ 5</span>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={20} fill={i < Math.round(Number(averageRating)) ? "#ef3333" : "none"} className={i < Math.round(Number(averageRating)) ? "text-[#ef3333]" : "text-zinc-700"} />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-2.5">
                                {["semua", "5 bintang", "4 bintang", "dengan media"].map((filter) => (
                                    <button 
                                        key={filter}
                                        onClick={() => setSelectedFilter(filter)}
                                        className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selectedFilter === filter ? "bg-[#ef3333] border-[#ef3333] text-white" : "bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500"}`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Review List */}
                        <div className="flex flex-col">
                            {isLoadingReviews ? (
                                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-zinc-700" /></div>
                            ) : filteredReviews.length === 0 ? (
                                <div className="py-20 text-center text-zinc-600 font-bold uppercase tracking-widest italic border border-dashed border-zinc-800 rounded-3xl">Belum ada ulasan untuk kriteria ini.</div>
                            ) : (
                                filteredReviews.map((review, index) => (
                                    <div key={review.id} className={`flex flex-col sm:flex-row gap-6 py-10 ${index !== filteredReviews.length - 1 ? 'border-b border-zinc-800/60' : ''}`}>
                                        {/* Avatar & User Info */}
                                        <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:w-40">
                                            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                                                <User size={24} className="text-zinc-700" />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-zinc-100 text-sm uppercase tracking-tight truncate">{review.buyer?.full_name || "Kolektor"}</h5>
                                                <p className="text-[10px] text-zinc-600 uppercase font-black tracking-tighter mt-1">{formatDate(review.createdAt)}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Review Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex gap-0.5 mb-4">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill={i < review.rating ? "#facc15" : "none"} className={i < review.rating ? "text-yellow-500" : "text-zinc-800"} />
                                                ))}
                                            </div>

                                            <p className="text-sm text-zinc-300 leading-relaxed mb-6 italic font-medium">"{review.comment || "Pembeli tidak meninggalkan komentar teks."}"</p>

                                            {/* Media dari ReviewService [cite: 2714, 2715] */}
                                            {review.media && review.media.length > 0 && (
                                                <div className="flex flex-wrap gap-3 mb-6">
                                                    {review.media.map((media) => (
                                                        <div key={media.id} className="relative w-24 h-24 rounded-xl bg-zinc-900 overflow-hidden border border-zinc-800 group cursor-pointer">
                                                            <img src={getImageUrl(media.media_url)!} alt="Review media" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Seller Reply UI (Matching Backend schema) [cite: 2713] */}
                                            {review.seller_reply && (
                                                <div className="bg-[#1a1c23] border-l-4 border-[#ef3333] p-5 rounded-r-2xl mb-6">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Store size={14} className="text-[#ef3333]" />
                                                        <span className="text-[10px] font-black uppercase text-white tracking-widest">Respon Penjual</span>
                                                    </div>
                                                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">{review.seller_reply}</p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-6">
                                                <button className="flex items-center gap-1.5 text-[10px] font-black uppercase text-zinc-500 hover:text-[#ef3333] transition-colors tracking-widest">
                                                    <ThumbsUp size={14} /> Membantu?
                                                </button>
                                                <button className="text-[10px] font-black uppercase text-zinc-700 hover:text-white tracking-widest">Laporkan</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
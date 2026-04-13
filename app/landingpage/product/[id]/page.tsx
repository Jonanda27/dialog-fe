"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// INTEGRASI
import { ProductService } from "@/services/api/product.service";
import { Product } from "@/types/product";
import { Loader2, Disc, ArrowLeft, ClipboardCheck } from "lucide-react";

/** * HELPER URL GAMBAR */
const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path || path === "") return null;
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    let cleanPath = path.startsWith("/") ? path : `/${path}`;
    if (!cleanPath.startsWith("/public")) cleanPath = `/public${cleanPath}`;
    return `${baseUrl}${cleanPath}`;
};

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        // Logika Scroll untuk Navbar
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
        } catch (error) {
            console.error("Gagal memuat detail produk:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi untuk mengarahkan ke halaman login
    const handleAuthRedirect = () => {
        router.push("/auth/login");
    };

    if (isLoading) return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#ef3333]" />
        </div>
    );

    if (!product) return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-white font-black uppercase tracking-widest">
            Produk tidak ditemukan
        </div>
    );

    const formatIDR = (num: number | string) => 
        "Rp" + (Number(num) || 0).toLocaleString("id-ID").replace(/,/g, ".");

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans">
            
            {/* NAVBAR */}
            <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 px-6 ${scrolled ? "bg-[#111114] shadow-xl py-2 border-b border-zinc-800" : "bg-[#0a0a0b] py-4"}`}>
                <div className="w-full flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black text-[#ef3333] tracking-tighter cursor-pointer uppercase shrink-0">
                        Analog<span className="text-white">.id</span>
                    </Link>

                    <div className="hidden md:flex flex-1 max-w-xl mx-10 relative">
                        <input type="text" placeholder="Cari piringan hitam atau kaset..." className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#ef3333] transition-all text-white" />
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                        <Link href="/auth/login" className="text-sm font-bold hover:text-[#ef3333] transition-colors">Masuk</Link>
                        <Link href="/auth/register" className="bg-[#ef3333] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">Daftar</Link>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="pt-32 pb-20 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    
                    {/* Back Button */}
                    <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-all uppercase text-[10px] font-black tracking-widest group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali
                    </button>

                    <div className="bg-[#0e1017] rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl flex flex-col lg:flex-row text-left">
                        {/* Image Section */}
                        <div className="lg:w-[40%] bg-[#1c1f26] p-10 flex flex-col items-center justify-center relative border-r border-zinc-800">
                            <div className="w-full aspect-square rounded-xl overflow-hidden shadow-2xl bg-black">
                                {getImageUrl(product.media?.[0]?.media_url) ? (
                                    <img 
                                        src={getImageUrl(product.media?.[0]?.media_url)!} 
                                        className="w-full h-full object-cover" 
                                        alt={product.name} 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
                                        <Disc size={64} className="animate-pulse" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="lg:w-[60%] p-8 lg:p-12 overflow-y-auto">
                            <div className="mb-6">
                                <Link href={`/landingpage/store/${product.store_id}`} className="text-[#ef3333] text-xs font-bold hover:underline mb-2 inline-block uppercase tracking-wider">
                                    {product.store?.name || 'Unknown Store'} • <span className="text-yellow-500">★ 4.9</span>
                                </Link>
                                <h2 className="text-4xl font-black text-white tracking-tight uppercase leading-none mb-2">{product.name}</h2>
                                <p className="text-xl text-zinc-400 font-medium italic">{product.metadata?.artist || 'Unknown Artist'}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 text-[13px] border-t border-zinc-800/50 pt-6">
                                <div><p className="text-zinc-500 mb-1 font-bold uppercase tracking-tighter">Tahun Rilis</p><p className="text-zinc-200 font-semibold">{product.metadata?.release_year || '-'}</p></div>
                                <div><p className="text-zinc-500 mb-1 font-bold uppercase tracking-tighter">Format</p><p className="text-zinc-200 font-semibold uppercase">{product.metadata?.format || '-'}</p></div>
                                <div><p className="text-zinc-500 mb-1 font-bold uppercase tracking-tighter">Stok Tersedia</p><p className="text-zinc-200 font-semibold">{product.stock} unit</p></div>
                                <div><p className="text-zinc-500 mb-1 font-bold uppercase tracking-tighter">Grading Media</p><p className="text-zinc-200 font-semibold text-[#ef3333]">{product.metadata?.media_grading || '-'}</p></div>
                                <div><p className="text-zinc-500 mb-1 font-bold uppercase tracking-tighter">Grading Sleeve</p><p className="text-zinc-200 font-semibold">{product.metadata?.sleeve_grading || '-'}</p></div>
                                <div><p className="text-zinc-500 mb-1 font-bold uppercase tracking-tighter">Label</p><p className="text-zinc-200 font-semibold">{product.metadata?.record_label || '-'}</p></div>
                            </div>

                            {/* Deskripsi Section */}
                            <div className="mt-8 p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl font-medium">
                                <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-2">Deskripsi Produk</h4>
                                <p className="text-sm text-zinc-300 leading-relaxed italic border-l-2 border-[#ef3333] pl-4">
                                    "{product.metadata?.description || 'Tidak ada deskripsi tambahan untuk produk ini.'}"
                                </p>
                            </div>

                            {/* CARD: REQUEST GRADING CHECK */}
                            <div className="mt-8 bg-[#2a1b0a] border border-[#4d3a1a] rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex gap-4 items-start">
                                    <div className="mt-1 text-orange-400">
                                        <ClipboardCheck size={22} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-orange-400 font-bold text-sm tracking-tight">Meragukan grading?</h4>
                                        <p className="text-orange-200/60 text-[11px] leading-relaxed mt-1">
                                            Admin akan memverifikasi ulang kondisi fisik produk ini (biaya Rp25.000, refund jika tidak sesuai)
                                        </p>
                                    </div>
                                </div>
                                <button onClick={handleAuthRedirect} className="bg-[#4d3a1a] text-orange-400 text-[10px] font-bold px-5 py-3 rounded-lg border border-orange-400/20 hover:bg-[#5d4a2a] transition-all flex items-center gap-2 whitespace-nowrap uppercase tracking-widest shrink-0">
                                    <span className="text-sm">⇄</span> Request Grading Check
                                </button>
                            </div>

                            {/* Price and Action Section */}
                            <div className="mt-10 pt-8 border-t border-zinc-800 flex flex-col gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Harga Penawaran</span>
                                    <span className="text-4xl font-black text-white leading-none">{formatIDR(product.price)}</span>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button 
                                        onClick={handleAuthRedirect} 
                                        className="flex-1 bg-[#ef3333] hover:bg-red-700 text-white font-black py-4 px-8 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-red-900/20 transition-all active:scale-95"
                                    >
                                        Beli Sekarang
                                    </button>
                                    <button 
                                        onClick={handleAuthRedirect}
                                        className="flex-1 border border-zinc-800 hover:border-zinc-500 text-white font-black py-4 px-8 rounded-xl text-xs uppercase tracking-widest transition-all hover:bg-zinc-900 active:scale-95"
                                    >
                                        Tambah Keranjang
                                    </button>
                                </div>
                                <p className="text-[10px] text-zinc-600 flex items-center justify-center lg:justify-start gap-2 italic uppercase font-bold tracking-tight">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                    Transaksi dilindungi oleh sistem Escrow Analog.id
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// --- INTERFACES ---
interface Product {
  id: number; name: string; artist: string; price: number; originalPrice: number;
  year: number; label: string; format: string; grade: string; sleeveCondition: string;
  vinylCondition: string; insert: string; rating: string; reviews: number;
  seller: string; imageUrl: string;
}

interface Store {
  id: number; name: string; rating: string; totalProducts: number;
  verified: boolean; icon: string; color: string;
}

export default function AnalogLandingPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Semua");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    if (selectedProduct) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedProduct]);

  // Data Dummy
  const featuredStores: Store[] = [
    { id: 1, name: "Vinylnesia", rating: "4.9", totalProducts: 128, verified: true, icon: "📀", color: "bg-red-500/20 text-red-500" },
    { id: 2, name: "Kasetjogja", rating: "4.8", totalProducts: 56, verified: true, icon: "📻", color: "bg-orange-500/20 text-orange-500" },
    { id: 3, name: "Analog Audio", rating: "4.9", totalProducts: 34, verified: false, icon: "🎧", color: "bg-green-500/20 text-green-500" },
    { id: 4, name: "Memorabilia", rating: "4.7", totalProducts: 89, verified: false, icon: "🎟️", color: "bg-purple-500/20 text-purple-500" },
  ];

  const subCategories = ["Semua", "Rock", "Jazz", "Hip Hop", "Pop", "City Pop", "Metal", "Classical", "Blues"];

  const products: Product[] = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: i % 2 === 0 ? "Rumours" : "Nevermind",
    artist: i % 2 === 0 ? "Fleetwood Mac" : "Nirvana",
    price: 425000, originalPrice: 550000, year: 1977, label: "Warner Bros.",
    format: "Vinyl (LP)", grade: "VG+", sleeveCondition: "VG+ (light ring wear)",
    vinylCondition: "VG+ (minimal surface noise)", insert: "Ya (lyric sheet)",
    rating: "4.9", reviews: 234, seller: "Vinylnesia",
    imageUrl: "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=600",
  }));

  const formatIDR = (num: number) => "Rp" + num.toLocaleString("id-ID").replace(/,/g, ".");

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-[#ef3333]">

      {/* 1. NAVBAR */}
      <nav className={`fixed top-0 w-full z-100 transition-all duration-300 px-6 ${scrolled ? "bg-[#111114] shadow-xl py-2 border-b border-zinc-800" : "bg-[#0a0a0b] py-4"}`}>
        <div className="w-full flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-[#ef3333] tracking-tighter cursor-pointer uppercase shrink-0">
            Analog<span className="text-white">.id</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl mx-10 relative">
            <input type="text" placeholder="Cari piringan hitam atau kaset..." className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#ef3333] transition-all" />
            <div className="absolute right-3 top-2 text-zinc-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="relative group/cart py-2">
              <button className="text-zinc-400 hover:text-[#ef3333] transition-colors mt-1 outline-none">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              </button>
              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover/cart:opacity-100 group-hover/cart:visible transition-all z-110">
                <div className="bg-[#1a1a1e] border border-zinc-800 w-64 p-6 rounded-xl shadow-2xl text-center">
                  <div className="text-4xl mb-3 opacity-20">🛒</div>
                  <p className="text-sm font-bold text-zinc-300 mb-4">Wah, keranjangmu kosong!</p>
                  <button className="w-full bg-[#ef3333] text-white text-xs font-black py-2 rounded-lg hover:bg-red-700 transition-colors uppercase tracking-widest">Mulai Belanja</button>
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-zinc-800"></div>
            <Link href="/auth/login" className="text-sm font-bold hover:text-[#ef3333] transition-colors">Masuk</Link>
            <Link href="/auth/register" className="bg-[#ef3333] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">Daftar</Link>
          </div>
        </div>
      </nav>

      {/* 2. MAIN CONTENT */}
      <main className="pt-28 pb-20 max-w-300 mx-auto px-4">

        {/* HERO */}
        <section className="w-full h-75 bg-[#1a1a1a] rounded-xl overflow-hidden mb-12 border border-zinc-800 relative group cursor-pointer shadow-2xl">
          <div className="absolute inset-0 bg-linear-to-r from-black/80 to-transparent z-10 flex flex-col justify-center px-12 text-left">
            <h2 className="text-[#ef3333] font-black text-sm uppercase tracking-widest mb-2">Exclusively Drops</h2>
            <h1 className="text-white text-5xl font-black uppercase leading-none">VINTAGE <br /> COLLECTION 2026</h1>
            <p className="text-zinc-400 mt-4 max-w-sm">Dapatkan diskon kolektor hingga 30% untuk kaset pita klasik pilihan.</p>
          </div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=1200')] bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700"></div>
        </section>

        {/* STOREFRONT */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter"><span className="bg-[#ef3333] p-1 rounded text-white text-xs">🏪</span> Featured Storefront</h2>
            <button className="text-[#ef3333] text-xs font-bold hover:underline">Lihat semua →</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredStores.map((store) => (
              <div key={store.id} className="bg-[#111114] border border-zinc-800 p-6 rounded-xl flex flex-col items-center text-center hover:border-[#ef3333]/50 transition-all cursor-pointer group">
                <div className={`w-14 h-14 rounded-full ${store.color} flex items-center justify-center text-xl mb-3 shadow-inner group-hover:scale-110 transition-transform`}>{store.icon}</div>
                <h3 className="text-sm font-bold mb-1">{store.name}</h3>
                <p className="text-zinc-500 text-[11px] mb-2 font-medium">⭐ {store.rating} • {store.totalProducts} Produk</p>
                {store.verified && <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">✓ Verified</span>}
              </div>
            ))}
          </div>
        </section>

        {/* PRODUCTS */}
        <section>
          <div className="flex items-center gap-3 mb-6 text-left">
            <h2 className="text-xl font-black uppercase tracking-tighter shrink-0 text-white">Terpopuler Untukmu</h2>
            <div className="h-px flex-1 bg-zinc-900"></div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-8 no-scrollbar">
            {subCategories.map((cat) => (
              <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeFilter === cat ? "bg-[#ef3333] border-[#ef3333] text-white shadow-[0_0_15px_rgba(239,51,51,0.3)]" : "bg-[#1a1a1e] border-zinc-800 text-zinc-500 hover:border-zinc-600"}`}>{cat}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-left">
            {products.map((product) => (
              <div key={product.id} onClick={() => setSelectedProduct(product)} className="bg-[#111114] rounded-2xl border border-zinc-800 overflow-hidden cursor-pointer hover:shadow-2xl hover:border-[#ef3333]/50 transition-all flex flex-col h-full group shadow-lg">
                <div className="aspect-square relative overflow-hidden bg-black">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-white border border-white/10 uppercase tracking-widest">{product.grade}</div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-sm font-bold line-clamp-2 leading-snug text-zinc-100 group-hover:text-[#ef3333] transition-colors h-10">{product.name} - {product.artist}</h3>
                  <p className="text-[#ef3333] text-xl font-black mt-3 leading-none">{formatIDR(product.price)}</p>
                  <div className="mt-auto pt-4 flex items-center gap-1 text-[11px] text-zinc-500 font-bold uppercase tracking-tight"><span className="text-yellow-500 text-xs">★</span><span className="text-zinc-300">{product.rating}</span><span className="mx-1">•</span><span>{product.seller}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* MODAL DETAIL (SESUAI GAMBAR REFERENSI) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative w-full max-w-6xl bg-[#0e1017] rounded-xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col animate-modal-in">
            <div className="bg-[#161922] px-4 py-3 border-b border-zinc-800 flex justify-between items-center shrink-0 text-left">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-300"><div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">i</div>Detail Produk: {selectedProduct.name} - {selectedProduct.artist}</div>
              <div className="bg-[#fdf2d0] text-[#856404] px-2 py-0.5 rounded text-[10px] font-bold uppercase">{selectedProduct.grade}</div>
            </div>
            <div className="flex flex-col lg:flex-row overflow-hidden">
              <div className="lg:w-[35%] bg-[#1c1f26] p-10 flex flex-col items-center justify-center relative border-r border-zinc-800">
                <div className="w-64 h-64 rounded-full border-15 border-zinc-800/50 flex items-center justify-center shadow-2xl bg-zinc-900/30"><div className="w-10 h-10 rounded-full border-4 border-zinc-800"></div></div>
                <div className="absolute bottom-4 right-4 bg-black/40 px-2 py-1 rounded text-[10px] font-bold text-zinc-400 flex items-center gap-1 border border-zinc-800">📸 4 foto</div>
              </div>
              <div className="lg:w-[65%] p-8 lg:p-10 text-left overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div className="mb-6">
                  <p className="text-[#ef3333] text-xs font-medium mb-1">{selectedProduct.seller} • <span className="text-yellow-500">★ {selectedProduct.rating}</span> <span className="text-zinc-500">({selectedProduct.reviews} ulasan)</span></p>
                  <h2 className="text-4xl font-bold text-white tracking-tight">{selectedProduct.name}</h2>
                  <p className="text-xl text-zinc-400 font-medium">{selectedProduct.artist}</p>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-12 text-[13px] border-t border-zinc-800/50 pt-6">
                  <p className="text-zinc-500">Tahun Rilis: <span className="text-zinc-200">{selectedProduct.year}</span></p>
                  <p className="text-zinc-500">Label: <span className="text-zinc-200">{selectedProduct.label}</span></p>
                  <p className="text-zinc-500">Format: <span className="text-zinc-200">{selectedProduct.format}</span></p>
                  <p className="text-zinc-500">Kondisi Sleeve: <span className="text-zinc-200">{selectedProduct.sleeveCondition}</span></p>
                  <p className="text-zinc-500">Kondisi Vinyl: <span className="text-zinc-200">{selectedProduct.vinylCondition}</span></p>
                  <p className="text-zinc-500">Include Insert: <span className="text-zinc-200">{selectedProduct.insert}</span></p>
                </div>
                <div className="mt-8 bg-[#2a1b0a] border border-[#4d3a1a] rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex gap-3 items-start"><div className="mt-0.5 text-orange-400 text-lg">📋</div><div><h4 className="text-orange-400 font-bold text-sm uppercase tracking-tight">Meragukan grading?</h4><p className="text-orange-300/60 text-[11px] leading-relaxed">Admin akan memverifikasi ulang kondisi fisik produk ini (biaya Rp25.000, refund jika tidak sesuai)</p></div></div>
                  <button className="bg-[#4d3a1a] text-orange-400 text-[10px] font-bold px-4 py-2.5 rounded border border-orange-400/20 hover:bg-[#5d4a2a] transition-all flex items-center gap-2 whitespace-nowrap uppercase tracking-tighter">⇆ Request Grading Check</button>
                </div>
                <div className="mt-10 pt-8 border-t border-zinc-800 flex flex-col gap-6">
                  <div className="flex items-baseline gap-3"><span className="text-3xl font-bold text-white">{formatIDR(selectedProduct.price)}</span><span className="text-zinc-600 line-through text-sm font-medium">{formatIDR(selectedProduct.originalPrice)}</span></div>
                  <div className="flex flex-wrap gap-3"><button className="bg-[#ef3333] hover:bg-red-700 text-white font-black py-3.5 px-8 rounded-lg flex items-center gap-2 transition-all active:scale-95 text-sm uppercase tracking-widest">🛒 Beli Sekarang</button><button className="bg-transparent border border-zinc-800 hover:border-zinc-500 text-zinc-200 font-bold py-3.5 px-8 rounded-lg flex items-center gap-2 transition-all text-sm uppercase tracking-widest"><span className="text-lg">+</span> Keranjang</button><button className="bg-transparent border border-zinc-800 hover:text-red-500 hover:border-red-500 p-3.5 rounded-lg transition-all">♡</button></div>
                  <p className="text-[11px] text-zinc-600 flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>Transaksi aman dengan sistem escrow Analog.id</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#121212] border-t border-zinc-800 py-12 text-center mt-20">
        <div className="text-2xl font-black text-[#ef3333] mb-4 uppercase tracking-tighter">Analog.id</div>
        <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.3em]">Surga Kolektor Analog Sejak 2026</p>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-modal-in { animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
}
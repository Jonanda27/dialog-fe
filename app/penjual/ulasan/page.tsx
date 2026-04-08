"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  Star, 
  MessageCircle, 
  ThumbsUp, 
  Filter, 
  Search, 
  Disc, 
  User,
  ChevronRight
} from "lucide-react";

export default function UlasanToko() {
  const [selectedFilter, setSelectedFilter] = useState("semua");

  // Data Dummy Ulasan
  const reviews = [
    {
      id: 1,
      user: "Bambang Pamungkas",
      rating: 5,
      date: "08 Apr 2026",
      comment: "Kondisi vinyl benar-benar Near Mint sesuai deskripsi! Packing kayu aman banget. Recommended seller buat kolektor piringan hitam.",
      product: "Nirvana - Nevermind (Original Press)",
      img: "💿"
    },
    {
      id: 2,
      user: "Siti Markonah",
      rating: 4,
      date: "05 Apr 2026",
      comment: "Suaranya jernih, cuma covernya agak sedikit tertekuk di pojok. Tapi overall oke banget pelayanannya.",
      product: "The Beatles - Abbey Road",
      img: "📀"
    },
    {
      id: 3,
      user: "Andi Wijaya",
      rating: 5,
      date: "01 Apr 2026",
      comment: "Pengiriman cepat kilat, bonus bubble wrap tebal. Mantap Analog.id!",
      product: "Daft Punk - Discovery",
      img: "🎧"
    }
  ];

  return (
    <Sidebar>
      <div className="max-w-6xl mx-auto pb-20">
        {/* HEADER */}
        <div className="mb-10">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Ulasan Toko</h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Dengarkan apa yang dikatakan pelanggan tentang koleksi analog Anda.
          </p>
        </div>

        {/* RATING SUMMARY CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
          <div className="lg:col-span-1 bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Rating Toko</p>
            <h3 className="text-6xl font-black text-white mb-2 tracking-tighter">4.8</h3>
            <div className="flex text-amber-500 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill={i < 4 ? "currentColor" : "none"} strokeWidth={3} />
              ))}
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total 124 Ulasan</p>
          </div>

          <div className="lg:col-span-3 bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 flex flex-col justify-center">
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-zinc-500 w-4 tracking-tighter">{star}</span>
                  <Star size={12} className="text-zinc-700" fill="currentColor" />
                  <div className="flex-1 h-2 bg-[#0a0a0b] rounded-full overflow-hidden border border-zinc-900">
                    <div 
                      className="h-full bg-[#ef3333] shadow-[0_0_10px_rgba(239,51,51,0.5)] transition-all duration-1000" 
                      style={{ width: star === 5 ? "85%" : star === 4 ? "10%" : "2%" }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-black text-zinc-600 w-10 text-right uppercase tracking-tighter">
                    {star === 5 ? "102" : star === 4 ? "15" : "7"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FILTER & SEARCH */}
        <div className="bg-[#111114] border border-zinc-900 rounded-[2rem] p-4 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
            <input 
              type="text" 
              placeholder="Cari kata kunci ulasan..." 
              className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-xs font-medium text-white focus:border-[#ef3333] outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {["Semua", "5 Bintang", "4 Bintang", "Foto"].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f.toLowerCase())}
                className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                  selectedFilter === f.toLowerCase()
                  ? "bg-white text-black border-white"
                  : "bg-[#1a1a1e] border-zinc-800 text-zinc-500 hover:border-zinc-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* LIST ULASAN */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 group hover:border-zinc-700 transition-all">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Info Pengguna */}
                <div className="md:w-48 shrink-0 flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-[#0a0a0b] border border-zinc-800 flex items-center justify-center mb-4 overflow-hidden shadow-inner">
                    <User size={32} className="text-zinc-800" />
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-tight mb-1">{review.user}</h4>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">{review.date}</p>
                  <div className="flex text-amber-500 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={3} />
                    ))}
                  </div>
                </div>

                {/* Konten Ulasan */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4 bg-[#0a0a0b] border border-zinc-900 p-3 rounded-2xl w-fit">
                    <div className="w-8 h-8 rounded-lg bg-[#111114] border border-zinc-800 flex items-center justify-center text-lg">{review.img}</div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Membeli produk:</p>
                      <p className="text-[10px] font-black text-[#ef3333] uppercase tracking-tight leading-none">{review.product}</p>
                    </div>
                    <ChevronRight size={14} className="text-zinc-800 ml-2" />
                  </div>

                  <p className="text-zinc-300 text-sm leading-relaxed font-medium mb-6 italic">
                    "{review.comment}"
                  </p>

                  <div className="flex items-center gap-6 pt-4 border-t border-zinc-900/50">
                    <button className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-[#ef3333] transition-colors">
                      <ThumbsUp size={14} />
                      Bantu (12)
                    </button>
                    <button className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">
                      <MessageCircle size={14} />
                      Balas Ulasan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Sidebar>
  );
}
"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar"; // Pastikan path import benar
import { 
  Search, 
  Plus, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye,
  ArrowUpDown
} from "lucide-react";

export default function KelolaProdukPage() {
  // Data Dummy Produk Vinyl
  const [products] = useState([
    { 
      id: 1, 
      name: "Abbey Road", 
      artist: "The Beatles", 
      price: "Rp 850.000", 
      stock: 12, 
      category: "Vinyl 12\"", 
      status: "Ready Stock",
      img: "📀"
    },
    { 
      id: 2, 
      name: "Random Access Memories", 
      artist: "Daft Punk", 
      price: "Rp 1.250.000", 
      stock: 5, 
      category: "Double Vinyl", 
      status: "Terbatas",
      img: "💿"
    },
    { 
      id: 3, 
      name: "The Dark Side of The Moon", 
      artist: "Pink Floyd", 
      price: "Rp 950.000", 
      stock: 0, 
      category: "Vinyl 12\"", 
      status: "Habis",
      img: "📼"
    },
    { 
      id: 4, 
      name: "Currents", 
      artist: "Tame Impala", 
      price: "Rp 750.000", 
      stock: 24, 
      category: "Vinyl 12\"", 
      status: "Ready Stock",
      img: "🎧"
    },
  ]);

  return (
    <Sidebar>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Kelola Produk</h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Total <span className="text-[#ef3333]">{products.length}</span> vinyl dalam katalog Anda.
          </p>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-[#ef3333] hover:bg-red-700 text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-900/20">
          <Plus size={16} />
          Tambah Produk
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-[#111114] border border-zinc-900 rounded-[2rem] p-4 mb-8 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input 
            type="text" 
            placeholder="Cari vinyl atau artis..."
            className="w-full bg-[#0a0a0b] border border-zinc-900 rounded-xl py-3 pl-12 pr-4 text-xs font-medium text-white focus:border-[#ef3333] outline-none transition-all placeholder:text-zinc-800"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-[#1a1a1e] border border-zinc-900 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-zinc-700 transition-all">
            <Filter size={14} />
            Filter
          </button>
          <button className="flex items-center gap-2 bg-[#1a1a1e] border border-zinc-900 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-zinc-700 transition-all">
            <ArrowUpDown size={14} />
            Urutkan
          </button>
        </div>
      </div>

      {/* PRODUCT TABLE CARD */}
      <div className="bg-[#111114] border border-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1a1e]/50 border-b border-zinc-900 text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">
                <th className="py-6 px-8">Produk Vinyl</th>
                <th className="py-6 px-4">Kategori</th>
                <th className="py-6 px-4">Harga</th>
                <th className="py-6 px-4">Stok</th>
                <th className="py-6 px-4">Status</th>
                <th className="py-6 px-8 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#0a0a0b] border border-zinc-800 flex items-center justify-center text-xl shadow-inner group-hover:border-[#ef3333] transition-colors">
                        {product.img}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-tight group-hover:text-[#ef3333] transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                          {product.artist}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{product.category}</span>
                  </td>
                  <td className="py-5 px-4">
                    <span className="text-xs font-black text-white tracking-tight">{product.price}</span>
                  </td>
                  <td className="py-5 px-4">
                    <span className="text-xs font-bold text-zinc-400">{product.stock} Unit</span>
                  </td>
                  <td className="py-5 px-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      product.status === 'Ready Stock' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 
                      product.status === 'Terbatas' ? 'bg-amber-500/5 text-amber-500 border-amber-500/10' : 
                      'bg-red-500/5 text-[#ef3333] border-red-500/10'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="py-5 px-8">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg bg-[#1a1a1e] text-zinc-600 hover:text-white transition-all">
                        <Eye size={14} />
                      </button>
                      <button className="p-2 rounded-lg bg-[#1a1a1e] text-zinc-600 hover:text-white transition-all">
                        <Edit3 size={14} />
                      </button>
                      <button className="p-2 rounded-lg bg-[#1a1a1e] text-zinc-600 hover:text-[#ef3333] transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER TABLE / PAGINATION */}
        <div className="p-6 border-t border-zinc-900 bg-[#0d0d0f] flex items-center justify-between">
          <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.2em]">
            Showing 1-4 of 4 Items
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-[#1a1a1e] text-zinc-700 text-[9px] font-black uppercase tracking-widest border border-zinc-900 cursor-not-allowed">Prev</button>
            <button className="px-4 py-2 rounded-lg bg-[#1a1a1e] text-zinc-400 hover:text-white text-[9px] font-black uppercase tracking-widest border border-zinc-900 transition-all">Next</button>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
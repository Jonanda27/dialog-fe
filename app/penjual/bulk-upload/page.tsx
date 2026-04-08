"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  X,
  ArrowRight
} from "lucide-react";

export default function BulkUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <Sidebar>
      <div className="max-w-5xl mx-auto pb-20">
        {/* HEADER */}
        <div className="mb-10">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Bulk Upload Produk</h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Unggah ratusan koleksi vinyl atau kaset sekaligus hanya dengan satu file spreadsheet.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: INSTRUCTIONS */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3333] mb-6">Langkah Kerja</h3>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-white shrink-0">1</div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-white tracking-wider">Unduh Template</p>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">Gunakan format standar Analog.id agar data terbaca sempurna.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-white shrink-0">2</div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-white tracking-wider">Isi Data Produk</p>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">Masukkan nama album, artist, grading, dan harga sesuai kolom.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-white shrink-0">3</div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-white tracking-wider">Unggah & Verifikasi</p>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">Sistem akan mengecek validitas data sebelum dipublikasikan.</p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-10 flex items-center justify-center gap-3 bg-[#1a1a1e] hover:bg-zinc-800 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all border border-zinc-800">
                <Download size={16} className="text-[#ef3333]" />
                Template .CSV
              </button>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-[2rem] p-6 flex gap-4">
              <AlertCircle size={20} className="text-blue-500 shrink-0" />
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase">
                Pastikan kolom <span className="text-blue-400">Grading</span> diisi sesuai standar: M, NM, VG+, VG, atau G.
              </p>
            </div>
          </div>

          {/* RIGHT: UPLOAD AREA */}
          <div className="lg:col-span-2 space-y-6">
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-[3rem] p-12 transition-all flex flex-col items-center justify-center min-h-[400px] bg-[#111114] ${
                dragActive ? "border-[#ef3333] bg-[#ef3333]/5" : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
                accept=".csv,.xlsx"
              />
              
              <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
                <UploadCloud size={32} className={dragActive ? "text-[#ef3333]" : "text-zinc-600"} />
              </div>
              
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-2 text-center">
                Seret file ke sini atau klik
              </h3>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-8">
                Mendukung Format .CSV atau .XLSX (Maks 10MB)
              </p>

              {file && (
                <div className="w-full max-w-sm bg-[#0a0a0b] border border-[#ef3333]/30 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet size={24} className="text-emerald-500" />
                    <div className="truncate max-w-[180px]">
                      <p className="text-xs font-black text-white truncate">{file.name}</p>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={() => setFile(null)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* PREVIEW STATUS / SUMMARY */}
            {file && (
              <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-emerald-500" />
                      <p className="text-xs font-black text-white uppercase tracking-widest">File Siap Diproses</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-[#0a0a0b] p-4 rounded-2xl border border-zinc-900">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Terdeteksi</p>
                      <p className="text-xl font-black text-white tracking-tight">124 <span className="text-[10px] text-zinc-500">Produk</span></p>
                   </div>
                   <div className="bg-[#0a0a0b] p-4 rounded-2xl border border-zinc-900">
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-xl font-black text-emerald-500 tracking-tight text-xs uppercase">Valid</p>
                   </div>
                </div>

                <button className="w-full bg-[#ef3333] hover:bg-red-700 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-red-900/30 flex items-center justify-center gap-3 group">
                  Mulai Import Sekarang
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
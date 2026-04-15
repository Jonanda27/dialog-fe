"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Star, 
  Search, 
  User,
  ChevronRight,
  Disc,
  Store,
  Loader2,
  MessageCircle,
  ThumbsUp,
  X,
  Send
} from "lucide-react";
import { toast } from "react-hot-toast";

// INTEGRASI SERVICE & STORE SESUAI STRUKTUR FE ANDA
import { Review, ReplyReviewPayload } from "@/types/review";
import { ReviewService } from "@/services/api/review.service";
import { StoreService } from "@/services/api/store.service";

export default function HalamanUlasanPenjual() {
  // --- STATE MANAGEMENT ---
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  // --- STATE UNTUK BALASAN ---
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // ID Review yang sedang dibalas
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // --- LOCAL UI STATE ---
  const [selectedFilter, setSelectedFilter] = useState("semua");
  const [searchKeyword, setSearchKeyword] = useState("");

  /**
   * LANGKAH 1: Ambil ID Toko milik penjual yang sedang login
   */
  const fetchMyStoreInfo = useCallback(async () => {
    try {
      const response = await StoreService.getMyStore();
      if (response && response.data) {
        setStoreId(response.data.id);
      }
    } catch (err) {
      console.error("[SellerReview] Gagal mengambil info toko:", err);
      setError("Gagal mengenali identitas toko Anda.");
    }
  }, []);

  /**
   * LANGKAH 2: Hit API Review menggunakan ID Toko
   */
  const fetchReviews = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ReviewService.getStoreReviews(id);
      if (response && response.data) {
        setReviews(response.data);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Gagal memuat ulasan";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * LANGKAH 3: Fungsi Kirim Balasan (Reply)
   */
  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error("Balasan tidak boleh kosong");
      return;
    }

    setIsSubmittingReply(true);
    try {
      const payload: ReplyReviewPayload = {
        seller_reply: replyText
      };

      const response = await ReviewService.replyReview(reviewId, payload);

      if (response.success) {
        toast.success("Ulasan berhasil dibalas!");
        setReplyText("");
        setReplyingTo(null);
        // Refresh data agar ulasan yang baru dibalas langsung terupdate di UI
        if (storeId) fetchReviews(storeId);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim balasan");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  useEffect(() => {
    fetchMyStoreInfo();
  }, [fetchMyStoreInfo]);

  useEffect(() => {
    if (storeId) {
      fetchReviews(storeId);
    }
  }, [storeId, fetchReviews]);

  // --- LOGIKA UI (Agregasi & Filter) ---
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating ?? 0), 0) / totalReviews).toFixed(1) 
    : "0.0";

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const rate = r.rating as keyof typeof ratingCounts;
    if (ratingCounts[rate] !== undefined) ratingCounts[rate]++;
  });

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch = 
      (r.comment?.toLowerCase() ?? "").includes(searchKeyword.toLowerCase()) || 
      (r.product?.name?.toLowerCase() ?? "").includes(searchKeyword.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter === "5 bintang") matchesFilter = r.rating === 5;
    if (selectedFilter === "4 bintang") matchesFilter = r.rating === 4;
    if (selectedFilter === "foto") matchesFilter = (r.media?.length ?? 0) > 0;

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return "";
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:5000';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    if (!cleanPath.startsWith('public/')) {
      return `${BASE_URL}/public/${cleanPath}`;
    }
    return `${BASE_URL}/${cleanPath}`;
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
          <Star className="text-[#ef3333]" size={28} />
          Ulasan & Reputasi Toko
        </h2>
        <p className="text-sm text-zinc-500 font-medium mt-1">
          Pantau feedback dari pelanggan untuk meningkatkan kualitas layanan koleksi Anda.
        </p>
      </div>

      {/* RATING SUMMARY AREA (Tetap Sama) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        <div className="lg:col-span-1 bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Rating Saat Ini</p>
          <h3 className="text-6xl font-black text-white mb-2 tracking-tighter">{averageRating}</h3>
          <div className="flex text-amber-500 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} strokeWidth={3} />
            ))}
          </div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total {totalReviews} Feedback</p>
        </div>

        <div className="lg:col-span-3 bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 flex flex-col justify-center">
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star as keyof typeof ratingCounts] ?? 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-zinc-500 w-4 tracking-tighter">{star}</span>
                  <Star size={12} className="text-zinc-700" fill="currentColor" />
                  <div className="flex-1 h-2 bg-[#0a0a0b] rounded-full overflow-hidden border border-zinc-900">
                    <div className="h-full bg-[#ef3333] shadow-[0_0_10px_rgba(239,51,51,0.5)] transition-all duration-700" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="text-[10px] font-black text-zinc-600 w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTER BOX (Tetap Sama) */}
      <div className="bg-[#111114] border border-zinc-900 rounded-[2rem] p-4 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
          <input 
            type="text" 
            placeholder="Cari ulasan atau nama produk..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:border-[#ef3333] outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          {["Semua", "5 Bintang", "4 Bintang", "Foto"].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f.toLowerCase())}
              className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                selectedFilter === f.toLowerCase() ? "bg-white text-black border-white" : "bg-[#1a1a1e] border-zinc-800 text-zinc-500 hover:border-zinc-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* REVIEW LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 className="animate-spin text-[#ef3333] mb-4" size={32} />
          <p className="text-[10px] font-black uppercase tracking-widest">Sinkronisasi Reputasi...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
             <div className="text-center py-20 bg-[#111114] border border-dashed border-zinc-800 rounded-[2.5rem]">
               <MessageCircle className="mx-auto text-zinc-800 mb-4" size={40} />
               <p className="text-zinc-500 font-medium italic">Belum ada pelanggan yang memberikan ulasan.</p>
             </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-8 group hover:border-zinc-700 transition-all shadow-xl">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* BUYER INFO */}
                  <div className="md:w-48 shrink-0 flex flex-col items-center md:items-start">
                    <div className="w-16 h-16 rounded-2xl bg-[#0a0a0b] border border-zinc-800 flex items-center justify-center mb-4 overflow-hidden">
                      <User size={32} className="text-zinc-800" />
                    </div>
                    <h4 className="text-xs font-black text-white uppercase tracking-tight">{review.buyer?.full_name ?? "Pelanggan"}</h4>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase mb-4 tracking-tighter">{formatDate(review.createdAt)}</p>
                    <div className="flex text-amber-500 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < (review.rating ?? 0) ? "currentColor" : "none"} strokeWidth={3} />
                      ))}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4 bg-[#0a0a0b] border border-zinc-900 p-3 rounded-2xl w-fit">
                      <Disc className="text-[#ef3333]" size={16} />
                      <div>
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Produk Terjual:</p>
                        <p className="text-[10px] font-black text-zinc-200 uppercase tracking-tight leading-none">
                          {review.product?.name ?? "Item Tidak Diketahui"}
                        </p>
                      </div>
                    </div>

                    <p className="text-zinc-300 text-sm leading-relaxed mb-6 italic font-medium">"{review.comment ?? "Ulasan tanpa teks."}"</p>

                    {/* FOTO DARI BUYER */}
                    {(review.media?.length ?? 0) > 0 && (
                      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                        {review.media?.map((mediaItem) => (
                          <div key={mediaItem.id} className="w-24 h-24 rounded-xl border border-zinc-800 overflow-hidden shrink-0">
                            <img src={getImageUrl(mediaItem.media_url)} alt="Review" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* BALASAN TOKO (LOGIC BARU) */}
                    {review.seller_reply ? (
                      <div className="mb-6 bg-[#1a1a1e] border border-zinc-800 p-5 rounded-2xl border-l-4 border-l-[#ef3333]">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Store size={14} className="text-amber-500" />
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Tanggapan Anda</p>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-400 font-medium leading-relaxed">{review.seller_reply}</p>
                      </div>
                    ) : (
                      <div className="mb-6">
                        {replyingTo === review.id ? (
                          <div className="space-y-3 bg-[#0a0a0b] border border-zinc-800 p-4 rounded-2xl animate-in slide-in-from-top-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Tulis balasan profesional Anda di sini..."
                              className="w-full bg-[#111114] border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-[#ef3333] outline-none min-h-[80px] resize-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                className="px-4 py-2 text-[9px] font-black uppercase text-zinc-500 hover:text-white transition-colors"
                              >
                                Batal
                              </button>
                              <button 
                                onClick={() => handleSendReply(review.id)}
                                disabled={isSubmittingReply}
                                className="flex items-center gap-2 bg-[#ef3333] text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-red-700 disabled:opacity-50 transition-all"
                              >
                                {isSubmittingReply ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                Kirim Balasan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setReplyingTo(review.id)}
                            className="flex items-center gap-2 bg-[#ef3333]/10 text-[#ef3333] border border-[#ef3333]/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ef3333] hover:text-white transition-all shadow-lg"
                          >
                            <MessageCircle size={14} /> Balas Ulasan
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-6 pt-4 border-t border-zinc-900/50 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      <button className="flex items-center gap-2 hover:text-[#ef3333] transition-colors"><ThumbsUp size={14} /> Membantu</button>
                      <button className="flex items-center gap-2 hover:text-white transition-colors">Laporkan</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
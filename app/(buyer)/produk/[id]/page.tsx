"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// SERVICES & TYPES
import { productService } from "@/services/api/product.service";
import { ReviewService } from "@/services/api/review.service";
import { gradingService } from "@/services/api/grading.service";
import { Product } from "@/types/product";
import { Review } from "@/types/review";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

// COMPONENTS
import ProductGallery from "@/components/product/ProductGallery";
import StoreSection from "@/components/product/StoreSection";
import ReviewSidebar from "@/components/product/ReviewSidebar";
import RecommendedFeed from "@/components/dashboard/RecommendedFeed";
import AuctionBidPanel from "@/components/product/AuctionBidPanel";

// ICONS
import {
  Loader2,
  ArrowLeft,
  ClipboardCheck,
  Star,
  ShoppingCart,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";

import { getImageUrl } from "@/utils/image";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  // Integrasi Store
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const { isAuthenticated } = useAuthStore();

  // STATE
  const [product, setProduct] = useState<Product | any | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isRequestingGrading, setIsRequestingGrading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [pRes, rRes] = await Promise.all([
        productService.getById(productId),
        ReviewService.getProductReviews(productId),
      ]);

      if (pRes.success) setProduct(pRes.data);
      if (rRes.success) setReviews(rRes.data);
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingReviews(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) fetchData();
  }, [productId, fetchData]);

  // LOGIKA RATING
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Silakan login terlebih dahulu untuk menambah keranjang", {
        position: "bottom-center"
      });
      return router.push("/auth/login");
    }

    if (!product) return;

    try {
      setIsAddingToCart(true);
      await addItem(product, 1);
      toast.success(`${product.name} ditambahkan ke koleksi`, {
        description: "Barang tersimpan aman di database keranjang Anda.",
        position: "bottom-center",
      });
    } catch (error: any) {
      // Error handled by store toast
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleRequestGrading = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product) return;

    try {
      setIsRequestingGrading(true);
      const res = await gradingService.requestGrading({
        product_id: product.id,
      });

      if (res.success) {
        toast.success("Request Grading Berhasil", {
          description: "Tim pakar kami akan segera memproses permintaan Anda.",
        });
      } else {
        toast.error(res.message || "Gagal melakukan request grading");
      }
    } catch (error: any) {
      const errorDetail = error.response?.data?.message || "Terjadi kesalahan server";
      toast.error(errorDetail);
    } finally {
      setIsRequestingGrading(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#ef3333] w-10 h-10" />
      </div>
    );

  if (!product) return null;

  const isAuctionMode = product.is_locked && product.auction;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans pb-10 md:pb-20 pt-6 md:pt-10 overflow-x-hidden">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* NAVIGATION - Responsive Padding & Breadcrumbs */}
        <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-10">
          <div className="flex flex-wrap items-center gap-2 text-[9px] md:text-[11px] font-black uppercase tracking-widest text-zinc-500">
            <Link href="/" className="hover:text-[#ef3333] transition-colors whitespace-nowrap">Analog.id</Link>
            <ChevronRight size={10} className="md:w-[12px]" />
            <Link href="/search" className="hover:text-[#ef3333] transition-colors whitespace-nowrap">Marketplace</Link>
            <ChevronRight size={10} className="md:w-[12px]" />
            <span className="text-zinc-200 truncate max-w-[150px] md:max-w-none">{product.name}</span>
          </div>

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] group w-fit"
          >
            <ArrowLeft size={14} className="md:w-[16px] group-hover:-translate-x-1 transition-transform" />
            Back to Collection
          </button>
        </div>

        {/* MAIN PRODUCT GRID - 1 Col Mobile, 12 Col Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: GALLERY */}
          <div className="lg:col-span-6 w-full">
            <ProductGallery
              media={product.media || []}
              productName={product.name}
              grading={product.metadata?.media_grading}
            />
          </div>

          {/* RIGHT: INFO & ACTIONS */}
          <div className="lg:col-span-6 space-y-6 md:space-y-8">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-[#ef3333]/10 text-[#ef3333] text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-full border border-[#ef3333]/20">
                  {product.subCategory?.name || "VINTAGE RARE"}
                </span>
                <div className="flex items-center gap-1 text-yellow-500 font-black text-[10px] md:text-xs">
                  <Star size={12} fill="currentColor" className="md:w-[14px]" /> {averageRating}
                  <span className="text-zinc-500 ml-1">({totalReviews} Reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight lg:leading-[1.1] tracking-tighter uppercase">
                {product.name}
              </h1>
              <p className="text-base md:text-xl text-zinc-500 font-bold uppercase tracking-widest italic">
                {product.metadata?.artist || "Various Artists"}
              </p>
            </div>

            {/* PRICE CARD - Responsive Padding & Layout */}
            <div className="bg-[#111114] border border-zinc-800 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 shadow-xl">
              <div>
                <p className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                  Current Offer
                </p>
                <h2 className="text-3xl md:text-4xl font-black text-white italic">
                  Rp {Number(product.price).toLocaleString("id-ID")}
                </h2>
              </div>
              <span className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 self-start md:self-center">
                <ShieldCheck size={12} /> In Stock: {product.stock} Unit
              </span>
            </div>

            {/* SPECS GRID - 2/3 Cols depending on screen */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
              {[
                { label: "Format", value: product.metadata?.format || "LP" },
                { label: "Year", value: product.metadata?.release_year || "N/A" },
                { label: "Genre", value: product.metadata?.genre || "Analog Classic" },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800/60 p-3 md:p-4 rounded-xl md:rounded-2xl">
                  <p className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-[10px] md:text-xs font-bold text-zinc-200 truncate">{item.value}</p>
                </div>
              ))}
            </div>

            {/* CARD REQUEST GRADING */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl md:rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row items-start gap-4 shadow-inner">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                {isRequestingGrading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <ClipboardCheck size={20} className="md:w-[24px]" />
                )}
              </div>

              <div className="flex-1">
                <h4 className="text-[11px] md:text-sm font-black text-amber-500 uppercase tracking-widest mb-1">
                  PRO-GRADING SERVICE
                </h4>
                <p className="text-[10px] md:text-[11px] text-amber-200/60 leading-relaxed font-medium">
                  Ragu dengan grading penjual? Request pengecekan fisik oleh tim
                  Analog.id Expert (+Rp25.000).
                </p>
                <button
                  type="button"
                  disabled={isRequestingGrading}
                  onClick={handleRequestGrading}
                  className="mt-3 md:mt-4 text-[9px] md:text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 hover:text-amber-400 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isRequestingGrading ? "Processing Request..." : "Request Verification"} <ArrowUpRight size={14} />
                </button>
              </div>
            </div>

            {/* ACTION REGULER / AUCTION */}
            <div className="pt-2 md:pt-4">
              {isAuctionMode ? (
                <div className="bg-[#111114] border border-zinc-800 rounded-2xl overflow-hidden">
                  <AuctionBidPanel
                    auctionId={product.auction.id}
                    initialPrice={Number(product.auction.current_price || product.price)}
                    increment={Number(product.auction.increment)}
                    endTime={product.auction.end_time}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock < 1 || isAddingToCart}
                    className="flex items-center justify-center gap-3 bg-white text-black font-black text-[10px] md:text-xs uppercase tracking-widest py-4 md:py-5 rounded-xl md:rounded-2xl hover:bg-[#ef3333] hover:text-white transition-all transform active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingToCart ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <ShoppingCart size={16} className="md:w-[18px]" />
                    )}
                    {isAddingToCart ? "SINKRONISASI..." : "ADD TO CART"}
                  </button>

                  <button
                    disabled={product.stock < 1}
                    className="flex items-center justify-center gap-3 bg-[#ef3333] text-white font-black text-[10px] md:text-xs uppercase tracking-widest py-4 md:py-5 rounded-xl md:rounded-2xl hover:bg-red-700 transition-all transform active:scale-95 shadow-xl shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    BUY NOW
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM CONTENT - Desktop: Grid, Mobile: Stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 mt-16 md:mt-20">
          <div className="lg:col-span-8 space-y-10 md:space-y-12">
            <section className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-4 border-b border-zinc-900 pb-4">
                <div className="w-1 h-5 md:w-1.5 md:h-6 bg-[#ef3333] rounded-full" />
                <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter">Collector's Notes</h3>
              </div>
              <p className="text-zinc-400 text-[12px] md:text-sm leading-relaxed md:leading-loose whitespace-pre-line font-medium max-w-4xl italic">
                {product.metadata?.description || "No additional description."}
              </p>
            </section>
            
            {/* Store section needs to be responsive internally as well */}
            <StoreSection store={product.store} storeId={product.store_id} />
          </div>

          <div className="lg:col-span-4 w-full">
            <ReviewSidebar
              reviews={reviews}
              isLoading={isLoadingReviews}
              total={reviews.length}
            />
          </div>
        </div>

        {/* RECOMMENDED SECTION */}
        <div className="mt-24 md:mt-32 space-y-8 md:space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-6 md:pb-8 gap-4">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3 md:gap-4">
              <span className="w-2 md:w-2.5 h-8 md:h-10 bg-[#ef3333] rounded-full" /> Market Highlights
            </h2>
            <Link href="/search" className="text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] hover:text-white transition-all flex items-center gap-2">
              Explore All <ArrowRight size={14} className="md:w-[16px]" />
            </Link>
          </div>
          <Suspense fallback={<div className="h-64 md:h-96 w-full bg-zinc-900 animate-pulse rounded-[1.5rem] md:rounded-[3rem]" />}>
            <RecommendedFeed />
          </Suspense>
        </div>
      </main>

      <style jsx>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
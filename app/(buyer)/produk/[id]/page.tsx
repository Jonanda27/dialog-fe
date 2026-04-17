"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// SERVICES & TYPES
import { productService } from "@/services/api/product.service";
import { ReviewService } from "@/services/api/review.service";
import { Product } from "@/types/product";
import { Review } from "@/types/review";
import { useCartStore } from "@/store/cartStore";

// COMPONENTS
import ProductGallery from "@/components/product/ProductGallery";
import StoreSection from "@/components/product/StoreSection";
import ReviewSidebar from "@/components/product/ReviewSidebar";
import RecommendedFeed from "@/components/dashboard/RecommendedFeed";
import AuctionBidPanel from "@/components/product/AuctionBidPanel"; // [NEW] Import komponen lelang

// ICONS
import {
  Loader2,
  Disc,
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

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  // STATE
  // Asumsi tipe Product sudah ditambahkan properti opsional `auction?: any` dan `is_locked: boolean`
  const [product, setProduct] = useState<any | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

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

  const handleAddToCart = () => {
    if (!product) return;

    const primaryMedia =
      product.media?.find((m: any) => m.is_primary)?.media_url || "";

    try {
      addItem({
        id: product.id,
        name: product.name,
        artist: product.metadata.artist || "Unknown Artist",
        price: Number(product.price),
        mediaUrl: getImageUrl(primaryMedia),
        store_id: product.store_id,
        store_name: product.store?.name || "Toko Analog",
        stock: product.stock,
      });

      toast.success(`${product.name} ditambahkan ke koleksi`, {
        description: "Lihat di keranjang untuk checkout",
        position: "bottom-center",
      });
    } catch (error) {
      toast.error("Gagal menambahkan ke keranjang");
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#ef3333] w-10 h-10" />
      </div>
    );

  if (!product) return null;

  // Evaluasi apakah produk ini sedang dalam mode Lelang Aktif / Terjadwal
  const isAuctionMode = product.is_locked && product.auction;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans pb-20 pt-10">
      <main className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* NAVIGATION */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-500">
            <Link href="/" className="hover:text-[#ef3333] transition-colors">
              Analog.id
            </Link>
            <ChevronRight size={12} />
            <Link
              href="/search"
              className="hover:text-[#ef3333] transition-colors"
            >
              Marketplace
            </Link>
            <ChevronRight size={12} />
            <span className="text-zinc-200 truncate">{product.name}</span>
          </div>

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Back to Collection
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6">
            <ProductGallery
              media={product.media || []}
              productName={product.name}
              grading={product.metadata.media_grading}
            />
          </div>

          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[#ef3333]/10 text-[#ef3333] text-[9px] font-black uppercase tracking-widest rounded-full border border-[#ef3333]/20">
                  {product.subCategory?.name || "VINTAGE RARE"}
                </span>

                <div className="flex items-center gap-1 text-yellow-500 font-black text-xs">
                  <Star size={14} fill="currentColor" /> {averageRating}{" "}
                  <span className="text-zinc-500 ml-1">
                    ({totalReviews} Reviews)
                  </span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tighter uppercase mb-2">
                {product.name}
              </h1>

              <p className="text-xl text-zinc-500 font-bold uppercase tracking-widest italic">
                {product.metadata.artist || "Various Artists"}
              </p>
            </div>

            <div className="bg-[#111114] border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                  {isAuctionMode ? "Starting / Current Bid" : "Current Offer"}
                </p>

                <h2 className="text-4xl font-black text-white italic">
                  Rp{" "}
                  {isAuctionMode
                    ? Number(product.auction.current_price || product.price).toLocaleString("id-ID")
                    : Number(product.price).toLocaleString("id-ID")
                  }
                </h2>
              </div>

              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck size={12} /> In Stock: {product.stock} Unit
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Format", value: product.metadata.format || "LP" },
                {
                  label: "Year",
                  value: product.metadata.release_year || "N/A",
                },
                {
                  label: "Genre",
                  value: product.metadata.genre || "Analog Classic",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-zinc-900/50 border border-zinc-800/60 p-4 rounded-2xl"
                >
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">
                    {item.label}
                  </p>

                  <p className="text-xs font-bold text-zinc-200">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 flex items-start gap-4 shadow-inner">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <ClipboardCheck size={24} />
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-1">
                  PRO-GRADING SERVICE
                </h4>

                <p className="text-[11px] text-amber-200/60 leading-relaxed font-medium">
                  Ragu dengan grading penjual? Request pengecekan fisik oleh tim
                  Analog.id Expert (+Rp25.000).
                </p>

                <button className="mt-4 text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 hover:text-amber-400 transition-colors">
                  Request Verification <ArrowUpRight size={14} />
                </button>
              </div>
            </div>

            {/* =========================================
                GAME CHANGER: CONDITIONAL RENDERING ACTION
                ========================================= */}
            <div className="pt-4">
              {isAuctionMode ? (
                // MODE LELANG AKTIF
                <div className="bg-[#111114] border border-zinc-800 rounded-2xl overflow-hidden">
                  <AuctionBidPanel
                    auctionId={product.auction.id}
                    initialPrice={Number(product.auction.current_price || product.price)}
                    increment={Number(product.auction.increment)}
                    endTime={product.auction.end_time}
                  />
                </div>
              ) : (
                // MODE E-COMMERCE REGULER
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock < 1}
                    className="flex items-center justify-center gap-3 bg-white text-black font-black text-xs uppercase tracking-widest py-5 rounded-2xl hover:bg-[#ef3333] hover:text-white transition-all transform active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>

                  <button
                    disabled={product.stock < 1}
                    className="flex items-center justify-center gap-3 bg-[#ef3333] text-white font-black text-xs uppercase tracking-widest py-5 rounded-2xl hover:bg-red-700 transition-all transform active:scale-95 shadow-xl shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-20">
          <div className="lg:col-span-8 space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-4 border-b border-zinc-900 pb-4">
                <div className="w-1.5 h-6 bg-[#ef3333] rounded-full" />

                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                  Collector's Notes
                </h3>
              </div>

              <p className="text-zinc-400 text-sm leading-loose whitespace-pre-line font-medium max-w-4xl italic">
                {product.metadata.description || "No additional description."}
              </p>
            </section>

            <StoreSection store={product.store} storeId={product.store_id} />
          </div>

          <div className="lg:col-span-4 space-y-8">
            <ReviewSidebar
              reviews={reviews}
              isLoading={isLoadingReviews}
              total={reviews.length}
            />
          </div>
        </div>

        <div className="mt-32 space-y-10">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-8">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
              <span className="w-2.5 h-10 bg-[#ef3333] rounded-full" /> Market
              Highlights
            </h2>

            <Link
              href="/search"
              className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] hover:text-white transition-all flex items-center gap-2"
            >
              Explore All <ArrowRight size={16} />
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="h-96 w-full bg-zinc-900 animate-pulse rounded-[3rem]" />
            }
          >
            <RecommendedFeed />
          </Suspense>
        </div>
      </main>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
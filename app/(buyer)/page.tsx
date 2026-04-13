import { ProductService } from '@/services/api/product.service';
import { CategoryService } from '@/services/api/category.service';
import HeroHeader from '@/components/dashboard/HeroHeader';
import CategoryShowcase from '@/components/dashboard/CategoryShowcase';
import CuratedFeed from '@/components/dashboard/CuratedFeed';
import Link from 'next/link';

// Import tipe data agar TypeScript tidak protes
import { Product } from '@/types/product';
import { Category } from '@/types/category';

export const revalidate = 3600;

export default async function BuyerHomePage() {
    // Memberikan tipe data eksplisit pada inisialisasi variabel
    let categories: Category[] = [];
    let recentProducts: Product[] = [];

    try {
        const [categoriesRes, recentProductsRes] = await Promise.all([
            CategoryService.getAllCategories(),
            ProductService.getAll({ limit: '8' })
        ]);

        categories = categoriesRes?.data || [];
        recentProducts = recentProductsRes?.data || [];
    } catch (error) {
        console.error("Gagal memuat data dari API:", error);
    }

    return (
        <main className="min-h-screen bg-[#0a0a0b] text-zinc-100 selection:bg-[#ef3333]/30 font-sans">
            <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 space-y-28">

                <HeroHeader />

                <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="flex justify-between items-end mb-10">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <span className="w-8 h-8 rounded bg-[#ef3333] flex items-center justify-center text-white text-sm">
                                    🏪
                                </span>
                                Featured Storefront
                            </h2>
                            <p className="text-zinc-500 text-xs font-medium tracking-widest uppercase">
                                Jelajahi koleksi berdasarkan kategori pilihan
                            </p>
                        </div>
                        <Link
                            href="/katalog"
                            className="text-[#ef3333] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[#ef3333]/20 pb-1 hover:border-[#ef3333] transition-all"
                        >
                            Lihat Semua →
                        </Link>
                    </div>
                    <CategoryShowcase categories={categories} />
                </section>

                <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="shrink-0">
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                                Terpopuler Untukmu
                            </h2>
                            <p className="text-[#ef3333] text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                                Rilisan Fisik & Audio Gear Pilihan
                            </p>
                        </div>
                        <div className="h-px flex-1 bg-zinc-900 shadow-sm"></div>
                        <div className="hidden md:block">
                            <Link
                                href="/katalog"
                                className="bg-zinc-900/50 border border-zinc-800 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
                            >
                                Katalog Lengkap
                            </Link>
                        </div>
                    </div>
                    <CuratedFeed initialProducts={recentProducts} />
                </section>

                <footer className="pt-20 border-t border-zinc-900 flex flex-col items-center gap-4 opacity-50">
                    <div className="text-xl font-black text-[#ef3333] tracking-tighter uppercase">
                        Analog<span className="text-white">.id</span>
                    </div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-zinc-500">
                        EST. 2026 — COLLECTOR'S PARADISE
                    </p>
                </footer>

            </div>
        </main>
    );
}
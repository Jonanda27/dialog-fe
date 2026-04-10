import { ProductService } from '@/services/api/product.service';
import { CategoryService } from '@/services/api/category.service';
import HeroHeader from '@/components/dashboard/HeroHeader';
import CategoryShowcase from '@/components/dashboard/CategoryShowcase';
import CuratedFeed from '@/components/dashboard/CuratedFeed';

// Optimasi: Halaman ini di-cache dan di-revalidasi setiap 1 jam (ISR)
// Sangat efisien untuk Homepage e-commerce yang tidak berubah setiap detik.
export const revalidate = 3600;

export default async function BuyerHomePage() {
    // 1. Eksekusi Data Fetching Paralel di Server
    const [categoriesRes, recentProductsRes] = await Promise.all([
        CategoryService.getAllCategories(),
        ProductService.getAll({ limit: '8' }) // Ambil 8 produk terbaru
    ]);

    const categories = categoriesRes?.data || [];
    const recentProducts = recentProductsRes?.data || [];

    return (
        <main className="flex flex-col min-h-screen bg-gray-50">
            {/* Bagian Atas: Banner Statis Tanpa Animasi */}
            <HeroHeader />

            {/* Bagian Konten Utama: Menggunakan Grid System yang Kokoh */}
            <div className="container mx-auto px-4 md:px-8 py-10 space-y-16">

                {/* Etalase Kategori (CD, Vinyl, Gear) */}
                <section>
                    <div className="mb-6 border-b border-gray-200 pb-2">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Jelajahi Kategori
                        </h2>
                    </div>
                    {/* Render Statis - Tidak membebani Client */}
                    <CategoryShowcase categories={categories} />
                </section>

                {/* Etalase Produk Terbaru */}
                <section>
                    <div className="mb-6 flex justify-between items-end border-b border-gray-200 pb-2">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Rilisan Terbaru
                        </h2>
                        <a href="/katalog" className="text-sm font-semibold text-blue-600 hover:underline">
                            Lihat Semua
                        </a>
                    </div>
                    {/* Client Component: Menerima initialData dari Server */}
                    <CuratedFeed initialProducts={recentProducts} />
                </section>

            </div>
        </main>
    );
}
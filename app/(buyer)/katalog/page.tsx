import { productService } from '@/services/api/product.service';
import { CategoryService } from '@/services/api/category.service';
import CatalogClient from './CatalogClient'; // Komponen Interaktif

// SEO Metadata Dinamis
export const metadata = {
    title: 'Katalog Rilisan Fisik & Audio Gear | Analog.id',
    description: 'Eksplorasi ribuan piringan hitam, kaset, dan perlengkapan audio dengan grading terpercaya.',
};

export default async function KatalogPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // 1. Parsing Parameter URL (Menangkap filter JSONB dari URL)
    // Contoh URL: /katalog?sub_category_id=123&media_grading=NM
    const queryParams: Record<string, string> = {};
    for (const key in searchParams) {
        if (searchParams[key]) {
            queryParams[key] = String(searchParams[key]);
        }
    }

    // 2. Server-Side Data Fetching
    const [productsRes, categoriesRes] = await Promise.all([
        productService.getAll(queryParams),
        CategoryService.getAllCategories()
    ]);

    const initialProducts = productsRes?.data || [];
    const categories = categoriesRes?.data || [];

    return (
        <main className="min-h-screen bg-gray-50 pt-6 pb-20">
            <div className="container mx-auto px-4 md:px-8">

                {/* Header Katalog (Clean & Flat Design) */}
                <div className="mb-8 bg-white p-6 border border-gray-200 rounded-none shadow-sm">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Katalog Utama</h1>
                    <p className="text-gray-600 mt-1 text-sm">
                        Gunakan filter di samping untuk menemukan atribut spesifik seperti Grading, Voltage, atau Tahun Rilis.
                    </p>
                </div>

                {/* Handoff ke Client Component.
                    Komponen inilah yang akan merender tata letak Sidebar Kiri dan Grid Kanan.
                */}
                <CatalogClient
                    initialProducts={initialProducts}
                    categories={categories}
                    initialFilters={queryParams}
                />

            </div>
        </main>
    );
}
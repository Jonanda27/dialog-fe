// dialog-id-fe/app/(buyer)/katalog/page.tsx

import { productService } from "@/services/api/product.service";
import { CategoryService } from "@/services/api/category.service";
import CatalogClient from "./CatalogClient";

// Memastikan halaman selalu mengambil data terbaru saat URL berubah
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function KatalogPage({
  searchParams,
}: {
  // searchParams adalah Promise pada versi Next.js terbaru
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // PERBAIKAN UTAMA: Await searchParams agar data filter terbaca 
  const resolvedSearchParams = await searchParams;

  const queryParams: Record<string, string> = {};
  for (const key in resolvedSearchParams) {
    const value = resolvedSearchParams[key];
    if (value) {
      queryParams[key] = String(value);
    }
  }

  // Server-Side Data Fetching dengan queryParams yang sudah terisi filter
  const [productsRes, categoriesRes] = await Promise.all([
    productService.getAll(queryParams).catch(() => null),
    CategoryService.getAllCategories().catch(() => null),
  ]);

  const initialProducts = Array.isArray(productsRes)
    ? productsRes
    : productsRes?.data || [];

  const categories = Array.isArray(categoriesRes)
    ? categoriesRes
    : categoriesRes?.data || [];

  return (
    <main className="min-h-screen bg-[#0a0a0b] pt-10 pb-20">
      <div className="max-w-[1400px] mx-auto px-4">
        <CatalogClient
          // Properti key sangat penting untuk mereset state Client Component saat filter berubah [cite: 189]
          key={JSON.stringify(queryParams)} 
          initialProducts={initialProducts}
          categories={categories}
          initialFilters={queryParams}
        />
      </div>
    </main>
  );
}
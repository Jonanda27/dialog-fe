'use client';

import { useEffect } from 'react';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { useProductStore } from '@/store/productStore';
import DynamicFilterSidebar from '@/components/product/DynamicFilterSidebar';
import ProductGrid from '@/components/product/ProductGrid';

interface CatalogClientProps {
    initialProducts: Product[];
    categories: Category[];
    initialFilters: Record<string, string>;
}

export default function CatalogClient({ initialProducts, categories, initialFilters }: CatalogClientProps) {
    const { products, setInitialProducts } = useProductStore();

    // Hydrate: Menyuntikkan data dari Server ke dalam Zustand saat pertama kali dirender
    useEffect(() => {
        setInitialProducts(initialProducts);
    }, [initialProducts, setInitialProducts]);

    // Fallback: Jika Zustand belum selesai hydrate, gunakan data inisial dari Server (mencegah kedipan)
    const displayProducts = products.length > 0 ? products : initialProducts;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Kolom Kiri: Sidebar Filter */}
            <div className="lg:col-span-3">
                <DynamicFilterSidebar categories={categories} />
            </div>

            {/* Kolom Kanan: Grid Produk */}
            <div className="lg:col-span-9">
                <ProductGrid products={displayProducts} />
            </div>
        </div>
    );
}
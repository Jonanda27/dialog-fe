// CatalogClient.tsx
'use client';

import { useEffect } from 'react';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { useProductStore } from '@/store/productStore';
import DynamicFilterSidebar from '@/components/product/DynamicFilterSidebar';
import ProductGrid from '@/components/product/ProductGrid';

// Definisi Interface untuk Props
interface CatalogClientProps {
    initialProducts: Product[];
    categories: Category[];
    initialFilters: Record<string, string>;
}

export default function CatalogClient({ 
    initialProducts, 
    categories, 
    initialFilters 
}: CatalogClientProps) { // <-- Menambahkan interface di sini memperbaiki error 'any'
    
    const { setInitialProducts } = useProductStore();

    // Hydrate store Zustand saat initialProducts berubah dari server
    useEffect(() => {
        setInitialProducts(initialProducts);
    }, [initialProducts, setInitialProducts]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Kolom Kiri: Sidebar Filter */}
            <div className="lg:col-span-3">
                <DynamicFilterSidebar categories={categories} />
            </div>

            {/* Kolom Kanan: Grid Produk */}
            <div className="lg:col-span-9">
                {/* PENTING: Kita menggunakan initialProducts langsung dari props.
                  Karena di katalog.tsx kita memberi 'key' unik pada CatalogClient,
                  setiap kali URL berubah, komponen ini akan di-mount ulang 
                  dengan initialProducts yang baru dari server.
                */}
                <ProductGrid products={initialProducts} />
            </div>
        </div>
    );
}
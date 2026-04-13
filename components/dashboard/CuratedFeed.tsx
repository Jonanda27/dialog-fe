'use client';

import { Product } from '@/types/product';
import ProductCard from '@/components/ui/ProductCard';

interface CuratedFeedProps {
    initialProducts: Product[]; // PERBAIKAN: Mendefinisikan props produk dari Server
}

export default function CuratedFeed({ initialProducts }: CuratedFeedProps) {
    if (!initialProducts || initialProducts.length === 0) {
        return <p className="text-gray-500 italic">Belum ada rilisan terbaru.</p>;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {initialProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
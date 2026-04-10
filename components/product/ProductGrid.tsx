import { Product } from '@/types/product';
import ProductCard from '@/components/ui/ProductCard';

interface ProductGridProps {
    products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    if (!products || products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-gray-300 bg-gray-50">
                <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900">Katalog Kosong</h3>
                <p className="text-sm text-gray-500 mt-1">Tidak ada produk yang cocok dengan filter Anda.</p>
            </div>
        );
    }

    return (
        // Grid System: 2 kolom di HP, 3 kolom di Tablet, 4 kolom di Desktop (col-span-9 dari 12)
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { ProductService } from '@/services/api/product.service'; // Memanfaatkan service FE yang sudah ada

export default function RecommendedFeed() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommended = async () => {
            try {
                // Mengambil 4 produk secara dinamis di sisi klien
                const res = await ProductService.getAll({ limit: '4' });
                setProducts(res?.data || []);
            } catch (error) {
                console.error('Gagal memuat rekomendasi:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommended();
    }, []);

    if (isLoading) {
        return (
            <div className="h-96 w-full bg-[#111114] border border-zinc-800 rounded-2xl animate-pulse flex items-center justify-center">
                <span className="text-zinc-600 font-bold uppercase tracking-widest text-xs">Memuat Rekomendasi...</span>
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white tracking-tight">Rekomendasi Untuk Anda</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => {
                    const primaryMedia = product.media?.find((m: any) => m.is_primary)?.media_url || '';
                    return (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            artist={product.artist}
                            price={Number(product.price)}
                            grading={product.grading}
                            mediaUrl={primaryMedia}
                        />
                    );
                })}
            </div>
        </div>
    );
}
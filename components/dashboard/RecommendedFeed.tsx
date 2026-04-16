'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { productService } from '@/services/api/product.service';

/** * HELPER UNTUK FORMAT URL GAMBAR
 * Mengubah path database menjadi: http://localhost:5000/public/uploads/...
 */
const formatImageUrl = (path: string | null | undefined): string => {
    if (!path) return '/placeholder.jpg';
    if (path.startsWith('http')) return path; // Jika sudah URL lengkap, biarkan

    const baseUrl = 'http://localhost:5000';
    // Memastikan path diawali dengan slash agar tidak double slash saat digabung
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Hasil akhirnya: http://localhost:5000/public/uploads/...
    return `${baseUrl}/public${cleanPath}`;
};

export default function RecommendedFeed() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommended = async () => {
            try {
                // Mengambil 4 produk secara dinamis di sisi klien
                const res = await productService.getAll({ limit: '4' });
                const rawData = res?.data || [];

                /**
                 * PROSES FIX URL GAMBAR
                 * Kita memetakan ulang array produk dan mengubah setiap media_url 
                 * di dalam array media produk tersebut.
                 */
                const formattedProducts = rawData.map((product: any) => ({
                    ...product,
                    media: product.media?.map((m: any) => ({
                        ...m,
                        media_url: formatImageUrl(m.media_url)
                    }))
                }));

                setProducts(formattedProducts);
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
                {products.map((product) => (
                    // PERBAIKAN: Mengirimkan satu objek 'product' utuh dengan URL yang sudah benar
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}
            </div>
        </div>
    );
}
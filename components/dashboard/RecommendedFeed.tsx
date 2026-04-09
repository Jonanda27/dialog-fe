import ProductCard from '@/components/ui/ProductCard';
import { getRecentProducts } from '@/utils/serverAuth';

export default async function RecommendedFeed() {
    const products = await getRecentProducts();

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Rekomendasi Untuk Anda</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product: any) => {
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
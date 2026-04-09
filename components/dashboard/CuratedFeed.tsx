import ProductCard from '@/components/ui/ProductCard';
import { getRecentProducts } from '@/utils/serverAuth';

export default async function CuratedFeed() {
    const products = await getRecentProducts();

    return (
        <div className="col-span-full mt-4">
            <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
                <h2 className="text-2xl font-serif text-white">Berdasarkan Koleksi Anda</h2>
                <button className="text-sm text-zinc-400 hover:text-white uppercase tracking-widest font-semibold transition-colors">
                    Eksplorasi ⭢
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
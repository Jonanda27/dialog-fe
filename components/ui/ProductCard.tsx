import Link from 'next/link';
import { Product } from '@/types/product';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const primaryImage = product.media?.find((m) => m.is_primary)?.media_url || '/placeholder.jpg';

    // Ambil grading dari metadata asli produk Anda
    const conditionBadge = product.metadata?.media_grading || product.metadata?.physical_condition || 'VG+';

    const formatIDR = (price: number) => {
        return "Rp" + price.toLocaleString("id-ID").replace(/,/g, ".");
    };

    return (
        <Link href={`/produk/${product.id}`} className="group">
            <div className="bg-[#111114] rounded-2xl border border-zinc-800 overflow-hidden cursor-pointer hover:shadow-2xl hover:border-[#ef3333]/50 transition-all flex flex-col h-full shadow-lg">
                <div className="aspect-square relative overflow-hidden bg-black">
                    <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-white border border-white/10 uppercase tracking-widest">
                        {conditionBadge}
                    </div>
                </div>

                <div className="p-5 flex flex-col flex-1 text-left">
                    <h3 className="text-sm font-bold line-clamp-2 leading-snug text-zinc-100 group-hover:text-[#ef3333] transition-colors h-10">
                        {product.name}
                    </h3>
                    <p className="text-[#ef3333] text-xl font-black mt-3 leading-none">
                        {formatIDR(Number(product.price))}
                    </p>

                    <div className="mt-auto pt-4 flex items-center gap-1 text-[11px] text-zinc-500 font-bold uppercase tracking-tight">
                        <span className="text-zinc-300">★ 4.9</span>
                        <span className="mx-1">•</span>
                        <span className="truncate">{product.store?.name || 'Analog Store'}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
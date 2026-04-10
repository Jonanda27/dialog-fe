import Link from 'next/link';
import { Product } from '@/types/product';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    // 1. Ekstraksi Gambar Utama
    const primaryImage = product.media?.find((m) => m.is_primary)?.media_url || '/placeholder.jpg';

    // 2. Ekstraksi Atribut Dinamis JSONB (Prioritaskan Grading Audio, lalu Kondisi Gear)
    const conditionBadge =
        product.metadata?.media_grading ||
        product.metadata?.physical_condition ||
        'Good';

    // 3. Format Harga Rupiah
    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(Number(product.price));

    return (
        <Link href={`/produk/${product.id}`} className="group block h-full">
            <div className="flex flex-col h-full border border-gray-200 bg-white hover:border-gray-400 transition-colors duration-150 rounded-none overflow-hidden">

                {/* Image Section: Aspect-Square mengunci dimensi agar tidak ada layout shift */}
                <div className="relative w-full aspect-square bg-gray-100 border-b border-gray-200 overflow-hidden">
                    {/* Menggunakan elemen img standar dengan object-cover untuk performa flat */}
                    <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />

                    {/* Badge Kondisi Dinamis (Diambil dari JSONB) */}
                    <div className="absolute top-2 right-2 bg-black text-white text-xs font-bold px-2 py-1 tracking-wider uppercase">
                        {conditionBadge}
                    </div>
                </div>

                {/* Info Section */}
                <div className="p-4 flex flex-col grow">
                    {/* Nama Toko / Sub Kategori */}
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">
                        {product.store?.name || 'Analog Store'}
                    </p>

                    {/* Nama Produk */}
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 leading-tight mb-2 line-clamp-2 grow">
                        {product.name}
                    </h3>

                    {/* Harga */}
                    <p className="text-lg font-bold text-gray-900 mt-auto">
                        {formattedPrice}
                    </p>
                </div>
            </div>
        </Link>
    );
}
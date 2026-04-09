import Image from 'next/image';
import ProductActions from '@/components/product/ProductActions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getProductDetail(id: string) {
    const res = await fetch(`${API_URL}/api/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProductDetail(id);

    if (!product) {
        return <div className="text-center py-20 text-zinc-500">Produk tidak ditemukan.</div>;
    }

    const primaryMedia = product.media?.find((m: any) => m.is_primary)?.media_url || '/vynil.png';
    const formatPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price);

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Kolom Kiri: Image Gallery */}
            <div className="space-y-4">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
                    <Image src={primaryMedia} alt={product.name} fill className="object-cover" />
                </div>
                {/* Placeholder Thumbnail Gallery jika ada media lain */}
                {product.media?.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {product.media.map((m: any) => (
                            <div key={m.id} className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-zinc-800 cursor-pointer hover:border-red-500 transition">
                                <Image src={m.media_url} alt="Thumbnail" fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Kolom Kanan: Metadata & Actions */}
            <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-md border border-red-500/20">
                        {product.format}
                    </span>
                    <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-md border border-zinc-700">
                        Grading: {product.grading}
                    </span>
                </div>

                <h1 className="text-4xl font-bold text-white tracking-tight">{product.name}</h1>
                <p className="text-xl text-zinc-400 mt-2">{product.artist}</p>

                <div className="text-3xl font-bold text-white mt-6 mb-8">{formatPrice}</div>

                <div className="space-y-4 border-t border-zinc-800 pt-6">
                    <div className="grid grid-cols-2 gap-y-4 text-sm">
                        <div><p className="text-zinc-500">Tahun Rilis</p><p className="font-medium text-white">{product.release_year || '-'}</p></div>
                        <div><p className="text-zinc-500">Label</p><p className="font-medium text-white">{product.label || '-'}</p></div>
                        <div><p className="text-zinc-500">Matrix Number</p><p className="font-medium text-white">{product.matrix_number || '-'}</p></div>
                        <div><p className="text-zinc-500">Stok Tersedia</p><p className="font-medium text-white">{product.stock}</p></div>
                    </div>

                    <div className="mt-4">
                        <p className="text-zinc-500 text-sm mb-1">Catatan Penjual</p>
                        <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                            {product.condition_notes || 'Tidak ada catatan khusus.'}
                        </p>
                    </div>
                </div>

                {/* Client Actions */}
                <ProductActions product={product} />
            </div>
        </div>
    );
}
import Image from 'next/image';
import { Product } from '@/types/product';
import ProductActions from '@/components/product/ProductActions';
import MetadataRenderer from '@/components/product/MetadataRenderer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Fetching langsung ke endpoint backend di Server-Side
async function getProductDetail(id: string): Promise<Product | null> {
    try {
        // Menggunakan fetch bawaan Next.js untuk kontrol cache
        const res = await fetch(`${API_URL}/api/products/${id}`, { cache: 'no-store' });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
    } catch (error) {
        return null;
    }
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProductDetail(id);

    if (!product) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Produk Tidak Ditemukan</h2>
                <p className="text-gray-500">Barang yang Anda cari mungkin sudah dihapus atau ditarik oleh penjual.</p>
            </div>
        );
    }

    // Ekstraksi Media Utama & Thumbnail
    const primaryMedia = product.media?.find((m) => m.is_primary)?.media_url || '/placeholder.jpg';
    const thumbnails = product.media || [];

    // Format Harga
    const formatPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(Number(product.price));

    // Ekstraksi Atribut Prioritas untuk Title Area
    const conditionBadge = product.metadata?.media_grading || product.metadata?.physical_condition || 'N/A';
    const artistName = product.metadata?.artist || product.metadata?.brand || product.store?.name;

    return (
        <main className="bg-white min-h-screen pt-8 pb-24">
            <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* KOLOM KIRI: Galeri Gambar (col-span-5) */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Gambar Utama (Aspect Square, Flat Border) */}
                    <div className="relative aspect-square w-full border border-gray-200 bg-gray-50 overflow-hidden">
                        <Image
                            src={primaryMedia}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Thumbnail Gallery */}
                    {thumbnails.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {thumbnails.map((m) => (
                                <div
                                    key={m.id}
                                    className={`relative w-20 h-20 shrink-0 border cursor-pointer transition-colors ${m.is_primary ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    <Image src={m.media_url} alt="Thumbnail" fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* KOLOM KANAN: Informasi Produk (col-span-7) */}
                <div className="lg:col-span-7 flex flex-col">

                    {/* Header: Badges & Title */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-2 py-1 bg-black text-white text-xs font-bold tracking-widest uppercase">
                            {product.subCategory?.name || 'Katalog'}
                        </span>
                        <span className="px-2 py-1 border border-black text-black text-xs font-bold tracking-widest uppercase bg-white">
                            Cond: {conditionBadge}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
                        {product.name}
                    </h1>

                    {artistName && (
                        <p className="text-lg text-gray-500 mt-2 font-medium">
                            {artistName}
                        </p>
                    )}

                    <div className="text-4xl font-extrabold text-gray-900 mt-6 mb-8">
                        {formatPrice}
                    </div>

                    {/* Deskripsi Bebas (Dari JSONB) */}
                    {product.metadata?.description && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Catatan Penjual</h3>
                            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 border border-gray-200">
                                {product.metadata.description}
                            </div>
                        </div>
                    )}

                    {/* Metadata Dinamis (Tabel JSONB) */}
                    <MetadataRenderer metadata={product.metadata} />

                    {/* Footer Informasi & Tombol Aksi */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500">Dijual oleh</span>
                                <span className="font-bold text-gray-900">{product.store?.name || 'Analog Store'}</span>
                            </div>
                            <div className="text-right flex flex-col">
                                <span className="text-sm text-gray-500">Sisa Stok</span>
                                <span className="font-bold text-gray-900">{product.stock} Pcs</span>
                            </div>
                        </div>

                        {/* Komponen Client (Zustand Cart Mutator) */}
                        <ProductActions product={product} />
                    </div>

                </div>
            </div>
        </main>
    );
}
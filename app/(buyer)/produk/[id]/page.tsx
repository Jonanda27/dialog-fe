import { productService } from '@/services/api/product.service';
import ProductGallery from '@/components/product/ProductGallery';
import MetadataRenderer from '@/components/product/MetadataRenderer';
import ProductActions from '@/components/product/ProductActions';
import StoreInfoCard from '@/components/product/StoreInfoCard';
import { notFound } from 'next/navigation';

// ⚡ 1. Definisikan tipe params sebagai Promise
type PageProps = {
    params: Promise<{ id: string }>;
};

// ⚡ 2. Gunakan PageProps pada parameter
export default async function ProductDetailPage({ params }: PageProps) {

    // ⚡ 3. Unwrap Promise secara eksplisit sebelum digunakan
    const resolvedParams = await params;

    // ⚡ 4. Gunakan ID yang sudah diekstrak untuk memanggil API
    const response = await productService.getById(resolvedParams.id);
    const product = response.data;

    if (!product) notFound();

    return (
        <main className="min-h-screen bg-white pt-8 pb-24">
            <div className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Kolom Kiri: Visual & Galeri */}
                <div className="lg:col-span-5 space-y-6">
                    <ProductGallery media={product.media || []} productName={product.name} />
                </div>

                {/* Kolom Kanan: Informasi & Transaksi */}
                <div className="lg:col-span-7 flex flex-col">
                    <div className="border-b border-gray-100 pb-6 mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                            {product.name}
                        </h1>
                        <p className="text-2xl font-extrabold text-black">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(product.price))}
                        </p>
                    </div>

                    <StoreInfoCard store={product.store} />

                    <MetadataRenderer metadata={product.metadata} />

                    {/* Area Transaksi Reaktif */}
                    <div className="mt-auto pt-8">
                        <ProductActions product={product} />
                    </div>
                </div>

            </div>
        </main>
    );
}
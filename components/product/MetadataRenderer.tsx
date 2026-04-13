import { ProductMetadata } from '@/types/product';

interface MetadataRendererProps {
    metadata: ProductMetadata;
}

export default function MetadataRenderer({ metadata }: MetadataRendererProps) {
    if (!metadata) return null;

    // Filter key yang tidak perlu ditampilkan di tabel spesifikasi
    const excludedKeys = ['status', 'description'];

    const specs = Object.entries(metadata).filter(([key]) => !excludedKeys.includes(key));

    if (specs.length === 0) {
        return <p className="text-sm text-gray-500 italic">Spesifikasi tidak tersedia.</p>;
    }

    // Helper: Mengubah key 'media_grading' menjadi 'Media Grading'
    const formatKey = (key: string) => {
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Spesifikasi Produk</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                {specs.map(([key, value]) => (
                    <div key={key} className="flex flex-col border-b border-gray-100 pb-2">
                        <span className="text-gray-500 mb-1">{formatKey(key)}</span>
                        <span className="font-semibold text-gray-900">{String(value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
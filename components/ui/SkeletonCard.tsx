export default function SkeletonCard() {
    return (
        <div className="flex flex-col h-full border border-gray-200 bg-white animate-pulse">

            {/* Image Section Skeleton (Tetap menggunakan aspect-square agar tidak goyang) */}
            <div className="relative w-full aspect-square bg-gray-200 border-b border-gray-200" />

            {/* Info Section Skeleton */}
            <div className="p-4 flex flex-col grow">
                {/* Nama Toko / Sub Kategori Placeholder */}
                <div className="h-3 bg-gray-200 w-1/3 mb-2" />

                {/* Nama Produk Placeholder (Dibuat 2 baris agar realistis) */}
                <div className="h-4 bg-gray-300 w-full mb-1.5" />
                <div className="h-4 bg-gray-300 w-2/3 mb-2 grow" />

                {/* Harga Placeholder */}
                <div className="h-5 bg-gray-800 w-1/2 mt-auto" />
            </div>

        </div>
    );
}
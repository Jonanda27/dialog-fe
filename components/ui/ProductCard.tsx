import Image from 'next/image';
import Link from 'next/link';

interface ProductProps {
    id: string;
    name: string;
    artist: string;
    price: number;
    grading: string;
    mediaUrl: string;
}

export default function ProductCard({ id, name, artist, price, grading, mediaUrl }: ProductProps) {
    // Format Rupiah
    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);

    // Warna Badge berdasarkan Grading
    const badgeColor = {
        'Mint': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'NM': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'VG+': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        'VG': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        'Good': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        'Fair': 'bg-red-500/10 text-red-500 border-red-500/20',
    }[grading] || 'bg-zinc-800 text-zinc-300 border-zinc-700';

    return (
        <Link href={`/produk/${id}`} className="group flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:border-red-500/50 transition-all duration-300">
            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden bg-zinc-900">
                <Image
                    src={mediaUrl || '/vynil.png'} // Fallback image dari public folder
                    alt={name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border backdrop-blur-md ${badgeColor}`}>
                        {grading}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-zinc-100 font-medium truncate group-hover:text-red-400 transition-colors">{name}</h3>
                <p className="text-zinc-500 text-sm truncate">{artist}</p>
                <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-zinc-100 font-semibold tracking-tight">{formattedPrice}</span>
                </div>
            </div>
        </Link>
    );
}
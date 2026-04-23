// dialog-id-fe/components/product/ProductGrid.tsx
import { Product } from '@/types/product';
import { ImageIcon } from 'lucide-react';
import Link from 'next/link'; // Import Link untuk navigasi [cite: 1713]

interface ProductGridProps {
    products: Product[];
}

// Helper URL Gambar disesuaikan dengan Base URL API 
const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path || path === "") return null;
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    let cleanPath = path.startsWith("/") ? path : `/${path}`;
    
    // Memastikan path mengarah ke folder public di backend 
    if (!cleanPath.startsWith("/public")) cleanPath = `/public${cleanPath}`;
    return `${baseUrl}${cleanPath}`;
};

export default function ProductGrid({ products }: ProductGridProps) {
    // Menangani tampilan jika hasil filter kosong 
    if (!products || products.length === 0) {
        return (
            <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-zinc-900 rounded-[3rem] text-zinc-700">
                <ImageIcon size={48} className="mb-4 opacity-20" />
                <span className="uppercase text-[11px] font-black tracking-widest">Tidak ada produk yang cocok</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {products.map((p) => {
                // Mengambil media pertama sebagai thumbnail [cite: 1677]
                const firstMediaUrl = p.media && p.media.length > 0 ? p.media[0].media_url : null;
                const imgSrc = getImageUrl(firstMediaUrl);

                return (
                    <Link href={`/produk/${p.id}`} key={p.id} className="group"> {/* Ditambahkan Link pembungkus untuk navigasi [cite: 1713] */}
                        <div className="bg-[#111114] border border-zinc-800 rounded-[2.5rem] overflow-hidden group hover:border-[#ef3333]/50 transition-all duration-500 h-full shadow-lg">
                            <div className="aspect-[4/5] relative overflow-hidden bg-zinc-900">
                                {imgSrc ? (
                                    <img 
                                        src={imgSrc} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                        alt={p.name} 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                        <ImageIcon size={24} className="text-zinc-600" />
                                    </div>
                                )}
                                
                                {/* Overlay Badge - Menampilkan nama sub kategori dari metadata [cite: 1680] */}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-black/50 backdrop-blur-md text-[8px] font-black text-white px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
                                        {p.subCategory?.name || 'New'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-6 text-left"> {/* Ditambahkan text-left untuk konsistensi [cite: 1715] */}
                                <h4 className="text-zinc-400 font-black text-[10px] uppercase tracking-widest mb-1 truncate">
                                    {p.metadata?.artist || "Analog.id Selection"} 
                                </h4>
                                <h4 className="text-white font-black text-sm uppercase truncate mb-2 group-hover:text-[#ef3333] transition-colors h-10 line-clamp-2 leading-snug"> {/* Penambahan styling teks [cite: 1715] */}
                                    {p.name}
                                </h4>
                                <p className="text-[#ef3333] font-black text-base mt-3 leading-none">
                                    Rp {Number(p.price).toLocaleString('id-ID')} 
                                </p>
                            </div>
                        </div>
                    </Link>
                );
            })}
            
            <style jsx>{`
                .animate-fade-in { 
                    animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
                }
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(20px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    );
}
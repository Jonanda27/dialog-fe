'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProductMedia } from '@/types/product';

interface ProductGalleryProps {
    media: ProductMedia[];
    productName: string;
}

export default function ProductGallery({ media, productName }: ProductGalleryProps) {
    const [activeImg, setActiveImg] = useState(media.find(m => m.is_primary)?.media_url || media[0]?.media_url || '/vynil.png');

    return (
        <div className="space-y-4">
            {/* Gambar Utama dengan Efek Zoom */}
            <div className="relative aspect-square w-full border border-gray-200 bg-gray-50 overflow-hidden group">
                <Image
                    src={activeImg}
                    alt={productName}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    priority
                />
            </div>

            {/* Thumbnails */}
            {media.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {media.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => setActiveImg(m.media_url)}
                            className={`relative w-20 h-20 shrink-0 border-2 transition-all ${activeImg === m.media_url ? 'border-black' : 'border-transparent hover:border-gray-300'
                                }`}
                        >
                            <Image src={m.media_url} alt="Thumbnail" fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
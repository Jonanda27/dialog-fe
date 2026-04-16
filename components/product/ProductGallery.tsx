'use client';

import React, { useState } from 'react';
import { Disc, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/utils/image';
import { ProductMedia } from '@/types/product';

interface Props {
    media: ProductMedia[];
    productName: string;
    grading?: string;
}

export default function ProductGallery({ media, productName, grading }: Props) {
    const [index, setIndex] = useState(0);

    const handlePrev = () => setIndex((p) => (p === 0 ? media.length - 1 : p - 1));
    const handleNext = () => setIndex((p) => (p === media.length - 1 ? 0 : p + 1));

    return (
        <div className="space-y-6">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl group">
                {media.length > 0 ? (
                    <img 
                        src={getImageUrl(media[index]?.media_url)} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        alt={productName} 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800">
                        <Disc size={100} className="animate-spin-slow" />
                    </div>
                )}
                
                <div className="absolute top-8 right-8 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black text-[#ef3333] uppercase tracking-widest shadow-2xl">
                    Condition: {grading || "Near Mint"}
                </div>
            </div>

            {media.length > 1 && (
                <div className="relative w-full flex items-center px-6">
                    <button onClick={handlePrev} className="absolute left-0 z-10 w-8 h-8 flex items-center justify-center bg-zinc-800/80 hover:bg-[#ef3333] text-white rounded-sm shadow-md"><ChevronLeft size={20} /></button>
                    <div className="flex flex-1 gap-4 overflow-x-auto no-scrollbar py-2">
                        {media.map((m, idx) => (
                            <button key={m.id} onClick={() => setIndex(idx)} className={`relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${index === idx ? 'border-[#ef3333] scale-105 shadow-lg' : 'border-zinc-800 opacity-50 hover:opacity-100'}`}>
                                <img src={getImageUrl(m.media_url)} className="w-full h-full object-cover" alt="thumb" />
                            </button>
                        ))}
                    </div>
                    <button onClick={handleNext} className="absolute right-0 z-10 w-8 h-8 flex items-center justify-center bg-zinc-800/80 hover:bg-[#ef3333] text-white rounded-sm shadow-md"><ChevronRight size={20} /></button>
                </div>
            )}
        </div>
    );
}
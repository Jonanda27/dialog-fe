'use client';

import { Star, MessageSquare, Loader2 } from 'lucide-react';
import { Review } from '@/types/review';

interface Props {
    reviews: Review[];
    isLoading: boolean;
    total: number;
}

export default function ReviewSidebar({ reviews, isLoading, total }: Props) {
    return (
        <div className="bg-[#111114] border border-zinc-800 rounded-[2.5rem] p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Reviews</h3>
                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">{total}</span>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-zinc-700" /></div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-10">
                    <MessageSquare size={32} className="mx-auto text-zinc-800 mb-4" />
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">No reviews yet</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="space-y-3 border-b border-zinc-900 pb-6 last:border-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[8px] font-bold">
                                        {review.buyer?.full_name?.charAt(0)}
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-200">{review.buyer?.full_name?.split(' ')[0]}</span>
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={8} fill={i < review.rating ? "#ef3333" : "none"} className={i < review.rating ? "text-[#ef3333]" : "text-zinc-800"} />)}
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed italic">"{review.comment}"</p>
                        </div>
                    ))}
                    <button className="w-full py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest border border-dashed border-zinc-800 rounded-2xl hover:text-white hover:border-zinc-500 transition-all">
                        Read All Reviews
                    </button>
                </div>
            )}
        </div>
    );
}
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, X } from 'lucide-react';
import { toast } from 'sonner';

const reviewSchema = z.object({
    rating: z.number().min(1, 'Berikan minimal 1 bintang').max(5),
    comment: z.string().min(10, 'Komentar minimal 10 karakter'),
});

type ReviewForm = z.infer<typeof reviewSchema>;

export default function ReviewFormModal({ orderId, onClose }: { orderId: string, onClose: () => void }) {
    const [rating, setRating] = useState(0);
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ReviewForm>({
        resolver: zodResolver(reviewSchema),
    });

    const onSubmit = async (data: ReviewForm) => {
        try {
            // Logic OrderService.submitReview
            toast.success('Terima kasih atas ulasan Anda!');
            onClose();
        } catch (err) {
            toast.error('Gagal mengirim ulasan');
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md p-8 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black uppercase tracking-tighter">Beri Ulasan</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => { setRating(star); setValue('rating', star); }}
                                className={`transition-colors ${rating >= star ? 'text-black' : 'text-gray-200'}`}
                            >
                                <Star size={32} fill={rating >= star ? 'currentColor' : 'none'} />
                            </button>
                        ))}
                    </div>
                    {errors.rating && <p className="text-center text-[10px] text-red-600 font-bold uppercase">{errors.rating.message}</p>}

                    <textarea
                        {...register('comment')}
                        placeholder="Tulis pendapat Anda tentang grading dan kualitas barang..."
                        className="w-full border border-gray-200 p-4 text-sm focus:outline-none focus:border-black min-h-[120px] resize-none"
                    />
                    {errors.comment && <p className="text-[10px] text-red-600 font-bold uppercase">{errors.comment.message}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50"
                    >
                        Kirim Penilaian
                    </button>
                </form>
            </div>
        </div>
    );
}
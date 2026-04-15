'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, X, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
// Import Service dan Types
import { ReviewService } from '@/services/api/review.service';
import { CreateReviewPayload } from '@/types/review';

const reviewSchema = z.object({
    rating: z.number().min(1, 'Berikan minimal 1 bintang').max(5),
    comment: z.string().min(10, 'Komentar minimal 10 karakter'),
});

type ReviewForm = z.infer<typeof reviewSchema>;

// orderItemId adalah ID dari item spesifik di dalam order (order_items.id)
export default function ReviewFormModal({ orderItemId, onClose, onSuccess }: { orderItemId: string, onClose: () => void, onSuccess?: () => void }) {
    const [rating, setRating] = useState(0);
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ReviewForm>({
        resolver: zodResolver(reviewSchema),
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            // Limit maksimal 3 foto sesuai setting backend
            if (filesArray.length + selectedPhotos.length > 3) {
                toast.error('Maksimal 3 foto ulasan');
                return;
            }
            setSelectedPhotos(prev => [...prev, ...filesArray]);
        }
    };

    const removePhoto = (index: number) => {
        setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: ReviewForm) => {
        try {
            const payload: CreateReviewPayload = {
                order_item_id: orderItemId,
                rating: data.rating,
                comment: data.comment,
                photos: selectedPhotos
            };

            // Memanggil ReviewService yang sudah kita buat sebelumnya
            const response = await ReviewService.createReview(payload);

            if (response.success) {
                toast.success('Terima kasih atas ulasan Anda!');
                if (onSuccess) onSuccess(); // Refresh data ulasan di halaman ulasan toko
                onClose();
            }
        } catch (err: any) {
            toast.error(err.message || 'Gagal mengirim ulasan');
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md p-8 border border-gray-200 rounded-3xl overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black uppercase tracking-tighter">Beri Ulasan</h2>
                    <button onClick={onClose} className="hover:rotate-90 transition-transform"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* BINTANG RATING */}
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => { setRating(star); setValue('rating', star); }}
                                className={`transition-all transform hover:scale-110 ${rating >= star ? 'text-amber-500' : 'text-gray-200'}`}
                            >
                                <Star size={40} fill={rating >= star ? 'currentColor' : 'none'} strokeWidth={2.5} />
                            </button>
                        ))}
                    </div>
                    {errors.rating && <p className="text-center text-[10px] text-red-600 font-bold uppercase">{errors.rating.message}</p>}

                    {/* TEKS KOMENTAR */}
                    <textarea
                        {...register('comment')}
                        placeholder="Bagaimana kondisi barang & akurasi grading seller?"
                        className="w-full border border-gray-200 p-4 text-sm focus:outline-none focus:border-black min-h-[100px] resize-none rounded-2xl"
                    />
                    {errors.comment && <p className="text-[10px] text-red-600 font-bold uppercase">{errors.comment.message}</p>}

                    {/* UNGGAH FOTO (REVIEW MEDIA) */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tambahkan Foto (Maks 3)</p>
                        <div className="flex flex-wrap gap-2">
                            {selectedPhotos.map((file, index) => (
                                <div key={index} className="relative w-16 h-16 group">
                                    <img 
                                        src={URL.createObjectURL(file)} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover rounded-xl border border-gray-100" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5 shadow-lg"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            
                            {selectedPhotos.length < 3 && (
                                <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-black transition-colors">
                                    <Camera size={20} className="text-gray-400" />
                                    <input type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-black text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-zinc-900 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Kirim Penilaian"}
                    </button>
                </form>
            </div>
        </div>
    );
}
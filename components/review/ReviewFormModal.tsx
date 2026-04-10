'use client';

import { useState } from 'react';
import { CreateReviewPayload } from '@/types/review';

interface ReviewFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderItemId: string;
    productName: string;
    onSubmitReview: (payload: CreateReviewPayload) => Promise<void>;
}

export default function ReviewFormModal({ isOpen, onClose, orderItemId, productName, onSubmitReview }: ReviewFormModalProps) {
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // Batasi maksimal 3 foto/video untuk unboxing
            const filesArray = Array.from(e.target.files).slice(0, 3);
            setMediaFiles(filesArray);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Mohon berikan rating minimal 1 Bintang.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload: CreateReviewPayload = {
                order_item_id: orderItemId,
                rating,
                comment,
                media: mediaFiles.length > 0 ? mediaFiles : undefined
            };

            await onSubmitReview(payload);

            // Reset form jika sukses
            setRating(0);
            setComment('');
            setMediaFiles([]);
            onClose();

        } catch (err: any) {
            setError(err.message || 'Gagal mengirimkan ulasan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 w-full max-w-lg shadow-2xl relative flex flex-col">

                {/* Header Modal */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">Nilai Produk</h2>
                    <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-black">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 font-semibold text-center">
                            {error}
                        </div>
                    )}

                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">Bagaimana kepuasan Anda terhadap barang ini?</p>
                        <h3 className="font-bold text-gray-900 line-clamp-1 mb-4">{productName}</h3>

                        {/* Interactive Star Rating */}
                        <div className="flex justify-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`w-10 h-10 transition-colors ${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                >
                                    <svg fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Text Area Ulasan */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Ceritakan pengalaman Anda (Opsional)</label>
                        <textarea
                            rows={3}
                            placeholder="Apakah grading sesuai dengan aslinya? Apakah packing aman?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                        />
                    </div>

                    {/* Upload Evidensi (Video/Foto) */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Lampirkan Bukti / Foto (Opsional)</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*, video/*"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
                        />
                        <p className="text-xs text-gray-400 mt-2">Maksimal 3 file (Foto/Video unboxing).</p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-4 w-full bg-black text-white px-6 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Mengirim Ulasan...' : 'Kirim Ulasan'}
                    </button>
                </form>
            </div>
        </div>
    );
}
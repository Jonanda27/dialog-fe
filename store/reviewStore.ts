import { create } from 'zustand';
import { Review, CreateReviewPayload, ProductReviewSummary } from '../types/review';
import { ReviewService } from '../services/api/review.service';
import { ApiError } from '../types/api';

interface ReviewState {
    // State
    productReviews: Review[];
    reviewSummary: ProductReviewSummary | null;
    isLoading: boolean;      // Loading untuk GET data
    isSubmitting: boolean;   // Loading khusus untuk mutasi (POST)
    error: string | null;

    // Actions
    fetchProductReviews: (productId: string, params?: Record<string, any>) => Promise<void>;
    submitReview: (payload: CreateReviewPayload) => Promise<Review>;
    clearError: () => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
    productReviews: [],
    reviewSummary: null,
    isLoading: false,
    isSubmitting: false,
    error: null,

    fetchProductReviews: async (productId, params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await ReviewService.getProductReviews(productId, params);
            set({
                productReviews: response.data.reviews,
                reviewSummary: response.data.summary,
                isLoading: false
            });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal memuat daftar ulasan.', isLoading: false });
        }
    },

    submitReview: async (payload) => {
        set({ isSubmitting: true, error: null });
        try {
            const response = await ReviewService.submitReview(payload);
            const newReview = response.data;

            // Jika kebetulan user sedang berada di halaman produk yang sama, 
            // kita lakukan Optimistic Update agar ulasannya langsung muncul
            set((state) => ({
                productReviews: [newReview, ...state.productReviews],
                isSubmitting: false
            }));

            return newReview;
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal mengirim ulasan.', isSubmitting: false });
            throw err; // Lempar error agar Modal Ulasan bisa menampilkannya
        }
    },

    clearError: () => set({ error: null })
}));
import { create } from 'zustand';
import { Review } from '../types/review';
import { ReviewService } from '.././services/api/review.service';

interface ReviewState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProductReviews: (productId: string) => Promise<void>;
  fetchStoreReviews: (storeId: string) => Promise<void>;
  submitReview: (payload: any) => Promise<void>;
}

export const useReviewStore = create<ReviewState>((set) => ({
  reviews: [],
  isLoading: false,
  error: null,

  fetchProductReviews: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ReviewService.getProductReviews(productId);
      // PERBAIKAN: Ambil array-nya dari response.data
      set({ reviews: response.data, isLoading: false }); 
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchStoreReviews: async (storeId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ReviewService.getStoreReviews(storeId);
      // PERBAIKAN: Ambil array-nya dari response.data
      set({ reviews: response.data, isLoading: false }); 
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  submitReview: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await ReviewService.createReview(payload);
      // Opsional: Refresh data atau tampilkan pesan sukses
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  }
}));
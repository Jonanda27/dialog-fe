// File: dialog-fe/store/wishlistStore.ts

import { create } from 'zustand';
import { WishlistItem } from '../types/wishlist';
import { WishlistService } from '../services/api/wishlist.service';
import { ApiError } from '../types/api';

interface WishlistState {
    wishlistItems: WishlistItem[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchWishlist: () => Promise<void>;
    toggleWishlist: (productId: string) => Promise<void>;
    isFavorite: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    wishlistItems: [],
    isLoading: false,
    error: null,

    fetchWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await WishlistService.getMyWishlist();
            set({ wishlistItems: response.data, isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal memuat wishlist', isLoading: false });
        }
    },

    toggleWishlist: async (productId: string) => {
        const { wishlistItems } = get();
        const existingItem = wishlistItems.find(item => item.product_id === productId);

        try {
            if (existingItem) {
                // Jika sudah ada, hapus
                await WishlistService.removeFromWishlist(productId);
                set({ 
                    wishlistItems: wishlistItems.filter(item => item.product_id !== productId) 
                });
            } else {
                // Jika belum ada, tambahkan
                const response = await WishlistService.addToWishlist({ product_id: productId });
                set({ 
                    wishlistItems: [response.data, ...wishlistItems] 
                });
            }
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal memperbarui wishlist' });
            throw err;
        }
    },

    // Helper untuk cek apakah sebuah produk ada di favorit (untuk UI Ikon Hati)
    isFavorite: (productId: string) => {
        return get().wishlistItems.some(item => item.product_id === productId);
    }
}));
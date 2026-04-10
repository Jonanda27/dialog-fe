import { create } from 'zustand';
import { Category, SubCategory } from '../types/category';
import { CategoryService } from '../services/api/category.service';
import { ApiError } from '../types/api';

interface CategoryState {
    // State
    categories: Category[];
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;

    // Actions
    fetchCategories: () => Promise<void>;

    // Helpers (Sangat berguna untuk mencari data spesifik di komponen)
    getCategoryById: (id: string) => Category | undefined;
    getSubCategoryById: (id: string) => SubCategory | undefined;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    isLoading: false,
    error: null,
    isInitialized: false,

    fetchCategories: async () => {
        // Optimasi: Jika data sudah ada, tidak perlu fetch ulang
        if (get().categories.length > 0) return;

        set({ isLoading: true, error: null });
        try {
            const response = await CategoryService.getAllCategories();
            set({
                categories: response.data,
                isLoading: false,
                isInitialized: true
            });
        } catch (error: any) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal mengambil data kategori',
                isLoading: false,
                isInitialized: true
            });
        }
    },

    getCategoryById: (id: string) => {
        return get().categories.find(cat => cat.id === id);
    },

    getSubCategoryById: (id: string) => {
        const categories = get().categories;
        for (const category of categories) {
            const sub = category.subCategories?.find(sub => sub.id === id);
            if (sub) return sub;
        }
        return undefined;
    }
}));
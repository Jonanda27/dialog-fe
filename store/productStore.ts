// File: dialog-fe/store/productStore.ts

import { create } from 'zustand';
import { Product, CreateProductPayload } from '../types/product';
import { ProductService } from '../services/api/product.service';
import { ApiError } from '../types/api';

interface ProductState {
    // State
    products: Product[];
    currentProduct: Product | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchProducts: (filters?: Record<string, string>) => Promise<void>;
    fetchProductById: (id: string) => Promise<void>;
    createProduct: (payload: CreateProductPayload) => Promise<void>;
    clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    currentProduct: null,
    isLoading: false,
    error: null,

    fetchProducts: async (filters) => {
        set({ isLoading: true, error: null });
        try {
            const response = await ProductService.getAll(filters);
            set({
                products: response.data,
                isLoading: false,
            });
        } catch (error: any) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal memuat katalog produk.',
                isLoading: false
            });
        }
    },

    fetchProductById: async (id: string) => {
        set({ isLoading: true, error: null, currentProduct: null });
        try {
            const response = await ProductService.getById(id);
            set({
                currentProduct: response.data,
                isLoading: false,
            });
        } catch (error: any) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal memuat detail produk.',
                isLoading: false
            });
        }
    },

    createProduct: async (payload: CreateProductPayload) => {
        set({ isLoading: true, error: null });
        try {
            // 1. Kirim payload mentah ke API Service (Service akan mengubahnya jadi FormData)
            const response = await ProductService.create(payload);
            const newProduct = response.data;

            // 2. Optimistic UI Update: Tambahkan produk baru ke awal daftar produk di memori
            const currentProducts = get().products;
            set({
                products: [newProduct, ...currentProducts],
                isLoading: false,
            });
        } catch (error: any) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal menambahkan produk.',
                isLoading: false
            });
            // Lempar error ke komponen UI agar bisa menangkap validation error (400)
            // dan menampilkannya di form (misal: "Stok harus berupa angka")
            throw apiErr;
        }
    },

    clearError: () => set({ error: null }),
}));
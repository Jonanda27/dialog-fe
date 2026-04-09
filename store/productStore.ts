// File: dialog-fe/store/productStore.ts

import { create } from 'zustand';
import { Product, CreateProductPayload, BulkCreateProductPayload, UpdateProductPayload } from '../types/product';
import { ProductService } from '../services/api/product.service';
import { ApiError } from '../types/api';

interface ProductState {
    // State
    products: Product[];
    myProducts: Product[]; 
    currentProduct: Product | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchProducts: (filters?: Record<string, string>) => Promise<void>;
    fetchMyProducts: (filters?: Record<string, string>) => Promise<void>;
    fetchProductById: (id: string) => Promise<void>;
    createProduct: (payload: CreateProductPayload) => Promise<void>;
    updateProduct: (id: string, payload: UpdateProductPayload) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    bulkCreateProducts: (payload: BulkCreateProductPayload[]) => Promise<void>;
    clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    myProducts: [],
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
        } catch (error: unknown) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal memuat katalog produk.',
                isLoading: false
            });
        }
    },

    fetchMyProducts: async (filters) => {
        set({ isLoading: true, error: null });
        try {
            const response = await ProductService.getMyProducts(filters);
            set({
                myProducts: response.data,
                isLoading: false,
            });
        } catch (error: unknown) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal memuat daftar produk toko Anda.',
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
        } catch (error: unknown) {
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
            const currentMyProducts = get().myProducts;
            
            set({
                products: [newProduct, ...currentProducts],
                myProducts: [newProduct, ...currentMyProducts],
                isLoading: false,
            });
        } catch (error: unknown) {
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

    updateProduct: async (id: string, payload: UpdateProductPayload) => {
        set({ isLoading: true, error: null });
        try {
            const response = await ProductService.update(id, payload);
            const updatedProduct = response.data;

            set((state) => ({
                products: state.products.map(p => p.id === id ? updatedProduct : p),
                myProducts: state.myProducts.map(p => p.id === id ? updatedProduct : p),
                currentProduct: state.currentProduct?.id === id ? updatedProduct : state.currentProduct,
                isLoading: false,
            }));
        } catch (error: unknown) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal memperbarui produk.',
                isLoading: false
            });
            throw apiErr;
        }
    },

    deleteProduct: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await ProductService.delete(id);

            set((state) => ({
                products: state.products.filter(p => p.id !== id),
                myProducts: state.myProducts.filter(p => p.id !== id),
                currentProduct: state.currentProduct?.id === id ? null : state.currentProduct,
                isLoading: false,
            }));
        } catch (error: unknown) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal menghapus produk.',
                isLoading: false
            });
            throw apiErr;
        }
    },

    bulkCreateProducts: async (payload: BulkCreateProductPayload[]) => {
        set({ isLoading: true, error: null });
        try {
            const response = await ProductService.bulkCreate(payload);
            const newProducts = response.data;

            set((state) => ({
                myProducts: [...newProducts, ...state.myProducts],
                isLoading: false,
            }));
        } catch (error: unknown) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal melakukan impor produk massal.',
                isLoading: false
            });
            throw apiErr;
        }
    },

    clearError: () => set({ error: null }),
}));
import { create } from 'zustand';
import { Product, CreateProductPayload } from '../types/product';
import { ProductService } from '../services/api/product.service';
import { ApiError } from '../types/api';

interface ProductState {
    // State
    products: Product[];
    currentProduct: Product | null;
    isLoading: boolean;      // Loading untuk fetch (GET) data
    isSubmitting: boolean;   // Loading khusus untuk mutasi (POST/PATCH) agar UI tidak berkedip
    error: string | null;

    // Actions
    fetchProducts: (filters?: Record<string, string>) => Promise<void>;
    fetchProductById: (id: string) => Promise<void>;
    createProduct: (payload: CreateProductPayload) => Promise<Product>;
    updateProduct: (id: string, payload: Partial<CreateProductPayload>) => Promise<Product>;
    clearError: () => void;
    clearCurrentProduct: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    currentProduct: null,
    isLoading: false,
    isSubmitting: false,
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
        set({ isSubmitting: true, error: null });
        try {
            // 1. Kirim payload mentah ke API Service (Service akan mengubahnya jadi FormData dan men-stringify metadata JSON)
            const response = await ProductService.create(payload);
            const newProduct = response.data;

            // 2. Optimistic UI Update: Tambahkan produk baru ke awal daftar produk di memori tanpa perlu fetch ulang
            const currentProducts = get().products;
            set({
                products: [newProduct, ...currentProducts],
                isSubmitting: false,
            });

            return newProduct;
        } catch (error: any) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal menambahkan produk.',
                isSubmitting: false
            });
            // Lempar error ke komponen UI agar bisa menangkap validation error (400)
            // dan menampilkannya di form (misal: "Stok harus berupa angka")
            throw apiErr;
        }
    },

    updateProduct: async (id: string, payload: Partial<CreateProductPayload>) => {
        set({ isSubmitting: true, error: null });
        try {
            const response = await ProductService.update(id, payload);
            const updatedProduct = response.data;

            // Optimistic UI Update: Perbarui list dan detail product jika sesuai
            set((state) => ({
                products: state.products.map(p => p.id === id ? updatedProduct : p),
                currentProduct: state.currentProduct?.id === id ? updatedProduct : state.currentProduct,
                isSubmitting: false
            }));

            return updatedProduct;
        } catch (error: any) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal memperbarui produk.',
                isSubmitting: false
            });
            throw apiErr;
        }
    },

    clearError: () => set({ error: null }),
    clearCurrentProduct: () => set({ currentProduct: null })
}));
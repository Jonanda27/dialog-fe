import { create } from 'zustand';
import { Product, CreateProductPayload, BulkCreateProductPayload } from '../types/product';
import { productService } from '../services/api/product.service';
import { ApiError } from '../types/api';

interface ProductState {
    // State
    products: Product[];
    myProducts: Product[];
    adminProducts: Product[];
    currentProduct: Product | null;
    isLoading: boolean;      // Loading untuk fetch (GET) data
    isSubmitting: boolean;   // Loading khusus untuk mutasi (POST/PATCH/DELETE) agar UI tidak berkedip
    error: string | null;

    // Actions
    setInitialProducts: (products: Product[]) => void; // <-- BARU: Untuk Next.js Server-to-Client Handoff
    fetchProducts: (filters?: Record<string, any>) => Promise<void>;
    fetchMyProducts: (filters?: Record<string, any>) => Promise<void>;
    fetchAllProductsAdmin: (filters?: Record<string, any>) => Promise<void>;
    fetchProductById: (id: string) => Promise<void>;
    createProduct: (payload: CreateProductPayload) => Promise<Product>;
    updateProduct: (id: string, payload: Partial<CreateProductPayload>) => Promise<Product>;
    deleteProduct: (id: string) => Promise<void>;
    bulkCreateProducts: (payload: BulkCreateProductPayload[]) => Promise<void>;
    clearError: () => void;
    clearCurrentProduct: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    myProducts: [],
    adminProducts: [],
    currentProduct: null,
    isLoading: false,
    isSubmitting: false,
    error: null,

    // Fungsi untuk menyuntikkan data dari Server Component (SEO Friendly)
    setInitialProducts: (products) => {
        set({ products, error: null });
    },

    fetchProducts: async (filters) => {
        set({ isLoading: true, error: null });
        try {
            const response = await productService.getAll(filters);
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
            const response = await productService.getMyProducts(filters);
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
            const response = await productService.getById(id);
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
        set({ isSubmitting: true, error: null });
        try {
            const response = await productService.create(payload);
            const newProduct = response.data;

            // Optimistic UI: Tambahkan ke products & myProducts
            const currentProducts = get().products;
            const currentMyProducts = get().myProducts;

            set({
                products: [newProduct, ...currentProducts],
                myProducts: [newProduct, ...currentMyProducts],
                isSubmitting: false,
            });

            return newProduct;
        } catch (error: unknown) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal menambahkan produk.',
                isSubmitting: false
            });
            throw apiErr;
        }
    },

    updateProduct: async (id: string, payload: Partial<CreateProductPayload>) => {
        set({ isSubmitting: true, error: null });
        try {
            const response = await productService.update(id, payload);
            const updatedProduct = response.data;

            set((state) => ({
                products: state.products.map(p => p.id === id ? updatedProduct : p),
                myProducts: state.myProducts.map(p => p.id === id ? updatedProduct : p),
                currentProduct: state.currentProduct?.id === id ? updatedProduct : state.currentProduct,
                isSubmitting: false,
            }));

            return updatedProduct;
        } catch (error: unknown) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal memperbarui produk.',
                isSubmitting: false
            });
            throw apiErr;
        }
    },

    deleteProduct: async (id: string) => {
        set({ isSubmitting: true, error: null });
        try {
            await productService.delete(id);

            set((state) => ({
                products: state.products.filter(p => p.id !== id),
                myProducts: state.myProducts.filter(p => p.id !== id),
                currentProduct: state.currentProduct?.id === id ? null : state.currentProduct,
                isSubmitting: false,
            }));
        } catch (error: unknown) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal menghapus produk.',
                isSubmitting: false
            });
            throw apiErr;
        }
    },

    bulkCreateProducts: async (payload: BulkCreateProductPayload[]) => {
        set({ isSubmitting: true, error: null });
        try {
            const response = await productService.bulkCreate(payload);
            const newProducts = response.data;

            set((state) => ({
                myProducts: [...newProducts, ...state.myProducts],
                isSubmitting: false,
            }));
        } catch (error: unknown) {
            const apiErr = error as ApiError;
            set({
                error: apiErr.message || 'Gagal melakukan impor produk massal.',
                isSubmitting: false
            });
            throw apiErr;
        }
    },

    fetchAllProductsAdmin: async (filters) => {
        set({ isLoading: true, error: null });
        try {
            const response = await ProductService.getAllAdmin(filters);
            set({
                adminProducts: response.data,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.message || 'Gagal memuat katalog admin.',
                isLoading: false
            });
        }
    },

    clearError: () => set({ error: null }),
    clearCurrentProduct: () => set({ currentProduct: null })
}));
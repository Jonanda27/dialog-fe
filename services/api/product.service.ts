import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import { Product, CreateProductPayload, BulkCreateProductPayload } from '../../types/product';

export const ProductService = {
    /**
     * Mengambil daftar semua produk di katalog dengan opsi filter dinamis (JSONB & Standar).
     * @param params Parameter query string (opsional, misal: ?sub_category_id=123-abc&media_grading=NM)
     */
    getAll: async (params?: Record<string, any>): Promise<ApiResponse<Product[]>> => {
        return await axiosClient.get<any, ApiResponse<Product[]>>('/products', { params });
    },

    /**
     * Mengambil detail satu produk beserta informasi toko dan fotonya.
     * @param id ID Produk
     */
    getById: async (id: string): Promise<ApiResponse<Product>> => {
        return await axiosClient.get<any, ApiResponse<Product>>(`/products/${id}`);
    },

    /**
     * Menambahkan produk baru ke etalase toko.
     * Menggunakan arsitektur JSONB Metadata.
     */
    create: async (payload: CreateProductPayload): Promise<ApiResponse<Product>> => {
        const formData = new FormData();

        // 1. Core Data (stringified for multipart) [cite: 1747, 1748]
        formData.append('name', payload.name);
        formData.append('price', String(payload.price));
        formData.append('stock', String(payload.stock));
        formData.append('sub_category_id', payload.sub_category_id);

        // 2. Append Metadata Dinamis (Diubah jadi string untuk dikirim via form-data)
        if (payload.metadata) {
            formData.append('metadata', JSON.stringify(payload.metadata));
        }

        // 3. Specific File Keys [cite: 1750, 1751]
        const { photos } = payload;
        const fileKeys: (keyof typeof photos)[] = ['front', 'back', 'physical', 'extra1', 'extra2'];

        fileKeys.forEach((key) => {
            if (photos[key]) {
                formData.append('photos', photos[key] as File);
            }
        });

        // 4. Eksekusi Request
        return await axiosClient.post<any, ApiResponse<Product>>('/products', formData);
    },


    /**
     * Memperbarui produk yang sudah ada (Parsial)
     * Menggunakan arsitektur JSONB Metadata.
     */
    update: async (id: string, payload: Partial<CreateProductPayload>): Promise<ApiResponse<Product>> => {
        const formData = new FormData();

        if (payload.name) formData.append('name', payload.name);
        if (payload.price) formData.append('price', String(payload.price));
        if (payload.stock) formData.append('stock', String(payload.stock));
        if (payload.sub_category_id) formData.append('sub_category_id', payload.sub_category_id);

        if (payload.metadata) {
            formData.append('metadata', JSON.stringify(payload.metadata));
        }

        // Handle update foto jika ada
        if (payload.photos) {
            const { photos } = payload;
            const fileKeys: (keyof typeof photos)[] = ['front', 'back', 'physical', 'extra1', 'extra2'];

            fileKeys.forEach((key) => {
                if (photos[key]) {
                    formData.append('photos', photos[key] as File);
                }
            });
        }

        return await axiosClient.patch<any, ApiResponse<Product>>(`/products/${id}`, formData);
    },

    /**
     * Menghapus produk
     */
    delete: async (id: string): Promise<ApiResponse<null>> => {
        return await axiosClient.delete<any, ApiResponse<null>>(`/products/${id}`);
    },

    /**
     * Mengambil daftar produk spesifik milik seller yang sedang login
     */
    getMyProducts: async (params?: Record<string, any>): Promise<ApiResponse<Product[]>> => {
        return await axiosClient.get<any, ApiResponse<Product[]>>('/products/my-products', { params });
    },

    /**
     * Import produk massal (Kirim array JSON)
     */
    bulkCreate: async (payload: BulkCreateProductPayload[]): Promise<ApiResponse<Product[]>> => {
        return await axiosClient.post<any, ApiResponse<Product[]>>('/products/bulk', payload);
    }
};
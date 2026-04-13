// File: dialog-fe/services/api/product.service.ts

import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
// Hapus UpdateProductPayload dari import, kita gunakan Partial<CreateProductPayload> yang lebih aman dengan skema baru
import { Product, CreateProductPayload, BulkCreateProductPayload } from '../../types/product';

export const ProductService = {
    /**
     * Mengambil daftar semua produk di katalog dengan opsi filter.
     * @param params Parameter query string (opsional, misal: ?sub_category_id=123-abc)
     */
    getAll: async (params?: Record<string, string>): Promise<ApiResponse<Product[]>> => {
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

        // 1. Core Data
        formData.append('name', payload.name);
        formData.append('price', String(payload.price));
        formData.append('stock', String(payload.stock));
        formData.append('sub_category_id', payload.sub_category_id);

        // 2. Metadata (wajib JSON.stringify)
        if (payload.metadata) {
            formData.append('metadata', JSON.stringify(payload.metadata));
        }

        // 3. Specific File Keys -> PERBAIKAN DI SINI
        // Semua foto HARUS di-append menggunakan key "photos" agar dibaca sebagai array oleh backend
        const { photos } = payload;
        if (photos.front) formData.append('photos', photos.front);
        if (photos.back) formData.append('photos', photos.back);
        if (photos.physical) formData.append('photos', photos.physical);
        if (photos.extra1) formData.append('photos', photos.extra1);
        if (photos.extra2) formData.append('photos', photos.extra2);

        return await axiosClient.post<any, ApiResponse<Product>>('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
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
     * (Fitur dari kawan Anda)
     */
    delete: async (id: string): Promise<ApiResponse<null>> => {
        return await axiosClient.delete<any, ApiResponse<null>>(`/products/${id}`);
    },

    /**
     * Mengambil daftar produk spesifik milik seller yang sedang login
     * (Fitur dari kawan Anda)
     */
    getMyProducts: async (params?: Record<string, string>): Promise<ApiResponse<Product[]>> => {
        return await axiosClient.get<any, ApiResponse<Product[]>>('/products/my-products', { params });
    },

    /**
     * Import produk massal (Kirim array JSON)
     * (Fitur dari kawan Anda)
     */
    bulkCreate: async (payload: BulkCreateProductPayload[]): Promise<ApiResponse<Product[]>> => {
        return await axiosClient.post<any, ApiResponse<Product[]>>('/products/bulk', payload);
    }
};
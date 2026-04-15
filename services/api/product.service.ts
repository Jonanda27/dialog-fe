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

    formData.append('name', payload.name);
    formData.append('price', String(payload.price));
    formData.append('stock', String(payload.stock));
    formData.append('sub_category_id', payload.sub_category_id);

    if (payload.metadata) {
        formData.append('metadata', JSON.stringify(payload.metadata));
    }

    // URUTAN PENTING: Front dulu agar jadi is_primary di backend
    const photos = payload.photos;
    if (photos.front) formData.append('photos', photos.front);
    if (photos.back) formData.append('photos', photos.back);
    if (photos.physical) formData.append('photos', photos.physical);
    if (photos.extra1) formData.append('photos', photos.extra1);
    if (photos.extra2) formData.append('photos', photos.extra2);

    return await axiosClient.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
},

    /**
     * Memperbarui produk yang sudah ada (Parsial)
     * Menggunakan arsitektur JSONB Metadata.
     * Note: Menggunakan PUT sesuai dengan route Backend.
     */
    update: async (id: string, payload: any): Promise<ApiResponse<Product>> => {
    const formData = new FormData();

    // 1. Append data dasar
    if (payload.name) formData.append('name', payload.name);
    if (payload.price) formData.append('price', String(payload.price));
    if (payload.stock) formData.append('stock', String(payload.stock));
    if (payload.sub_category_id) formData.append('sub_category_id', payload.sub_category_id);

    // 2. Append Metadata
    if (payload.metadata) {
        formData.append('metadata', JSON.stringify(payload.metadata));
    }

    // 3. Append Photos (PENTING: Gunakan key 'photos' agar match dengan Multer array)
    if (payload.photos) {
        const { front, back, physical } = payload.photos;
        
        // Masukkan ke array sesuai urutan prioritas (front = index 0 = is_primary)
        if (front instanceof File) formData.append('photos', front);
        if (back instanceof File) formData.append('photos', back);
        if (physical instanceof File) formData.append('photos', physical);
    }

    return await axiosClient.put<any, ApiResponse<Product>>(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
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
    },

    /**
     * [ADMIN] Mengambil seluruh produk dari semua penjual.
     */
    getAllAdmin: async (params?: Record<string, any>): Promise<ApiResponse<Product[]>> => {
        return await axiosClient.get<any, ApiResponse<Product[]>>('/products/admin/all', { params });
    },
};
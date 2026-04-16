import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import { Product, CreateProductPayload, BulkCreateProductPayload } from '../../types/product';

export const productService = {
    /**
     * Mengambil daftar semua produk di katalog dengan opsi filter dinamis (JSONB & Standar).
     * @param params Parameter query string (opsional, misal: ?sub_category_id=123-abc&media_grading=NM)
     */
    getAll: async (params?: Record<string, any>): Promise<ApiResponse<Product[]>> => {
        return await axiosClient.get<any, ApiResponse<Product[]>>('/v1/products', { params });
    },

    /**
     * Mengambil detail satu produk beserta informasi toko dan fotonya.
     * @param id ID Produk
     */
    getById: async (id: string): Promise<ApiResponse<Product>> => {
        return await axiosClient.get<any, ApiResponse<Product>>(`/v1/products/${id}`);
    },

    /**
     * Menambahkan produk baru ke etalase toko.
     * Menggunakan arsitektur JSONB Metadata dan Atribut Fisik Absolut.
     */
    create: async (payload: CreateProductPayload): Promise<ApiResponse<Product>> => {
        const formData = new FormData();

        // 1. Data Dasar
        formData.append('name', payload.name);
        formData.append('price', String(payload.price));
        formData.append('stock', String(payload.stock));
        formData.append('sub_category_id', payload.sub_category_id);

        // 2. --- ATRIBUT FISIK & LOGISTIK (MANDATORY) ---
        // Disuntikkan secara eksplisit sebagai string untuk diparsing Zod di Backend.
        // Tanpa ini, kalkulasi volumetrik Biteship akan gagal 100%.
        formData.append('product_weight', String(payload.product_weight));
        formData.append('product_length', String(payload.product_length));
        formData.append('product_width', String(payload.product_width));
        formData.append('product_height', String(payload.product_height));

        // 3. Metadata Dinamis
        if (payload.metadata) {
            formData.append('metadata', JSON.stringify(payload.metadata));
        }

        // 4. Foto Produk (URUTAN PENTING: Front dulu agar jadi is_primary di backend)
        const photos = payload.photos;
        if (photos.front) formData.append('photos', photos.front);
        if (photos.back) formData.append('photos', photos.back);
        if (photos.physical) formData.append('photos', photos.physical);
        if (photos.extra1) formData.append('photos', photos.extra1);
        if (photos.extra2) formData.append('photos', photos.extra2);

        return await axiosClient.post('/v1/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    /**
     * Memperbarui produk yang sudah ada (Parsial)
     * Menggunakan PUT sesuai dengan route Backend.
     */
    update: async (id: string, payload: Partial<CreateProductPayload>): Promise<ApiResponse<Product>> => {
        const formData = new FormData();

        // 1. Append data dasar (Opsional karena update parsial)
        if (payload.name) formData.append('name', payload.name);
        if (payload.price !== undefined) formData.append('price', String(payload.price));
        if (payload.stock !== undefined) formData.append('stock', String(payload.stock));
        if (payload.sub_category_id) formData.append('sub_category_id', payload.sub_category_id);

        // 2. --- ATRIBUT FISIK & LOGISTIK (UPDATE PARSIAL) ---
        if (payload.product_weight !== undefined) formData.append('product_weight', String(payload.product_weight));
        if (payload.product_length !== undefined) formData.append('product_length', String(payload.product_length));
        if (payload.product_width !== undefined) formData.append('product_width', String(payload.product_width));
        if (payload.product_height !== undefined) formData.append('product_height', String(payload.product_height));

        // 3. Append Metadata
        if (payload.metadata) {
            formData.append('metadata', JSON.stringify(payload.metadata));
        }

        // 4. Append Photos (Gunakan key 'photos' agar match dengan Multer array)
        if (payload.photos) {
            const { front, back, physical } = payload.photos;

            // Masukkan ke array sesuai urutan prioritas (front = index 0 = is_primary)
            if (front instanceof File) formData.append('photos', front);
            if (back instanceof File) formData.append('photos', back);
            if (physical instanceof File) formData.append('photos', physical);
        }

        return await axiosClient.put<any, ApiResponse<Product>>(`/v1/products/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    /**
     * Menghapus produk
     */
    delete: async (id: string): Promise<ApiResponse<null>> => {
        return await axiosClient.delete<any, ApiResponse<null>>(`/v1/products/${id}`);
    },

    /**
     * Mengambil daftar produk spesifik milik seller yang sedang login
     */
    getMyProducts: async (params?: Record<string, any>): Promise<ApiResponse<Product[]>> => {
        return await axiosClient.get<any, ApiResponse<Product[]>>('/v1/products/my-products', { params });
    },

    /**
     * Import produk massal (Kirim array JSON)
     */
    bulkCreate: async (payload: BulkCreateProductPayload[]): Promise<ApiResponse<Product[]>> => {
        return await axiosClient.post<any, ApiResponse<Product[]>>('/v1/products/bulk', payload);
      },

    // Pastikan fungsi ini ada di productService untuk dipanggil Zustand
    syncProducts: async (productIds: string[]): Promise<any> => {
        return await axiosClient.post('/v1/products/sync', { product_ids: productIds });
    },

     /**
     * [ADMIN] Mengambil seluruh produk dari semua penjual.
     */
    getAllAdmin: async (params?: Record<string, any>): Promise<ApiResponse<Product[]>> => {
        return await axiosClient.get<any, ApiResponse<Product[]>>('/v1/products/admin/all', { params });
    },
};
// File: dialog-fe/services/api/product.service.ts

import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import { Product, CreateProductPayload, UpdateProductPayload, BulkCreateProductPayload } from '../../types/product';

export const ProductService = {
    /**
     * Mengambil daftar semua produk di katalog dengan opsi filter.
     * @param params Parameter query string (opsional, misal: ?format=Vinyl)
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
     * Fungsi ini secara otomatis mengonversi payload menjadi FormData.
     * @param payload Objek data teks dan file foto
     */
   create: async (payload: CreateProductPayload): Promise<ApiResponse<Product>> => {
        const formData = new FormData();
        
        const textFields = [
            'name', 'artist', 'release_year', 'format',
            'label', 'catalog_number', 'grading', 'price',
            'stock', 'condition_notes'
        ] as const;

        // 1. Masukkan semua data teks
        textFields.forEach((field) => {
            const value = payload[field];
            if (value !== undefined && value !== null && value !== '') {
                formData.append(field, String(value));
            }
        });

        // 2. Masukkan semua file (Nama Key 'photos' HARUS sama dengan backend)
        const { photos } = payload;
        const fileKeys: (keyof typeof photos)[] = ['front', 'back', 'physical', 'extra1', 'extra2'];

        fileKeys.forEach((key) => {
            if (photos[key]) {
                // Backend Multer mencari req.files dengan field name 'photos'
                formData.append('photos', photos[key] as File);
            }
        });

        // 3. Eksekusi Request dengan memaksa header multipart
        return await axiosClient.post<any, ApiResponse<Product>>('/products', formData, {
            headers: {
                // Penting agar Axios tidak salah menerjemahkannya sebagai JSON
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    /**
     * Memperbarui produk (Update) - Menggunakan FormData
     */
    update: async (id: string, payload: UpdateProductPayload): Promise<ApiResponse<Product>> => {
        const formData = new FormData();
        
        const textFields = [
            'name', 'artist', 'release_year', 'format',
            'label', 'catalog_number', 'grading', 'price',
            'stock', 'condition_notes'
        ] as const;

        textFields.forEach((field) => {
            const value = payload[field as keyof Omit<UpdateProductPayload, 'photos'>];
            if (value !== undefined && value !== null && value !== '') {
                formData.append(field, String(value));
            }
        });

        if (payload.photos) {
            const { photos } = payload;
            const fileKeys: (keyof typeof photos)[] = ['front', 'back', 'physical'];
            
            fileKeys.forEach((key) => {
                if (photos[key]) {
                    formData.append('photos', photos[key] as File);
                }
            });
        }

        // PERBAIKAN: Memaksa Axios menggunakan multipart header saat melakukan PUT
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
    getMyProducts: async (params?: Record<string, string>): Promise<ApiResponse<Product[]>> => {
        return await axiosClient.get<any, ApiResponse<Product[]>>('/products/my-products', { params });
    },

    /**
     * Import produk massal (Kirim array JSON)
     */
    bulkCreate: async (payload: BulkCreateProductPayload[]): Promise<ApiResponse<Product[]>> => {
        return await axiosClient.post<any, ApiResponse<Product[]>>('/products/bulk', payload);
    }
};
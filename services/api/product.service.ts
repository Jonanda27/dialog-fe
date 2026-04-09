// File: dialog-fe/services/api/product.service.ts

import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import { Product, CreateProductPayload } from '../../types/product';

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
        // 1. Inisialisasi FormData API
        const formData = new FormData();

        // 2. Append Data Teks (Konversi angka ke string karena FormData hanya menerima string/Blob)
        const textFields = [
            'name', 'artist', 'release_year', 'format',
            'label', 'catalog_number', 'grading', 'price',
            'stock', 'condition_notes'
        ] as const;

        textFields.forEach((field) => {
            const value = payload[field];
            if (value !== undefined && value !== null && value !== '') {
                formData.append(field, String(value));
            }
        });

        // 3. Append Data File (Sesuai dengan multer .array('photos') di Backend)
        const { photos } = payload;
        const fileKeys: (keyof typeof photos)[] = ['front', 'back', 'physical', 'extra1', 'extra2'];

        fileKeys.forEach((key) => {
            if (photos[key]) {
                // Melampirkan file dengan key yang konsisten yaitu 'photos' untuk diproses Multer array
                formData.append('photos', photos[key] as File);
            }
        });

        // 4. Eksekusi HTTP Request
        // PENTING: axiosClient akan mendeteksi objek FormData dan otomatis menghapus Content-Type application/json,
        // lalu membiarkan browser menyetel boundary multipart/form-data.
        return await axiosClient.post<any, ApiResponse<Product>>('/products', formData);
    }
};
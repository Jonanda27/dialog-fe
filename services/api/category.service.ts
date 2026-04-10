import axiosClient from './axiosClient';
import { Category } from '../../types/category';

/**
 * Interface standar untuk balasan API Anda.
 * Sesuaikan jika format response backend Anda berbeda (misal: data.data)
 */
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const CategoryService = {
    /**
     * Mengambil seluruh hierarki Kategori beserta Sub-Kategorinya.
     * Endpoint Backend: GET /api/categories
     */
    getAllCategories: async (): Promise<ApiResponse<Category[]>> => {
        const response = await axiosClient.get('/categories');
        return response.data;
    },

    /**
     * (Opsional) Mengambil detail 1 kategori spesifik berdasarkan slug.
     * Endpoint Backend: GET /api/categories/:slug
     */
    getCategoryBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
        const response = await axiosClient.get(`/categories/${slug}`);
        return response.data;
    }
};
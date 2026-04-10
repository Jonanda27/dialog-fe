import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import { Product, CreateProductPayload } from '../../types/product';

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
     * Fungsi ini secara otomatis mengonversi payload menjadi FormData dan melakukan stringify pada JSONB metadata.
     * @param payload Objek data teks, metadata dinamis, dan file foto
     */
    create: async (payload: CreateProductPayload): Promise<ApiResponse<Product>> => {
        // 1. Inisialisasi FormData API
        const formData = new FormData();

        // 2. Append Data Utama (Tabel Products)
        formData.append('name', payload.name);
        formData.append('price', String(payload.price));
        formData.append('stock', String(payload.stock));
        formData.append('sub_category_id', payload.sub_category_id);

        // 3. ⚡ GAME CHANGER: Append Metadata Dinamis ⚡
        // FormData hanya menerima string atau Blob. Oleh karena itu, object metadata 
        // harus diubah menjadi string. Zod di backend akan otomatis mem-parse ini.
        if (payload.metadata) {
            formData.append('metadata', JSON.stringify(payload.metadata));
        }

        // 4. Append Data File (Sesuai dengan multer .array('photos') di Backend)
        const { photos } = payload;
        const fileKeys: (keyof typeof photos)[] = ['front', 'back', 'physical', 'extra1', 'extra2'];

        fileKeys.forEach((key) => {
            if (photos[key]) {
                // Melampirkan file dengan key yang konsisten yaitu 'photos' 
                // agar ditangkap oleh Multer array di backend
                formData.append('photos', photos[key] as File);
            }
        });

        // 5. Eksekusi HTTP Request
        // axiosClient akan mendeteksi FormData dan otomatis mengatur Content-Type multipart/form-data
        return await axiosClient.post<any, ApiResponse<Product>>('/products', formData);
    },

    /**
     * Memperbarui produk yang sudah ada (Parsial)
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
    }
};
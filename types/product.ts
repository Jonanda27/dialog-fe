import { Store } from './store'; // Pastikan path import sesuai dengan project Anda
import { SubCategory } from './category';

/**
 * Tipe Status Produk (sekarang disimpan di dalam metadata)
 */
export type ProductStatus = 'active' | 'inactive' | 'draft' | 'sold';

/**
 * Representasi struktur kolom JSONB 'metadata' dari Backend.
 * Semua field dibuat opsional (?) karena isinya bergantung pada Kategori produk.
 * Kawan Frontend Anda bisa menggunakan interface ini untuk auto-complete.
 */
export interface ProductMetadata {
    // Atribut Umum (Berlaku untuk semua)
    description?: string;
    status: ProductStatus;

    // Atribut Khusus: Audio (Vinyl, Kaset, CD)
    artist?: string;
    release_year?: number | string;
    record_label?: string;
    media_grading?: string;  // cth: 'NM', 'VG+'
    sleeve_grading?: string; // cth: 'VG', 'Mint'
    matrix_number?: string;

    // Atribut Khusus: Audio Gear
    brand?: string;
    physical_condition?: string; // cth: 'Mulus 90%'
    functional_status?: string;  // cth: 'Normal Total'
    voltage?: string;            // cth: '110V', '220V'
    completeness?: string;       // cth: 'Unit Only', 'Fullset'

    // Atribut Khusus: Printing & Media (Buku, Poster)
    dimensions?: string;
    language?: string;
    page_count?: number | string;
    authenticity?: string;       // cth: 'Original', 'Repro'

    // Atribut Khusus: Merch (Apparel)
    size?: string;               // cth: 'S', 'M', 'L', 'XL'
    brand_tag?: string;          // cth: 'Brockum', 'Giant'
    certificate_of_authenticity?: string; // cth: 'Ada', 'Tidak Ada'

    // ⚡ SUPER KRUSIAL UNTUK ARSITEKTUR JSONB ⚡
    // Mengizinkan field arbitrary (bebas) agar TypeScript tidak error 
    // jika backend mengirimkan key metadata baru di masa depan.
    [key: string]: any;
}

/**
 * Representasi tabel ProductMedia di Database
 */
export interface ProductMedia {
    id: string;
    product_id: string;
    media_url: string;
    file_type: string;
    is_primary: boolean;
    created_at: string;
}

/**
 * Representasi tabel Products di Database (Entitas Utama)
 * Menggunakan arsitektur relasional baru (sub_category_id) dan JSONB (metadata)
 */
export interface Product {
    id: string;
    store_id: string;
    sub_category_id: string;
    name: string;
    slug: string;
    price: string | number;
    stock: number;
    metadata: ProductMetadata; // <--- Game Changer
    created_at: string;
    updated_at: string;

    // Relasi (Eager Loading)
    media?: ProductMedia[];
    store?: Store;
    subCategory?: SubCategory; // <--- Relasi Kategori Baru
}

/**
 * Payload spesifik untuk State Form React (Saat Penjual Tambah Produk).
 * Kawan Frontend akan menyimpan input di sini sebelum dikirim ke API sebagai FormData.
 */
export interface CreateProductPayload {
    // Data Tabel Utama
    name: string;
    price: string | number;
    stock: string | number;
    sub_category_id: string; // Menggantikan 'format'

    // Data JSONB (Ditampung di satu objek agar mudah di-JSON.stringify saat submit)
    metadata: Partial<ProductMetadata>;

    // Data File (Disimpan terpisah di state React sebelum di-append ke FormData)
    photos: {
        front: File | null;
        back: File | null;
        physical: File | null;
        extra1?: File | null;
        extra2?: File | null;
    };
}

/**
 * Payload untuk Edit Produk. 
 * Mirip dengan Create, tapi field bisa opsional dan backend membatasi maksimal 3 foto untuk update.
 */
export interface UpdateProductPayload extends Partial<Omit<CreateProductPayload, 'photos'>> {
    photos?: {
        front?: File | null;
        back?: File | null;
        physical?: File | null;
    };
}

/**
 * Payload untuk Bulk Create.
 * Backend mengekspektasikan array of object JSON (bukan FormData).
 * Diperbarui agar sesuai dengan skema JSONB.
 */
export interface BulkCreateProductPayload {
    name: string;
    price: number | string;
    stock: number | string;
    sub_category_id: string; // Kawan Anda harus memetakan kategori CSV ke ID ini
    metadata: Partial<ProductMetadata>; // Seluruh kolom dinamis dari CSV masuk ke sini
}
// File: dialog-fe/types/product.ts

import { Store } from './store'; // Asumsi store.ts akan dibuat nanti

/**
 * Tipe Enum / Literal berdasarkan validasi Zod dan Form Tambah Produk
 */
export type ProductFormat = 'Vinyl' | 'Cassette' | 'CD' | 'Gear';
export type ProductGrading = 'Mint' | 'NM' | 'VG+' | 'VG' | 'Good' | 'Fair';
export type ProductCondition = 'new' | 'used';

/**
 * Representasi tabel ProductMedia di Database
 */
export interface ProductMedia {
    id: string;
    product_id: string;
    media_url: string; // Misal: "/uploads/products/file.png"
    file_type: string;
    is_primary: boolean;
    created_at: string;
}

/**
 * Representasi tabel Products di Database (Entitas Utama)
 */
export interface Product {
    image_url: string;
    id: string;
    store_id: string;
    name: string;
    artist: string;
    release_year: number;
    format: ProductFormat;
    label?: string | null;
    catalog_number?: string | null;
    grading: ProductGrading;
    price: string | number; // String karena desimal dari DB (Decimal/Numeric) sering di-parse sebagai string
    stock: number;
    condition: ProductCondition;
    condition_notes?: string | null;
    category_id?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;

    // Relasi (Eager Loading)
    media?: ProductMedia[];
    store?: Store; // Membutuhkan import tipe Store
}

/**
 * Payload spesifik untuk State Form React (Sebelum diubah jadi FormData)
 * Semua properti mandatory ditandai, dan file fisik didefinisikan secara eksplisit.
 */
export interface CreateProductPayload {
    // Data Teks
    name: string;
    artist: string;
    release_year: string | number;
    format: ProductFormat | '';
    label?: string;
    catalog_number?: string;
    grading: ProductGrading | '';
    price: string | number;
    stock: string | number;
    condition_notes?: string;

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
 */
export interface BulkCreateProductPayload {
    name: string;
    artist: string;
    release_year: number | string;
    format: ProductFormat;
    label?: string;
    catalog_number?: string;
    grading: ProductGrading;
    price: number | string;
    stock: number | string;
    condition_notes?: string;
}
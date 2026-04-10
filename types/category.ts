/**
 * Representasi tabel SubCategories di Database
 */
export interface SubCategory {
    id: string;
    category_id: string;
    name: string;
    slug: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Representasi tabel Categories di Database (Kategori Induk)
 * Mengandung relasi nested 'subCategories' untuk kebutuhan menu/dropdown
 */
export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    created_at?: string;
    updated_at?: string;

    // Relasi (Eager Loading dari Backend)
    subCategories?: SubCategory[];
}
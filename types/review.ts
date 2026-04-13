import { User } from './auth';
import { Product } from './product';
import { OrderItem } from './order';

/**
 * Representasi tabel Reviews di Database
 */
export interface Review {
    id: string;
    user_id: string;
    product_id: string;
    order_item_id: string;
    rating: number; // Nilai 1 sampai 5
    comment: string | null;
    media: string[]; // Array URL foto/video unboxing dari JSONB
    created_at: string;
    updated_at: string;

    // Relasi (Eager Loading)
    // Hanya mengambil atribut yang aman untuk ditampilkan publik
    user?: Pick<User, 'id' | 'full_name'>;
    product?: Pick<Product, 'id' | 'name' | 'slug'>;
    orderItem?: OrderItem;
}

/**
 * Payload spesifik untuk State Form React (Saat Pembeli Menulis Ulasan).
 * Frontend akan menampung input di sini sebelum dikonversi menjadi FormData 
 * (karena mengandung file upload).
 */
export interface CreateReviewPayload {
    order_item_id: string; // Product ID tidak perlu dikirim, Backend bisa melacaknya dari order_item_id
    rating: number;        // Wajib: 1 - 5
    comment?: string;      // Opsional
    media?: File[];        // Array file foto/video bukti unboxing (Opsional)
}

/**
 * Struktur data untuk menampilkan Ringkasan Ulasan di Halaman Detail Produk (PDP).
 * Sangat berguna untuk merender komponen Bintang dan Progress Bar Rating.
 */
export interface ProductReviewSummary {
    average_rating: number; // cth: 4.8
    total_reviews: number;  // cth: 150
    rating_distribution: {
        5: number; // Jumlah user yang memberi bintang 5
        4: number;
        3: number;
        2: number;
        1: number;
    };
}
// File: dialog-fe/utils/serverAuth.ts
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * MENGAMBIL TOKEN (DEPRECATED FOR LOCAL STORAGE MODE)
 * Server-side tidak bisa membaca localStorage. Fungsi ini akan selalu null 
 * kecuali jika Anda sengaja menyuntikkan cookie tambahan.
 */
export async function getToken() {
    return null;
}

/**
 * FETCH PROFIL USER (SERVER COMPONENT)
 * Karena menggunakan Local Session, proses ini dialihkan ke Client-Side (Zustand fetchMe).
 * Server akan mengembalikan null agar Client Guard yang mengambil alih.
 */
export async function getMe() {
    return null;
}

/**
 * FETCH PRODUK TERBARU (PUBLIC DATA)
 * Fungsi ini tetap dipertahankan karena bersifat publik dan tidak butuh token.
 */
export async function getRecentProducts() {
    try {
        const res = await fetch(`${API_URL}/api/products`, {
            next: { revalidate: 60 }, // ISR: Cache 60 detik
        });

        if (!res.ok) return [];
        const json = await res.json();
        return json.data.slice(0, 4);
    } catch (error) {
        console.error('Failed to fetch public products:', error);
        return [];
    }
}

// Fungsi setToken dan removeToken dihapus karena sudah tidak relevan dengan Local Storage
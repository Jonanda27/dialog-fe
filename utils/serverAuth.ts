import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Mengambil token dari Cookie
export async function getToken() {
    const cookieStore = await cookies();
    return cookieStore.get('token')?.value;
}

// Menyimpan token (Gunakan ini di Server Action saat proses Login)
export async function setToken(token: string) {
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 hari
    });
}

// Menghapus token (Untuk Logout)
export async function removeToken() {
    const cookieStore = await cookies();
    cookieStore.delete('token');
}

// Fetch Profil User (Server Component)
export async function getMe() {
    const token = await getToken();
    if (!token) return null;

    try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store', // Selalu ambil data terbaru
        });

        if (!res.ok) return null;
        const json = await res.json();
        return json.data;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
    }
}

// Fetch Produk Terbaru
export async function getRecentProducts() {
    try {
        const res = await fetch(`${API_URL}/api/products`, {
            next: { revalidate: 60 }, // ISR: Cache 60 detik demi performa
        });

        if (!res.ok) return [];
        const json = await res.json();
        // Ambil 4 produk terbaru
        return json.data.slice(0, 4);
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
    }
}
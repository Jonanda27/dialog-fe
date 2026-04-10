import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Definisikan Zona Akses (Route Mapping)
// Rute yang dilarang jika user SUDAH login
const authRoutes = ['/auth/login', '/auth/register'];

// Rute yang dilarang jika user BELUM login
const protectedRoutes = [
    '/checkout',
    '/pembayaran',
    '/pesanan',
    '/dashboard' // Tambahkan rute khusus seller/buyer lainnya di sini
];

export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // 2. Ekstraksi Token dari Cookies (Satu-satunya cara yang valid di Edge Runtime)
    const token = request.cookies.get('token')?.value;

    // 3. Skenario A: Mengakses Halaman Otentikasi
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
    if (isAuthRoute) {
        if (token) {
            // Jika sudah punya token tapi mencoba buka /login, tendang kembali ke Beranda
            return NextResponse.redirect(new URL('/', request.url));
        }
        // Jika belum login, silakan masuk ke halaman auth
        return NextResponse.next();
    }

    // 4. Skenario B: Mengakses Halaman Terproteksi (Checkout, Pesanan, dll)
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
    if (isProtectedRoute) {
        if (!token) {
            // Catat URL tujuan mereka saat ini agar bisa dikembalikan setelah berhasil login
            const currentUrl = encodeURIComponent(pathname + search);
            const redirectUrl = new URL(`/auth/login?redirect_to=${currentUrl}`, request.url);

            // Tendang ke halaman login dengan status 302 (Temporary Redirect)
            return NextResponse.redirect(redirectUrl);
        }

        // Catatan Arsitektur: 
        // Jika Anda butuh validasi Role (misal: Cegah Buyer masuk ke /dashboard-seller), 
        // Anda bisa men-decode JWT Token di sini menggunakan library 'jwt-decode' atau 'jose'.
        // Untuk saat ini, asalkan punya token, biarkan lewat.
    }

    // 5. Skenario C: Loloskan semua request ke rute publik (/katalog, /, /tentang-kami)
    return NextResponse.next();
}

// 6. Konfigurasi Matcher (Optimasi Performa)
// Mencegah middleware dieksekusi pada file statis atau API bawaan Next.js
export const config = {
    matcher: [
        /*
         * Cocokkan semua request paths KECUALI untuk:
         * - api (rute backend lokal jika ada)
         * - _next/static (file javascript/css statis)
         * - _next/image (optimasi gambar)
         * - favicon.ico, sitemap.xml, robots.txt
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)',
    ],
};
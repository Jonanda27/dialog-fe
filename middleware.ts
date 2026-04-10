import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * PROTOKOL MIDDLEWARE (REVISED FOR LOCAL SESSION)
 * Karena Anda menggunakan LocalStorage murni, Middleware ini hanya bertugas:
 * 1. Melindungi rute sensitif yang WAJIB menggunakan Cookie (jika ada).
 * 2. Mengatur optimasi routing statis.
 * 3. Tidak memblokir rute Buyer agar tidak terjadi Infinite Loop.
 */

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Ekstraksi Token dari Cookies (Opsional, hanya untuk pengecekan server-side)
    const token = request.cookies.get('token')?.value;

    // 2. PROTEKSI KHUSUS (Contoh: Admin atau Penjual yang butuh keamanan ekstra)
    // Jika Anda ingin rute /admin atau /penjual tetap dijaga Middleware, biarkan ini.
    // Tapi jika rute Buyer (/dashboard, /checkout) ingin pakai LocalStorage, 
    // pastikan rute tersebut TIDAK ADA di dalam logika pengecekan di bawah ini.

    const serverProtectedRoutes = ['/admin', '/penjual/dashboard-internal'];
    const isServerProtectedRoute = serverProtectedRoutes.some((route) => pathname.startsWith(route));

    if (isServerProtectedRoute && !token) {
        // Hanya tendang jika memang rute ini didesain wajib Cookie
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 3. LOLOSKAN RUTE BUYER (/dashboard, /checkout, /pesanan)
    // Biarkan ditangani oleh AuthGuard di sisi Client (React) karena bisa baca LocalStorage.
    return NextResponse.next();
}

// 4. Konfigurasi Matcher (Sangat Penting untuk Performa)
export const config = {
    matcher: [
        /*
         * Mencocokkan rute selain file statis.
         * Kita tetap jalankan middleware untuk optimasi header, 
         * tapi tidak melakukan pengalihan paksa pada rute buyer.
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
    ],
};
// File: middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Ambil token dari cookie yang diset saat login sukses
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Definisikan rute mana saja yang butuh otentikasi
    const isProtectedRoute =
        pathname.startsWith('/penjual') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/dashboard'); // rute pembeli

    // Definisikan rute otentikasi (guest only)
    const isAuthRoute = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register');

    // SKENARIO 1: Belum login tapi maksa masuk halaman terproteksi
    if (isProtectedRoute && !token) {
        // Arahkan kembali ke halaman login
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // SKENARIO 2: Sudah login tapi iseng buka halaman login/register
    if (isAuthRoute && token) {
        // Arahkan kembali ke beranda atau dashboard (bisa disesuaikan)
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Jika aman, biarkan request berlanjut
    return NextResponse.next();
}

// Konfigurasi Matcher: Tentukan path mana saja yang akan dicegat oleh middleware ini
export const config = {
    matcher: [
        /*
         * Cocokkan semua request path kecuali:
         * 1. /api/ (API routes)
         * 2. /_next/ (Next.js internals)
         * 3. /_static/ (inside /public)
         * 4. /favicon.ico, sitemap.xml (static files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
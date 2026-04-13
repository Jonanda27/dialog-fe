// File: dialog-fe/middleware.ts
import { NextResponse } from 'next/server';
import type { NextApiRequest } from 'next';

/**
 * PROTOKOL MIDDLEWARE (CLIENT-SIDE AUTH MODE)
 * Middleware ini tidak lagi melakukan pengecekan token/sesi.
 * Proteksi rute dialihkan sepenuhnya ke AuthGuard (Client Component).
 */
export function middleware(request: NextApiRequest) {
    // Kita tetap menjalankan middleware untuk optimasi response, 
    // tapi kita meloloskan semua request agar tidak terjadi konflik dengan localStorage.
    return NextResponse.next();
}

// Matcher tetap dipertahankan untuk mengabaikan file statis demi performa
export const config = {
    matcher: [
        /*
         * Mencocokkan rute selain file statis:
         * api, _next/static, _next/image, favicon.ico, dll.
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
    ],
};
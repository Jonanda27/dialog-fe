'use client'; // Error boundaries WAJIB berupa Client Component

import { useEffect } from 'react';
import Link from 'next/link';

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        // [ENTERPRISE STANDARD]: Di sini Anda bisa mengirimkan error ke 
        // layanan monitoring seperti Sentry, Datadog, atau LogRocket.
        console.error('Terjadi Fatal Error:', error);
    }, [error]);

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 md:px-8">
            <div className="bg-white border border-gray-300 p-8 md:p-12 max-w-lg w-full text-center shadow-sm">

                {/* Ikon Peringatan Flat */}
                <div className="w-16 h-16 bg-red-50 border-2 border-red-600 text-red-600 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                    Sistem Mengalami Gangguan
                </h1>

                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                    Maaf, terjadi kesalahan tak terduga saat memuat halaman ini. Tim teknis kami telah mencatat anomali ini.
                    <br /><br />
                    <span className="font-mono bg-gray-100 px-2 py-1 text-xs text-gray-600 break-all">
                        {error.message || 'Unknown Exception'}
                    </span>
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {/* Fungsi reset() akan memaksa Next.js me-render ulang komponen yang crash */}
                    <button
                        onClick={() => reset()}
                        className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                    >
                        Muat Ulang
                    </button>

                    <Link
                        href="/"
                        className="border border-black bg-white text-black px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                    >
                        Ke Beranda
                    </Link>
                </div>

            </div>
        </main>
    );
}
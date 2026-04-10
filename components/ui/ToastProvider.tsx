'use client';

import { Toaster } from 'sonner';

export default function ToastProvider() {
    return (
        <Toaster
            position="bottom-right" // Posisi elegan, tidak menutupi navigasi atas
            toastOptions={{
                // Pengaturan gaya utama: Flat Design (tanpa shadow, tanpa rounded)
                className: 'rounded-none shadow-none font-sans font-medium border-2',
                classNames: {
                    // Default Toast (Netral)
                    toast: 'bg-white border-black text-black',
                    // Error Toast (Merah Tegas)
                    error: 'bg-red-50 border-red-600 text-red-700',
                    // Success Toast (Hijau Tegas)
                    success: 'bg-green-50 border-green-600 text-green-700',
                    // Warning Toast (Kuning Tegas)
                    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
                    // Info Toast (Biru Tegas)
                    info: 'bg-blue-50 border-blue-500 text-blue-700',
                },
                // Durasi default toast tampil di layar
                duration: 4000,
            }}
        />
    );
}
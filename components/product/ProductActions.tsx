'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import GradingService from '@/services/api/grading.service';

export default function ProductActions({ product }: { product: any }) {
    const [isRequesting, setIsRequesting] = useState(false);
    const addItem = useCartStore((state) => state.addItem);
    const openCart = useCartStore((state) => state.openCart);

    const primaryMedia = product.media?.find((m: any) => m.is_primary)?.media_url || '/vynil.png';

    const handleAddToCart = () => {
        try {
            addItem(product);
            toast.success('Produk berhasil ditambahkan ke keranjang');
            openCart(); // Buka keranjang otomatis setelah berhasil
        } catch (error: any) {
            toast.error(error.message || 'Gagal menambahkan ke keranjang');
        }
    };

    const handleRequestGrading = async () => {
        if (!product?.id) return;

        setIsRequesting(true);
        try {
            // Memanggil endpoint integrasi POST /api/grading/request
            const response = await GradingService.requestGrading({ product_id: product.id });

            // Menggunakan struktur successResponse dari backend
            if (response.success || response.data) {
                toast.success('Permintaan verifikasi premium berhasil diajukan! Penjual telah dinotifikasi.');
            }
        } catch (error: any) {
            // Menangkap pesan error dari backend secara presisi (khususnya untuk proteksi limit 3 tiket)
            const errorMessage = error.response?.data?.message || 'Gagal mengajukan grading. Silakan coba lagi.';
            toast.error(errorMessage);
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 mt-8">
            {/* Tombol Keranjang & Beli */}
            <div className="flex gap-4">
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock < 1}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
                >
                    Tambah ke Keranjang
                </button>
                <button
                    disabled={product.stock < 1}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                    Beli Sekarang
                </button>
            </div>

            {/* Fitur Verifikasi Premium (Grading Add-on) */}
            <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/50 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-white">Ragu dengan kondisinya?</p>
                    <p className="text-xs text-zinc-400 mt-1">Minta video detail fisik ke penjual.</p>
                    {/* Copywriting UX untuk menjelaskan model bisnis Post-Paid */}
                    <p className="text-[10px] text-zinc-500 mt-1 font-medium italic">
                        *Gratis pengajuan. Biaya Rp 15.000 hanya ditagihkan jika Anda checkout.
                    </p>
                </div>
                <button
                    onClick={handleRequestGrading}
                    // Validasi ganda: Nonaktifkan tombol jika sedang memproses atau jika stok habis
                    disabled={isRequesting || product.stock < 1}
                    className="text-xs font-semibold px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition disabled:opacity-50 min-w-32.5"
                >
                    {isRequesting ? 'Memproses...' : 'Request Grading'}
                </button>
            </div>
        </div>
    );
}
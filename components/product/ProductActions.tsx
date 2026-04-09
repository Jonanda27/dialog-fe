'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

export default function ProductActions({ product }: { product: any }) {
    const [isRequesting, setIsRequesting] = useState(false);
    const addItem = useCartStore((state) => state.addItem);
    const toggleCart = useCartStore((state) => state.toggleCart);

    const primaryMedia = product.media?.find((m: any) => m.is_primary)?.media_url || '/vynil.png';

    const handleAddToCart = () => {
        const result = addItem({
            id: product.id,
            name: product.name,
            artist: product.artist,
            price: Number(product.price),
            mediaUrl: primaryMedia,
            store_id: product.store_id,
            store_name: product.store?.name || 'Toko Analog',
            stock: product.stock,
        });

        if (result.success) {
            toast.success(result.message);
            toggleCart(); // Buka keranjang otomatis setelah berhasil
        } else {
            toast.error(result.message);
        }
    };

    const handleRequestGrading = async () => {
        setIsRequesting(true);
        try {
            // Logic pemanggilan API /api/grading/request
            toast.success('Permintaan grading berhasil diajukan! Menunggu video dari seller.');
        } catch (error) {
            toast.error('Gagal mengajukan grading.');
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

            {/* Fitur Grading */}
            <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/50 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-white">Ragu dengan kondisinya?</p>
                    <p className="text-xs text-zinc-500 mt-1">Minta video detail barang ke penjual. (Gratis)</p>
                </div>
                <button
                    onClick={handleRequestGrading}
                    disabled={isRequesting}
                    className="text-xs font-semibold px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
                >
                    {isRequesting ? 'Memproses...' : 'Request Grading'}
                </button>
            </div>
        </div>
    );
}
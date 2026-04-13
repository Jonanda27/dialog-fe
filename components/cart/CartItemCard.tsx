'use client';

import Image from 'next/image';
import { CartItem } from '@/types/cart';
import { useCartStore } from '@/store/cartStore'; // Asumsi store ini akan/sudah kita buat

interface CartItemCardProps {
    item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
    const { updateQuantity, removeItem } = useCartStore();
    const { product, quantity } = item;

    // Ekstraksi Foto Utama
    const primaryMedia = product.media?.find(m => m.is_primary)?.media_url || '/placeholder.jpg';

    // Ekstraksi Atribut JSONB untuk Badge
    const conditionBadge = product.metadata?.media_grading || product.metadata?.physical_condition || 'N/A';

    // Format Harga
    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(Number(product.price));

    return (
        <div className="flex items-start gap-4 py-4 border-b border-gray-200 bg-white">
            {/* Thumbnail */}
            <div className="relative w-20 h-20 shrink-0 border border-gray-200 bg-gray-50">
                <Image
                    src={primaryMedia}
                    alt={product.name}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Info Produk */}
            <div className="flex flex-col grow min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-gray-900 truncate pr-4">
                        {product.name}
                    </h4>
                    <button
                        onClick={() => removeItem(item.cart_item_id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        title="Hapus"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <span className="px-1.5 py-0.5 bg-black text-white text-[10px] font-bold tracking-widest uppercase">
                        {conditionBadge}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                        {product.store?.name || 'Store'}
                    </span>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-bold text-gray-900">
                        {formattedPrice}
                    </span>

                    {/* Kontrol Kuantitas (Flat Design) */}
                    <div className="flex items-center border border-gray-300">
                        <button
                            onClick={() => updateQuantity(item.cart_item_id, quantity - 1)}
                            disabled={quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            -
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-gray-900">
                            {quantity}
                        </span>
                        <button
                            onClick={() => updateQuantity(item.cart_item_id, quantity + 1)}
                            disabled={quantity >= product.stock}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
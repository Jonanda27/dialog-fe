'use client';

import { CartItem } from '@/types/cart';

interface OrderSummaryProps {
    items: CartItem[];
    subtotal: number;
    shippingFee: number | null;
    grandTotal: number;
    isSubmitting: boolean;
    error: string | null;
    onCheckout: () => void;
    isCheckoutReady: boolean;
}

export default function OrderSummary({
    items,
    subtotal,
    shippingFee,
    grandTotal,
    isSubmitting,
    error,
    onCheckout,
    isCheckoutReady
}: OrderSummaryProps) {

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="bg-white border border-gray-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight border-b border-gray-200 pb-3">
                Ringkasan Pesanan
            </h2>

            {/* List Barang - Dibatasi tingginya agar rapi jika barang banyak */}
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                {items.map((item) => (
                    <div key={item.cart_item_id} className="flex justify-between items-start text-sm">
                        <span className="text-gray-600 line-clamp-2 pr-4 grow">
                            <span className="font-semibold text-gray-900">{item.quantity}x</span> {item.product.name}
                        </span>
                        <span className="font-semibold text-gray-900 whitespace-nowrap">
                            {formatCurrency(Number(item.product.price) * item.quantity)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Breakdown Finansial */}
            <div className="space-y-3 border-t border-gray-200 pt-4 text-sm">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal Produk</span>
                    <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>Ongkos Kirim</span>
                    <span className="font-medium text-gray-900">
                        {shippingFee !== null ? formatCurrency(shippingFee) : '-'}
                    </span>
                </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-end border-t border-gray-900 mt-4 pt-4 mb-6">
                <span className="font-bold text-gray-900">Total Tagihan</span>
                <span className="text-2xl font-extrabold text-gray-900 leading-none">
                    {formatCurrency(grandTotal)}
                </span>
            </div>

            {/* Error Notifier (Menangkap Error Overselling dari DB Transaction) */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium leading-relaxed">
                    <span className="font-bold uppercase tracking-wider block mb-1">Gagal</span>
                    {error}
                </div>
            )}

            {/* Call to Action Utama */}
            <button
                onClick={onCheckout}
                disabled={!isCheckoutReady || isSubmitting}
                className={`w-full font-bold py-4 text-sm uppercase tracking-widest transition-colors ${isCheckoutReady && !isSubmitting
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
            >
                {isSubmitting ? 'Memproses Pesanan...' : 'Buat Pesanan'}
            </button>
        </div>
    );
}
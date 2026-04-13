'use client';

import { CartItem } from '@/types/cart';
import { toIDR } from '@/utils/format';

interface OrderSummaryProps {
    items: CartItem[];
    subtotal: number;
    shippingFee: number;
    gradingFee: number; // ⚡ SEKARANG TERDEFINISI
    isSubmitting: boolean;
    onConfirm: () => void;
}

export default function OrderSummary({
    items,
    subtotal,
    shippingFee,
    gradingFee,
    isSubmitting,
    onConfirm
}: OrderSummaryProps) {
    const grandTotal = subtotal + shippingFee + gradingFee;

    return (
        <div className="bg-white border border-gray-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight border-b border-gray-100 pb-3 uppercase">Ringkasan Pesanan</h2>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 uppercase font-bold text-[10px]">Subtotal Produk</span>
                    <span className="font-bold">{toIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 uppercase font-bold text-[10px]">Ongkos Kirim</span>
                    <span className="font-bold">{shippingFee > 0 ? toIDR(shippingFee) : '-'}</span>
                </div>
                {gradingFee > 0 && (
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-600 uppercase font-bold text-[10px]">Biaya Request Grading</span>
                        <span className="font-bold text-blue-600">{toIDR(gradingFee)}</span>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center border-t border-black pt-4 mb-8">
                <span className="text-sm font-bold uppercase">Total Tagihan</span>
                <span className="text-2xl font-black">{toIDR(grandTotal)}</span>
            </div>

            <button
                onClick={onConfirm}
                disabled={isSubmitting}
                className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
                {isSubmitting ? 'Memproses...' : 'Konfirmasi & Bayar'}
            </button>
        </div>
    );
}
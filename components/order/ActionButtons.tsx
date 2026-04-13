'use client';

import { OrderStatus } from '@/types/order';

interface ActionButtonsProps {
    status: OrderStatus;
    isSubmitting: boolean;
    actionError: string | null;
    onCompleteOrder: () => void;
    onOpenReviewForm: () => void;
    onOpenDispute: () => void; // Disiapkan untuk Fase Dispute (Komplain)
}

export default function ActionButtons({
    status,
    isSubmitting,
    actionError,
    onCompleteOrder,
    onOpenReviewForm,
    onOpenDispute
}: ActionButtonsProps) {

    return (
        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col items-end w-full">

            {actionError && (
                <div className="mb-4 text-sm font-semibold text-red-600 bg-red-50 p-3 border border-red-200 w-full text-center">
                    {actionError}
                </div>
            )}

            {/* Aksi 1: Rilis Escrow (Jika barang sedang dikirim/tiba) */}
            {(status === 'shipped' || status === 'delivered') && (
                <div className="w-full md:w-auto text-right flex flex-col items-end">
                    <p className="text-xs text-gray-500 mb-3 max-w-sm ml-auto">
                        PENTING: Klik tombol di bawah hanya jika barang sudah Anda terima dan sesuai dengan pesanan. Dana Escrow akan diteruskan ke Penjual.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                            onClick={onOpenDispute}
                            disabled={isSubmitting}
                            className="bg-white text-black border border-gray-300 px-6 py-3 text-sm font-bold uppercase tracking-widest hover:border-black transition-colors disabled:opacity-50"
                        >
                            Komplain (Dispute)
                        </button>
                        <button
                            onClick={onCompleteOrder}
                            disabled={isSubmitting}
                            className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Memproses...' : 'Pesanan Diterima'}
                        </button>
                    </div>
                </div>
            )}

            {/* Aksi 2: Beri Ulasan (Jika transaksi sudah selesai) */}
            {status === 'completed' && (
                <div className="w-full flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 border border-gray-200 gap-4 sm:gap-0">
                    <div className="text-sm text-center sm:text-left">
                        <span className="font-bold text-gray-900 block mb-1">Transaksi Selesai</span>
                        <span className="text-gray-500">Dana telah diteruskan ke dompet penjual. Berikan penilaian Anda terhadap kualitas barang.</span>
                    </div>
                    <button
                        onClick={onOpenReviewForm}
                        className="w-full sm:w-auto border border-black bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                    >
                        Beri Ulasan Barang
                    </button>
                </div>
            )}

        </div>
    );
}
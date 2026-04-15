'use client';

import { CartItem } from '@/types/cart';
import { toIDR } from '@/utils/format';

interface OrderSummaryProps {
    items: CartItem[];
    subtotal: number;
    shippingFee: number;
    gradingFee: number;
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
    // ⚡ THE FINAL WEDDING: Kalkulasi absolut di sisi UI untuk transparansi
    const grandTotal = subtotal + shippingFee + gradingFee;

    // ⚡ PROTEKSI LOGIKA: Tombol konfirmasi tidak boleh ditekan jika ongkos kirim belum dikalkulasi
    // Asumsi: Dalam sistem ini, ongkos kirim Rp0 hanya berlaku jika kurir belum dipilih.
    const isReadyToPay = shippingFee > 0;

    return (
        <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6 tracking-tight border-b border-gray-100 pb-3 uppercase">
                Ringkasan Pesanan
            </h2>

            {/* ⚡ PENINGKATAN UX: Menampilkan rincian barang yang dibeli (Item Preview) */}
            <div className="mb-6 space-y-4 max-h-75 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                {items.map((item) => (
                    <div key={item.cart_item_id} className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            {/* Perbaikan pemetaan objek: menggunakan item.product.name */}
                            <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                                {item.product.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                                {item.quantity} <span className="lowercase">x</span> {toIDR(Number(item.product.price))}
                            </p>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                            {toIDR(Number(item.product.price) * (item.quantity || 1))}
                        </span>
                    </div>
                ))}
            </div>

            <div className="space-y-4 mb-6 pt-4 border-t border-dashed border-gray-200">
                <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Subtotal Produk</span>
                    <span className="font-bold text-gray-900">{toIDR(subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Ongkos Kirim</span>
                    <div className="font-bold text-gray-900 flex items-center">
                        {shippingFee > 0 ? (
                            toIDR(shippingFee)
                        ) : (
                            // Visual feedback jika pembeli belum memilih kurir
                            <span className="text-red-500 text-xs italic bg-red-50 px-2 py-1 rounded-sm">Belum Dipilih</span>
                        )}
                    </div>
                </div>

                {/* Dirender secara dinamis hanya jika state memiliki gradingFee (ada tiket aktif) */}
                {gradingFee > 0 && (
                    <div className="flex justify-between text-sm items-center">
                        <span className="text-blue-600 uppercase font-bold text-[10px] tracking-wider">Biaya Request Grading</span>
                        <span className="font-bold text-blue-600">{toIDR(gradingFee)}</span>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-end border-t border-black pt-5 mb-8">
                <span className="text-sm font-bold uppercase tracking-tight">Total Tagihan</span>
                <div className="text-right">
                    <span className="block text-3xl font-black text-gray-900 leading-none">{toIDR(grandTotal)}</span>
                </div>
            </div>

            <button
                onClick={onConfirm}
                disabled={isSubmitting || !isReadyToPay}
                className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:text-gray-500 flex items-center justify-center gap-2 group"
            >
                {isSubmitting ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        MEMPROSES...
                    </>
                ) : (
                    <>
                        KONFIRMASI & BAYAR
                        {/* Ikon panah yang akan bergeser saat di-hover (Micro-interaction) */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </>
                )}
            </button>

            {/* Peringatan eksplisit jika tombol terkunci karena belum memilih kurir */}
            {!isReadyToPay && (
                <p className="text-[10px] text-center text-red-500 font-bold uppercase tracking-wide mt-3">
                    * Pilih opsi pengiriman untuk melanjutkan
                </p>
            )}
        </div>
    );
}
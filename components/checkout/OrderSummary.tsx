'use client';

import { CartItem } from '@/types/cart';
import { toIDR } from '@/utils/format';
import { ArrowRight, ShieldCheck } from 'lucide-react';

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
    const grandTotal = subtotal + shippingFee + gradingFee;
    const isReadyToPay = shippingFee > 0;

    return (
        <div className="bg-[#111114] border border-zinc-800 p-6 md:p-8 rounded-[2rem] shadow-2xl sticky top-28">
            <h2 className="text-lg font-black text-white mb-6 tracking-tight border-b border-zinc-800 pb-4 uppercase">
                Order Summary
            </h2>

            {/* Item Preview */}
            <div className="mb-6 space-y-5 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                    <div key={item.cart_item_id} className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <p className="text-xs font-bold text-white line-clamp-2 leading-tight uppercase tracking-tight">
                                {item.product.name}
                            </p>
                            <p className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-widest">
                                {item.quantity} <span className="lowercase">x</span> {toIDR(Number(item.product.price))}
                            </p>
                        </div>
                        <span className="text-xs font-black text-white shrink-0">
                            {toIDR(Number(item.product.price) * item.quantity)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Calculations */}
            <div className="space-y-4 mb-8 pt-6 border-t border-dashed border-zinc-800">
                <div className="flex justify-between items-center">
                    <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-widest">Subtotal Produk</span>
                    <span className="font-bold text-white text-xs">{toIDR(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-widest">Ongkos Kirim</span>
                    <span className="font-bold text-white text-xs">
                        {shippingFee > 0 ? (
                            toIDR(shippingFee)
                        ) : (
                            <span className="text-[#ef3333] text-[9px] italic border border-[#ef3333]/30 bg-[#ef3333]/10 px-2 py-0.5 rounded-sm">Belum Dipilih</span>
                        )}
                    </span>
                </div>

                {gradingFee > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-blue-500 uppercase font-bold text-[10px] tracking-widest">Biaya Request Grading</span>
                        <span className="font-bold text-blue-400 text-xs">{toIDR(gradingFee)}</span>
                    </div>
                )}
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-end border-t border-zinc-800 pt-6 mb-8">
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Total Tagihan</span>
                <div className="text-right">
                    <span className="block text-3xl font-black italic text-[#ef3333] tracking-tighter leading-none">{toIDR(grandTotal)}</span>
                </div>
            </div>

            {/* Checkout Button */}
            <button
                onClick={onConfirm}
                disabled={isSubmitting || !isReadyToPay}
                className={`w-full py-4 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group shadow-xl 
                    ${isReadyToPay && !isSubmitting 
                        ? 'bg-[#ef3333] text-white hover:bg-red-700 hover:shadow-[0_10px_30px_rgba(239,51,51,0.3)]' 
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
            >
                {isSubmitting ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        MEMPROSES...
                    </>
                ) : (
                    <>
                        KONFIRMASI & BAYAR
                        <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>

            {/* Trust Badges / Info */}
            <div className="mt-6 flex flex-col gap-3">
                {!isReadyToPay && (
                    <p className="text-[10px] text-center text-[#ef3333] font-bold uppercase tracking-widest mb-2">
                        * Pilih kurir di semua toko untuk lanjut
                    </p>
                )}
                <div className="flex items-center justify-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Transaksi Aman & Terenkripsi</span>
                </div>
            </div>
            
            {/* Custom Scrollbar Styling (Khusus List Barang di Summary) */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
            `}</style>
        </div>
    );
}
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOrderStore } from '@/store/orderStore';
import { OrderStatus } from '@/types/order';

export default function DetailPesananPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const { currentOrder: order, isLoading, isSubmitting, error, fetchOrderById, completeOrder } = useOrderStore();
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        if (orderId) {
            fetchOrderById(orderId);
        }
    }, [orderId, fetchOrderById]);

    if (isLoading || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <span className="text-gray-500 font-semibold animate-pulse">Memuat detail pesanan...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
                <div className="bg-red-50 border border-red-200 p-6 max-w-lg text-center">
                    <h2 className="text-lg font-bold text-red-800 mb-2">Gagal Memuat Pesanan</h2>
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                    <button onClick={() => router.push('/pesanan')} className="border border-red-800 text-red-800 px-6 py-2 font-bold text-sm uppercase">Kembali ke Daftar</button>
                </div>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    // Handler Pelepasan Escrow
    const handleSelesaikanPesanan = async () => {
        if (!confirm('Apakah Anda yakin barang telah diterima dengan baik? Tindakan ini akan meneruskan dana ke Penjual dan tidak dapat dibatalkan.')) {
            return;
        }

        setActionError(null);
        try {
            await completeOrder(order.id);
            alert('Pesanan berhasil diselesaikan. Terima kasih telah berbelanja!');
            // Reload data lokal
            fetchOrderById(order.id);
        } catch (err: any) {
            setActionError(err.message || 'Gagal menyelesaikan pesanan.');
        }
    };

    // Logika Status untuk Tracker
    const orderStatuses: OrderStatus[] = ['pending_payment', 'paid', 'processing', 'shipped', 'completed'];
    const currentStatusIndex = orderStatuses.indexOf(order.status === 'delivered' ? 'shipped' : order.status);

    return (
        <main className="min-h-screen bg-gray-50 pt-8 pb-24">
            <div className="container mx-auto px-4 md:px-8 max-w-4xl">

                {/* Header Back Button */}
                <Link href="/pesanan" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition-colors mb-6">
                    &larr; Kembali ke Daftar Pesanan
                </Link>

                <div className="bg-white border border-gray-200 p-6 md:p-8 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Detail Pesanan</h1>
                            <p className="text-sm text-gray-500 mt-1 font-mono">ID: {order.id}</p>
                        </div>
                        {order.status === 'pending_payment' && (
                            <Link href={`/pembayaran/${order.id}`} className="bg-black text-white px-6 py-2 text-sm font-bold uppercase tracking-widest">
                                Bayar Sekarang
                            </Link>
                        )}
                    </div>

                    {/* Inline Status Tracker (KISS Architecture) */}
                    <div className="mb-10">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Status Pengiriman</h3>
                        <div className="relative">
                            {/* Garis background tracker */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0 hidden sm:block"></div>

                            <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
                                {['Belum Dibayar', 'Dibayar', 'Diproses', 'Dikirim', 'Selesai'].map((step, idx) => {
                                    const isActive = currentStatusIndex >= idx;
                                    const isCurrent = currentStatusIndex === idx;

                                    return (
                                        <div key={idx} className="flex sm:flex-col items-center gap-4 sm:gap-2 bg-white px-2">
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors ${isActive ? 'bg-black border-black text-white' : 'bg-white border-gray-300 text-gray-400'
                                                }`}>
                                                {isActive ? '✓' : idx + 1}
                                            </div>
                                            <span className={`text-sm font-semibold ${isCurrent ? 'text-black' : isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                                                {step}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Info Resi */}
                        {order.tracking_number && (
                            <div className="mt-8 bg-gray-50 border border-gray-200 p-4">
                                <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Nomor Resi Pengiriman</span>
                                <p className="text-lg font-mono font-bold text-gray-900 mt-1">{order.tracking_number}</p>
                            </div>
                        )}
                    </div>

                    {/* Detail Barang */}
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Daftar Produk</h3>
                    <div className="space-y-4 mb-8">
                        {order.items?.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-4 py-2">
                                <div>
                                    <h4 className="font-bold text-gray-900">{item.product?.name || 'Produk ID: ' + item.product_id}</h4>
                                    <div className="flex gap-2 items-center mt-1">
                                        <span className="text-xs text-gray-500">{item.qty} x {formatCurrency(Number(item.price_at_purchase))}</span>
                                        <span className="bg-black text-white text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider">
                                            Cond: {item.grading_at_purchase || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-900">
                                    {formatCurrency(Number(item.price_at_purchase) * item.qty)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Rincian Alamat & Finansial */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-200 pt-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Alamat Pengiriman</h3>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 border border-gray-200 min-h-25">
                                {order.shipping_address}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Rincian Pembayaran</h3>
                            <div className="bg-gray-50 p-4 border border-gray-200 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal Produk</span>
                                    <span>{formatCurrency(Number(order.subtotal))}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Ongkos Kirim</span>
                                    <span>{formatCurrency(Number(order.shipping_fee))}</span>
                                </div>
                                {Number(order.grading_fee) > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Biaya Request Grading</span>
                                        <span>{formatCurrency(Number(order.grading_fee))}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-gray-300 mt-2 pt-2">
                                    <span className="font-bold text-gray-900">Total Transaksi</span>
                                    <span className="font-extrabold text-gray-900 text-base">{formatCurrency(Number(order.grand_total))}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACTION AREA: Penyelesaian Pesanan & Review */}
                    <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col items-end">
                        {actionError && (
                            <div className="mb-4 text-sm font-semibold text-red-600 bg-red-50 p-3 border border-red-200 w-full text-center">
                                {actionError}
                            </div>
                        )}

                        {/* Jika barang sudah dikirim, berikan tombol rilis Escrow */}
                        {(order.status === 'shipped' || order.status === 'delivered') && (
                            <div className="w-full md:w-auto text-right">
                                <p className="text-xs text-gray-500 mb-3 max-w-sm ml-auto">
                                    Klik tombol di bawah hanya jika barang sudah Anda terima dan sesuai dengan pesanan. Dana akan langsung diteruskan ke Penjual.
                                </p>
                                <button
                                    onClick={handleSelesaikanPesanan}
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                >
                                    {isSubmitting ? 'Memproses...' : 'Pesanan Diterima'}
                                </button>
                            </div>
                        )}

                        {/* Jika barang sudah selesai, berikan tombol untuk Ulasan (Persiapan Fase Review) */}
                        {order.status === 'completed' && (
                            <div className="w-full flex justify-between items-center bg-gray-50 p-4 border border-gray-200">
                                <div className="text-sm">
                                    <span className="font-bold text-gray-900 block">Transaksi Selesai</span>
                                    <span className="text-gray-500">Dana telah diteruskan ke penjual. Terima kasih!</span>
                                </div>
                                <button
                                    onClick={() => alert('Fitur Form Ulasan (Review) akan dibuka pada tahap selanjutnya.')}
                                    className="border border-black bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                                >
                                    Beri Ulasan
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}
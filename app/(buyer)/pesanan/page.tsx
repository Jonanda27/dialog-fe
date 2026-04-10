'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useOrderStore } from '@/store/orderStore';
import { OrderStatus } from '@/types/order';

export default function DaftarPesananPage() {
    const { buyerOrders, isLoading, error, fetchBuyerOrders } = useOrderStore();

    useEffect(() => {
        fetchBuyerOrders();
    }, [fetchBuyerOrders]);

    // Helper: Konversi status ke label UI yang ramah pengguna
    const getStatusConfig = (status: OrderStatus) => {
        const config: Record<OrderStatus, { label: string, color: string }> = {
            'pending_payment': { label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            'paid': { label: 'Sudah Dibayar', color: 'bg-blue-100 text-blue-800 border-blue-200' },
            'processing': { label: 'Diproses Penjual', color: 'bg-purple-100 text-purple-800 border-purple-200' },
            'shipped': { label: 'Sedang Dikirim', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
            'delivered': { label: 'Tiba di Tujuan', color: 'bg-teal-100 text-teal-800 border-teal-200' },
            'completed': { label: 'Selesai', color: 'bg-green-100 text-green-800 border-green-200' },
            'cancelled': { label: 'Dibatalkan', color: 'bg-red-100 text-red-800 border-red-200' },
        };
        return config[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <main className="min-h-screen bg-gray-50 pt-8 pb-24">
            <div className="container mx-auto px-4 md:px-8 max-w-5xl">

                <div className="mb-8 border-b border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Riwayat Pesanan</h1>
                    <p className="text-sm text-gray-500 mt-1">Pantau status pengiriman dan selesaikan transaksi Anda di sini.</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <span className="text-gray-500 font-semibold animate-pulse">Memuat riwayat pesanan...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 p-4 text-red-600 text-sm font-semibold text-center">
                        {error}
                    </div>
                ) : buyerOrders.length === 0 ? (
                    <div className="bg-white border border-gray-200 p-12 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="text-lg font-bold text-gray-900">Belum ada pesanan</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-6">Anda belum pernah melakukan transaksi di Analog.id.</p>
                        <Link href="/katalog" className="bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
                            Mulai Belanja
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {buyerOrders.map((order) => {
                            const statusConfig = getStatusConfig(order.status);
                            const firstItem = order.items?.[0]; // Ambil item pertama untuk preview
                            const extraItemsCount = (order.items?.length || 1) - 1;

                            return (
                                <div key={order.id} className="bg-white border border-gray-200 p-5 hover:border-gray-400 transition-colors">
                                    {/* Header Card */}
                                    <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 mb-4 gap-4">
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="font-bold text-gray-900">
                                                {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="text-gray-400">|</span>
                                            <span className="text-gray-500 font-mono text-xs">ID: {order.id.split('-')[0].toUpperCase()}</span>
                                        </div>
                                        <div className={`px-3 py-1 border text-xs font-bold uppercase tracking-wider ${statusConfig.color}`}>
                                            {statusConfig.label}
                                        </div>
                                    </div>

                                    {/* Body Card */}
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex items-start gap-4 grow min-w-0">
                                            {/* Preview Item Pertama */}
                                            <div className="w-16 h-16 bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-gray-900 text-base truncate">
                                                    {firstItem?.product?.name || 'Produk Analog.id'}
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    {firstItem?.qty} barang x {formatCurrency(Number(firstItem?.price_at_purchase || 0))}
                                                </p>
                                                {extraItemsCount > 0 && (
                                                    <p className="text-xs text-gray-400 mt-1 font-medium">
                                                        + {extraItemsCount} produk lainnya
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:items-end w-full md:w-auto border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                                            <p className="text-sm text-gray-500 mb-1">Total Belanja</p>
                                            <p className="text-lg font-extrabold text-gray-900 mb-4 md:mb-0">
                                                {formatCurrency(Number(order.grand_total))}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Footer Card */}
                                    <div className="mt-6 flex justify-end gap-3">
                                        <Link
                                            href={`/pesanan/${order.id}`}
                                            className="border border-black bg-white text-black px-6 py-2 text-sm font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                                        >
                                            Lihat Detail
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderService } from '@/services/api/order.service';
import { Order } from '@/types/order';

export default function PembayaranPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Fetch detail order dari backend (membutuhkan Bearer Token)
                const response = await OrderService.getById(orderId);
                setOrder(response.data);
            } catch (err: any) {
                setError('Pesanan tidak ditemukan atau Anda tidak memiliki akses.');
            } finally {
                setIsLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <span className="text-gray-500 font-semibold animate-pulse">Memuat data pembayaran...</span>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <button onClick={() => router.push('/dashboard')} className="border border-black px-6 py-2 font-bold hover:bg-black hover:text-white transition-colors">
                    Kembali ke Dashboard
                </button>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    // Dummy Virtual Account Number berdasarkan Order ID agar terlihat unik
    const virtualAccountNumber = `8800${order.id.replace(/\D/g, '').substring(0, 8)}`;

    return (
        <main className="min-h-screen bg-gray-50 pt-12 pb-24">
            <div className="container mx-auto px-4 max-w-3xl">

                {/* Payment Card */}
                <div className="bg-white border border-gray-200 shadow-sm p-6 md:p-10 text-center">

                    <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Selesaikan Pembayaran</h1>
                    <p className="text-gray-500 text-sm mb-8">
                        Order ID: <span className="font-mono text-gray-900 bg-gray-100 px-2 py-1">{order.id}</span>
                    </p>

                    <div className="bg-gray-50 border border-gray-200 p-6 mb-8 text-left">
                        <p className="text-sm text-gray-500 mb-1">Total Tagihan</p>
                        <p className="text-3xl font-extrabold text-gray-900 mb-6">{formatCurrency(Number(order.grand_total))}</p>

                        <p className="text-sm text-gray-500 mb-1">Transfer ke Virtual Account Bank</p>
                        <div className="flex items-center justify-between bg-white border border-gray-300 p-3">
                            <span className="font-mono text-xl font-bold text-gray-900 tracking-widest">
                                {virtualAccountNumber}
                            </span>
                            <button
                                onClick={() => navigator.clipboard.writeText(virtualAccountNumber)}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                            >
                                Salin
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Sistem akan memverifikasi pembayaran Anda secara otomatis dalam 10 menit.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                            {/* Tombol Dummy untuk langsung menyelesaikan pembayaran di sisi Backend (opsional untuk testing) */}
                            <button
                                onClick={() => alert("Fitur simulasi gateway akan mengupdate status order menjadi 'paid'. (Belum terhubung ke backend webhook)")}
                                className="bg-black text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors"
                            >
                                Simulasi Bayar
                            </button>

                            <button
                                onClick={() => router.push('/pesanan')}
                                className="border border-black bg-white text-black px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors"
                            >
                                Cek Status Pesanan
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
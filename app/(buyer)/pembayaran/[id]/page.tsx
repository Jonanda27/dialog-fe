'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderService } from '@/services/api/order.service';
import { Order } from '@/types/order';
import { toast } from 'sonner';
import VirtualAccountInfo from '@/components/payment/VirtualAccountInfo';

export default function PembayaranPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPaid, setIsPaid] = useState(false);

    // Ref untuk menyimpan ID interval agar bisa dibersihkan (cleanup)
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fungsi fetch diekstraksi ke useCallback agar stabil direferensikan dalam useEffect
    const fetchOrderStatus = useCallback(async (isInitialFetch = false) => {
        try {
            const response = await OrderService.getById(orderId);
            const currentOrder = response.data;

            setOrder(currentOrder);

            // State Machine Assertion: Jika pesanan sudah dibayar
            if (currentOrder.status === 'paid' || currentOrder.status === 'processing') {
                setIsPaid(true);
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

                // Berikan feedback jika ini adalah transisi perubahan dari polling
                if (!isInitialFetch) {
                    toast.success('Pembayaran berhasil dikonfirmasi sistem!');
                }
            }

            // Jika expired atau dibatalkan, hentikan polling
            if (currentOrder.status === 'cancelled') {
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                toast.error('Waktu pembayaran telah habis atau pesanan dibatalkan.');
            }

        } catch (err: any) {
            if (isInitialFetch) {
                setError('Pesanan tidak ditemukan atau Anda tidak memiliki akses.');
            }
            console.error("Gagal melakukan sinkronisasi status pesanan.");
        } finally {
            if (isInitialFetch) setIsLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        if (!orderId) return;

        // 1. Eksekusi Initial Fetch
        fetchOrderStatus(true);

        // 2. Inisiasi Polling setiap 10 detik untuk mengecek status pembayaran
        pollingIntervalRef.current = setInterval(() => {
            fetchOrderStatus(false);
        }, 10000);

        // 3. Cleanup function saat komponen di-unmount (Mencegah Memory Leak)
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [orderId, fetchOrderStatus]);

    // --- RENDER BLOCKS --- //

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                <span className="text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Menghubungkan ke Gateway...</span>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-tight">Akses Ditolak</h2>
                <p className="text-gray-500 mb-8 max-w-md">{error}</p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="border border-black px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                >
                    Kembali ke Dashboard
                </button>
            </div>
        );
    }

    // Jika Status sudah PAID (Berhasil)
    if (isPaid) {
        return (
            <main className="min-h-screen bg-gray-50 pt-16 pb-24 flex items-center justify-center px-4">
                <div className="bg-white border border-green-200 shadow-sm p-10 text-center max-w-lg w-full">
                    <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2 uppercase">Pembayaran Berhasil!</h1>
                    <p className="text-gray-600 text-sm mb-8">
                        Dana Anda telah diamankan ke sistem Escrow. Penjual akan segera memproses pesanan Anda.
                    </p>
                    <button
                        onClick={() => router.push(`/pesanan/${order.id}`)}
                        className="w-full bg-black text-white px-8 py-4 text-sm font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors"
                    >
                        Lihat Detail Pesanan
                    </button>
                </div>
            </main>
        );
    }

    // --- DATA PREPARATION UNTUK COMPONENT UI ---
    // 1. Simulasi nomor VA (Format: 8800 + 8 digit ID)
    const virtualAccountNumber = `8800${order.id.replace(/\D/g, '').substring(0, 8).padEnd(8, '0')}`;

    // 2. Kalkulasi waktu kadaluarsa (24 Jam dari waktu checkout)
    const orderDate = new Date(order.created_at);
    const expiryDate = new Date(orderDate.getTime() + (24 * 60 * 60 * 1000));
    const expiryTimeIso = expiryDate.toISOString();

    // Jika Status Masih PENDING (Menunggu Pembayaran)
    return (
        <main className="min-h-screen bg-gray-50 pt-12 pb-24">
            <div className="container mx-auto px-4 max-w-3xl">
                {/* Controller menyuapkan data mentah yang sudah diproses 
                  ke View Component (VirtualAccountInfo) 
                */}
                <VirtualAccountInfo
                    vaNumber={virtualAccountNumber}
                    bankName="BCA Virtual Account"
                    totalAmount={order.grand_total}
                    expiryTime={expiryTimeIso}
                />
            </div>
        </main>
    );
}
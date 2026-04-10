'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { CourierOption } from '@/types/shipping';
import { CheckoutPayload } from '@/types/order';
// Asumsi Anda sudah membuat service ini mengikuti pola axiosClient kita
import { OrderService } from '@/services/api/order.service';
import { ShippingService } from '@/services/api/shipping.service';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, clearCart } = useCartStore();

    // Form State
    const [address, setAddress] = useState('');
    const [couriers, setCouriers] = useState<CourierOption[]>([]);
    const [selectedCourier, setSelectedCourier] = useState<CourierOption | null>(null);

    // Loading State
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Proteksi: Jika keranjang kosong, kembalikan ke katalog
    useEffect(() => {
        if (items.length === 0) {
            router.replace('/katalog');
        }
    }, [items, router]);

    if (items.length === 0) return null;

    // Kalkulasi Dasar
    const subtotal = items.reduce((total, item) => total + (Number(item.product.price) * item.quantity), 0);
    const totalWeight = items.length * 500; // Asumsi pukul rata 500gram per item (Atau ambil dari metadata jika ada)
    const grandTotal = subtotal + (selectedCourier ? selectedCourier.cost : 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    // Handler: Hitung Ongkir
    const handleCalculateShipping = async () => {
        if (address.length < 10) {
            setError('Alamat terlalu pendek. Mohon isi dengan detail.');
            return;
        }

        setIsCalculating(true);
        setError(null);
        try {
            // Simulasi Origin ID (Dalam production, ambil dari data Store)
            const response = await ShippingService.calculateCost({
                origin: 'KOTA-ASAL',
                destination: address,
                weight: totalWeight
            });
            setCouriers(response.data);
        } catch (err: any) {
            setError(err.message || 'Gagal menghitung ongkos kirim.');
        } finally {
            setIsCalculating(false);
        }
    };

    // Handler: Eksekusi Checkout
    const handleCheckout = async () => {
        if (!address || !selectedCourier) {
            setError('Pilih alamat dan metode pengiriman terlebih dahulu.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const payload: CheckoutPayload = {
            items: items.map(i => ({ product_id: i.product.id, qty: i.quantity })),
            shipping_address: address,
            shipping_fee: selectedCourier.cost
        };

        try {
            const response = await OrderService.checkout(payload);
            // Bersihkan keranjang
            clearCart();
            // Arahkan ke halaman pembayaran dengan ID Order yang baru dibuat
            router.push(`/pembayaran/${response.data.order_id}`);
        } catch (err: any) {
            // Error ini menangkap pesan validasi stok/overselling dari Backend
            setError(err.message || 'Gagal membuat pesanan. Silakan coba lagi.');
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 pt-8 pb-24">
            <div className="container mx-auto px-4 md:px-8 max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Kolom Kiri: Form Alamat & Pengiriman */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Block Alamat */}
                    <div className="bg-white border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">1. Alamat Pengiriman</h2>
                        <textarea
                            className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black min-h-24"
                            placeholder="Contoh: Jl. Braga No. 10, RT 01/02, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40111"
                            value={address}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAddress(e.target.value)}
                        />
                        <button
                            onClick={handleCalculateShipping}
                            disabled={isCalculating || address.length < 10}
                            className="mt-4 bg-black text-white px-6 py-2 text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {isCalculating ? 'Menghitung...' : 'Cek Ongkos Kirim'}
                        </button>
                    </div>

                    {/* Block Kurir */}
                    <div className="bg-white border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">2. Metode Pengiriman</h2>
                        {couriers.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">Silakan isi alamat dan klik "Cek Ongkos Kirim" terlebih dahulu.</p>
                        ) : (
                            <div className="space-y-3">
                                {couriers.map((courier, idx) => (
                                    <label
                                        key={idx}
                                        className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${selectedCourier?.service_type === courier.service_type
                                            ? 'border-black bg-gray-50'
                                            : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="courier"
                                                className="w-4 h-4 accent-black"
                                                checked={selectedCourier?.service_type === courier.service_type}
                                                onChange={() => setSelectedCourier(courier)}
                                            />
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{courier.courier_name} - {courier.service_type}</p>
                                                <p className="text-xs text-gray-500">Estimasi Tiba: {courier.etd}</p>
                                            </div>
                                        </div>
                                        <div className="font-bold text-gray-900">
                                            {formatCurrency(courier.cost)}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Kolom Kanan: Ringkasan Pesanan */}
                <div className="lg:col-span-4">
                    <div className="bg-white border border-gray-200 p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight border-b border-gray-200 pb-3">
                            Ringkasan Pesanan
                        </h2>

                        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                            {items.map((item) => (
                                <div key={item.cart_item_id} className="flex justify-between text-sm">
                                    <span className="text-gray-600 line-clamp-1 pr-4">
                                        {item.quantity}x {item.product.name}
                                    </span>
                                    <span className="font-semibold text-gray-900 whitespace-nowrap">
                                        {formatCurrency(Number(item.product.price) * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 border-t border-gray-200 pt-4 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal Produk</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Ongkos Kirim</span>
                                <span>{selectedCourier ? formatCurrency(selectedCourier.cost) : '-'}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-gray-900 mt-4 pt-4 mb-6">
                            <span className="font-bold text-gray-900">Total Tagihan</span>
                            <span className="text-xl font-extrabold text-gray-900">{formatCurrency(grandTotal)}</span>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleCheckout}
                            disabled={!selectedCourier || isSubmitting}
                            className="w-full bg-black text-white px-6 py-4 font-bold text-sm uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'Memproses...' : 'Buat Pesanan'}
                        </button>
                    </div>
                </div>

            </div>
        </main>
    );
}
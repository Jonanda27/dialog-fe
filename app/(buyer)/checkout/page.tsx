'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { OrderService } from '@/services/api/order.service';
import { ShippingService } from '@/services/api/shipping.service';
import AddressForm from '@/components/checkout/AddressForm';
import CourierSelector from '@/components/checkout/CourierSelector';
import OrderSummary from '@/components/checkout/OrderSummary';
import { toast } from 'sonner';
import { CourierOption } from '@/types/shipping';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, clearCart } = useCartStore();

    // State Management
    const [address, setAddress] = useState('');
    // ⚡ BARU: Menambahkan state spesifik untuk Kode Pos sesuai kebutuhan arsitektur logistik
    const [postalCode, setPostalCode] = useState('');

    const [couriers, setCouriers] = useState<CourierOption[]>([]);
    const [selectedCourier, setSelectedCourier] = useState<CourierOption | null>(null);

    // Status UI
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Proteksi: Jika keranjang kosong, kembalikan ke katalog
    useEffect(() => {
        if (items.length === 0) {
            router.replace('/katalog');
        }
    }, [items, router]);

    if (items.length === 0) return null;

    // 1. Kalkulasi Financial Dasar
    const subtotal = items.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);

    // 2. Business Rule: Hitung Grading Fee (Flat Rp25.000 per produk yang di-request grading)
    const gradingFeeTotal = items.reduce((acc, item) => {
        const needsGrading = (item.product.metadata as any)?.request_grading === true;
        return needsGrading ? acc + 25000 : acc;
    }, 0);

    // 3. Handler: Hitung Ongkos Kirim via API Biteship
    const handleCalculateShipping = async () => {
        if (address.trim().length < 10) {
            toast.error('Alamat terlalu pendek untuk kalkulasi ongkir');
            return;
        }

        // ⚡ BARU: Validasi kode pos sebelum request ke Backend
        if (!postalCode || postalCode.trim().length < 5) {
            toast.error('Kode Pos wajib diisi dengan benar untuk akurasi perhitungan pengiriman.');
            return;
        }

        setIsCalculating(true);
        try {
            // Karena aplikasi menggunakan Single Store Rule (1 transaksi = 1 toko), 
            // kita bisa mengambil store_id dari produk pertama di keranjang.
            const currentStoreId = items[0]?.product?.store_id;

            if (!currentStoreId) {
                toast.error('Terjadi anomali data: ID Toko tidak ditemukan pada produk.');
                setIsCalculating(false);
                return;
            }

            // ⚡ PERBAIKAN DTO: Menyesuaikan payload dengan skema Backend yang baru
            const payload = {
                store_id: currentStoreId,
                destination_postal_code: postalCode,
                items: items.map((i) => ({
                    name: i.product.name,
                    price: Number(i.product.price),
                    quantity: i.quantity,
                    // Mengambil berat dari metadata, dengan fallback 500gr jika kosong
                    weight: Number((i.product.metadata as any)?.weight || 500)
                }))
            };

            const response = await ShippingService.calculateCost(payload);
            setCouriers(response.data);
            setSelectedCourier(null); // Reset pilihan kurir jika alamat/kodepos berubah
            toast.success('Opsi kurir berhasil dimuat');
        } catch (error: any) {
            // Tangkap pesan error yang dilemparkan oleh backend (termasuk validasi toko belum setting kodepos)
            toast.error(error.response?.data?.message || error.message || 'Gagal mengambil data kurir');
        } finally {
            setIsCalculating(false);
        }
    };

    // 4. Handler: Konfirmasi Pesanan & Eksekusi Checkout (Jalur Uang)
    const handleConfirmPayment = async () => {
        if (!address || !selectedCourier) {
            toast.error('Mohon lengkapi alamat dan pilih metode pengiriman');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                items: items.map(i => ({
                    product_id: i.product.id,
                    qty: i.quantity
                })),
                // Gabungkan alamat lengkap dengan kode pos untuk disimpan di database Order
                shipping_address: `${address}, Kode Pos: ${postalCode}`,
                shipping_fee: selectedCourier.cost,
                grading_fee: gradingFeeTotal
            };

            const response = await OrderService.checkout(payload);

            toast.success('Pesanan berhasil dibuat! Silakan lakukan pembayaran.');
            clearCart();

            router.push(`/pembayaran/${response.data.order_id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || 'Terjadi kesalahan saat memproses pesanan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 pt-8 pb-24">
            <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Kolom Kiri: Form Alamat & Pengiriman */}
                <div className="lg:col-span-8 space-y-6">
                    <AddressForm
                        address={address}
                        setAddress={setAddress}
                        // ⚡ BARU: Mengirimkan state postalCode ke komponen AddressForm
                        postalCode={postalCode}
                        setPostalCode={setPostalCode}
                        onCalculateShipping={handleCalculateShipping}
                        isCalculating={isCalculating}
                    />

                    <CourierSelector
                        couriers={couriers}
                        selectedCourier={selectedCourier}
                        onSelectCourier={setSelectedCourier}
                    />
                </div>

                {/* Kolom Kanan: Ringkasan & Eksekusi */}
                <div className="lg:col-span-4">
                    <OrderSummary
                        items={items}
                        subtotal={subtotal}
                        shippingFee={selectedCourier?.cost || 0}
                        gradingFee={gradingFeeTotal}
                        isSubmitting={isSubmitting}
                        onConfirm={handleConfirmPayment}
                    />
                </div>

            </div>
        </main>
    );
}
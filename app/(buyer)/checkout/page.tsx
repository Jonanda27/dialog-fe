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

    // 3. Handler: Hitung Ongkos Kirim via API
    const handleCalculateShipping = async () => {
        if (address.trim().length < 10) {
            toast.error('Alamat terlalu pendek untuk kalkulasi ongkir');
            return;
        }

        setIsCalculating(true);
        try {
            // Simulasi Origin dari data toko produk pertama (Single Store Rule)
            const response = await ShippingService.calculateCost({
                origin: 'KOTA-ASAL', 
                destination: address,
                weight: items.length * 500 // Estimasi 500gr per item
            });
            setCouriers(response.data);
            setSelectedCourier(null); // Reset pilihan kurir jika alamat berubah
            toast.success('Opsi kurir berhasil dimuat');
        } catch (error: any) {
            toast.error(error.message || 'Gagal mengambil data kurir');
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
                shipping_address: address,
                shipping_fee: selectedCourier.cost,
                grading_fee: gradingFeeTotal 
            };

            const response = await OrderService.checkout(payload);

            toast.success('Pesanan berhasil dibuat! Silakan lakukan pembayaran.');
            clearCart(); // Bersihkan keranjang belanja
            
            // Redirect ke halaman instruksi pembayaran
            router.push(`/pembayaran/${response.data.order_id}`);
        } catch (error: any) {
            // Menangkap error seperti stok habis (overselling) dari backend
            toast.error(error.message || 'Terjadi kesalahan saat memproses pesanan.');
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
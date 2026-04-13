'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckoutFlow } from '@/hooks/useCheckoutFlow';
import AddressForm from '@/components/checkout/AddressForm';
import CourierSelector from '@/components/checkout/CourierSelector';
import OrderSummary from '@/components/checkout/OrderSummary';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const router = useRouter();

    // 1. Injeksi Controller (Custom Hook)
    const {
        cartItems,
        subtotal,
        draftCheckout,
        isCalculatingShipping,
        shippingOptions,
        shippingError,
        isSubmitting,
        checkoutError,
        handleAddressChange,
        handleCourierSelection,
        submitOrder
    } = useCheckoutFlow();

    // 2. Local State khusus untuk kontrol input form alamat (sebelum di-submit ke hook)
    const [localAddress, setLocalAddress] = useState(draftCheckout.shipping_address || '');

    // 3. Proteksi Route: Redirect jika keranjang kosong
    useEffect(() => {
        if (cartItems.length === 0) {
            router.replace('/katalog');
        }
    }, [cartItems, router]);

    // 4. Listener untuk Error dari Hook Logic
    useEffect(() => {
        if (shippingError) toast.error(shippingError);
        if (checkoutError) toast.error(checkoutError);
    }, [shippingError, checkoutError]);

    if (cartItems.length === 0) return null;

    // 5. Business Rule UI: Kalkulasi Grading Fee (Jika ada item yang request grading)
    const gradingFeeTotal = cartItems.reduce((acc, item) => {
        const needsGrading = (item.product.metadata as any)?.request_grading === true;
        return needsGrading ? acc + 25000 : acc;
    }, 0);

    // 6. UI Handlers
    const onCalculateShippingClick = async () => {
        if (localAddress.trim().length < 10) {
            toast.error('Alamat terlalu pendek untuk kalkulasi ongkir');
            return;
        }
        // Memicu action di hook yang akan mengubah draftCheckout dan memanggil API kurir
        await handleAddressChange(localAddress);
        toast.success('Kalkulasi ongkos kirim berhasil diperbarui');
    };

    const onConfirmPaymentClick = async () => {
        if (!draftCheckout.shipping_address || !draftCheckout.courier_code) {
            toast.error('Mohon lengkapi alamat dan pilih metode pengiriman');
            return;
        }

        try {
            // Catatan Analis: Eksekusi murni di-handle oleh hook. 
            // Routing ke halaman pembayaran sudah diatur di dalam try-block `submitOrder` di hook.
            await submitOrder();
            toast.success('Pesanan berhasil dibuat! Mengarahkan ke pembayaran...');
        } catch (error) {
            // Error handling spesifik sudah di-cover oleh useEffect (checkoutError) di atas
            console.error("Gagal memproses checkout", error);
        }
    };

    // Re-konstruksi objek kurir yang terpilih untuk dilempar ke komponen CourierSelector
    const selectedCourierObject = shippingOptions.find(
        (c) => c.courier_code === draftCheckout.courier_code && c.service_type === draftCheckout.service_type
    ) || null;

    return (
        <main className="min-h-screen bg-gray-50 pt-8 pb-24">
            <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Kolom Kiri: Form Alamat & Pengiriman */}
                <div className="lg:col-span-8 space-y-6">
                    <AddressForm
                        address={localAddress}
                        setAddress={setLocalAddress}
                        onCalculateShipping={onCalculateShippingClick}
                        isCalculating={isCalculatingShipping}
                    />

                    <CourierSelector
                        couriers={shippingOptions}
                        selectedCourier={selectedCourierObject}
                        onSelectCourier={handleCourierSelection}
                    />
                </div>

                {/* Kolom Kanan: Ringkasan & Eksekusi */}
                <div className="lg:col-span-4">
                    <OrderSummary
                        items={cartItems}
                        subtotal={subtotal}
                        shippingFee={draftCheckout.shipping_fee || 0}
                        gradingFee={gradingFeeTotal}
                        isSubmitting={isSubmitting}
                        onConfirm={onConfirmPaymentClick}
                    />
                </div>

            </div>
        </main>
    );
}
// File: dialog-fe/hooks/useCheckoutFlow.ts

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useOrderStore } from '../store/orderStore';
import { useCartStore } from '../store/cartStore';
import { ShippingService } from '../services/api/shipping.service';
import { CourierOption } from '../types/shipping';
import { CheckoutPayload } from '../types/order';
import { ApiError } from '../types/api';

export const useCheckoutFlow = () => {
    const router = useRouter();

    // -- STORE BINDINGS --
    const { items: cartItems, clearCartAfterCheckout } = useCartStore();
    const {
        draftCheckout,
        setDraftCheckout,
        checkout,
        isSubmitting,
        error: checkoutError,
        clearError
    } = useOrderStore();

    // -- LOCAL UI STATE --
    const [shippingOptions, setShippingOptions] = useState<CourierOption[]>([]);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState<boolean>(false);
    const [shippingError, setShippingError] = useState<string | null>(null);

    // -- COMPUTED PROPERTIES (Business Logic) --

    // 1. Menghitung Subtotal Harga Item
    const subtotal = useMemo(() => {
        return cartItems.reduce((total, item) => total + (Number(item.product.price) * item.quantity), 0);
    }, [cartItems]);

    // 2. Menghitung Total Berat (Krusial untuk API Logistik)
    const totalWeight = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const itemWeight = (item.product as any).weight || 1000;
            return total + (itemWeight * item.quantity);
        }, 0);
    }, [cartItems]);

    // 3. Grand Total Dinamis
    const grandTotal = useMemo(() => {
        const fee = draftCheckout.shipping_fee || 0;
        return subtotal + fee;
    }, [subtotal, draftCheckout.shipping_fee]);


    // -- ACTIONS / CONTROLLERS --

    /**
     * Memperbarui Alamat dan otomatis memicu kalkulasi ongkir.
     */
    const handleAddressChange = useCallback(async (destinationAddress: string) => {
        // 1. Simpan alamat ke Draft
        setDraftCheckout({ shipping_address: destinationAddress });

        if (!destinationAddress || cartItems.length === 0) return;

        // 2. Ambil ID asal dari produk pertama
        const originId = cartItems[0].product.store_id;

        // 3. Panggil Layanan Kalkulasi Ongkir
        setIsCalculatingShipping(true);
        setShippingError(null);
        setShippingOptions([]);

        try {
            const response = await ShippingService.calculateCost({
                origin: originId,
                destination: destinationAddress,
                weight: totalWeight
            });
            setShippingOptions(response.data);
        } catch (error: any) {
            const err = error as ApiError;
            setShippingError(err.message || 'Gagal mengkalkulasi ongkos kirim. Periksa kembali alamat Anda.');
        } finally {
            setIsCalculatingShipping(false);
        }
    }, [cartItems, totalWeight, setDraftCheckout]);

    /**
     * Menyimpan pilihan kurir ke dalam Draft Store.
     */
    const handleCourierSelection = useCallback((option: CourierOption) => {
        setDraftCheckout({
            courier_code: option.courier_code,
            service_type: option.service_type,
            shipping_fee: option.cost
        });
    }, [setDraftCheckout]);

    /**
     * Eksekusi Final Checkout (Submit ke Backend).
     */
    const submitOrder = useCallback(async () => {
        // ⚡ PERBAIKAN: Destructuring untuk Type Narrowing yang akurat
        const { shipping_address, courier_code, service_type, shipping_fee } = draftCheckout;

        // 1. Pre-condition Assertions
        if (cartItems.length === 0) {
            throw new Error('Keranjang belanja kosong.');
        }
        if (!shipping_address) {
            throw new Error('Pilih alamat pengiriman terlebih dahulu.');
        }

        // Memvalidasi semua properti kurir secara eksplisit agar TypeScript tahu nilainya pasti ada
        if (!courier_code || !service_type || shipping_fee === undefined) {
            throw new Error('Pilih kurir pengiriman terlebih dahulu.');
        }

        clearError();

        // 2. Data Mapping (Sekarang TypeScript tahu variabel di bawah ini bertipe strict string & number)
        const payload: CheckoutPayload = {
            items: cartItems.map(item => ({
                product_id: item.product.id,
                qty: item.quantity
            })),
            shipping_address,
            courier_code,
            service_type,
            shipping_fee
        };

        // 3. Eksekusi Mutasi
        try {
            const newOrderId = await checkout(payload);

            // 4. Post-condition Actions
            clearCartAfterCheckout();
            router.push(`/pembayaran/${newOrderId}`);

        } catch (error) {
            console.error('Checkout failed:', error);
            throw error;
        }
    }, [cartItems, draftCheckout, checkout, clearCartAfterCheckout, router, clearError]);


    // -- EXPOSE API TO UI COMPONENTS --
    return {
        cartItems,
        subtotal,
        totalWeight,
        grandTotal,
        draftCheckout,
        isCalculatingShipping,
        shippingOptions,
        shippingError,
        isSubmitting,
        checkoutError,
        handleAddressChange,
        handleCourierSelection,
        submitOrder
    };
};
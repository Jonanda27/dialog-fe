'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { OrderService } from '@/services/api/order.service';
import { addressService } from '@/services/api/address.service';
import { AddressForm } from '@/components/checkout/AddressForm';
import { CourierSelector } from '@/components/checkout/CourierSelector';
import OrderSummary from '@/components/checkout/OrderSummary';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

// Import Types yang 100% tersinkronisasi
import { CourierOption, ShippingItemPayload } from '@/types/shipping';
import { Address } from '@/types/address';
import { CheckoutPayload } from '@/types/order';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, clearCart, syncCartItems } = useCartStore();

    // --- STATE MANAGEMENT AUTO-HEALING (TAHAP 3) ---
    const [isSyncing, setIsSyncing] = useState(true);
    const [showSyncWarning, setShowSyncWarning] = useState(false);

    // --- STATE MANAGEMENT ALAMAT & KURIR ---
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isAddingAddress, setIsAddingAddress] = useState(false);

    const [selectedCourier, setSelectedCourier] = useState<CourierOption | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ⚡ PRE-FLIGHT CHECK: Sinkronisasi data lokal vs server saat halaman dimuat
    useEffect(() => {
        const runPreFlight = async () => {
            setIsSyncing(true);
            const hasChanges = await syncCartItems();
            if (hasChanges) {
                setShowSyncWarning(true);
            }
            setIsSyncing(false);
        };

        if (items.length > 0) {
            runPreFlight();
        } else {
            setIsSyncing(false);
        }
    }, [syncCartItems, items.length]);

    // Ambil daftar alamat milik user
    const fetchMyAddresses = async () => {
        try {
            const data = await addressService.getMyAddresses();
            setAddresses(data);

            // Auto-select alamat utama (primary) jika ada
            if (data.length > 0 && !selectedAddressId) {
                const primaryAddress = data.find(a => a.is_primary) || data[0];
                setSelectedAddressId(primaryAddress.id as string);
            }
        } catch (error) {
            console.error('Gagal memuat alamat:', error);
        }
    };

    // Jalankan fetch alamat hanya jika pre-flight check sudah selesai
    useEffect(() => {
        if (!isSyncing) {
            fetchMyAddresses();
        }
    }, [isSyncing]);

    // Proteksi: Jika keranjang kosong, kembalikan ke katalog
    useEffect(() => {
        if (!isSyncing && items.length === 0) {
            router.replace('/katalog');
        }
    }, [items.length, isSyncing, router]);

    if (items.length === 0) return null;

    // ⚡ SKELETON LOADING UI: Mencegah lonjakan visual saat data sedang disinkronkan
    if (isSyncing) {
        return (
            <div className="container mx-auto p-8 space-y-4 animate-pulse pt-16">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-4">
                        <div className="h-32 bg-gray-200 rounded-xl"></div>
                        <div className="h-60 bg-gray-200 rounded-xl"></div>
                    </div>
                    <div className="lg:col-span-4 h-80 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    // --- KALKULASI & MAPPING DATA ---

    // Karena sistem 1 Transaksi = 1 Toko, kita ambil ID toko dari produk pertama
    const currentStoreId = items[0]?.product?.store_id as string;

    const subtotal = items.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);

    const gradingFeeTotal = items.reduce((acc, item) => {
        const needsGrading = (item.product.metadata as any)?.request_grading === true;
        return needsGrading ? acc + 25000 : acc;
    }, 0);

    // Mapping item keranjang menjadi payload khusus kalkulasi logistik (Biteship)
    const shippingItems: ShippingItemPayload[] = items.map(i => ({
        name: i.product.name,
        price: Number(i.product.price),
        weight: Number((i.product.metadata as any)?.weight || i.product.product_weight || 500),
        quantity: i.quantity
    }));

    // --- HANDLERS ---

    // Handler ketika penambahan alamat baru berhasil via form
    const handleAddressAdded = () => {
        setIsAddingAddress(false);
        fetchMyAddresses();
        toast.success('Alamat berhasil ditambahkan.');
    };

    // Handler Konfirmasi Pesanan
    const handleConfirmPayment = async () => {
        if (!selectedAddressId || !selectedCourier) {
            toast.error('Mohon pastikan alamat dan metode pengiriman telah dipilih.');
            return;
        }

        setIsSubmitting(true);
        try {
            // ⚡ Payload SINKRON 100% dengan CheckoutPayload Interface
            const payload: CheckoutPayload = {
                address_id: selectedAddressId,
                store_id: currentStoreId,
                items: items.map(i => ({
                    product_id: i.product.id as string,
                    qty: i.quantity
                })),
                shipping_fee: selectedCourier.price,
                courier_code: selectedCourier.courier_company,
                service_type: selectedCourier.service_type,
            };

            const response = await OrderService.checkout(payload);

            toast.success('Pesanan berhasil dibuat! Mengalihkan ke pembayaran...');
            clearCart();
            router.push(`/pembayaran/${response.data.order_id}`);
        } catch (error: any) {
            // ⚡ TAHAP 4: CATCH FLAG AUTO-REFRESH DARI BACKEND
            if (error.response?.data?.action === 'REFRESH_SHIPPING') {
                toast.error('Harga ongkos kirim dari kurir telah berubah. Memuat ulang opsi pengiriman...');
                setSelectedCourier(null); // Force reset kurir agar User memilih ulang
            } else {
                toast.error(error.response?.data?.message || error.message || 'Terjadi kesalahan saat memproses pesanan.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 pt-8 pb-24 text-gray-900">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* ⚡ LUXURY WARNING BANNER */}
                {showSyncWarning && (
                    <div className="mb-6 flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-orange-800 uppercase tracking-wider">Perhatian: Penyesuaian Data</h4>
                            <p className="text-xs text-orange-700 mt-0.5">Beberapa item di keranjang Anda mengalami perubahan harga atau stok. Kami telah memperbarui rincian belanja Anda agar sesuai dengan data terbaru di toko.</p>
                        </div>
                        <button
                            onClick={() => setShowSyncWarning(false)}
                            className="ml-auto text-orange-500 hover:text-orange-700 text-xs font-bold transition-colors"
                        >
                            MENGERTI
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Kolom Kiri: Manajemen Alamat & Kurir */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* SECTION 1: PEMILIHAN ALAMAT */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Alamat Pengiriman</h2>
                                {!isAddingAddress && (
                                    <button
                                        onClick={() => setIsAddingAddress(true)}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        + Tambah Alamat Baru
                                    </button>
                                )}
                            </div>

                            {isAddingAddress ? (
                                <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                                    <AddressForm onSuccess={handleAddressAdded} />
                                    <button
                                        onClick={() => setIsAddingAddress(false)}
                                        className="mt-4 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        Batalkan
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.length > 0 ? (
                                        <select
                                            className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
                                            value={selectedAddressId || ''}
                                            onChange={(e) => setSelectedAddressId(e.target.value)}
                                        >
                                            <option value="" disabled>Pilih Alamat Tersimpan</option>
                                            {addresses.map((addr) => (
                                                <option key={addr.id} value={addr.id as string}>
                                                    {addr.label} - {addr.recipient_name} ({addr.district}, {addr.city})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="p-4 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
                                            <p className="text-sm text-gray-500">Belum ada alamat yang tersimpan.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* SECTION 2: PEMILIHAN KURIR (Kalkulasi Otomatis) */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Metode Pengiriman</h2>
                            <CourierSelector
                                addressId={selectedAddressId}
                                storeId={currentStoreId}
                                items={shippingItems}
                                onSelect={setSelectedCourier}
                            />
                        </div>

                    </div>

                    {/* Kolom Kanan: Ringkasan & Eksekusi */}
                    <div className="lg:col-span-4">
                        <OrderSummary
                            items={items}
                            subtotal={subtotal}
                            shippingFee={selectedCourier?.price || 0}
                            gradingFee={gradingFeeTotal}
                            isSubmitting={isSubmitting}
                            onConfirm={handleConfirmPayment}
                        />
                    </div>

                </div>
            </div>
        </main>
    );
}
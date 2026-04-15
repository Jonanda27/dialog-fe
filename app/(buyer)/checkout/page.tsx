'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { OrderService } from '@/services/api/order.service';
import { addressService } from '@/services/api/address.service';
import { AddressForm } from '@/components/checkout/AddressForm';
import { CourierSelector } from '@/components/checkout/CourierSelector';
import OrderSummary from '@/components/checkout/OrderSummary';
import { toast } from 'sonner';
import { AlertCircle, Store } from 'lucide-react';

// Import Types
import { CourierOption } from '@/types/shipping';
import { Address } from '@/types/address';
import { CartItem } from '@/types/cart';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, clearCart, syncCartItems } = useCartStore();

    // --- STATE MANAGEMENT ---
    const [isSyncing, setIsSyncing] = useState(true);
    const [showSyncWarning, setShowSyncWarning] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ⚡ STATE MULTI-KURIR: Menyimpan pilihan kurir per Store ID
    // Bentuknya: { "store-uuid-abc": CourierOption }
    const [selectedCouriers, setSelectedCouriers] = useState<Record<string, CourierOption>>({});

    // --- LOGIKA GROUPING (PENGELOMPOKAN BARANG PER TOKO) ---
    const groupedItems = useMemo(() => {
        const groups: Record<string, CartItem[]> = {};
        items.forEach((item) => {
            const storeId = item.product.store_id;
            if (!groups[storeId]) {
                groups[storeId] = [];
            }
            groups[storeId].push(item);
        });
        return groups;
    }, [items]);

    const storeIds = useMemo(() => Object.keys(groupedItems), [groupedItems]);

    // --- PENGHITUNGAN TOTAL ---
    const subtotal = useMemo(() =>
        items.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0)
        , [items]);

    // Total ongkir adalah gabungan harga kurir dari semua toko yang dipilih
    const totalShippingFee = useMemo(() =>
        Object.values(selectedCouriers).reduce((acc, courier) => acc + courier.price, 0)
        , [selectedCouriers]);

    const gradingFeeTotal = useMemo(() =>
        items.reduce((acc, item) => {
            const needsGrading = (item.product.metadata as any)?.request_grading === true;
            return needsGrading ? acc + 25000 : acc;
        }, 0)
        , [items]);

    // --- EFFECTS ---
    useEffect(() => {
        const runPreFlight = async () => {
            setIsSyncing(true);
            const hasChanges = await syncCartItems();
            if (hasChanges) setShowSyncWarning(true);
            setIsSyncing(false);
        };
        if (items.length > 0) runPreFlight();
        else setIsSyncing(false);
    }, [syncCartItems, items.length]);

    const fetchMyAddresses = async () => {
        try {
            const response = await addressService.getMyAddresses();
            setAddresses(response || []);
            if (response.length > 0 && !selectedAddressId) {
                const primaryAddress = response.find(a => a.is_primary) || response[0];
                setSelectedAddressId(primaryAddress.id as string);
            }
        } catch (error) {
            console.error('Gagal memuat alamat:', error);
        }
    };

    useEffect(() => {
        if (!isSyncing) fetchMyAddresses();
    }, [isSyncing]);

    useEffect(() => {
        if (!isSyncing && items.length === 0) router.replace('/katalog');
    }, [items.length, isSyncing, router]);

    // --- HANDLERS ---
    const handleAddressAdded = () => {
        setIsAddingAddress(false);
        fetchMyAddresses();
        toast.success('Alamat berhasil ditambahkan.');
    };

    // Handler untuk mengupdate kurir pada toko tertentu
    const handleCourierSelect = (storeId: string, courier: CourierOption) => {
        setSelectedCouriers(prev => ({
            ...prev,
            [storeId]: courier
        }));
    };

    const handleConfirmPayment = async () => {
        // Validasi: Pastikan semua toko sudah dipilihkan kurirnya
        const allStoresSelected = storeIds.every(id => !!selectedCouriers[id]);

        if (!selectedAddressId || !allStoresSelected) {
            toast.error('Mohon pilih alamat dan kurir untuk SETIAP toko.');
            return;
        }

        setIsSubmitting(true);
        try {
            // ⚡ PROSES CHECKOUT MULTI-ORDER ⚡
            // Jika backend Anda menerima array pesanan, kirim sekaligus. 
            // Jika backend Anda per-toko, kita bisa looping (namun idealnya Backend menangani Split Order).

            // Asumsi: Backend menghandle checkout per satu transaksi (looping di FE atau satu payload array)
            // Di sini kita buat payload untuk transaksi pertama sebagai contoh (atau sesuaikan dengan API Split Order Anda)

            // Contoh payload jika API menerima banyak toko sekaligus:
            const payload = {
                address_id: selectedAddressId,
                // Kita kirim rincian per toko ke backend
                orders: storeIds.map(sid => ({
                    store_id: sid,
                    items: groupedItems[sid].map(i => ({ product_id: i.product.id, qty: i.quantity })),
                    courier_code: selectedCouriers[sid].courier_company,
                    service_type: selectedCouriers[sid].service_type,
                    shipping_fee: selectedCouriers[sid].price
                }))
            };

            // Untuk saat ini, kita ikuti interface lama Anda tapi dengan data toko pertama
            // (Anda perlu menyesuaikan OrderService.checkout agar menerima array orders jika ingin benar-benar split)
            const response = await OrderService.checkout({
                address_id: selectedAddressId,
                store_id: storeIds[0], // Temporary fallback
                items: items.map(i => ({ product_id: i.product.id as string, qty: i.quantity })),
                shipping_fee: totalShippingFee,
                courier_code: selectedCouriers[storeIds[0]].courier_company,
                service_type: selectedCouriers[storeIds[0]].service_type,
            });

            toast.success('Pesanan berhasil dibuat!');
            clearCart();
            router.push(`/pembayaran/${response.data.order_id}`);
        } catch (error: any) {
            if (error.response?.data?.action === 'REFRESH_SHIPPING') {
                toast.error('Harga ongkos kirim berubah. Memuat ulang...');
                setSelectedCouriers({});
            } else {
                toast.error(error.response?.data?.message || 'Gagal memproses pesanan.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) return null;
    if (isSyncing) return <div className="p-20 text-center animate-pulse">Menyiapkan Checkout...</div>;

    return (
        <main className="min-h-screen bg-gray-50 pt-8 pb-24 text-gray-900">
            <div className="container mx-auto px-4 max-w-6xl">

                {showSyncWarning && (
                    <div className="mb-6 flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-2xl shadow-sm">
                        <AlertCircle className="text-orange-600" />
                        <p className="text-sm text-orange-700 font-medium">Beberapa harga atau stok item telah diperbarui otomatis sesuai data terbaru.</p>
                        <button onClick={() => setShowSyncWarning(false)} className="ml-auto text-orange-500 font-bold text-xs">OK</button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">

                        {/* SECTION 1: ALAMAT */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold">Alamat Pengiriman</h2>
                                {!isAddingAddress && (
                                    <button onClick={() => setIsAddingAddress(true)} className="text-sm font-bold text-blue-600">+ Tambah</button>
                                )}
                            </div>
                            {isAddingAddress ? (
                                <AddressForm onSuccess={handleAddressAdded} />
                            ) : (
                                <select
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                    value={selectedAddressId || ''}
                                    onChange={(e) => setSelectedAddressId(e.target.value)}
                                >
                                    <option value="">Pilih Alamat</option>
                                    {addresses.map(addr => (
                                        <option key={addr.id} value={addr.id}>{addr.label} - {addr.recipient_name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* SECTION 2: PENGIRIMAN PER TOKO (SPLIT ORDER) */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold px-2">Daftar Pesanan</h2>
                            {storeIds.map((storeId) => (
                                <div key={storeId} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    {/* Header Toko */}
                                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                                        <Store size={16} className="text-gray-400" />
                                        <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">
                                            {groupedItems[storeId][0].product.store?.name || 'Toko Kolektor'}
                                        </span>
                                    </div>

                                    {/* Item dari Toko Ini */}
                                    <div className="p-6 space-y-4">
                                        {groupedItems[storeId].map((item) => (
                                            <div key={item.cart_item_id} className="flex gap-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-md shrink-0" />
                                                <div>
                                                    <p className="text-sm font-semibold">{item.product.name}</p>
                                                    <p className="text-xs text-gray-500">{item.quantity} pcs x Rp {Number(item.product.price).toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pilih Kurir Khusus Toko Ini */}
                                        <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Opsi Pengiriman Toko Ini:</p>
                                            <CourierSelector
                                                addressId={selectedAddressId}
                                                storeId={storeId}
                                                items={groupedItems[storeId].map(i => ({
                                                    name: i.product.name,
                                                    price: Number(i.product.price),
                                                    weight: Number(i.product.product_weight || 500),
                                                    quantity: i.quantity
                                                }))}
                                                onSelect={(courier) => handleCourierSelect(storeId, courier)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <OrderSummary
                            items={items}
                            subtotal={subtotal}
                            shippingFee={totalShippingFee}
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
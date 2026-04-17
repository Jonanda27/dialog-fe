'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { OrderService } from '@/services/api/order.service';
import { addressService } from '@/services/api/address.service';
import { AddressForm } from '@/components/checkout/AddressForm';
import { CourierSelector } from '@/components/checkout/CourierSelector';
import OrderSummary from '@/components/checkout/OrderSummary';
import { toast } from 'sonner';
import { AlertCircle, Store, MapPin, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

// Import Types
import { CourierOption } from '@/types/shipping';
import { Address } from '@/types/address';
import { CartItem } from '@/types/cart';

// Helper Format Image
const formatImageUrl = (path: string | undefined) => {
    if (!path) return 'https://placehold.co/400x400?text=No+Image';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000/${path.replace(/^\/+/, '')}`;
};

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // isMounted untuk menunggu Zustand hydrate data dari storage
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);
    
    // Tarik state dari store satu per satu
    const storeItems = useCartStore((state: any) => state.items || []);
    const clearCart = useCartStore((state: any) => state.clearCart);
    const syncCartItems = useCartStore((state: any) => state.syncCartItems);
    const removeItem = useCartStore((state: any) => state.removeItem);

    // Ambil parameter '?selected=1,2,3' dari URL untuk filter
    const selectedIds = useMemo(() => {
        const param = searchParams.get('selected');
        if (!param) return [];
        return param.split(',').map(String); 
    }, [searchParams]);

    // Filter items: HANYA TAMPILKAN yang diceklis dari CartPage
    const items = useMemo(() => {
        if (selectedIds.length === 0) return storeItems; // Fallback jika tidak ada param
        return storeItems.filter((item: CartItem) => selectedIds.includes(String(item.cart_item_id)));
    }, [storeItems, selectedIds]);

    // --- STATE MANAGEMENT ---
    const [isSyncing, setIsSyncing] = useState(true);
    const [showSyncWarning, setShowSyncWarning] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // STATE MULTI-KURIR
    const [selectedCouriers, setSelectedCouriers] = useState<Record<string, CourierOption>>({});

    // --- LOGIKA GROUPING LEBIH ROBUST ---
    const groupedItems = useMemo(() => {
        const groups: Record<string, CartItem[]> = {};
        items.forEach((item: CartItem) => {
            // Memastikan produk dengan toko yang sama terkelompok sempurna
            const storeId = item.product.store_id || (item.product.store?.id) || 'default-store';
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
        items.reduce((acc: number, item: CartItem) => acc + (Number(item.product.price) * item.quantity), 0)
        , [items]);

    const totalShippingFee = useMemo(() =>
        Object.values(selectedCouriers).reduce((acc, courier) => acc + courier.price, 0)
        , [selectedCouriers]);

    const gradingFeeTotal = useMemo(() =>
        items.reduce((acc: number, item: CartItem) => {
            const needsGrading = (item.product.metadata as any)?.request_grading === true;
            return needsGrading ? acc + 25000 : acc;
        }, 0)
        , [items]);

    // --- EFFECTS ---
    useEffect(() => {
        if (!isMounted) return; 

        const runPreFlight = async () => {
            setIsSyncing(true);
            const hasChanges = await syncCartItems();
            if (hasChanges) setShowSyncWarning(true);
            setIsSyncing(false);
        };
        
        if (storeItems.length > 0) runPreFlight();
        else setIsSyncing(false);
    }, [syncCartItems, storeItems.length, isMounted]);

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
        if (isMounted && !isSyncing) fetchMyAddresses();
    }, [isSyncing, isMounted]);

    useEffect(() => {
        if (isMounted && !isSyncing && items.length === 0) {
            router.replace('/katalog');
        }
    }, [items.length, isSyncing, router, isMounted]);

    // --- HANDLERS ---
    const handleAddressAdded = () => {
        setIsAddingAddress(false);
        fetchMyAddresses();
        toast.success('Alamat berhasil ditambahkan.');
    };

    const handleCourierSelect = (storeId: string, courier: CourierOption) => {
        setSelectedCouriers(prev => ({
            ...prev,
            [storeId]: courier
        }));
    };

    /**
     * ⚡ INTEGRASI BARU: handleConfirmPayment
     * Melakukan Single Hit API untuk semua toko sekaligus.
     */
    const handleConfirmPayment = async () => {
        const allStoresSelected = storeIds.every(id => !!selectedCouriers[id]);

        if (!selectedAddressId || !allStoresSelected) {
            toast.error('Mohon pilih alamat dan kurir untuk SETIAP toko.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Merakit Payload Multi-Toko sesuai skema Backend baru
            const checkoutPayload: any = {
                address_id: selectedAddressId,
                orders: storeIds.map((storeId) => ({
                    store_id: storeId,
                    courier_code: selectedCouriers[storeId].courier_company,
                    service_type: selectedCouriers[storeId].service_type,
                    shipping_fee: selectedCouriers[storeId].price,
                    items: groupedItems[storeId].map((i: CartItem) => ({ 
                        product_id: i.product.id as string, 
                        qty: i.quantity 
                    })),
                    // Opsional: kirim grading_fee jika dihitung per toko
                    grading_fee: groupedItems[storeId].reduce((acc, i) => {
                        const needsGrading = (i.product.metadata as any)?.request_grading === true;
                        return needsGrading ? acc + 25000 : acc;
                    }, 0)
                }))
            };

            // HIT API HANYA 1 KALI
            const response = await OrderService.checkout(checkoutPayload);

            toast.success('Pesanan berhasil dibuat!');
            
            // Hapus HANYA item yang berhasil di-checkout dari keranjang global
            if (selectedIds.length > 0 && removeItem) {
                selectedIds.forEach((id: string) => removeItem(Number(id)));
            } else {
                clearCart();
            }

            // Ambil ID Billing atau ID Master Order untuk diarahkan ke pembayaran
            const resultData = response.data as any;
            const paymentId = resultData?.billing_id || resultData?.order_id || resultData?.id;
            
            router.push(`/pembayaran/${paymentId}`);

        } catch (error: any) {
            if (error.response?.data?.action === 'REFRESH_SHIPPING') {
                toast.error('Harga ongkos kirim berubah. Memuat ulang...');
                setSelectedCouriers({});
            } else {
                const errorMsg = error.response?.data?.message || 'Gagal memproses pesanan.';
                toast.error(`Checkout gagal: ${errorMsg}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading State Mencegah Layout Berkedip
    if (!isMounted || isSyncing) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] pt-32 pb-24 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-zinc-800 border-t-[#ef3333] rounded-full animate-spin"></div>
            </div>
        );
    }
    
    if (items.length === 0) return null; 

    return (
        <main className="min-h-screen bg-[#0a0a0b] pt-24 pb-32 text-zinc-200 font-sans">
            <div className="w-full px-2 sm:px-4 md:px-8 mx-auto">
                
                {/* HEADER */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
                            <Link href="/cart" className="hover:text-white transition-colors">Cart</Link>
                            <ChevronRight size={12} />
                            <span className="text-[#ef3333]">Checkout</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
                            Secure Checkout
                        </h1>
                    </div>
                </div>

                {showSyncWarning && (
                    <div className="mb-8 flex items-center gap-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl shadow-sm">
                        <AlertCircle className="text-orange-500 shrink-0" size={20} />
                        <p className="text-sm text-orange-200 font-medium flex-1">Beberapa harga atau stok item telah diperbarui otomatis sesuai data terbaru.</p>
                        <button onClick={() => setShowSyncWarning(false)} className="text-orange-400 font-bold text-xs uppercase tracking-widest hover:text-orange-300">Tutup</button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* SECTION 1: ALAMAT */}
                        <div className="bg-[#111114] p-6 md:p-8 rounded-[2rem] border border-zinc-800 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ef3333] to-orange-500"></div>
                            
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    <MapPin className="text-[#ef3333]" size={20} /> Alamat Pengiriman
                                </h2>
                                {!isAddingAddress ? (
                                    <button onClick={() => setIsAddingAddress(true)} className="text-xs font-bold text-[#ef3333] uppercase tracking-widest hover:text-red-400 transition-colors">
                                        + Tambah Baru
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setIsAddingAddress(false)} 
                                        className="p-1.5 text-zinc-400 hover:text-[#ef3333] hover:bg-[#ef3333]/10 rounded-full transition-all"
                                        title="Batal Tambah Alamat"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                            
                            {isAddingAddress ? (
                                <AddressForm onSuccess={handleAddressAdded} />
                            ) : (
                                <div className="relative">
                                    <select
                                        className="w-full p-4 bg-[#1a1a1e] border border-zinc-800 rounded-xl outline-none text-sm text-white appearance-none focus:border-[#ef3333] focus:ring-1 focus:ring-[#ef3333] transition-all cursor-pointer"
                                        value={selectedAddressId || ''}
                                        onChange={(e) => setSelectedAddressId(e.target.value)}
                                    >
                                        <option value="" disabled className="text-zinc-500">Pilih Alamat Tersimpan</option>
                                        {addresses.map(addr => (
                                            <option key={addr.id} value={addr.id}>{addr.label} - {addr.recipient_name} ({addr.address_detail})</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                        <ChevronRight size={16} className="rotate-90" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SECTION 2: PENGIRIMAN PER TOKO (SPLIT ORDER) */}
                        <div className="space-y-6">
                            <h2 className="text-sm font-black text-zinc-500 px-2 uppercase tracking-[0.2em]">Rincian Pesanan</h2>
                            
                            {storeIds.map((storeId) => (
                                <div key={storeId} className="bg-[#111114] rounded-[2rem] border border-zinc-800 shadow-lg overflow-hidden">
                                    <div className="bg-zinc-900/50 px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
                                        <Store size={18} className="text-[#ef3333]" />
                                        <span className="text-sm font-black text-white uppercase tracking-widest">
                                            {groupedItems[storeId][0].product.store?.name || 'Toko Kolektor'}
                                        </span>
                                    </div>

                                    <div className="p-6 md:p-8 space-y-6">
                                        {groupedItems[storeId].map((item: CartItem) => (
                                            <div key={item.cart_item_id} className="flex gap-4 items-center">
                                                <div className="w-16 h-16 bg-zinc-900 rounded-xl shrink-0 border border-zinc-800 overflow-hidden">
                                                    <img 
                                                        src={formatImageUrl(item.product.media?.find(m => m.is_primary)?.media_url)} 
                                                        className="w-full h-full object-cover" 
                                                        alt={item.product.name}
                                                        onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image'}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-white line-clamp-1">{item.product.name}</p>
                                                    <p className="text-xs font-medium text-zinc-500 mt-1 uppercase tracking-widest">
                                                        {item.quantity} pcs <span className="lowercase mx-1">x</span> Rp {Number(item.product.price).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0 hidden sm:block">
                                                    <p className="text-sm font-black text-white">Rp {(Number(item.product.price) * item.quantity).toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="mt-8 pt-8 border-t border-zinc-800">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Opsi Pengiriman Toko Ini:</p>
                                            <CourierSelector
                                                addressId={selectedAddressId}
                                                storeId={storeId}
                                                items={groupedItems[storeId].map((i: CartItem) => ({
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

                    {/* RIGHT COLUMN */}
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

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0b] pt-32 pb-24 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-zinc-800 border-t-[#ef3333] rounded-full animate-spin"></div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
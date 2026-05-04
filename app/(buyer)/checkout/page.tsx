// File: app/(buyer)/checkout/page.tsx
'use client';

import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore'; 
import { OrderService } from '@/services/api/order.service';
import { addressService } from '@/services/api/address.service';
import { AddressForm } from '@/components/checkout/AddressForm';
import { CourierSelector } from '@/components/checkout/CourierSelector';
import OrderSummary from '@/components/checkout/OrderSummary';
import { toast } from 'sonner';
import { AlertCircle, Store, MapPin, ChevronRight, X, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Import Types
import { CourierOption } from '@/types/shipping';
import { Address } from '@/types/address';
import { CartItem } from '@/types/cart';

// ⚡ HELPER FORMAT IMAGE: Mengarahkan ke server backend port 5000 folder public
const formatImageUrl = (path: string | undefined) => {
    if (!path) return 'https://placehold.co/400x400?text=No+Image';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\/+/, '');
    return `http://localhost:5000/public/${cleanPath}`;
};

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, isInitialized: authInitialized } = useAuthStore();
    
    const [isMounted, setIsMounted] = useState(false);
    
    // Zustand Store
    const storeItems = useCartStore((state) => state.items || []);
    const fetchCart = useCartStore((state) => state.fetchCart);
    const isLoadingCart = useCartStore((state) => state.isLoading);
    const syncCartItems = useCartStore((state) => state.syncCartItems);
    const removeItem = useCartStore((state) => state.removeItem);

    // Local UI State
    const [isSyncing, setIsSyncing] = useState(true);
    const [showSyncWarning, setShowSyncWarning] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCouriers, setSelectedCouriers] = useState<Record<string, CourierOption>>({});

    // ⚡ FIX LOOPING: Pengunci inisialisasi agar tidak hit API berulang kali
    const hasInitialized = useRef(false);

    // 1. Inisialisasi Data (Sequential)
    useEffect(() => {
        setIsMounted(true);
        
        const initCheckout = async () => {
            if (hasInitialized.current || !authInitialized || !isAuthenticated) return;
            hasInitialized.current = true; 

            try {
                // A. Ambil data keranjang dari database (yang sudah include Store & Media) [cite: 1, 2]
                await fetchCart();
                
                // B. Ambil alamat
                const addrResponse = await addressService.getMyAddresses();
                setAddresses(addrResponse || []);
                if (addrResponse?.length > 0) {
                    const primaryAddress = addrResponse.find(a => a.is_primary) || addrResponse[0];
                    setSelectedAddressId(primaryAddress.id as string);
                }

                // C. Sinkronisasi stok/harga terbaru
                const currentItems = useCartStore.getState().items;
                if (currentItems.length > 0) {
                    const hasChanges = await syncCartItems();
                    if (hasChanges) setShowSyncWarning(true);
                }
            } catch (error) {
                console.error("Initialization error:", error);
            } finally {
                setIsSyncing(false);
            }
        };

        initCheckout();
    }, [authInitialized, isAuthenticated, fetchCart, syncCartItems]);

    // 2. Filter item berdasarkan pilihan di halaman keranjang sebelumnya
    const selectedIds = useMemo(() => {
        const param = searchParams.get('selected');
        if (!param) return [];
        return param.split(',').map(String); 
    }, [searchParams]);

    const items = useMemo(() => {
        if (selectedIds.length === 0) return storeItems;
        return storeItems.filter((item: CartItem) => selectedIds.includes(String(item.id)));
    }, [storeItems, selectedIds]);

    // 3. Redirect Guard
    useEffect(() => {
        if (isMounted && !isSyncing && !isLoadingCart && items.length === 0) {
            router.replace('/cart');
        }
    }, [items.length, isSyncing, isLoadingCart, isMounted, router]);

    // 4. Grouping: Mengelompokkan item berdasarkan Toko untuk Multi-Store Shipping
    const groupedItems = useMemo(() => {
        const groups: Record<string, CartItem[]> = {};
        items.forEach((item: CartItem) => {
            const storeId = item.product?.store_id || 'default-store';
            if (!groups[storeId]) {
                groups[storeId] = [];
            }
            groups[storeId].push(item);
        });
        return groups;
    }, [items]);

    const storeIds = useMemo(() => Object.keys(groupedItems), [groupedItems]);

    // 5. Kalkulasi Finansial
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

    const handleAddressAdded = async () => {
        setIsAddingAddress(false);
        const addrResponse = await addressService.getMyAddresses();
        setAddresses(addrResponse || []);
    };

    const handleCourierSelect = (storeId: string, courier: CourierOption) => {
        setSelectedCouriers(prev => ({
            ...prev,
            [storeId]: courier
        }));
    };

    const handleConfirmPayment = async () => {
        const allStoresSelected = storeIds.every(id => !!selectedCouriers[id]);

        if (!selectedAddressId || !allStoresSelected) {
            toast.error('Mohon pilih alamat dan kurir untuk SETIAP toko.');
            return;
        }

        setIsSubmitting(true);
        try {
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
                    grading_fee: groupedItems[storeId].reduce((acc, i) => {
                        const needsGrading = (i.product.metadata as any)?.request_grading === true;
                        return needsGrading ? acc + 25000 : acc;
                    }, 0)
                }))
            };

            const response = await OrderService.checkout(checkoutPayload);
            toast.success('Pesanan berhasil dibuat!');
            
            // Hapus item dari database cart setelah checkout sukses
            for (const item of items) {
                await removeItem(item.id);
            }

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

    if (!isMounted || isLoadingCart || isSyncing) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] pt-32 pb-24 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-[#ef3333] animate-spin" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Menyiapkan Data...</p>
            </div>
        );
    }
    
    return (
        <main className="min-h-screen bg-[#0a0a0b] pt-24 pb-32 text-zinc-200 font-sans">
            <div className="w-full px-2 sm:px-4 md:px-8 mx-auto">
                
                {/* HEADER BREADCRUMB */}
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
                        <p className="text-sm text-orange-200 font-medium flex-1">Beberapa data produk telah diperbarui otomatis.</p>
                        <button onClick={() => setShowSyncWarning(false)} className="text-orange-400 font-bold text-xs uppercase tracking-widest hover:text-orange-300">Tutup</button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
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
                                    <button onClick={() => setIsAddingAddress(false)} className="p-1.5 text-zinc-400 hover:text-[#ef3333] hover:bg-[#ef3333]/10 rounded-full transition-all">
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                    
                            {isAddingAddress ? (
                                <AddressForm onSuccess={handleAddressAdded} />
                            ) : (
                                <div className="relative">
                                    <select
                                        className="w-full p-4 bg-[#1a1a1e] border border-zinc-800 rounded-xl outline-none text-sm text-white appearance-none focus:border-[#ef3333] transition-all cursor-pointer"
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

                        {/* SECTION 2: RINCIAN PESANAN PER TOKO */}
                        <div className="space-y-6">
                            <h2 className="text-sm font-black text-zinc-500 px-2 uppercase tracking-[0.2em]">Rincian Pesanan</h2>
                            
                            {storeIds.map((storeId) => {
                                // ⚡ AMBIL NAMA TOKO DARI ITEM PERTAMA DI GRUP INI
                                const storeName = groupedItems[storeId][0]?.product?.store?.name || 'Toko Kolektor';

                                return (
                                    <div key={storeId} className="bg-[#111114] rounded-[2rem] border border-zinc-800 shadow-lg overflow-hidden">
                                        <div className="bg-zinc-900/50 px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
                                            <Store size={18} className="text-[#ef3333]" />
                                            <span className="text-sm font-black text-white uppercase tracking-widest">
                                                {storeName}
                                            </span>
                                        </div>

                                        <div className="p-6 md:p-8 space-y-6">
                                            {groupedItems[storeId].map((item: CartItem) => {
                                                const itemNeedsGrading = (item.product.metadata as any)?.request_grading === true;
                                                // ⚡ AMBIL GAMBAR DARI MEDIA PERTAMA (PRIMARY)
                                                const primaryImage = item.product?.media?.find((m: any) => m.is_primary)?.media_url || item.product?.media?.[0]?.media_url;

                                                return (
                                                    <div key={item.id} className="space-y-3">
                                                        <div className="flex gap-4 items-center">
                                                            <div className="w-16 h-16 bg-zinc-900 rounded-xl shrink-0 border border-zinc-800 overflow-hidden">
                                                                <img 
                                                                    src={formatImageUrl(primaryImage)} 
                                                                    className="w-full h-full object-cover" 
                                                                    alt={item.product.name}
                                                                    onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image'}
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-bold text-white line-clamp-1 uppercase">{item.product.name}</p>
                                                                <p className="text-xs font-medium text-zinc-500 mt-1 uppercase tracking-widest">
                                                                    {item.quantity} pcs <span className="lowercase mx-1">x</span> Rp {Number(item.product.price).toLocaleString('id-ID')}
                                                                </p>
                                                            </div>
                                                            <div className="text-right shrink-0 hidden sm:block">
                                                                <p className="text-sm font-black text-white">Rp {(Number(item.product.price) * item.quantity).toLocaleString('id-ID')}</p>
                                                            </div>
                                                        </div>

                                                        {itemNeedsGrading && (
                                                            <div className="ml-20 flex items-center gap-2 py-1.5 px-3 bg-blue-500/10 border border-blue-500/20 rounded-lg w-fit">
                                                                <ShieldCheck size={14} className="text-blue-400" />
                                                                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-tight">
                                                                    Premium Verification (Grading): Rp 25.000
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}

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
                                );
                            })}
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
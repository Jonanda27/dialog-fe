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

// ⚡ HELPER FORMAT IMAGE
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

    const hasInitialized = useRef(false);

    useEffect(() => {
        setIsMounted(true);
        const initCheckout = async () => {
            if (hasInitialized.current || !authInitialized || !isAuthenticated) return;
            hasInitialized.current = true; 

            try {
                await fetchCart();
                const addrResponse = await addressService.getMyAddresses();
                setAddresses(addrResponse || []);
                if (addrResponse?.length > 0) {
                    const primaryAddress = addrResponse.find(a => a.is_primary) || addrResponse[0];
                    setSelectedAddressId(primaryAddress.id as string);
                }
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

    const selectedIds = useMemo(() => {
        const param = searchParams.get('selected');
        if (!param) return [];
        return param.split(',').map(String); 
    }, [searchParams]);

    const items = useMemo(() => {
        if (selectedIds.length === 0) return storeItems;
        return storeItems.filter((item: CartItem) => selectedIds.includes(String(item.id)));
    }, [storeItems, selectedIds]);

    useEffect(() => {
        if (isMounted && !isSyncing && !isLoadingCart && items.length === 0) {
            router.replace('/cart');
        }
    }, [items.length, isSyncing, isLoadingCart, isMounted, router]);

    const groupedItems = useMemo(() => {
        const groups: Record<string, CartItem[]> = {};
        items.forEach((item: CartItem) => {
            const storeId = item.product?.store_id || 'default-store';
            if (!groups[storeId]) groups[storeId] = [];
            groups[storeId].push(item);
        });
        return groups;
    }, [items]);

    const storeIds = useMemo(() => Object.keys(groupedItems), [groupedItems]);

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
        setSelectedCouriers(prev => ({ ...prev, [storeId]: courier }));
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
            for (const item of items) { await removeItem(item.id); }
            const resultData = response.data as any;
            const paymentId = resultData?.billing_id || resultData?.order_id || resultData?.id;
            router.push(`/pembayaran/${paymentId}`);
        } catch (error: any) {
            if (error.response?.data?.action === 'REFRESH_SHIPPING') {
                toast.error('Harga ongkos kirim berubah. Memuat ulang...');
                setSelectedCouriers({});
            } else {
                toast.error(`Checkout gagal: ${error.response?.data?.message || 'Gagal memproses pesanan.'}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted || isLoadingCart || isSyncing) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-12 h-12 text-[#ef3333] animate-spin mb-4" />
                <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Initializing Security Protocol...</p>
            </div>
        );
    }
    
    return (
        <main className="min-h-screen bg-[#0a0a0b] pb-32 text-zinc-200 selection:bg-[#ef3333] selection:text-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* BREADCRUMB & TITLE */}
                <div className="mb-8 md:mb-12">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 overflow-x-auto no-scrollbar whitespace-nowrap">
                        <Link href="/cart" className="hover:text-white transition-colors">Cart</Link>
                        <ChevronRight size={10} className="shrink-0" />
                        <span className="text-[#ef3333]">Secure Checkout</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase  leading-none">
                        Final <span className="text-[#ef3333]">Review</span>
                    </h1>
                </div>

                {showSyncWarning && (
                    <div className="mb-8 flex items-start sm:items-center gap-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                        <AlertCircle className="text-orange-500 shrink-0" size={20} />
                        <p className="text-xs md:text-sm text-orange-200 font-bold uppercase tracking-tight flex-1">Data produk telah disinkronkan dengan stok terbaru.</p>
                        <button onClick={() => setShowSyncWarning(false)} className="text-orange-400 font-black text-[10px] uppercase hover:text-white">Close</button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: FORMS */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* ADDRESS SECTION */}
                        <div className="bg-[#111114] p-5 md:p-8 rounded-[2rem] border border-zinc-800 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#ef3333] to-orange-600"></div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <h2 className="text-base md:text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3 ">
                                    <MapPin className="text-[#ef3333]" size={22} /> Delivery Destination
                                </h2>
                                {!isAddingAddress ? (
                                    <button onClick={() => setIsAddingAddress(true)} className="px-4 py-2 bg-white/5 hover:bg-[#ef3333]/10 border border-zinc-800 hover:border-[#ef3333]/30 rounded-full text-[10px] font-black text-white uppercase tracking-widest transition-all">
                                        + Add New Address
                                    </button>
                                ) : (
                                    <button onClick={() => setIsAddingAddress(false)} className="p-2 text-zinc-500 hover:text-white transition-all">
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                    
                            {isAddingAddress ? (
                                <AddressForm onSuccess={handleAddressAdded} />
                            ) : (
                                <div className="relative group">
                                    <select
                                        className="w-full p-4 md:p-5 bg-[#1a1a1e] border border-zinc-800 group-hover:border-zinc-700 rounded-2xl outline-none text-sm font-bold text-white appearance-none focus:border-[#ef3333] transition-all cursor-pointer shadow-inner"
                                        value={selectedAddressId || ''}
                                        onChange={(e) => setSelectedAddressId(e.target.value)}
                                    >
                                        <option value="" disabled>Select saved address...</option>
                                        {addresses.map(addr => (
                                            <option key={addr.id} value={addr.id}>
                                                [{addr.label.toUpperCase()}] {addr.recipient_name} — {addr.address_detail.substring(0, 40)}...
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-[#ef3333] transition-colors">
                                        <ChevronRight size={18} className="rotate-90" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ORDERS PER STORE */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 px-2">
                                <div className="h-px flex-1 bg-zinc-900"></div>
                                <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Crate Contents</h2>
                                <div className="h-px flex-1 bg-zinc-900"></div>
                            </div>
                            
                            {storeIds.map((storeId) => {
                                const storeName = groupedItems[storeId][0]?.product?.store?.name || 'Authorized Dealer';
                                return (
                                    <div key={storeId} className="bg-[#111114] rounded-[2.5rem] border border-zinc-900 shadow-xl overflow-hidden group">
                                        <div className="bg-zinc-900/50 px-6 md:px-8 py-5 border-b border-zinc-800/50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Store size={18} className="text-[#ef3333]" />
                                                <span className="text-xs md:text-sm font-black text-white uppercase tracking-widest ">{storeName}</span>
                                            </div>
                                            <div className="hidden sm:block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Verified Merchant</span>
                                            </div>
                                        </div>

                                        <div className="p-6 md:p-8 space-y-8">
                                            {/* ITEM LIST */}
                                            <div className="space-y-6">
                                                {groupedItems[storeId].map((item: CartItem) => {
                                                    const itemNeedsGrading = (item.product.metadata as any)?.request_grading === true;
                                                    const primaryImage = item.product?.media?.find((m: any) => m.is_primary)?.media_url || item.product?.media?.[0]?.media_url;

                                                    return (
                                                        <div key={item.id} className="flex flex-col sm:flex-row gap-5">
                                                            <div className="w-full sm:w-24 h-48 sm:h-24 bg-zinc-900 rounded-2xl shrink-0 border border-zinc-800 overflow-hidden shadow-lg">
                                                                <img 
                                                                    src={formatImageUrl(primaryImage)} 
                                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                                                    alt={item.product.name}
                                                                    onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image'}
                                                                />
                                                            </div>
                                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                                <div>
                                                                    <p className="text-sm md:text-base font-black text-white uppercase tracking-tight leading-tight mb-1">{item.product.name}</p>
                                                                    <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                                                        {item.quantity} Unit(s) <span className="text-zinc-800 mx-2">|</span> Rp {Number(item.product.price).toLocaleString('id-ID')} / unit
                                                                    </p>
                                                                </div>
                                                                
                                                                {itemNeedsGrading && (
                                                                    <div className="mt-3 flex items-center gap-2 py-1.5 px-3 bg-blue-500/10 border border-blue-500/20 rounded-lg w-fit">
                                                                        <ShieldCheck size={14} className="text-blue-400" />
                                                                        <span className="text-[9px] font-black text-blue-300 uppercase tracking-tight">Premium Verification Active</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="sm:text-right pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-900 flex justify-between sm:block">
                                                                <span className="sm:hidden text-[10px] font-black text-zinc-600 uppercase">Subtotal</span>
                                                                <p className="text-base md:text-lg font-black text-white ">
                                                                    Rp {(Number(item.product.price) * item.quantity).toLocaleString('id-ID')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* SHIPPING SELECTOR */}
                                            <div className="mt-8 pt-8 border-t border-zinc-800/50">
                                                <div className="flex items-center gap-2 mb-5">
                                                    <div className="w-1 h-4 bg-[#ef3333] rounded-full"></div>
                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Logistic Provider</p>
                                                </div>
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

                    {/* RIGHT COLUMN: ORDER SUMMARY */}
                    <div className="lg:col-span-4 lg:sticky lg:top-28">
                        <div className="relative">
                            {/* Decorative element for summary */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ef3333]/5 blur-[80px] rounded-full pointer-events-none"></div>
                            
                            <OrderSummary
                                items={items}
                                subtotal={subtotal}
                                shippingFee={totalShippingFee}
                                gradingFee={gradingFeeTotal} 
                                isSubmitting={isSubmitting}
                                onConfirm={handleConfirmPayment}
                            />
                            
                            {/* TRUST BADGE */}
                            <div className="mt-6 p-6 bg-[#111114] border border-zinc-900 rounded-[2rem] flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0">
                                    <ShieldCheck className="text-emerald-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Secure Escrow</p>
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase leading-relaxed">Funds are held safely until you confirm receipt of goods.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </main>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#ef3333] animate-spin" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
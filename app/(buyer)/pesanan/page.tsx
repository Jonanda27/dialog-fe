'use client';

import { useEffect, useState } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { toIDR } from '@/utils/format';
import { OrderStatus } from '@/types/order';
import Image from 'next/image';
import Link from 'next/link';

const TABS: { label: string; value: OrderStatus | 'all' }[] = [
    { label: 'Semua', value: 'all' },
    { label: 'Belum Bayar', value: 'pending_payment' },
    { label: 'Diproses', value: 'processing' },
    { label: 'Dikirim', value: 'shipped' },
    { label: 'Selesai', value: 'completed' },
];

export default function MyOrdersPage() {
    const { buyerOrders, isLoading, fetchBuyerOrders } = useOrderStore();
    const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');

    useEffect(() => {
        fetchBuyerOrders(activeTab === 'all' ? undefined : activeTab);
    }, [activeTab, fetchBuyerOrders]);

    return (
        <main className="min-h-screen bg-white pt-12 pb-24">
            <div className="max-w-5xl mx-auto px-4">
                <h1 className="text-3xl font-black tracking-tighter uppercase mb-8">Riwayat Pesanan</h1>

                {/* Tab Filter */}
                <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar mb-8">
                    {TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${activeTab === tab.value ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* List Pesanan */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="py-20 text-center text-gray-400 animate-pulse uppercase text-xs font-bold tracking-widest">Memuat Pesanan...</div>
                    ) : buyerOrders.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-gray-100 text-gray-400 uppercase text-xs font-bold tracking-widest">Tidak ada pesanan ditemukan</div>
                    ) : (
                        buyerOrders.map((order) => (
                            <Link
                                href={`/pesanan/${order.id}`}
                                key={order.id}
                                className="block border border-gray-200 p-6 hover:border-black transition-colors group"
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex gap-4">
                                        <div className="relative w-24 h-24 bg-gray-50 flex-shrink-0">
                                            <Image
                                                src={order.items?.[0]?.product?.media?.[0]?.media_url || '/vynil.png'}
                                                alt="Product"
                                                fill
                                                className="object-cover grayscale group-hover:grayscale-0 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-tighter">ID: {order.id.slice(0, 8)}</p>
                                            <h3 className="text-sm font-bold uppercase mb-1">{order.items?.[0]?.product?.name || 'Produk Analog'}</h3>
                                            <p className="text-xs text-gray-500 uppercase">{order.items?.length || 0} Item • {order.status.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <div className="md:text-right flex flex-col justify-center border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Total Belanja</p>
                                        <p className="text-lg font-black">{toIDR(order.grand_total)}</p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
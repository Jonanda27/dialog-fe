'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Package, CheckCircle2 } from 'lucide-react';
import { shippingService } from '@/services/api/shipping.service';
import { CourierRate, ShippingItemPayload } from '@/types/shipping';

interface CourierSelectorProps {
    addressId: string | null;
    storeId: string;
    items: ShippingItemPayload[];
    onSelect: (rate: CourierRate) => void;
}

export const CourierSelector: React.FC<CourierSelectorProps> = ({ addressId, storeId, items, onSelect }) => {
    const [rates, setRates] = useState<CourierRate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRateId, setSelectedRateId] = useState<string | null>(null);

    useEffect(() => {
        const fetchRates = async () => {
            if (!addressId || !storeId || items.length === 0) return;

            setIsLoading(true);
            setError(null);
            setSelectedRateId(null); // Reset selection saat alamat berubah

            try {
                const data = await shippingService.getRates({ address_id: addressId, store_id: storeId, items });
                setRates(data);
            } catch (err: any) {
                setError(err.message || 'Gagal memuat opsi pengiriman.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRates();
    }, [addressId, storeId, items]);

    const handleSelect = (rate: CourierRate) => {
        // Membuat ID unik sementara untuk state seleksi UI
        const rateId = `${rate.courier_company}-${rate.service_type}`;
        setSelectedRateId(rateId);
        onSelect(rate);
    };

    if (!addressId) {
        return (
            <div className="p-6 border border-zinc-800 bg-zinc-900/30 rounded-xl text-center">
                <Package className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-400">Pilih alamat pengiriman untuk melihat ongkos kirim.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-20 bg-zinc-900 animate-pulse rounded-xl border border-zinc-800"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-sm text-red-400 bg-red-950/20 border border-red-900/50 rounded-xl">{error}</div>;
    }

    return (
        <div className="space-y-3">
            {rates.length > 0 ? (
                rates.map((rate, index) => {
                    const rateId = `${rate.courier_company}-${rate.service_type}`;
                    const isSelected = selectedRateId === rateId;

                    return (
                        <label
                            key={index}
                            className={`flex items-center justify-between p-4 cursor-pointer rounded-xl border transition-all duration-200 ${isSelected
                                ? 'border-white bg-zinc-900 ring-1 ring-white'
                                : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <input
                                    type="radio"
                                    name="courier"
                                    className="sr-only"
                                    onChange={() => handleSelect(rate)}
                                    checked={isSelected}
                                />
                                <div className={`flex items-center justify-center h-5 w-5 rounded-full border ${isSelected ? 'border-transparent' : 'border-zinc-600'}`}>
                                    {isSelected && <CheckCircle2 className="h-5 w-5 text-white" />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                                        {rate.courier_name}
                                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-zinc-800 text-zinc-300">
                                            {rate.service_name}
                                        </span>
                                    </h4>
                                    <p className="text-xs text-zinc-500 mt-1">Estimasi tiba: {rate.estimated_delivery}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-bold text-zinc-100">
                                    Rp {rate.price.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </label>
                    );
                })
            ) : (
                <div className="p-4 text-sm text-zinc-500 text-center border border-zinc-800 rounded-xl">
                    Tidak ada layanan pengiriman yang tersedia untuk rute ini.
                </div>
            )}
        </div>
    );
};
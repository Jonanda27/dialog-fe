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

    // ⚡ PERBAIKAN: Ubah items menjadi string JSON untuk dependency useEffect.
    // Ini mencegah infinite loop atau reset state 'selectedRateId' saat parent component (CheckoutPage) 
    // melakukan re-render dan mengirimkan array 'items' dengan referensi yang baru.
    const itemsJson = JSON.stringify(items);

    useEffect(() => {
        const fetchRates = async () => {
            // Gunakan JSON.parse untuk mengembalikan array yang dikirim
            const parsedItems = JSON.parse(itemsJson);

            if (!addressId || !storeId || parsedItems.length === 0) return;

            setIsLoading(true);
            setError(null);
            
            // Hanya mereset pilihan saat alamat/toko/isi produk benar-benar berubah
            setSelectedRateId(null); 

            try {
                const data = await shippingService.getRates({ 
                    address_id: addressId, 
                    store_id: storeId, 
                    items: parsedItems 
                });
                setRates(data);
            } catch (err: any) {
                setError(err.message || 'Gagal memuat opsi pengiriman.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRates();
    }, [addressId, storeId, itemsJson]); // Gunakan itemsJson, bukan items

    const handleSelect = (rate: CourierRate) => {
        const rateId = `${rate.courier_company}-${rate.service_type}`;
        setSelectedRateId(rateId);
        onSelect(rate);
    };

    if (!addressId) {
        return (
            <div className="p-8 border border-zinc-800 border-dashed bg-zinc-900/30 rounded-2xl text-center">
                <Package className="h-8 w-8 text-zinc-600 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Pilih alamat untuk melihat kurir.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-20 bg-[#1a1a1e] animate-pulse rounded-xl border border-zinc-800"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-xs font-bold text-[#ef3333] uppercase tracking-widest bg-red-950/20 border border-red-900/30 rounded-xl text-center">{error}</div>;
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
                            className={`flex items-center justify-between p-4 md:p-5 cursor-pointer rounded-xl border transition-all duration-300 ${isSelected
                                ? 'border-[#ef3333] bg-[#ef3333]/5 ring-1 ring-[#ef3333] shadow-[0_0_15px_rgba(239,51,51,0.1)]'
                                : 'border-zinc-800 bg-[#1a1a1e] hover:border-zinc-600'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <input
                                    type="radio"
                                    name={`courier-${storeId}`} // Pastikan terisolasi per toko
                                    className="sr-only"
                                    onChange={() => handleSelect(rate)}
                                    checked={isSelected}
                                />
                                <div className={`flex items-center justify-center h-5 w-5 rounded-full border transition-colors ${isSelected ? 'border-transparent' : 'border-zinc-600'}`}>
                                    {isSelected && <CheckCircle2 className="h-5 w-5 text-[#ef3333]" />}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-tight">
                                        {rate.courier_name}
                                        <span className="px-2 py-0.5 rounded-md text-[9px] uppercase font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                                            {rate.service_name}
                                        </span>
                                    </h4>
                                    <p className="text-[11px] font-medium text-zinc-500 mt-1 uppercase tracking-widest">Estimasi: {rate.estimated_delivery}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-black italic text-[#ef3333]">
                                    Rp {rate.price.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </label>
                    );
                })
            ) : (
                <div className="p-6 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center border border-zinc-800 rounded-xl bg-[#1a1a1e]">
                    Tidak ada kurir tersedia untuk rute ini.
                </div>
            )}
        </div>
    );
};
'use client';

import { CourierOption } from '@/types/shipping';
import { toIDR } from '@/utils/format';

interface CourierSelectorProps {
    couriers: CourierOption[];
    selectedCourier: CourierOption | null;
    onSelectCourier: (courier: CourierOption) => void;
}

export default function CourierSelector({ couriers, selectedCourier, onSelectCourier }: CourierSelectorProps) {
    return (
        <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight uppercase">
                2. Metode Pengiriman
            </h2>

            {couriers.length === 0 ? (
                // State Kosong: Memberikan panduan sistem yang jelas kepada pengguna (User Guidance)
                <div className="bg-gray-50 border border-dashed border-gray-300 p-6 flex items-center justify-center text-center">
                    <p className="text-sm text-gray-500">
                        Silakan isi dan kalkulasi alamat pengiriman terlebih dahulu untuk melihat opsi logistik yang tersedia.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {couriers.map((courier) => {
                        // Evaluasi Logika Kuat: 
                        // Memastikan identitas kurir diverifikasi dari Kode Vendor dan Tipe Layanan.
                        // Menghindari bug ketika vendor berbeda memiliki nama layanan yang sama (misal: "REG").
                        const isSelected =
                            selectedCourier?.courier_code === courier.courier_code &&
                            selectedCourier?.service_type === courier.service_type;

                        // Identifier deterministik untuk optimalisasi Virtual DOM React dan aksesibilitas input label
                        const uniqueId = `courier-${courier.courier_code}-${courier.service_type}`;

                        return (
                            <label
                                key={uniqueId}
                                htmlFor={uniqueId}
                                className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${isSelected
                                    ? 'border-black bg-gray-50 ring-1 ring-black' // Penegasan visual state terpilih
                                    : 'border-gray-200 hover:border-gray-400'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <input
                                        id={uniqueId}
                                        type="radio"
                                        name="courier"
                                        className="w-4 h-4 accent-black text-black bg-gray-100 border-gray-300 focus:ring-black focus:ring-2"
                                        checked={isSelected}
                                        onChange={() => onSelectCourier(courier)}
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 uppercase flex items-center gap-2">
                                            {courier.courier_name}
                                            <span className="font-normal text-gray-500 text-xs border-l border-gray-300 pl-2">
                                                {courier.service_type}
                                            </span>
                                        </p>
                                        <p className="text-[11px] text-gray-500 uppercase mt-1 tracking-wide">
                                            Estimasi Tiba: <span className="font-semibold text-gray-700">{courier.etd}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-sm text-gray-900 tracking-tight">
                                        {toIDR(courier.cost)}
                                    </span>
                                </div>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
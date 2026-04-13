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
        <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight uppercase">2. Metode Pengiriman</h2>

            {couriers.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Masukkan alamat terlebih dahulu untuk melihat opsi kurir.</p>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {couriers.map((courier, idx) => (
                        <label
                            key={idx}
                            className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${selectedCourier?.service_type === courier.service_type
                                    ? 'border-black bg-gray-50'
                                    : 'border-gray-100 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="courier"
                                    className="accent-black"
                                    checked={selectedCourier?.service_type === courier.service_type}
                                    onChange={() => onSelectCourier(courier)}
                                />
                                <div>
                                    <p className="text-sm font-bold uppercase">{courier.courier_name} - {courier.service_type}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">Estimasi: {courier.etd}</p>
                                </div>
                            </div>
                            <span className="font-black text-sm">{toIDR(courier.cost)}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
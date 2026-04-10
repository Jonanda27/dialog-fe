'use client';

import { CourierOption } from '@/types/shipping';

interface CourierSelectorProps {
    couriers: CourierOption[];
    selectedCourier: CourierOption | null;
    onSelectCourier: (courier: CourierOption) => void;
}

export default function CourierSelector({ couriers, selectedCourier, onSelectCourier }: CourierSelectorProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">
                2. Metode Pengiriman
            </h2>

            {couriers.length === 0 ? (
                <div className="bg-gray-50 border border-dashed border-gray-300 p-6 text-center">
                    <p className="text-sm text-gray-500 font-medium">
                        Silakan isi alamat dan klik "Cek Ongkos Kirim" terlebih dahulu untuk melihat opsi kurir.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {couriers.map((courier, idx) => {
                        const isSelected = selectedCourier?.service_type === courier.service_type;

                        return (
                            <label
                                key={`${courier.courier_code}-${idx}`}
                                className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${isSelected
                                    ? 'border-black bg-gray-50 ring-1 ring-black'
                                    : 'border-gray-200 hover:border-gray-400 bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Custom Radio Button Styling */}
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-black' : 'border-gray-300'}`}>
                                        {isSelected && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                                    </div>

                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">
                                            {courier.courier_name} - {courier.service_type}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Estimasi Tiba: {courier.etd}
                                        </p>
                                    </div>
                                </div>
                                <div className="font-extrabold text-gray-900 text-sm md:text-base">
                                    {formatCurrency(courier.cost)}
                                </div>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
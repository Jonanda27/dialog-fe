'use client';

interface AddressFormProps {
    address: string;
    setAddress: (val: string) => void;
    onCalculateShipping?: () => void;
    isCalculating?: boolean;
}

export default function AddressForm({ address, setAddress, onCalculateShipping, isCalculating }: AddressFormProps) {
    // Business Rule: Minimal karakter untuk alamat yang valid
    const MIN_LENGTH = 10;
    const isAddressValid = address.trim().length >= MIN_LENGTH;

    return (
        <div className="bg-white border border-gray-200 p-6 rounded-sm shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight uppercase">
                1. Alamat Pengiriman
            </h2>

            <div className="relative">
                <textarea
                    className={`w-full border p-3 text-sm focus:outline-none min-h-[120px] resize-none transition-colors ${address.length > 0 && !isAddressValid
                        // Feedback visual jika user mulai mengetik tapi belum memenuhi syarat
                        ? 'border-red-300 focus:border-red-500 bg-red-50'
                        : 'border-gray-300 focus:border-black'
                        }`}
                    placeholder="Tulis alamat lengkap (Nama Jalan, RT/RW, Kec, Kota, Kode Pos)..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={isCalculating}
                />

                {/* Indikator Karakter Tersembunyi (Micro-interaction) */}
                <div className={`absolute bottom-3 right-3 text-xs ${isAddressValid ? 'text-green-600' : 'text-gray-400'}`}>
                    {address.length > 0 && (
                        <span>{address.length} / Min. {MIN_LENGTH} karakter</span>
                    )}
                </div>
            </div>

            {onCalculateShipping && (
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-xs text-gray-500">
                        *Pastikan alamat akurat. Ongkos kirim akan dikalkulasi berdasarkan alamat ini.
                    </p>
                    <button
                        onClick={onCalculateShipping}
                        disabled={isCalculating || !isAddressValid}
                        className="bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 transition-all flex items-center justify-center gap-2 min-w-[180px]"
                    >
                        {isCalculating ? (
                            <>
                                {/* Loading Spinner Sederhana */}
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                MENGHITUNG...
                            </>
                        ) : (
                            'CEK ONGKOS KIRIM'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
'use client';

interface AddressFormProps {
    address: string;
    setAddress: (val: string) => void;
    onCalculateShipping?: () => void; // Tambahan untuk memicu hitung ongkir
    isCalculating?: boolean;
}

export default function AddressForm({ address, setAddress, onCalculateShipping, isCalculating }: AddressFormProps) {
    return (
        <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight uppercase">1. Alamat Pengiriman</h2>
            <textarea
                className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black min-h-32 resize-none"
                placeholder="Tulis alamat lengkap (Nama Jalan, RT/RW, Kec, Kota, Kode Pos)..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            {onCalculateShipping && (
                <button
                    onClick={onCalculateShipping}
                    disabled={isCalculating || address.length < 10}
                    className="mt-4 bg-black text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                    {isCalculating ? 'Menghitung...' : 'Cek Ongkos Kirim'}
                </button>
            )}
        </div>
    );
}
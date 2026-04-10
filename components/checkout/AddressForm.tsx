'use client';

interface AddressFormProps {
    address: string;
    setAddress: (address: string) => void;
    onCalculateShipping: () => void;
    isCalculating: boolean;
}

export default function AddressForm({ address, setAddress, onCalculateShipping, isCalculating }: AddressFormProps) {
    // Validasi sederhana: Alamat harus cukup panjang agar akurat untuk API Logistik
    const isValidAddress = address.trim().length >= 10;

    return (
        <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">
                1. Alamat Pengiriman
            </h2>

            <p className="text-sm text-gray-500 mb-3">
                Mohon tulis alamat dengan lengkap (Jalan, RT/RW, Kecamatan, Kota/Kabupaten, Provinsi, Kode Pos) untuk akurasi ongkos kirim.
            </p>

            <textarea
                className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-black min-h-25 resize-y transition-colors"
                placeholder="Contoh: Jl. Braga No. 10, RT 01/02, Kec. Sumur Bandung, Kota Bandung, Jawa Barat 40111"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isCalculating}
            />

            <button
                onClick={onCalculateShipping}
                disabled={isCalculating || !isValidAddress}
                className="mt-4 bg-black text-white px-6 py-2.5 text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
                {isCalculating ? 'Menghitung...' : 'Cek Ongkos Kirim'}
            </button>
        </div>
    );
}
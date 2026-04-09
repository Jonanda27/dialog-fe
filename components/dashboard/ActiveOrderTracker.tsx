import Image from 'next/image';

export default function ActiveOrderTracker() {
    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Lacak Pesanan</h3>
                <button className="text-sm text-red-500 hover:text-red-400 font-medium">Lihat Semua</button>
            </div>

            {/* Item Pesanan */}
            <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/30">
                <div className="flex items-start gap-4 mb-5">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0">
                        <Image src="/vynil.png" alt="Product" fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-zinc-500 mb-1">Toko: <span className="text-zinc-300 font-medium">Vintage JKT Records</span></p>
                                <h4 className="text-white font-semibold line-clamp-1">The Dark Side of the Moon - Pink Floyd</h4>
                            </div>
                            <p className="text-sm font-bold text-white">Rp 850.000</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar Status */}
                <div className="relative pt-2">
                    <div className="flex justify-between text-xs font-semibold mb-2 text-zinc-500">
                        <span className="text-emerald-500">Dibayar</span>
                        <span className="text-emerald-500">Dikirim</span>
                        <span>Sampai</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                    <p className="text-xs text-zinc-400 mt-3 flex items-center gap-1">
                        <span className="text-blue-400">ℹ</span> Resi: JNE-9988776655 (Sedang dalam perjalanan ke Jakarta Pusat)
                    </p>
                </div>
            </div>
        </div>
    );
}
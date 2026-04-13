'use client';

export default function ShoppingSummary() {
    const summaries = [
        { title: 'Pesanan Aktif', value: '2', icon: '📦', color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { title: 'Keranjang', value: '4', icon: '🛒', color: 'text-zinc-100', bg: 'bg-zinc-800' },
        { title: 'Video Grading', value: '1', icon: '📼', color: 'text-red-400', bg: 'bg-red-400/10', alert: true },
        { title: 'Voucher', value: '3', icon: '🎟️', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summaries.map((item, idx) => (
                <div key={idx} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl hover:border-zinc-700 transition-colors relative">
                    {item.alert && (
                        <span className="absolute top-4 right-4 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${item.bg} ${item.color}`}>
                        <span className="text-xl">{item.icon}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{item.value}</p>
                    <p className="text-zinc-500 text-sm font-medium">{item.title}</p>
                </div>
            ))}
        </div>
    );
}
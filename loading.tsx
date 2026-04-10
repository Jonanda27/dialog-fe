export default function GlobalLoading() {
    return (
        <main className="min-h-screen bg-white flex flex-col justify-center items-center">
            {/* Animasi Flat Box Pulsing */}
            <div className="flex flex-col items-center gap-6">

                {/* Logo Analog.id Placeholder (Kotak Hitam) */}
                <div className="w-12 h-12 bg-black animate-pulse flex items-center justify-center">
                    <div className="w-3 h-3 bg-white animate-ping" />
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                        Memuat Analog.id
                    </h2>
                    <div className="flex justify-center gap-1">
                        <div className="w-2 h-2 bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>

            </div>
        </main>
    );
}
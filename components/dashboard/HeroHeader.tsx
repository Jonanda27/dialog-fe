import Link from 'next/link';

interface HeroHeaderProps {
    user?: any; // PERBAIKAN: Menambahkan '?' agar opsional bagi pengunjung yang belum login
}

export default function HeroHeader({ user }: HeroHeaderProps) {
    return (
        <div className="bg-black text-white py-16 px-4 md:px-8">
            <div className="container mx-auto flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                    Suara Analog, Sensasi Autentik.
                </h1>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-8">
                    Temukan ribuan piringan hitam, kaset pita, hingga audio gear vintage dengan grading terpercaya dari kolektor seluruh Indonesia.
                </p>
                <div className="flex space-x-4">
                    <Link
                        href="/katalog"
                        className="bg-white text-black px-6 py-3 font-bold hover:bg-gray-200 transition-colors"
                    >
                        Mulai Eksplorasi
                    </Link>
                    {!user && (
                        <Link
                            href="/auth/login"
                            className="bg-transparent border border-white text-white px-6 py-3 font-bold hover:bg-white hover:text-black transition-colors"
                        >
                            Masuk / Daftar
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
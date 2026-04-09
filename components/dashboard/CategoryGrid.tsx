import Link from 'next/link';

export default function CategoryGrid() {
    const categories = [
        { name: 'Vinyl', icon: '💿', link: '/katalog?format=Vinyl' },
        { name: 'Cassette', icon: '📼', link: '/katalog?format=Cassette' },
        { name: 'CD', icon: '💽', link: '/katalog?format=CD' },
        { name: 'Audio Gear', icon: '📻', link: '/katalog?format=Gear' },
    ];

    return (
        <div className="grid grid-cols-4 gap-3">
            {categories.map((cat, idx) => (
                <Link key={idx} href={cat.link} className="flex flex-col items-center justify-center p-4 bg-zinc-950 border border-zinc-800 hover:border-red-500/50 hover:bg-zinc-900 transition-all rounded-2xl group">
                    <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">{cat.name}</span>
                </Link>
            ))}
        </div>
    );
}
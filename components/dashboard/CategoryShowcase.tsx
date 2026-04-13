import Link from 'next/link';
import { Category } from '@/types/category';

interface CategoryShowcaseProps {
    categories: Category[];
}

export default function CategoryShowcase({ categories }: CategoryShowcaseProps) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, index) => (
                <Link
                    key={cat.id}
                    href={`/katalog?category_id=${cat.id}`}
                    className="bg-[#111114] border border-zinc-800 p-6 rounded-xl flex flex-col items-center text-center hover:border-[#ef3333]/50 transition-all group"
                >
                    <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform text-white font-black">
                        {cat.name.charAt(0)}
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100 mb-1">{cat.name}</h3>
                    <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Jelajahi Koleksi</p>
                </Link>
            ))}
        </div>
    );
}
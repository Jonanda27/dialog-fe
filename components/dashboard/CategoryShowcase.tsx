import Link from 'next/link';
import { Category } from '@/types/category';

interface CategoryShowcaseProps {
    categories: Category[]; // PERBAIKAN: Mendefinisikan props dari Server
}

export default function CategoryShowcase({ categories }: CategoryShowcaseProps) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
                <Link
                    key={cat.id}
                    href={`/katalog?sub_category_id=${cat.subCategories?.[0]?.id || ''}`}
                    className="group border border-gray-200 bg-white p-6 flex flex-col items-center justify-center hover:border-black transition-colors"
                >
                    {/* Jika ada icon, bisa dirender di sini. Placeholder bulat: */}
                    <div className="w-16 h-16 bg-gray-100 rounded-full mb-4 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                        <span className="font-bold text-xl">{cat.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                </Link>
            ))}
        </div>
    );
}
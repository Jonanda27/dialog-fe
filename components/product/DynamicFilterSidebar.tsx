'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Category } from '@/types/category';

interface DynamicFilterSidebarProps {
    categories: Category[];
}

export default function DynamicFilterSidebar({ categories }: DynamicFilterSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Helper: Fungsi untuk memanipulasi URL parameters
    const createQueryString = (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        // Jika value sama dengan yang ada, berarti user melakukan "uncheck" (Hapus parameter)
        if (params.get(name) === value || value === '') {
            params.delete(name);
        } else {
            params.set(name, value);
        }

        return params.toString();
    };

    // Fungsi trigger saat filter diklik
    const handleFilterChange = (key: string, value: string) => {
        const queryString = createQueryString(key, value);
        // Menggunakan opsi scroll: false agar halaman tidak melompat ke atas saat filter ditekan
        router.push(`${pathname}?${queryString}`, { scroll: false });
    };

    return (
        // UI: Sticky Layout agar Sidebar menempel saat grid panjang di-scroll
        <aside className="w-full sticky top-20">
            <div className="bg-white border border-gray-200 p-5 space-y-8">

                {/* Header Clear Filter */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">Filter</h2>
                    {searchParams.toString() && (
                        <button
                            onClick={() => router.push(pathname, { scroll: false })}
                            className="text-xs font-semibold text-red-600 hover:text-red-800"
                        >
                            Reset
                        </button>
                    )}
                </div>

                {/* Section: Kategori Utama */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                        Format / Kategori
                    </h3>
                    <div className="space-y-2">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex items-center">
                                {/* Asumsi subCategories dirender, atau kategori induk */}
                                {cat.subCategories?.map(sub => {
                                    const isChecked = searchParams.get('sub_category_id') === sub.id;
                                    return (
                                        <label key={sub.id} className="flex items-center space-x-3 cursor-pointer group mb-2 w-full">
                                            <div className={`w-4 h-4 border ${isChecked ? 'bg-black border-black' : 'border-gray-300 bg-white group-hover:border-gray-400'} flex items-center justify-center transition-colors`}>
                                                {isChecked && <div className="w-2 h-2 bg-white" />}
                                            </div>
                                            <span className={`text-sm ${isChecked ? 'font-semibold text-black' : 'text-gray-600 group-hover:text-black'}`}>
                                                {sub.name}
                                            </span>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={isChecked}
                                                onChange={() => handleFilterChange('sub_category_id', sub.id)}
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Filter JSONB - Media Grading (Dinamis) */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                        Kondisi Audio (Grading)
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        {['Mint', 'NM', 'VG+', 'VG', 'Good'].map((grade) => {
                            const isChecked = searchParams.get('media_grading') === grade;
                            return (
                                <button
                                    key={grade}
                                    onClick={() => handleFilterChange('media_grading', grade)}
                                    className={`py-1.5 px-3 text-xs font-semibold border ${isChecked
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                                        } transition-colors text-center`}
                                >
                                    {grade}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Section: Rentang Harga (Standar) */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                        Rentang Harga
                    </h3>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            placeholder="Min"
                            className="w-full text-sm border border-gray-300 px-2 py-2 focus:outline-none focus:border-black"
                            onBlur={(e) => {
                                if (e.target.value) handleFilterChange('min_price', e.target.value);
                            }}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            className="w-full text-sm border border-gray-300 px-2 py-2 focus:outline-none focus:border-black"
                            onBlur={(e) => {
                                if (e.target.value) handleFilterChange('max_price', e.target.value);
                            }}
                        />
                    </div>
                </div>

            </div>
        </aside>
    );
}
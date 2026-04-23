'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Category } from '@/types/category';
import { LayoutGrid, ChevronDown, Tag, ChevronRight, Filter, X } from 'lucide-react';

interface DynamicFilterSidebarProps {
    categories: Category[];
}

export default function DynamicFilterSidebar({ categories }: DynamicFilterSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (categories.length > 0) {
            // Membuka kategori pertama secara default
            setOpenCategories({ [String(categories[0].id)]: true });
        }
    }, [categories]);

    const toggleCategory = (catId: string) => {
        setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (params.get(key) === value || value === '') {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <aside className="w-full sticky top-24 space-y-6">
            <div className="bg-[#111114] border border-zinc-900 rounded-[2.5rem] p-6 lg:p-8 overflow-hidden shadow-lg">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <LayoutGrid size={18} className="text-[#ef3333]" />
                        <h4 className="text-xs font-black text-white uppercase tracking-widest">Kategori</h4>
                    </div>
                    {searchParams.toString() && (
                         <button 
                            onClick={() => router.push(pathname, { scroll: false })}
                            className="text-[9px] font-black text-red-500 uppercase tracking-tighter hover:text-red-400 transition-colors"
                         >
                            Reset
                         </button>
                    )}
                </div>

                <div className="space-y-4">
                    {/* Option: Semua Produk */}
                    <button 
                        onClick={() => handleFilterChange('sub_category_id', '')}
                        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${!searchParams.get('sub_category_id') ? "bg-[#ef3333] text-white shadow-lg shadow-red-900/20" : "text-zinc-500 hover:bg-white/5 hover:text-white"}`}
                    >
                        Semua Produk
                        <ChevronRight size={14} className={!searchParams.get('sub_category_id') ? "opacity-100" : "opacity-0"} />
                    </button>

                    {/* Loop Categories */}
                    {categories.map((cat) => {
                        const isOpen = openCategories[String(cat.id)];
                        return (
                            <div key={cat.id} className="space-y-2">
                                <button 
                                    onClick={() => toggleCategory(String(cat.id))}
                                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-zinc-200">{cat.name}</span>
                                    </div>
                                    <ChevronDown size={14} className={`text-zinc-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <div className={`space-y-1.5 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                    <div className="border-l border-zinc-900 ml-5 pl-4 space-y-1">
                                        {cat.subCategories?.map((sub: any) => {
                                            const isActive = searchParams.get('sub_category_id') === String(sub.id);
                                            return (
                                                <button 
                                                    key={sub.id}
                                                    onClick={() => handleFilterChange('sub_category_id', String(sub.id))}
                                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-left ${isActive ? "text-[#ef3333] bg-[#ef3333]/5" : "text-zinc-500 hover:text-zinc-300"}`}
                                                >
                                                    {sub.name}
                                                    <Tag size={10} className={isActive ? "opacity-100" : "opacity-0"} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Section: Grading */}
                <div className="mt-10 pt-8 border-t border-zinc-900">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Media Grading</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {['Mint', 'NM', 'VG+', 'VG'].map((grade) => {
                            const isActive = searchParams.get('media_grading') === grade;
                            return (
                                <button
                                    key={grade}
                                    onClick={() => handleFilterChange('media_grading', grade)}
                                    className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${isActive ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}
                                >
                                    {grade}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </aside>
    );
}
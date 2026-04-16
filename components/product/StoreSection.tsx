'use client';

import Link from 'next/link';
import { Store as StoreIcon, ShieldCheck, Calendar, MessageSquare } from 'lucide-react';
import { getImageUrl } from '@/utils/image';

export default function StoreSection({ store, storeId }: { store: any, storeId: string }) {
    return (
        <section className="bg-[#111114] border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-white pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <StoreIcon size={200} />
            </div>
            
            <div className="shrink-0 relative">
                <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden">
                    <img src={getImageUrl(store?.logo_url)} className="w-full h-full object-cover" alt="store" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-[#111114] flex items-center justify-center text-white shadow-lg">
                    <ShieldCheck size={14} />
                </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">{store?.name}</h3>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em]">
                        <span className="flex items-center gap-1 text-emerald-500"><ShieldCheck size={12} /> Verified Store</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> Joined 2024</span>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <button className="px-6 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-200 hover:text-[#ef3333] transition-all flex items-center gap-2">
                        <MessageSquare size={14} /> Chat Seller
                    </button>
                    <Link href={`/landingpage/store/${storeId}`} className="px-6 py-2.5 bg-[#ef3333] rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
                        Visit Store
                    </Link>
                </div>
            </div>
        </section>
    );
}
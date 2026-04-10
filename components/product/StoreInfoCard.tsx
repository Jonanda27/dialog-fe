import { Store } from '@/types/store';
import { MapPin, ShieldCheck, Star } from 'lucide-react';

export default function StoreInfoCard({ store }: { store?: Store }) {
    if (!store) return null;

    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 mb-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-bold text-lg">
                    {store.name.charAt(0)}
                </div>
                <div>
                    <div className="flex items-center gap-1">
                        <h4 className="font-bold text-gray-900">{store.name}</h4>
                        {store.status === 'approved' && <ShieldCheck size={16} className="text-blue-600" />}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} />
                        <span>Indonesia</span>
                    </div>
                </div>
            </div>

            <div className="text-right border-l border-gray-200 pl-4">
                <div className="flex items-center gap-1 text-gray-900 font-bold">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span>4.9</span>
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Rating Penjual</p>
            </div>
        </div>
    );
}
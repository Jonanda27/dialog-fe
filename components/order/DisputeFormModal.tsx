'use client';

import { X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DisputeFormModal({ onClose }: { onClose: () => void }) {
    const handleDispute = (e: React.FormEvent) => {
        e.preventDefault();
        toast.info('Permintaan dispute sedang diproses oleh Admin');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md p-8 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <AlertCircle className="text-red-600" size={24} />
                    <h2 className="text-xl font-black uppercase tracking-tighter">Ajukan Komplain</h2>
                </div>

                <form onSubmit={handleDispute} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase text-gray-400">Alasan Komplain</label>
                        <select className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black appearance-none bg-white">
                            <option>Grading Tidak Sesuai (Kondisi Fisik)</option>
                            <option>Barang Cacat / Rusak</option>
                            <option>Barang Berbeda / Salah Kirim</option>
                            <option>Lainnya</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase text-gray-400">Deskripsi Masalah</label>
                        <textarea
                            className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black min-h-[100px]"
                            placeholder="Jelaskan secara detail ketidaksesuaian barang..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={onClose} className="border border-gray-200 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-50">Batal</button>
                        <button type="submit" className="bg-red-600 text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-700">Kirim Dispute</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
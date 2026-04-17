'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
    Trash2, Minus, Plus, ShoppingBag, 
    Store, Ticket, CircleDollarSign
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

// Helper untuk format URL gambar
const formatImageUrl = (path: string | undefined) => {
    if (!path) return 'https://placehold.co/400x400?text=No+Image';
    if (path.startsWith('http')) return path;
    return `http://localhost:5000/${path.replace(/^\/+/, '')}`;
};

export default function CartPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    
    // Panggil state satu per satu untuk mencegah infinite loop (re-render tak terbatas)
    const items = useCartStore((state: any) => state.items || []);
    const removeItem = useCartStore((state: any) => state.removeItem);
    const updateQuantity = useCartStore((state: any) => state.updateQuantity);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Handle Checkbox
    const handleSelectAll = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map((item: any) => item.cart_item_id));
        }
    };

    const handleSelectItem = (id: number) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleRemoveSelected = () => {
        selectedItems.forEach(id => {
            if (removeItem) removeItem(id);
        });
        setSelectedItems([]);
    };

    // Hitung total hanya untuk item yang di-ceklis
    const selectedCount = items.filter((item: any) => selectedItems.includes(item.cart_item_id))
                               .reduce((acc: number, item: any) => acc + item.quantity, 0);
    const selectedSubTotal = items.filter((item: any) => selectedItems.includes(item.cart_item_id))
                                  .reduce((acc: number, item: any) => acc + (Number(item.product.price) * item.quantity), 0);

    // Mencegah hydration error
    if (!isMounted) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] pt-32 pb-24 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-zinc-800 border-t-[#ef3333] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] pb-48 text-zinc-200 font-sans">
            <div className="w-full px-2 sm:px-4 md:px-8 mx-auto">
                
                {items.length === 0 ? (
                    /* EMPTY STATE */
                    <div className="bg-[#111114] border border-zinc-800 rounded-sm p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center text-zinc-500 mb-6 border border-zinc-800/50">
                            <ShoppingBag size={48} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Keranjang belanja Anda kosong</h2>
                        <Link 
                            href="/" 
                            className="bg-[#ef3333] hover:bg-red-700 text-white px-10 py-3 mt-4 rounded-sm text-sm font-bold uppercase tracking-widest transition-all"
                        >
                            Belanja Sekarang
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* TABLE HEADER */}
                        <div className="hidden md:flex bg-[#111114] border border-zinc-800 rounded-sm mb-4 py-4 px-6 items-center text-sm text-zinc-400 font-bold uppercase tracking-widest">
                            <div className="w-10 flex items-center justify-center shrink-0">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 accent-[#ef3333] cursor-pointer bg-zinc-900 border-zinc-700"
                                    checked={selectedItems.length === items.length && items.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </div>
                            <div className="flex-1 ml-4">Produk</div>
                            {/* Lebar dikunci persis dengan data list di bawahnya */}
                            <div className="w-32 text-center shrink-0">Harga Satuan</div>
                            <div className="w-32 text-center shrink-0">Kuantitas</div>
                            <div className="w-32 text-center shrink-0">Total Harga</div>
                            <div className="w-24 text-center shrink-0">Aksi</div>
                        </div>

                        {/* STORE BLOCK */}
                        <div className="bg-[#111114] border border-zinc-800 rounded-sm mb-4 overflow-hidden">
                            {/* Header Toko */}
                            <div className="border-b border-zinc-800 px-6 py-4 flex items-center text-sm font-bold text-white uppercase tracking-widest">
                                <div className="w-10 flex items-center justify-center shrink-0">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 accent-[#ef3333] cursor-pointer bg-zinc-900 border-zinc-700"
                                        checked={selectedItems.length === items.length && items.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </div>
                                <Store className="mx-2 text-zinc-400" size={18} />
                                <span>Analog Official Store</span>
                                <span className="ml-2 bg-[#ef3333] text-white text-[10px] px-1.5 py-0.5 rounded-sm">Mall</span>
                            </div>

                            {/* ITEM LIST */}
                            <div className="flex flex-col">
                                {items.map((item: any, index: number) => (
                                    <div key={item.cart_item_id} className={`flex flex-col md:flex-row items-start md:items-center p-6 ${index !== items.length - 1 ? 'border-b border-zinc-900/50' : ''}`}>
                                        
                                        {/* Checkbox & Image */}
                                        <div className="flex items-center w-full md:w-auto">
                                            <div className="w-10 flex items-center justify-center shrink-0">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 accent-[#ef3333] cursor-pointer bg-zinc-900 border-zinc-700"
                                                    checked={selectedItems.includes(item.cart_item_id)}
                                                    onChange={() => handleSelectItem(item.cart_item_id)}
                                                />
                                            </div>
                                            <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 shrink-0 mx-4 rounded-md overflow-hidden">
                                                <img 
                                                    src={formatImageUrl(item.product.media?.find((m: any) => m.is_primary)?.media_url)} 
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image'; }}
                                                />
                                            </div>
                                        </div>

                                        {/* Product Detail */}
                                        <div className="flex-1 flex flex-col md:flex-row items-start md:items-center w-full mt-4 md:mt-0">
                                            <div className="flex-1 pr-4">
                                                <h3 className="text-sm font-bold text-white uppercase tracking-tight line-clamp-2 leading-tight mb-1">
                                                    {item.product.name}
                                                </h3>
                                            </div>

                                            {/* Columns (Dikunci dengan w-32 shrink-0 di mode desktop agar sejajar header) */}
                                            <div className="flex items-center w-full md:w-auto justify-between md:justify-end mt-4 md:mt-0 gap-2 md:gap-0">
                                                {/* Harga Satuan */}
                                                <div className="flex-1 md:w-32 text-left md:text-center text-sm font-medium text-zinc-300 md:shrink-0">
                                                    Rp{Number(item.product.price).toLocaleString('id-ID')}
                                                </div>
                                                
                                                {/* Kuantitas */}
                                                <div className="w-auto md:w-32 flex justify-center md:shrink-0">
                                                    <div className="flex items-center border border-zinc-700 rounded-sm overflow-hidden h-8">
                                                        <button 
                                                            onClick={() => updateQuantity && updateQuantity(item.cart_item_id, Math.max(1, item.quantity - 1))}
                                                            className="w-8 h-full flex items-center justify-center text-zinc-400 bg-[#1a1a1e] hover:bg-zinc-700 hover:text-white transition-colors"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <div className="w-12 h-full flex items-center justify-center text-sm font-bold text-white border-x border-zinc-700 bg-[#111114]">
                                                            {item.quantity}
                                                        </div>
                                                        <button 
                                                            onClick={() => updateQuantity && updateQuantity(item.cart_item_id, item.quantity + 1)}
                                                            className="w-8 h-full flex items-center justify-center text-zinc-400 bg-[#1a1a1e] hover:bg-zinc-700 hover:text-white transition-colors"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Total Harga */}
                                                <div className="flex-1 md:w-32 text-right md:text-center text-sm font-bold italic text-[#ef3333] md:shrink-0">
                                                    Rp{(Number(item.product.price) * item.quantity).toLocaleString('id-ID')}
                                                </div>

                                                {/* Aksi */}
                                                <div className="w-auto md:w-24 flex flex-col items-end md:items-center justify-center text-xs font-bold uppercase tracking-widest md:shrink-0 ml-4 md:ml-0">
                                                    <button 
                                                        onClick={() => removeItem && removeItem(item.cart_item_id)}
                                                        className="text-zinc-500 hover:text-[#ef3333] transition-colors"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Toko Voucher Info (Mock) */}
                            <div className="border-t border-dashed border-zinc-800 px-6 py-4 flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer">
                                <Ticket size={18} className="text-[#ef3333]" />
                                <span className="font-medium">Tambahkan kode Voucher Toko</span>
                            </div>
                        </div>

                        {/* STICKY BOTTOM CHECKOUT BAR */}
                        <div className="fixed bottom-0 left-0 w-full bg-[#111114] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] border-t border-zinc-800 z-50">
                            
                            {/* Voucher & Koin Shopee Area */}
                            <div className="border-b border-zinc-800/60 px-4 md:px-8 py-3 flex flex-col md:flex-row justify-end items-start md:items-center gap-4 md:gap-8 text-sm">
                                <div className="flex items-center gap-2 cursor-pointer w-full md:w-auto justify-between md:justify-start">
                                    <div className="flex items-center gap-2">
                                        <Ticket size={18} className="text-[#ef3333]" />
                                        <span className="text-white font-bold uppercase tracking-widest text-xs">Voucher Analog</span>
                                    </div>
                                    <span className="text-blue-500 hover:text-blue-400 font-medium transition-colors">Gunakan/masukkan kode</span>
                                </div>
                                <div className="hidden md:block w-px h-6 bg-zinc-800"></div>
                                <div className="flex items-center gap-2 text-zinc-500 w-full md:w-auto justify-between md:justify-start">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" disabled className="w-4 h-4 cursor-not-allowed opacity-50 bg-zinc-900 border-zinc-800" />
                                        <CircleDollarSign size={18} />
                                        <span className="font-bold uppercase tracking-widest text-xs">Koin Analog</span>
                                    </div>
                                    <span className="text-zinc-600 font-medium">-Rp0</span>
                                </div>
                            </div>

                            {/* Main Checkout Action */}
                            <div className="px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-6 w-full md:w-auto text-sm text-white font-medium">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-[#ef3333] transition-colors">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 accent-[#ef3333] cursor-pointer bg-zinc-900 border-zinc-700"
                                            checked={selectedItems.length === items.length && items.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                        <span onClick={handleSelectAll}>Pilih Semua ({items.length})</span>
                                    </div>
                                    <button 
                                        className="text-zinc-400 hover:text-[#ef3333] transition-colors"
                                        onClick={handleRemoveSelected}
                                        disabled={selectedItems.length === 0}
                                    >
                                        Hapus
                                    </button>
                                    <button className="text-[#ef3333] hover:text-red-400 transition-colors hidden sm:block">Tambahkan ke Favorit</button>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                                    <div className="text-right">
                                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mr-2">Total ({selectedCount} produk):</span>
                                        <span className="text-2xl font-black italic text-[#ef3333]">Rp{selectedSubTotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    {/* ⚡ PERUBAHAN: MENGIRIM ID PRODUK YANG DIPILIH KE HALAMAN CHECKOUT MELALUI URL PARAMETER */}
                                    <Link 
                                        href={`/checkout?selected=${selectedItems.join(',')}`} 
                                        className={`px-12 py-3.5 rounded-sm text-white text-xs font-black uppercase tracking-widest transition-all ${
                                            selectedItems.length > 0 
                                            ? 'bg-[#ef3333] hover:bg-red-700 shadow-[0_0_20px_rgba(239,51,51,0.3)]' 
                                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed pointer-events-none'
                                        }`}
                                    >
                                        Checkout
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </>
                )}
            </div>
        </div>
    );
}
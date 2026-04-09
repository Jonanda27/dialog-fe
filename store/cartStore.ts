import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    artist: string;
    price: number;
    mediaUrl: string;
    store_id: string;
    store_name: string;
    qty: number;
    stock: number;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    toggleCart: () => void;
    addItem: (item: Omit<CartItem, 'qty'>) => { success: boolean; message: string };
    removeItem: (id: string) => void;
    clearCart: () => void;
    getTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            toggleCart: () => set({ isOpen: !get().isOpen }),

            addItem: (newItem) => {
                const currentItems = get().items;

                // SINGLE STORE RULE VALIDATION
                if (currentItems.length > 0 && currentItems[0].store_id !== newItem.store_id) {
                    return {
                        success: false,
                        message: `Keranjang Anda berisi barang dari toko ${currentItems[0].store_name}. Anda tidak bisa menggabung barang dari toko berbeda.`
                    };
                }

                const existingItem = currentItems.find((i) => i.id === newItem.id);

                if (existingItem) {
                    if (existingItem.qty >= newItem.stock) {
                        return { success: false, message: 'Stok maksimum telah tercapai.' };
                    }
                    set({
                        items: currentItems.map(i => i.id === newItem.id ? { ...i, qty: i.qty + 1 } : i)
                    });
                } else {
                    set({ items: [...currentItems, { ...newItem, qty: 1 }] });
                }

                return { success: true, message: 'Produk ditambahkan ke keranjang!' };
            },

            removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
            clearCart: () => set({ items: [] }),
            getTotal: () => get().items.reduce((total, item) => total + (item.price * item.qty), 0),
        }),
        { name: 'analog-cart-storage' } // Key untuk localStorage
    )
);
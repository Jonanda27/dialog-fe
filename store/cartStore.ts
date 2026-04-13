import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types/product';
import { CartItem } from '../types/cart';

interface CartState {
    // State
    items: CartItem[];
    isOpen: boolean;

    // Actions
    openCart: () => void;
    closeCart: () => void;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;

    // ⚡ BARU: Alias fungsional untuk memperjelas alur setelah transaksi sukses
    clearCartAfterCheckout: () => void;
}

export const useCartStore = create<CartState>()(
    // Menggunakan middleware 'persist' untuk auto-save ke localStorage
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            openCart: () => set({ isOpen: true }),

            closeCart: () => set({ isOpen: false }),

            addItem: (product, quantity = 1) => {
                const { items } = get();

                // ⚡ VALIDASI KRUSIAL 1: Aturan Single-Store (1 Pesanan = 1 Toko)
                if (items.length > 0) {
                    const currentStoreId = items[0].product.store_id;
                    if (currentStoreId !== product.store_id) {
                        // Melempar error agar bisa ditangkap & ditampilkan oleh Toast di UI
                        throw new Error('Anda hanya bisa membeli barang dari satu toko yang sama dalam satu checkout. Selesaikan pesanan sebelumnya atau kosongkan keranjang.');
                    }
                }

                // Cek apakah item sudah ada di dalam keranjang
                const existingItem = items.find((item) => item.product.id === product.id);

                if (existingItem) {
                    // ⚡ VALIDASI KRUSIAL 2: Cek Limit Stok (Mencegah Overselling di Frontend)
                    const newQuantity = existingItem.quantity + quantity;
                    if (newQuantity > product.stock) {
                        throw new Error(`Stok tidak mencukupi. Tersisa ${product.stock} pcs.`);
                    }

                    set({
                        items: items.map((item) =>
                            item.product.id === product.id
                                ? { ...item, quantity: newQuantity }
                                : item
                        ),
                        isOpen: true, // Otomatis membuka Drawer Keranjang saat ditambah
                    });
                } else {
                    // Validasi limit stok untuk item baru
                    if (quantity > product.stock) {
                        throw new Error(`Stok tidak mencukupi. Tersisa ${product.stock} pcs.`);
                    }

                    const newItem: CartItem = {
                        cart_item_id: product.id, // Kita gunakan ID produk sebagai ID unik keranjang
                        product,
                        quantity,
                    };

                    set({
                        items: [newItem, ...items], // Item terbaru muncul di atas
                        isOpen: true,
                    });
                }
            },

            removeItem: (cartItemId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.cart_item_id !== cartItemId),
                }));
            },

            updateQuantity: (cartItemId, quantity) => {
                const { items } = get();
                const itemToUpdate = items.find((item) => item.cart_item_id === cartItemId);

                // Mencegah penambahan jika melebihi batas stok via tombol '+'
                if (itemToUpdate && quantity > itemToUpdate.product.stock) {
                    return;
                }

                // Jika qty menjadi 0, hapus item dari keranjang
                if (quantity <= 0) {
                    get().removeItem(cartItemId);
                    return;
                }

                set((state) => ({
                    items: state.items.map((item) =>
                        item.cart_item_id === cartItemId
                            ? { ...item, quantity }
                            : item
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),

            // Menggunakan fungsi clearCart untuk membersihkan keranjang pasca-checkout sukses
            clearCartAfterCheckout: () => set({ items: [] }),
        }),
        {
            name: 'analog-cart-storage', // Nama Key yang akan muncul di Application > Local Storage Browser
        }
    )
);
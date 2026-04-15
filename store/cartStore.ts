import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types/product';
import { CartItem } from '../types/cart';
import { productService } from '@/services/api/product.service'; // ⚡ IMPORT BARU: Service untuk memanggil API

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
    clearCartAfterCheckout: () => void;

    // ⚡ BARU: Fungsi Auto-Healing untuk sinkronisasi data dengan server
    syncCartItems: () => Promise<boolean>;
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
                        throw new Error('Anda hanya bisa membeli barang dari satu toko yang sama dalam satu checkout. Selesaikan pesanan sebelumnya atau kosongkan keranjang.');
                    }
                }

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
                        isOpen: true,
                    });
                } else {
                    if (quantity > product.stock) {
                        throw new Error(`Stok tidak mencukupi. Tersisa ${product.stock} pcs.`);
                    }

                    const newItem: CartItem = {
                        cart_item_id: product.id,
                        product,
                        quantity,
                    };

                    set({
                        items: [newItem, ...items],
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

                if (itemToUpdate && quantity > itemToUpdate.product.stock) {
                    return;
                }

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

            clearCartAfterCheckout: () => set({ items: [] }),

            // ====================================================================
            // ⚡ TAHAP 3: MESIN SINKRONISASI & AUTO-HEALING KERANJANG
            // ====================================================================
            syncCartItems: async () => {
                const { items } = get();
                if (items.length === 0) return false;

                const productIds = items.map((item) => item.product.id);

                try {
                    // Panggil endpoint /api/v1/products/sync
                    const response = await productService.syncProducts(productIds);
                    const latestData = response.data;

                    let hasChanges = false;

                    const updatedItems = items.map((item) => {
                        const serverInfo = latestData.find((p: any) => p.id === item.product.id);

                        // Jika produk sudah dihapus dari database oleh penjual
                        if (!serverInfo) {
                            hasChanges = true;
                            // Menandai produk tidak aktif agar UI bisa memblokir checkout
                            return {
                                ...item,
                                product: { ...item.product, is_active: false, stock: 0 }
                            };
                        }

                        // Deteksi anomali: Harga berubah, stok kurang dari kuantitas keranjang, atau produk dinonaktifkan
                        const isPriceChanged = Number(serverInfo.price) !== Number(item.product.price);
                        const isOutOfStock = serverInfo.stock < item.quantity || !serverInfo.is_active;

                        if (isPriceChanged || isOutOfStock) {
                            hasChanges = true;
                        }

                        // Healing Process: Perbarui item di localStorage dengan data absolut dari server
                        return {
                            ...item,
                            // Jika stok server lebih kecil dari qty di keranjang, turunkan qty keranjang
                            quantity: serverInfo.stock < item.quantity ? serverInfo.stock : item.quantity,
                            product: {
                                ...item.product,
                                price: serverInfo.price,
                                stock: serverInfo.stock,
                                is_active: serverInfo.is_active,
                                product_weight: serverInfo.product_weight // Krusial untuk ongkir Biteship
                            }
                        };
                    });

                    // Bersihkan item yang kuantitasnya menjadi 0 akibat stok server habis
                    const cleanItems = updatedItems.filter(item => item.quantity > 0);

                    if (cleanItems.length !== updatedItems.length) {
                        hasChanges = true;
                    }

                    if (hasChanges) {
                        set({ items: cleanItems });
                    }

                    return hasChanges; // Mengembalikan true jika terjadi healing
                } catch (error) {
                    console.error('[Cart Auto-Healing] Gagal menyinkronkan data dengan server:', error);
                    return false;
                }
            },
        }),
        {
            name: 'analog-cart-storage', // Nama Key di localStorage
        }
    )
);
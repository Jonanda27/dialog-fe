import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types/product';
import { CartItem } from '../types/cart';
import { productService } from '@/services/api/product.service';

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    isAnimate: boolean; // ⚡ TAMBAHAN: Untuk trigger animasi di Navbar
    openCart: () => void;
    closeCart: () => void;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;
    clearCartAfterCheckout: () => void;
    syncCartItems: () => Promise<boolean>;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            isAnimate: false, // Initial state animasi

            openCart: () => set({ isOpen: true }),

            closeCart: () => set({ isOpen: false }),

            addItem: (product, quantity = 1) => {
                const { items } = get();

                // Trigger Animasi Navbar
                set({ isAnimate: true });
                
                // Reset animasi setelah 500ms agar bisa dipicu kembali nanti
                setTimeout(() => set({ isAnimate: false }), 500);

                const existingItem = items.find((item) => item.product.id === product.id);

                if (existingItem) {
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
                        // ⚡ PERBAIKAN: isOpen diatur ke false agar tidak muncul drawer otomatis
                        isOpen: false, 
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
                        // ⚡ PERBAIKAN: isOpen diatur ke false agar tidak muncul drawer otomatis
                        isOpen: false,
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

            syncCartItems: async () => {
                const { items } = get();
                if (items.length === 0) return false;

                const productIds = items.map((item) => item.product.id);

                try {
                    const response = await productService.syncProducts(productIds);
                    const latestData = response.data;

                    let hasChanges = false;

                    const updatedItems = items.map((item) => {
                        const serverInfo = latestData.find((p: any) => p.id === item.product.id);

                        if (!serverInfo) {
                            hasChanges = true;
                            return {
                                ...item,
                                product: { ...item.product, is_active: false, stock: 0 }
                            };
                        }

                        const isPriceChanged = Number(serverInfo.price) !== Number(item.product.price);
                        const isOutOfStock = serverInfo.stock < item.quantity || !serverInfo.is_active;

                        if (isPriceChanged || isOutOfStock) {
                            hasChanges = true;
                        }

                        return {
                            ...item,
                            quantity: serverInfo.stock < item.quantity ? serverInfo.stock : item.quantity,
                            product: {
                                ...item.product,
                                price: serverInfo.price,
                                stock: serverInfo.stock,
                                is_active: serverInfo.is_active,
                                product_weight: serverInfo.product_weight
                            }
                        };
                    });

                    const cleanItems = updatedItems.filter(item => item.quantity > 0);

                    if (cleanItems.length !== updatedItems.length) {
                        hasChanges = true;
                    }

                    if (hasChanges) {
                        set({ items: cleanItems });
                    }

                    return hasChanges;
                } catch (error) {
                    console.error('[Cart Auto-Healing] Gagal menyinkronkan data:', error);
                    return false;
                }
            },
        }),
        {
            name: 'analog-cart-storage',
            // Kita tidak mem-persist 'isAnimate' atau 'isOpen' agar tidak aneh saat page refresh
            partialize: (state) => ({ items: state.items }),
        }
    )
);
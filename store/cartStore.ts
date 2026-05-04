// File: dialog-id-fe/store/cartStore.ts
import { create } from 'zustand';
import { Product } from '../types/product';
import { CartItem, AddToCartPayload } from '../types/cart';
import { GradingStatus } from '../types/grading';
import { CartService } from '@/services/api/cart.service';
import { productService } from '@/services/api/product.service';
import { toast } from 'sonner';

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    isAnimate: boolean;
    isLoading: boolean; // ⚡ NEW: Status loading saat sinkronisasi DB
    
    // UI Actions
    openCart: () => void;
    closeCart: () => void;

    // Database Actions
    fetchCart: () => Promise<void>; // ⚡ NEW: Ambil data dari DB
    addItem: (product: Product, quantity?: number) => Promise<void>;
    removeItem: (cartItemId: string) => Promise<void>;
    updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    
    // Logistics & Sync
    syncCartItems: () => Promise<boolean>;
    
    // Grading tracking methods
    updateGradingInfo: (cartItemId: string, gradingRequestId: string, status: GradingStatus, requiresGrading: boolean) => void;
    getItemsByGradingRequirement: () => CartItem[];
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    isOpen: false,
    isAnimate: false,
    isLoading: false,

    openCart: () => set({ isOpen: true }),
    closeCart: () => set({ isOpen: false }),

    /**
     * Mengambil data keranjang terbaru dari database
     */
    fetchCart: async () => {
        try {
            set({ isLoading: true });
            const response = await CartService.getMyCart();
            set({ items: response.data || [] });
        } catch (error) {
            console.error('[CartStore] Gagal mengambil keranjang:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    /**
     * Menambahkan item ke database dan memperbarui state lokal
     */
    addItem: async (product, quantity = 1) => {
        try {
            set({ isAnimate: true });
            
            const payload: AddToCartPayload = {
                product_id: product.id,
                quantity: quantity
            };

            await CartService.addToCart(payload);
            
            // Re-fetch data dari server agar state lokal sama persis dengan DB
            await get().fetchCart();
            
            setTimeout(() => set({ isAnimate: false }), 500);
            toast.success(`${product.name} berhasil ditambahkan ke keranjang`);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Gagal menambahkan ke keranjang';
            toast.error(msg);
            set({ isAnimate: false });
        }
    },

    /**
     * Memperbarui kuantitas di database (berdasarkan Cart ID)
     */
    updateQuantity: async (cartItemId, quantity) => {
        if (quantity <= 0) {
            return get().removeItem(cartItemId);
        }

        try {
            await CartService.updateQty(cartItemId, quantity);
            // Update lokal secara optimis atau re-fetch
            await get().fetchCart();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Gagal memperbarui kuantitas';
            toast.error(msg);
        }
    },

    /**
     * Menghapus item dari database (berdasarkan Cart ID)
     */
    removeItem: async (cartItemId) => {
        try {
            await CartService.removeItem(cartItemId);
            // Filter lokal agar UI terasa instan
            set((state) => ({
                items: state.items.filter((item) => item.id !== cartItemId),
            }));
        } catch (error) {
            toast.error('Gagal menghapus item');
        }
    },

    /**
     * Mengosongkan keranjang di database
     */
    clearCart: async () => {
        try {
            await CartService.clearCart();
            set({ items: [] });
        } catch (error) {
            console.error('Gagal membersihkan keranjang');
        }
    },

    /**
     * Tetap diperlukan untuk pengecekan harga/stok terbaru sebelum checkout
     */
    syncCartItems: async () => {
        const { items } = get();
        if (items.length === 0) return false;

        const productIds = items.map((item) => item.product.id);

        try {
            const response = await productService.syncProducts(productIds);
            const latestData = response.data;

            let hasChanges = false;
            // Jika ada perubahan drastis di stok/harga pada server, fetch ulang keranjang
            if (latestData) {
                await get().fetchCart();
                hasChanges = true;
            }

            return hasChanges;
        } catch (error) {
            console.error('[Cart Auto-Healing] Gagal menyinkronkan data:', error);
            return false;
        }
    },

    updateGradingInfo: (cartItemId, gradingRequestId, status, requiresGrading) => {
        set((state) => ({
            items: state.items.map((item) =>
                item.id === cartItemId
                    ? {
                        ...item,
                        grading_request_id: gradingRequestId,
                        grading_status: status,
                        requires_grading: requiresGrading,
                    }
                    : item
            ),
        }));
    },

    getItemsByGradingRequirement: () => {
        const { items } = get();
        return items.filter((item) => item.requires_grading === true);
    },
}));
import { create } from 'zustand';
import { Order, CheckoutPayload } from '../types/order';
import { OrderService } from '../services/api/order.service';
import { ApiError } from '../types/api';

interface OrderState {
    // State
    orders: Order[];         // Digunakan oleh Seller (Pesanan Masuk)
    buyerOrders: Order[];    // Digunakan oleh Buyer (Riwayat Belanja)
    currentOrder: Order | null;
    isLoading: boolean;
    isSubmitting: boolean;   // Khusus state mutasi agar UI tidak flicker
    error: string | null;

    // Actions
    fetchStoreOrders: (status?: string) => Promise<void>;
    fetchBuyerOrders: (status?: string) => Promise<void>;
    fetchOrderById: (orderId: string) => Promise<void>;
    checkout: (payload: CheckoutPayload) => Promise<string>;
    shipOrder: (orderId: string, trackingNumber: string) => Promise<void>;
    completeOrder: (orderId: string) => Promise<void>;
    clearError: () => void;
    clearCurrentOrder: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    buyerOrders: [],
    currentOrder: null,
    isLoading: false,
    isSubmitting: false,
    error: null,

    fetchStoreOrders: async (status) => {
        set({ isLoading: true, error: null });
        try {
            const response = await OrderService.getStoreOrders(status);
            set({ orders: response.data, isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal memuat daftar pesanan toko.', isLoading: false });
        }
    },

    fetchBuyerOrders: async (status) => {
        set({ isLoading: true, error: null });
        try {
            const response = await OrderService.getBuyerOrders(status);
            set({ buyerOrders: response.data, isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal memuat riwayat belanja Anda.', isLoading: false });
        }
    },

    fetchOrderById: async (orderId) => {
        set({ isLoading: true, error: null, currentOrder: null });
        try {
            const response = await OrderService.getById(orderId);
            set({ currentOrder: response.data, isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal memuat detail pesanan.', isLoading: false });
        }
    },

    checkout: async (payload) => {
        set({ isSubmitting: true, error: null });
        try {
            const response = await OrderService.checkout(payload);
            set({ isSubmitting: false });
            return response.data.order_id; // Kembalikan ID untuk di-redirect ke halaman bayar
        } catch (error: any) {
            const err = error as ApiError;
            // Pesan error dari backend (seperti stok habis/overselling) ditangkap di sini
            set({ error: err.message || 'Gagal melakukan checkout.', isSubmitting: false });
            throw err;
        }
    },

    shipOrder: async (orderId, trackingNumber) => {
        set({ isSubmitting: true, error: null });
        try {
            await OrderService.shipOrder(orderId, { tracking_number: trackingNumber });

            // Optimistic Update UI (Seller)
            const updatedOrders = get().orders.map(order =>
                order.id === orderId
                    ? { ...order, status: 'shipped', tracking_number: trackingNumber }
                    : order
            ) as Order[];

            set({ orders: updatedOrders, isSubmitting: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal menginput resi pengiriman.', isSubmitting: false });
            throw err;
        }
    },

    completeOrder: async (orderId) => {
        set({ isSubmitting: true, error: null });
        try {
            await OrderService.completeOrder(orderId);

            // Optimistic Update UI (Buyer)
            const updatedBuyerOrders = get().buyerOrders.map(order =>
                order.id === orderId
                    ? { ...order, status: 'completed' }
                    : order
            ) as Order[];

            set({
                buyerOrders: updatedBuyerOrders,
                currentOrder: get().currentOrder?.id === orderId ? { ...get().currentOrder!, status: 'completed' } : get().currentOrder,
                isSubmitting: false
            });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal menyelesaikan pesanan.', isSubmitting: false });
            throw err;
        }
    },

    clearError: () => set({ error: null }),
    clearCurrentOrder: () => set({ currentOrder: null })
}));
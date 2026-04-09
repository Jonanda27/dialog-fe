// File: dialog-fe/store/orderStore.ts

import { create } from 'zustand';
import { Order, CheckoutPayload, ShipOrderPayload } from '../types/order';
import { OrderService } from '../services/api/order.service';
import { ApiError } from '../types/api';

interface OrderState {
    orders: Order[];
    currentOrder: Order | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchStoreOrders: (status?: string) => Promise<void>;
    checkout: (payload: CheckoutPayload) => Promise<string>; // me-return order_id
    shipOrder: (orderId: string, trackingNumber: string) => Promise<void>;
    completeOrder: (orderId: string) => Promise<void>;
    clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    currentOrder: null,
    isLoading: false,
    error: null,

    fetchStoreOrders: async (status) => {
        set({ isLoading: true, error: null });
        try {
            const response = await OrderService.getStoreOrders(status);
            set({ orders: response.data, isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal memuat daftar pesanan', isLoading: false });
        }
    },

    checkout: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            const response = await OrderService.checkout(payload);
            set({ isLoading: false });
            return response.data.order_id; // Kembalikan ID untuk di-redirect ke halaman bayar
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal melakukan checkout', isLoading: false });
            throw err;
        }
    },

    shipOrder: async (orderId, trackingNumber) => {
        set({ isLoading: true, error: null });
        try {
            await OrderService.shipOrder(orderId, { tracking_number: trackingNumber });

            // Update state lokal agar UI langsung berubah tanpa perlu refresh API
            const updatedOrders = get().orders.map(order =>
                order.id === orderId ? { ...order, status: 'shipped', tracking_number: trackingNumber } : order
            ) as Order[];

            set({ orders: updatedOrders, isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal menginput resi', isLoading: false });
            throw err;
        }
    },

    completeOrder: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
            await OrderService.completeOrder(orderId);
            set({ isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal menyelesaikan pesanan', isLoading: false });
            throw err;
        }
    },

    clearError: () => set({ error: null })
}));
// File: dialog-fe/store/adminStore.ts

import { create } from 'zustand';
import { Store } from '../types/store';
import { Dispute, ResolveDisputePayload } from '../types/dispute';
import { AdminService } from '../services/api/admin.service';
import { DisputeService } from '../services/api/dispute.service';
import { ApiError } from '../types/api';

interface AdminState {
    pendingStores: Store[];
    allDisputes: Dispute[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchPendingStores: () => Promise<void>;
    approveStore: (storeId: string) => Promise<void>;
    rejectStore: (storeId: string, reason?: string) => Promise<void>; // Menambahkan rejectStore ke state
    
    // Fitur Suspend Baru
    suspendStore: (storeId: string, duration: number, unit: 'hours' | 'days' | 'permanent', reason?: string) => Promise<void>;
    unsuspendStore: (storeId: string) => Promise<void>;

    fetchAllDisputes: () => Promise<void>;
    resolveDispute: (disputeId: string, payload: ResolveDisputePayload) => Promise<void>;
    clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
    pendingStores: [],
    allDisputes: [],
    isLoading: false,
    error: null,

    fetchPendingStores: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await AdminService.getPendingStores();
            set({ pendingStores: response.data, isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal memuat toko pending', isLoading: false });
        }
    },

    approveStore: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            await AdminService.approveStore(storeId);
            const updatedStores = get().pendingStores.filter(store => store.id !== storeId);
            set({ pendingStores: updatedStores, isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal menyetujui toko', isLoading: false });
            throw err;
        }
    },

    rejectStore: async (storeId, reason) => {
        set({ isLoading: true, error: null });
        try {
            await AdminService.rejectStore(storeId, reason);
            const updatedStores = get().pendingStores.filter(store => store.id !== storeId);
            set({ pendingStores: updatedStores, isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal menolak toko', isLoading: false });
            throw err;
        }
    },

    suspendStore: async (storeId, duration, unit, reason) => {
        set({ isLoading: true, error: null });
        try {
            await AdminService.suspendStore(storeId, duration, unit, reason);
            // Anda bisa memuat ulang data atau mengupdate status store di list toko (jika ada state 'allStores')
            set({ isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal mensuspensi toko', isLoading: false });
            throw err;
        }
    },

    unsuspendStore: async (storeId) => {
        set({ isLoading: true, error: null });
        try {
            await AdminService.unsuspendStore(storeId);
            set({ isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal mencabut suspensi', isLoading: false });
            throw err;
        }
    },

    fetchAllDisputes: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await DisputeService.getAllDisputes();
            set({ allDisputes: response.data, isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal memuat daftar sengketa', isLoading: false });
        }
    },

    resolveDispute: async (disputeId, payload) => {
        set({ isLoading: true, error: null });
        try {
            await DisputeService.resolveDispute(disputeId, payload);
            const updatedDisputes = get().allDisputes.map(dispute =>
                dispute.id === disputeId ? { ...dispute, status: 'resolved' } : dispute
            ) as Dispute[];
            set({ allDisputes: updatedDisputes, isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal meresolusi sengketa', isLoading: false });
            throw err;
        }
    },

    clearError: () => set({ error: null })
}));
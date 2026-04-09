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
            // Hapus toko yang sudah diapprove dari daftar pending di UI secara instan
            const updatedStores = get().pendingStores.filter(store => store.id !== storeId);
            set({ pendingStores: updatedStores, isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal menyetujui toko', isLoading: false });
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
            // Update status dispute di UI lokal menjadi resolved
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
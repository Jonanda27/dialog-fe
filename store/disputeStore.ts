// File: dialog-fe/store/disputeStore.ts

import { create } from 'zustand';
import { Dispute, OpenDisputePayload } from '../types/dispute';
import { DisputeService } from '../services/api/dispute.service';
import { ApiError } from '../types/api';

interface DisputeState {
    myDisputes: Dispute[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchMyDisputes: () => Promise<void>;
    openDispute: (payload: OpenDisputePayload) => Promise<void>;
    clearError: () => void;
}

export const useDisputeStore = create<DisputeState>((set, get) => ({
    myDisputes: [],
    isLoading: false,
    error: null,

    fetchMyDisputes: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await DisputeService.getMyDisputes();
            set({ myDisputes: response.data, isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal memuat sengketa Anda', isLoading: false });
        }
    },

    openDispute: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            // payload.evidences berisi file array, FormData akan diurus oleh Service
            const response = await DisputeService.openDispute(payload);

            // Tambahkan sengketa baru ke daftar lokal
            set({ myDisputes: [response.data, ...get().myDisputes], isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal mengajukan komplain', isLoading: false });
            throw err;
        }
    },

    clearError: () => set({ error: null })
}));
// File: dialog-fe/store/disputeStore.ts

import { create } from 'zustand';
import { Dispute, OpenDisputePayload, SubmitReturnResiPayload } from '../types/dispute';
import { DisputeService } from '../services/api/dispute.service';
import { ApiError } from '../types/api';

interface DisputeState {
    myDisputes: Dispute[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchMyDisputes: () => Promise<void>;
    openDispute: (payload: OpenDisputePayload) => Promise<void>;
    
    // ⚡ New Actions
    acceptReturn: (disputeId: string) => Promise<void>;
    submitReturnResi: (disputeId: string, payload: SubmitReturnResiPayload) => Promise<void>;
    
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
            const response = await DisputeService.openDispute(payload);
            set({ myDisputes: [response.data, ...get().myDisputes], isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal mengajukan komplain', isLoading: false });
            throw err;
        }
    },

    /**
     * ⚡ Action untuk Seller menyetujui retur
     */
    acceptReturn: async (disputeId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await DisputeService.acceptReturn(disputeId);
            // Update data di state lokal agar UI berubah tanpa reload
            const updatedDisputes = get().myDisputes.map(d => 
                d.id === disputeId ? response.data : d
            );
            set({ myDisputes: updatedDisputes, isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal menyetujui pengembalian', isLoading: false });
            throw err;
        }
    },

    /**
     * ⚡ Action untuk Buyer memasukkan resi retur
     */
   /**
     * ⚡ PERBAIKAN: Sync state lokal setelah berhasil submit resi
     */
    submitReturnResi: async (disputeId, payload) => {
        set({ isLoading: true, error: null });
        try {
            const response = await DisputeService.submitReturnResi(disputeId, payload);
            
            // Perbarui list lokal agar 'return_tracking_number' muncul di UI tanpa refresh
            const updatedDisputes = get().myDisputes.map(d => 
                d.id === disputeId ? { ...d, ...response.data } : d
            );

            set({ 
                myDisputes: updatedDisputes, 
                isLoading: false 
            });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal mengirim nomor resi', isLoading: false });
            throw err;
        }
    },

    clearError: () => set({ error: null })
}));
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

    // ⚡ Actions untuk Alur Pengembalian (SLA Lifecycle)
    acceptReturn: (disputeId: string) => Promise<void>;
    submitReturnResi: (disputeId: string, payload: SubmitReturnResiPayload) => Promise<void>;
    confirmReturnReceived: (disputeId: string) => Promise<void>; // ⚡ BARU: Konfirmasi retur sampai

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
     * ⚡ [SELLER] Action untuk menyetujui retur
     * Akan memicu pencatatan `accepted_at` di Backend
     */
    acceptReturn: async (disputeId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await DisputeService.acceptReturn(disputeId);
            // Update data di state lokal agar UI berubah tanpa reload
            const updatedDisputes = get().myDisputes.map(d =>
                d.id === disputeId ? { ...d, ...response.data } : d
            );
            set({ myDisputes: updatedDisputes, isLoading: false });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal menyetujui pengembalian', isLoading: false });
            throw err;
        }
    },

    /**
     * ⚡ [BUYER] Action untuk memasukkan resi retur
     * Payload kini membawa { tracking_number, courier }
     */
    submitReturnResi: async (disputeId, payload) => {
        set({ isLoading: true, error: null });
        try {
            const response = await DisputeService.submitReturnResi(disputeId, payload);

            // Perbarui list lokal agar 'return_tracking_number', 'return_courier', 
            // dan 'resi_submitted_at' langsung ter-hydrate ke UI tanpa refresh
            const updatedDisputes = get().myDisputes.map(d =>
                d.id === disputeId ? { ...d, ...response.data } : d
            );

            set({
                myDisputes: updatedDisputes,
                isLoading: false
            });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal mengirim nomor resi pengembalian', isLoading: false });
            throw err;
        }
    },

    /**
     * ⚡ [SELLER / ADMIN] Action konfirmasi penerimaan barang retur
     * Akan memicu resolusi 'refund_full' secara otomatis di Backend
     */
    confirmReturnReceived: async (disputeId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await DisputeService.confirmReturnReceived(disputeId);

            // Sinkronisasi status 'resolved' dan penghapusan timer SLA ke UI
            const updatedDisputes = get().myDisputes.map(d =>
                d.id === disputeId ? { ...d, ...response.data } : d
            );

            set({
                myDisputes: updatedDisputes,
                isLoading: false
            });
        } catch (error: any) {
            const err = error as ApiError;
            set({ error: err.message || 'Gagal mengonfirmasi penerimaan barang retur', isLoading: false });
            throw err;
        }
    },

    clearError: () => set({ error: null })
}));
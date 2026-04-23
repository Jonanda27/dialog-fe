// File: dialog-fe/services/api/dispute.service.ts

import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import {
    Dispute,
    OpenDisputePayload,
    ResolveDisputePayload,
    SubmitReturnResiPayload
} from '../../types/dispute';

export const DisputeService = {
    openDispute: async (payload: OpenDisputePayload): Promise<ApiResponse<Dispute>> => {
        const formData = new FormData();
        formData.append('order_id', payload.order_id);
        formData.append('reason', payload.reason);

        if (payload.evidences && payload.evidences.length > 0) {
            payload.evidences.forEach((file) => {
                formData.append('files', file);
            });
        }

        return await axiosClient.post<any, ApiResponse<Dispute>>('/disputes/open', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    getMyDisputes: async (): Promise<ApiResponse<Dispute[]>> => {
        return await axiosClient.get<any, ApiResponse<Dispute[]>>('/disputes');
    },

    /**
     * ⚡ [SELLER] Menyetujui pengembalian barang.
     * Mengubah status dispute menjadi 'returning'.
     */
    acceptReturn: async (disputeId: string): Promise<ApiResponse<Dispute>> => {
        return await axiosClient.patch<any, ApiResponse<Dispute>>(`/disputes/${disputeId}/accept-return`);
    },

    /**
     * ⚡ [BUYER] Memasukkan nomor resi pengembalian barang ke Seller.
     */
    submitReturnResi: async (disputeId: string, payload: SubmitReturnResiPayload): Promise<ApiResponse<Dispute>> => {
        return await axiosClient.patch<any, ApiResponse<Dispute>>(`/disputes/${disputeId}/submit-return-resi`, payload);
    },

    getAllDisputes: async (): Promise<ApiResponse<Dispute[]>> => {
        return await axiosClient.get<any, ApiResponse<Dispute[]>>('/disputes/admin');
    },

    resolveDispute: async (disputeId: string, payload: ResolveDisputePayload): Promise<ApiResponse<Dispute>> => {
        return await axiosClient.patch<any, ApiResponse<Dispute>>(`/api/auth/disputes/${disputeId}/resolve`, payload);
    },
    
    confirmReturnReceived: async (disputeId: string): Promise<ApiResponse<Dispute>> => {
    return await axiosClient.patch<any, ApiResponse<Dispute>>(`/disputes/${disputeId}/confirm-return`);
},
};
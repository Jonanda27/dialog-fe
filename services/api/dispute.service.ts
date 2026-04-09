// File: dialog-fe/services/api/dispute.service.ts

import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import {
    Dispute,
    OpenDisputePayload,
    ResolveDisputePayload
} from '../../types/dispute';

export const DisputeService = {
    /**
     * [BUYER] Membuka sengketa/komplain terhadap pesanan yang bermasalah.
     * Secara otomatis membungkus data teks dan array file bukti ke dalam FormData.
     */
    openDispute: async (payload: OpenDisputePayload): Promise<ApiResponse<Dispute>> => {
        const formData = new FormData();

        // Append Data Teks
        formData.append('order_id', payload.order_id);
        formData.append('reason', payload.reason);

        // Append File Bukti (Array)
        if (payload.evidences && payload.evidences.length > 0) {
            payload.evidences.forEach((file) => {
                // Asumsi BE menggunakan multer upload.array('evidences')
                formData.append('evidences', file);
            });
        }

        // Header Content-Type akan diatur otomatis oleh Axios menjadi multipart/form-data
        return await axiosClient.post<any, ApiResponse<Dispute>>('/disputes', formData);
    },

    /**
     * [BUYER / SELLER] Mengambil daftar sengketa yang melibatkan user saat ini.
     */
    getMyDisputes: async (): Promise<ApiResponse<Dispute[]>> => {
        return await axiosClient.get<any, ApiResponse<Dispute[]>>('/disputes');
    },

    /**
     * [ADMIN] Mengambil seluruh daftar sengketa di platform untuk ditinjau.
     */
    getAllDisputes: async (): Promise<ApiResponse<Dispute[]>> => {
        return await axiosClient.get<any, ApiResponse<Dispute[]>>('/disputes/admin');
    },

    /**
     * [ADMIN] Memberikan keputusan final untuk suatu sengketa.
     * Akan memicu mutasi finansial (Refund/Release Escrow) di Backend.
     */
    resolveDispute: async (disputeId: string, payload: ResolveDisputePayload): Promise<ApiResponse<Dispute>> => {
        // Rute ini murni menerima JSON
        return await axiosClient.put<any, ApiResponse<Dispute>>(`/disputes/${disputeId}/resolve`, payload);
    }
};
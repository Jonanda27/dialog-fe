// File: dialog-fe/services/api/payment.service.ts

import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import {
    SimulateWebhookPayload,
    PaymentResult
} from '../../types/payment';

export const PaymentService = {
    /**
     * Mensimulasikan notifikasi Webhook dari Payment Gateway (misal: Midtrans/Xendit).
     * Digunakan untuk mengubah status pesanan dari 'pending_payment' menjadi 'paid'.
     */
    simulateWebhook: async (payload: SimulateWebhookPayload): Promise<ApiResponse<PaymentResult>> => {
        return await axiosClient.post<any, ApiResponse<PaymentResult>>('/payments/webhook', payload);
    },

    /**
     * [FUNGSI MASA DEPAN] Mengambil Token Pembayaran saat pengguna menekan tombol "Bayar".
     * Endpoint ini biasanya me-return Snap Token (Midtrans) atau Invoice URL.
     * @param orderId ID pesanan yang baru saja di-checkout
     */
    getPaymentToken: async (orderId: string): Promise<ApiResponse<{ token: string, redirect_url: string }>> => {
        return await axiosClient.get<any, ApiResponse<{ token: string, redirect_url: string }>>(`/payments/${orderId}/token`);
    }
};
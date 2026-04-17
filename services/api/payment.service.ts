// File: dialog-fe/services/api/payment.service.ts

import axiosClient from './axiosClient';
import { ApiResponse } from '../../types/api';
import {
    SimulateWebhookPayload,
    PaymentResult,
    PaymentGatewayResponse
} from '../../types/payment';

export const PaymentService = {
    /**
     * Mengambil Snap Token Midtrans berdasarkan Billing ID.
     * Digunakan untuk memicu window.snap.pay(token)
     */
    createPaymentSession: async (billingId: string): Promise<ApiResponse<PaymentGatewayResponse>> => {
        return await axiosClient.post<any, ApiResponse<PaymentGatewayResponse>>('/payments/create-session', { 
            billing_id: billingId 
        });
    },

    /**
     * Mengambil detail status billing.
     * Digunakan oleh Polling di halaman pembayaran untuk mendeteksi kapan user selesai bayar.
     */
    getBillingStatus: async (billingId: string): Promise<ApiResponse<PaymentResult>> => {
        return await axiosClient.get<any, ApiResponse<PaymentResult>>(`/payments/billing/${billingId}`);
    },

    /**
     * [DEVELOPMENT ONLY] Mensimulasikan pembayaran berhasil.
     * Berguna untuk testing alur 'paid' tanpa harus buka Simulator Midtrans.
     */
    simulateWebhook: async (payload: SimulateWebhookPayload): Promise<ApiResponse<any>> => {
        return await axiosClient.post<any, ApiResponse<any>>('/payments/webhook-simulation', payload);
    },

    /**
     * (Tambahan) Memberitahu backend untuk memverifikasi status ke Midtrans secara manual.
     * Kadang webhook telat, fungsi ini memaksa backend mengecek ke API Midtrans.
     */
    verifyPayment: async (billingId: string): Promise<ApiResponse<PaymentResult>> => {
        return await axiosClient.post<any, ApiResponse<PaymentResult>>(`/payments/verify/${billingId}`);
    }
};
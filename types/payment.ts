// File: dialog-fe/types/payment.ts

import { Order } from './order';

/**
 * Payload yang dikirim FE saat mensimulasikan Webhook dari Payment Gateway
 * (Berdasarkan parameter di paymentController.js)
 */
export interface SimulateWebhookPayload {
    order_id: string;
    payment_method: string;
    payment_reference: string;
}

/**
 * Standar balasan umum dari layanan Payment Gateway (Midtrans/Xendit)
 * Disiapkan untuk ekstensi di masa depan saat checkout menghasilkan token pembayaran.
 */
export interface PaymentGatewayResponse {
    token?: string;
    redirect_url?: string;
    transaction_id?: string;
    status?: string;
}

/**
 * Representasi gabungan saat API payment mengembalikan data Order yang sudah di-update
 */
export interface PaymentResult {
    order: Order;
    payment_status: string;
}
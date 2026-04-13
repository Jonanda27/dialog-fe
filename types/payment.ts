import { Order } from './order';

/**
 * Definisi Metode Pembayaran yang didukung.
 */
export type PaymentMethod = 'va_bca' | 'va_mandiri' | 'va_bni' | 'qris' | 'wallet';

/**
 * Informasi detail pembayaran untuk ditampilkan ke Buyer (Virtual Account Info).
 */
export interface PaymentDetails {
    bank_name?: string;
    va_number?: string;
    qr_url?: string; // Jika menggunakan QRIS
    expiry_time: string; // ISO Date string
    amount: number | string;
    instructions?: string[]; // Langkah-langkah pembayaran
}

/**
 * Response saat API payment mengembalikan data status terkini.
 */
export interface PaymentResult {
    order: Order;
    payment_status: 'pending' | 'success' | 'failure' | 'expired';
    payment_details?: PaymentDetails;
}

/**
 * Payload untuk simulasi status pembayaran (Internal/Development only).
 */
export interface SimulateWebhookPayload {
    order_id: string;
    payment_method: string;
    payment_reference: string;
    status: 'success' | 'failure';
}

/**
 * Integrasi dengan Payment Gateway (Midtrans/Xendit).
 */
export interface PaymentGatewayResponse {
    token?: string;       // Snap Token (Midtrans)
    redirect_url?: string;
    transaction_id?: string;
    status?: string;
}
import { Order } from './order';

/**
 * Metadata untuk Master Billing
 */
export interface Billing {
    id: string;
    buyer_id: string;
    total_amount: number | string;
    status: 'unpaid' | 'paid' | 'expired' | 'cancelled';
    snap_token?: string;
    payment_method?: string | null;
    payment_reference?: string | null;
    created_at: string;
    updated_at: string; // Tambahkan ini agar sinkron dengan DB
}

/**
 * Response saat membuat sesi pembayaran Midtrans
 */
export interface PaymentGatewayResponse {
    token: string;          // Midtrans Snap Token
    redirect_url: string;   // URL halaman pembayaran Midtrans
}

/**
 * Payload untuk simulasi webhook
 */
export interface SimulateWebhookPayload {
    order_id: string; 
    payment_method: string;
    payment_reference: string;
}

/**
 * Response status pembayaran untuk UI
 */
export interface PaymentResult {
    billing: Billing; // Dibuat non-optional karena backend selalu kirim ini
    orders: Order[];  // Detail order yang dibayar
    payment_status: 'pending' | 'success' | 'failure' | 'expired';
}
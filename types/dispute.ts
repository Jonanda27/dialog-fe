// types/dispute.ts

import { Order } from './order';
import { User } from './auth';
import { Store } from './store';

/**
 * Literal Type untuk status sengketa
 * ⚡ PERBAIKAN: Disinkronkan penuh dengan ENUM PostgreSQL di Backend
 * Termasuk penambahan status SLA dan kegagalan finansial.
 */
export type DisputeStatus =
    | 'open'
    | 'returning'
    | 'arrived_at_seller'
    | 'mediation'
    | 'escalated'
    | 'resolved'
    | 'refund_failed';

/**
 * Keputusan final dari Admin atau Otomatisasi Sistem
 */
export type ResolutionType = 'refund_full' | 'reject_buyer' | 'refund_partial';

export interface DisputeMedia {
    id: string;
    dispute_id: string;
    uploader_id: string;
    media_url: string;
    createdAt: string;
}

export interface Dispute {
    id: string;
    order_id: string;
    buyer_id: string;
    store_id: string;
    reason: string;
    status: DisputeStatus;

    // ⚡ Pilar Data Logistik Retur
    return_tracking_number?: string | null;
    return_courier?: string | null; // Kolom baru untuk mencegah blindspot API Kurir

    admin_decision_notes?: string | null;

    // ⚡ Pilar SLA Timestamps (Waktu Absolut untuk perhitungan Countdown UI)
    accepted_at?: string | null;
    resi_submitted_at?: string | null;
    arrived_at?: string | null;
    mediation_start_at?: string | null;

    createdAt: string;
    updated_at: string;

    // Relasi Opsional (Eager Loading dari BE)
    order?: Order;
    buyer?: Pick<User, 'id' | 'email'> & { name?: string; full_name?: string };
    store?: Pick<Store, 'id' | 'name'>;
    media?: DisputeMedia[];
}

export interface OpenDisputePayload {
    order_id: string;
    reason: string;
    evidences?: File[];
}

/**
 * ⚡ Payload alur pengembalian
 * Ditambahkan field courier agar sejalan dengan modifikasi di sisi backend
 */
export interface SubmitReturnResiPayload {
    tracking_number: string;
    courier: string;
}

export interface ResolveDisputePayload {
    resolution_type: ResolutionType;
    admin_notes: string;
    refund_amount?: number;
}
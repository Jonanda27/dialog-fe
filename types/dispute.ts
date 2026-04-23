// File: dialog-fe/types/dispute.ts

import { Order } from './order';
import { User } from './auth';
import { Store } from './store';

/**
 * Literal Type untuk status sengketa
 * Ditambahkan 'returning' untuk alur retur barang oleh buyer
 */
export type DisputeStatus = 'open' | 'returning' | 'resolved';

/**
 * Keputusan final dari Admin
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
    return_tracking_number?: string | null; // ⚡ Kolom baru untuk resi retur
    admin_decision_notes?: string | null;
    createdAt: string;
    updated_at: string;

    // Relasi Opsional
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
 * ⚡ Payload baru untuk alur pengembalian
 */
export interface SubmitReturnResiPayload {
    tracking_number: string;
}

export interface ResolveDisputePayload {
    resolution_type: ResolutionType;
    admin_notes: string;
    refund_amount?: number; 
}
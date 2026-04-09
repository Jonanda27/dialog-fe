// File: dialog-fe/types/store.ts

/**
 * Literal Type untuk status verifikasi Toko
 */
export type StoreStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

/**
 * Literal Type untuk jenis mutasi dompet
 */
export type TransactionType = 'CREDIT' | 'DEBIT';

/**
 * Literal Type untuk sumber aliran dana
 */
export type TransactionSource = 'order_release' | 'withdrawal' | 'adjustment';

/**
 * Representasi tabel Stores di Database
 */
export interface Store {
    id: string;
    user_id: string;
    name: string;
    description?: string | null;
    status: StoreStatus;
    ktp_url?: string | null;
    balance: string | number; // Decimal/Numeric sering di-parse sebagai string oleh driver DB
    created_at: string;
    updated_at: string;
}

/**
 * Representasi tabel WalletTransactions di Database
 */
export interface WalletTransaction {
    id: string;
    store_id: string;
    type: TransactionType;
    amount: string | number;
    source: TransactionSource;
    reference_id?: string | null; // Bisa berupa ID Order atau ID Withdrawal
    created_at: string;
}

/**
 * Payload yang dikirim FE saat mendaftar toko baru
 */
export interface RegisterStorePayload {
    name: string;
    description: string;
}

/**
 * Payload State untuk form upload KTP (Sebelum dikonversi ke FormData di Service)
 */
export interface KYCUpdatePayload {
    ktp_file: File | null;
}

/**
 * Balasan dari endpoint GET /stores/wallet
 */
export interface StoreWalletResponse {
    balance: number;
    transactions: WalletTransaction[];
}
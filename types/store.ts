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
 * Struktur media sosial yang disimpan dalam kolom JSON di DB
 */
export interface SocialLinks {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    website?: string;
}

/**
 * Representasi tabel Stores di Database
 */
export interface Store {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    logo_url: string | null;      // Sesuai Model DB
    banner_url: string | null;    // Sesuai Model DB
    working_days: string | null;  // Sesuai Model DB
    working_hours: string | null; // Sesuai Model DB (Sebelumnya operating_hours)
    social_links: SocialLinks;    // Sesuai Model DB (Kolom JSON)
    status: StoreStatus;
    ktp_url: string | null;
    balance: string | number;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_name: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Payload yang dikirim ke backend untuk update profil.
 * Karena ada file (banner/logo), biasanya dikirim via FormData di service.
 */
export interface UpdateStorePayload {
    name?: string;
    description?: string;
    whatsapp?: string; // Jika Anda menambahkan kolom whatsapp di DB, pastikan ada di model
    working_days?: string;
    working_hours?: string; // Disamakan dengan nama kolom di DB
    instagram?: string;
    facebook?: string;
    youtube?: string;
    website?: string;
    banner_url?: File | string | null; // Bisa File (saat upload) atau string (saat update teks saja)
    logo_url?: File | string | null;   // Bisa File (saat upload) atau string (saat update teks saja)
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
    reference_id: string | null;
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
 * Payload State untuk form upload KTP
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

export interface BankAccountPayload {
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
}
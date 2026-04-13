/**
 * Enum untuk Role User, memastikan tidak ada typo saat pengecekan role di FE.
 */
export type UserRole = 'buyer' | 'seller' | 'admin';

/**
 * Enum untuk Status Akun User.
 */
export type UserStatus = 'active' | 'suspended' | 'banned';

/**
 * Representasi tabel Users di Database
 */
export interface User {
    id: string;
    email: string;
    full_name: string; // ⚡ PERBAIKAN: Diubah dari 'name' menjadi 'full_name' menyesuaikan Backend
    role: UserRole;
    status: UserStatus;
    avatar_url?: string | null;
    created_at: string;
    updated_at: string;
    // Data toko (Eager Loading)
    store?: {
        id: string;
        status: 'pending' | 'approved' | 'rejected' | 'suspended';
    } | null;
}

/**
 * Payload yang dikirim FE saat submit form Login
 */
export interface LoginPayload {
    email: string;
    password: string;
}

/**
 * Payload yang dikirim FE saat submit form Register
 */
export interface RegisterPayload {
    full_name: string; // ⚡ PERBAIKAN: Diubah dari 'name' menjadi 'full_name'
    email: string;
    password: string;
    role: UserRole;
}

/**
 * Balasan dari BE ketika Login sukses
 */
export interface AuthResponse {
    user: User;
    token: string;
}
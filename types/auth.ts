// File: dialog-fe/types/auth.ts

import { Store } from './store'; // ⚡ IMPORT: Mengacu pada interface Store yang sudah di-update

/**
 * Enum untuk Role User, memastikan tidak ada typo saat pengecekan role di FE.
 */
export type UserRole = 'buyer' | 'seller' | 'admin';

/**
 * Enum untuk Status Akun User (Level User Global).
 */
export type UserStatus = 'active' | 'suspended' | 'banned';

/**
 * Representasi tabel Users di Database
 */
export interface User {
    username: string;
    id: string;
    email: string;
    full_name: string; // ⚡ SESUAI BACKEND 
    role: UserRole;
    status: UserStatus;
    avatar_url?: string | null;
    created_at: string;
    updated_at: string;
    
    /**
     * Data toko (Eager Loading)
     * ⚡ PERBAIKAN: Menggunakan interface Store dari store.ts 
     * agar properti 'suspensions' otomatis dikenali.
     */
    store?: Store | null; 
}

/**
 * Payload yang dikirim FE saat submit form Login
 */
export interface LoginPayload {
    email: string;
    password: string;
}

/**
 * Interface mendeskripsikan state formulir pembuatan lelang di sisi Frontend.
 * Saat dikirim ke API, wajib dikonversi menjadi FormData.
 */
export interface CreateAuctionFormState {
    item_name: string;
    description: string;
    condition: 'NEW' | 'USED';
    weight: number;
    length: number;
    width: number;
    height: number;
    start_price: number;
    increment: number; // Input untuk Minimum Increment
    start_time: string;
    end_time: string;
    photos: File[];
}
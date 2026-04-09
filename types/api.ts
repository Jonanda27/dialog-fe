// File: dialog-fe/types/api.ts

/**
 * Standar format respon sukses dari Backend (utils/apiResponse.js)
 * Menggunakan Generic Type <T> agar tipe data (payload) bisa dinamis.
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        total_pages?: number;
    };
}

/**
 * Format Error Field spesifik dari Zod Validation (Backend Phase A)
 */
export interface ValidationErrorField {
    field: string;
    message: string;
}

/**
 * Format Error yang sudah dipetakan oleh Axios Interceptor Frontend.
 * Ini yang akan ditangkap oleh blok catch() di komponen React.
 */
export interface ApiError {
    status: number;
    message: string;
    errors: ValidationErrorField[] | null;
    isAuthError?: boolean; // Flag penanda jika error 401 (Sesi habis)
}
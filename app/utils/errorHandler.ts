// ⚡ PERBAIKAN: Menggunakan alias @/ agar file ini kebal diletakkan di folder mana pun
import { ApiError, ValidationErrorField } from '@/types/api';

/**
 * Mengekstrak pesan error utama yang ramah pengguna untuk ditampilkan di Toast/Pop-up.
 * Mampu menangani ApiError kustom dari Axios Interceptor maupun error bawaan JS.
 * * @param error Objek error yang ditangkap di blok catch (catch (err))
 * @returns String pesan error yang siap dirender ke UI
 */
export const getGlobalErrorMessage = (error: unknown): string => {
    // 1. Cek apakah ini adalah ApiError kustom dari interceptor kita
    if (typeof error === 'object' && error !== null && 'status' in error) {
        const apiErr = error as ApiError;

        // Kasus Khusus 1: Network Error / Server Down
        if (apiErr.status === 0) {
            return 'Koneksi terputus. Pastikan perangkat Anda terhubung ke internet.';
        }

        // Kasus Khusus 2: Error Validasi (400) yang memiliki detail array
        // Jika ada array validasi, kita gabungkan menjadi satu kalimat (fallback jika UI tidak mensupport inline error)
        if (apiErr.status === 400 && apiErr.errors && apiErr.errors.length > 0) {
            const firstError = apiErr.errors[0];
            return `Validasi gagal: ${firstError.message}`;
        }

        // Kasus Khusus 3: Internal Server Error (500+)
        if (apiErr.status >= 500) {
            return 'Sistem sedang mengalami gangguan. Tim kami sedang menanganinya.';
        }

        // Default: Kembalikan pesan utama dari Backend (401, 403, 404, 409)
        return apiErr.message || 'Terjadi kesalahan sistem.';
    }

    // 2. Fallback untuk error bawaan JavaScript (misal: TypeError, ReferenceError)
    if (error instanceof Error) {
        return error.message;
    }

    // 3. Fallback terakhir jika tipe error benar-benar tidak dikenali
    return 'Terjadi kesalahan yang tidak terduga. Silakan coba beberapa saat lagi.';
};

/**
 * Mengekstrak detail error validasi form (400 Bad Request) menjadi map Key-Value.
 * Sangat berguna untuk Inline Form Validation (menandai kotak input warna merah).
 * * @param error Objek error yang ditangkap di blok catch
 * @returns Objek Record (misal: { email: "Email sudah terdaftar", password: "Min 8 karakter" })
 */
export const getFieldErrors = (error: unknown): Record<string, string> | null => {
    if (typeof error === 'object' && error !== null && 'status' in error) {
        const apiErr = error as ApiError;

        // Pastikan error adalah 400 dan memiliki array errors dari Backend (Zod/Express Validator)
        if (apiErr.status === 400 && apiErr.errors && Array.isArray(apiErr.errors)) {
            const fieldErrorMap: Record<string, string> = {};

            apiErr.errors.forEach((errField: ValidationErrorField) => {
                // Mencegah key yang sama tertimpa, kita ambil pesan error pertama dari field tersebut
                if (!fieldErrorMap[errField.field]) {
                    fieldErrorMap[errField.field] = errField.message;
                }
            });

            return fieldErrorMap;
        }
    }

    // Kembalikan null jika bukan error validasi, agar UI form mengabaikannya
    return null;
};
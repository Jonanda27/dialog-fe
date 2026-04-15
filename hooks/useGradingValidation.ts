// File: hooks/useGradingValidation.ts

import { useCallback, useState } from 'react';
import GradingService from '@/services/api/grading.service';
import { GradingRequest, GradingStatus } from '@/types/grading';
import { CartItem } from '@/types/cart';
import { toast } from 'sonner';

interface GradingValidationResult {
    isValid: boolean;
    invalidItems: CartItem[]; // Items dengan grading belum siap
    invalidGradings: GradingRequest[];
    errorMessage?: string;
}

/**
 * ⚡ HOOK UNTUK VALIDASI MANDATORY GRADING SEBELUM CHECKOUT
 * 
 * Logika:
 * 1. Scan cartItems yang memiliki flag `requires_grading: true`
 * 2. Untuk setiap item, crosscheck status grading ke backend
 * 3. Jika ada yang bukan MEDIA_READY atau EXPIRED, return invalid
 * 4. Throw error dengan pesan yang jelas
 */
export const useGradingValidation = () => {
    const [isValidating, setIsValidating] = useState(false);

    /**
     * Validasi grading untuk setiap item di cart.
     * Return: { isValid, invalidItems, invalidGradings }
     */
    const validateCartItemsGrading = useCallback(
        async (cartItems: CartItem[]): Promise<GradingValidationResult> => {
            // 1. Filter items yang memerlukan grading
            const itemsRequiringGrading = cartItems.filter(
                (item) => (item.product.metadata as any)?.request_grading === true
            );

            // 2. Jika tidak ada item dengan grading requirement, validation passed
            if (itemsRequiringGrading.length === 0) {
                return {
                    isValid: true,
                    invalidItems: [],
                    invalidGradings: [],
                };
            }

            setIsValidating(true);

            try {
                // 3. Fetch buyer's active grading requests dari backend
                const response = await GradingService.getBuyerRequests();
                const buyerGradings = response.data || [];

                // 4. Cross-check: Setiap item yang require grading HARUS punya grading yang MEDIA_READY
                const invalidItems: CartItem[] = [];
                const invalidGradings: GradingRequest[] = [];

                for (const item of itemsRequiringGrading) {
                    const gradingForThisProduct = buyerGradings.find(
                        (g) => g.product_id === item.product.id
                    );

                    // Case 1: Tidak ada grading request sama sekali
                    if (!gradingForThisProduct) {
                        invalidItems.push(item);
                        continue;
                    }

                    // Case 2: Grading ada tapi belum MEDIA_READY
                    const validStatuses: GradingStatus[] = ['MEDIA_READY'];
                    if (!validStatuses.includes(gradingForThisProduct.status)) {
                        invalidItems.push(item);
                        invalidGradings.push(gradingForThisProduct);
                    }
                }

                // 5. Jika ada invalid items, return tidak valid
                if (invalidItems.length > 0) {
                    const errorMessage = buildGradingErrorMessage(invalidGradings);
                    return {
                        isValid: false,
                        invalidItems,
                        invalidGradings,
                        errorMessage,
                    };
                }

                // 6. Semua valid, checkout bisa proceed
                return {
                    isValid: true,
                    invalidItems: [],
                    invalidGradings: [],
                };
            } catch (error: any) {
                console.error('Error validating grading:', error);
                return {
                    isValid: false,
                    invalidItems: cartItems.filter((item) => (item.product.metadata as any)?.request_grading === true),
                    invalidGradings: [],
                    errorMessage: 'Gagal memvalidasi grading. Coba lagi atau hubungi support.',
                };
            } finally {
                setIsValidating(false);
            }
        },
        []
    );

    /**
     * Helper: Build human-readable error message berdasarkan grading status
     */
    const buildGradingErrorMessage = (invalidGradings: GradingRequest[]): string => {
        if (invalidGradings.length === 0) {
            return 'Anda harus melakukan request grading sebelum checkout untuk produk-produk tertentu.';
        }

        const statusCounts: Record<GradingStatus, number> = {} as any;
        invalidGradings.forEach((g) => {
            statusCounts[g.status] = (statusCounts[g.status] || 0) + 1;
        });

        const messages: string[] = [];

        if (statusCounts['AWAITING_SELLER_MEDIA']) {
            messages.push(
                `${statusCounts['AWAITING_SELLER_MEDIA']} produk menunggu penjual mengunggah video grading.`
            );
        }
        if (statusCounts['EXPIRED']) {
            messages.push(
                `${statusCounts['EXPIRED']} permintaan grading telah kadaluarsa. Silakan buat request baru.`
            );
        }
        if (statusCounts['SYSTEM_CANCELLED']) {
            messages.push(
                `${statusCounts['SYSTEM_CANCELLED']} permintaan grading telah dibatalkan. Silakan coba lagi.`
            );
        }
        if (statusCounts['requested'] || statusCounts['cancelled']) {
            messages.push('Ada permintaan grading dengan status tidak valid. Silakan hubungi support.');
        }

        return messages.length > 0
            ? `Tidak bisa checkout sekarang: ${messages.join(' ')}`
            : 'Tunggu sampai grading video selesai diunggah oleh penjual sebelum checkout.';
    };

    return {
        validateCartItemsGrading,
        isValidating,
    };
};

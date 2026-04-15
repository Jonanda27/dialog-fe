import { Product } from './product';
import { GradingStatus } from './grading';

export interface CartItem {
    cart_item_id: string; // ID unik untuk item di keranjang (karena bisa ada produk sama dengan qty beda, meski jarang di barang bekas)
    product: Product;
    quantity: number;

    // ⚡ GRADING TRACKING: Link ke GradingRequest jika ada
    grading_request_id?: string;        // ID grading request (jika ada)
    grading_status?: GradingStatus;     // Status terkini dari grading
    requires_grading?: boolean;         // Flag apakah item memerlukan grading sebelum checkout
}
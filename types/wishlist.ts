// File: dialog-fe/types/wishlist.ts

import { Product } from './product';

export interface WishlistItem {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;
    updated_at: string;
    product: Product; // Berisi detail produk, media_url, dan data store
}

export interface AddWishlistPayload {
    product_id: string;
}
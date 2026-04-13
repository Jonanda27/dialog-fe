import { Product } from './product';

export interface CartItem {
    cart_item_id: string; // ID unik untuk item di keranjang (karena bisa ada produk sama dengan qty beda, meski jarang di barang bekas)
    product: Product;
    quantity: number;
}
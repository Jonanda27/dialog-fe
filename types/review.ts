// Definisi Media di dalam Review
export interface ReviewMedia {
  id: string;
  review_id: string;
  media_url: string;
}

// Struktur Data Review Utama
export interface Review {
  id: string;
  buyer_id: string;
  store_id: string;
  product_id: string;
  order_item_id: string;
  rating: number;
  comment: string | null;
  seller_reply: string | null;
  createdAt: string;
  updated_at: string;
  // Relasi (Eager Loaded dari Backend)
  buyer?: {
    id: string;
    full_name: string;
  };
  product?: {
    id: string;
    name: string;
  };
  media?: ReviewMedia[];
}

// Payload untuk membuat review baru
export interface CreateReviewPayload {
  order_item_id: string;
  rating: number;
  comment?: string;
  photos?: File[]; // Untuk multipart/form-data
}

// Statistik Review Toko
export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
}

export interface ReplyReviewPayload {
    seller_reply: string;
}
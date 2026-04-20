import { Product } from './product';

export type AuctionStatus = 'SCHEDULED' | 'ACTIVE' | 'FREEZE' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Auction {
    id: string;
    product_id: string;
    seller_id: string;
    start_price: number;
    increment: number;
    current_price: number;
    start_time: string;
    end_time: string;
    status: AuctionStatus;
    created_at?: string;
    updated_at?: string;
    product?: Product;
}

export interface AuctionBid {
    id: string;
    auction_id: string;
    buyer_id: string;
    bid_amount: number;
    created_at: string;
}

export interface CreateAuctionPayload {
    product_id: string;
    start_price: number;
    increment: number;
    start_time: string;
    end_time: string;
}
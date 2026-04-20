import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/api';
import { Auction, CreateAuctionPayload } from '@/types/auction';

export const auctionService = {
    createAuction: async (payload: CreateAuctionPayload): Promise<ApiResponse<Auction>> => {
        const response = await axiosClient.post('/v1/auctions', payload);
        return response.data;
    },

    getMyStoreAuctions: async (): Promise<ApiResponse<Auction[]>> => {
        const response = await axiosClient.get('/v1/auctions/my-store');
        return response.data;
    },

    cancelAuction: async (id: string): Promise<ApiResponse<null>> => {
        const response = await axiosClient.delete(`/v1/auctions/${id}/cancel`);
        return response.data;
    }
};
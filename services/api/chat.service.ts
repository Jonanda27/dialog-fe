import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/api';
import { ChatMessage, ChatList } from '@/types/chat';

export const ChatService = {
    /**
     * Mengambil riwayat chat dengan toko tertentu
     */
    getHistory: async (storeId: string): Promise<ApiResponse<ChatMessage[]>> => {
        return await axiosClient.get(`/chat/history/${storeId}`);
    },

    /**
     * Mengambil daftar toko yang pernah dihubungi user
     */
    getChatList: async (): Promise<ApiResponse<ChatList[]>> => {
        return await axiosClient.get('/chat/list');
    }
};
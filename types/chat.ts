// types/chat.ts

export type MessageType = 'text' | 'image' | 'video';

export interface ChatMessage {
    id: string;
    sender_id: string;
    receiver_id: string | null;
    store_id: string;
    message: string;
    message_type: MessageType; // Tambahkan ini
    file_url: string | null;    // Tambahkan ini
    is_read: boolean;
    createdAt: string;
    sender?: {
        id: string;
        full_name: string;
    };
}

export interface ChatList {
    store_id: string;
    store: {
        id: string;
        name: string;
        logo_url: string | null;
    };
}

export interface SendMessagePayload {
    receiverId: string | null;
    storeId: string;
    message: string;
    messageType: MessageType; // Sesuaikan dengan payload yang dikirim di chat.tsx
    fileUrl: string | null;    // Sesuaikan dengan payload yang dikirim di chat.tsx
}
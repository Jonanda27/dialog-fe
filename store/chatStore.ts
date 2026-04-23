// store/chatStore.ts
import { create } from 'zustand';
import { ChatMessage } from '@/types/chat';

interface ChatState {
    messages: ChatMessage[];
    setMessages: (msgs: ChatMessage[]) => void;
    addMessage: (msg: ChatMessage) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    setMessages: (msgs) => set({ messages: msgs }),
    addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
}));
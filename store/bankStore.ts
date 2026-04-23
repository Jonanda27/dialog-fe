// store/useUserBankStore.ts
import { create } from 'zustand';
import { UserBankAccount, CreateUserBankPayload } from '../types/userBank';
import { UserBankService } from '../services/api/bank.service';

interface UserBankState {
    banks: UserBankAccount[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchBanks: () => Promise<void>;
    addBank: (payload: CreateUserBankPayload) => Promise<void>;
    removeBank: (id: string) => Promise<void>;
}

export const useUserBankStore = create<UserBankState>((set) => ({
    banks: [],
    isLoading: false,
    error: null,

    fetchBanks: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await UserBankService.getMyBanks();
            // FIX: Access .data from the ApiResponse
            set({ banks: response.data, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    addBank: async (payload) => {
        set({ isLoading: true });
        try {
            const response = await UserBankService.addBank(payload);
            // FIX: Access .data from the ApiResponse
            const newBank = response.data; 
            
            set((state) => ({ 
                banks: [newBank, ...state.banks], 
                isLoading: false 
            }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            throw err;
        }
    },

    removeBank: async (id) => {
        try {
            await UserBankService.deleteBank(id);
            set((state) => ({
                banks: state.banks.filter((bank) => bank.id !== id)
            }));
        } catch (err: any) {
            set({ error: err.message });
        }
    }
}));
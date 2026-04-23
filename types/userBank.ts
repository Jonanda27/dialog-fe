// types/userBank.ts
export interface UserBankAccount {
    id: string;
    user_id: string;
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
    created_at: string;
    updated_at: string;
}

export interface CreateUserBankPayload {
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
}
export interface UserProfile {
    id: string;
    user_id: string;
    username: string | null;
    phone_number: string | null;
    gender: 'Laki-laki' | 'Perempuan' | null;
    birth_date: string | null;
    profile_picture_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface UpdateProfilePayload {
    username?: string;
    phone_number?: string;
    gender?: 'Laki-laki' | 'Perempuan';
    birth_date?: string;
    profile_picture?: File; // Untuk menangani unggah file gambar
}
import axiosClient from './axiosClient';
import { ApiResponse } from '@/types/api';
import { UserProfile, UpdateProfilePayload } from '@/types/userProfile';

export const UserProfileService = {
    /**
     * Mengambil data profil milik user yang sedang login
     */
    getMyProfile: async (): Promise<ApiResponse<UserProfile>> => {
        // Mengarah ke endpoint GET /api/v1/profile yang ada di backend
        return await axiosClient.get('/v1/profile');
    },

    /**
     * Memperbarui data profil (termasuk foto profil)
     * Menggunakan FormData karena mendukung upload file ke Cloudinary
     */
    updateProfile: async (payload: UpdateProfilePayload): Promise<ApiResponse<UserProfile>> => {
        const formData = new FormData();

        // Memasukkan data teks ke FormData jika ada
        if (payload.username) formData.append('username', payload.username);
        if (payload.phone_number) formData.append('phone_number', payload.phone_number);
        if (payload.gender) formData.append('gender', payload.gender);
        if (payload.birth_date) formData.append('birth_date', payload.birth_date);

        // Memasukkan file gambar ke FormData sesuai fieldname di backend
        if (payload.profile_picture) {
            formData.append('profile_picture', payload.profile_picture);
        }

        // Mengirim permintaan ke PUT /api/v1/profile
        return await axiosClient.put('/v1/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
};
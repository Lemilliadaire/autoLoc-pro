// src/services/user.ts
import api from './api';
import type { User } from '../types/api';

export const updateUserPhoto = async (userId: number, photoFile: File): Promise<User> => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    // Method spoofing for Laravel if needed, or just use POST/PUT depending on backend
    formData.append('_method', 'PUT');

    const response = await api.post(`/users/${userId}/photo`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.user;
};

export const updateUserProfile = async (userId: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data.user;
};
export const updateUserPassword = async (userId: number, data: any): Promise<void> => {
    await api.put(`/users/${userId}/password`, data);
};

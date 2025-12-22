import api from './api';
import type { Admin, Voiture, Client, Reservation } from '../types/api';
import { getReservations } from './reservation';

export const getAdmins = async (): Promise<Admin[]> => {
    const response = await api.get('/admins');
    return response.data;
};

export const getAdmin = async (id: number): Promise<Admin> => {
    const response = await api.get(`/admins/${id}`);
    return response.data;
};

export const updateAdminProfile = async (id: number, data: Partial<Admin> | any): Promise<Admin> => {
    const response = await api.put(`/admins/${id}`, data);
    return response.data;
};

export const updateAdminPassword = async (id: number, data: any): Promise<void> => {
    await api.put(`/admins/${id}/password`, data);
};

export const updateAdminPhoto = async (id: number, photo: File): Promise<Admin> => {
    const formData = new FormData();
    formData.append('photo', photo);

    const response = await api.post(`/admins/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const deleteAdmin = async (id: number): Promise<void> => {
    await api.delete(`/admins/${id}`);
};

export interface DashboardStatsData {
    voitures: Voiture[];
    clients: Client[];
    reservations: Reservation[];
}

export const getDashboardStats = async (): Promise<DashboardStatsData> => {
    const [voituresRes, clientsRes, reservationsData] = await Promise.all([
        api.get('/voitures').catch(() => ({ data: [] })),
        api.get('/clients').catch(() => ({ data: [] })),
        getReservations().catch(() => [])
    ]);

    const voitures = voituresRes.data.data || voituresRes.data || [];
    const clients = clientsRes.data || [];
    const reservations = Array.isArray(reservationsData) ? reservationsData : [];

    return {
        voitures,
        clients,
        reservations
    };
};

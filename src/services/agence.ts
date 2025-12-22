// src/services/agence.ts
import type { Agence } from "../types/api";
import api from "./api";
import type { PaginatedResponse } from "../types/api";

// 👉 Fonction pour récupérer la liste des voitures
export const getVoitures = async (filters?: { agence_id?: number; statut?: string; page?: number }) => {
  const res = await api.get<PaginatedResponse>("/voitures", { params: filters });
  return res.data;
};

// 👉 Fonction pour récupérer toutes les agences 
export const getAgences = async (): Promise<Agence[]> => {
  const res = await api.get<Agence[]>("/agences");
  return res.data;
};

// 👉 Fonction pour récupérer une agence spécifique 
export const getAgence = async (id: number): Promise<Agence> => {
  const res = await api.get<Agence>(`/agences/${id}`);
  return res.data;
};

// 👉 Fonction pour créer une nouvelle agence
export const createAgence = async (data: FormData, token: string) => {
  return await api.post('/agences', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    },
  });
};

// 👉 Fonction pour mettre à jour une agence existante
export const updateAgence = async (id: number, data: Partial<Agence>, token: string) => {
  const res = await api.put<Agence>(`/agences/${id}`, data, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.data;
};

// 👉 Fonction pour supprimer une agence
export const deleteAgence = async (id: number, token: string) => {
  await api.delete(`/agences/${id}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
};
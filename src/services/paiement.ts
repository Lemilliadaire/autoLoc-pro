// src/services/paiement.ts
import api from "./api";
import type { Paiement } from "../types/api";

export interface PaiementCreationData {
    reservation_id: number;
    montant: number;
    methode: string;
    statut: string;
    date_paiement: string;
}

export const getPaiements = async (): Promise<Paiement[]> => {
    const response = await api.get<Paiement[]>("/paiements");
    return response.data;
};

export const getPaiement = async (id: number): Promise<Paiement> => {
    const response = await api.get<Paiement>(`/paiements/${id}`);
    return response.data;
};

export const createPaiement = async (data: PaiementCreationData): Promise<any> => {
    const response = await api.post("/paiements", data);
    return response.data;
};

export const updatePaiement = async (id: number, data: Partial<PaiementCreationData>): Promise<any> => {
    const response = await api.put(`/paiements/${id}`, data);
    return response.data;
};

export const deletePaiement = async (id: number): Promise<void> => {
    await api.delete(`/paiements/${id}`);
};

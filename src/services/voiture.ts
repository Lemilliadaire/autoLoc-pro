// src/services/voiture.ts

import type { Voiture } from "../types/api";
import type { PaginatedResponse } from "../types/api";
import api from "./api";

// Récupérer la liste des voitures  

export const getVoitures = async (filters?: { categorie_id?: number; agence_id?: number; statut?: string; page?: number; per_page?: number }) => {
  const res = await api.get<PaginatedResponse>("/voitures", { params: filters });
  return res.data;
};

// Récupérer une seule voiture par son ID
export const getVoiture = async (id: number): Promise<Voiture> => {
  const res = await api.get(`/voitures/${id}`);
  return res.data;
};

/**
 * Créer une nouvelle voiture avec photo principale et galerie
 * @param formData FormData contenant les champs et les images
 * @param token Token d'authentification
 */
export const createVoiture = async (formData: FormData, token: string) => {
  const res = await api.post("/voitures", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Mettre à jour une voiture existante
// Note : Pour la mise à jour de la photo, Laravel attend souvent une requête POST
// avec un champ `_method: 'PUT'` dans le FormData. Pour des données simples (sans photo),
// une requête PUT avec du JSON est standard.
// Mettre à jour une voiture existante
// Utilisation de POST avec _method: 'PUT' pour supporter le multipart/form-data (fichiers)
export const updateVoiture = async (id: number, data: FormData | Partial<Voiture>, token: string) => {
  let formData: FormData;

  if (data instanceof FormData) {
    formData = data;
    formData.append("_method", "PUT");
  } else {
    formData = new FormData();
    formData.append("_method", "PUT");
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
  }

  // Debug: Log entries
  /*
  for (let [key, value] of formData.entries()) {
    console.log(`FormData update: ${key} =`, value); 
  }
  */

  const res = await api.post(`/voitures/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// Supprimer une voiture
export const deleteVoiture = async (id: number, token: string) => {
  const res = await api.delete(`/voitures/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

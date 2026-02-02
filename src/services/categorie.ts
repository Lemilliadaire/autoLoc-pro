// src/services/categorie.ts
import api from "./api";
import type { Categorie } from "../types/api";


export const getCategories = async () => {
  const res = await api.get<any[]>("/categories");
  return res.data.map((cat: any) => ({
    ...cat,
    prix_journalier: cat.prix_journalier !== undefined ? cat.prix_journalier : valDecimal(cat.prix_base)
  })) as Categorie[];
};

const valDecimal = (val: any) => {
  if (!val) return 0;
  return typeof val === 'string' ? parseFloat(val) : val;
}

export const getCategorie = async (id: number) => {
  const res = await api.get<Categorie>(`/categories/${id}`);
  return res.data;
};

export const createCategorie = async (categorie: Omit<Categorie, "id">, token: string) => {
  // Le backend attend "prix_base" au lieu de "prix_journalier"
  const payload = {
    nom: categorie.nom,
    description: categorie.description,
    prix_base: categorie.prix_journalier // Mapper prix_journalier vers prix_base
  };

  const res = await api.post<{ status: boolean; message: string; categorie: Categorie }>(
    "/categories",
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const updateCategorie = async (id: number, categorie: Partial<Categorie>, token: string) => {
  // Le backend attend "prix_base" au lieu de "prix_journalier"
  const payload: any = {
    ...categorie
  };

  // Si prix_journalier est présent, le mapper vers prix_base
  if (categorie.prix_journalier !== undefined) {
    payload.prix_base = categorie.prix_journalier;
    delete payload.prix_journalier;
  }

  const res = await api.put<{ status: boolean; message: string; categorie: Categorie }>(
    `/categories/${id}`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const deleteCategorie = async (id: number, token: string) => {
  await api.delete(`/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

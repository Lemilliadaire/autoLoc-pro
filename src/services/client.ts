// src/services/client.ts
import api from "./api";
import type { Client } from "../types/api";

export const getClients = async (token: string) => {
  const res = await api.get<Client[]>("/clients", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getClient = async (id: number, token: string) => {
  const res = await api.get<Client>(`/clients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createClient = async (client: Omit<Client, "id" | "user">, token: string) => {
  const res = await api.post<{ status: boolean; message: string; client: Client }>(
    "/clients",
    client,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const updateClient = async (id: number, client: Partial<Client>, token: string) => {
  const res = await api.put<{ status: boolean; message: string; client: Client }>(
    `/clients/${id}`,
    client,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const deleteClient = async (id: number, token: string) => {
  await api.delete(`/clients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

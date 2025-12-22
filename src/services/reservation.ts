import api from "./api"; // Assumant un client axios pré-configuré
import type { Reservation } from "./../types/api";


// Données pour la création d'une réservation
export type ReservationCreationData = Omit<Reservation, "id" | "client" | "voiture" | "agence_depart" | "agence_retour">;

// Données pour la mise à jour d'une réservation
export type ReservationUpdateData = Partial<Omit<ReservationCreationData, "client_id" | "voiture_id">>;

/**
 * Récupère la liste des réservations.
 * L'API retourne les réservations de l'utilisateur connecté ou toutes si c'est un admin.
 * @returns Promise<Reservation[]>
 */
export const getReservations = async (): Promise<Reservation[]> => {
  const response = await api.get<Reservation[]>("/reservations");
  return response.data;
};

/**
 * Récupère une réservation spécifique par son ID.
 * @param id - L'ID de la réservation.
 * @returns Promise<Reservation>
 */
export const getReservation = async (id: number): Promise<Reservation> => {
  const response = await api.get<Reservation>(`/reservations/${id}`);
  return response.data;
};

/**
 * Crée une nouvelle réservation.
 * @param reservationData - Les données de la nouvelle réservation.
 * @returns Promise<any>
 */
export const createReservation = async (reservationData: ReservationCreationData): Promise<any> => {
  const response = await api.post("/reservations", reservationData);
  return response.data;
};

/**
 * Met à jour une réservation existante.
 * @param id - L'ID de la réservation à mettre à jour.
 * @param reservationData - Les données à mettre à jour.
 * @returns Promise<any>
 */
export const updateReservation = async (id: number, reservationData: ReservationUpdateData): Promise<any> => {
  const response = await api.put(`/reservations/${id}`, reservationData);
  return response.data;
};

/**
 * Supprime une réservation.
 * @param id - L'ID de la réservation à supprimer.
 * @returns Promise<void>
 */
export const deleteReservation = async (id: number): Promise<void> => {
  await api.delete(`/reservations/${id}`);
};
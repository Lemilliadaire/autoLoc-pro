export interface Agence {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  ville: string;
  logo?: string;
}

export interface VoitureImage {
  id: number;
  voiture_id: number;
  path: string;
  type: 'exterieur' | 'interieur' | 'autre';
}

export interface Voiture {
  id: number;
  immatriculation: string;
  marque: string;
  modele: string;
  annee: number;
  couleur: string;
  prix_journalier: number;
  statut: string;
  kilometrage: number;
  categorie_id: number;
  agence_id: number;
  photo?: string;
  images?: VoitureImage[];
  categorie?: Categorie;
  agence?: Agence;
  reservations?: Reservation[];
}

export interface Categorie {
  id: number;
  nom: string;
  description: string;
  prix_journalier: number;
  voitures?: Voiture[];
}

export interface Client {
  id: number;
  user_id: number;
  numero_permis: string;
  adresse: string;
  telephone: string;
  date_naissance: string;
  photo?: string;
  photo_profil?: string;
  photo_url?: string;
  user: User;
}

export interface Paiement {
  id: number;
  reservation_id: number;
  montant: number;
  methode: string;
  statut: string;
  date_paiement: string;
  reservation?: Reservation;
}

export interface Reservation {
  created_at: string | number | Date;
  date_fin: string | number | Date;
  date_debut: string | number | Date;
  user_id: number | undefined;
  id: number;
  voiture_id: number;
  client_id: number;
  agence_depart_id: number;
  agence_retour_id: number;
  agence_retrait_id?: number;
  date_depart: string;
  date_retour: string;
  statut: string;
  prix_total: number;
  voiture: Voiture;
  client: Client;
  agence_depart: Agence;
  agence_retour: Agence;
  agence_retrait?: Agence;
  paiements?: Paiement[];
}

export interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  telephone: string;
  password: string;
  password_confirm?: string;
  role: string;
  photo?: string;
  client?: Client;
  created_at?: string;
}

export interface Admin {
  id: number;
  user_id: number;
  photo?: string;
  photo_profil?: string;
  photo_url?: string;
  user: User;
}

export interface AuthResponse {
  status: boolean;
  message: string;
  user: User;
  access_token: string;
  token_type: string;
}

export interface PaginatedResponse {
  data: Voiture[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ClientWithStats extends Client {
  reservations_count?: number;
  total_spent?: number;
  last_reservation_date?: string;
  reservations?: Reservation[];
}

export interface ClientFilters {
  search: string;
  ville?: string;
  dateDebut?: string;
  dateFin?: string;
  reservationsCount?: 'none' | 'low' | 'high' | 'all';
}

export interface ReservationWithBalance extends Reservation {
  total_paid: number;
  balance_remaining: number;
  payment_status: 'paid' | 'partial' | 'unpaid';
}

export interface ReservationFilters {
  search: string;
  statut?: string;
  agence_id?: number;
  date_debut?: string;
  date_fin?: string;
}
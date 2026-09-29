import { TypePlace, VilleTunisie } from './place-parking.model';

/** Valeurs figées côté back (contrainte CHECK) ; loc-25 n'écrit que EN_ATTENTE, ANNULEE_VOYAGEUR, ANNULEE_PLACE_RETIREE. */
export type EtatReservation =
  | 'EN_ATTENTE'
  | 'ACCEPTEE'
  | 'REFUSEE'
  | 'EXPIREE'
  | 'ANNULEE_VOYAGEUR'
  | 'ANNULEE_PLACE_RETIREE'
  | 'ANNULEE_LOUEUR';
export type EtatPaiement = 'NON_PAYE' | 'PAYE';

/** Vue voyageur (LOC-25) : jamais d'adresse ni de données du loueur. */
export interface ReservationParking {
  id: number;
  placeId: number;
  ville: VilleTunisie;
  quartier: string;
  type: TypePlace;
  /** ISO « YYYY-MM-DD ». */
  arrivee: string;
  depart: string;
  nbJours: number;
  prixParJour: number;
  /** Figé à la demande. */
  prixTotal: number;
  vehicule: string | null;
  message: string | null;
  etat: EtatReservation;
  etatPaiement: EtatPaiement;
  /** ISO-8601 (Instant). */
  demandeeLe: string;
  annuleeLe: string | null;
  /** Calculé par le back (heure de Tunisie) : afficher « Annuler » si vrai. */
  annulable: boolean;
}

export interface ReservationParkingRequest {
  placeId: number;
  arrivee: string;
  depart: string;
  vehicule: string | null;
  message: string | null;
}

export const ETAT_RESERVATION_LABELS: Record<EtatReservation, string> = {
  EN_ATTENTE: 'En attente',
  ACCEPTEE: 'Acceptée',
  REFUSEE: 'Refusée',
  EXPIREE: 'Expirée',
  ANNULEE_VOYAGEUR: 'Annulée par vous',
  ANNULEE_PLACE_RETIREE: 'Annulée — place retirée',
  ANNULEE_LOUEUR: 'Annulée par le loueur',
};
export const ETAT_PAIEMENT_LABELS: Record<EtatPaiement, string> = { NON_PAYE: 'Non payé', PAYE: 'Payé' };

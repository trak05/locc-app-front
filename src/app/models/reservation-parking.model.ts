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
export type MoyenPaiementParking = 'ESPECES' | 'VIREMENT';
export type PeriodeReservation = 'A_VENIR' | 'EN_COURS' | 'PASSEE';

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
  /** Seulement si ACCEPTEE (LOC-26). */
  adresse: string | null;
  /** Seulement si ACCEPTEE (LOC-26). */
  telephoneLoueur: string | null;
  /** Refus ou annulation par le loueur. */
  motif: string | null;
  /** ISO-8601 ; null tant que non traitée. */
  traiteeLe: string | null;
}

/** Vue loueur (LOC-26) : téléphone du voyageur seulement si ACCEPTEE, jamais d'email. */
export interface ReservationRecueParking {
  id: number;
  placeId: number;
  ville: VilleTunisie;
  quartier: string;
  adresse: string;
  type: TypePlace;
  arrivee: string;
  depart: string;
  nbJours: number;
  prixParJour: number;
  prixTotal: number;
  voyageurNom: string;
  telephoneVoyageur: string | null;
  vehicule: string | null;
  message: string | null;
  etat: EtatReservation;
  etatPaiement: EtatPaiement;
  demandeeLe: string;
  traiteeLe: string | null;
  annuleeLe: string | null;
  motif: string | null;
  /** Calculé par le back : afficher Accepter / Refuser. */
  acceptable: boolean;
  /** Calculé par le back : afficher Annuler la réservation. */
  annulable: boolean;
  moyenPaiement: MoyenPaiementParking | null;
  /** ISO « YYYY-MM-DD ». */
  datePaiement: string | null;
  /** Calculé par le back : vrai si ACCEPTEE. */
  paiementModifiable: boolean;
  /** Calculé par le back en heure de Tunisie. */
  periode: PeriodeReservation;
}

export interface MarquerPayeParkingRequest {
  moyenPaiement: MoyenPaiementParking;
  datePaiement: string;
}

export interface MotifRequest {
  motif: string | null;
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
export const ETAT_RESERVATION_LOUEUR_LABELS: Record<EtatReservation, string> = {
  EN_ATTENTE: 'En attente',
  ACCEPTEE: 'Acceptée',
  REFUSEE: 'Refusée',
  EXPIREE: 'Expirée',
  ANNULEE_VOYAGEUR: 'Annulée par le voyageur',
  ANNULEE_PLACE_RETIREE: 'Annulée — place retirée',
  ANNULEE_LOUEUR: 'Annulée par vous',
};
export const ETAT_PAIEMENT_LABELS: Record<EtatPaiement, string> = { NON_PAYE: 'Non payée', PAYE: 'Payée' };
export const MOYEN_PAIEMENT_LABELS: Record<MoyenPaiementParking, string> = {
  ESPECES: 'Espèces',
  VIREMENT: 'Virement',
};
export const PERIODE_RESERVATION_LABELS: Record<PeriodeReservation, string> = {
  A_VENIR: 'À venir',
  EN_COURS: 'En cours',
  PASSEE: 'Passée',
};

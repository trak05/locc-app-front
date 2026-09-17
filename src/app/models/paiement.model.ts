import { Bien } from './bien.model';
import { User } from './auth.model';

export type StatutPaiement = 'PAYE' | 'EN_ATTENTE' | 'EN_RETARD';

export interface Paiement {
  id: number;
  bailId: number;
  periode: string;
  montant: number;
  datePaiement: string;
  moyenPaiement?: string;
  commentaire?: string;
}

export interface PaiementRequest {
  periode: string;
  montant: number;
  datePaiement: string;
  moyenPaiement?: string;
  commentaire?: string;
}

export interface Echeance {
  periode: string;
  statut: StatutPaiement;
  paiement?: Paiement;
}

export interface SuiviBail {
  bailId: number;
  bien: Bien;
  locataire: User;
  periodeCourante: string;
  statutPeriodeCourante: StatutPaiement;
  dateDernierPaiement?: string;
}

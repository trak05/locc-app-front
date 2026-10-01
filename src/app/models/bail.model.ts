import { Bien } from './bien.model';
import { User } from './auth.model';

export interface Bail {
  id: number;
  bien: Bien;
  locataire: User;
  dateDebut: string;
  dateFin?: string;
  loyerMensuel: number;
  depotGarantie: number;
}

export interface BailRequest {
  bienId: number;
  locataireId: number;
  dateDebut: string;
  dateFin?: string;
  loyerMensuel: number;
  depotGarantie: number;
}

/* Bien et locataire sont volontairement absents : ils ne sont pas modifiables
   sur un bail existant. */
export interface BailUpdateRequest {
  dateDebut: string;
  dateFin?: string;
  loyerMensuel: number;
  depotGarantie: number;
}

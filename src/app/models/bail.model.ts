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

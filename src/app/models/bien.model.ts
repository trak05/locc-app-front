export type TypeBien = 'APPARTEMENT' | 'MAISON' | 'STUDIO';

export interface Bien {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  type: TypeBien;
  surface?: number;
  nombrePieces?: number;
}

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

export interface TauxOccupationBien {
  bien: Bien;
  joursOccupes: number;
  /** 0..100, non arrondi (arrondi à l'affichage). */
  tauxOccupation: number;
}

export interface TauxOccupation {
  /** ISO yyyy-MM-dd, incluse. */
  dateDebut: string;
  /** ISO yyyy-MM-dd, incluse (= aujourd'hui côté serveur). */
  dateFin: string;
  joursPeriode: number;
  /** 0..100 non arrondi ; null = aucun bien enregistré. */
  tauxGlobal: number | null;
  biens: TauxOccupationBien[];
}

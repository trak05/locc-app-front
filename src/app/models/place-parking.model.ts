/** Les 24 chefs-lieux de gouvernorat (LOC-23), valeurs figées côté back (enum VilleTunisie). */
export type VilleTunisie =
  | 'TUNIS' | 'ARIANA' | 'BEN_AROUS' | 'LA_MANOUBA' | 'NABEUL' | 'ZAGHOUAN' | 'BIZERTE' | 'BEJA'
  | 'JENDOUBA' | 'LE_KEF' | 'SILIANA' | 'SOUSSE' | 'MONASTIR' | 'MAHDIA' | 'SFAX' | 'KAIROUAN'
  | 'KASSERINE' | 'SIDI_BOUZID' | 'GABES' | 'MEDENINE' | 'TATAOUINE' | 'GAFSA' | 'TOZEUR' | 'KEBILI';
export type TypePlace = 'COUVERTE' | 'NON_COUVERTE';

export interface PlaceParking {
  id: number;
  ville: VilleTunisie;
  quartier: string;
  adresse: string;
  type: TypePlace;
  /** Dinars, jusqu'à 3 décimales (millimes). */
  prixParJour: number;
  description: string | null;
  /** ISO-8601 (Instant). */
  publieeLe: string;
}
export type PlaceParkingRequest = Omit<PlaceParking, 'id' | 'publieeLe'>;

/** Vue voyageur (LOC-24) : jamais d'adresse ni de données du loueur. */
export interface PlaceParkingPublique {
  id: number;
  ville: VilleTunisie;
  quartier: string;
  type: TypePlace;
  /** Dinars, jusqu'à 3 décimales. */
  prixParJour: number;
  description: string | null;
  /** Jours inclus (arrivée et départ comptés). */
  nbJours: number;
  /** prixParJour × nbJours, calculé par le back. */
  prixTotal: number;
}
/** Dates ISO « YYYY-MM-DD » (LocalDate), identiques aux query params. */
export interface CriteresRecherche {
  ville: VilleTunisie;
  arrivee: string;
  depart: string;
}

export const VILLE_LABELS: Record<VilleTunisie, string> = {
  TUNIS: 'Tunis',
  ARIANA: 'Ariana',
  BEN_AROUS: 'Ben Arous',
  LA_MANOUBA: 'La Manouba',
  NABEUL: 'Nabeul',
  ZAGHOUAN: 'Zaghouan',
  BIZERTE: 'Bizerte',
  BEJA: 'Béja',
  JENDOUBA: 'Jendouba',
  LE_KEF: 'Le Kef',
  SILIANA: 'Siliana',
  SOUSSE: 'Sousse',
  MONASTIR: 'Monastir',
  MAHDIA: 'Mahdia',
  SFAX: 'Sfax',
  KAIROUAN: 'Kairouan',
  KASSERINE: 'Kasserine',
  SIDI_BOUZID: 'Sidi Bouzid',
  GABES: 'Gabès',
  MEDENINE: 'Médenine',
  TATAOUINE: 'Tataouine',
  GAFSA: 'Gafsa',
  TOZEUR: 'Tozeur',
  KEBILI: 'Kébili',
};
export const TYPE_PLACE_LABELS: Record<TypePlace, string> = { COUVERTE: 'Couverte', NON_COUVERTE: 'Non couverte' };
/** Ordre du select : alphabétique sur le libellé. */
export const VILLES_TUNISIE: VilleTunisie[] = [
  'ARIANA', 'BEJA', 'BEN_AROUS', 'BIZERTE', 'GABES', 'GAFSA', 'JENDOUBA', 'KAIROUAN', 'KASSERINE',
  'KEBILI', 'LA_MANOUBA', 'LE_KEF', 'MAHDIA', 'MEDENINE', 'MONASTIR', 'NABEUL', 'SFAX',
  'SIDI_BOUZID', 'SILIANA', 'SOUSSE', 'TATAOUINE', 'TOZEUR', 'TUNIS', 'ZAGHOUAN',
];

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Miroir de PeriodeParking côté back (LOC-24) : le 400 du back fait foi. */
export const DUREE_MAX_JOURS = 60;

const FORMAT_JOUR_TUNISIE = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Tunis' });

/** « Aujourd'hui » à l'heure de Tunisie, au format ISO « YYYY-MM-DD ». */
export function aujourdhuiTunisie(): string {
  return FORMAT_JOUR_TUNISIE.format(new Date());
}

/** Nombre de jours, arrivée et départ inclus (du 1er au 3 = 3). Calcul en UTC : pas d'effet d'heure d'été. */
export function nombreDeJours(arrivee: string, depart: string): number {
  const [ya, ma, da] = arrivee.split('-').map(Number);
  const [yd, md, dd] = depart.split('-').map(Number);
  return Math.round((Date.UTC(yd, md - 1, dd) - Date.UTC(ya, ma - 1, da)) / 86_400_000) + 1;
}

/** Validateur de groupe (contrôles `arrivee` et `depart`) ; les champs vides relèvent de Validators.required. */
export const periodeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const arrivee: string = group.get('arrivee')?.value ?? '';
  const depart: string = group.get('depart')?.value ?? '';
  // Chaînes ISO : la comparaison lexicale suit l'ordre chronologique.
  if (arrivee && arrivee < aujourdhuiTunisie()) {
    return { arriveePassee: true };
  }
  if (!arrivee || !depart) {
    return null;
  }
  if (depart < arrivee) {
    return { departAvantArrivee: true };
  }
  if (nombreDeJours(arrivee, depart) > DUREE_MAX_JOURS) {
    return { periodeTropLongue: true };
  }
  return null;
};

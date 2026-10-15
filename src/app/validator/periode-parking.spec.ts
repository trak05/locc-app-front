import { FormControl, FormGroup } from '@angular/forms';
import { aujourdhuiTunisie, nombreDeJours, periodeValidator } from './periode-parking';

/** Date ISO décalée de `jours` jours par rapport à `base` (calcul UTC). */
function decaler(base: string, jours: number): string {
  const [y, m, d] = base.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + jours)).toISOString().slice(0, 10);
}

function valider(arrivee: string, depart: string) {
  return periodeValidator(new FormGroup({ arrivee: new FormControl(arrivee), depart: new FormControl(depart) }));
}

describe('periode-parking', () => {
  it('should count arrival and departure days (1st to 3rd = 3 days)', () => {
    expect(nombreDeJours('2026-10-01', '2026-10-03')).toBe(3);
  });

  it('should count the same day as 1 day', () => {
    expect(nombreDeJours('2026-10-01', '2026-10-01')).toBe(1);
  });

  it('should not shift across a daylight saving change', () => {
    expect(nombreDeJours('2026-03-28', '2026-03-30')).toBe(3);
  });

  it('should accept a 60-day period', () => {
    const arrivee = decaler(aujourdhuiTunisie(), 1);
    expect(nombreDeJours(arrivee, decaler(arrivee, 59))).toBe(60);
    expect(valider(arrivee, decaler(arrivee, 59))).toBeNull();
  });

  it('should reject a 61-day period', () => {
    const arrivee = decaler(aujourdhuiTunisie(), 1);
    expect(valider(arrivee, decaler(arrivee, 60))).toEqual({ periodeTropLongue: true });
  });

  it('should reject a departure the day before arrival', () => {
    const arrivee = decaler(aujourdhuiTunisie(), 2);
    expect(valider(arrivee, decaler(arrivee, -1))).toEqual({ departAvantArrivee: true });
  });

  it('should accept a same-day booking for today', () => {
    const aujourdhui = aujourdhuiTunisie();
    expect(valider(aujourdhui, aujourdhui)).toBeNull();
  });

  it('should reject a past arrival date', () => {
    const hier = decaler(aujourdhuiTunisie(), -1);
    expect(valider(hier, hier)).toEqual({ arriveePassee: true });
  });

  it('should leave empty fields to Validators.required', () => {
    expect(valider('', '')).toBeNull();
  });
});

import { Pipe, PipeTransform } from '@angular/core';

const FORMAT_DT = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

/** Prix en dinars tunisiens, millimes compris : 12.5 → « 12,500 DT » (module Parking, loc-23 à 27). */
@Pipe({
  name: 'prixDt',
  standalone: true,
})
export class PrixDtPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) {
      return '—';
    }
    return FORMAT_DT.format(value) + ' DT';
  }
}

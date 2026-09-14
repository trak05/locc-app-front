import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Bien } from '../models/bien.model';

@Injectable({
  providedIn: 'root',
})
export class BienService {
  private readonly API_BASE = 'http://localhost:8081/api';

  /* httpResource (Angular 21, comme ReservationService/ClubService côté
     padel-club-front) : re-fetch automatique, `.reload()` pour rafraîchir
     après une mutation. */
  biensResource = httpResource<Bien[]>(() => `${this.API_BASE}/biens`, {
    defaultValue: [],
  });
}

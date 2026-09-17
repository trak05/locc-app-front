import { Injectable, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Bien } from '../models/bien.model';

@Injectable({
  providedIn: 'root',
})
export class BienService {
  private readonly API_BASE = 'http://localhost:8081/api';
  private readonly http = inject(HttpClient);

  /* httpResource (Angular 21, comme ReservationService/ClubService côté
     padel-club-front) : re-fetch automatique, `.reload()` pour rafraîchir
     après une mutation. */
  biensResource = httpResource<Bien[]>(() => `${this.API_BASE}/biens`, {
    defaultValue: [],
  });

  create(bien: Omit<Bien, 'id'>): Observable<Bien> {
    return this.http
      .post<Bien>(`${this.API_BASE}/biens`, bien)
      .pipe(tap(() => this.biensResource.reload()));
  }

  update(id: number, bien: Omit<Bien, 'id'>): Observable<Bien> {
    return this.http
      .put<Bien>(`${this.API_BASE}/biens/${id}`, bien)
      .pipe(tap(() => this.biensResource.reload()));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.API_BASE}/biens/${id}`)
      .pipe(tap(() => this.biensResource.reload()));
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Bien, TauxOccupation } from '../models/bien.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class BienService {
  private readonly API_BASE = 'http://localhost:8081/api';
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  /* httpResource (Angular 21, comme ReservationService/ClubService côté
     padel-club-front) : re-fetch automatique, `.reload()` pour rafraîchir
     après une mutation. */
  biensResource = httpResource<Bien[]>(() => `${this.API_BASE}/biens`, {
    defaultValue: [],
  });

  /* Réservé au propriétaire (403 pour un locataire). La factory lit currentUserResource,
     un signal rechargé à chaque login, plutôt que isOwner(), qui lit localStorage sans être
     réactif : la resource se réévalue donc quand on change de compte sans recharger la page. */
  tauxOccupationResource = httpResource<TauxOccupation>(() =>
    this.authService.currentUserResource.value()?.role === 'OWNER'
      ? `${this.API_BASE}/biens/taux-occupation`
      : undefined
  );

  create(bien: Omit<Bien, 'id'>): Observable<Bien> {
    return this.http.post<Bien>(`${this.API_BASE}/biens`, bien).pipe(
      tap(() => {
        this.biensResource.reload();
        this.tauxOccupationResource.reload();
      })
    );
  }

  update(id: number, bien: Omit<Bien, 'id'>): Observable<Bien> {
    return this.http.put<Bien>(`${this.API_BASE}/biens/${id}`, bien).pipe(
      tap(() => {
        this.biensResource.reload();
        this.tauxOccupationResource.reload();
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/biens/${id}`).pipe(
      tap(() => {
        this.biensResource.reload();
        this.tauxOccupationResource.reload();
      })
    );
  }
}

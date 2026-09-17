import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Echeance, Paiement, PaiementRequest, SuiviBail } from '../models/paiement.model';

@Injectable({
  providedIn: 'root',
})
export class PaiementService {
  private readonly API_BASE = 'http://localhost:8081/api';
  private readonly http = inject(HttpClient);

  /* httpResource paramétré par bailId : la factory retourne `undefined` tant
     qu'aucun bail n'est sélectionné, ce qui laisse la resource idle (pas de
     requête HTTP déclenchée, `value()` reste égal à `defaultValue`). Voir
     `setBailId`, appelé depuis les composants qui lisent l'id du bail dans
     la route. */
  private bailId = signal<number | null>(null);
  setBailId(id: number | null): void {
    this.bailId.set(id);
  }

  paiementsResource = httpResource<Paiement[]>(
    () => (this.bailId() !== null ? `${this.API_BASE}/baux/${this.bailId()}/paiements` : undefined),
    { defaultValue: [] }
  );

  echeancierResource = httpResource<Echeance[]>(
    () => (this.bailId() !== null ? `${this.API_BASE}/baux/${this.bailId()}/echeancier` : undefined),
    { defaultValue: [] }
  );

  vueEnsembleResource = httpResource<SuiviBail[]>(() => `${this.API_BASE}/paiements/vue-ensemble`, {
    defaultValue: [],
  });

  create(bailId: number, paiement: PaiementRequest): Observable<Paiement> {
    return this.http.post<Paiement>(`${this.API_BASE}/baux/${bailId}/paiements`, paiement).pipe(
      tap(() => {
        this.paiementsResource.reload();
        this.echeancierResource.reload();
      })
    );
  }

  update(id: number, paiement: PaiementRequest): Observable<Paiement> {
    return this.http.put<Paiement>(`${this.API_BASE}/paiements/${id}`, paiement).pipe(
      tap(() => {
        this.paiementsResource.reload();
        this.echeancierResource.reload();
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/paiements/${id}`).pipe(
      tap(() => {
        this.paiementsResource.reload();
        this.echeancierResource.reload();
      })
    );
  }
}

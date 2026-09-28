import { Injectable, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Bail, BailRequest, BailUpdateRequest } from '../models/bail.model';
import { BienService } from './bien.service';
import { PaiementService } from './paiement.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BailService {
  private readonly API_BASE = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);
  private readonly bienService = inject(BienService);
  private readonly paiementService = inject(PaiementService);

  bauxResource = httpResource<Bail[]>(() => `${this.API_BASE}/baux`, {
    defaultValue: [],
  });

  create(bail: BailRequest): Observable<Bail> {
    return this.http.post<Bail>(`${this.API_BASE}/baux`, bail).pipe(
      tap(() => {
        this.bauxResource.reload();
        // Un nouveau bail change le taux d'occupation.
        this.bienService.tauxOccupationResource.reload();
      })
    );
  }

  update(id: number, bail: BailUpdateRequest): Observable<Bail> {
    return this.http.put<Bail>(`${this.API_BASE}/baux/${id}`, bail).pipe(
      tap(() => {
        this.bauxResource.reload();
        // Des dates modifiées changent le taux d'occupation.
        this.bienService.tauxOccupationResource.reload();
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/baux/${id}`).pipe(
      tap(() => {
        this.bauxResource.reload();
        // Le bien est libéré immédiatement et le bail sort de la vue d'ensemble des paiements.
        this.bienService.tauxOccupationResource.reload();
        this.paiementService.vueEnsembleResource.reload();
      })
    );
  }
}

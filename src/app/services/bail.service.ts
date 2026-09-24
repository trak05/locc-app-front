import { Injectable, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Bail, BailRequest } from '../models/bail.model';
import { BienService } from './bien.service';

@Injectable({
  providedIn: 'root',
})
export class BailService {
  private readonly API_BASE = 'http://localhost:8081/api';
  private readonly http = inject(HttpClient);
  private readonly bienService = inject(BienService);

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
}

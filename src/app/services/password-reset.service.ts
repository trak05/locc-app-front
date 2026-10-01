import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PasswordResetConfirmRequest, PasswordResetRequest } from '../models/password-reset.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PasswordResetService {
  private http = inject(HttpClient);

  private readonly API_BASE = `${environment.apiBaseUrl}/auth/password-reset`;

  demander(request: PasswordResetRequest): Observable<void> {
    return this.http.post<void>(`${this.API_BASE}/request`, request);
  }

  confirmer(request: PasswordResetConfirmRequest): Observable<void> {
    return this.http.post<void>(`${this.API_BASE}/confirm`, request);
  }
}

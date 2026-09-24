import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PasswordResetConfirmRequest, PasswordResetRequest } from '../models/password-reset.model';

@Injectable({
  providedIn: 'root',
})
export class PasswordResetService {
  private http = inject(HttpClient);

  private readonly API_BASE = 'http://localhost:8081/api/auth/password-reset';

  demander(request: PasswordResetRequest): Observable<void> {
    return this.http.post<void>(`${this.API_BASE}/request`, request);
  }

  confirmer(request: PasswordResetConfirmRequest): Observable<void> {
    return this.http.post<void>(`${this.API_BASE}/confirm`, request);
  }
}

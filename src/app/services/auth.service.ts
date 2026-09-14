import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { User, JwtPayload, LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly API_BASE = 'http://localhost:8081/api/auth';
  OWNER = 'OWNER';
  TENANT = 'TENANT';

  login(request: LoginRequest): Observable<User> {
    return this.http.post<LoginResponse>(`${this.API_BASE}/login`, request).pipe(
      tap((response: LoginResponse) => {
        localStorage.setItem('token', response.token);
      }),
      switchMap(() => this.getCurrentUser())
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_BASE}/connected-user`);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  getUserRole(): string | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const payload: JwtPayload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch {
      return null;
    }
  }

  isOwner(): boolean {
    return this.getUserRole() === this.OWNER;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

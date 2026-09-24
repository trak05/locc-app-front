import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { User, JwtPayload, LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly API_BASE = 'http://localhost:8081/api/auth';
  private readonly DERNIERE_CONNEXION_KEY = 'derniereConnexion';
  OWNER = 'OWNER';
  TENANT = 'TENANT';

  /* httpResource (Angular 21, comme BienService/LocataireService/PaiementService) :
     source de vérité unique pour l'utilisateur connecté, partagée par
     LayoutComponent et DashboardComponent pour éviter un double appel HTTP
     vers /connected-user à chaque arrivée sur le dashboard. */
  currentUserResource = httpResource<User>(() => `${this.API_BASE}/connected-user`);

  /** undefined = inconnu (session ouverte avant la feature) ; null = première connexion. */
  derniereConnexion = signal<string | null | undefined>(this.readDerniereConnexion());

  login(request: LoginRequest): Observable<User> {
    return this.http.post<LoginResponse>(`${this.API_BASE}/login`, request).pipe(
      tap((response: LoginResponse) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem(this.DERNIERE_CONNEXION_KEY, JSON.stringify(response.derniereConnexion));
        this.derniereConnexion.set(response.derniereConnexion);
      }),
      switchMap(() => this.http.get<User>(`${this.API_BASE}/connected-user`)),
      tap(() => this.currentUserResource.reload())
    );
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem(this.DERNIERE_CONNEXION_KEY);
    this.derniereConnexion.set(undefined);
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

  private readDerniereConnexion(): string | null | undefined {
    const raw = localStorage.getItem(this.DERNIERE_CONNEXION_KEY);
    return raw === null ? undefined : (JSON.parse(raw) as string | null);
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

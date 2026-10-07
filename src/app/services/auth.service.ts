import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import {
  ActivationParkingRequest,
  ChangePasswordRequest,
  InscriptionParkingRequest,
  User,
  JwtPayload,
  LoginRequest,
  LoginResponse,
  ParkingRole,
  ProfilRequest,
  TokenResponse,
} from '../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly API_BASE = `${environment.apiBaseUrl}/auth`;
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
    return this.http
      .post<LoginResponse>(`${this.API_BASE}/login`, request)
      .pipe(switchMap((response) => this.openSession(response)));
  }

  /** Inscription publique au module Parking : le compte est connecté aussitôt (même enchaînement que login). */
  inscrireParking(request: InscriptionParkingRequest): Observable<User> {
    return this.http
      .post<LoginResponse>(`${this.API_BASE}/parking/inscription`, request)
      .pipe(switchMap((response) => this.openSession(response)));
  }

  /* Le back renvoie un nouveau jeton portant la claim parkingRole (les gardes lisent le JWT) ;
     le reload fait apparaître l'entrée « Parking » de la barre de navigation sans rechargement. */
  activerParking(request: ActivationParkingRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.API_BASE}/connected-user/parking`, request).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        this.currentUserResource.reload();
      }),
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.API_BASE}/connected-user/password`, request);
  }

  /* Le reload de currentUserResource met à jour la pastille et le dashboard
     sans câblage supplémentaire. */
  updateProfil(request: ProfilRequest): Observable<User> {
    return this.http
      .put<User>(`${this.API_BASE}/connected-user`, request)
      .pipe(tap(() => this.currentUserResource.reload()));
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
    return this.decodePayload()?.role ?? null;
  }

  getParkingRole(): ParkingRole | null {
    return this.decodePayload()?.parkingRole ?? null;
  }

  isOwner(): boolean {
    return this.getUserRole() === this.OWNER;
  }

  /** Accès à la gestion locative : réservé aux propriétaires et locataires (pas aux comptes Parking seuls). */
  hasGestionLocative(): boolean {
    const role = this.getUserRole();
    return role === this.OWNER || role === this.TENANT;
  }

  parkingHomeUrl(role: ParkingRole): string {
    return role === 'LOUEUR' ? '/parking/loueur' : '/parking/voyageur';
  }

  /** Accueil selon le JWT : gestion locative d'abord, sinon l'espace Parking du rôle. */
  homeUrl(): string {
    if (this.hasGestionLocative()) {
      return '/dashboard';
    }
    const parkingRole = this.getParkingRole();
    return parkingRole ? this.parkingHomeUrl(parkingRole) : '/login';
  }

  private openSession(response: LoginResponse): Observable<User> {
    localStorage.setItem('token', response.token);
    localStorage.setItem(this.DERNIERE_CONNEXION_KEY, JSON.stringify(response.derniereConnexion));
    this.derniereConnexion.set(response.derniereConnexion);
    return this.http
      .get<User>(`${this.API_BASE}/connected-user`)
      .pipe(tap(() => this.currentUserResource.reload()));
  }

  private decodePayload(): JwtPayload | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      return JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    } catch {
      return null;
    }
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

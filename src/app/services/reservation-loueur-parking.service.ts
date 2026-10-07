import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MarquerPayeParkingRequest, MotifRequest,ReservationRecueParking } from '../models/reservation-parking.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReservationLoueurParkingService {
  private readonly API_BASE = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  /* Demandes reçues par le loueur (LOC-26) : idle tant que la page n'a pas été ouverte ;
     le rôle est lu dans le JWT (403 sinon). */
  private listeDemandee = signal(false);

  demandesResource = httpResource<ReservationRecueParking[]>(
    () =>
      this.listeDemandee() && this.authService.getParkingRole() === 'LOUEUR'
        ? `${this.API_BASE}/parking/loueur/reservations`
        : undefined,
    { defaultValue: [] }
  );

  /** Première ouverture : active la resource ; ensuite, recharge (changement de compte sans rechargement). */
  chargerDemandes(): void {
    if (this.listeDemandee()) {
      this.demandesResource.reload();
    } else {
      this.listeDemandee.set(true);
    }
  }

  /* Mes locations (LOC-27) : même schéma « idle jusqu'à ouverture » que les demandes. */
  private locationsDemandees = signal(false);

  locationsResource = httpResource<ReservationRecueParking[]>(
    () =>
      this.locationsDemandees() && this.authService.getParkingRole() === 'LOUEUR'
        ? `${this.API_BASE}/parking/loueur/reservations/locations`
        : undefined,
    { defaultValue: [] }
  );

  chargerLocations(): void {
    if (this.locationsDemandees()) {
      this.locationsResource.reload();
    } else {
      this.locationsDemandees.set(true);
    }
  }

  marquerPayee(id: number, request: MarquerPayeParkingRequest): Observable<ReservationRecueParking> {
    return this.http
      .put<ReservationRecueParking>(`${this.API_BASE}/parking/loueur/reservations/${id}/paiement`, request)
      .pipe(tap(() => this.rechargerTout()));
  }

  marquerNonPayee(id: number): Observable<ReservationRecueParking> {
    return this.http
      .delete<ReservationRecueParking>(`${this.API_BASE}/parking/loueur/reservations/${id}/paiement`)
      .pipe(tap(() => this.rechargerTout()));
  }

  private rechargerTout(): void {
    this.locationsResource.reload();
    this.demandesResource.reload();
  }

  accepter(id: number): Observable<ReservationRecueParking> {
    return this.http
      .post<ReservationRecueParking>(`${this.API_BASE}/parking/loueur/reservations/${id}/acceptation`, null)
      .pipe(tap(() => this.demandesResource.reload()));
  }

  refuser(id: number, motif: string | null): Observable<ReservationRecueParking> {
    const body: MotifRequest = { motif };
    return this.http
      .post<ReservationRecueParking>(`${this.API_BASE}/parking/loueur/reservations/${id}/refus`, body)
      .pipe(tap(() => this.demandesResource.reload()));
  }

  annuler(id: number, motif: string | null): Observable<ReservationRecueParking> {
    const body: MotifRequest = { motif };
    return this.http
      .post<ReservationRecueParking>(`${this.API_BASE}/parking/loueur/reservations/${id}/annulation`, body)
      .pipe(tap(() => this.demandesResource.reload()));
  }
}

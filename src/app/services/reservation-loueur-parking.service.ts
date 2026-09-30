import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MotifRequest, ReservationRecueParking } from '../models/reservation-parking.model';
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

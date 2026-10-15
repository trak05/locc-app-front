import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ReservationParking, ReservationParkingRequest } from '../models/reservation-parking.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReservationParkingService {
  private readonly API_BASE = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  /* Réservations du voyageur (LOC-25) : idle tant que « Mes réservations » n'a pas été ouverte ;
     le rôle est lu dans le JWT (403 sinon). */
  private listeDemandee = signal(false);

  reservationsResource = httpResource<ReservationParking[]>(
    () =>
      this.listeDemandee() && this.authService.getParkingRole() === 'VOYAGEUR'
        ? `${this.API_BASE}/parking/voyageur/reservations`
        : undefined,
    { defaultValue: [] }
  );

  /** Première ouverture : active la resource ; ensuite, recharge (changement de compte sans rechargement). */
  chargerMesReservations(): void {
    if (this.listeDemandee()) {
      this.reservationsResource.reload();
    } else {
      this.listeDemandee.set(true);
    }
  }

  create(reservation: ReservationParkingRequest): Observable<ReservationParking> {
    return this.http.post<ReservationParking>(`${this.API_BASE}/parking/voyageur/reservations`, reservation);
  }

  annuler(id: number): Observable<ReservationParking> {
    return this.http
      .post<ReservationParking>(`${this.API_BASE}/parking/voyageur/reservations/${id}/annulation`, null)
      .pipe(tap(() => this.reservationsResource.reload()));
  }
}

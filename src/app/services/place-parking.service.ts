import { Injectable, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PlaceParking, PlaceParkingRequest } from '../models/place-parking.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PlaceParkingService {
  private readonly API_BASE = environment.apiBaseUrl;
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  /* Réservé au loueur (403 sinon). Comme tauxOccupationResource, la factory lit
     currentUserResource, rechargé à chaque login : la liste suit le compte connecté. */
  placesResource = httpResource<PlaceParking[]>(
    () =>
      this.authService.currentUserResource.value()?.parkingRole === 'LOUEUR'
        ? `${this.API_BASE}/parking/loueur/places`
        : undefined,
    { defaultValue: [] }
  );

  create(place: PlaceParkingRequest): Observable<PlaceParking> {
    return this.http
      .post<PlaceParking>(`${this.API_BASE}/parking/loueur/places`, place)
      .pipe(tap(() => this.placesResource.reload()));
  }

  update(id: number, place: PlaceParkingRequest): Observable<PlaceParking> {
    return this.http
      .put<PlaceParking>(`${this.API_BASE}/parking/loueur/places/${id}`, place)
      .pipe(tap(() => this.placesResource.reload()));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.API_BASE}/parking/loueur/places/${id}`)
      .pipe(tap(() => this.placesResource.reload()));
  }
}

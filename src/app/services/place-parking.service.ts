import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  CriteresRecherche,
  PlaceParking,
  PlaceParkingPublique,
  PlaceParkingRequest,
} from '../models/place-parking.model';
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

  /* Recherche du voyageur (LOC-24) : resources paramétrées par un signal, idle (factory
     `undefined`) tant qu'aucun critère valide n'est posé par les composants. */
  private criteres = signal<CriteresRecherche | null>(null);
  setCriteres(criteres: CriteresRecherche | null): void {
    this.criteres.set(criteres);
  }

  resultatsResource = httpResource<PlaceParkingPublique[]>(
    () => {
      const c = this.criteres();
      return c && this.authService.currentUserResource.value()?.parkingRole === 'VOYAGEUR'
        ? { url: `${this.API_BASE}/parking/places`, params: { ville: c.ville, arrivee: c.arrivee, depart: c.depart } }
        : undefined;
    },
    { defaultValue: [] }
  );

  private placeConsultee = signal<{ id: number; arrivee: string; depart: string } | null>(null);
  setPlaceConsultee(place: { id: number; arrivee: string; depart: string } | null): void {
    this.placeConsultee.set(place);
  }

  placeConsulteeResource = httpResource<PlaceParkingPublique>(() => {
    const p = this.placeConsultee();
    return p && this.authService.currentUserResource.value()?.parkingRole === 'VOYAGEUR'
      ? { url: `${this.API_BASE}/parking/places/${p.id}`, params: { arrivee: p.arrivee, depart: p.depart } }
      : undefined;
  });

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

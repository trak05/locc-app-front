import { Injectable, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, LocataireRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class LocataireService {
  private readonly API_BASE = 'http://localhost:8081/api';
  private readonly http = inject(HttpClient);

  locatairesResource = httpResource<User[]>(() => `${this.API_BASE}/locataires`, {
    defaultValue: [],
  });

  create(locataire: LocataireRequest): Observable<User> {
    return this.http
      .post<User>(`${this.API_BASE}/locataires`, locataire)
      .pipe(tap(() => this.locatairesResource.reload()));
  }

  update(id: number, locataire: LocataireRequest): Observable<User> {
    return this.http
      .put<User>(`${this.API_BASE}/locataires/${id}`, locataire)
      .pipe(tap(() => this.locatairesResource.reload()));
  }
}

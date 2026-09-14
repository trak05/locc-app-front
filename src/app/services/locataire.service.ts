import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { User } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class LocataireService {
  private readonly API_BASE = 'http://localhost:8081/api';

  locatairesResource = httpResource<User[]>(() => `${this.API_BASE}/locataires`, {
    defaultValue: [],
  });
}

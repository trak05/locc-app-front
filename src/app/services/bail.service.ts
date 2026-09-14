import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Bail } from '../models/bail.model';

@Injectable({
  providedIn: 'root',
})
export class BailService {
  private readonly API_BASE = 'http://localhost:8081/api';

  bauxResource = httpResource<Bail[]>(() => `${this.API_BASE}/baux`, {
    defaultValue: [],
  });
}

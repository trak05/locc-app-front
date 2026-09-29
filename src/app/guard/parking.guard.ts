import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ParkingRole } from '../models/auth.model';
import { AuthService } from '../services/auth.service';

/** Chaque rôle Parking n'accède qu'à son propre espace (rôle lu dans le JWT). */
export const parkingGuard = (role: ParkingRole): CanActivateFn => () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getParkingRole() === role) {
    return true;
  }

  return router.parseUrl(authService.homeUrl());
};

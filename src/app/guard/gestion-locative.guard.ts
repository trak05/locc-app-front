import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Routes de gestion locative : réservées aux propriétaires et locataires (un compte Parking seul est renvoyé vers son accueil). */
export const gestionLocativeGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasGestionLocative()) {
    return true;
  }

  return router.parseUrl(authService.homeUrl());
};

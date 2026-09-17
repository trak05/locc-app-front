import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService } from 'primeng/api';

import { routes } from './app.routes';
import { authInterceptor } from './interceptor/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Zoneless (comme padel-club-front) : pas de zone.js, tout repose sur
    // les signals pour déclencher le rendu.
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    // PrimeNG : introduit uniquement pour la popup de confirmation (ConfirmDialog),
    // pas de refonte du reste de l'UI — voir CLAUDE.md ("ajouter une UI library
    // quand on construit vraiment un écran qui en a besoin").
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura } }),
    ConfirmationService,
  ],
};

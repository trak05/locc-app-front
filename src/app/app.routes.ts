import { Routes } from '@angular/router';
import { authGuard } from './guard/auth.guard';
import { gestionLocativeGuard } from './guard/gestion-locative.guard';
import { parkingGuard } from './guard/parking.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'inscription-parking',
    loadComponent: () =>
      import('./components/auth/inscription-parking.component').then((m) => m.InscriptionParkingComponent),
  },
  {
    path: 'mot-de-passe-oublie',
    loadComponent: () =>
      import('./components/auth/mot-de-passe-oublie.component').then((m) => m.MotDePasseOublieComponent),
  },
  {
    path: 'reinitialiser-mot-de-passe',
    loadComponent: () =>
      import('./components/auth/reinitialiser-mot-de-passe.component').then(
        (m) => m.ReinitialiserMotDePasseComponent,
      ),
  },
  {
    path: 'mentions-legales',
    loadComponent: () =>
      import('./components/legal/mentions-legales.component').then((m) => m.MentionsLegalesComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      // Compte : accessible à tout utilisateur connecté (gestion locative ou Parking).
      {
        path: 'compte/mot-de-passe',
        loadComponent: () =>
          import('./components/compte/mot-de-passe-form.component').then((m) => m.MotDePasseFormComponent),
      },
      {
        path: 'compte/profil',
        loadComponent: () =>
          import('./components/compte/profil-form.component').then((m) => m.ProfilFormComponent),
      },
      // Gestion locative : propriétaires et locataires uniquement.
      {
        path: '',
        canActivateChild: [gestionLocativeGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
          },
          {
            path: 'biens',
            loadComponent: () => import('./components/biens/biens-list.component').then((m) => m.BiensListComponent),
          },
          {
            path: 'biens/new',
            loadComponent: () => import('./components/biens/bien-form.component').then((m) => m.BienFormComponent),
          },
          {
            path: 'biens/:id/edit',
            loadComponent: () => import('./components/biens/bien-form.component').then((m) => m.BienFormComponent),
          },
          {
            path: 'locataires',
            loadComponent: () =>
              import('./components/locataires/locataires-list.component').then((m) => m.LocatairesListComponent),
          },
          {
            path: 'locataires/new',
            loadComponent: () =>
              import('./components/locataires/locataire-form.component').then((m) => m.LocataireFormComponent),
          },
          {
            path: 'locataires/:id/edit',
            loadComponent: () =>
              import('./components/locataires/locataire-form.component').then((m) => m.LocataireFormComponent),
          },
          {
            path: 'baux',
            loadComponent: () => import('./components/baux/baux-list.component').then((m) => m.BauxListComponent),
          },
          {
            path: 'baux/new',
            loadComponent: () => import('./components/baux/bail-form.component').then((m) => m.BailFormComponent),
          },
          {
            path: 'baux/:id/edit',
            loadComponent: () => import('./components/baux/bail-form.component').then((m) => m.BailFormComponent),
          },
          {
            path: 'baux/:id/paiements',
            loadComponent: () =>
              import('./components/paiements/paiements-list.component').then((m) => m.PaiementsListComponent),
          },
          {
            path: 'baux/:id/paiements/new',
            loadComponent: () =>
              import('./components/paiements/paiement-form.component').then((m) => m.PaiementFormComponent),
          },
          {
            path: 'baux/:id/paiements/:paiementId/edit',
            loadComponent: () =>
              import('./components/paiements/paiement-form.component').then((m) => m.PaiementFormComponent),
          },
          {
            path: 'paiements/vue-ensemble',
            loadComponent: () =>
              import('./components/paiements/vue-ensemble.component').then((m) => m.VueEnsembleComponent),
          },
        ],
      },
      // Module Parking : chaque rôle n'accède qu'à son espace.
      {
        path: 'parking/loueur',
        canActivate: [parkingGuard('LOUEUR')],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./components/parking/mes-places.component').then((m) => m.MesPlacesComponent),
          },
          {
            path: 'demandes',
            loadComponent: () =>
              import('./components/parking/demandes-recues.component').then((m) => m.DemandesRecuesComponent),
          },
          {
            path: 'places/new',
            loadComponent: () =>
              import('./components/parking/place-form.component').then((m) => m.PlaceFormComponent),
          },
          {
            path: 'places/:id/edit',
            loadComponent: () =>
              import('./components/parking/place-form.component').then((m) => m.PlaceFormComponent),
          },
        ],
      },
      {
        path: 'parking/voyageur',
        canActivate: [parkingGuard('VOYAGEUR')],
        children: [
          // Critères dans les query params : ?ville&arrivee&depart (LOC-24).
          {
            path: '',
            loadComponent: () =>
              import('./components/parking/recherche-places.component').then((m) => m.RecherchePlacesComponent),
          },
          {
            path: 'places/:id',
            loadComponent: () =>
              import('./components/parking/place-detail.component').then((m) => m.PlaceDetailComponent),
          },
          {
            path: 'reservations',
            loadComponent: () =>
              import('./components/parking/mes-reservations.component').then((m) => m.MesReservationsComponent),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

import { Routes } from '@angular/router';
import { authGuard } from './guard/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent),
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
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

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
        path: 'baux',
        loadComponent: () => import('./components/baux/baux-list.component').then((m) => m.BauxListComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

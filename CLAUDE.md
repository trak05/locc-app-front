# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Angular 21 PWA frontend for `loc-app` (`loc-app-front`) — gestion locative d'un ou plusieurs appartements. Deux rôles : `OWNER` (propriétaire) et `TENANT` (locataire). It talks to a Spring Boot backend expected at `http://localhost:8081` (see `API_BASE` constants in the services).

This project mirrors the architecture of the sibling `padel-club-front` project (same stack, same patterns) — when in doubt about a convention, check there first rather than inventing a new one.

## Commands

- `npm start` — dev server on port **4300** (`ng serve --port 4300`, not the default 4200 — chosen so this can run alongside `padel-club-front` without a port clash).
- `npm run build` — production build.
- `npm test` — unit tests (Vitest via `@angular/build:unit-test`).

## Status: v0 scaffold

This is a first scaffold, not a finished app. Only **Biens + Locataires + Baux** (read-only lists) exist. No create/edit forms yet, no payment tracking, no documents, no incidents — those are deliberately out of scope for v0 and are the next things to build.

## Architecture

### Angular 21, zoneless, standalone components

- `provideZonelessChangeDetection()` in `src/app/app.config.ts` — no zone.js. View updates rely entirely on signals.
- No `NgModule`s. Routes lazy-load components via `loadComponent()` in `src/app/app.routes.ts`.
- Data fetching uses `httpResource()` (see `BienService`, `LocataireService`, `BailService`) rather than manual `subscribe()`.

### Auth

- JWT stored in `localStorage` under `token`. `AuthService.isAuthenticated()` decodes the JWT payload client-side to check expiry (no signature verification client-side — that's the backend's job).
- `authInterceptor` (`src/app/interceptor/auth.interceptor.ts`) attaches `Authorization: Bearer <token>`, and force-logs-out on a 401.
- `authGuard` (`src/app/guard/auth.guard.ts`) protects the root `''` route.
- Dev seed account: `owner` / `owner` (see `DataSeeder` in the backend).

### Routing

`/login` (public) and `''` (guarded, wraps `LayoutComponent`, children `dashboard`, `biens`, `locataires`, `baux`). Unknown paths redirect to `dashboard`.

### UI

Deliberately minimal styling for this v0 (`src/styles.scss` — plain tables, no design system yet). No PrimeNG/Bootstrap added yet, to keep the scaffold light; add UI libraries when actually building out screens, not preemptively.

### PWA

`ng add @angular/pwa` was run — `ngsw-config.json`, `public/manifest.webmanifest`, `public/icons/`. Service worker is only enabled outside dev mode (`provideServiceWorker(..., { enabled: !isDevMode() })`), so `npm start` won't show PWA behavior — test that against a production build (`npm run build` + serve `dist/`).

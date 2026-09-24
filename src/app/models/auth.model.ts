export type Role = 'OWNER' | 'TENANT';

export type Civilite = 'M' | 'MME';

export interface PersonalInfo {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  civilite?: Civilite;
}

export interface User {
  id: number;
  username: string;
  role: Role;
  personalInfo: PersonalInfo;
}

export interface LocataireRequest {
  username: string;
  password?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  civilite?: Civilite;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  /** Connexion réussie précédente (ISO-8601 UTC), null si première connexion. */
  derniereConnexion: string | null;
}

/** Payload décodé du JWT (voir AuthService.isTokenExpired). */
export interface JwtPayload {
  sub: string;
  role: Role;
  iat: number;
  exp: number;
}

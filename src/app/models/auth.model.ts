export type Role = 'OWNER' | 'TENANT';

/** Rôle du module Parking (LOC-22), indépendant du rôle de gestion locative. */
export type ParkingRole = 'LOUEUR' | 'VOYAGEUR';

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
  /** Rôle de gestion locative, null pour un compte créé par l'inscription Parking. */
  role: Role | null;
  parkingRole: ParkingRole | null;
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
  role?: Role;
  parkingRole?: ParkingRole;
  iat: number;
  exp: number;
}

export interface ProfilRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  civilite?: Civilite;
}

export interface InscriptionParkingRequest {
  username: string;
  password: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  parkingRole: ParkingRole;
  cguAcceptees: boolean;
}

export interface ActivationParkingRequest {
  parkingRole: ParkingRole;
  cguAcceptees: boolean;
  telephone?: string;
}

export interface TokenResponse {
  token: string;
}

export type Role = 'OWNER' | 'TENANT';

export interface PersonalInfo {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
}

export interface User {
  id: number;
  username: string;
  role: Role;
  personalInfo: PersonalInfo;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

/** Payload décodé du JWT (voir AuthService.isTokenExpired). */
export interface JwtPayload {
  sub: string;
  role: Role;
  iat: number;
  exp: number;
}

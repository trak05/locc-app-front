export interface PasswordResetRequest {
  /** Identifiant de connexion ou email des informations personnelles. */
  identifiant: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  nouveauMotDePasse: string;
}

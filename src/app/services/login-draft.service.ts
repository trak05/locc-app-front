import { Injectable } from '@angular/core';
import { LoginRequest } from '../models/auth.model';

/**
 * Brouillon du formulaire de connexion, conservé le temps d'un aller-retour
 * vers les mentions légales (LOC-16).
 *
 * Le brouillon contient un mot de passe : il est gardé uniquement en mémoire,
 * jamais persisté (ni localStorage, ni sessionStorage). Il est lu une seule
 * fois puis vidé, et ne survit donc pas à un rechargement complet.
 */
@Injectable({ providedIn: 'root' })
export class LoginDraftService {
  private draft: LoginRequest | null = null;

  save(draft: LoginRequest): void {
    this.draft = { ...draft };
  }

  consume(): LoginRequest | null {
    const d = this.draft;
    this.draft = null;
    return d;
  }
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mentions-legales',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mentions-legales.component.html',
  styleUrl: './mentions-legales.component.scss',
})
export class MentionsLegalesComponent {
  /**
   * Texte provisoire tant que l'éditeur n'a pas fourni le texte définitif.
   * Pour finaliser : remplacer les marqueurs [À COMPLÉTER : …], passer à false
   * et mettre à jour derniereMiseAJour.
   */
  readonly TEXTE_PROVISOIRE = true;
  readonly derniereMiseAJour = '28 septembre 2026';
  readonly contactEmail = '[À COMPLÉTER : adresse e-mail de contact]';
}

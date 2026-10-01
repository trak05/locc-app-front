import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { ReservationLoueurParkingService } from '../../services/reservation-loueur-parking.service';
import { TYPE_PLACE_LABELS, VILLE_LABELS } from '../../models/place-parking.model';
import {
  ETAT_PAIEMENT_LABELS,
  ETAT_RESERVATION_LOUEUR_LABELS,
  MOYEN_PAIEMENT_LABELS,
  ReservationRecueParking,
} from '../../models/reservation-parking.model';
import { PrixDtPipe } from '../../pipe/prix-dt.pipe';

const MOTIF_MAX = 300;

/** « Demandes reçues » du loueur (LOC-26) : accepter, refuser, annuler. */
@Component({
  selector: 'app-demandes-recues',
  standalone: true,
  imports: [RouterLink, DatePipe, NgTemplateOutlet, ConfirmPopup, PrixDtPipe],
  templateUrl: './demandes-recues.component.html',
  styleUrl: './demandes-recues.component.scss',
})
export class DemandesRecuesComponent {
  private service = inject(ReservationLoueurParkingService);
  private confirmationService = inject(ConfirmationService);

  demandesResource = this.service.demandesResource;
  // Record<string, string> : le contexte du ng-template est non typé.
  villeLabels: Record<string, string> = VILLE_LABELS;
  typeLabels: Record<string, string> = TYPE_PLACE_LABELS;
  etatLabels: Record<string, string> = ETAT_RESERVATION_LOUEUR_LABELS;
  paiementLabels: Record<string, string> = ETAT_PAIEMENT_LABELS;
  moyenLabels: Record<string, string> = MOYEN_PAIEMENT_LABELS;
  motifMax = MOTIF_MAX;

  errorMessage = signal<string | null>(null);
  envoiEnCours = signal(false);

  /** Panneau de motif ouvert (refus ou annulation) pour une demande. */
  panneau = signal<{ id: number; action: 'refus' | 'annulation' } | null>(null);
  motif = signal('');
  motifTropLong = computed(() => this.motif().trim().length > MOTIF_MAX);

  // status() / error() d'abord : value() lève une exception quand la resource est en erreur.
  chargement = computed(() => {
    const status = this.demandesResource.status();
    return status === 'idle' || status === 'loading' || status === 'reloading';
  });
  enErreur = computed(() => !!this.demandesResource.error());

  // L'ordre du back est conservé : pas de re-tri.
  enAttente = computed(() => this.demandesResource.value().filter((d) => d.etat === 'EN_ATTENTE'));
  historique = computed(() => this.demandesResource.value().filter((d) => d.etat !== 'EN_ATTENTE'));

  constructor() {
    // Ne jamais afficher la liste d'un compte précédent.
    this.service.chargerDemandes();
  }

  confirmAcceptation(event: Event, d: ReservationRecueParking): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Accepter cette demande ? Le voyageur verra votre adresse et votre téléphone.',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Accepter',
      rejectLabel: 'Retour',
      acceptButtonProps: { size: 'small' },
      rejectButtonProps: { severity: 'secondary', size: 'small', outlined: true },
      accept: () => this.executer(() => this.service.accepter(d.id)),
    });
  }

  ouvrirPanneau(id: number, action: 'refus' | 'annulation'): void {
    this.errorMessage.set(null);
    this.motif.set('');
    this.panneau.set({ id, action });
  }

  fermerPanneau(): void {
    this.panneau.set(null);
    this.motif.set('');
  }

  confirmerPanneau(): void {
    const p = this.panneau();
    if (!p || this.motifTropLong() || this.envoiEnCours()) {
      return;
    }
    const motif = this.motif().trim() || null;
    this.executer(() => (p.action === 'refus' ? this.service.refuser(p.id, motif) : this.service.annuler(p.id, motif)));
  }

  private executer(appel: () => Observable<ReservationRecueParking>): void {
    if (this.envoiEnCours()) {
      return;
    }
    this.errorMessage.set(null);
    this.envoiEnCours.set(true);
    appel().subscribe({
      next: () => {
        this.envoiEnCours.set(false);
        this.fermerPanneau();
      },
      error: (err: HttpErrorResponse) => {
        this.envoiEnCours.set(false);
        this.fermerPanneau();
        if (err.status === 409) {
          const message = String(err.error?.message ?? err.error ?? '');
          if (message.includes('déjà réservée')) {
            this.errorMessage.set('Cette place est déjà réservée sur tout ou partie de ces dates.');
          } else if (message.includes('expiré')) {
            this.errorMessage.set('Cette demande a expiré.');
          } else {
            this.errorMessage.set('Cette demande ne peut plus être traitée.');
          }
          this.demandesResource.reload();
        } else if (err.status === 404) {
          this.errorMessage.set('Cette demande est introuvable.');
          this.demandesResource.reload();
        } else {
          this.errorMessage.set('Action impossible. Veuillez réessayer.');
        }
      },
    });
  }

  saisieMotif(event: Event): void {
    this.motif.set((event.target as HTMLTextAreaElement).value);
  }
}

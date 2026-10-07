import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { ReservationLoueurParkingService } from '../../services/reservation-loueur-parking.service';
import { TYPE_PLACE_LABELS, VILLE_LABELS } from '../../models/place-parking.model';
import {
  ETAT_PAIEMENT_LABELS,
  MOYEN_PAIEMENT_LABELS,
  MoyenPaiementParking,
  PERIODE_RESERVATION_LABELS,
  ReservationRecueParking,
} from '../../models/reservation-parking.model';
import { PrixDtPipe } from '../../pipe/prix-dt.pipe';

/** Date du jour « YYYY-MM-DD » en heure de Tunisie (même référence que le back). */
function aujourdhuiTunisie(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Tunis' });
}

/** « Mes locations » du loueur (LOC-27) : suivi des réservations acceptées et de leur paiement. */
@Component({
  selector: 'app-mes-locations',
  standalone: true,
  imports: [RouterLink, DatePipe, ReactiveFormsModule, ConfirmPopup, PrixDtPipe],
  templateUrl: './mes-locations.component.html',
  styleUrl: './mes-locations.component.scss',
})
export class MesLocationsComponent {
  private service = inject(ReservationLoueurParkingService);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  locationsResource = this.service.locationsResource;
  villeLabels: Record<string, string> = VILLE_LABELS;
  typeLabels: Record<string, string> = TYPE_PLACE_LABELS;
  paiementLabels: Record<string, string> = ETAT_PAIEMENT_LABELS;
  moyenLabels: Record<string, string> = MOYEN_PAIEMENT_LABELS;
  periodeLabels: Record<string, string> = PERIODE_RESERVATION_LABELS;
  moyens: MoyenPaiementParking[] = ['ESPECES', 'VIREMENT'];

  errorMessage = signal<string | null>(null);
  envoiEnCours = signal(false);
  seulementNonPayees = signal(false);
  /** Réservation dont le formulaire de paiement est ouvert. */
  paiementOuvertId = signal<number | null>(null);
  aujourdhui = aujourdhuiTunisie();

  form = this.fb.nonNullable.group({
    moyenPaiement: this.fb.nonNullable.control<MoyenPaiementParking | ''>('', Validators.required),
    datePaiement: this.fb.nonNullable.control(this.aujourdhui, Validators.required),
  });

  // status() / error() d'abord : value() lève une exception quand la resource est en erreur.
  chargement = computed(() => {
    const status = this.locationsResource.status();
    return status === 'idle' || status === 'loading' || status === 'reloading';
  });
  enErreur = computed(() => !!this.locationsResource.error());

  // L'ordre du back est conservé : pas de re-tri.
  locationsAffichees = computed(() => {
    const liste = this.locationsResource.value();
    return this.seulementNonPayees() ? liste.filter((l) => l.etatPaiement === 'NON_PAYE') : liste;
  });

  constructor() {
    // Ne jamais afficher la liste d'un compte précédent.
    this.service.chargerLocations();
  }

  basculerFiltre(event: Event): void {
    this.seulementNonPayees.set((event.target as HTMLInputElement).checked);
  }

  ouvrirPaiement(id: number): void {
    this.errorMessage.set(null);
    this.form.reset({ moyenPaiement: '', datePaiement: aujourdhuiTunisie() });
    this.aujourdhui = aujourdhuiTunisie();
    this.paiementOuvertId.set(id);
  }

  fermerPaiement(): void {
    this.paiementOuvertId.set(null);
  }

  confirmerPaiement(l: ReservationRecueParking): void {
    const { moyenPaiement, datePaiement } = this.form.getRawValue();
    if (this.form.invalid || !moyenPaiement || this.envoiEnCours()) {
      this.form.markAllAsTouched();
      return;
    }
    this.executer(() => this.service.marquerPayee(l.id, { moyenPaiement, datePaiement }));
  }

  confirmNonPayee(event: Event, l: ReservationRecueParking): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Repasser cette réservation à « Non payée » ?',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Confirmer',
      rejectLabel: 'Retour',
      acceptButtonProps: { size: 'small' },
      rejectButtonProps: { severity: 'secondary', size: 'small', outlined: true },
      accept: () => this.executer(() => this.service.marquerNonPayee(l.id)),
    });
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
        this.fermerPaiement();
      },
      error: (err: HttpErrorResponse) => {
        this.envoiEnCours.set(false);
        if (err.status === 409) {
          this.fermerPaiement();
          this.errorMessage.set("Cette réservation n'est plus acceptée : son paiement ne peut plus être modifié.");
          this.locationsResource.reload();
        } else if (err.status === 404) {
          this.fermerPaiement();
          this.errorMessage.set('Cette réservation est introuvable.');
          this.locationsResource.reload();
        } else if (err.status === 400) {
          this.errorMessage.set('Moyen ou date de paiement invalide (la date ne peut pas être dans le futur).');
        } else {
          this.errorMessage.set('Action impossible. Veuillez réessayer.');
        }
      },
    });
  }
}

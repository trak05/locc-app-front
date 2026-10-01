import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { ReservationParkingService } from '../../services/reservation-parking.service';
import { VILLE_LABELS } from '../../models/place-parking.model';
import { ETAT_PAIEMENT_LABELS, ETAT_RESERVATION_LABELS } from '../../models/reservation-parking.model';
import { PrixDtPipe } from '../../pipe/prix-dt.pipe';

/** « Mes réservations » du voyageur (LOC-25) : tout l'historique, jamais d'adresse. */
@Component({
  selector: 'app-mes-reservations',
  standalone: true,
  imports: [RouterLink, DatePipe, ConfirmPopup, PrixDtPipe],
  templateUrl: './mes-reservations.component.html',
  styleUrl: './mes-reservations.component.scss',
})
export class MesReservationsComponent {
  private reservationParkingService = inject(ReservationParkingService);
  private confirmationService = inject(ConfirmationService);

  reservationsResource = this.reservationParkingService.reservationsResource;
  villeLabels = VILLE_LABELS;
  etatLabels = ETAT_RESERVATION_LABELS;
  paiementLabels = ETAT_PAIEMENT_LABELS;

  /** Arrivée depuis la confirmation d'une demande (state de navigation). */
  demandeEnvoyee = history.state?.demandeEnvoyee === true;

  errorMessage = signal<string | null>(null);

  // status() / error() d'abord : value() lève une exception quand la resource est en erreur.
  chargement = computed(() => {
    const status = this.reservationsResource.status();
    return status === 'idle' || status === 'loading' || status === 'reloading';
  });
  enErreur = computed(() => !!this.reservationsResource.error());

  constructor() {
    // Déconnexion de A puis connexion de B sans rechargement : ne jamais afficher la liste précédente.
    this.reservationParkingService.chargerMesReservations();
  }

  confirmAnnulation(event: Event, id: number): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Annuler cette demande ? Cette action est définitive.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Annuler la demande',
      rejectLabel: 'Garder',
      acceptButtonProps: { severity: 'danger', size: 'small' },
      rejectButtonProps: { severity: 'secondary', size: 'small', outlined: true },
      accept: () => {
        this.errorMessage.set(null);
        this.reservationParkingService.annuler(id).subscribe({
          error: (err: HttpErrorResponse) => {
            if (err.status === 409) {
              this.errorMessage.set('Cette demande ne peut plus être annulée.');
              this.reservationsResource.reload();
            } else if (err.status === 404) {
              this.errorMessage.set('Cette demande est introuvable.');
              this.reservationsResource.reload();
            } else {
              this.errorMessage.set("Impossible d'annuler cette demande. Veuillez réessayer.");
            }
          },
        });
      },
    });
  }
}

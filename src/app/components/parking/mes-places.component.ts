import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { PlaceParkingService } from '../../services/place-parking.service';
import { TYPE_PLACE_LABELS, VILLE_LABELS } from '../../models/place-parking.model';
import { PrixDtPipe } from '../../pipe/prix-dt.pipe';

/** Accueil du loueur de place (LOC-23) : liste de ses places de parking en ligne. */
@Component({
  selector: 'app-mes-places',
  standalone: true,
  imports: [RouterLink, ConfirmPopup, PrixDtPipe],
  templateUrl: './mes-places.component.html',
  styleUrl: './mes-places.component.scss',
})
export class MesPlacesComponent {
  private placeParkingService = inject(PlaceParkingService);
  private confirmationService = inject(ConfirmationService);

  places = this.placeParkingService.placesResource.value;
  isLoading = this.placeParkingService.placesResource.isLoading;
  villeLabels = VILLE_LABELS;
  typeLabels = TYPE_PLACE_LABELS;

  errorMessage = signal<string | null>(null);

  confirmRetrait(event: Event, id: number): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Retirer cette place ? Ce retrait est définitif.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Retirer',
      rejectLabel: 'Annuler',
      acceptButtonProps: { severity: 'danger', size: 'small' },
      rejectButtonProps: { severity: 'secondary', size: 'small', outlined: true },
      accept: () => {
        this.errorMessage.set(null);
        this.placeParkingService.delete(id).subscribe({
          error: (err) => {
            if (err.status === 409) {
              this.errorMessage.set(
                'Cette place a une réservation acceptée à venir : elle ne peut pas être retirée.'
              );
            } else if (err.status === 404) {
              this.errorMessage.set('Cette place est introuvable ou a déjà été retirée.');
              this.placeParkingService.placesResource.reload();
            } else {
              this.errorMessage.set('Impossible de retirer cette place. Veuillez réessayer.');
            }
          },
        });
      },
    });
  }
}

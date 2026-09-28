import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { BailService } from '../../services/bail.service';
import { AuthService } from '../../services/auth.service';
import { Bail } from '../../models/bail.model';

@Component({
  selector: 'app-baux-list',
  standalone: true,
  imports: [RouterLink, ConfirmPopup],
  templateUrl: './baux-list.component.html',
  styleUrl: './baux-list.component.scss',
})
export class BauxListComponent {
  authService = inject(AuthService);
  bailService = inject(BailService);
  private confirmationService = inject(ConfirmationService);
  baux = this.bailService.bauxResource.value;
  isLoading = this.bailService.bauxResource.isLoading;

  deleteError = signal<string | null>(null);

  confirmDelete(event: Event, bail: Bail): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: `Supprimer définitivement le bail du bien « ${bail.bien.nom} » loué à ${bail.locataire.personalInfo.prenom} ${bail.locataire.personalInfo.nom} ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonProps: { severity: 'danger', size: 'small' },
      rejectButtonProps: { severity: 'secondary', size: 'small', outlined: true },
      accept: () => {
        this.deleteError.set(null);
        this.bailService.delete(bail.id).subscribe({
          // 409 : paiements (et reçus) ou avis d'échéance déjà rattachés au bail.
          error: (err: HttpErrorResponse) =>
            this.deleteError.set(
              err.status === 409
                ? "Suppression impossible : ce bail a déjà des paiements, des reçus ou des avis d'échéance."
                : 'Impossible de supprimer ce bail.'
            ),
        });
      },
    });
  }
}

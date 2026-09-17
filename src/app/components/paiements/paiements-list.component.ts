import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { PaiementService } from '../../services/paiement.service';
import { AuthService } from '../../services/auth.service';
import { Paiement } from '../../models/paiement.model';

@Component({
  selector: 'app-paiements-list',
  standalone: true,
  imports: [RouterLink, ConfirmPopup],
  templateUrl: './paiements-list.component.html',
  styleUrl: './paiements-list.component.scss',
})
export class PaiementsListComponent {
  private route = inject(ActivatedRoute);
  private confirmationService = inject(ConfirmationService);
  paiementService = inject(PaiementService);
  authService = inject(AuthService);

  bailId = signal<number | null>(null);

  echeances = this.paiementService.echeancierResource.value;
  isLoadingEcheances = this.paiementService.echeancierResource.isLoading;

  paiements = this.paiementService.paiementsResource.value;
  isLoadingPaiements = this.paiementService.paiementsResource.isLoading;

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    this.bailId.set(id);
    this.paiementService.setBailId(id);
  }

  paiementLabel(paiement: Paiement | undefined): string {
    if (!paiement) {
      return '—';
    }
    return `${paiement.montant} € (${paiement.datePaiement})`;
  }

  confirmDelete(event: Event, id: number): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Supprimer ce paiement ?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonProps: { severity: 'danger', size: 'small' },
      rejectButtonProps: { severity: 'secondary', size: 'small', outlined: true },
      accept: () => {
        this.paiementService.delete(id).subscribe();
      },
    });
  }
}

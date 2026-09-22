import { Component, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { PaiementService } from '../../services/paiement.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Paiement } from '../../models/paiement.model';

@Component({
  selector: 'app-paiements-list',
  standalone: true,
  imports: [RouterLink, ConfirmPopup, DatePipe],
  templateUrl: './paiements-list.component.html',
  styleUrl: './paiements-list.component.scss',
})
export class PaiementsListComponent {
  private route = inject(ActivatedRoute);
  private confirmationService = inject(ConfirmationService);
  paiementService = inject(PaiementService);
  authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  bailId = signal<number | null>(null);

  echeances = this.paiementService.echeancierResource.value;
  isLoadingEcheances = this.paiementService.echeancierResource.isLoading;

  paiements = this.paiementService.paiementsResource.value;
  isLoadingPaiements = this.paiementService.paiementsResource.isLoading;

  historiqueAvis = this.paiementService.historiqueAvisResource.value;
  isLoadingHistoriqueAvis = this.paiementService.historiqueAvisResource.isLoading;

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    this.bailId.set(id);
    this.paiementService.setBailId(id);

    // Un avis généré en direct (WebSocket) pour ce bail rafraîchit l'échéancier et
    // l'historique des avis sans que l'utilisateur ait à recharger la page.
    effect(() => {
      const notification = this.notificationService.lastReceived();
      if (notification && notification.bailId === this.bailId()) {
        this.paiementService.echeancierResource.reload();
        this.paiementService.historiqueAvisResource.reload();
      }
    });
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

  telechargerRecu(id: number): void {
    this.paiementService.telechargerRecu(id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
    });
  }

  telechargerAvisEcheance(periode: string): void {
    const id = this.bailId();
    if (id === null) return;
    this.paiementService.telechargerAvisEcheance(id, periode).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
    });
  }
}

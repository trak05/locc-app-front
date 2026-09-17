import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PaiementService } from '../../services/paiement.service';
import { AuthService } from '../../services/auth.service';
import { Paiement } from '../../models/paiement.model';

@Component({
  selector: 'app-paiements-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './paiements-list.component.html',
  styleUrl: './paiements-list.component.scss',
})
export class PaiementsListComponent {
  private route = inject(ActivatedRoute);
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

  delete(id: number): void {
    if (!confirm('Supprimer ce paiement ?')) {
      return;
    }
    this.paiementService.delete(id).subscribe();
  }
}

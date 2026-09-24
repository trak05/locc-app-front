import { Component, computed, effect, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BienService } from '../../services/bien.service';
import { LocataireService } from '../../services/locataire.service';
import { BailService } from '../../services/bail.service';
import { AuthService } from '../../services/auth.service';
import { PaiementService } from '../../services/paiement.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private bienService = inject(BienService);
  private locataireService = inject(LocataireService);
  private bailService = inject(BailService);
  authService = inject(AuthService);
  paiementService = inject(PaiementService);
  private notificationService = inject(NotificationService);

  currentUser = this.authService.currentUserResource.value;

  civiliteLabel = computed(() => {
    const civilite = this.currentUser()?.personalInfo.civilite;
    if (civilite === 'MME') return 'Mme';
    if (civilite === 'M') return 'M.';
    return null;
  });

  biens = this.bienService.biensResource.value;
  isLoadingBiens = this.bienService.biensResource.isLoading;

  locataires = this.locataireService.locatairesResource.value;
  isLoadingLocataires = this.locataireService.locatairesResource.isLoading;

  baux = this.bailService.bauxResource.value;
  isLoadingBaux = this.bailService.bauxResource.isLoading;

  avisRecents = this.paiementService.avisRecentsResource.value;

  tauxOccupation = this.bienService.tauxOccupationResource.value;
  isLoadingTaux = this.bienService.tauxOccupationResource.isLoading;

  bauxActifs = computed(
    () => this.baux().filter((bail) => !bail.dateFin || new Date(bail.dateFin) > new Date()).length,
  );

  constructor() {
    // Un nouvel avis généré en direct (WebSocket) rafraîchit la bannière sans reload manuel.
    effect(() => {
      if (this.notificationService.lastReceived()) {
        this.paiementService.avisRecentsResource.reload();
      }
    });
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BienService } from '../../services/bien.service';
import { LocataireService } from '../../services/locataire.service';
import { BailService } from '../../services/bail.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private bienService = inject(BienService);
  private locataireService = inject(LocataireService);
  private bailService = inject(BailService);
  private authService = inject(AuthService);

  currentUser = signal<User | null>(null);

  civiliteLabel = computed(() => {
    const civilite = this.currentUser()?.personalInfo.civilite;
    if (civilite === 'MME') return 'Mme';
    if (civilite === 'M') return 'M.';
    return null;
  });

  constructor() {
    this.authService.getCurrentUser().subscribe((user) => this.currentUser.set(user));
  }

  biens = this.bienService.biensResource.value;
  isLoadingBiens = this.bienService.biensResource.isLoading;

  locataires = this.locataireService.locatairesResource.value;
  isLoadingLocataires = this.locataireService.locatairesResource.isLoading;

  baux = this.bailService.bauxResource.value;
  isLoadingBaux = this.bailService.bauxResource.isLoading;

  bauxActifs = computed(
    () => this.baux().filter((bail) => !bail.dateFin || new Date(bail.dateFin) > new Date()).length,
  );
}

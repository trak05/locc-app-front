import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BienService } from '../../services/bien.service';
import { LocataireService } from '../../services/locataire.service';
import { BailService } from '../../services/bail.service';

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

  biens = this.bienService.biensResource.value;
  isLoadingBiens = this.bienService.biensResource.isLoading;

  locataires = this.locataireService.locatairesResource.value;
  isLoadingLocataires = this.locataireService.locatairesResource.isLoading;

  baux = this.bailService.bauxResource.value;
  isLoadingBaux = this.bailService.bauxResource.isLoading;

  bauxActifs = computed(
    () => this.baux().filter((bail) => !bail.dateFin || new Date(bail.dateFin) > new Date()).length
  )
  ;
}

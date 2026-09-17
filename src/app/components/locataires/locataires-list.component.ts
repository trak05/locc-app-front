import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocataireService } from '../../services/locataire.service';

@Component({
  selector: 'app-locataires-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './locataires-list.component.html',
  styleUrl: './locataires-list.component.scss',
})
export class LocatairesListComponent {
  locataireService = inject(LocataireService);
  locataires = this.locataireService.locatairesResource.value;
  isLoading = this.locataireService.locatairesResource.isLoading;
}

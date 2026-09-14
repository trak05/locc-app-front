import { Component, inject } from '@angular/core';
import { LocataireService } from '../../services/locataire.service';

@Component({
  selector: 'app-locataires-list',
  standalone: true,
  imports: [],
  templateUrl: './locataires-list.component.html',
})
export class LocatairesListComponent {
  locataireService = inject(LocataireService);
  locataires = this.locataireService.locatairesResource.value;
  isLoading = this.locataireService.locatairesResource.isLoading;
}

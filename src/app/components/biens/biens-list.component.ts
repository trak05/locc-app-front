import { Component, inject } from '@angular/core';
import { BienService } from '../../services/bien.service';

@Component({
  selector: 'app-biens-list',
  standalone: true,
  imports: [],
  templateUrl: './biens-list.component.html',
})
export class BiensListComponent {
  bienService = inject(BienService);
  biens = this.bienService.biensResource.value;
  isLoading = this.bienService.biensResource.isLoading;
}

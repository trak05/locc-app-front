import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BienService } from '../../services/bien.service';

@Component({
  selector: 'app-biens-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './biens-list.component.html',
  styleUrl: './biens-list.component.scss',
})
export class BiensListComponent {
  bienService = inject(BienService);
  biens = this.bienService.biensResource.value;
  isLoading = this.bienService.biensResource.isLoading;
}

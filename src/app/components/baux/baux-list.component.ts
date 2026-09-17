import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BailService } from '../../services/bail.service';

@Component({
  selector: 'app-baux-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './baux-list.component.html',
})
export class BauxListComponent {
  bailService = inject(BailService);
  baux = this.bailService.bauxResource.value;
  isLoading = this.bailService.bauxResource.isLoading;
}

import { Component, inject } from '@angular/core';
import { BailService } from '../../services/bail.service';

@Component({
  selector: 'app-baux-list',
  standalone: true,
  imports: [],
  templateUrl: './baux-list.component.html',
})
export class BauxListComponent {
  bailService = inject(BailService);
  baux = this.bailService.bauxResource.value;
  isLoading = this.bailService.bauxResource.isLoading;
}

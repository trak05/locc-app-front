import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BailService } from '../../services/bail.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-baux-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './baux-list.component.html',
})
export class BauxListComponent {
  authService = inject(AuthService);
  bailService = inject(BailService);
  baux = this.bailService.bauxResource.value;
  isLoading = this.bailService.bauxResource.isLoading;
}

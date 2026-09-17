import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaiementService } from '../../services/paiement.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-vue-ensemble',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './vue-ensemble.component.html',
  styleUrl: './vue-ensemble.component.scss',
})
export class VueEnsembleComponent {
  authService = inject(AuthService);
  paiementService = inject(PaiementService);

  suivis = this.paiementService.vueEnsembleResource.value;
  isLoading = this.paiementService.vueEnsembleResource.isLoading;
}

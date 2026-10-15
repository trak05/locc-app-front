import { Component, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { BienService } from '../../services/bien.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-biens-list',
  standalone: true,
  imports: [RouterLink, ConfirmPopup, DecimalPipe, DatePipe],
  templateUrl: './biens-list.component.html',
  styleUrl: './biens-list.component.scss',
})
export class BiensListComponent {
  authService = inject(AuthService);
  bienService = inject(BienService);
  private confirmationService = inject(ConfirmationService);
  biens = this.bienService.biensResource.value;
  isLoading = this.bienService.biensResource.isLoading;
  tauxOccupation = this.bienService.tauxOccupationResource.value;
  tauxParBien = computed(
    () => new Map((this.tauxOccupation()?.biens ?? []).map((t) => [t.bien.id, t.tauxOccupation]))
  );

  confirmDelete(event: Event, id: number): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Supprimer ce bien ?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonProps: { severity: 'danger', size: 'small' },
      rejectButtonProps: { severity: 'secondary', size: 'small', outlined: true },
      accept: () => {
        this.bienService.delete(id).subscribe();
      },
    });
  }
}

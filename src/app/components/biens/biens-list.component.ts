import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { BienService } from '../../services/bien.service';

@Component({
  selector: 'app-biens-list',
  standalone: true,
  imports: [RouterLink, ConfirmPopup],
  templateUrl: './biens-list.component.html',
  styleUrl: './biens-list.component.scss',
})
export class BiensListComponent {
  bienService = inject(BienService);
  private confirmationService = inject(ConfirmationService);
  biens = this.bienService.biensResource.value;
  isLoading = this.bienService.biensResource.isLoading;

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

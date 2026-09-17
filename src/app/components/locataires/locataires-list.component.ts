import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { LocataireService } from '../../services/locataire.service';

@Component({
  selector: 'app-locataires-list',
  standalone: true,
  imports: [RouterLink, ConfirmPopup],
  templateUrl: './locataires-list.component.html',
  styleUrl: './locataires-list.component.scss',
})
export class LocatairesListComponent {
  locataireService = inject(LocataireService);
  private confirmationService = inject(ConfirmationService);
  locataires = this.locataireService.locatairesResource.value;
  isLoading = this.locataireService.locatairesResource.isLoading;

  confirmDelete(event: Event, id: number): void {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Supprimer ce locataire ?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonProps: { severity: 'danger', size: 'small' },
      rejectButtonProps: { severity: 'secondary', size: 'small', outlined: true },
      accept: () => {
        this.locataireService.delete(id).subscribe();
      },
    });
  }
}

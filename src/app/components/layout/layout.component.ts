import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ParkingRole, Role } from '../../models/auth.model';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationBellComponent } from '../notifications/notification-bell.component';

const ROLE_LABELS: Record<Role, string> = { OWNER: 'Propriétaire', TENANT: 'Locataire' };
const PARKING_ROLE_LABELS: Record<ParkingRole, string> = { LOUEUR: 'Loueur de place', VOYAGEUR: 'Voyageur' };

/**
 * Shell v0 : juste une barre de nav minimale + router-outlet. Pas de
 * burger/sidebar façon padel-club-front pour l'instant — le design de la
 * navigation sera une tâche dédiée une fois le squelette validé.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationBellComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  private router = inject(Router);

  currentUser = this.authService.currentUserResource.value;

  // Basé sur currentUserResource (et non le JWT) : l'entrée apparaît dès le reload qui suit l'activation.
  parkingRole = computed(() => this.currentUser()?.parkingRole ?? null);

  initials = computed(() => {
    const info = this.currentUser()?.personalInfo;
    if (!info) return '';
    return (info.nom.charAt(0) + info.prenom.charAt(0)).toUpperCase();
  });

  roleLabel = computed(() => {
    const u = this.currentUser();
    if (!u) return '';
    const labels: string[] = [];
    if (u.role) labels.push(ROLE_LABELS[u.role]);
    if (u.parkingRole) labels.push(PARKING_ROLE_LABELS[u.parkingRole]);
    return labels.join(', ');
  });

  constructor() {
    if (this.authService.isOwner()) {
      this.notificationService.connect();
      this.notificationService.loadInitial();
    }
  }

  logout(): void {
    this.notificationService.disconnect();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

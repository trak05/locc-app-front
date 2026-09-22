import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { NotificationBellComponent } from '../notifications/notification-bell.component';

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

  initials = computed(() => {
    const info = this.currentUser()?.personalInfo;
    if (!info) return '';
    return (info.nom.charAt(0) + info.prenom.charAt(0)).toUpperCase();
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

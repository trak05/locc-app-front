import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AvisNotification } from '../models/paiement.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly API_BASE = 'http://localhost:8081/api';
  private readonly WS_BASE = 'ws://localhost:8081/ws/notifications';
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private socket: WebSocket | null = null;

  // Historique récent (lues + non lues), affiché tel quel dans le menu déroulant — reste
  // stable après un rechargement de page même si des notifications ont été marquées lues
  // entre-temps (contrairement à un chargement basé uniquement sur les non-lues).
  notifications = signal<AvisNotification[]>([]);
  unreadCount = computed(() => this.notifications().filter((n) => !n.lu).length);

  // Dernière notification reçue en direct (pas au chargement initial) — les composants qui
  // affichent des données d'avis s'y abonnent pour se rafraîchir automatiquement sans reload.
  lastReceived = signal<AvisNotification | null>(null);

  connect(): void {
    const token = this.authService.getToken();
    this.socket = new WebSocket(`${this.WS_BASE}?token=${token}`);
    this.socket.onmessage = (event: MessageEvent) => {
      const notification: AvisNotification = JSON.parse(event.data);
      this.notifications.update((list) => [notification, ...list]);
      this.lastReceived.set(notification);
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  loadInitial(): void {
    this.http.get<AvisNotification[]>(`${this.API_BASE}/notifications/recentes`).subscribe((result) => {
      this.notifications.set(result);
    });
  }

  markAllRead(): void {
    this.http.post<void>(`${this.API_BASE}/notifications/lues`, {}).subscribe(() => {
      this.notifications.update((list) => list.map((n) => ({ ...n, lu: true })));
    });
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlaceParkingService } from '../../services/place-parking.service';
import { ReservationParkingService } from '../../services/reservation-parking.service';
import { TYPE_PLACE_LABELS, VILLE_LABELS } from '../../models/place-parking.model';
import { PrixDtPipe } from '../../pipe/prix-dt.pipe';

const MESSAGE_DATES_INVALIDES = 'Les dates de cette recherche sont invalides. Relancez une recherche.';
const MESSAGE_PLACE_INDISPONIBLE = "Cette place n'est plus disponible.";

/** Détail d'une place pour le voyageur (LOC-24) : jamais d'adresse ni de données du loueur.
 *  LOC-25 : demande de réservation via un récapitulatif affiché sur la page. */
@Component({
  selector: 'app-place-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, ReactiveFormsModule, PrixDtPipe],
  templateUrl: './place-detail.component.html',
  styleUrl: './place-detail.component.scss',
})
export class PlaceDetailComponent {
  private placeParkingService = inject(PlaceParkingService);
  private reservationParkingService = inject(ReservationParkingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  villeLabels = VILLE_LABELS;
  typeLabels = TYPE_PLACE_LABELS;

  placeResource = this.placeParkingService.placeConsulteeResource;

  private id = Number(this.route.snapshot.paramMap.get('id'));
  /** Id non entier ou ≤ 0 : aucune requête. */
  idInvalide = !Number.isInteger(this.id) || this.id <= 0;

  arrivee = this.route.snapshot.queryParamMap.get('arrivee');
  depart = this.route.snapshot.queryParamMap.get('depart');
  /** Dates absentes de l'URL : aucune requête. */
  datesAbsentes = !this.arrivee || !this.depart;

  // status() / error() d'abord : value() lève une exception quand la resource est en erreur.
  chargement = computed(() => {
    const status = this.placeResource.status();
    return status === 'idle' || status === 'loading' || status === 'reloading';
  });
  erreur = computed(() => {
    const error = this.placeResource.error();
    if (!error) {
      return null;
    }
    const status = (error as HttpErrorResponse).status;
    if (status === 404) {
      return MESSAGE_PLACE_INDISPONIBLE;
    }
    return status === 400 ? MESSAGE_DATES_INVALIDES : "Impossible d'afficher cette place. Veuillez réessayer.";
  });

  messageDatesInvalides = MESSAGE_DATES_INVALIDES;
  messagePlaceIndisponible = MESSAGE_PLACE_INDISPONIBLE;

  /** Récapitulatif de la demande (LOC-25), piloté par un signal. */
  recapOuvert = signal(false);
  envoiEnCours = signal(false);
  erreurEnvoi = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    vehicule: ['', Validators.maxLength(50)],
    message: ['', Validators.maxLength(500)],
  });

  constructor() {
    if (this.idInvalide || this.datesAbsentes) {
      this.placeParkingService.setPlaceConsultee(null);
    } else {
      this.placeParkingService.setPlaceConsultee({ id: this.id, arrivee: this.arrivee!, depart: this.depart! });
    }
  }

  ouvrirRecap(): void {
    this.recapOuvert.set(true);
  }

  // Saisies conservées : rouvrir le récapitulatif les retrouve.
  abandonner(): void {
    this.recapOuvert.set(false);
    this.erreurEnvoi.set(null);
  }

  // Bouton jamais désactivé : un clic sur un formulaire invalide révèle les messages.
  confirmer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.envoiEnCours()) {
      return;
    }

    const { vehicule, message } = this.form.getRawValue();
    this.envoiEnCours.set(true);
    this.erreurEnvoi.set(null);
    this.reservationParkingService
      .create({
        placeId: this.id,
        arrivee: this.arrivee!,
        depart: this.depart!,
        vehicule: vehicule.trim() || null,
        message: message.trim() || null,
      })
      .subscribe({
        next: () => {
          this.envoiEnCours.set(false);
          this.router.navigate(['/parking/voyageur/reservations'], { state: { demandeEnvoyee: true } });
        },
        error: (err: HttpErrorResponse) => {
          this.envoiEnCours.set(false);
          this.erreurEnvoi.set(this.messageErreurEnvoi(err.status));
        },
      });
  }

  private messageErreurEnvoi(status: number): string {
    switch (status) {
      case 400:
        return 'Les dates de cette demande sont invalides. Relancez une recherche.';
      case 404:
        return MESSAGE_PLACE_INDISPONIBLE;
      case 409:
        return 'Vous avez déjà une demande en attente pour cette place sur ces dates.';
      case 403:
        return 'Seul un compte voyageur peut demander une réservation.';
      default:
        return "Impossible d'envoyer votre demande. Veuillez réessayer.";
    }
  }
}

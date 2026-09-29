import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PlaceParkingService } from '../../services/place-parking.service';
import { TYPE_PLACE_LABELS, VILLE_LABELS } from '../../models/place-parking.model';
import { PrixDtPipe } from '../../pipe/prix-dt.pipe';

const MESSAGE_DATES_INVALIDES = 'Les dates de cette recherche sont invalides. Relancez une recherche.';

/** Détail d'une place pour le voyageur (LOC-24) : jamais d'adresse ni de données du loueur. */
@Component({
  selector: 'app-place-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, PrixDtPipe],
  templateUrl: './place-detail.component.html',
  styleUrl: './place-detail.component.scss',
})
export class PlaceDetailComponent {
  private placeParkingService = inject(PlaceParkingService);
  private route = inject(ActivatedRoute);

  villeLabels = VILLE_LABELS;
  typeLabels = TYPE_PLACE_LABELS;

  placeResource = this.placeParkingService.placeConsulteeResource;

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
      return "Cette place n'est plus disponible.";
    }
    return status === 400 ? MESSAGE_DATES_INVALIDES : "Impossible d'afficher cette place. Veuillez réessayer.";
  });

  messageDatesInvalides = MESSAGE_DATES_INVALIDES;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.datesAbsentes) {
      this.placeParkingService.setPlaceConsultee(null);
    } else {
      this.placeParkingService.setPlaceConsultee({ id, arrivee: this.arrivee!, depart: this.depart! });
    }
  }
}

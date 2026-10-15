import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlaceParkingService } from '../../services/place-parking.service';
import {
  CriteresRecherche,
  TYPE_PLACE_LABELS,
  VILLE_LABELS,
  VILLES_TUNISIE,
  VilleTunisie,
} from '../../models/place-parking.model';
import { PrixDtPipe } from '../../pipe/prix-dt.pipe';
import { aujourdhuiTunisie, periodeValidator } from '../../validator/periode-parking';

/** Accueil du voyageur (LOC-24) : recherche d'une place par ville et par dates. */
@Component({
  selector: 'app-recherche-places',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe, PrixDtPipe],
  templateUrl: './recherche-places.component.html',
  styleUrl: './recherche-places.component.scss',
})
export class RecherchePlacesComponent {
  private fb = inject(FormBuilder);
  private placeParkingService = inject(PlaceParkingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  villes = VILLES_TUNISIE;
  villeLabels = VILLE_LABELS;
  typeLabels = TYPE_PLACE_LABELS;
  aujourdhui = aujourdhuiTunisie();

  resultatsResource = this.placeParkingService.resultatsResource;

  /** Critères de la recherche affichée (issus de l'URL, validés). */
  criteres = signal<CriteresRecherche | null>(null);

  // status() / error() d'abord : value() lève une exception quand la resource est en erreur.
  chargement = computed(() => {
    const status = this.resultatsResource.status();
    return status === 'idle' || status === 'loading' || status === 'reloading';
  });
  erreur = computed(() => {
    const error = this.resultatsResource.error();
    if (!error) {
      return null;
    }
    return (error as HttpErrorResponse).status === 400
      ? 'Les critères de recherche sont invalides. Vérifiez les dates.'
      : 'Impossible de lancer la recherche. Veuillez réessayer.';
  });

  form = this.fb.nonNullable.group(
    {
      ville: this.fb.control<VilleTunisie | null>(null, Validators.required),
      arrivee: ['', Validators.required],
      depart: ['', Validators.required],
    },
    { validators: periodeValidator },
  );

  private queryParams = toSignal(this.route.queryParamMap);

  constructor() {
    // Source unique : l'URL. Retour du détail, précédent ou F5 → formulaire pré-rempli et recherche relancée.
    effect(() => {
      const params = this.queryParams();
      const ville = params?.get('ville');
      const arrivee = params?.get('arrivee');
      const depart = params?.get('depart');
      if (!ville || !arrivee || !depart) {
        this.appliquer(null);
        return;
      }

      const villeConnue = (VILLES_TUNISIE as string[]).includes(ville) ? (ville as VilleTunisie) : null;
      this.form.patchValue({ ville: villeConnue, arrivee, depart });
      if (villeConnue && this.form.valid) {
        this.appliquer({ ville: villeConnue, arrivee, depart });
      } else {
        this.appliquer(null);
        this.form.markAllAsTouched();
      }
    });
  }

  // Bouton jamais désactivé : un clic sur un formulaire invalide révèle tous les messages, saisies conservées.
  rechercher(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { ville, arrivee, depart } = this.form.getRawValue();
    const actuels = this.criteres();
    if (actuels && actuels.ville === ville && actuels.arrivee === arrivee && actuels.depart === depart) {
      // Même URL : la navigation ne déclencherait rien, on relance explicitement.
      this.resultatsResource.reload();
      return;
    }
    this.router.navigate([], { relativeTo: this.route, queryParams: { ville, arrivee, depart } });
  }

  private appliquer(criteres: CriteresRecherche | null): void {
    this.criteres.set(criteres);
    this.placeParkingService.setCriteres(criteres);
  }
}

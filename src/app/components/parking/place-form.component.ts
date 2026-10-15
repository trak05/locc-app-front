import { Component, computed, effect, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlaceParkingService } from '../../services/place-parking.service';
import {
  PlaceParkingRequest,
  TYPE_PLACE_LABELS,
  TypePlace,
  VILLE_LABELS,
  VILLES_TUNISIE,
  VilleTunisie,
} from '../../models/place-parking.model';

/** Au plus 3 décimales (millimes) ; les autres validateurs gèrent le vide et le signe. */
function max3Decimales(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return value != null && !/^\d+(\.\d{1,3})?$/.test(String(value)) ? { decimales: true } : null;
}

@Component({
  selector: 'app-place-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './place-form.component.html',
  styleUrl: './place-form.component.scss',
})
export class PlaceFormComponent {
  private fb = inject(FormBuilder);
  private placeParkingService = inject(PlaceParkingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  villes = VILLES_TUNISIE;
  villeLabels = VILLE_LABELS;
  typeLabels = TYPE_PLACE_LABELS;

  placeId = signal<number | null>(null);
  isEditMode = computed(() => this.placeId() !== null);

  // Pas de GET /{id} : l'édition lit la liste chargée ; une fois celle-ci résolue, place absente = introuvable.
  placeIntrouvable = computed(() => {
    const id = this.placeId();
    const resource = this.placeParkingService.placesResource;
    return id !== null && resource.status() === 'resolved' && !resource.value().some((p) => p.id === id);
  });

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    ville: this.fb.control<VilleTunisie | null>(null, Validators.required),
    quartier: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    adresse: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]],
    type: this.fb.control<TypePlace | null>(null, Validators.required),
    prixParJour: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.001),
      Validators.max(999999.999),
      max3Decimales,
    ]),
    description: ['', Validators.maxLength(1000)],
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.placeId.set(Number(idParam));
    }

    // placesResource se charge de façon asynchrone (accès direct à l'URL d'édition) :
    // on patche dès que la place est trouvée, tant que l'utilisateur n'a rien modifié.
    effect(() => {
      const id = this.placeId();
      if (id === null) {
        return;
      }

      const place = this.placeParkingService.placesResource.value().find((p) => p.id === id);
      if (place && this.form.pristine) {
        this.form.patchValue({
          ville: place.ville,
          quartier: place.quartier,
          adresse: place.adresse,
          type: place.type,
          prixParJour: place.prixParJour,
          description: place.description ?? '',
        });
      }
    });
  }

  // Bouton jamais désactivé par la validité : un clic sur un formulaire invalide révèle tous les messages.
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    // ville, type et prixParJour sont non null ici (Validators.required).
    const v = this.form.getRawValue();
    const description = v.description.trim();
    const request: PlaceParkingRequest = {
      ville: v.ville as VilleTunisie,
      quartier: v.quartier.trim(),
      adresse: v.adresse.trim(),
      type: v.type as TypePlace,
      prixParJour: v.prixParJour as number,
      description: description === '' ? null : description,
    };
    const id = this.placeId();
    const request$ =
      id !== null ? this.placeParkingService.update(id, request) : this.placeParkingService.create(request);

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/parking/loueur']);
      },
      // Le formulaire n'est jamais réinitialisé : la saisie reste en place pour correction.
      error: (err) => {
        this.loading.set(false);
        if (err.status === 400) {
          this.errorMessage.set('Certaines informations sont invalides. Vérifiez le formulaire.');
        } else if (err.status === 404) {
          this.errorMessage.set('Cette place est introuvable ou a été retirée.');
        } else {
          this.errorMessage.set("Impossible d'enregistrer cette place. Veuillez réessayer.");
        }
      },
    });
  }
}

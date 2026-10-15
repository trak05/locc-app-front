import { Component, computed, effect, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BailService } from '../../services/bail.service';
import { BienService } from '../../services/bien.service';
import { LocataireService } from '../../services/locataire.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-bail-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './bail-form.component.html',
  styleUrl: './bail-form.component.scss',
})
export class BailFormComponent {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private bailService = inject(BailService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private bienService = inject(BienService);
  private locataireService = inject(LocataireService);
  biens = this.bienService.biensResource.value;
  locataires = this.locataireService.locatairesResource.value;

  bailId = signal<number | null>(null);
  isEditMode = computed(() => this.bailId() !== null);
  bail = computed(() => this.bailService.bauxResource.value().find((b) => b.id === this.bailId()));

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    bienId: this.fb.control<number | null>(null, Validators.required),
    locataireId: this.fb.control<number | null>(null, Validators.required),
    dateDebut: ['', Validators.required],
    dateFin: [''],
    loyerMensuel: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    depotGarantie: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.bailId.set(Number(idParam));
      // Bien et locataire ne sont pas modifiables sur un bail existant : désactivés,
      // ils sortent aussi de la validation du formulaire.
      this.form.controls.bienId.disable();
      this.form.controls.locataireId.disable();
    }

    // bauxResource se charge de façon asynchrone : en accès direct à l'URL
    // d'édition, on patche le form dès que le bail arrive, tant que
    // l'utilisateur n'a pas commencé à le modifier (form.pristine).
    effect(() => {
      const bail = this.bail();
      if (bail && this.form.pristine) {
        this.form.patchValue({
          dateDebut: bail.dateDebut,
          dateFin: bail.dateFin ?? '',
          loyerMensuel: bail.loyerMensuel,
          depotGarantie: bail.depotGarantie,
        });
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const rawValue = this.form.getRawValue();
    const id = this.bailId();
    const request$ = id
      ? this.bailService.update(id, {
          dateDebut: rawValue.dateDebut,
          dateFin: rawValue.dateFin || undefined,
          loyerMensuel: rawValue.loyerMensuel!,
          depotGarantie: rawValue.depotGarantie!,
        })
      : this.bailService.create({
          bienId: rawValue.bienId!,
          locataireId: rawValue.locataireId!,
          dateDebut: rawValue.dateDebut,
          dateFin: rawValue.dateFin || undefined,
          loyerMensuel: rawValue.loyerMensuel!,
          depotGarantie: rawValue.depotGarantie!,
        });

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/baux']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        // Le back ne renvoie pas le texte des erreurs : messages en dur par code HTTP.
        if (err.status === 400) {
          this.errorMessage.set(
            'Vérifiez les champs : dates, loyer et dépôt sont obligatoires, la date de fin ne peut pas précéder la date de début et les montants doivent être positifs.'
          );
        } else if (err.status === 409) {
          this.errorMessage.set('Ce bien est déjà loué sur une période qui chevauche ces dates.');
        } else {
          this.errorMessage.set("Impossible d'enregistrer ce bail.");
        }
      },
    });
  }
}

import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BienService } from '../../services/bien.service';
import { TypeBien } from '../../models/bien.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-bien-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './bien-form.component.html',
  styleUrl: './bien-form.component.scss',
})
export class BienFormComponent {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private bienService = inject(BienService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  types: TypeBien[] = ['APPARTEMENT', 'MAISON', 'STUDIO'];

  bienId = signal<number | null>(null);
  isEditMode = computed(() => this.bienId() !== null);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    adresse: ['', Validators.required],
    ville: ['', Validators.required],
    codePostal: ['', Validators.required],
    type: this.fb.nonNullable.control<TypeBien>('APPARTEMENT', Validators.required),
    surface: this.fb.control<number | null>(null),
    nombrePieces: this.fb.control<number | null>(null),
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.bienId.set(Number(idParam));
    }

    // biensResource se charge de façon asynchrone : si on arrive directement
    // sur l'URL d'édition, la liste n'est pas forcément prête tout de suite.
    // On repatch le form dès qu'on trouve le bien, tant que l'utilisateur n'a
    // pas commencé à modifier (form.pristine).
    effect(() => {
      const id = this.bienId();
      if (id === null) {
        return;
      }

      const bien = this.bienService.biensResource.value().find((b) => b.id === id);
      if (bien && this.form.pristine) {
        this.form.patchValue(bien);
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
    const value = {
      ...rawValue,
      surface: rawValue.surface ?? undefined,
      nombrePieces: rawValue.nombrePieces ?? undefined,
    };
    const id = this.bienId();
    const request$ = id ? this.bienService.update(id, value) : this.bienService.create(value);

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/biens']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set("Impossible d'enregistrer ce bien.");
      },
    });
  }
}

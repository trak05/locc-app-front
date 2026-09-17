import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaiementService } from '../../services/paiement.service';

@Component({
  selector: 'app-paiement-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './paiement-form.component.html',
  styleUrl: './paiement-form.component.scss',
})
export class PaiementFormComponent {
  private fb = inject(FormBuilder);
  private paiementService = inject(PaiementService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  bailId = signal<number | null>(null);
  paiementId = signal<number | null>(null);
  isEditMode = computed(() => this.paiementId() !== null);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    periode: ['', Validators.required],
    montant: this.fb.control<number | null>(null, Validators.required),
    datePaiement: ['', Validators.required],
    moyenPaiement: [''],
    commentaire: [''],
  });

  constructor() {
    const bailIdParam = this.route.snapshot.paramMap.get('id');
    const bailId = bailIdParam ? Number(bailIdParam) : null;
    this.bailId.set(bailId);
    this.paiementService.setBailId(bailId);

    const paiementIdParam = this.route.snapshot.paramMap.get('paiementId');
    if (paiementIdParam) {
      this.paiementId.set(Number(paiementIdParam));
    }

    // paiementsResource se charge de façon asynchrone : si on arrive
    // directement sur l'URL d'édition, la liste n'est pas forcément prête
    // tout de suite. On repatch le form dès qu'on trouve le paiement, tant
    // que l'utilisateur n'a pas commencé à modifier (form.pristine).
    effect(() => {
      const id = this.paiementId();
      if (id === null) {
        return;
      }

      const paiement = this.paiementService.paiementsResource.value().find((p) => p.id === id);
      if (paiement && this.form.pristine) {
        this.form.patchValue(paiement);
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const bailId = this.bailId();
    if (bailId === null) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const rawValue = this.form.getRawValue();
    const value = {
      ...rawValue,
      montant: rawValue.montant ?? 0,
      moyenPaiement: rawValue.moyenPaiement || undefined,
      commentaire: rawValue.commentaire || undefined,
    };
    const id = this.paiementId();
    const request$ = id ? this.paiementService.update(id, value) : this.paiementService.create(bailId, value);

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/baux', bailId, 'paiements']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set("Impossible d'enregistrer ce paiement.");
      },
    });
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ActivationParkingRequest, ParkingRole } from '../../models/auth.model';
import { telephoneValidators } from '../../validator/telephone';

/**
 * Activation du module Parking par un propriétaire ou un locataire (LOC-22).
 * Identifiant, email, mot de passe et rôle de gestion locative ne sont pas touchés.
 */
@Component({
  selector: 'app-activation-parking',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './activation-parking.component.html',
  styleUrl: './activation-parking.component.scss',
})
export class ActivationParkingComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  currentUser = this.authService.currentUserResource.value;
  /** Téléphone demandé (et envoyé) seulement s'il manque au profil. */
  telephoneManquant = computed(() => !this.currentUser()?.personalInfo.telephone);

  formOuvert = signal(false);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    parkingRole: this.fb.control<ParkingRole | null>(null, Validators.required),
    telephone: [''],
    cguAcceptees: [false, Validators.requiredTrue],
  });

  ouvrir(): void {
    this.form.controls.telephone.setValidators(this.telephoneManquant() ? telephoneValidators : null);
    this.form.controls.telephone.updateValueAndValidity();
    this.formOuvert.set(true);
  }

  activer(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const v = this.form.getRawValue();
    const request: ActivationParkingRequest = {
      parkingRole: v.parkingRole as ParkingRole,
      cguAcceptees: v.cguAcceptees,
      ...(this.telephoneManquant() ? { telephone: v.telephone } : {}),
    };

    this.authService.activerParking(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.formOuvert.set(false);
        this.successMessage.set('Module Parking activé. Retrouvez-le dans la barre de navigation.');
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.errorMessage.set('Le module Parking est déjà activé sur ce compte.');
        } else if (err.status === 400) {
          this.errorMessage.set('Vérifiez les informations saisies.');
        } else {
          this.errorMessage.set("Impossible d'activer le module Parking.");
        }
      },
    });
  }
}

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InscriptionParkingRequest, ParkingRole } from '../../models/auth.model';
import {
  INSCRIPTION_PASSWORD_MESSAGES,
  newPasswordValidators,
  passwordsMatchValidator,
} from '../../validator/password-policy';
import { telephoneValidators } from '../../validator/telephone';

@Component({
  selector: 'app-inscription-parking',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './inscription-parking.component.html',
  styleUrls: ['./auth.component.scss', './inscription-parking.component.scss'],
})
export class InscriptionParkingComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string | null>(null);
  loading = signal(false);
  passwordMessages = INSCRIPTION_PASSWORD_MESSAGES;

  form = this.fb.nonNullable.group(
    {
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', telephoneValidators],
      username: ['', [Validators.required, Validators.pattern(/^\S+$/), Validators.maxLength(50)]],
      password: ['', newPasswordValidators],
      confirmation: ['', Validators.required],
      parkingRole: this.fb.control<ParkingRole | null>(null, Validators.required),
      cguAcceptees: [false, Validators.requiredTrue],
    },
    { validators: passwordsMatchValidator('password', 'confirmation') },
  );

  // Bouton jamais désactivé : un clic sur un formulaire invalide révèle tous les messages.
  inscrire(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    // Envoi sans la confirmation ; parkingRole est non null ici (Validators.required).
    const v = this.form.getRawValue();
    const request: InscriptionParkingRequest = {
      username: v.username,
      password: v.password,
      nom: v.nom,
      prenom: v.prenom,
      email: v.email,
      telephone: v.telephone,
      parkingRole: v.parkingRole as ParkingRole,
      cguAcceptees: v.cguAcceptees,
    };
    this.authService.inscrireParking(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate([this.authService.homeUrl()]);
      },
      // Le formulaire n'est jamais réinitialisé : la saisie reste en place pour correction.
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.errorMessage.set('Cet identifiant ou cet email est déjà utilisé.');
        } else if (err.status === 400) {
          this.errorMessage.set('Certaines informations sont invalides. Vérifiez le formulaire.');
        } else {
          this.errorMessage.set('Impossible de créer le compte. Veuillez réessayer.');
        }
      },
    });
  }
}

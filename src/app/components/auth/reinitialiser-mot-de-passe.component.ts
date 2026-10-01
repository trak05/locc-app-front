import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PasswordResetService } from '../../services/password-reset.service';

const MOT_DE_PASSE_LONGUEUR_MIN = 8; // règle commune LOC-12

const motsDePasseIdentiques: ValidatorFn = (group) =>
  group.get('nouveauMotDePasse')?.value === group.get('confirmation')?.value
    ? null
    : { motsDePasseDifferents: true };

@Component({
  selector: 'app-reinitialiser-mot-de-passe',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reinitialiser-mot-de-passe.component.html',
  styleUrl: './auth.component.scss',
})
export class ReinitialiserMotDePasseComponent {
  private fb = inject(FormBuilder);
  private passwordResetService = inject(PasswordResetService);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token');

  readonly messageRobustesse = 'Le mot de passe doit contenir au moins 8 caractères.';
  readonly messageNonCorrespondance = 'Les deux mots de passe ne correspondent pas.';
  readonly messageLienInvalide =
    "Ce lien de réinitialisation n'est plus valide (déjà utilisé, expiré ou remplacé par une demande plus récente). Veuillez refaire une demande.";

  errorMessage = signal<string | null>(null);
  loading = signal(false);
  showPassword = signal(false);
  lienInvalide = signal(!this.token);

  form = this.fb.nonNullable.group(
    {
      nouveauMotDePasse: ['', [Validators.required, Validators.minLength(MOT_DE_PASSE_LONGUEUR_MIN)]],
      confirmation: ['', Validators.required],
    },
    { validators: motsDePasseIdentiques },
  );

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  confirmer(): void {
    if (this.form.invalid || !this.token) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.passwordResetService
      .confirmer({ token: this.token, nouveauMotDePasse: this.form.getRawValue().nouveauMotDePasse })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { motDePasseReinitialise: 1 } });
        },
        error: (err) => {
          this.loading.set(false);
          if (err.status === 410) {
            this.lienInvalide.set(true);
          } else if (err.status === 400) {
            this.errorMessage.set(this.messageRobustesse);
          } else {
            this.errorMessage.set('Une erreur est survenue. Veuillez réessayer.');
          }
        },
      });
  }
}

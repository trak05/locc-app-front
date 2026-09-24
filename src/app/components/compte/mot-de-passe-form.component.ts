import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  differentFromCurrentValidator,
  newPasswordValidators,
  PASSWORD_MESSAGES,
  passwordsMatchValidator,
} from '../../validator/password-policy';

@Component({
  selector: 'app-mot-de-passe-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './mot-de-passe-form.component.html',
  styleUrl: './mot-de-passe-form.component.scss',
})
export class MotDePasseFormComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  messages = PASSWORD_MESSAGES;

  form = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', newPasswordValidators],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: [
        passwordsMatchValidator('newPassword', 'confirmPassword'),
        differentFromCurrentValidator('currentPassword', 'newPassword'),
      ],
    }
  );

  save(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { currentPassword, newPassword } = this.form.getRawValue();
    // Pas de navigation après le succès : l'utilisateur reste connecté sur la page.
    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.loading.set(false);
        this.form.reset();
        this.successMessage.set('Votre mot de passe a été modifié.');
      },
      error: (err) => {
        this.loading.set(false);
        // Le back masque le message d'erreur : on distingue par code HTTP.
        // 422 (et pas 401) : l'intercepteur déconnecterait sur un 401.
        if (err.status === 422) {
          this.errorMessage.set('Le mot de passe actuel est incorrect.');
        } else if (err.status === 400) {
          this.errorMessage.set(PASSWORD_MESSAGES.rule);
        } else {
          this.errorMessage.set('Impossible de modifier le mot de passe.');
        }
      },
    });
  }
}

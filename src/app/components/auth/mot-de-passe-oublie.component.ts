import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PasswordResetService } from '../../services/password-reset.service';

@Component({
  selector: 'app-mot-de-passe-oublie',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './mot-de-passe-oublie.component.html',
  styleUrl: './auth.component.scss',
})
export class MotDePasseOublieComponent {
  private fb = inject(FormBuilder);
  private passwordResetService = inject(PasswordResetService);

  errorMessage = signal<string | null>(null);
  loading = signal(false);
  envoye = signal(false);

  form = this.fb.nonNullable.group({
    identifiant: ['', Validators.required],
  });

  demander(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.passwordResetService.demander(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        // Message neutre, identique que le compte existe ou non (AC3).
        this.envoye.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Une erreur est survenue. Veuillez réessayer.');
      },
    });
  }
}

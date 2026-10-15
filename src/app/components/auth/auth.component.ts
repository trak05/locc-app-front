import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginDraftService } from '../../services/login-draft.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private loginDraft = inject(LoginDraftService);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(
    this.route.snapshot.queryParamMap.has('motDePasseReinitialise')
      ? 'Votre mot de passe a été réinitialisé. Vous pouvez vous connecter avec votre nouveau mot de passe.'
      : null,
  );
  loading = signal(false);
  showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  // Saisie conservée lors d'un aller-retour vers les mentions légales (lue une seule fois).
  private draft = this.loginDraft.consume();

  form = this.fb.nonNullable.group({
    username: [this.draft?.username ?? '', Validators.required],
    password: [this.draft?.password ?? '', Validators.required],
  });

  ouvrirMentionsLegales(): void {
    this.loginDraft.save(this.form.getRawValue());
  }

  login(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate([this.authService.homeUrl()]);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Identifiant ou mot de passe incorrect.');
      },
    });
  }
}

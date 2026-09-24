import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Civilite } from '../../models/auth.model';

@Component({
  selector: 'app-profil-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './profil-form.component.html',
  styleUrl: './profil-form.component.scss',
})
export class ProfilFormComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  civilites: Civilite[] = ['M', 'MME'];

  currentUser = this.authService.currentUserResource.value;
  roleLabel = computed(() => (this.currentUser()?.role === 'OWNER' ? 'Propriétaire' : 'Locataire'));

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Pas de username/password : identifiant et rôle ne sont pas modifiables ici.
  form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    civilite: this.fb.control<Civilite | null>(null),
  });

  constructor() {
    // currentUserResource se charge de façon asynchrone (accès direct par l'URL) ;
    // la garde pristine évite d'écraser la saisie lors du reload après enregistrement.
    effect(() => {
      const user = this.currentUser();
      if (user && this.form.pristine) {
        this.form.patchValue({
          nom: user.personalInfo.nom,
          prenom: user.personalInfo.prenom,
          email: user.personalInfo.email,
          telephone: user.personalInfo.telephone ?? '',
          civilite: user.personalInfo.civilite ?? null,
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
    this.successMessage.set(null);

    const rawValue = this.form.getRawValue();
    const request = {
      ...rawValue,
      telephone: rawValue.telephone || undefined,
      civilite: rawValue.civilite ?? undefined,
    };

    // Pas de navigation après le succès : l'utilisateur reste sur la page.
    this.authService.updateProfil(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.form.markAsPristine();
        this.successMessage.set('Vos informations ont été mises à jour.');
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.errorMessage.set('Cet email est déjà utilisé.');
        } else {
          this.errorMessage.set('Impossible de mettre à jour vos informations.');
        }
      },
    });
  }
}

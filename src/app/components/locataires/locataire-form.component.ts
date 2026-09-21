import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LocataireService } from '../../services/locataire.service';
import { Civilite } from '../../models/auth.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-locataire-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './locataire-form.component.html',
  styleUrl: './locataire-form.component.scss',
})
export class LocataireFormComponent {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private locataireService = inject(LocataireService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  civilites: Civilite[] = ['M', 'MME'];

  locataireId = signal<number | null>(null);
  isEditMode = computed(() => this.locataireId() !== null);

  showPassword = signal(false);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: [''],
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    civilite: this.fb.control<Civilite | null>(null),
  });

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.locataireId.set(Number(idParam));
      // Le mot de passe n'est jamais renvoyé par l'API : pas requis en edition.
      this.form.controls.password.clearValidators();
    } else {
      this.form.controls.password.setValidators(Validators.required);
    }

    // locatairesResource se charge de facon asynchrone : si on arrive directement
    // sur l'URL d'edition, la liste n'est pas forcement prete tout de suite.
    effect(() => {
      const id = this.locataireId();
      if (id === null) {
        return;
      }

      const locataire = this.locataireService.locatairesResource.value().find((l) => l.id === id);
      if (locataire && this.form.pristine) {
        this.form.patchValue({
          username: locataire.username,
          nom: locataire.personalInfo.nom,
          prenom: locataire.personalInfo.prenom,
          email: locataire.personalInfo.email,
          telephone: locataire.personalInfo.telephone,
          civilite: locataire.personalInfo.civilite ?? null,
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
    const value = {
      ...rawValue,
      password: rawValue.password || undefined,
      telephone: rawValue.telephone || undefined,
      civilite: rawValue.civilite ?? undefined,
    };
    const id = this.locataireId();
    const request$ = id ? this.locataireService.update(id, value) : this.locataireService.create(value);

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/locataires']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.errorMessage.set("Ce nom d'utilisateur ou cet email est déjà utilisé.");
        } else {
          this.errorMessage.set("Impossible d'enregistrer ce locataire.");
        }
      },
    });
  }
}

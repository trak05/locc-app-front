import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BailService } from '../../services/bail.service';
import { BienService } from '../../services/bien.service';
import { LocataireService } from '../../services/locataire.service';

@Component({
  selector: 'app-bail-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './bail-form.component.html',
  styleUrl: './bail-form.component.scss',
})
export class BailFormComponent {
  private fb = inject(FormBuilder);
  private bailService = inject(BailService);
  private router = inject(Router);

  private bienService = inject(BienService);
  private locataireService = inject(LocataireService);
  biens = this.bienService.biensResource.value;
  locataires = this.locataireService.locatairesResource.value;

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    bienId: this.fb.control<number | null>(null, Validators.required),
    locataireId: this.fb.control<number | null>(null, Validators.required),
    dateDebut: ['', Validators.required],
    dateFin: [''],
    loyerMensuel: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    depotGarantie: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
  });

  save(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const rawValue = this.form.getRawValue();
    const value = {
      bienId: rawValue.bienId!,
      locataireId: rawValue.locataireId!,
      dateDebut: rawValue.dateDebut,
      dateFin: rawValue.dateFin || undefined,
      loyerMensuel: rawValue.loyerMensuel!,
      depotGarantie: rawValue.depotGarantie!,
    };

    this.bailService.create(value).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/baux']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Impossible de créer ce bail.');
      },
    });
  }
}

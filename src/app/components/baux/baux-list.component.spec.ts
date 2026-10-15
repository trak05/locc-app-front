import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Bail } from '../../models/bail.model';
import { BailService } from '../../services/bail.service';
import { fakeJwt, validPayload } from '../../testing/jwt';
import { BauxListComponent } from './baux-list.component';

const bail = (id: number): Bail =>
  ({
    id,
    bien: { id, nom: `Bien ${id}` },
    locataire: { id, personalInfo: { nom: 'Martin', prenom: 'Paul', email: 'p@m.fr' } },
    dateDebut: '2026-01-01',
    loyerMensuel: 800,
    depotGarantie: 800,
  }) as unknown as Bail;

const VIDE = 'Baux : Aucun bail pour l\'instant';

describe('BauxListComponent', () => {
  let httpMock: HttpTestingController;

  async function setup(role: 'OWNER' | 'TENANT' = 'OWNER') {
    localStorage.setItem('token', fakeJwt(validPayload({ role })));
    await TestBed.configureTestingModule({
      imports: [BauxListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        ConfirmationService,
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(BauxListComponent);
    fixture.detectChanges();
    // Le AuthService charge l'utilisateur connecté : sans réponse, whenStable() ne se résout jamais.
    httpMock
      .expectOne((r) => r.url.endsWith('/connected-user'))
      .flush({ id: 1, username: 'u', role, parkingRole: null, personalInfo: { nom: 'N', prenom: 'P', email: 'e@e.fr' } });
    return fixture;
  }

  const settle = async (fixture: { whenStable(): Promise<unknown>; detectChanges(): void }) => {
    // Les services injectés (biens, paiements...) lancent leurs propres requêtes : sans réponse,
    // whenStable() ne se résout jamais. Seule la requête /baux nous intéresse.
    const drain = () => httpMock.match((r) => !r.url.endsWith("/baux")).forEach((r) => r.flush([]));
    drain();
    fixture.detectChanges();
    drain();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const req = () => httpMock.expectOne((r) => r.url.endsWith('/baux'));
  const h1 = (el: HTMLElement) => el.querySelector('h1')?.textContent?.trim();

  afterEach(() => localStorage.clear());

  it('should show the table with the count in the title when there are leases', async () => {
    const fixture = await setup();
    req().flush([bail(1), bail(2)]);
    await settle(fixture);
    const el: HTMLElement = fixture.nativeElement;

    expect(h1(el)).toBe('Baux : 2');
    expect(el.querySelectorAll('table')).toHaveLength(1);
    expect(el.querySelectorAll('tbody tr')).toHaveLength(2);
  });

  it('should show no table and the empty title when there is no lease', async () => {
    const fixture = await setup();
    req().flush([]);
    await settle(fixture);
    const el: HTMLElement = fixture.nativeElement;

    expect(h1(el)).toBe(VIDE);
    expect(el.querySelector('table')).toBeNull();
    expect(el.querySelector('th')).toBeNull();
    expect(el.querySelector('tr')).toBeNull();
    expect(el.textContent).not.toContain('Baux : 0');
    expect(el.textContent).not.toContain('Aucun bail pour l\'instant.');
    expect(el.textContent).toContain('Ajouter un bail');
  });

  it('should show the loading message, no table and a bare title while loading', async () => {
    const fixture = await setup();
    // Pas de whenStable() ici : la requête /baux reste volontairement en attente.
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    // Documente que hasValue() n'est pas fiable (vrai malgré defaultValue: []) pendant le chargement initial.
    expect(TestBed.inject(BailService).bauxResource.status()).toBe('loading');
    expect(el.textContent).toContain('Chargement...');
    expect(el.querySelector('table')).toBeNull();
    expect(h1(el)).toBe('Baux');
    expect(el.textContent).not.toContain('Aucun bail');
    req(); // consomme la requête en attente
  });

  it('should show an error message and no table when loading fails', async () => {
    const fixture = await setup();
    req().flush('boom', { status: 500, statusText: 'Server Error' });
    await settle(fixture);
    const el: HTMLElement = fixture.nativeElement;

    expect(el.textContent).toContain('Impossible d\'afficher les baux. Veuillez réessayer.');
    expect(el.querySelector('table')).toBeNull();
    expect(el.textContent).not.toContain('Aucun bail');
    expect(h1(el)).toBe('Baux');
  });

  it('should switch from empty to table when the list gets a lease after a reload', async () => {
    const fixture = await setup();
    req().flush([]);
    await settle(fixture);
    const el: HTMLElement = fixture.nativeElement;
    expect(h1(el)).toBe(VIDE);

    TestBed.inject(BailService).bauxResource.reload();
    fixture.detectChanges();
    req().flush([bail(1)]);
    await settle(fixture);

    expect(h1(el)).toBe('Baux : 1');
    expect(el.querySelectorAll('table')).toHaveLength(1);
  });

  it('should switch from table to empty when the last lease disappears after a reload', async () => {
    const fixture = await setup();
    req().flush([bail(1)]);
    await settle(fixture);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('table')).not.toBeNull();

    TestBed.inject(BailService).bauxResource.reload();
    fixture.detectChanges();
    req().flush([]);
    await settle(fixture);

    expect(el.querySelector('table')).toBeNull();
    expect(h1(el)).toBe(VIDE);
  });

  it('should only show the owners-only message to a tenant', async () => {
    const fixture = await setup('TENANT');
    // La ressource des baux est chargée même si la page est masquée.
    httpMock.match((r) => r.url.endsWith('/baux')).forEach((r) => r.flush([]));
    await settle(fixture);
    const el: HTMLElement = fixture.nativeElement;

    expect(el.textContent).toContain('Cette page est réservée aux propriétaires.');
    expect(el.querySelector('table')).toBeNull();
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { User } from '../../models/auth.model';
import { fakeJwt, validPayload } from '../../testing/jwt';
import { LayoutComponent } from './layout.component';

const USER: User = {
  id: 1,
  username: 'jdupont',
  role: 'TENANT',
  parkingRole: null,
  personalInfo: { nom: 'Dupont', prenom: 'Jean', email: 'j@d.fr' },
};

describe('LayoutComponent', () => {
  // Rôle TENANT : pas de cloche ni de WebSocket de notifications (réservées aux OWNER).
  async function render(user: User = USER) {
    localStorage.setItem('token', fakeJwt(validPayload({ role: user.role })));
    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    const httpMock = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(LayoutComponent);
    fixture.detectChanges();
    // L'URL de base dépend de l'environnement (dev : localhost:8081) : on ne compare que la fin.
    httpMock.expectOne((r) => r.url.endsWith('/auth/connected-user')).flush(user);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  const linkLabels = (el: HTMLElement) =>
    [...el.querySelectorAll('nav a')].map((a) => a.textContent?.trim());

  afterEach(() => localStorage.clear());

  it('should show the rental links for a tenant', async () => {
    const fixture = await render();
    const links = linkLabels(fixture.nativeElement);

    expect(links).toContain('Biens');
    expect(links).toContain('Locataires');
    expect(links).toContain('Baux');
    expect(links).not.toContain('Parking');
  });

  it('should show the initials and role label of the connected user', async () => {
    const fixture = await render();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.user-badge')?.textContent?.trim()).toBe('DJ');
    expect(el.querySelector('.topnav__role')?.textContent).toContain('Locataire');
  });

  it('should show the Parking entry when the user has a parking role', async () => {
    const fixture = await render({ ...USER, parkingRole: 'LOUEUR' });
    const el: HTMLElement = fixture.nativeElement;

    const parking = [...el.querySelectorAll('nav a')].find((a) => a.textContent?.trim() === 'Parking');
    expect(parking?.getAttribute('href')).toBe('/parking/loueur');
  });

  it('should log out and go to /login when clicking the logout button', async () => {
    const fixture = await render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    (fixture.nativeElement.querySelector('.topnav__logout') as HTMLButtonElement).click();

    expect(localStorage.getItem('token')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});

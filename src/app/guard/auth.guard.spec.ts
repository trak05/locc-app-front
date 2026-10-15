import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { fakeJwt, validPayload } from '../testing/jwt';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let router: Router;

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  it('should allow navigation with a valid token', () => {
    localStorage.setItem('token', fakeJwt(validPayload({ role: 'OWNER' })));

    expect(runGuard()).toBe(true);
  });

  it('should redirect to /login when there is no token', () => {
    const result = runGuard() as UrlTree;

    expect(router.serializeUrl(result)).toBe('/login');
  });

  it('should redirect to /login and drop an expired token', () => {
    const past = Math.floor(Date.now() / 1000) - 60;
    localStorage.setItem('token', fakeJwt({ sub: 'user', iat: past - 3600, exp: past }));

    const result = runGuard() as UrlTree;

    expect(router.serializeUrl(result)).toBe('/login');
    expect(localStorage.getItem('token')).toBeNull();
  });
});

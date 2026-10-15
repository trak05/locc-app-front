import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { fakeJwt, validPayload } from '../testing/jwt';
import { AuthService } from './auth.service';

describe('AuthService (JWT côté client)', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  describe('isAuthenticated', () => {
    it('should be false without token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should be true for a token that expires in the future', () => {
      localStorage.setItem('token', fakeJwt(validPayload()));

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should be false and clear the session for an expired token', () => {
      const past = Math.floor(Date.now() / 1000) - 10;
      localStorage.setItem('token', fakeJwt({ sub: 'u', iat: past - 100, exp: past }));

      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should be false for a malformed token', () => {
      localStorage.setItem('token', 'not-a-jwt');

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('payload decoding', () => {
    it('should expose the role and parking role from the token', () => {
      localStorage.setItem('token', fakeJwt(validPayload({ role: 'OWNER', parkingRole: 'LOUEUR' })));

      expect(service.getUserRole()).toBe('OWNER');
      expect(service.getParkingRole()).toBe('LOUEUR');
      expect(service.isOwner()).toBe(true);
      expect(service.hasGestionLocative()).toBe(true);
      expect(service.homeUrl()).toBe('/dashboard');
    });

    it('should return null roles when there is no token or it is malformed', () => {
      expect(service.getUserRole()).toBeNull();

      localStorage.setItem('token', 'garbage');
      expect(service.getUserRole()).toBeNull();
      expect(service.getParkingRole()).toBeNull();
    });

    it('should send a parking-only account to its parking space', () => {
      localStorage.setItem('token', fakeJwt(validPayload({ parkingRole: 'VOYAGEUR' })));

      expect(service.hasGestionLocative()).toBe(false);
      expect(service.homeUrl()).toBe('/parking/voyageur');
    });

    it('should send an anonymous user to /login', () => {
      expect(service.homeUrl()).toBe('/login');
    });
  });

  it('should remove the token and last login on logout', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('derniereConnexion', '"2026-01-01"');

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('derniereConnexion')).toBeNull();
    expect(service.derniereConnexion()).toBeUndefined();
  });
});

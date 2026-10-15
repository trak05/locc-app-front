import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    navigate = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate } },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should add the Bearer header when a token is stored', () => {
    localStorage.setItem('token', 'abc');

    http.get('/api/biens').subscribe();

    const req = httpMock.expectOne('/api/biens');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush([]);
  });

  it('should not add any header when there is no token', () => {
    http.get('/api/biens').subscribe();

    const req = httpMock.expectOne('/api/biens');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  // Une requête de login avec un vieux jeton en localStorage ne doit pas l'envoyer au back.
  it.each(['/api/auth/login', '/api/auth/parking/inscription'])(
    'should not add the header on the public endpoint %s',
    (url) => {
      localStorage.setItem('token', 'abc');

      http.post(url, {}).subscribe();

      const req = httpMock.expectOne(url);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    },
  );

  it('should log out and redirect to /login on 401', () => {
    localStorage.setItem('token', 'abc');
    const errorSpy = vi.fn();

    http.get('/api/biens').subscribe({ error: errorSpy });
    httpMock.expectOne('/api/biens').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('token')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
    // L'erreur est quand même propagée aux appelants.
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should keep the session on other errors such as 500', () => {
    localStorage.setItem('token', 'abc');

    http.get('/api/biens').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/biens').flush(null, { status: 500, statusText: 'Server Error' });

    expect(localStorage.getItem('token')).toBe('abc');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('should read the token through AuthService.getToken', () => {
    const authService = TestBed.inject(AuthService);
    const spy = vi.spyOn(authService, 'getToken').mockReturnValue('from-service');

    http.get('/api/biens').subscribe();

    const req = httpMock.expectOne('/api/biens');
    expect(req.request.headers.get('Authorization')).toBe('Bearer from-service');
    expect(spy).toHaveBeenCalled();
    req.flush([]);
  });
});

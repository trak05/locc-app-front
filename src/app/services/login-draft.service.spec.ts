import { TestBed } from '@angular/core/testing';
import { LoginDraftService } from './login-draft.service';

describe('LoginDraftService', () => {
  let service: LoginDraftService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginDraftService);
  });

  it('should return null when nothing was saved', () => {
    expect(service.consume()).toBeNull();
  });

  it('should return the saved draft once, then null', () => {
    service.save({ username: 'owner', password: 'secret' });

    expect(service.consume()).toEqual({ username: 'owner', password: 'secret' });
    expect(service.consume()).toBeNull();
  });

  it('should keep a copy of the draft', () => {
    const draft = { username: 'owner', password: 'secret' };
    service.save(draft);
    draft.username = 'changed';

    expect(service.consume()?.username).toBe('owner');
  });
});

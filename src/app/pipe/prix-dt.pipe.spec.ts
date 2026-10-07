import { PrixDtPipe } from './prix-dt.pipe';

describe('PrixDtPipe', () => {
  const pipe = new PrixDtPipe();

  it('should format millimes with 3 decimals', () => {
    expect(pipe.transform(12.5)).toBe('12,500 DT');
  });

  it('should group thousands with a narrow no-break space', () => {
    expect(pipe.transform(1250.5)).toBe('1 250,500 DT');
  });

  it('should return a dash when there is no value', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
  });
});

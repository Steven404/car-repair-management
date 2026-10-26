import { describe, expect, it } from 'vitest';
import { isValidVin, normalizeVin } from './vin';

describe('normalizeVin', () => {
  it('uppercases and drops spaces and dashes', () => {
    expect(normalizeVin(' wvw zzz-1kz 6w123456 ')).toBe('WVWZZZ1KZ6W123456');
  });

  it('turns Greek lookalike letters, as typed on a Greek keyboard, into Latin', () => {
    expect(normalizeVin('ΤΜΒJJ7ΝΕ5J0123456')).toBe('TMBJJ7NE5J0123456');
    expect(normalizeVin('τμβjj7νε5j0123456')).toBe('TMBJJ7NE5J0123456');
  });
});

describe('isValidVin', () => {
  it('accepts 17 letters and digits', () => {
    expect(isValidVin('WVWZZZ1KZ6W123456')).toBe(true);
  });

  it('refuses the wrong length', () => {
    expect(isValidVin('WVWZZZ1KZ6W12345')).toBe(false);
    expect(isValidVin('WVWZZZ1KZ6W1234567')).toBe(false);
  });

  it('refuses I, O and Q, which VINs never use', () => {
    expect(isValidVin('WVWZZZ1KZ6W12345O')).toBe(false);
    expect(isValidVin('WVWZZZ1KZ6W12345I')).toBe(false);
    expect(isValidVin('WVWZZZ1KZ6W12345Q')).toBe(false);
  });

  it('refuses Greek letters that have no Latin lookalike', () => {
    expect(isValidVin(normalizeVin('WVWZZZ1KZ6W12345Δ'))).toBe(false);
  });
});

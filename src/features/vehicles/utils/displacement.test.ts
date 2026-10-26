import { describe, expect, it } from 'vitest';
import { isValidDisplacement, normalizeDisplacement } from './displacement';

describe('normalizeDisplacement', () => {
  it('takes a comma or a dot, and adds .0 to a whole number', () => {
    expect(normalizeDisplacement('1,6')).toBe('1.6');
    expect(normalizeDisplacement(' 1.6 ')).toBe('1.6');
    expect(normalizeDisplacement('2')).toBe('2.0');
  });
});

describe('isValidDisplacement', () => {
  it('accepts 0.5 to 9.9 litres with one decimal', () => {
    for (const value of ['0.5', '1.0', '1.6', '9.9']) expect(isValidDisplacement(value)).toBe(true);
  });

  it('refuses cc, too small, too many decimals or not a number', () => {
    for (const value of ['1598', '0.4', '1.65', '10.0', 'TDI', '']) expect(isValidDisplacement(value)).toBe(false);
  });
});

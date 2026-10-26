import { describe, expect, it } from 'vitest';
import { formatPlate, normalizePlate, plateKey } from './plate';

describe('plateKey', () => {
  it('gives the same key however a Greek plate is typed', () => {
    const typings = ['ΙΚΥ 4521', 'ΙΚΥ4521', 'ΙΚΥ-4521', 'ικυ 4521', 'IKY 4521', 'iky-4521', ' Ικύ 4521 '];
    expect(new Set(typings.map(plateKey))).toEqual(new Set(['ΙΚΥ4521']));
  });

  it('leaves letters with no Greek lookalike alone', () => {
    expect(plateKey('AB 123 CD')).toBe('ΑΒ123CD');
  });
});

describe('formatPlate', () => {
  it('shows a standard Greek plate as "ΑΑΑ 0000", in Greek letters', () => {
    expect(formatPlate('iky4521')).toBe('ΙΚΥ 4521');
    expect(formatPlate('ΙΚΥ-4521')).toBe('ΙΚΥ 4521');
  });

  it('formats a motorbike plate the same way', () => {
    expect(formatPlate('ken 123')).toBe('ΚΕΝ 123');
  });

  it('keeps anything else as typed, uppercased', () => {
    expect(formatPlate('ab  123 cd')).toBe('AB 123 CD');
  });
});

describe('normalizePlate', () => {
  it('gives both forms', () => {
    expect(normalizePlate('iky 4521')).toEqual({ plate: 'ΙΚΥ 4521', plateKey: 'ΙΚΥ4521' });
  });
});

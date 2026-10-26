import { describe, expect, it } from 'vitest';
import { formatMileage, MAX_MILEAGE_KM, parseMileage } from './mileage';

describe('parseMileage', () => {
  it('takes the number with or without thousands separators', () => {
    for (const typed of ['186400', '186.400', '186 400', '186,400', ' 186400 '])
      expect(parseMileage(typed)).toBe(186400);
  });

  it('is null when left empty, since it is optional', () => {
    expect(parseMileage('')).toBeNull();
    expect(parseMileage('   ')).toBeNull();
  });

  it('refuses anything that isn’t a whole number of kilometres, or is too big', () => {
    for (const typed of ['186k', '-5', '12a', `${MAX_MILEAGE_KM + 1}`]) expect(parseMileage(typed)).toBeUndefined();
    expect(parseMileage(`${MAX_MILEAGE_KM}`)).toBe(MAX_MILEAGE_KM);
  });
});

describe('formatMileage', () => {
  it('groups the Greek way', () => {
    expect(formatMileage(186400)).toBe('186.400 km');
    expect(formatMileage(0)).toBe('0 km');
  });
});

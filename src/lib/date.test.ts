import { describe, expect, it } from 'vitest';
import { dateParts, formatDate, todayInAthens } from './date';

describe('todayInAthens', () => {
  it('is already tomorrow after midnight in Athens, while UTC is still on today', () => {
    // 22:30 UTC on 26 October is 00:30 on the 27th in Athens (UTC+2 in winter)
    expect(todayInAthens(new Date('2026-10-26T22:30:00Z'))).toBe('2026-10-27');
    // In summer Athens is UTC+3
    expect(todayInAthens(new Date('2026-07-01T21:30:00Z'))).toBe('2026-07-02');
  });

  it('matches UTC in the middle of the day', () => {
    expect(todayInAthens(new Date('2026-10-26T12:00:00Z'))).toBe('2026-10-26');
  });
});

describe('dateParts and formatDate', () => {
  it('split a date for the repair card, with the Greek short month', () => {
    expect(dateParts('2026-10-14')).toEqual({ day: '14', month: 'Οκτ', year: '2026' });
    expect(dateParts('2026-05-06').month).toBe('Μαΐ');
  });

  it('never shift the day, whatever the timezone', () => {
    expect(formatDate('2026-01-01')).toBe('01/01/2026');
    expect(formatDate('2026-12-31')).toBe('31/12/2026');
  });
});

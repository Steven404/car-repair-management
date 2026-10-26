import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fieldErrors } from '@/lib/forms';
import { repairSchema, type RepairField } from './validation';

const NOTES = JSON.stringify({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Αλλαγή λαδιών' }] }],
});
const VALID: Record<RepairField, string> = { performedOn: '2026-10-14', mileageKm: '186.400', notes: NOTES };

const errorsFor = (overrides: Partial<Record<RepairField, string>>) => {
  const result = repairSchema.safeParse({ ...VALID, ...overrides });
  return result.success ? {} : fieldErrors(result.error);
};

describe('repairSchema', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-26T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores the mileage as a number, and none when left empty', () => {
    expect(repairSchema.parse(VALID).mileageKm).toBe(186400);
    expect(repairSchema.parse({ ...VALID, mileageKm: '' }).mileageKm).toBeNull();
  });

  it('needs a real date, not in the future', () => {
    expect(errorsFor({ performedOn: '' }).performedOn).toBe('Επιλέξτε ημερομηνία.');
    expect(errorsFor({ performedOn: '2026-02-30' }).performedOn).toBe('Επιλέξτε ημερομηνία.');
    expect(errorsFor({ performedOn: '2026-10-27' }).performedOn).toMatch(/μελλοντική/);
    expect(errorsFor({ performedOn: '2026-10-26' })).toEqual({});
  });

  it('accepts today in Athens even while it is still yesterday in UTC', () => {
    vi.setSystemTime(new Date('2026-10-26T22:30:00Z'));
    expect(errorsFor({ performedOn: '2026-10-27' })).toEqual({});
  });

  it('wants something written in the notes', () => {
    const empty = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] });
    expect(errorsFor({ notes: empty }).notes).toBe('Γράψτε τι έγινε.');
    expect(errorsFor({ notes: 'nonsense' }).notes).toBe('Γράψτε τι έγινε.');
  });

  it('explains a mileage it can’t read', () => {
    expect(errorsFor({ mileageKm: '186k' }).mileageKm).toMatch(/χιλιόμετρα/);
  });
});

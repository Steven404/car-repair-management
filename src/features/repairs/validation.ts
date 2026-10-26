import { z } from 'zod';
import { todayInAthens } from '@/lib/date';
import { MAX_MILEAGE_KM, parseMileage } from './utils/mileage';
import { notesText, parseNotes } from './utils/notes';

/** The repair form, checked on the server. Outputs the values as they are stored. */
export const repairSchema = z.object({
  performedOn: z.iso
    .date('Επιλέξτε ημερομηνία.')
    .refine((date) => date >= '1950-01-01', 'Επιλέξτε ημερομηνία.')
    .refine((date) => date <= todayInAthens(), 'Η ημερομηνία δεν μπορεί να είναι μελλοντική.'),
  mileageKm: z.string().transform((input, ctx) => {
    const km = parseMileage(input);
    if (km !== undefined) return km;
    ctx.addIssue({
      code: 'custom',
      message: `Μόνο τα χιλιόμετρα, έως ${MAX_MILEAGE_KM.toLocaleString('el-GR')}, π.χ. 124500.`,
    });
    return z.NEVER;
  }),
  notes: z.string().transform((json, ctx) => {
    const doc = parseNotes(json);
    if (doc && notesText(doc).trim()) return doc;
    ctx.addIssue({ code: 'custom', message: 'Γράψτε τι έγινε.' });
    return z.NEVER;
  }),
});

export type RepairInput = z.output<typeof repairSchema>;
export type RepairField = keyof z.input<typeof repairSchema>;

export function repairFormValues(formData: FormData): Record<RepairField, string> {
  const value = (name: RepairField) => String(formData.get(name) ?? '');
  return { performedOn: value('performedOn'), mileageKm: value('mileageKm'), notes: value('notes') };
}

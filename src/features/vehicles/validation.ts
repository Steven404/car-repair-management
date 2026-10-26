import { z } from 'zod';
import { FUELS } from '@/lib/db/schema';
import { isValidDisplacement, normalizeDisplacement } from './utils/displacement';
import { formatPlate, plateKey } from './utils/plate';
import { isValidVin, normalizeVin, VIN_LENGTH } from './utils/vin';

const required = (message: string, max: number) => z.string().trim().min(1, message).max(max, `Έως ${max} χαρακτήρες.`);

/** The vehicle form, checked on the server. Outputs the values in the form they are stored. */
export const vehicleSchema = z
  .object({
    vin: z
      .string()
      .transform(normalizeVin)
      .pipe(
        z
          .string()
          .min(1, 'Συμπληρώστε τον αριθμό πλαισίου.')
          .refine((vin) => vin.length === VIN_LENGTH, {
            error: (issue) => `Ο αριθμός πλαισίου έχει 17 χαρακτήρες· εδώ είναι ${(issue.input as string).length}.`,
          })
          .refine(isValidVin, 'Μόνο λατινικά γράμματα και ψηφία, χωρίς I, O και Q.')
      ),
    plate: required('Συμπληρώστε την πινακίδα.', 15),
    brand: required('Συμπληρώστε τη μάρκα.', 40),
    model: required('Συμπληρώστε το μοντέλο.', 40),
    displacement: z
      .string()
      .transform(normalizeDisplacement)
      .pipe(
        z
          .string()
          .min(1, 'Συμπληρώστε τον κυβισμό.')
          .refine(isValidDisplacement, 'Σε λίτρα, από 0.5 έως 9.9, π.χ. 1.6.')
      ),
    engineName: required('Συμπληρώστε την ονομασία του κινητήρα.', 30),
    fuel: z.enum(FUELS, 'Επιλέξτε καύσιμο.'),
    ownerName: required('Συμπληρώστε τον ιδιοκτήτη.', 80),
  })
  .transform(({ plate, ...vehicle }) => ({ ...vehicle, plate: formatPlate(plate), plateKey: plateKey(plate) }));

export type VehicleInput = z.output<typeof vehicleSchema>;

/** The form's fields, as their input names */
export type VehicleField = keyof z.input<typeof vehicleSchema>;

/** Reads the vehicle form's fields out of a submission. */
export function vehicleFormValues(formData: FormData): Record<VehicleField, string> {
  const value = (name: VehicleField) => String(formData.get(name) ?? '');
  return {
    vin: value('vin'),
    plate: value('plate'),
    brand: value('brand'),
    model: value('model'),
    displacement: value('displacement'),
    engineName: value('engineName'),
    fuel: value('fuel'),
    ownerName: value('ownerName'),
  };
}

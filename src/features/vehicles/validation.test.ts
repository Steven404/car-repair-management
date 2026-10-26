import { describe, expect, it } from 'vitest';
import { fieldErrors } from '@/lib/forms';
import { GOLF_FORM } from '@/test/vehicles';
import { vehicleSchema, type VehicleField } from './validation';

const errorsFor = (overrides: Partial<Record<VehicleField, string>>) => {
  const result = vehicleSchema.safeParse({ ...GOLF_FORM, ...overrides });
  return result.success ? {} : fieldErrors(result.error);
};

describe('vehicleSchema', () => {
  it('stores the values tidied up', () => {
    const vehicle = vehicleSchema.parse({
      ...GOLF_FORM,
      vin: ' wvwzzz1kz6w123456 ',
      plate: 'iky-4521',
      displacement: '1,6',
      ownerName: '  Γιώργος Παπαδόπουλος ',
    });
    expect(vehicle).toMatchObject({
      vin: 'WVWZZZ1KZ6W123456',
      plate: 'ΙΚΥ 4521',
      plateKey: 'ΙΚΥ4521',
      displacement: '1.6',
      ownerName: 'Γιώργος Παπαδόπουλος',
    });
  });

  it('asks for every field', () => {
    const empty = Object.fromEntries(Object.keys(GOLF_FORM).map((field) => [field, ''])) as Record<
      VehicleField,
      string
    >;
    expect(Object.keys(errorsFor(empty)).sort()).toEqual(Object.keys(GOLF_FORM).sort());
  });

  it('says how long a VIN of the wrong length is', () => {
    expect(errorsFor({ vin: 'WVWZZZ1KZ6W1234' }).vin).toBe('Ο αριθμός πλαισίου έχει 17 χαρακτήρες· εδώ είναι 15.');
  });

  it('refuses I, O and Q in a VIN', () => {
    expect(errorsFor({ vin: 'WVWZZZ1KZ6W12345O' }).vin).toMatch(/χωρίς I, O και Q/);
  });

  it('wants the displacement in litres', () => {
    expect(errorsFor({ displacement: '1598' }).displacement).toMatch(/λίτρα/);
  });

  it('only knows diesel and petrol', () => {
    expect(errorsFor({ fuel: 'electric' }).fuel).toBe('Επιλέξτε καύσιμο.');
    expect(errorsFor({ fuel: '' }).fuel).toBe('Επιλέξτε καύσιμο.');
  });
});

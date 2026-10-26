import { vehicleSchema, type VehicleField, type VehicleInput } from '@/features/vehicles/validation';

/** The design's Golf, as the form submits it */
export const GOLF_FORM: Record<VehicleField, string> = {
  vin: 'WVWZZZ1KZ6W123456',
  plate: 'ΙΚΥ 4521',
  brand: 'Volkswagen',
  model: 'Golf',
  displacement: '1.6',
  engineName: 'TDI',
  fuel: 'diesel',
  ownerName: 'Γιώργος Παπαδόπουλος',
};

/** A valid vehicle, through the same validation as the form. */
export function vehicleInput(overrides: Partial<Record<VehicleField, string>> = {}): VehicleInput {
  return vehicleSchema.parse({ ...GOLF_FORM, ...overrides });
}

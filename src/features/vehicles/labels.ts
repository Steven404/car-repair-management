import type { Fuel } from '@/lib/db/schema';

export const FUEL_LABELS: Record<Fuel, string> = {
  diesel: 'Πετρέλαιο',
  petrol: 'Βενζίνη',
};

export const FUEL_OPTIONS = [
  { value: 'diesel', label: FUEL_LABELS.diesel },
  { value: 'petrol', label: FUEL_LABELS.petrol },
] as const;

/** Suggestions for the brand field; any other brand can be typed */
export const COMMON_BRANDS = [
  'Audi',
  'BMW',
  'Citroën',
  'Dacia',
  'Fiat',
  'Ford',
  'Honda',
  'Hyundai',
  'Kia',
  'Mazda',
  'Mercedes-Benz',
  'Nissan',
  'Opel',
  'Peugeot',
  'Renault',
  'Seat',
  'Skoda',
  'Suzuki',
  'Toyota',
  'Volkswagen',
];

/** "1.6 TDI" */
export function engineLabel(vehicle: { displacement: string; engineName: string }): string {
  return [vehicle.displacement, vehicle.engineName].filter(Boolean).join(' ');
}

/** "Volkswagen Golf · ΙΚΥ 4521", for titles, breadcrumbs and dialogs */
export function vehicleTitle(vehicle: { brand: string; model: string; plate: string }): string {
  return `${vehicle.brand} ${vehicle.model} · ${vehicle.plate}`;
}

export function repairCountLabel(count: number): string {
  if (count === 0) return 'Καμία επισκευή ακόμα';
  return count === 1 ? '1 επισκευή' : `${count} επισκευές`;
}

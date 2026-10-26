export const MAX_MILEAGE_KM = 2_000_000;

/**
 * Kilometres as typed: "186.400", "186 400" and "186400" all mean 186400.
 * Null when left empty (it's optional); undefined when it isn't a mileage.
 */
export function parseMileage(input: string): number | null | undefined {
  const digits = input.replace(/[\s.,]/g, '');
  if (!digits) return null;
  if (!/^\d+$/.test(digits)) return undefined;
  const km = Number(digits);
  return km <= MAX_MILEAGE_KM ? km : undefined;
}

/** "186.400 km", grouped the Greek way */
export function formatMileage(km: number): string {
  return `${new Intl.NumberFormat('el-GR').format(km)} km`;
}

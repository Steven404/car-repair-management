/** Litres as typed ("1,6", " 1.6 ", "2") in the stored form ("1.6", "2.0"); unchanged if it isn't a number. */
export function normalizeDisplacement(input: string): string {
  const value = input.trim().replace(',', '.');
  return /^\d$/.test(value) ? `${value}.0` : value;
}

/** Expects normalizeDisplacement's output: from 0.5 to 9.9 litres, one decimal. */
export function isValidDisplacement(value: string): boolean {
  return /^\d\.\d$/.test(value) && Number(value) >= 0.5;
}

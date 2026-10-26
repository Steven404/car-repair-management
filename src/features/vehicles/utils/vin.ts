import { greekToLatin, stripAccents } from '@/lib/text';

export const VIN_LENGTH = 17;

/** 17 characters, Latin letters and digits, never I, O or Q (they read as 1 and 0) */
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

/** Uppercase, no spaces or dashes, Greek lookalike letters turned Latin. */
export function normalizeVin(input: string): string {
  return [...stripAccents(input).toUpperCase().replace(/[\s-]/g, '')]
    .map((char) => greekToLatin.get(char) ?? char)
    .join('');
}

/** Expects a VIN that has been through normalizeVin. */
export function isValidVin(vin: string): boolean {
  return VIN_PATTERN.test(vin);
}

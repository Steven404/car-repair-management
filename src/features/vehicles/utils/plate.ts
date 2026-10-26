import { latinToGreek, stripAccents } from '@/lib/text';

/** Greek plates: three letters, then four digits (cars) or three (motorbikes) */
const GREEK_PLATE = /^(\p{Script=Greek}{3})(\d{3,4})$/u;

/**
 * The form plates are compared in: uppercase, no spaces or dashes, Latin
 * lookalike letters turned Greek. "iky-4521" and "ΙΚΥ 4521" give the same key.
 */
export function plateKey(input: string): string {
  return [...stripAccents(input).toUpperCase().replace(/[\s-]/g, '')]
    .map((char) => latinToGreek.get(char) ?? char)
    .join('');
}

/**
 * The form plates are shown in. A standard Greek plate comes out as "ΙΚΥ 4521"
 * however it was typed; anything else (a foreign plate, say) stays as typed,
 * uppercased.
 */
export function formatPlate(input: string): string {
  const match = GREEK_PLATE.exec(plateKey(input));
  if (match) return `${match[1]} ${match[2]}`;
  return stripAccents(input).toUpperCase().trim().replace(/\s+/g, ' ');
}

export function normalizePlate(input: string): { plate: string; plateKey: string } {
  return { plate: formatPlate(input), plateKey: plateKey(input) };
}

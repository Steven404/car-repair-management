/**
 * Greek capitals that look exactly like a Latin capital. Greek plates use only
 * these letters, so a plate typed on a Latin keyboard looks right but is a
 * different string; VINs are Latin, but may be typed on a Greek keyboard.
 */
const LOOKALIKES = [
  ['Α', 'A'],
  ['Β', 'B'],
  ['Ε', 'E'],
  ['Ζ', 'Z'],
  ['Η', 'H'],
  ['Ι', 'I'],
  ['Κ', 'K'],
  ['Μ', 'M'],
  ['Ν', 'N'],
  ['Ο', 'O'],
  ['Ρ', 'P'],
  ['Τ', 'T'],
  ['Υ', 'Y'],
  ['Χ', 'X'],
] as const;

export const latinToGreek: ReadonlyMap<string, string> = new Map(LOOKALIKES.map(([greek, latin]) => [latin, greek]));
export const greekToLatin: ReadonlyMap<string, string> = new Map(LOOKALIKES);

/** "Γιώργος" → "Γιωργος": decomposes accented letters and drops the accents. */
export function stripAccents(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '');
}

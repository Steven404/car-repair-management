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

// Lowercase Greek lookalikes folded to Latin. Applied to both sides of a
// search, so it only has to be consistent: "iky" finds the plate "ΙΚΥ", and a
// Greek name still finds itself.
const LOWER_GREEK_TO_LATIN: ReadonlyMap<string, string> = new Map(
  LOOKALIKES.map(([greek, latin]) => [greek.toLowerCase(), latin.toLowerCase()])
);

function foldChar(char: string): string {
  return [...stripAccents(char).toLowerCase()]
    .map((c) => (c === 'ς' ? 'σ' : (LOWER_GREEK_TO_LATIN.get(c) ?? c)))
    .join('');
}

/**
 * Text folded for searching, with the way back: `starts[i]` and `ends[i]` are
 * where folded character i came from in the original, so a match found in
 * `text` can be highlighted in the original even though accents were dropped
 * or characters skipped.
 */
export interface FoldedText {
  text: string;
  starts: number[];
  ends: number[];
}

/**
 * Folds text so that case, accents, final sigma and Greek/Latin lookalike
 * letters don't matter: "Γιώργος" and "γιωργοσ" fold the same, as do "ΙΚΥ"
 * and "iky". Characters matching `skip` (tested one at a time) are left out.
 */
export function fold(original: string, skip?: RegExp): FoldedText {
  const folded: FoldedText = { text: '', starts: [], ends: [] };
  let index = 0;
  for (const char of original) {
    if (!skip?.test(char)) {
      for (const out of foldChar(char)) {
        folded.text += out;
        folded.starts.push(index);
        folded.ends.push(index + char.length);
      }
    }
    index += char.length;
  }
  return folded;
}

/** Where a range of folded characters `[start, end)` came from in the original. */
export function originalRange(folded: FoldedText, start: number, end: number): [number, number] {
  return [folded.starts[start], folded.ends[end - 1]];
}
